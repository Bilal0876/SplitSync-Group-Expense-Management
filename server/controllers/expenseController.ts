import db from '../config/db.ts';
import * as ExpenseModel from '../models/expenseModel';
import * as GroupModel from '../models/groupModel';

/**
 * Creates an expense and its corresponding splits within a single transaction.
 */
export const createExpense = async (req, res) => {
     const { groupId, payerId, description, amount } = req.body;
     const client = await db.pool.connect();

     try {
          // 1. Authorization: Verify user is a member of the group
          const isMember = await GroupModel.isMember(groupId, payerId);
          if (!isMember) {
               return res.status(403).json({ error: "Unauthorized: Payer is not a group member" });
          }

          // 2. Fetch all members to calculate splits
          const groupData = await GroupModel.getGroupById(groupId);
          const members = groupData[0].members.map(m => m.id);

          await client.query('BEGIN');

          // 3. Insert Expense (Using the transaction client)
          const expenseRes = await client.query(
               `INSERT INTO expenses (group_id, payer_id, description, amount) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
               [groupId, payerId, description, amount]
          );
          const newExpense = expenseRes.rows[0];

          // 4. Calculate and Insert Splits (Rounding logic included)
          const count = members.length;
          const baseShare = Math.floor((amount / count) * 100) / 100;
          const remainder = Math.round((amount - (baseShare * count)) * 100) / 100;

          for (let i = 0; i < members.length; i++) {
               const finalShare = (i === 0) ? (baseShare + remainder) : baseShare;

               await client.query(
                    `INSERT INTO expense_splits (expense_id, user_id, share) VALUES ($1, $2, $3)`,
                    [newExpense.id, members[i], finalShare]
               );
          }

          await client.query('COMMIT');
          res.status(201).json(newExpense);

     } catch (error) {
          await client.query('ROLLBACK');
          console.error("Transaction Error:", error);
          res.status(500).json({ error: "Failed to create expense and splits" });
     } finally {
          client.release();
     }
};


export const getExpensesByGroup = async (req: any, res: any) => {
     try {
          const { groupId } = req.params;
          const userId = req.user.id;

          // 1. Authorization: Ensure the requester is a member of the group
          const memberCheck = await db.query(
               'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
               [groupId, userId]
          );

          if (memberCheck.rowCount === 0) {
               return res.status(403).json({ error: "Access denied: You are not a member of this group" });
          }

          // 2. Fetch expenses joined with users to get the payer's username
          const query = `
      SELECT 
        e.*, 
        u.username AS payer_name 
      FROM expenses e
      JOIN users u ON e.payer_id = u.id
      WHERE e.group_id = $1
      ORDER BY e.created_at DESC
    `;

          const result = await db.query(query, [groupId]);
          res.json(result.rows);
     } catch (error: any) {
          res.status(500).json({ error: error.message });
     }
};


export const updateExpense = async (req: any, res: any) => {
     const { id } = req.params;
     const { description, amount } = req.body;
     const userId = req.user.id;

     try {
          // 1. Fetch current expense to check ownership
          const expenseRes = await db.query('SELECT payer_id, group_id FROM expenses WHERE id = $1', [id]);
          const expense = expenseRes.rows[0];

          if (!expense) return res.status(404).json({ error: "Not found" });

          // Ownership Check
          if (expense.payer_id !== userId) {
               return res.status(403).json({ error: "Forbidden: You are not the payer" });
          }

          // 2. Fetch current group members for the new splits
          const membersRes = await db.query('SELECT user_id FROM group_members WHERE group_id = $1', [expense.group_id]);
          const memberIds = membersRes.rows.map(m => m.user_id);

          // 3. Call the model to handle the complex transaction
          const updated = await ExpenseModel.updateExpense(Number(id), description, amount, memberIds);

          res.json(updated);
     } catch (error: any) {
          res.status(500).json({ error: error.message });
     }
};


export const deleteExpense = async (req: any, res: any) => {
     const { id } = req.params; // expenseId
     const userId = req.user.id; // From authMiddleware

     try {
          // 1. Ownership Check
          const expenseRes = await db.query(
               'SELECT payer_id FROM expenses WHERE id = $1',
               [id]
          );

          if (expenseRes.rowCount === 0) {
               return res.status(404).json({ error: "Expense not found" });
          }

          if (expenseRes.rows[0].payer_id !== userId) {
               return res.status(403).json({ error: "Unauthorized: Only the payer can delete this expense" });
          }

          // 2. Execute Delete (Model handles cascade for splits)
          const deleted = await ExpenseModel.deleteExpense(Number(id));

          if (!deleted) {
               return res.status(400).json({ error: "Delete failed" });
          }

          res.status(200).json({ message: "Expense and associated splits deleted successfully" });
     } catch (error: any) {
          res.status(500).json({ error: error.message });
     }
};
