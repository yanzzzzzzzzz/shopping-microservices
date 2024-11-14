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

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and email are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const existingUser = await userRepository.findOne({ where: [{ username }, { email }] });
  if (existingUser) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User();
  user.username = username;
  user.password = hashedPassword;
  user.email = email;

  try {
    const savedUser = await userRepository.save(user);
    const token = generateToken(savedUser);
    res.status(201).json({ token: token });
  } catch (err) {
    res.status(500).json({ error: 'User registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userRepository.findOne({ where: { username } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user);
      res.status(200).json({ message: 'Login successful', token });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('', authMiddleware, async (req: UserRequest, res) => {
  try {
    const user = await userRepository.findOne({
      where: { id: req.user?.id },
    });
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
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

router.put('', authMiddleware, async (req: UserRequest, res) => {
  const { email, phone, sex, birthday, imageId, name } = req.body;
  const userId = req.user?.id;

  try {
    const user = await userRepository.findOne({ where: { id: userId } });

    if (user) {
      user.email = email;
      user.phone = phone;
      user.sex = sex;
      user.birthday = birthday;
      user.imageId = imageId;
      user.name = name;

      await userRepository.save(user);
      res.status(200).json({ message: 'User info updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.log('error', error);

    res.status(500).json({ error: 'Failed to update user info' + error });
  }
});

export default router;
