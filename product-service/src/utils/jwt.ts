import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || 'default-secret-key';

export const generateToken = (userId: number) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '1h' });
};

export const verifyToken = (token: string): { id: number } | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as { id: number };
  } catch (err) {
    return null;
  }
};
