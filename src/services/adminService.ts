import axios from 'axios';

export interface AppUserDTO {
  id: number;
  username: string;
  role: string;
  createdAt: string;
}

export interface CreateUserDTO {
  username: string;
  password: string;
  role: string;
}

export const adminService = {
  getUsers: async (): Promise<AppUserDTO[]> => {
    const response = await axios.get<AppUserDTO[]>('/api/admin/users');
    return response.data;
  },

  createUser: async (data: CreateUserDTO): Promise<AppUserDTO> => {
    const response = await axios.post<AppUserDTO>('/api/admin/users', data);
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axios.delete(`/api/admin/users/${id}`);
  }
};
