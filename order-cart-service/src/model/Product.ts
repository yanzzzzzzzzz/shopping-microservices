export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
}

export interface Variants {
  variantName: string;
  price: number;
  inventory: number;
  id: number;
  productId: number;
}

export interface ProductModel {
  product: Product;
  variants: Variants[];
  specs: Specs[];
}
export interface Specs {
  specVaule: string;
  name: string;
}
