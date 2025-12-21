import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

/**
 * Request location permission
 * @returns {Promise<boolean>} true if permission granted, false otherwise
 */
export const requestLocationPermission = async () => {
  if (Platform.OS === 'ios') {
    // iOS permissions are handled via Info.plist and requested automatically
    // when Geolocation.getCurrentPosition is called
    try {
      return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
        );
      });
    } catch (error) {
      console.error('iOS location permission error:', error);
      return false;
    }
  }

  // Android
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location to help you find nearby pharmacies and for location-based services.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Permission Denied',
        'Location permission is permanently denied. Please enable it from app settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    return false;
  } catch (err) {
    console.error('Error requesting location permission:', err);
    return false;
  }
};

/**
 * Check storage permission status (without requesting)
 * @returns {Promise<boolean>} true if permission granted, false otherwise
 */
export const checkStoragePermission = async () => {
  if (Platform.OS === 'ios') {
    // iOS doesn't require explicit storage permission for downloads
    return true;
  }

  // Android
  try {
    const androidVersion = Platform.Version;

    // Android 13+ (API 33+) uses granular media permissions
    if (androidVersion >= 33) {
      const imagesCheck = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );
      const videoCheck = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
      );
      return imagesCheck || videoCheck;
    } 
    // Android 10-12 (API 29-32) - scoped storage, no permission needed
    else if (androidVersion >= 29) {
      return true;
    } 
    // Android 9 and below - needs WRITE_EXTERNAL_STORAGE
    else {
      const storageCheck = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      return storageCheck;
    }
  } catch (error) {
    console.error('Error checking storage permission:', error);
    return false;
  }
};

/**
 * Request storage permission
 * @returns {Promise<boolean>} true if permission granted, false otherwise
 */
export const requestStoragePermission = async () => {
  if (Platform.OS === 'ios') {
    // iOS doesn't require explicit storage permission for downloads
    // Files are saved to app's document directory or user can choose location
    return true;
  }

  // Android
  try {
    const androidVersion = Platform.Version;

    // Android 13+ (API 33+) uses granular media permissions
    if (androidVersion >= 33) {
      // Request permissions one by one to avoid conflicts
      try {
        // First request images permission
        const imagesResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your photos and media files to download and save files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        // Wait a bit before requesting next permission
        await new Promise(resolve => setTimeout(resolve, 300));

        // Then request video permission
        const videoResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your videos and media files to download and save files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        // Check if at least one permission is granted
        const hasPermission = 
          imagesResult === PermissionsAndroid.RESULTS.GRANTED ||
          videoResult === PermissionsAndroid.RESULTS.GRANTED;

        if (!hasPermission) {
          const deniedPermanently = 
            imagesResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
            videoResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN;

          if (deniedPermanently) {
            Alert.alert(
              'Permission Denied',
              'Storage permission is permanently denied. Please enable it from app settings to download files.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ]
            );
          }
          return false;
        }
        return true;
      } catch (err) {
        console.error('Error requesting Android 13+ storage permissions:', err);
        return false;
      }
    } 
    // Android 10-12 (API 29-32) - scoped storage, no permission needed
    else if (androidVersion >= 29) {
      return true;
    } 
    // Android 9 and below - needs WRITE_EXTERNAL_STORAGE
    else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'This app needs access to storage to download and save files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permission Denied',
          'Storage permission is permanently denied. Please enable it from app settings to download files.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
      return false;
    }
  } catch (err) {
    console.error('Error requesting storage permission:', err);
    return false;
  }
};

/**
 * Request all required permissions at app startup (sequentially, one by one)
 * @returns {Promise<{location: boolean, storage: boolean}>} Object with permission status
 */
export const requestAllPermissions = async () => {
  try {
    // Request permissions sequentially to avoid conflicts and freezing
    // First request location permission
    console.log('Requesting location permission...');
    const locationGranted = await requestLocationPermission();
    console.log('Location permission result:', locationGranted);
    
    // Wait a bit before requesting next permission to ensure UI is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Then request storage permission
    console.log('Requesting storage permission...');
    const storageGranted = await requestStoragePermission();
    console.log('Storage permission result:', storageGranted);
    
    // Wait a bit before returning to ensure all dialogs are closed
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      location: locationGranted,
      storage: storageGranted,
    };
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return {
      location: false,
      storage: false,
    };
  }
};

