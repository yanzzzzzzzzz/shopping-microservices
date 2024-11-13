import express from 'express';
import dotenv from 'dotenv';
import imgurRoutes from './routes/imgurRoutes';
import { AppDataSource } from './ormconfig';

dotenv.config();

const app = express();
const port = process.env.PORT || 3004;

app.use(express.json());
app.use('/', imgurRoutes);

AppDataSource.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Imgur service listening on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error during Data Source initialization:', err);
  });
