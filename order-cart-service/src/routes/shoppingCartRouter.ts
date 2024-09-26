import express from 'express';
import { ShoppingCart } from '../entity/shopppingCart';
import { AppDataSource } from '../ormconfig';
import { getProductInfo } from '../services/productService';
import { getUserInfo } from '../services/userService';
import { Repository } from 'typeorm';
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

router.delete('/:cartId', async (req, res) => {
  const { cartId } = req.params;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token == null) {
      throw new Error('token is null');
    }
    const userInfo = await getUserInfo(token);
    const cartItem = await repository.findOne({ where: { id: parseInt(cartId) } });
    if (cartItem == null) {
      throw new Error('shopping cart item not found');
    }
    if (cartItem.userId !== userInfo.id) {
      throw new Error('no permission');
    }
    await repository.delete(cartItem.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: `Failed to delete shopping cart item:${error.message}` });
  }
});
export default router;
