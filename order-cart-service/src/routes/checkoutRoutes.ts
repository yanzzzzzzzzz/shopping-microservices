import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { CheckoutRecord } from '../entity/CheckoutRecord';
import { CheckoutItem } from '../entity/CheckoutItem';
import { authMiddleware, UserRequest } from '../middleware/auth';
import { ShoppingCart } from '../entity/shopppingCart';
import { getImageList } from '../services/imageService';
import { CheckoutItemWithImageUrl } from '../model/CheckoutItem';
const router = Router();
const checkoutRepository = AppDataSource.getRepository(CheckoutRecord);

router.post('/', authMiddleware, async (req: UserRequest, res) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { shippingAddress, totalAmount, shippingFee, couponUsed, paymentMethod, items } =
      req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Checkout items not found' });
    }

    for (const item of items) {
      const shoppingCart = await queryRunner.manager.findOne(ShoppingCart, {
        where: { id: item.cartId },
      });

      if (!shoppingCart) {
        return res.status(404).json({ message: 'Shopping cart not found' });
      }

      await queryRunner.manager.delete(ShoppingCart, shoppingCart);
    }

    const nowISO = new Date().toISOString();

    const checkoutRecord = queryRunner.manager.create(CheckoutRecord, {
      shippingAddress,
      totalAmount,
      shippingFee,
      couponUsed,
      paymentMethod,
      createdAt: nowISO,
      userId: req.user?.id,
      shipmentTime: nowISO,
      storeId: 1, // TODO
      orderStatus: 'shipping',
      paymentStatus: 'payment',
    });

    const savedCheckoutRecord = await queryRunner.manager.save(checkoutRecord);

    const checkoutItems = items.map((item: any) =>
      queryRunner.manager.create(CheckoutItem, {
        productId: item.productId,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: item.price,
        totalAmount: item.totalAmount,
        checkoutRecord: savedCheckoutRecord,
      })
    );

    await queryRunner.manager.save(checkoutItems);

    await queryRunner.commitTransaction();
    res.json(savedCheckoutRecord);
  } catch (error: any) {
    await queryRunner.rollbackTransaction();
    res.status(500).json({ message: 'Error creating checkout record', error });
  } finally {
    await queryRunner.release();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const record = await checkoutRepository.findOneBy({ id: parseInt(req.params.id) });
    if (!record) {
      res.status(404).json({ message: 'Checkout record not found' });
    } else {
      res.json(record);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving checkout record', error });
  }
});

router.get('/', authMiddleware, async (req: UserRequest, res) => {
  try {
    console.log('get list');
    console.log('req.user', req.user);

    if (!req.user) {
      return res.status(401).send('Unauthorized');
    }
    const userId = req.user!.id;
    const recordsWithItems = await checkoutRepository.find({
      where: { userId: Number(userId) },
      relations: ['items'],
    });

    const imageIds = recordsWithItems.flatMap(record =>
      record.items.filter(item => item.imageId !== null).map(item => item.imageId)
    );
    if (imageIds.length === 0) {
      return res.json(recordsWithItems);
    }
    const validImageIds: number[] = [
      ...new Set(imageIds.filter((id): id is number => id !== null)),
    ];
    console.log('validImageIds', validImageIds);

    const imageResponse: any = await getImageList(validImageIds);
    console.log('imageResponse', imageResponse);

    if (imageResponse.status !== 200) {
      return res.status(imageResponse.status).json({
        message: 'Failed to fetch images from Image Service.',
      });
    }
    const imageMap = imageResponse.data;
    recordsWithItems.forEach(record => {
      record.items.forEach(item => {
        const extendedItem = item as CheckoutItemWithImageUrl;
        if (item.imageId && imageMap[item.imageId]) {
          extendedItem.imageUrl = imageMap[item.imageId];
        }
      });
    });
    return res.json(recordsWithItems);
  } catch (error) {
    console.error('Error fetching checkout records or images:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
export default router;
