import 'reflect-metadata';
import express from 'express';
import { Product } from './entity/Product';
import { AppDataSource } from './ormconfig';
import { authMiddleware, UserRequest } from './middleware/auth';

const app = express();
const port = process.env.PORT || 3002;

app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    const productRepository = AppDataSource.getRepository(Product);

    app.post('/products', authMiddleware, async (req: UserRequest, res) => {
      const { name, description, price, category, imageUrl } = req.body;
      const product = new Product();
      product.name = name;
      product.description = description;
      product.price = price;
      product.category = category;
      product.imageUrl = imageUrl;
      if (req.user?.id) {
        product.userId = req.user.id;
      }

      try {
        const savedProduct = await productRepository.save(product);
        res.status(201).json(savedProduct);
      } catch (err) {
        res.status(500).json({ error: 'Failed to create product' });
      }
    });

    app.put('/products/:id', async (req, res) => {
      const { id } = req.params;
      const { name, description, price, category, imageUrl } = req.body;

      try {
        const product = await productRepository.findOne({
          where: { id: parseInt(id, 10) },
        });
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

    app.delete('/products/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const product = await productRepository.findOne({
          where: { id: parseInt(id, 10) },
        });
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        await productRepository.remove(product);
        res.status(200).json({ message: 'Product deleted successfully' });
      } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
      }
    });

    app.get('/products', async (req, res) => {
      try {
        const products = await productRepository.find();
        res.status(200).json(products);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
      }
    });

    app.get('/products/:id', async (req, res) => {
      const { id } = req.params;

      try {
        const product = await productRepository.findOne({
          where: { id: parseInt(id, 10) },
        });
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch product' });
      }
    });

    app.listen(port, () => {
      console.log(`Product service listening on port ${port}`);
    });
  })
  .catch((error) => console.log(error));
