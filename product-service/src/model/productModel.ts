import { Product } from '../entity/Product';
import { ProductVariant } from '../entity/ProductVariant';

export interface ProductVariantModel extends ProductVariant {
  imageUrl?: string;
}
export interface ProductModel extends Product {
  imageUrl?: string;
}
