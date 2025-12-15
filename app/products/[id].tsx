import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { colors, spacing, fontFamilies } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { fetchProductById, fetchRelatedProducts, type Product } from '@/lib/supabase';
import { navigateToProduct, navigateToHome, navigateToCategory, navigateToCart, goBack } from '@/lib/navigation';

const isWeb = Platform.OS === 'web';
const CONTENT_PADDING = isWeb ? 48 : spacing.lg;
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800';

const getValidImageUrl = (url: string | undefined | null): string => {
  if (url && url.trim() !== '' && url.startsWith('http')) return url;
  return DEFAULT_IMAGE;
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

  // Calculs responsive
  const galleryWidth = isWeb ? Math.min(screenWidth * 0.45, 600) : screenWidth;
  const thumbnailSize = isWeb ? 100 : 64;

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const data = await fetchProductById(id!);
    if (data) {
      setProduct(data);
      const related = await fetchRelatedProducts(data.category_id, data.id, 6);
      setRelatedProducts(related);
    }
    setLoading(false);
  };

  const getAllImages = (): string[] => {
    if (!product) return [];
    const images: string[] = [];
    images.push(getValidImageUrl(product.product_image || product.image_url));
    if (product.ambient_images) {
      product.ambient_images.forEach(img => {
        const validUrl = getValidImageUrl(img);
        if (validUrl !== DEFAULT_IMAGE) images.push(validUrl);
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
        <View style={styles.breadcrumb}>
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
        <View style={styles.mainLayout}>
          {/* Colonne Gauche - Galerie */}
          <View style={[styles.galleryColumn, isWeb && { width: galleryWidth }]}>
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
          <View style={styles.infoColumn}>
            <Text style={styles.productName}>{product.name}</Text>
            
            {product.description && (
              <Text style={styles.productDescription}>{product.description}</Text>
            )}

            {/* Attributs en grille */}
            <View style={styles.attributesGrid}>
              {product.ambiance && (
                <View style={styles.attribute}>
                  <Text style={styles.attributeLabel}>Ambiance</Text>
                  <Text style={styles.attributeValue}>{product.ambiance}</Text>
                </View>
              )}
              {product.color && (
                <View style={styles.attribute}>
                  <Text style={styles.attributeLabel}>Couleur</Text>
                  <Text style={styles.attributeValue}>{product.color}</Text>
                </View>
              )}
            </View>
            {product.materials && (
              <View style={styles.attributeFull}>
                <Text style={styles.attributeLabel}>Matière</Text>
                <Text style={styles.attributeValue}>{product.materials}</Text>
              </View>
            )}

            {/* Informations Techniques */}
            {(product.dimensions || product.weight) && (
              <View style={styles.technicalSection}>
                <Text style={styles.technicalTitle}>Informations Techniques</Text>
                {product.dimensions && (
                  <View style={styles.technicalRow}>
                    <Text style={styles.technicalLabel}>Dimensions</Text>
                    <Text style={styles.technicalValue}>{product.dimensions}</Text>
                  </View>
                )}
                {product.weight && (
                  <View style={styles.technicalRow}>
                    <Text style={styles.technicalLabel}>Poids</Text>
                    <Text style={styles.technicalValue}>{product.weight}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Informations Complémentaires */}
            {product.additional_info && (
              <View style={styles.additionalSection}>
                <Text style={styles.additionalTitle}>Informations Complémentaires</Text>
                <Text style={styles.additionalText}>{product.additional_info}</Text>
              </View>
            )}

            {/* Ajouter au panier */}
            <View style={styles.addToCartSection}>
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={styles.quantityButton} 
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <TextInput 
                  style={styles.quantityInput} 
                  value={quantity.toString()} 
                  onChangeText={(t) => setQuantity(Math.max(1, parseInt(t) || 1))} 
                  keyboardType="number-pad" 
                />
                <TouchableOpacity 
                  style={styles.quantityButton} 
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                <Ionicons name="cart-outline" size={20} color={colors.textOnDark} />
                <Text style={styles.addToCartText}>Ajouter au panier</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Produits similaires */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Vous aimerez aussi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
              {relatedProducts.map((item) => (
                <TouchableOpacity key={item.id} style={styles.relatedCard} onPress={() => navigateToProduct(item.id)}>
                  <Image source={{ uri: getValidImageUrl(item.product_image || item.image_url) }} style={styles.relatedImage} contentFit="cover" />
                  <Text style={styles.relatedName} numberOfLines={2}>{item.name}</Text>
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
    paddingHorizontal: CONTENT_PADDING, 
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
  mainLayout: { 
    flexDirection: isWeb ? 'row' : 'column',
    paddingHorizontal: CONTENT_PADDING,
    paddingVertical: isWeb ? spacing.xl : 0,
    gap: isWeb ? spacing.xxl : 0,
  },

  // Galerie
  galleryColumn: { 
    width: isWeb ? undefined : '100%',
  },
  galleryContainer: { 
    position: 'relative', 
    width: '100%', 
    aspectRatio: 1, 
    backgroundColor: colors.surfaceMuted,
  },
  mainImage: { width: '100%', height: '100%' },
  imageDots: { 
    position: 'absolute', 
    bottom: spacing.md, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    width: '100%', 
    gap: spacing.xs,
  },
  imageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  imageDotActive: { backgroundColor: colors.textOnDark, width: 24 },
  thumbnailsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    paddingVertical: spacing.md, 
    gap: spacing.sm,
  },
  thumbnail: { 
    borderRadius: 4, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: 'transparent',
  },
  thumbnailActive: { borderColor: colors.textPrimary },
  thumbnailImage: { width: '100%', height: '100%' },

  // Infos produit
  infoColumn: { 
    flex: 1,
    paddingVertical: isWeb ? 0 : spacing.lg,
  },
  productName: { 
    fontFamily: fontFamilies.display, 
    fontSize: isWeb ? 40 : 28, 
    lineHeight: isWeb ? 48 : 34,
    color: colors.textPrimary, 
    marginBottom: spacing.lg,
  },
  productDescription: { 
    fontFamily: fontFamilies.body,
    fontSize: isWeb ? 18 : 16, 
    lineHeight: isWeb ? 28 : 24, 
    color: colors.textSecondary, 
    marginBottom: spacing.xl,
  },

  // Attributs
  attributesGrid: { 
    flexDirection: 'row', 
    gap: isWeb ? spacing.xxl : spacing.xl,
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
    fontSize: isWeb ? 16 : 14, 
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
    padding: isWeb ? spacing.xl : spacing.lg, 
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  technicalTitle: { 
    fontFamily: fontFamilies.display, 
    fontSize: isWeb ? 22 : 18, 
    color: colors.textPrimary, 
    marginBottom: spacing.md,
  },
  technicalRow: { 
    paddingVertical: spacing.sm,
  },
  technicalLabel: { 
    fontFamily: fontFamilies.display,
    fontSize: isWeb ? 16 : 14, 
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
    fontSize: isWeb ? 16 : 14, 
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
    width: isWeb ? 50 : 44, 
    height: isWeb ? 50 : 44, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  quantityButtonText: { 
    fontSize: 20, 
    color: colors.textPrimary, 
    fontWeight: '300',
  },
  quantityInput: { 
    width: isWeb ? 60 : 50, 
    height: isWeb ? 50 : 44, 
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
    height: isWeb ? 50 : 44,
    borderRadius: isWeb ? 30 : 4,
  },
  addToCartText: { 
    fontFamily: fontFamilies.body,
    fontSize: isWeb ? 16 : 14,
    fontWeight: '600', 
    color: colors.textOnDark, 
    letterSpacing: 0.5,
  },

  // Produits similaires
  relatedSection: { 
    paddingVertical: spacing.xxl, 
    backgroundColor: colors.surfaceMuted,
  },
  relatedTitle: { 
    fontFamily: fontFamilies.display, 
    fontSize: isWeb ? 32 : 24, 
    color: colors.textPrimary, 
    paddingHorizontal: CONTENT_PADDING, 
    marginBottom: spacing.lg,
  },
  relatedScroll: { 
    paddingHorizontal: CONTENT_PADDING, 
    gap: isWeb ? spacing.lg : spacing.md,
  },
  relatedCard: { 
    width: isWeb ? 200 : 140, 
    backgroundColor: colors.background,
  },
  relatedImage: { 
    width: '100%', 
    aspectRatio: 3 / 4,
  },
  relatedName: { 
    fontFamily: fontFamilies.display,
    fontSize: isWeb ? 16 : 14, 
    color: colors.textPrimary, 
    padding: spacing.sm,
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
