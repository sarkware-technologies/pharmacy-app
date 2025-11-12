import { Platform } from 'react-native';

/**
 * Font helper utility
 * Provides consistent font family names across platforms
 */

export const Fonts = {
  // Black
  Black: Platform.select({
    ios: 'Lato-Black',
    android: 'Lato-Black',
  }),
  BlackItalic: Platform.select({
    ios: 'Lato-BlackItalic',
    android: 'Lato-BlackItalic',
  }),

  // Bold
  Bold: Platform.select({
    ios: 'Lato-Bold',
    android: 'Lato-Bold',
  }),
  BoldItalic: Platform.select({
    ios: 'Lato-BoldItalic',
    android: 'Lato-BoldItalic',
  }),

  // Regular
  Regular: Platform.select({
    ios: 'Lato-Regular',
    android: 'Lato-Regular',
  }),
  Italic: Platform.select({
    ios: 'Lato-Italic',
    android: 'Lato-Italic',
  }),

  // Light
  Light: Platform.select({
    ios: 'Lato-Light',
    android: 'Lato-Light',
  }),
  LightItalic: Platform.select({
    ios: 'Lato-LightItalic',
    android: 'Lato-LightItalic',
  }),

  // Thin
  Thin: Platform.select({
    ios: 'Lato-Thin',
    android: 'Lato-Thin',
  }),
  ThinItalic: Platform.select({
    ios: 'Lato-ThinItalic',
    android: 'Lato-ThinItalic',
  }),
};

/**
 * Get font family with fallback
 * @param {string} fontName - Font name from Fonts object
 * @returns {string} Font family name or system default
 */
export const getFontFamily = (fontName) => {
  return fontName || (Platform.OS === 'ios' ? 'System' : 'sans-serif');
};

