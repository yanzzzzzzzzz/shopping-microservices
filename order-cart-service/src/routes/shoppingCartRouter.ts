import express from 'express';
import { ShoppingCart } from '../entity/shopppingCart';
import { AppDataSource } from '../ormconfig';

const router = express.Router();
const repository = AppDataSource.getRepository(ShoppingCart);

router.post('/', async (req, res) => {
  const newRecord = repository.create({
    amount: 1,
    productId: 1,
    productVariantId: 1,
    userId: 1,
  });
  const savedResult = await repository.save(newRecord);
  res.status(201).json(savedResult);
});

export default router;
