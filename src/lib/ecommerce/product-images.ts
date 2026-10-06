import { getProductImageObjectKey } from './digital-file-storage';

export function getPublicProductImageUrl(
  image: string | undefined,
  requestUrl: string,
  productId: string,
  imageIndex?: number,
  variantId?: string
): string {
  const objectKey = image ? getProductImageObjectKey(image) : null;
  if (objectKey) {
    const imageUrl = new URL('/api/ecommerce/product-image', requestUrl);
    imageUrl.searchParams.set('imageId', objectKey.slice('product-images/'.length));
    return imageUrl.toString();
  }

  if (!image?.startsWith('data:image/')) return image || '';

  const imageUrl = new URL('/api/ecommerce/product-image', requestUrl);
  imageUrl.searchParams.set('productId', productId);
  if (variantId) {
    imageUrl.searchParams.set('variantId', variantId);
  } else if (imageIndex !== undefined) {
    imageUrl.searchParams.set('imageIndex', String(imageIndex));
  }
  return imageUrl.toString();
}
