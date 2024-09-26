import axios from 'axios';
import { ProfileModel } from '../model/User';
const baseUrl = 'http://localhost:3001/user';
export const getUserInfo = async (token: string) => {
  const response = (await axios.get(`${baseUrl}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })) as { data: ProfileModel };
  return response.data;
};
