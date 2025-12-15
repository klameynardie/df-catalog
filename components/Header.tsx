import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Platform, Animated, Keyboard } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, spacing, fontFamilies } from '@/constants/theme';
import { useCart } from '@/contexts/CartContext';
import { supabase, type Category, type Subcategory, type Product } from '@/lib/supabase';
import { navigateToCategory, navigateToSubcategory, navigateToCart, navigateToHome, navigateToProduct } from '@/lib/navigation';

const HEADER_HEIGHT = Platform.OS === 'web' ? 80 : 64;
const LOGO_HEIGHT = Platform.OS === 'web' ? 50 : 48;
const LOGO_WIDTH = Platform.OS === 'web' ? 180 : 150;
const ICON_SIZE = Platform.OS === 'web' ? 24 : 22;

interface HeaderProps { showBack?: boolean; title?: string; }

export default function Header({ showBack = false, title }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { totalItems } = useCart();
  const searchInputRef = useRef<TextInput>(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMenuData();
  }, []);

  useEffect(() => {
    Animated.timing(searchAnimation, { toValue: searchOpen ? 1 : 0, duration: 250, useNativeDriver: false }).start();
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
    else { setSearchQuery(''); setSearchResults([]); }
  }, [searchOpen]);

  useEffect(() => {
    if (searchQuery.length >= 2) searchProducts();
    else setSearchResults([]);
  }, [searchQuery]);

  const searchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name, image_url, product_image, categories(name)').ilike('name', `%${searchQuery}%`).eq('available', true).limit(8);
    setSearchResults(data || []);
  };

  const loadMenuData = async () => {
    const { data: cat } = await supabase.from('categories').select('*').order('name');
    const { data: sub } = await supabase.from('subcategories').select('*').order('name');
    setCategories(cat || []);
    setSubcategories(sub || []);
  };

  const getCategorySubcategories = (categoryId: string) => subcategories.filter((s) => s.category_id === categoryId);

  const handleCategoryPress = (category: Category) => {
    const subs = getCategorySubcategories(category.id);
    if (subs.length > 0) setExpandedCategory(expandedCategory === category.id ? null : category.id);
    else { setMenuOpen(false); navigateToCategory(category.slug); }
  };

  const searchBarHeight = searchAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 350] });

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.iconButton} onPress={showBack ? () => router.back() : () => setMenuOpen(true)}>
          {showBack ? <Ionicons name="arrow-back" size={ICON_SIZE} color={colors.textPrimary} /> : <Ionicons name="menu" size={ICON_SIZE + 2} color={colors.textPrimary} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoContainer} onPress={navigateToHome}>
          {title ? <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text> : <Image source={require('@/assets/images/logo-df.png')} style={styles.logo} contentFit="contain" />}
        </TouchableOpacity>
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setSearchOpen(!searchOpen)}>
            {searchOpen ? <Ionicons name="close" size={ICON_SIZE} color={colors.textPrimary} /> : <Feather name="search" size={ICON_SIZE} color={colors.textPrimary} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={navigateToCart}>
            <Feather name="shopping-cart" size={ICON_SIZE} color={colors.textPrimary} />
            {totalItems > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{totalItems > 99 ? '99+' : totalItems}</Text></View>}
          </TouchableOpacity>
        </View>
      </View>
      <Animated.View style={[styles.searchPanel, { maxHeight: searchBarHeight }]}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color={colors.textMuted} />
          <TextInput ref={searchInputRef} style={styles.searchInput} placeholder="Rechercher..." placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        {searchQuery.length >= 2 && (
          <ScrollView style={styles.searchResults}>
            {searchResults.length === 0 ? <Text style={styles.searchMessage}>Aucun résultat</Text> : searchResults.map((p) => (
              <TouchableOpacity key={p.id} style={styles.searchResultItem} onPress={() => { setSearchOpen(false); navigateToProduct(p.id); }}>
                <Image source={{ uri: p.product_image || p.image_url }} style={styles.searchResultImage} contentFit="cover" />
                <Text style={styles.searchResultName} numberOfLines={1}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </Animated.View>
      <Modal visible={menuOpen} animationType="slide" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>MENU</Text>
            <TouchableOpacity onPress={() => setMenuOpen(false)}><Ionicons name="close" size={28} color={colors.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView>
            {categories.map((cat) => (
              <View key={cat.id} style={styles.menuItem}>
                <TouchableOpacity style={styles.menuItemRow} onPress={() => handleCategoryPress(cat)}>
                  <Text style={styles.menuItemText}>{cat.name}</Text>
                  {getCategorySubcategories(cat.id).length > 0 && <Ionicons name={expandedCategory === cat.id ? "chevron-down" : "chevron-forward"} size={18} color={colors.textMuted} />}
                </TouchableOpacity>
                {expandedCategory === cat.id && getCategorySubcategories(cat.id).map((sub) => (
                  <TouchableOpacity key={sub.id} style={styles.subcategoryItem} onPress={() => { setMenuOpen(false); navigateToSubcategory(cat.slug, sub.slug); }}>
                    <Text style={styles.subcategoryText}>{sub.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { zIndex: 100 },
  container: { height: HEADER_HEIGHT, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  iconButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { height: LOGO_HEIGHT, width: LOGO_WIDTH },
  headerTitle: { fontFamily: fontFamilies.display, fontSize: 20, color: colors.textPrimary },
  rightActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cartBadge: { position: 'absolute', top: 2, right: 2, backgroundColor: colors.brandPrimary, borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { fontFamily: fontFamilies.body, color: colors.textOnDark, fontSize: 10, fontWeight: '700' },
  searchPanel: { backgroundColor: colors.background, overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', margin: spacing.md, backgroundColor: colors.surfaceMuted, borderRadius: 8, paddingHorizontal: spacing.md },
  searchInput: { fontFamily: fontFamilies.body, flex: 1, height: 48, fontSize: 16, color: colors.textPrimary, marginLeft: spacing.sm },
  searchResults: { maxHeight: 250, marginHorizontal: spacing.md },
  searchMessage: { fontFamily: fontFamilies.body, textAlign: 'center', color: colors.textMuted, paddingVertical: spacing.lg },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  searchResultImage: { width: 50, height: 50, borderRadius: 4 },
  searchResultName: { fontFamily: fontFamilies.body, flex: 1, marginLeft: spacing.md, fontSize: 14, color: colors.textPrimary },
  menuContainer: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'ios' ? 60 : 20 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  menuTitle: { fontFamily: fontFamilies.body, fontSize: 14, fontWeight: '700', letterSpacing: 2, color: colors.textPrimary },
  menuItem: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  menuItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingHorizontal: spacing.lg },
  menuItemText: { fontFamily: fontFamilies.body, fontSize: 16, fontWeight: '500', color: colors.textPrimary },
  subcategoryItem: { paddingVertical: spacing.sm, paddingLeft: spacing.xxl, backgroundColor: colors.surfaceMuted },
  subcategoryText: { fontFamily: fontFamilies.body, fontSize: 14, color: colors.textSecondary },
});

