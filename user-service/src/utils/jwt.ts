import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { User } from '../entity/User';
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'default-secret-key';

export const generateToken = (user: User) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '3h' });
};

export const verifyToken = (token: string): { id: number } | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as { id: number };
  } catch (err) {
    return null;
  }
};
