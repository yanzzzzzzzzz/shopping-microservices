import express from 'express';
import { ProductVariant } from '../entity/ProductVariant';
import { AppDataSource } from '../ormconfig';
import { Product } from '../entity/Product';

const router = express.Router();
const productVariantRepository = AppDataSource.getRepository(ProductVariant);

router.post('/:productId/variants', async (req, res) => {
  const { productId } = req.params;
  const { variantName, price, inventory } = req.body;

  const variant = new ProductVariant();
  variant.productId = parseInt(productId, 10);
  variant.variantName = variantName;
  variant.price = price;
  variant.inventory = inventory;

  try {
    const savedVariant = await productVariantRepository.save(variant);
    res.status(201).json(savedVariant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product variant' });
  }
});

router.put('/:productId/variants/:variantId', async (req, res) => {
  const { variantId } = req.params;
  const { variantName, price, inventory } = req.body;

  try {
    const variant = await productVariantRepository.findOne({
      where: { id: parseInt(variantId, 10) },
    });
    if (!variant) {
      return res.status(404).json({ error: 'Product variant not found' });
    }

    variant.variantName = variantName;
    variant.price = price;
    variant.inventory = inventory;

    const updatedVariant = await productVariantRepository.save(variant);
    res.status(200).json(updatedVariant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product variant' });
  }
});

router.delete('/:productId/variants/:variantId', async (req, res) => {
  const { variantId } = req.params;

  try {
    const variant = await productVariantRepository.findOne({
      where: { id: parseInt(variantId, 10) },
    });
    if (!variant) {
      return res.status(404).json({ error: 'Product variant not found' });
    }

    await productVariantRepository.remove(variant);
    res.status(200).json({ message: 'Product variant deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product variant' });
  }
});

router.get('/:productId/variants', async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await AppDataSource.getRepository(Product).findOne({
      where: { id: parseInt(productId, 10) },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const variants = await productVariantRepository.find({
      where: { productId: parseInt(productId, 10) },
    });

    res.status(200).json({
      product,
      variants,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product variants' });
  }
});

export default router;
