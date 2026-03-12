import prisma from '../config/prisma.ts';
import * as ExpenseModel from '../models/expenseModel.ts';
import * as GroupModel from '../models/groupModel.ts';
import asyncHandler from '../utils/asyncHandler.ts';

/**
 * Creates an expense and its corresponding splits within a single transaction.
 */
export const createExpense = asyncHandler(async (req: any, res: any) => {
     const groupId = req.params.groupId ?? req.body.groupId;
     const payerId = req.user?.id ?? req.body.payerId;
     const description = req.body.description ?? req.body.title;
     const { amount } = req.body;

     if (!groupId || !payerId || !description || !amount) {
          return res.status(400).json({ error: "Missing required fields" });
     }

     const gId = Number(groupId);
     const pId = Number(payerId);

     const isMember = await GroupModel.isMember(gId, pId);
     if (!isMember) {
          return res.status(403).json({ error: "Unauthorized: Payer is not a group member" });
     }

     const groupData = await GroupModel.getGroupById(gId);
     if (!groupData) {
          return res.status(404).json({ error: "Group not found" });
     }
     const members = groupData.members.map((m: any) => m.id);

     const result = await prisma.$transaction(async (tx) => {
          const newExpense = await tx.expenses.create({
               data: {
                    group_id: gId,
                    payer_id: pId,
                    description: description,
                    amount: amount,
               }
          });

          const count = members.length;
          const baseShare = Math.floor((amount / count) * 100) / 100;
          const remainder = Math.round((amount - (baseShare * count)) * 100) / 100;

          const splitPromises = members.map((memberId: number, i: number) => {
               const finalShare = (i === 0) ? (baseShare + remainder) : baseShare;
               return tx.expense_splits.create({
                    data: {
                         expense_id: newExpense.id,
                         user_id: memberId,
                         share: finalShare
                    }
               });
          });

          await Promise.all(splitPromises);

          return { newExpense, count };
     });

     res.status(201).json({
          id: result.newExpense.id,
          title: result.newExpense.description,
          amount: result.newExpense.amount,
          paid_by: result.newExpense.payer_id,
          paid_by_username: req.user?.username ?? 'You',
          created_at: result.newExpense.created_at,
          split_count: result.count,
     });
});

export const getExpensesByGroup = asyncHandler(async (req: any, res: any) => {
     const { groupId } = req.params;
     const userId = req.user.id;
     const gId = Number(groupId);

     const isMember = await GroupModel.isMember(gId, userId);
     if (!isMember) {
          return res.status(403).json({ error: "Access denied: You are not a member of this group" });
     }

     const expenses = await prisma.expenses.findMany({
          where: { group_id: gId },
          include: {
               users: { select: { username: true } },
               _count: { select: { expense_splits: true } }
          },
          orderBy: { created_at: 'desc' }
     });

     const formattedExpenses = expenses.map(e => ({
          id: e.id,
          title: e.description,
          amount: e.amount,
          paid_by: e.payer_id,
          paid_by_username: e.users?.username,
          created_at: e.created_at,
          split_count: e._count.expense_splits
     }));

     res.status(200).json(formattedExpenses);
});

export const updateExpense = asyncHandler(async (req: any, res: any) => {
     const { id } = req.params;
     const { description, amount } = req.body;
     const userId = req.user.id;
     const expenseId = Number(id);

     const expense = await prisma.expenses.findUnique({
          where: { id: expenseId },
          select: { payer_id: true, group_id: true }
     });

     if (!expense) return res.status(404).json({ error: "Not found" });

     if (expense.payer_id !== userId) {
          return res.status(403).json({ error: "Forbidden: You are not the payer" });
     }

     const members = await prisma.group_members.findMany({
          where: { group_id: expense.group_id! },
          select: { user_id: true }
     });
     const memberIds = members.map(m => m.user_id);

     const updated = await ExpenseModel.updateExpense(expenseId, description, amount, memberIds);

     res.status(200).json(updated);
});

export const deleteExpense = asyncHandler(async (req: any, res: any) => {
     const { id } = req.params;
     const userId = req.user.id;
     const expenseId = Number(id);

     const expense = await prisma.expenses.findUnique({
          where: { id: expenseId },
          select: { payer_id: true }
     });

     if (!expense) {
          return res.status(404).json({ error: "Expense not found" });
     }

     if (expense.payer_id !== userId) {
          return res.status(403).json({ error: "Unauthorized: Only the payer can delete this expense" });
     }

     const deleted = await ExpenseModel.deleteExpense(expenseId);

     if (!deleted) {
          return res.status(400).json({ error: "Delete failed" });
     }

     res.status(200).json({ message: "Expense and associated splits deleted successfully" });
});

