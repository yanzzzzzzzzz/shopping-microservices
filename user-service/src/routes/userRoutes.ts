import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../ormconfig';
import { User } from '../entity/User';

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

    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
