import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { colors, spacing, shadows, fontFamilies } from '@/constants/theme';
import type { Product } from '@/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Platform.OS === 'web' ? 280 : SCREEN_WIDTH * 0.42;
const CARD_SPACING = Platform.OS === 'web' ? 24 : spacing.md;
const HORIZONTAL_PADDING = Platform.OS === 'web' ? 48 : spacing.lg;
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800';

const getProductImage = (product: Product): string => {
  const url = product.product_image || product.image_url;
  if (url && url.trim() !== '' && url.startsWith('http')) {
    return url;
  }
  return DEFAULT_IMAGE;
};

interface NewItemsCarouselProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
}

export default function NewItemsCarousel({ products, onProductPress }: NewItemsCarouselProps) {
  if (products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.sectionTitle}>Nouveautés</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {products.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => onProductPress?.(item)} activeOpacity={0.9}>
            <View style={styles.cardImageContainer}>
              <Image source={{ uri: getProductImage(item) }} style={styles.cardImage} contentFit="cover" transition={200} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardCategory}>{(item.categories?.name || 'Produit').toUpperCase()}</Text>
              <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Platform.OS === 'web' ? 80 : spacing.xxl, backgroundColor: colors.surfaceMuted },
  header: { paddingHorizontal: HORIZONTAL_PADDING, marginBottom: Platform.OS === 'web' ? 40 : spacing.lg },
  sectionTitle: { fontFamily: fontFamilies.display, fontSize: Platform.OS === 'web' ? 48 : 30, color: colors.textPrimary },
  listContent: { paddingHorizontal: HORIZONTAL_PADDING, gap: CARD_SPACING },
  card: { width: CARD_WIDTH, backgroundColor: colors.background, ...shadows.card },
  cardImageContainer: { width: '100%', aspectRatio: 3 / 4, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%' },
  cardInfo: { padding: Platform.OS === 'web' ? 20 : spacing.md },
  cardCategory: { fontFamily: fontFamilies.body, fontSize: 10, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.xxs, letterSpacing: 1.5 },
  cardName: { fontFamily: fontFamilies.display, fontSize: Platform.OS === 'web' ? 22 : 18, color: colors.textPrimary },
});

