import prisma from '../config/prisma.ts';

export const createExpense = async (groupId: number, payerId: number, description: string, amount: number) => {
     return await prisma.expenses.create({
          data: {
               group_id: groupId,
               payer_id: payerId,
               description: description,
               amount: amount,
          }
     });
};


export const createSplits = async (
     expenseId: number,
     members: number[],
     totalAmount: number
) => {
     return await prisma.$transaction(async (tx) => {
          const count = members.length;
          const baseShare = Math.floor((totalAmount / count) * 100) / 100;

          const totalBaseShares = baseShare * count;
          const remainder = Math.round((totalAmount - totalBaseShares) * 100) / 100;

          const splits = members.map((userId, index) => {
               const finalShare = index === 0
                    ? (baseShare + remainder).toFixed(2)
                    : baseShare.toFixed(2);

               return tx.expense_splits.create({
                    data: {
                         expense_id: expenseId,
                         user_id: userId,
                         share: finalShare
                    }
               });
          });

          await Promise.all(splits);

          return { success: true, baseShare, remainder };
     });
};


export const getExpensesByGroup = async (groupId: number) => {
     const res = await prisma.expenses.findMany({
          where: { group_id: groupId },
          include: {
               users: {
                    select: { username: true }
               }
          },
          orderBy: { created_at: 'desc' }
     });

     // Remap to match previous raw SQL results (adding payer_name)
     return res.map(e => ({
          ...e,
          payer_name: e.users?.username
     }));
};


export const updateExpense = async (
     expenseId: number,
     description: string,
     amount: number,
     memberIds: number[]
) => {
     return await prisma.$transaction(async (tx) => {
          // 1. Update the main expense record
          const updatedExpense = await tx.expenses.update({
               where: { id: expenseId },
               data: {
                    description: description,
                    amount: amount,
               }
          });

          // 2. Wipe old splits
          await tx.expense_splits.deleteMany({
               where: { expense_id: expenseId }
          });

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

               await tx.expense_splits.create({
                    data: {
                         expense_id: expenseId,
                         user_id: memberIds[i],
                         share: finalShare
                    }
               });
          }

          return updatedExpense;
     });
};


export const deleteExpense = async (expenseId: number): Promise<boolean> => {
     const result = await prisma.expenses.delete({
          where: { id: expenseId },
          select: { id: true }
     });

     return !!result.id;
};
