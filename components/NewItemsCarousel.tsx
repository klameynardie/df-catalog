import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows, fontFamilies } from '@/constants/theme';
import type { Product } from '@/lib/supabase';

const isWeb = Platform.OS === 'web';

// Image placeholder par défaut
const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/400x533/f5f5f5/999999?text=Image+non+disponible';

const getProductImage = (product: Product): string => {
  const url = product.product_image || product.image_url;
  if (url && url.trim() !== '' && url.startsWith('http')) {
    return url;
  }
  return DEFAULT_PLACEHOLDER;
};

interface NewItemsCarouselProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
}

export default function NewItemsCarousel({ products, onProductPress }: NewItemsCarouselProps) {
  const { width: screenWidth } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollPosition = useRef(0);
  
  // Calcul dynamique du padding et spacing
  const horizontalPadding = isWeb ? (screenWidth < 768 ? spacing.lg : 48) : spacing.lg;
  const cardSpacing = isWeb ? (screenWidth < 768 ? spacing.md : 24) : spacing.md;
  
  // Calcul dynamique de la largeur des cards
  // Mobile responsive : 2 cards visibles
  // Tablette : 3 cards visibles
  // Desktop : 4+ cards visibles
  const getCardWidth = () => {
    if (!isWeb) return screenWidth * 0.42;
    
    const availableWidth = screenWidth - horizontalPadding * 2;
    
    if (screenWidth < 768) {
      // Mobile responsive : 2 cards
      return (availableWidth - cardSpacing) / 2;
    } else if (screenWidth < 1200) {
      // Tablette : 3 cards
      return (availableWidth - cardSpacing * 2) / 3;
    } else {
      // Desktop : largeur fixe max 280px
      return Math.min(280, (availableWidth - cardSpacing * 3) / 4);
    }
  };
  
  const cardWidth = getCardWidth();
  const scrollAmount = cardWidth + cardSpacing;

  const handleScrollLeft = () => {
    const newPosition = Math.max(0, scrollPosition.current - scrollAmount * 2);
    scrollViewRef.current?.scrollTo({ x: newPosition, animated: true });
    scrollPosition.current = newPosition;
  };

  const handleScrollRight = () => {
    const newPosition = scrollPosition.current + scrollAmount * 2;
    scrollViewRef.current?.scrollTo({ x: newPosition, animated: true });
    scrollPosition.current = newPosition;
  };

  const handleScroll = (event: any) => {
    scrollPosition.current = event.nativeEvent.contentOffset.x;
  };

  if (products.length === 0) return null;

  // Afficher les flèches sur toutes les tailles d'écran web
  const showNavButtons = isWeb;
  
  // Taille du titre responsive
  const titleFontSize = isWeb ? (screenWidth < 768 ? 30 : 48) : 30;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>Nouveautés</Text>
        {showNavButtons && (
          <View style={styles.navButtons}>
            <TouchableOpacity style={styles.navButton} onPress={handleScrollLeft} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={handleScrollRight} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={[styles.listContent, { paddingHorizontal: horizontalPadding, gap: cardSpacing }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {products.map((item, index) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.card, { width: cardWidth }]} 
            onPress={() => onProductPress?.(item)} 
            activeOpacity={0.9}
          >
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
  container: { 
    paddingVertical: isWeb ? 80 : spacing.xxl, 
    backgroundColor: colors.surfaceMuted,
  },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isWeb ? 40 : spacing.lg,
  },
  sectionTitle: { 
    fontFamily: fontFamilies.display, 
    color: colors.textPrimary,
  },
  navButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContent: { 
    // paddingHorizontal et gap sont dynamiques, passés en style inline
  },
  card: { 
    backgroundColor: colors.background, 
    ...shadows.card,
  },
  cardImageContainer: { 
    width: '100%', 
    aspectRatio: 3 / 4, 
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: '100%' },
  cardInfo: { 
    padding: isWeb ? 20 : spacing.md,
  },
  cardCategory: { 
    fontFamily: fontFamilies.body, 
    fontSize: 10, 
    fontWeight: '600', 
    color: colors.textMuted, 
    marginBottom: spacing.xxs, 
    letterSpacing: 1.5,
  },
  cardName: { 
    fontFamily: fontFamilies.display, 
    fontSize: isWeb ? 22 : 18, 
    color: colors.textPrimary,
  },
});
