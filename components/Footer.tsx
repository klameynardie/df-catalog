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

  const columnWidth = isWeb ? 200 : (screenWidth - spacing.lg * 2) / 2;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => Linking.openURL('https://deco-flamme.com')} style={styles.logoContainer}>
        <Image source={require('@/assets/images/logo-df-white.png')} style={styles.logo} contentFit="contain" />
      </TouchableOpacity>

      <Text style={styles.tagline}>Location, décoration et création d'espaces éphémères</Text>

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

      <TouchableOpacity onPress={() => Linking.openURL('https://deco-flamme.com')} style={styles.websiteLink}>
        <Text style={styles.websiteLinkText}>Visitez deco-flamme.com</Text>
      </TouchableOpacity>

      <View style={styles.socialContainer}>
        {socialLinks.map((link) => (
          <TouchableOpacity key={link.name} style={styles.socialButton} onPress={() => Linking.openURL(link.url)}>
            <Ionicons name={link.icon} size={24} color={colors.textOnDark} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />
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
  logo: { width: isWeb ? 200 : 140, height: isWeb ? 70 : 50 },
  tagline: { 
    fontFamily: fontFamilies.body, 
    fontSize: isWeb ? 15 : 13, 
    color: colors.textOnDark, 
    textAlign: 'center', 
    marginBottom: isWeb ? spacing.xxl : spacing.xl,
  },
  categoriesSection: {
    width: '100%',
    maxWidth: 900,
    marginBottom: isWeb ? spacing.xxl : spacing.xl,
    alignItems: 'center',
  },
  categoriesTitle: {
    fontFamily: fontFamilies.display,
    fontSize: isWeb ? 13 : 11,
    color: colors.textOnDark,
    opacity: 0.5,
    letterSpacing: 3,
    marginBottom: isWeb ? spacing.xl : spacing.lg,
    textAlign: 'center',
  },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  categoryLink: { paddingVertical: spacing.sm, alignItems: 'center' },
  categoryText: { fontFamily: fontFamilies.body, fontSize: isWeb ? 14 : 13, color: colors.textOnDark, textAlign: 'center' },
  websiteLink: { marginBottom: isWeb ? spacing.xl : spacing.lg },
  websiteLinkText: { fontFamily: fontFamilies.body, fontSize: isWeb ? 14 : 13, color: colors.textOnDark, textDecorationLine: 'underline' },
  socialContainer: { flexDirection: 'row', gap: isWeb ? spacing.lg : spacing.md, marginBottom: isWeb ? spacing.xxl : spacing.xl },
  socialButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  divider: { width: '100%', height: 1, backgroundColor: colors.brandPrimary, marginBottom: spacing.lg },
  copyright: { fontFamily: fontFamilies.body, fontSize: 11, color: colors.textOnDark, opacity: 0.5, textAlign: 'center' },
});
