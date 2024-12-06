import { CheckoutItem } from '../entity/CheckoutItem';

export interface CheckoutItemWithImageUrl extends CheckoutItem {
  imageUrl?: string;
}
