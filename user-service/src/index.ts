import 'reflect-metadata';
import express from 'express';
import * as dotenv from 'dotenv';
import { AppDataSource } from './ormconfig';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use('/', userRoutes);

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`User service listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
