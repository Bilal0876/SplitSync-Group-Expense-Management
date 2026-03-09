import api from './api';

export interface Group {
     id: number;
     name: string;
     created_at: string;
     member_count?: number;
     members?: { id: number; username: string; email: string }[];
}

/** Fetch all groups the authenticated user belongs to */
export const getGroups = async (): Promise<Group[]> => {
     const response = await api.get<Group[]>('/groups');
     return response.data;
};

/** Create a new group */
export const createGroup = async (name: string): Promise<Group> => {
     const response = await api.post<Group>('/groups', { name });
     return response.data;
};

/** Get detailed group info (with members) */
export const getGroup = async (groupId: number): Promise<Group> => {
     const response = await api.get<Group>(`/groups/${groupId}`);
     return response.data;
};

/** Add a member to a group by email */
export const addMember = async (groupId: number, email: string): Promise<{ message: string; member: { id: number; username: string; email: string } }> => {
     const response = await api.post<{ message: string; member: { id: number; username: string; email: string } }>(`/groups/${groupId}/members`, { email });
     return response.data;
};

/** Remove a member from a group */
export const removeMember = async (groupId: number, userId: number): Promise<{ message: string }> => {
     const response = await api.delete<{ message: string }>(`/groups/${groupId}/members`, { data: { userId } });
     return response.data;
};
