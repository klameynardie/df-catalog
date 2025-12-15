import { router } from 'expo-router';

export const navigateToCategory = (slug: string) => {
  router.push(`/categories/${slug}`);
};

export const navigateToSubcategory = (categorySlug: string, subcategorySlug: string) => {
  router.push(`/categories/${categorySlug}/${subcategorySlug}`);
};

export const navigateToProduct = (id: string) => {
  router.push(`/products/${id}`);
};

export const navigateToCart = () => {
  router.push('/cart');
};

export const navigateToHome = () => {
  router.push('/');
};

export const goBack = () => {
  router.back();
};

