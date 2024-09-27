import { Request, Response, NextFunction, RequestHandler } from 'express';
import { getUserInfo } from '../services/userService';
export interface UserRequest extends Request {
  user?: {
    id: number;
  };
}

export const authMiddleware: RequestHandler = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('token', token);

  if (token == null) {
    next();
    return;
  }

  const decoded = await getUserInfo(token);
  console.log('decoded', decoded);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  req.user = { id: decoded.id };
  next();
};
