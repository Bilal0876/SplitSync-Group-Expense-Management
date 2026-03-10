import * as SettlementModel from '../models/settlementModel';
import * as GroupModel from '../models/groupModel';
import * as ExpenseModel from '../models/expenseModel';
import { calculateBalancesFromData } from '../utils/balanceCalculator';
import db from '../config/db.ts';

export const getBalances = async (req: any, res: any) => {
    try {
        const { groupId } = req.params;
        const parsedGroupId = parseInt(groupId);

        // 1. Fetch data
        const members = await GroupModel.getGroupById(parsedGroupId);
        if (!members) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const expenses = await ExpenseModel.getExpensesByGroup(parsedGroupId);
        
        // Fetch splits for these expenses
        const expenseIds = expenses.map(e => e.id);
        let splits: any[] = [];
        if (expenseIds.length > 0) {
            const splitRes = await db.query(
                'SELECT * FROM expense_splits WHERE expense_id = ANY($1)',
                [expenseIds]
            );
            splits = splitRes.rows;
        }

        const settlements = await SettlementModel.getSettlements(parsedGroupId);

        // 2. Calculate balances
        // getGroupById returns { id, name, members: [...] }
        const transactions = calculateBalancesFromData(expenses, splits, members.members, settlements);

        res.json({
            transactions,
            settlements
        });
    } catch (error: any) {
        console.error('Error fetching balances:', error);
        res.status(500).json({ error: error.message });
    }
};

export const recordSettlement = async (req: any, res: any) => {
    try {
        const { groupId } = req.params;
        const { senderId, receiverId, amount } = req.body;

        if (!senderId || !receiverId || !amount) {
            return res.status(400).json({ error: 'Missing required fields: senderId, receiverId, amount' });
        }

        const settlement = await SettlementModel.recordSettlement(
            parseInt(groupId),
            parseInt(senderId),
            parseInt(receiverId),
            parseFloat(amount)
        );

        // Optional: return updated balances immediately
        // For now, just return the recorded settlement
        res.status(201).json({
            message: 'Settlement recorded successfully',
            settlement
        });
    } catch (error: any) {
        console.error('Error recording settlement:', error);
        res.status(500).json({ error: error.message });
    }
};
