import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './ormconfig';
import cartRouter from './routes/shoppingCartRoutes';
import checkoutRoutes from './routes/checkoutRoutes';
const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    app.use('/cart', cartRouter);
    app.use('/cart/checkout', checkoutRoutes);
    app.listen(port, () => {
      console.log(`Product service listening on port ${port}`);
    });
  })
  .catch(error => console.log(error));
