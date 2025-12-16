import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { colors, spacing, fontFamilies, shadows } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { fetchProductById, fetchRelatedProducts, type Product } from '@/lib/supabase';
import { navigateToProduct, navigateToHome, navigateToCategory, navigateToCart, goBack } from '@/lib/navigation';

const isWeb = Platform.OS === 'web';

// Image placeholder par défaut
const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/400x533/f5f5f5/999999?text=Image+non+disponible';

const getValidImageUrl = (url: string | undefined | null): string => {
  if (!url || url.trim() === '') return DEFAULT_PLACEHOLDER;
  if (url.startsWith('http')) return url;
  return DEFAULT_PLACEHOLDER;
};

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAddedModal, setShowAddedModal] = useState(false);
  
  // Ref pour le carousel "Vous aimerez aussi"
  const relatedScrollRef = useRef<ScrollView>(null);
  const relatedScrollPosition = useRef(0);

  // Responsive breakpoints
  const isMobileView = screenWidth < 768;
  const isTabletView = screenWidth >= 768 && screenWidth < 1024;
  const isDesktopView = screenWidth >= 1024;
  
  // Layout 2 colonnes uniquement sur desktop large
  const isTwoColumnLayout = isDesktopView;
  
  // Calculs dynamiques basés sur la taille de l'écran
  const contentPadding = isMobileView ? spacing.lg : 48;
  
  // Calculs responsive pour la galerie
  const galleryWidth = isTwoColumnLayout ? Math.min(screenWidth * 0.45, 600) : screenWidth - contentPadding * 2;
  const thumbnailSize = isMobileView ? 80 : 120;
  
  // Tailles de police dynamiques
  const productNameSize = isMobileView ? 28 : 40;
  const descriptionSize = isMobileView ? 16 : 18;
  const sectionTitleSize = isMobileView ? 18 : 22;
  const relatedTitleSize = isMobileView ? 24 : 32;
  
  // Calcul de la largeur des cards "Vous aimerez aussi" (identique à Nouveautés)
  const relatedCardSpacing = isMobileView ? spacing.md : 24;
  const getRelatedCardWidth = () => {
    if (!isWeb) return screenWidth * 0.42;
    const availableWidth = screenWidth - contentPadding * 2;
    if (screenWidth < 768) {
      return (availableWidth - relatedCardSpacing) / 2;
    } else if (screenWidth < 1200) {
      return (availableWidth - relatedCardSpacing * 2) / 3;
    } else {
      return Math.min(280, (availableWidth - relatedCardSpacing * 3) / 4);
    }
  };
  const relatedCardWidth = getRelatedCardWidth();

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const data = await fetchProductById(id!);
    if (data) {
      setProduct(data);
      // Utiliser les produits sélectionnés manuellement, sinon les derniers de la catégorie
      const related = await fetchRelatedProducts(
        data.category_id, 
        data.id, 
        6,
        data.related_products
      );
      setRelatedProducts(related);
    }
    setLoading(false);
  };

  const getAllImages = (): string[] => {
    if (!product) return [];
    const images: string[] = [];
    
    // Image principale
    const mainImage = getValidImageUrl(product.product_image || product.image_url);
    images.push(mainImage);
    
    // Images d'ambiance valides
    if (product.ambient_images && product.ambient_images.length > 0) {
      product.ambient_images.forEach(img => {
        const validUrl = getValidImageUrl(img);
        if (validUrl !== DEFAULT_PLACEHOLDER && !images.includes(validUrl)) {
          images.push(validUrl);
        }
      });
    }
    
    return images;
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, image_url: product.product_image || product.image_url }, quantity);
    setShowAddedModal(true);
  };

  const handleContinueShopping = () => {
    setShowAddedModal(false);
  };

  const handleGoToCart = () => {
    setShowAddedModal(false);
    navigateToCart();
  };

  // Navigation carousel "Vous aimerez aussi"
  const relatedScrollAmount = relatedCardWidth + relatedCardSpacing;

  const handleRelatedScrollLeft = () => {
    const newPosition = Math.max(0, relatedScrollPosition.current - relatedScrollAmount * 2);
    relatedScrollRef.current?.scrollTo({ x: newPosition, animated: true });
    relatedScrollPosition.current = newPosition;
  };

  const handleRelatedScrollRight = () => {
    const newPosition = relatedScrollPosition.current + relatedScrollAmount * 2;
    relatedScrollRef.current?.scrollTo({ x: newPosition, animated: true });
    relatedScrollPosition.current = newPosition;
  };

  const handleRelatedScroll = (event: any) => {
    relatedScrollPosition.current = event.nativeEvent.contentOffset.x;
  };

  if (loading) return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.textPrimary} /></SafeAreaView>;
  if (!product) return (
    <SafeAreaView style={styles.container}>
      <Header showBack title="Produit" />
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Produit non trouvé</Text>
        <TouchableOpacity style={styles.backButton} onPress={goBack}><Text style={styles.backButtonText}>Retour</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  const allImages = getAllImages();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showBack={!isWeb} title={isWeb ? undefined : product.name} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <View style={[styles.breadcrumb, { paddingHorizontal: contentPadding }]}>
          <TouchableOpacity onPress={navigateToHome} style={styles.breadcrumbItem}>
            <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.breadcrumbLink}>Accueil</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSeparator}>›</Text>
          {product.categories && (
            <>
              <TouchableOpacity onPress={() => navigateToCategory(product.categories!.slug)}>
                <Text style={styles.breadcrumbLink}>{product.categories.name}</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbSeparator}>›</Text>
            </>
          )}
          <Text style={styles.breadcrumbCurrent} numberOfLines={1}>{product.name}</Text>
        </View>

        {/* Layout principal */}
        <View style={[
          styles.mainLayout, 
          { 
            paddingHorizontal: contentPadding,
            flexDirection: isTwoColumnLayout ? 'row' : 'column',
            gap: isTwoColumnLayout ? spacing.xxl : 0,
            paddingVertical: isTwoColumnLayout ? spacing.xl : 0,
          }
        ]}>
          {/* Colonne Gauche - Galerie */}
          <View style={[styles.galleryColumn, isTwoColumnLayout && { width: galleryWidth }]}>
            <View style={styles.galleryContainer}>
              <Image 
                source={{ uri: allImages[currentImageIndex] || DEFAULT_IMAGE }} 
                style={styles.mainImage} 
                contentFit="cover" 
                transition={200} 
              />
              {allImages.length > 1 && (
                <View style={styles.imageDots}>
                  {allImages.map((_, index) => (
                    <TouchableOpacity 
                      key={index} 
                      onPress={() => setCurrentImageIndex(index)} 
                      style={[styles.imageDot, index === currentImageIndex && styles.imageDotActive]} 
                    />
                  ))}
                </View>
              )}
            </View>
            
            {allImages.length > 1 && (
              <View style={styles.thumbnailsContainer}>
                {allImages.map((image, index) => (
                  <TouchableOpacity 
                    key={index} 
                    onPress={() => setCurrentImageIndex(index)} 
                    style={[
                      styles.thumbnail, 
                      { width: thumbnailSize, height: thumbnailSize },
                      index === currentImageIndex && styles.thumbnailActive
                    ]}
                  >
                    <Image source={{ uri: image }} style={styles.thumbnailImage} contentFit="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Colonne Droite - Infos */}
          <View style={[styles.infoColumn, { paddingVertical: isTwoColumnLayout ? 0 : spacing.lg }]}>
            <Text style={[styles.productName, { fontSize: productNameSize, lineHeight: productNameSize * 1.2 }]}>{product.name}</Text>
            
            {product.description && (
              <Text style={[styles.productDescription, { fontSize: descriptionSize, lineHeight: descriptionSize * 1.5 }]}>{product.description}</Text>
            )}

            {/* Attributs en grille */}
            <View style={[styles.attributesGrid, { gap: isMobileView ? spacing.xl : spacing.xxl }]}>
              {product.ambiance && (
                <View style={styles.attribute}>
                  <Text style={[styles.attributeLabel, { fontSize: isMobileView ? 14 : 16 }]}>Ambiance</Text>
                  <Text style={styles.attributeValue}>{product.ambiance}</Text>
                </View>
              )}
              {product.color && (
                <View style={styles.attribute}>
                  <Text style={[styles.attributeLabel, { fontSize: isMobileView ? 14 : 16 }]}>Couleur</Text>
                  <Text style={styles.attributeValue}>{product.color}</Text>
                </View>
              )}
            </View>
            {product.materials && (
              <View style={styles.attributeFull}>
                <Text style={[styles.attributeLabel, { fontSize: isMobileView ? 14 : 16 }]}>Matière</Text>
                <Text style={styles.attributeValue}>{product.materials}</Text>
              </View>
            )}

            {/* Informations Techniques */}
            {(product.dimensions || product.weight) && (
              <View style={[styles.technicalSection, { padding: isMobileView ? spacing.lg : spacing.xl }]}>
                <Text style={[styles.technicalTitle, { fontSize: sectionTitleSize }]}>Informations Techniques</Text>
                {product.dimensions && (
                  <View style={styles.technicalRow}>
                    <Text style={[styles.technicalLabel, { fontSize: isMobileView ? 14 : 16 }]}>Dimensions</Text>
                    <Text style={styles.technicalValue}>{product.dimensions}</Text>
                  </View>
                )}
                {product.weight && (
                  <View style={styles.technicalRow}>
                    <Text style={[styles.technicalLabel, { fontSize: isMobileView ? 14 : 16 }]}>Poids</Text>
                    <Text style={styles.technicalValue}>{product.weight}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Informations Complémentaires */}
            {product.additional_info && (
              <View style={styles.additionalSection}>
                <Text style={[styles.additionalTitle, { fontSize: isMobileView ? 14 : 16 }]}>Informations Complémentaires</Text>
                <Text style={styles.additionalText}>{product.additional_info}</Text>
              </View>
            )}

            {/* Ajouter au panier */}
            <View style={styles.addToCartSection}>
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={[styles.quantityButton, { width: isMobileView ? 44 : 50, height: isMobileView ? 44 : 50 }]} 
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <TextInput 
                  style={[styles.quantityInput, { width: isMobileView ? 50 : 60, height: isMobileView ? 44 : 50 }]} 
                  value={quantity.toString()} 
                  onChangeText={(t) => setQuantity(Math.max(1, parseInt(t) || 1))} 
                  keyboardType="number-pad" 
                />
                <TouchableOpacity 
                  style={[styles.quantityButton, { width: isMobileView ? 44 : 50, height: isMobileView ? 44 : 50 }]} 
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.addToCartButton, 
                  { 
                    height: isMobileView ? 44 : 50,
                    borderRadius: isMobileView ? 4 : 30,
                  }
                ]} 
                onPress={handleAddToCart}
              >
                <Ionicons name="cart-outline" size={20} color={colors.textOnDark} />
                <Text style={[styles.addToCartText, { fontSize: isMobileView ? 14 : 16 }]}>Ajouter au panier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Produits similaires */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={[styles.relatedHeader, { paddingHorizontal: contentPadding }]}>
              <Text style={[styles.relatedTitle, { fontSize: relatedTitleSize }]}>Vous aimerez aussi</Text>
              {isWeb && (
                <View style={styles.relatedNavButtons}>
                  <TouchableOpacity style={styles.relatedNavButton} onPress={handleRelatedScrollLeft} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.relatedNavButton} onPress={handleRelatedScrollRight} activeOpacity={0.7}>
                    <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <ScrollView 
              ref={relatedScrollRef}
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={[styles.relatedScroll, { paddingHorizontal: contentPadding, gap: relatedCardSpacing }]}
              onScroll={handleRelatedScroll}
              scrollEventThrottle={16}
            >
              {relatedProducts.map((item) => (
                <TouchableOpacity key={item.id} style={[styles.relatedCard, { width: relatedCardWidth }]} onPress={() => navigateToProduct(item.id)}>
                  <Image source={{ uri: getValidImageUrl(item.product_image || item.image_url) }} style={styles.relatedImage} contentFit="cover" />
                  <Text style={[styles.relatedName, { fontSize: isWeb ? 22 : 18 }]} numberOfLines={2}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Footer />
      </ScrollView>

      {/* Modal confirmation */}
      <Modal visible={showAddedModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Bouton fermer */}
            <TouchableOpacity style={styles.modalCloseButton} onPress={handleContinueShopping}>
              <Ionicons name="close" size={28} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Icône check */}
            <View style={styles.modalCheckCircle}>
              <Ionicons name="checkmark" size={40} color="#22C55E" />
            </View>

            {/* Titre */}
            <Text style={styles.modalTitle}>Produit ajouté au panier</Text>

            {/* Produit */}
            {product && (
              <View style={styles.modalProductCard}>
                <Image 
                  source={{ uri: getValidImageUrl(product.product_image || product.image_url) }} 
                  style={styles.modalProductImage} 
                  contentFit="cover" 
                />
                <View style={styles.modalProductInfo}>
                  <Text style={styles.modalProductName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.modalProductQuantity}>Quantité : {quantity}</Text>
                </View>
              </View>
            )}

            {/* Boutons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonOutline} onPress={handleContinueShopping}>
                <Text style={styles.modalButtonOutlineText}>Continuer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonFilled} onPress={handleGoToCart}>
                <Text style={styles.modalButtonFilledText}>Voir le panier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  emptyText: { fontSize: 16, color: colors.textMuted, marginBottom: spacing.lg },
  backButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderWidth: 2, borderColor: colors.borderStrong },
  backButtonText: { fontWeight: '700', color: colors.textPrimary },

  // Breadcrumb
  breadcrumb: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: spacing.md, 
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexWrap: 'wrap',
  },
  breadcrumbItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breadcrumbLink: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textSecondary },
  breadcrumbSeparator: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textMuted, marginHorizontal: 4 },
  breadcrumbCurrent: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },

  // Layout principal
  mainLayout: {},

  // Galerie
  galleryColumn: { 
    width: '100%',
  },
  galleryContainer: { 
    position: 'relative', 
    width: '100%', 
    aspectRatio: 1, 
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainImage: { width: '100%', height: '100%' },
  imageDots: { 
    position: 'absolute', 
    bottom: spacing.lg, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    width: '100%', 
    gap: spacing.sm,
  },
  imageDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  imageDotActive: { 
    backgroundColor: colors.textOnDark, 
    width: 32,
  },
  thumbnailsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    paddingVertical: spacing.lg, 
    gap: spacing.md,
  },
  thumbnail: { 
    borderRadius: 16, 
    overflow: 'hidden', 
    borderWidth: 3, 
    borderColor: 'transparent',
    backgroundColor: colors.surfaceMuted,
  },
  thumbnailActive: { 
    borderColor: colors.textPrimary,
  },
  thumbnailImage: { 
    width: '100%', 
    height: '100%',
  },

  // Infos produit
  infoColumn: { 
    flex: 1,
  },
  productName: { 
    fontFamily: fontFamilies.display, 
    color: colors.textPrimary, 
    marginBottom: spacing.lg,
  },
  productDescription: { 
    fontFamily: fontFamilies.body,
    color: colors.textSecondary, 
    marginBottom: spacing.xl,
  },

  // Attributs
  attributesGrid: { 
    flexDirection: 'row', 
    marginBottom: spacing.lg,
  },
  attribute: { 
    flex: 1,
  },
  attributeFull: {
    marginBottom: spacing.xl,
  },
  attributeLabel: { 
    fontFamily: fontFamilies.display,
    color: colors.textMuted, 
    marginBottom: spacing.xs,
  },
  attributeValue: { 
    fontFamily: fontFamilies.body,
    fontSize: 16, 
    color: colors.textPrimary, 
    fontWeight: '500',
  },

  // Infos techniques
  technicalSection: { 
    backgroundColor: colors.surfaceMuted, 
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  technicalTitle: { 
    fontFamily: fontFamilies.display, 
    color: colors.textPrimary, 
    marginBottom: spacing.md,
  },
  technicalRow: { 
    paddingVertical: spacing.sm,
  },
  technicalLabel: { 
    fontFamily: fontFamilies.display,
    color: colors.textMuted,
    marginBottom: spacing.xxs,
  },
  technicalValue: { 
    fontFamily: fontFamilies.body,
    fontSize: 16, 
    color: colors.textPrimary, 
    fontWeight: '500',
  },

  // Infos complémentaires
  additionalSection: {
    marginBottom: spacing.xl,
  },
  additionalTitle: { 
    fontFamily: fontFamilies.display,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  additionalText: { 
    fontFamily: fontFamilies.body,
    fontSize: 16, 
    lineHeight: 24,
    color: colors.textPrimary,
  },

  // Ajouter au panier
  addToCartSection: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: spacing.md, 
    paddingTop: spacing.lg,
  },
  quantitySelector: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: colors.borderSubtle,
  },
  quantityButton: { 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  quantityButtonText: { 
    fontSize: 20, 
    color: colors.textPrimary, 
    fontWeight: '300',
  },
  quantityInput: { 
    textAlign: 'center', 
    fontSize: 16, 
    fontWeight: '500', 
    color: colors.textPrimary, 
    borderLeftWidth: 1, 
    borderRightWidth: 1, 
    borderColor: colors.borderSubtle,
  },
  addToCartButton: { 
    flex: 1, 
    flexDirection: 'row',
    backgroundColor: colors.textPrimary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  addToCartText: { 
    fontFamily: fontFamilies.body,
    fontWeight: '600', 
    color: colors.textOnDark, 
    letterSpacing: 0.5,
  },

  // Produits similaires
  relatedSection: { 
    paddingVertical: spacing.xxl, 
    backgroundColor: colors.surfaceMuted,
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  relatedTitle: { 
    fontFamily: fontFamilies.display, 
    color: colors.textPrimary, 
  },
  relatedNavButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  relatedNavButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  relatedScroll: {},
  relatedCard: { 
    backgroundColor: colors.background,
    ...shadows.card,
  },
  relatedImage: { 
    width: '100%', 
    aspectRatio: 3 / 4,
    overflow: 'hidden',
  },
  relatedName: { 
    fontFamily: fontFamilies.display,
    color: colors.textPrimary, 
    padding: isWeb ? 20 : spacing.md,
  },

  // Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: { 
    backgroundColor: colors.background, 
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCheckCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.xl,
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  modalProductInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  modalProductName: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalProductQuantity: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButtonOutline: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalButtonOutlineText: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  modalButtonFilled: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.textPrimary,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalButtonFilledText: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnDark,
  },
});
