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
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      next();
      return;
    }

    const decoded = await getUserInfo(token);
    if (!decoded) {
      next();
      return;
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).send('auth error');
    next();
  }
};
