export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  imageId: number;
}

export interface Variant {
  variantName: string;
  price: number;
  inventory: number;
  id: number;
  productId: number;
  imageId: number;
  imageUrl: string;
}

export interface ProductModel {
  product: Product;
  variants: Variant[];
  specs: Specs[];
}
export interface Specs {
  specVaule: string;
  name: string;
}
