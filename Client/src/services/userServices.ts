import api from './api';

export interface DashboardData {
    groupsCount: number;
    netBalance: number;
    recentActivity: {
        type: 'expense' | 'settlement';
        title: string;
        amount: number;
        created_at: string;
        paid_by_username: string;
        paid_by_id: number;
        group_name: string;
    }[];
    summarizedBalances: {
        userId: number;
        username: string;
        amount: number;
        dir: 'owed_to_me' | 'i_owe';
    }[];
    monthlySpent: number;
    totalSettled: number;
}

export const getDashboardData = async (): Promise<DashboardData> => {
    const response = await api.get('/users/dashboard');
    return response.data;
};
