import api from './api';

export interface Expense {
     id: number;
     description: string;
     amount: number;
     payer_id: number;
     payer_name?: string;
     group_id: number;
     created_at: string;
}

/** Fetch all expenses for a specific group */
export const getExpensesByGroup = async (groupId: number): Promise<Expense[]> => {
     const response = await api.get<Expense[]>(`/groups/${groupId}/expenses`);;
     return response.data;
};

/** Create a new expense (splits are handled by the backend) */
export const createExpense = async (data: {
     groupId: number;
     description: string;
     amount: number;
     payerId: number
}): Promise<Expense> => {
     const response = await api.post<Expense>('/expenses', data);
     return response.data;
};

/** Update an existing expense and its splits */
export const updateExpense = async (
     expenseId: number,
     data: { description: string; amount: number }
): Promise<Expense> => {
     const response = await api.put<Expense>(`/expenses/${expenseId}`, data);
     return response.data;
};

/** Delete an expense and its splits */
export const deleteExpense = async (expenseId: number): Promise<{ message: string }> => {
     const response = await api.delete<{ message: string }>(`/expenses/${expenseId}`);
     return response.data;
};
