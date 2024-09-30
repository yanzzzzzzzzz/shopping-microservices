import express from 'express';
import { Product } from '../entity/Product';
import { ProductVariant } from '../entity/ProductVariant';
import { AppDataSource } from '../ormconfig';

import { ProductSpecification } from '../entity/ProductSpecification';
import { mapProduct, mapVariant, mapSpec } from '../utils/mappers';
import { ILike, Between } from 'typeorm';
const router = express.Router();
const productRepository = AppDataSource.getRepository(Product);
const productVariantRepository = AppDataSource.getRepository(ProductVariant);
const productSpecificationRepository = AppDataSource.getRepository(ProductSpecification);

router.post('/', async (req, res) => {
  const { name, description, price, category, imageUrl, rating } = req.body;
  const product = new Product();
  product.name = name;
  product.description = description;
  product.price = price;
  product.category = category;
  product.imageUrl = imageUrl;
  product.rating = rating;

  try {
    const savedProduct = await productRepository.save(product);
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product error:', err });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, imageUrl } = req.body;

  try {
    const product = await productRepository.findOne({ where: { id: parseInt(id, 10) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.imageUrl = imageUrl;

    const updatedProduct = await productRepository.save(product);
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await productRepository.findOne({ where: { id: parseInt(id, 10) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await productRepository.remove(product);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { keyword, maxPrice, minPrice } = req.query;
    let whereClause: any = {};
    if (keyword) {
      whereClause.name = ILike(`%${keyword}%`);
    }

    if (minPrice || maxPrice) {
      whereClause.price = Between(
        minPrice ? parseInt(minPrice as string, 10) : 0,
        maxPrice ? parseInt(maxPrice as string, 10) : Number.MAX_SAFE_INTEGER
      );
    }
    const products = await productRepository.find({
      where: whereClause,
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id, 10);
  try {
    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const variants = await productVariantRepository.find({ where: { productId: productId } });
    const specs = await productSpecificationRepository.find({
      where: { productId: productId },
      relations: ['specification'],
    });
    console.log('variants', variants);

    res.status(200).json({
      product: product,
      variants: variants,
      specs: specs.map(mapSpec),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get product' });
  }
});

export default router;
