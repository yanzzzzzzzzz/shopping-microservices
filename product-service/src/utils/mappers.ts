import { Product } from '../entity/Product';
import { ProductVariant } from '../entity/ProductVariant';
import { ProductSpecification } from '../entity/ProductSpecification';

export const mapProduct = (product: Product) => {
  const { id, ...productData } = product;
  return productData;
};

export const mapVariant = (variant: ProductVariant) => {
  const { id, productId, ...variantData } = variant;
  return variantData;
};

export const mapSpec = (spec: ProductSpecification) => {
  const { id, productId, specId, specification, ...specData } = spec;
  return {
    ...specData,
    name: specification ? specification.name : null,
  };
};
