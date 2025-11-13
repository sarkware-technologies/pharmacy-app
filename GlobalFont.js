/**
 * Global Font Application for React Native
 * 
 * NOTE: The render override approach is unreliable in React Native.
 * This file is kept for reference but may not work consistently.
 * 
 * RECOMMENDED: Use baseStyles.js instead for reliable font application.
 * 
 * Import this file in index.js before App.js
 */

import { StyleSheet } from 'react-native';

const DEFAULT_FONT = 'Lato-BlackItalic';

// Log that we're attempting to apply global font

// Export helper function for manual use
export const withDefaultFont = (style) => {
  if (!style) {
    return { fontFamily: DEFAULT_FONT };
  }

  let flattened;
  try {
    flattened = StyleSheet.flatten(style);
  } catch (e) {
    flattened = style;
  }

  if (flattened && typeof flattened === 'object' && flattened.fontFamily) {
    return style;
  }

  if (Array.isArray(style)) {
    return StyleSheet.flatten([{ fontFamily: DEFAULT_FONT }, ...style]);
  }

  return StyleSheet.flatten([{ fontFamily: DEFAULT_FONT }, style]);
};

// Don't try to patch - it breaks React Native components
// The render override approach doesn't work reliably
