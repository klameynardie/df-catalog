/**
 * Design System Deco Flamme
 * NT Seawave pour les titres, System pour le corps de texte
 */

// ============================================
// Font Families
// ============================================
export const fontFamilies = {
  display: 'NTSeawave',
  body: 'Gotham-Light',
};

// ============================================
// Colors
// ============================================
export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F7F7',
  overlayDark: 'rgba(0, 0, 0, 0.55)',
  textPrimary: '#111111',
  textSecondary: '#555555',
  textMuted: '#888888',
  textOnDark: '#FFFFFF',
  brandPrimary: '#B11226',
  brandPrimaryDark: '#7E0C1B',
  brandPrimarySoft: '#FBE8EC',
  borderSubtle: '#E0E0E0',
  borderStrong: '#111111',
  borderOnDark: 'rgba(255, 255, 255, 0.5)',
  hover: 'rgba(0, 0, 0, 0.06)',
  pressed: 'rgba(0, 0, 0, 0.12)',
  focusRing: 'rgba(177, 18, 38, 0.5)',
};

// ============================================
// Typography
// ============================================
export const typography = {
  displayXL: { fontSize: 60, lineHeight: 64, fontWeight: '400' as const },
  displayLG: { fontSize: 36, lineHeight: 40, fontWeight: '400' as const },
  headingMD: { fontSize: 20, lineHeight: 26, fontWeight: '400' as const },
  headingSM: { fontSize: 16, lineHeight: 20, fontWeight: '700' as const },
  bodyLG: { fontSize: 18, lineHeight: 28, fontWeight: '400' as const },
  bodyMD: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySM: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  buttonLabel: { fontSize: 14, lineHeight: 16, fontWeight: '700' as const, letterSpacing: 2.24 },
  navItem: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const, letterSpacing: 2.24 },
};

// ============================================
// Spacing
// ============================================
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  sectionY: 96,
};

// ============================================
// Shadows
// ============================================
export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 5,
  },
};

// ============================================
// Layout
// ============================================
export const layout = {
  headerHeight: 80,
  horizontalMargin: 20,
  maxContentWidth: 1280,
};

