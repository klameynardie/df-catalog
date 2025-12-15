import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator, Platform, Modal } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { colors, spacing, fontFamilies } from '@/constants/theme';
import { fetchCategoryBySlug, fetchSubcategories, fetchProductsByCategory, fetchFilterOptions, type Category, type Subcategory, type Product, type Ambiance, type Color, type Material } from '@/lib/supabase';
import { navigateToProduct, navigateToSubcategory, navigateToHome } from '@/lib/navigation';

const isWeb = Platform.OS === 'web';
const SIDEBAR_WIDTH = 280;
const CONTENT_PADDING = isWeb ? 48 : spacing.lg;
const PRODUCT_GAP = isWeb ? 24 : spacing.md;

const DEFAULT_IMAGE = 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800';

const getProductImage = (product: Product): string => {
  const url = product.product_image || product.image_url;
  if (url && url.trim() !== '' && url.startsWith('http')) return url;
  return DEFAULT_IMAGE;
};

export default function CategoryPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calcul dynamique de la largeur des cards
  const getProductCardWidth = () => {
    if (!isWeb) {
      return (screenWidth - CONTENT_PADDING * 2 - PRODUCT_GAP) / 2;
    }
    // Desktop: 3 colonnes (zone contenu = écran - sidebar - paddings - gap entre sidebar et contenu)
    const contentWidth = screenWidth - SIDEBAR_WIDTH - CONTENT_PADDING * 2 - spacing.xl;
    return (contentWidth - PRODUCT_GAP * 2) / 3;
  };
  
  const productCardWidth = getProductCardWidth();
  
  // Filtres
  const [ambiances, setAmbiances] = useState<Ambiance[]>([]);
  const [colorsList, setColorsList] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedAmbiance, setSelectedAmbiance] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [expandedFilter, setExpandedFilter] = useState<string | null>(isWeb ? 'ambiance' : null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useEffect(() => {
    if (slug) loadData();
  }, [slug]);

  useEffect(() => {
    applyFilters();
  }, [products, selectedAmbiance, selectedColor, selectedMaterial]);

  const loadData = async () => {
    const cat = await fetchCategoryBySlug(slug!);
    if (cat) {
      setCategory(cat);
      const [subs, prods, filters] = await Promise.all([
        fetchSubcategories(cat.id),
        fetchProductsByCategory(cat.id),
        fetchFilterOptions(),
      ]);
      setSubcategories(subs);
      setProducts(prods);
      setFilteredProducts(prods);
      setAmbiances(filters.ambiances);
      setColorsList(filters.colors);
      setMaterials(filters.materials);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...products];
    if (selectedAmbiance) filtered = filtered.filter(p => p.ambiance === selectedAmbiance);
    if (selectedColor) filtered = filtered.filter(p => p.color === selectedColor);
    if (selectedMaterial) filtered = filtered.filter(p => p.materials?.includes(selectedMaterial));
    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSelectedAmbiance(null);
    setSelectedColor(null);
    setSelectedMaterial(null);
  };

  const hasActiveFilters = selectedAmbiance || selectedColor || selectedMaterial;

  const toggleFilter = (filterName: string) => {
    setExpandedFilter(expandedFilter === filterName ? null : filterName);
  };

  const renderFilterSection = (title: string, filterKey: string, options: { id: string; name: string }[], selected: string | null, onSelect: (val: string | null) => void) => (
    <View style={styles.filterSection}>
      <TouchableOpacity style={styles.filterHeader} onPress={() => toggleFilter(filterKey)}>
        <Text style={styles.filterTitle}>{title}</Text>
        <Ionicons name={expandedFilter === filterKey ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textPrimary} />
      </TouchableOpacity>
      {expandedFilter === filterKey && (
        <View style={styles.filterOptions}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.filterOption, selected === opt.name && styles.filterOptionActive]}
              onPress={() => onSelect(selected === opt.name ? null : opt.name)}
            >
              <Text style={[styles.filterOptionText, selected === opt.name && styles.filterOptionTextActive]}>{opt.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderProductCard = (item: Product) => (
    <TouchableOpacity key={item.id} style={[styles.productCard, { width: productCardWidth }]} onPress={() => navigateToProduct(item.id)} activeOpacity={0.9}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: getProductImage(item) }} style={styles.productImage} contentFit="cover" transition={200} />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.productTags}>
          {item.ambiance && <View style={styles.tag}><Text style={styles.tagText}>{item.ambiance}</Text></View>}
          {item.color && <View style={styles.tag}><Text style={styles.tagText}>{item.color}</Text></View>}
        </View>
        {item.materials && <View style={styles.tag}><Text style={styles.tagText}>{item.materials}</Text></View>}
      </View>
    </TouchableOpacity>
  );

  if (loading) return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.textPrimary} /></SafeAreaView>;
  if (!category) return <SafeAreaView style={styles.container}><Header showBack title="Catégorie" /><View style={styles.emptyContainer}><Text>Catégorie non trouvée</Text></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header showBack={!isWeb} title={isWeb ? undefined : category.name} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={navigateToHome} style={styles.breadcrumbItem}>
            <Ionicons name="home-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.breadcrumbLink}>Accueil</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSeparator}>›</Text>
          <Text style={styles.breadcrumbCurrent}>{category.name}</Text>
        </View>

        {/* Sous-catégories */}
        {subcategories.length > 0 && (
          <View style={styles.subcategoriesSection}>
            <Text style={styles.sectionTitle}>Sous-catégories</Text>
            <View style={styles.subcategoriesGrid}>
              {subcategories.map((sub) => (
                <TouchableOpacity key={sub.id} style={styles.subcategoryChip} onPress={() => navigateToSubcategory(slug!, sub.slug)}>
                  <Text style={styles.subcategoryText}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Layout principal : Filtres + Produits */}
        <View style={styles.mainLayout}>
          {/* Sidebar Filtres (Desktop) */}
          {isWeb && (
            <View style={styles.sidebar}>
              <Text style={styles.sectionTitle}>Filtres</Text>
              {hasActiveFilters && (
                <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Effacer les filtres</Text>
                </TouchableOpacity>
              )}
              {renderFilterSection('Ambiance', 'ambiance', ambiances, selectedAmbiance, setSelectedAmbiance)}
              {renderFilterSection('Couleur', 'color', colorsList, selectedColor, setSelectedColor)}
              {renderFilterSection('Matière', 'material', materials, selectedMaterial, setSelectedMaterial)}
            </View>
          )}

          {/* Grille Produits */}
          <View style={styles.productsSection}>
            <View style={styles.productsHeader}>
              <Text style={styles.productsCount}>{filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}</Text>
              {!isWeb && (
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFiltersModal(true)}>
                  <Ionicons name="options-outline" size={18} color={colors.textPrimary} />
                  <Text style={styles.filterButtonText}>Filtres</Text>
                  {hasActiveFilters && <View style={styles.filterBadge} />}
                </TouchableOpacity>
              )}
            </View>
            
            {filteredProducts.length > 0 ? (
              <View style={styles.productsGrid}>
                {filteredProducts.map(renderProductCard)}
              </View>
            ) : (
              <View style={styles.emptyProducts}>
                <Text style={styles.emptyText}>Aucun produit trouvé</Text>
                {hasActiveFilters && (
                  <TouchableOpacity style={styles.clearFiltersButtonAlt} onPress={clearFilters}>
                    <Text style={styles.clearFiltersTextAlt}>Effacer les filtres</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        <Footer />
      </ScrollView>

      {/* Modal Filtres Mobile */}
      <Modal visible={showFiltersModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.filterModalContainer}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filtres</Text>
            <TouchableOpacity onPress={() => setShowFiltersModal(false)} style={styles.filterModalClose}>
              <Ionicons name="close" size={28} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterModalScroll}>
            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearFiltersMobile} onPress={clearFilters}>
                <Ionicons name="refresh-outline" size={18} color={colors.brandPrimary} />
                <Text style={styles.clearFiltersMobileText}>Effacer tous les filtres</Text>
              </TouchableOpacity>
            )}
            
            {renderFilterSection('Ambiance', 'ambiance', ambiances, selectedAmbiance, setSelectedAmbiance)}
            {renderFilterSection('Couleur', 'color', colorsList, selectedColor, setSelectedColor)}
            {renderFilterSection('Matière', 'material', materials, selectedMaterial, setSelectedMaterial)}
          </ScrollView>

          <View style={styles.filterModalFooter}>
            <TouchableOpacity 
              style={styles.applyFiltersButton} 
              onPress={() => setShowFiltersModal(false)}
            >
              <Text style={styles.applyFiltersText}>
                Voir {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  
  // Breadcrumb
  breadcrumb: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: CONTENT_PADDING, 
    paddingVertical: spacing.md, 
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  breadcrumbItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breadcrumbLink: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textSecondary },
  breadcrumbSeparator: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textMuted, marginHorizontal: 4 },
  breadcrumbCurrent: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },

  // Sous-catégories
  subcategoriesSection: { 
    paddingHorizontal: CONTENT_PADDING, 
    paddingVertical: isWeb ? spacing.xl : spacing.lg,
  },
  sectionTitle: { 
    fontFamily: fontFamilies.display, 
    fontSize: isWeb ? 28 : 22, 
    color: colors.textPrimary, 
    marginBottom: spacing.lg,
  },
  subcategoriesGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: spacing.md,
  },
  subcategoryChip: { 
    paddingHorizontal: isWeb ? spacing.xl : spacing.md, 
    paddingVertical: isWeb ? spacing.md : spacing.sm, 
    borderWidth: 1, 
    borderColor: colors.borderSubtle,
    backgroundColor: colors.background,
  },
  subcategoryText: { 
    fontFamily: fontFamilies.body,
    fontSize: isWeb ? 16 : 14, 
    fontWeight: '500', 
    color: colors.textPrimary,
  },

  // Layout principal
  mainLayout: { 
    flexDirection: isWeb ? 'row' : 'column', 
    paddingHorizontal: CONTENT_PADDING,
    paddingBottom: spacing.xxl,
  },

  // Sidebar Filtres
  sidebar: { 
    width: SIDEBAR_WIDTH, 
    paddingRight: spacing.xl,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
  },
  filterSection: { 
    borderBottomWidth: 1, 
    borderBottomColor: colors.borderSubtle,
    paddingVertical: spacing.md,
  },
  filterHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  filterTitle: { 
    fontFamily: fontFamilies.body,
    fontSize: 16, 
    fontWeight: '600', 
    color: colors.textPrimary,
  },
  filterOptions: { 
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  filterOption: { 
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
  },
  filterOptionActive: { 
    backgroundColor: colors.surfaceMuted,
  },
  filterOptionText: { 
    fontFamily: fontFamilies.body,
    fontSize: 14, 
    color: colors.textSecondary,
  },
  filterOptionTextActive: { 
    color: colors.textPrimary,
    fontWeight: '500',
  },
  clearFiltersButton: { 
    marginBottom: spacing.md,
  },
  clearFiltersText: { 
    fontFamily: fontFamilies.body,
    fontSize: 14, 
    color: colors.brandPrimary,
    textDecorationLine: 'underline',
  },

  // Produits
  productsSection: { 
    flex: 1,
    paddingLeft: isWeb ? spacing.xl : 0,
  },
  productsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  productsCount: { 
    fontFamily: fontFamilies.body,
    fontSize: 14, 
    color: colors.textMuted,
  },
  productsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: PRODUCT_GAP,
  },
  productCard: { 
    backgroundColor: colors.background,
    marginBottom: PRODUCT_GAP,
  },
  productImageContainer: { 
    width: '100%', 
    aspectRatio: isWeb ? 4 / 5 : 3 / 4, 
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  productImage: { width: '100%', height: '100%' },
  productInfo: { paddingVertical: spacing.md },
  productName: { 
    fontFamily: fontFamilies.display, 
    fontSize: isWeb ? 20 : 16, 
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  productTags: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  tag: { 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xxs, 
    borderWidth: 1, 
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  tagText: { 
    fontFamily: fontFamilies.body,
    fontSize: 12, 
    color: colors.textSecondary,
  },

  // Empty state
  emptyProducts: { 
    paddingVertical: spacing.xxl, 
    alignItems: 'center',
  },
  emptyText: { 
    fontSize: 16, 
    color: colors.textMuted, 
    marginBottom: spacing.md,
  },
  clearFiltersButtonAlt: { 
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.sm, 
    borderWidth: 2, 
    borderColor: colors.borderStrong,
  },
  clearFiltersTextAlt: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: colors.textPrimary,
  },

  // Bouton Filtres Mobile
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 4,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandPrimary,
  },

  // Modal Filtres Mobile
  filterModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  filterModalTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 24,
    color: colors.textPrimary,
  },
  filterModalClose: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalScroll: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  clearFiltersMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  clearFiltersMobileText: {
    fontSize: 14,
    color: colors.brandPrimary,
    fontWeight: '500',
  },
  filterModalFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  applyFiltersButton: {
    backgroundColor: colors.textPrimary,
    paddingVertical: spacing.md,
    borderRadius: 4,
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textOnDark,
    letterSpacing: 1,
  },
});
