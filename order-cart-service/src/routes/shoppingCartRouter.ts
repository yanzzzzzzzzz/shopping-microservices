import express from 'express';
import { ShoppingCart } from '../entity/shopppingCart';
import { AppDataSource } from '../ormconfig';
import { getProductInfo } from '../services/productService';
import { authMiddleware, UserRequest } from '../middleware/auth';
const router = express.Router();
const repository = AppDataSource.getRepository(ShoppingCart);

router.post('/', authMiddleware, async (req: UserRequest, res) => {
  if (req.user?.id == null) {
    return res.status(500).json({ error: 'user not found' });
  }

  const existingItem = await repository.findOne({
    where: {
      userId: req.user?.id,
      productId: req.body.productId,
      productVariantId: req.body.productVariantId,
    },
  });

  if (existingItem) {
    existingItem.amount += req.body.amount;
    await repository.save(existingItem);
    return res.status(200).json(existingItem);
  }

  const newRecord = repository.create({ ...req.body, userId: req.user?.id });
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
    console.log('enrichedCartList', enrichedCartList);

    res.status(200).json(enrichedCartList);
  } catch (error) {}
});

router.delete('/:cartId', authMiddleware, async (req: UserRequest, res) => {
  const { cartId } = req.params;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token == null) {
      throw new Error('token is null');
    }
    const cartItem = await repository.findOne({ where: { id: parseInt(cartId) } });
    if (cartItem == null) {
      throw new Error('shopping cart item not found');
    }
    console.log('req.user', req.user);

    if (cartItem.userId !== req.user?.id) {
      throw new Error('no permission');
    }
    await repository.delete(cartItem.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: `Failed to delete shopping cart item:${error.message}` });
  }
});
export default router;
