import express from 'express';
import { Product } from '../entity/Product';
import { AppDataSource } from '../ormconfig';

const router = express.Router();
const productRepository = AppDataSource.getRepository(Product);

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
    const products = await productRepository.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await productRepository.findOne({ where: { id: parseInt(id, 10) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get product' });
  }
});

export default router;
