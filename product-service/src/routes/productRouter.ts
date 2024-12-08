import express from 'express';
import { Product } from '../entity/Product';
import { ProductVariant } from '../entity/ProductVariant';
import { AppDataSource } from '../ormconfig';

import { ProductSpecification } from '../entity/ProductSpecification';
import { mapSpec } from '../utils/mappers';
import { ILike, Between } from 'typeorm';
import { getImageListByIds } from '../utils/common';
import { ProductVariantModel, ProductModel } from '../model/productModel';
const router = express.Router();
const productRepository = AppDataSource.getRepository(Product);
const productVariantRepository = AppDataSource.getRepository(ProductVariant);
const productSpecificationRepository = AppDataSource.getRepository(ProductSpecification);

router.post('/', async (req, res) => {
  const { name, description, price, category, rating } = req.body;
  const product = new Product();
  product.name = name;
  product.description = description;
  product.price = price;
  product.category = category;
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
  const { name, description, price, category } = req.body;

  try {
    const product = await productRepository.findOne({ where: { id: parseInt(id, 10) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;

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
    const imageIds = [...new Set(products.filter(p => p.imageId !== null).map(v => v.imageId))];
    const imageMap = await getImageListByIds(imageIds);
    if (imageMap == null) {
      return res.status(500).json({
        message: 'Failed to fetch images from Image Service.',
      });
    }
    let productModel: ProductModel[] = [];
    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      productModel.push({ ...product, imageUrl: imageMap[product.imageId] });
    }
    res.status(200).json(productModel);
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
    const imageIds = [
      product.imageId,
      ...new Set(variants.filter(v => v.imageId !== null).map(v => v.imageId)),
    ];
    if (imageIds.length === 0) {
      return res.status(200).json({
        product: product,
        variants: variants,
        specs: specs.map(mapSpec),
      });
    }
    const imageMap = await getImageListByIds(imageIds);
    if (imageMap == null) {
      return res.status(500).json({
        message: 'Failed to fetch images from Image Service.',
      });
    }
    let variantModelList: ProductVariantModel[] = [];
    for (let index = 0; index < variants.length; index++) {
      const variant = variants[index];
      variantModelList.push({ ...variant, imageUrl: imageMap[variant.imageId] });
    }
    return res.status(200).json({
      product: { ...product, imageUrl: imageMap[product.imageId] },
      variants: variantModelList,
      specs: specs.map(mapSpec),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get product' });
  }
});

export default router;
