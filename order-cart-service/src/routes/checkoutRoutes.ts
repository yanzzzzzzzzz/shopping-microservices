import { Router } from 'express';
import { AppDataSource } from '../ormconfig';
import { CheckoutRecord } from '../entity/CheckoutRecord';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const checkoutRepository = AppDataSource.getRepository(CheckoutRecord);
    const checkoutRecord = checkoutRepository.create(req.body);
    const result = await checkoutRepository.save(checkoutRecord);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating checkout record', error });
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
