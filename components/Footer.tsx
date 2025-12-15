import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontFamilies } from '@/constants/theme';

const socialLinks = [
  { name: 'Instagram', icon: 'logo-instagram' as const, url: 'https://instagram.com/decoflamme' },
  { name: 'Facebook', icon: 'logo-facebook' as const, url: 'https://facebook.com/decoflamme' },
  { name: 'LinkedIn', icon: 'logo-linkedin' as const, url: 'https://linkedin.com/company/decoflamme' },
];

export default function Footer() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => Linking.openURL('https://deco-flamme.com')} style={styles.logoContainer}>
        <Image source={require('@/assets/images/logo-df-white.png')} style={styles.logo} contentFit="contain" />
      </TouchableOpacity>
      <Text style={styles.tagline}>Location, décoration et création d'espaces éphémères</Text>
      <View style={styles.socialContainer}>
        {socialLinks.map((link) => (
          <TouchableOpacity key={link.name} style={styles.socialButton} onPress={() => Linking.openURL(link.url)}>
            <Ionicons name={link.icon} size={22} color={colors.textOnDark} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.divider} />
      <Text style={styles.copyright}>© 2025 Deco Flamme. Tous droits réservés.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.textPrimary, paddingTop: Platform.OS === 'web' ? 80 : spacing.xxl, paddingBottom: Platform.OS === 'web' ? 48 : spacing.xl, paddingHorizontal: spacing.lg, alignItems: 'center' },
  logoContainer: { marginBottom: spacing.lg },
  logo: { width: Platform.OS === 'web' ? 200 : 140, height: Platform.OS === 'web' ? 80 : 60 },
  tagline: { fontFamily: fontFamilies.body, fontSize: Platform.OS === 'web' ? 16 : 14, color: colors.textOnDark, opacity: 0.8, textAlign: 'center', marginBottom: spacing.xl, maxWidth: 400 },
  socialContainer: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl },
  socialButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  divider: { width: '100%', maxWidth: 400, height: 1, backgroundColor: colors.borderOnDark, marginBottom: spacing.lg },
  copyright: { fontFamily: fontFamilies.body, fontSize: 12, color: colors.textOnDark, opacity: 0.6, textAlign: 'center' },
});

