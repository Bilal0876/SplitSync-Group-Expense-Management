import api from './api';

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    message: string;
}

export const register = async (data: object): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
};


export const login = async (data: object): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
};
