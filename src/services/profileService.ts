import axios from 'axios';

export const profileService = {
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await axios.put('/api/user/password', { currentPassword, newPassword });
  }
};
