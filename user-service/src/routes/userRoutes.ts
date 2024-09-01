import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../ormconfig';
import { User } from '../entity/User';
import { generateToken } from '../utils/jwt';
import { authMiddleware, UserRequest } from '../middleware/auth';

const userRepository = AppDataSource.getRepository(User);
const router = Router();

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User();
  user.username = username;
  user.password = hashedPassword;
  user.email = email;

  try {
    const savedUser = await userRepository.save(user);
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: 'User registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id);
      res.status(200).json({ message: 'Login successful', token });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/profile', authMiddleware, async (req: UserRequest, res) => {
  try {
    const user = await userRepository.findOne({
      where: { id: req.user?.id },
      select: ['username', 'email'],
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'user not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

router.get('/checkToken', authMiddleware, async (req, res) => {
  res.status(200).json({ message: 'Token is valid' });
});

export default router;
