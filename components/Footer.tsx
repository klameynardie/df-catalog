import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontFamilies } from '@/constants/theme';
import { supabase, type Category } from '@/lib/supabase';
import { navigateToCategory } from '@/lib/navigation';

const isWeb = Platform.OS === 'web';

const socialLinks = [
  { name: 'Instagram', icon: 'logo-instagram' as const, url: 'https://instagram.com/decoflamme' },
  { name: 'Facebook', icon: 'logo-facebook' as const, url: 'https://facebook.com/decoflamme' },
  { name: 'YouTube', icon: 'logo-youtube' as const, url: 'https://youtube.com/decoflamme' },
  { name: 'LinkedIn', icon: 'logo-linkedin' as const, url: 'https://linkedin.com/company/decoflamme' },
];

export default function Footer() {
  const { width: screenWidth } = useWindowDimensions();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const numColumns = isWeb ? 4 : 2;
  const columnWidth = isWeb ? 200 : (screenWidth - spacing.lg * 2) / 2;

  return (
    <View style={styles.container}>
      {/* Logo */}
      <TouchableOpacity onPress={() => Linking.openURL('https://deco-flamme.com')} style={styles.logoContainer}>
        <Image source={require('@/assets/images/logo-df-white.png')} style={styles.logo} contentFit="contain" />
      </TouchableOpacity>

      {/* Tagline */}
      <Text style={styles.tagline}>Location, décoration et création d'espaces éphémères</Text>

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <Text style={styles.categoriesTitle}>NOS CATÉGORIES</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity 
              key={category.id} 
              style={[styles.categoryLink, { width: columnWidth }]}
              onPress={() => navigateToCategory(category.slug)}
            >
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Website Link */}
      <TouchableOpacity onPress={() => Linking.openURL('https://deco-flamme.com')} style={styles.websiteLink}>
        <Text style={styles.websiteLinkText}>Visitez deco-flamme.com</Text>
      </TouchableOpacity>

      {/* Social Icons */}
      <View style={styles.socialContainer}>
        {socialLinks.map((link) => (
          <TouchableOpacity key={link.name} style={styles.socialButton} onPress={() => Linking.openURL(link.url)}>
            <Ionicons name={link.icon} size={24} color={colors.textOnDark} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Copyright */}
      <Text style={styles.copyright}>2025 Deco Flamme. Tous droits réservés.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: colors.textPrimary, 
    paddingTop: isWeb ? 80 : spacing.xxl, 
    paddingBottom: isWeb ? 48 : spacing.xl, 
    paddingHorizontal: isWeb ? 80 : spacing.lg, 
    alignItems: 'center',
  },
  logoContainer: { marginBottom: spacing.lg },
  logo: { 
    width: isWeb ? 220 : 160, 
    height: isWeb ? 80 : 60,
  },
  tagline: { 
    fontFamily: fontFamilies.body, 
    fontSize: isWeb ? 18 : 14, 
    color: colors.textOnDark, 
    textAlign: 'center', 
    marginBottom: isWeb ? spacing.xxl : spacing.xl,
  },

  // Categories
  categoriesSection: {
    width: '100%',
    maxWidth: 900,
    marginBottom: isWeb ? spacing.xxl : spacing.xl,
    alignItems: 'center',
  },
  categoriesTitle: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnDark,
    opacity: 0.6,
    letterSpacing: 3,
    marginBottom: isWeb ? spacing.xl : spacing.lg,
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryLink: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  categoryText: {
    fontFamily: fontFamilies.body,
    fontSize: isWeb ? 16 : 14,
    color: colors.textOnDark,
    textAlign: 'center',
  },

  // Website link
  websiteLink: {
    marginBottom: isWeb ? spacing.xl : spacing.lg,
  },
  websiteLinkText: {
    fontFamily: fontFamilies.body,
    fontSize: isWeb ? 16 : 14,
    color: colors.textOnDark,
    textDecorationLine: 'underline',
  },

  // Social
  socialContainer: { 
    flexDirection: 'row', 
    gap: isWeb ? spacing.lg : spacing.md, 
    marginBottom: isWeb ? spacing.xxl : spacing.xl,
  },
  socialButton: { 
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center',
  },

  // Divider & Copyright
  divider: { 
    width: '100%', 
    height: 1, 
    backgroundColor: colors.brandPrimary, 
    marginBottom: spacing.lg,
  },
  copyright: { 
    fontFamily: fontFamilies.body, 
    fontSize: 12, 
    color: colors.textOnDark, 
    opacity: 0.6, 
    textAlign: 'center',
  },
});
