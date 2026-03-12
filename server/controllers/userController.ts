import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.ts';
import prisma from '../config/prisma.ts';
import * as GroupModel from '../models/groupModel.ts';
import * as SettlementModel from '../models/settlementModel.ts';
import * as ExpenseModel from '../models/expenseModel.ts';
import { calculateBalancesFromData } from '../utils/balanceCalculator.ts';
import asyncHandler from '../utils/asyncHandler.ts';

export const getDashboardData = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // 1. Get user's groups
    const groups = await GroupModel.getGroupsByUser(userId);
    const groupIds = groups.map(g => g.id);

    if (groupIds.length === 0) {
        return res.status(200).json({
            groupsCount: 0,
            netBalance: 0,
            recentActivity: [],
            summarizedBalances: []
        });
    }

    // 2. Fetch data for Net Balance calculation
    const [totalPaid, totalOwed, totalSent, totalReceived] = await Promise.all([
        prisma.expenses.aggregate({
            _sum: { amount: true },
            where: { payer_id: userId }
        }),
        prisma.expense_splits.aggregate({
            _sum: { share: true },
            where: { user_id: userId }
        }),
        prisma.settlements.aggregate({
            _sum: { amount: true },
            where: { sender_id: userId }
        }),
        prisma.settlements.aggregate({
            _sum: { amount: true },
            where: { receiver_id: userId }
        })
    ]);

    const paid = Number(totalPaid._sum.amount || 0);
    const owed = Number(totalOwed._sum.share || 0);
    const sent = Number(totalSent._sum.amount || 0);
    const received = Number(totalReceived._sum.amount || 0);

    const netBalance = paid - owed + sent - received;

    // 3. Fetch Recent Activity
    const [latestExpenses, latestSettlements] = await Promise.all([
        prisma.expenses.findMany({
            where: { group_id: { in: groupIds } },
            take: 5,
            orderBy: { created_at: 'desc' },
            include: {
                users: { select: { username: true } },
                groups: { select: { name: true } }
            }
        }),
        prisma.settlements.findMany({
            where: { group_id: { in: groupIds } },
            take: 5,
            orderBy: { settled_at: 'desc' },
            include: {
                users_settlements_sender_idTousers: { select: { username: true } },
                groups: { select: { name: true } }
            }
        })
    ]);

    const recentActivity = [
        ...latestExpenses.map(e => ({
            type: 'expense',
            title: e.description,
            amount: Number(e.amount),
            created_at: e.created_at,
            paid_by_username: e.users?.username,
            paid_by_id: e.payer_id,
            group_name: e.groups?.name
        })),
        ...latestSettlements.map(s => ({
            type: 'settlement',
            title: 'Settlement',
            amount: Number(s.amount),
            created_at: s.settled_at,
            paid_by_username: s.users_settlements_sender_idTousers?.username,
            paid_by_id: s.sender_id,
            group_name: s.groups?.name
        }))
    ].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()).slice(0, 5);

    // 4. Summarized Balances
    const allTransactions: any[] = [];

    for (const group of groups) {
        const expenses = await ExpenseModel.getExpensesByGroup(group.id);
        const expenseIds = expenses.map((e: any) => e.id);
        let splits: any[] = [];
        if (expenseIds.length > 0) {
            splits = await prisma.expense_splits.findMany({
                where: { expense_id: { in: expenseIds } }
            });
        }
        const settlements = await SettlementModel.getSettlements(group.id);
        const groupDetails = await GroupModel.getGroupById(group.id);

        if (groupDetails && groupDetails.members) {
            const groupTransactions = calculateBalancesFromData(expenses, splits, groupDetails.members, settlements);
            allTransactions.push(...groupTransactions);
        }
    }

    const finalBalancesMap: Record<number, number> = {};
    allTransactions.forEach(tx => {
        if (tx.from.userId === userId) {
            finalBalancesMap[tx.to.userId] = (finalBalancesMap[tx.to.userId] || 0) - tx.amount;
        } else if (tx.to.userId === userId) {
            finalBalancesMap[tx.from.userId] = (finalBalancesMap[tx.from.userId] || 0) + tx.amount;
        }
    });

    const finalizedBalances = [];
    for (const [otherIdStr, net] of Object.entries(finalBalancesMap)) {
        const otherId = parseInt(otherIdStr);
        const amount = Math.abs(net);
        if (amount < 0.01) continue;

        const tx = allTransactions.find(t => t.from.userId === otherId || t.to.userId === otherId);
        const username = tx.from.userId === otherId ? tx.from.username : tx.to.username;

        finalizedBalances.push({
            userId: otherId,
            username,
            amount: Math.round(amount * 100) / 100,
            dir: net > 0 ? 'owed_to_me' : 'i_owe'
        });
    }

    res.status(200).json({
        groupsCount: groups.length,
        netBalance: Math.round(netBalance * 100) / 100,
        recentActivity,
        summarizedBalances: finalizedBalances.sort((a, b) => b.amount - a.amount)
    });
});
