import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './ormconfig';
import productRouter from './routes/productRouter';
import productVariantRouter from './routes/productVariantRouter';
const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    app.use('/products', productRouter);
    app.use('/products', productVariantRouter);

    app.listen(port, () => {
      console.log(`Product service listening on port ${port}`);
    });
  })
  .catch(error => console.log(error));
