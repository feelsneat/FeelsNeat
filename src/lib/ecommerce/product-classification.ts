import type { Product } from './types';

export function isDigitalProduct(
  product: Pick<Product, 'productType' | 'digitalProductType' | 'downloadableFiles'>
): boolean {
  if (product.productType === 'PHYSICAL' || product.productType === 'AFFILIATE') {
    return false;
  }

  return Boolean(product.productType || product.digitalProductType || product.downloadableFiles?.length);
}
