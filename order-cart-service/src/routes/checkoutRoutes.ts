import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { CheckoutRecord } from '../entity/CheckoutRecord';
import { CheckoutItem } from '../entity/CheckoutItem';
import { authMiddleware, UserRequest } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, async (req: UserRequest, res) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { shippingAddress, totalAmount, shippingFee, couponUsed, paymentMethod, items } =
      req.body;
    if (items == null) {
      res.status(500).json({ error: 'checkout item not found' });
      return;
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
  } catch (error) {
    await queryRunner.rollbackTransaction();
    res.status(500).json({ message: 'Error creating checkout record', error });
  } finally {
    await queryRunner.release();
  }
});

router.get('/:id', async (req, res) => {
  try {
    const checkoutRepository = AppDataSource.getRepository(CheckoutRecord);
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

export default router;
