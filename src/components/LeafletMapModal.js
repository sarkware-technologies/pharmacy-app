import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { AppText } from './index';
import { colors } from '../styles/colors';

const LeafletMapModal = ({ visible, onClose, onSelectLocation, initialLocation }) => {
  const [position, setPosition] = useState(
    initialLocation || { latitude: 18.516726, longitude: 73.856255 }
  );
  const [address, setAddress] = useState({ fullAddress: '', addressComponents: null });
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const webViewRef = useRef(null);
  const fetchTimeoutRef = useRef(null);
  const lastFetchPositionRef = useRef(null);

  // India bounds
  const INDIA_BOUNDS = useRef({
    north: 37.5,
    south: 6.5,
    west: 68,
    east: 97.5,
  }).current;

  // Clamp coordinates to India bounds
  const clampCoordinates = useCallback((lat, lng) => {
    return {
      latitude: Math.min(Math.max(lat, INDIA_BOUNDS.south), INDIA_BOUNDS.north),
      longitude: Math.min(Math.max(lng, INDIA_BOUNDS.west), INDIA_BOUNDS.east),
    };
  }, [INDIA_BOUNDS]);

  // Request location permissions
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show it on the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      return false;
    }
  };

  // Get current location
  const handleGetCurrentLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Please enable location access in settings',
      });
      return;
    }

    setIsLocating(true);
    try {
      Geolocation.getCurrentPosition(
        (location) => {
          const { latitude, longitude } = location.coords;
          const clamped = clampCoordinates(latitude, longitude);
          
          setPosition({
            latitude: clamped.latitude,
            longitude: clamped.longitude,
          });

          // Update map center
          if (webViewRef.current && mapReady) {
            webViewRef.current.injectJavaScript(`
              map.setView([${clamped.latitude}, ${clamped.longitude}], 15);
              true;
            `);
          }

          fetchAddressFromCoordinates(clamped.latitude, clamped.longitude);
          setIsLocating(false);
          
          Toast.show({
            type: 'success',
            text1: 'Location Found',
            text2: 'Your current location has been set',
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
          
          let errorMessage = 'Unable to get your location';
          if (error.code === 1) {
            errorMessage = 'Location permission denied. Please enable location access in settings.';
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Please check if GPS is enabled.';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please ensure you are outdoors or near a window and try again.';
          }
          
          Toast.show({
            type: 'error',
            text1: 'Location Error',
            text2: errorMessage,
          });
        },
        { 
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 10000,
          distanceFilter: 0,
        }
      );
    } catch (error) {
      console.error('Location permission error:', error);
      setIsLocating(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to access location',
      });
      setIsLocating(false);
    }
  }, [clampCoordinates, mapReady]);

  // Reset states when modal opens and fetch current location
  useEffect(() => {
    if (visible && !initialLoadDone) {
      if (initialLocation) {
        setPosition(initialLocation);
        setAddress({ fullAddress: '', addressComponents: null });
      } else {
        // Fetch current location on first open
        handleGetCurrentLocation();
      }
      setInitialLoadDone(true);
    } else if (!visible) {
      // Reset flag when modal closes
      setInitialLoadDone(false);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Reverse geocode coordinates to address
  const fetchAddressFromCoordinates = async (lat, lng) => {
    setIsLoadingAddress(true);
    
    // Check network connectivity first
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Toast.show({
        type: 'error',
        text1: 'No Internet',
        text2: 'Please check your internet connection',
      });
      setAddress({
        fullAddress: '',
        addressComponents: null,
      });
      setIsLoadingAddress(false);
      return;
    }
    
    try {
      // Add delay to respect rate limiting (1 request per second)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en',
            'User-Agent': 'PharmacyApp/1.0',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Address data received:', data);
      
      if (data && data.address) {
        setAddress({
          fullAddress: data.display_name || '',
          addressComponents: data.address,
        });
      } else {
        setAddress({
          fullAddress: data.display_name || 'Address not found',
          addressComponents: null,
        });
      }
    } catch (error) {
      console.error('Address fetch error:', error);
      
      let errorMessage = 'Failed to fetch address for this location';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Address Error',
        text2: errorMessage,
      });
      
      setAddress({
        fullAddress: '',
        addressComponents: null,
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleSelectLocation = () => {
    if (!address.fullAddress) {
      Toast.show({
        type: 'error',
        text1: 'No Address',
        text2: 'Please select a location with valid address',
      });
      return;
    }

    const components = address.addressComponents || {};
    
    const pincode = components.postcode || '';
    const city = components.city || components.town || components.village || 
                 components.municipality || components.county || '';
    const state = components.state || components.state_district || '';
    const area = components.neighbourhood || components.suburb || 
                 components.locality || components.city_district || '';

    onSelectLocation({
      latitude: position.latitude,
      longitude: position.longitude,
      address: address.fullAddress,
      pincode: pincode,
      city: city,
      state: state,
      area: area,
      addressComponents: components,
    });

    onClose();
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapReady') {
        setMapReady(true);
        console.log('Map is ready');
      } else if (data.type === 'moveEnd') {
        const { lat, lng } = data;
        const clamped = clampCoordinates(lat, lng);
        
        // Check if position has changed significantly (> 10 meters)
        const lastPos = lastFetchPositionRef.current;
        if (lastPos) {
          const distance = Math.sqrt(
            Math.pow((clamped.latitude - lastPos.latitude) * 111000, 2) +
            Math.pow((clamped.longitude - lastPos.longitude) * 111000, 2)
          );
          if (distance < 10) {
            return; // Skip if moved less than 10 meters
          }
        }
        
        setPosition({
          latitude: clamped.latitude,
          longitude: clamped.longitude,
        });
        
        // Debounce address fetching
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        
        fetchTimeoutRef.current = setTimeout(() => {
          lastFetchPositionRef.current = clamped;
          fetchAddressFromCoordinates(clamped.latitude, clamped.longitude);
        }, 800); // Wait 800ms after user stops dragging
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // HTML content for Leaflet map
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        #map {
          width: 100vw;
          height: 100vh;
          position: absolute;
          top: 0;
          left: 0;
        }
        .center-marker {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1000;
          pointer-events: none;
        }
        .center-marker svg {
          width: 40px;
          height: 40px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        .marker-background {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: rgba(247, 148, 30, 0.15);
          transform: translate(-50%, -50%);
          z-index: 999;
          pointer-events: none;
          border: 2px solid rgba(247, 148, 30, 0.3);
        }
        .hint-bubble {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 13px;
          color: #666;
          font-weight: 500;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="hint-bubble">Move pin to adjust</div>
      <div class="marker-background"></div>
      <div class="center-marker">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#F7941E"/>
        </svg>
      </div>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: false,
          attributionControl: true,
          dragging: true,
          touchZoom: true,
          doubleClickZoom: true,
          scrollWheelZoom: true,
          boxZoom: true,
          keyboard: true,
          tap: true
        }).setView([${position.latitude}, ${position.longitude}], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Notify React Native that map is ready
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));

        // Send position updates when map moves
        map.on('moveend', function() {
          var center = map.getCenter();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'moveEnd',
            lat: center.lat,
            lng: center.lng
          }));
        });

        // Disable rotation
        map.touchRotate.disable();
        map.touchPitch.disable();
      </script>
    </body>
    </html>
  `;

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={28} color="#333" />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Location</AppText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.map}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <AppText style={styles.loadingText}>Loading map...</AppText>
              </View>
            )}
          />
        </View>

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
          disabled={isLocating}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="my-location" size={24} color="#fff" />
          )}
        </TouchableOpacity>

        {/* Address Display */}
        <View style={styles.addressContainer}>
          <AppText style={styles.addressLabel}>Pinned Location</AppText>
          {isLoadingAddress ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <AppText style={styles.loadingText}>Fetching address...</AppText>
            </View>
          ) : (
            <AppText style={styles.addressText} numberOfLines={2}>
              {address.fullAddress || 'Move map to select location'}
            </AppText>
          )}
        </View>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, !address.fullAddress && styles.confirmButtonDisabled]}
            onPress={handleSelectLocation}
            disabled={!address.fullAddress || isLoadingAddress}
          >
            <AppText style={styles.confirmButtonText}>
              Confirm Location
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingLeft: 6,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'left',
    marginLeft: 16,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 260,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  addressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    minHeight: 100,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#FF8C42',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LeafletMapModal;
