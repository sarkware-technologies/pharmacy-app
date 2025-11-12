# Font Setup Guide

## What Was Fixed

1. ✅ **iOS Info.plist**: Added `UIAppFonts` array with all Lato font files
2. ✅ **Font Configuration**: `react-native.config.js` is already set up correctly
3. ✅ **Font Files**: All fonts are present in `assets/fonts/` directory

## Font Names to Use

For React Native, use the **filename without extension** as the font family name:

- `Lato-Black` → `fontFamily: 'Lato-Black'`
- `Lato-BlackItalic` → `fontFamily: 'Lato-BlackItalic'`
- `Lato-Bold` → `fontFamily: 'Lato-Bold'`
- `Lato-BoldItalic` → `fontFamily: 'Lato-BoldItalic'`
- `Lato-Italic` → `fontFamily: 'Lato-Italic'`
- `Lato-Light` → `fontFamily: 'Lato-Light'`
- `Lato-LightItalic` → `fontFamily: 'Lato-LightItalic'`
- `Lato-Regular` → `fontFamily: 'Lato-Regular'`
- `Lato-Thin` → `fontFamily: 'Lato-Thin'`
- `Lato-ThinItalic` → `fontFamily: 'Lato-ThinItalic'`

## Steps to Make Fonts Work

### For Android (CRITICAL - Do this first):

1. **Fonts have been copied to Android assets directory:**
   - Fonts are now in: `android/app/src/main/assets/fonts/`
   - This was done automatically

2. **Clean and rebuild Android app:**
   ```bash
   # Stop Metro bundler if running (Ctrl+C)
   
   # Clean Android build
   cd android
   ./gradlew clean
   cd ..
   
   # Clear Metro cache and rebuild
   npx react-native start --reset-cache
   # In another terminal:
   npx react-native run-android
   ```

3. **If fonts still don't work, try:**
   ```bash
   # Delete build folders
   rm -rf android/app/build
   rm -rf android/build
   
   # Rebuild
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   cd ..
   npx react-native run-android
   ```

### For iOS:

1. **Clean and rebuild the iOS app:**
   ```bash
   cd ios
   pod install
   cd ..
   npx react-native run-ios
   ```

   OR if you're using Xcode:
   - Open `ios/PharmacyApp.xcworkspace` in Xcode
   - Clean Build Folder (Cmd+Shift+K)
   - Build and Run (Cmd+R)

2. **Verify fonts are linked:**
   - In Xcode, check that fonts appear in the project navigator under your app target
   - They should be in "Copy Bundle Resources" in Build Phases

### General Steps:

1. **Stop Metro bundler** if running
2. **Clear cache:**
   ```bash
   npx react-native start --reset-cache
   ```
3. **Rebuild the app** (see platform-specific steps above)

## Testing Fonts

You can test if fonts are working by using this in any component:

```javascript
<Text style={{ fontFamily: 'Lato-BlackItalic', fontSize: 20 }}>
  Test Font
</Text>
```

If the font doesn't load, it will fall back to the system default font.

## Troubleshooting

### Android-Specific Issues:

1. **Fonts not showing on Android:**
   - ✅ Fonts are now in `android/app/src/main/assets/fonts/` (already done)
   - Make sure you did a **clean rebuild** (see steps above)
   - Try using the font helper: `import { Fonts } from '../utils/fontHelper'`
   - Then use: `fontFamily: Fonts.BlackItalic`

2. **Android font name issues:**
   - Android uses the PostScript name from inside the font file
   - For Lato fonts, the PostScript name matches the filename
   - If still not working, try lowercase: `fontFamily: 'lato-blackitalic'` (rarely needed)

3. **Verify fonts are in Android:**
   ```bash
   ls -la android/app/src/main/assets/fonts/
   ```
   Should show all `.ttf` files

4. **Clear all caches:**
   ```bash
   # Clear Metro
   npx react-native start --reset-cache
   
   # Clear Android
   cd android
   ./gradlew clean
   rm -rf app/build
   rm -rf build
   cd ..
   ```

### iOS-Specific Issues:

1. **Check font PostScript names** (sometimes they differ from filenames):
   - On Mac: Open font file in Font Book, check the PostScript name
   - Use that name instead of the filename

2. **For iOS - Manual linking in Xcode:**
   - Open `ios/PharmacyApp.xcworkspace`
   - Select your project in the navigator
   - Go to Build Phases → Copy Bundle Resources
   - Click "+" and add all font files from `assets/fonts/`

3. **Verify react-native.config.js:**
   - Should have: `assets: ['./assets/fonts']`

4. **Check if fonts are in the right location:**
   - Should be in: `assets/fonts/` (not `src/assets/fonts/`)

### General Issues:

1. **Fonts work on one platform but not the other:**
   - iOS and Android may need different font names
   - Use the `Fonts` helper from `src/utils/fontHelper.js` for cross-platform support

2. **Fonts work in development but not in release:**
   - Make sure fonts are included in release build
   - Check ProGuard rules for Android (fonts should not be obfuscated)

## Current Font Usage

The app already has a default font set in `src/styles/AppText.js`:
- Default: `Lato-BlackItalic`

This is applied globally to all Text and TextInput components.

