import axios from 'axios';
import { ProductModel } from '../model/Product';
const baseUrl = 'http://localhost:3002/products';
export const getProductInfo = async (productId: number) => {
  const response = (await axios.get(`${baseUrl}/${productId}`)) as { data: ProductModel };
  return response.data;
};
