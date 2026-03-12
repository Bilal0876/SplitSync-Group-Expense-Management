import prisma from '../config/prisma.ts';
import * as SettlementModel from '../models/settlementModel.ts';
import * as GroupModel from '../models/groupModel.ts';
import * as ExpenseModel from '../models/expenseModel.ts';
import { calculateBalancesFromData } from '../utils/balanceCalculator.ts';
import asyncHandler from '../utils/asyncHandler.ts';

export const getBalances = asyncHandler(async (req: any, res: any) => {
    const { groupId } = req.params;
    const gId = Number(groupId);

    // 1. Fetch data
    const groupData = await GroupModel.getGroupById(gId);
    if (!groupData) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const expenses = await ExpenseModel.getExpensesByGroup(gId);

    const expenseIds = expenses.map(e => e.id);
    let splits: any[] = [];
    if (expenseIds.length > 0) {
        splits = await prisma.expense_splits.findMany({
            where: { expense_id: { in: expenseIds } }
        });
    }

    const settlements = await SettlementModel.getSettlements(gId);

    // Calculate balances
    const transactions = calculateBalancesFromData(expenses, splits, groupData.members, settlements);

    res.status(200).json({
        transactions,
        settlements
    });
});

export const recordSettlement = asyncHandler(async (req: any, res: any) => {
    const { groupId } = req.params;
    const { senderId, receiverId, amount } = req.body;

    if (!senderId || !receiverId || !amount) {
        return res.status(400).json({ error: 'Missing required fields: senderId, receiverId, amount' });
    }

    const settlement = await SettlementModel.recordSettlement(
        Number(groupId),
        Number(senderId),
        Number(receiverId),
        Number(amount)
    );

    res.status(201).json({
        message: 'Settlement recorded successfully',
        settlement
    });
});
