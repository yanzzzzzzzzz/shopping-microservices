import express from 'express';
import { ShoppingCart } from '../entity/shopppingCart';
import { AppDataSource } from '../ormconfig';
import { getProductInfo } from '../services/productService';
const router = express.Router();
const repository = AppDataSource.getRepository(ShoppingCart);

router.post('/', async (req, res) => {
  const item = req.body;
  const newRecord = repository.create(item);

  try {
    const savedResult = await repository.save(newRecord);
    res.status(201).json(savedResult);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create shopping cart:', err });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const shoppingCartList = await repository.find({ where: { userId: parseInt(userId, 10) } });
    const productPromises = shoppingCartList.map(async item => {
      const productInfo = await getProductInfo(item.productId);
      const variant = productInfo.variants.find(variant => variant.id === item.productVariantId);
      return {
        ...item,
        imageUrl: productInfo.product.imageUrl,
        name: productInfo.product.name,
        price: variant?.price,
        variantName: variant?.variantName,
      };
    });
    const enrichedCartList = await Promise.all(productPromises);

    res.status(200).json(enrichedCartList);
  } catch (error) {}
});
export default router;
