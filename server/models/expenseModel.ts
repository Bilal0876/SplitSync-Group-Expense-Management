import db from '../config/db.ts';

export const createExpense = async (groupId: number, payerId: number, description: string, amount: number) => {
     const querytext = `INSERT INTO expenses (group_id, payer_id, description, amount) VALUES ($1, $2, $3, $4) RETURNING *`;
     const values = [groupId, payerId, description, amount];
     const result = await db.query(querytext, values);
     return result.rows[0];
};


export const createSplits = async (
     expenseId: number,
     members: number[],
     totalAmount: number
) => {
     const client = await db.pool.connect();

     try {
          await client.query('BEGIN');

          const count = members.length;
          const baseShare = Math.floor((totalAmount / count) * 100) / 100;

          const totalBaseShares = baseShare * count;
          const remainder = Math.round((totalAmount - totalBaseShares) * 100) / 100;

          const insertPromises = members.map((userId, index) => {
               const finalShare = index === 0
                    ? (baseShare + remainder).toFixed(2)
                    : baseShare.toFixed(2);

               return client.query(
                    'INSERT INTO expense_splits (expense_id, user_id, share) VALUES ($1, $2, $3)',
                    [expenseId, userId, finalShare]
               );
          });

          await Promise.all(insertPromises);
          await client.query('COMMIT');

          return { success: true, baseShare, remainder };
     } catch (error) {
          await client.query('ROLLBACK');
          throw error;
     } finally {
          client.release();
     }
};


export const getExpensesByGroup = async (groupId: number) => {
     const query = `
    SELECT 
      e.id, 
      e.description, 
      e.amount, 
      e.created_at, 
      u.username AS payer_name,
      e.payer_id
    FROM expenses e
    JOIN users u ON e.payer_id = u.id
    WHERE e.group_id = $1
    ORDER BY e.created_at DESC
  `;

     const res = await db.query(query, [groupId]);
     return res.rows;
};


export const updateExpense = async (
     expenseId: number,
     description: string, // Schema uses 'description', not 'title'
     amount: number,
     memberIds: number[] // Required to re-calculate and re-insert splits
) => {
     const client = await db.pool.connect();

     try {
          await client.query('BEGIN');

          // 1. Update the main expense record
          const updateRes = await client.query(
               'UPDATE expenses SET description = $1, amount = $2 WHERE id = $3 RETURNING *',
               [description, amount, expenseId]
          );

          if (updateRes.rowCount === 0) {
               throw new Error('Expense not found');
          }

          // 2. Wipe old splits
          await client.query('DELETE FROM expense_splits WHERE expense_id = $1', [expenseId]);

          // 3. Calculate new splits with rounding logic
          const count = memberIds.length;
          const baseShare = Math.floor((amount / count) * 100) / 100;
          const totalBaseShares = baseShare * count;
          const remainder = Math.round((amount - totalBaseShares) * 100) / 100;

          // 4. Re-insert new splits
          for (let i = 0; i < memberIds.length; i++) {
               const finalShare = i === 0
                    ? (baseShare + remainder).toFixed(2)
                    : baseShare.toFixed(2);

               await client.query(
                    'INSERT INTO expense_splits (expense_id, user_id, share) VALUES ($1, $2, $3)',
                    [expenseId, memberIds[i], finalShare]
               );
          }

          await client.query('COMMIT');
          return updateRes.rows[0];
     } catch (error) {
          await client.query('ROLLBACK');
          throw error;
     } finally {
          client.release();
     }
};


export const deleteExpense = async (expenseId: number): Promise<boolean> => {
     const query = `DELETE FROM expenses WHERE id = $1 RETURNING id`;
     const result = await db.query(query, [expenseId]);

     return (result.rowCount ?? 0) > 0;
};
