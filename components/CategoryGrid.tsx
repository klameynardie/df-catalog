import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { colors, spacing, shadows, fontFamilies } from '@/constants/theme';
import type { Category } from '@/lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const HORIZONTAL_PADDING = Platform.OS === 'web' ? 48 : spacing.lg;
const CARD_MARGIN = Platform.OS === 'web' ? 16 : spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_MARGIN * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const categoryImages: Record<string, any> = {
  'bars-buffets-back-bars': require('@/assets/images/YACHT-SILVER-WAVE-ILTM-CANNES-2017-57.jpg'),
  'mobiliers': require('@/assets/images/alban_pichon_1438-VNZ_3213.jpg'),
  'decoration': require('@/assets/images/Belieu-107.jpg'),
  'deco-flamme-garden': require('@/assets/images/camilledufosse-909.jpg'),
  'flammes': require('@/assets/images/flammes.jpg'),
  'textile': require('@/assets/images/deco-143.jpg'),
  'chapiteaux': require('@/assets/images/Carl-Mand-13.jpg'),
  'son-lumiere-video': require('@/assets/images/91.jpg'),
  'chauffages': require('@/assets/images/PAL176133.jpg'),
  'costumerie': require('@/assets/images/costumes.jpg'),
  'noel': require('@/assets/images/noel.jpg'),
  'parasols': require('@/assets/images/PAL167905.jpg'),
  'pistes-de-dance': require('@/assets/images/piste-danse.jpg'),
  'podiums': require('@/assets/images/PAL168721.jpg'),
  'structures-sceniques': require('@/assets/images/IMG-20221222-WA0010.jpg'),
  'tente': require('@/assets/images/tentes.jpg'),
};

const defaultImage = require('@/assets/images/banniere-home-mariage.jpg');

interface CategoryGridProps {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
}

export default function CategoryGrid({ categories, onCategoryPress }: CategoryGridProps) {
  const getCategoryImage = (category: Category) => categoryImages[category.slug] || (category.image_url ? { uri: category.image_url } : defaultImage);

  if (categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.sectionTitle}>Nos catégories</Text></View>
      <View style={styles.grid}>
        {categories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.card} onPress={() => onCategoryPress?.(category)} activeOpacity={0.9}>
            <View style={styles.cardImageContainer}>
              <Image source={getCategoryImage(category)} style={styles.cardImage} contentFit="cover" transition={200} />
              <View style={styles.cardGradient} />
              <View style={styles.cardContent}><Text style={styles.cardTitle}>{category.name}</Text></View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Platform.OS === 'web' ? 80 : spacing.xxl, paddingHorizontal: HORIZONTAL_PADDING, backgroundColor: colors.background },
  header: { alignItems: 'center', marginBottom: Platform.OS === 'web' ? 48 : spacing.xl },
  sectionTitle: { fontFamily: fontFamilies.display, fontSize: Platform.OS === 'web' ? 56 : 36, lineHeight: Platform.OS === 'web' ? 64 : 40, color: colors.textPrimary, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -CARD_MARGIN / 2 },
  card: { width: CARD_WIDTH, marginHorizontal: CARD_MARGIN / 2, marginBottom: CARD_MARGIN },
  cardImageContainer: { width: '100%', aspectRatio: 4 / 3, overflow: 'hidden', ...shadows.card },
  cardImage: { width: '100%', height: '100%' },
  cardGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  cardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.md },
  cardTitle: { fontFamily: fontFamilies.display, fontSize: Platform.OS === 'web' ? 24 : 20, lineHeight: Platform.OS === 'web' ? 28 : 26, color: colors.textOnDark, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
});

