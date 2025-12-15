import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Image } from 'expo-image';
import { colors, spacing, fontFamilies } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Platform.OS === 'web' ? SCREEN_HEIGHT * 0.85 : SCREEN_WIDTH * 0.75;

const defaultSlides = [
  { id: '1', image: require('@/assets/images/banniere-home-mariage.jpg'), title: 'Le catalogue', subtitle: 'Location, décoration et création d\'espaces éphémères' },
  { id: '2', image: require('@/assets/images/banniere-home-prive.jpg'), title: 'Le catalogue', subtitle: 'Location, décoration et création d\'espaces éphémères' },
];

export default function HeroSlider({ slides = defaultSlides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveIndex((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlide = slides[activeIndex];

  return (
    <View style={styles.container}>
      <Image source={currentSlide.image} style={styles.slideImage} contentFit="cover" transition={500} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
      </View>
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity key={index} onPress={() => setActiveIndex(index)} style={[styles.dot, index === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: HERO_HEIGHT, backgroundColor: colors.textPrimary, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  slideImage: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.35)' },
  content: { 
    alignItems: 'center', 
    paddingHorizontal: Platform.OS === 'web' ? spacing.xxl : spacing.lg, 
    zIndex: 1,
    // Mobile: décaler le contenu vers le bas pour éviter le chevauchement avec le header
    marginTop: Platform.OS === 'web' ? 0 : 40,
  },
  title: { 
    fontFamily: fontFamilies.display, 
    fontSize: Platform.OS === 'web' ? 96 : 44, // Mobile: réduit pour tenir sur une ligne
    lineHeight: Platform.OS === 'web' ? 100 : 50, 
    color: colors.textOnDark, 
    textAlign: 'center', 
    marginBottom: spacing.md, 
    textShadowColor: 'rgba(0,0,0,0.3)', 
    textShadowOffset: { width: 0, height: 2 }, 
    textShadowRadius: 4 
  },
  subtitle: { 
    fontFamily: fontFamilies.body, 
    fontSize: Platform.OS === 'web' ? 16 : 11, 
    lineHeight: Platform.OS === 'web' ? 24 : 18, 
    color: colors.textOnDark, 
    textAlign: 'center', 
    textTransform: 'uppercase', 
    letterSpacing: Platform.OS === 'web' ? 3 : 1.5, 
    opacity: 0.95, 
    // Desktop: assez large pour une ligne, Mobile: étroit pour 2 lignes
    maxWidth: Platform.OS === 'web' ? 700 : 220, 
    textShadowColor: 'rgba(0,0,0,0.3)', 
    textShadowOffset: { width: 0, height: 1 }, 
    textShadowRadius: 2 
  },
  pagination: { position: 'absolute', bottom: spacing.xxl, flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: colors.textOnDark, width: 40 },
});

