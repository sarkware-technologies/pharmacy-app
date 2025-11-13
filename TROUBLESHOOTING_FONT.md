# Troubleshooting Global Font Not Working

## Why Render Override Might Not Work

The `Text.render` override approach is **unreliable** in React Native because:

1. **React Native uses native components** - Text is a native component, not a pure React component
2. **Style processing happens on native side** - Styles are sent to native before render
3. **Module caching** - React Native caches module exports, so replacing them might not work
4. **Timing issues** - Components might be created before the patch runs

## Current Solution

The updated `GlobalFont.js` tries multiple approaches:
1. Module export replacement (most reliable)
2. Render method override (fallback)
3. Direct component wrapping

## Alternative Solutions (If Still Not Working)

### Solution 1: Use Base StyleSheet (Most Reliable)

Create a base style that you import everywhere:

```javascript
// src/styles/baseStyles.js
import { StyleSheet } from 'react-native';

export const baseStyles = StyleSheet.create({
  text: {
    fontFamily: 'Lato-BlackItalic',
  },
  textInput: {
    fontFamily: 'Lato-BlackItalic',
  },
});

// Usage in components:
import { Text } from 'react-native';
import { baseStyles } from '../styles/baseStyles';

<Text style={[baseStyles.text, { fontSize: 20 }]}>
  Your text
</Text>
```

### Solution 2: Create Custom Text Component

```javascript
// src/components/AppText.js
import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

export const AppText = React.forwardRef((props, ref) => {
  const { style, ...rest } = props;
  const mergedStyle = StyleSheet.flatten([
    { fontFamily: 'Lato-BlackItalic' },
    style,
  ]);
  return <RNText ref={ref} {...rest} style={mergedStyle} />;
});

// Usage:
import { AppText as Text } from '../components/AppText';
```

### Solution 3: Use Babel Plugin (Advanced)

Create a Babel plugin to automatically transform all `Text` imports:

```javascript
// babel-plugin-auto-font.js
module.exports = function({ types: t }) {
  return {
    visitor: {
      JSXOpeningElement(path) {
        if (path.node.name.name === 'Text' || path.node.name.name === 'TextInput') {
          // Add fontFamily to style prop
          // Implementation here...
        }
      }
    }
  };
};
```

### Solution 4: Metro Transformer (Most Complex)

Create a Metro transformer to modify code at build time.

## Recommended Approach

**For maximum reliability**, use **Solution 1 (Base StyleSheet)**:

1. Create `src/styles/baseStyles.js` with default font
2. Import and use in all your StyleSheet.create calls
3. This is 100% reliable and works everywhere

Example:
```javascript
import { StyleSheet } from 'react-native';
import { baseStyles } from '../styles/baseStyles';

const styles = StyleSheet.create({
  title: {
    ...baseStyles.text,  // Automatically gets Lato-BlackItalic
    fontSize: 24,
    fontWeight: 'bold',
  },
  body: {
    ...baseStyles.text,  // Automatically gets Lato-BlackItalic
    fontSize: 16,
  },
});
```

## Debugging Steps

1. **Check if GlobalFont is imported:**
   ```javascript
   // Add this to GlobalFont.js
   console.log('GlobalFont.js loaded at:', new Date().toISOString());
   ```

2. **Check if patch is running:**
   - Look for console log: `✅ Global font (Lato-BlackItalic) applied...`

3. **Test with explicit font:**
   ```javascript
   <Text style={{ fontFamily: 'Lato-BlackItalic', fontSize: 20 }}>
     Test
   </Text>
   ```
   If this works, fonts are loaded correctly, but global patch isn't working.

4. **Check import order:**
   - `GlobalFont.js` must be imported in `index.js` BEFORE `App.js`

5. **Clear all caches:**
   ```bash
   # Metro
   npx react-native start --reset-cache
   
   # Android
   cd android && ./gradlew clean && cd ..
   
   # iOS
   cd ios && rm -rf build && pod install && cd ..
   ```

## Why Direct fontFamily Works But Global Doesn't

When you use `fontFamily: 'Lato-BlackItalic'` directly, it works because:
- The style is passed directly to the native component
- No patching/interception needed
- React Native handles it natively

When trying to patch globally:
- We're trying to intercept at JavaScript level
- But React Native processes styles on native side
- The timing might be wrong
- Module exports might be cached

## Final Recommendation

**Use the baseStyles approach** - it's the most reliable and maintainable solution.


