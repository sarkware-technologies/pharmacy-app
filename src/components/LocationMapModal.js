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
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import { AppText } from './index';
import { colors } from '../styles/colors';

const LocationMapModal = ({ visible, onClose, onSelectLocation, initialLocation }) => {
  const [position, setPosition] = useState(
    initialLocation || { latitude: 18.516726, longitude: 73.856255, latitudeDelta: 0.05, longitudeDelta: 0.05 }
  );
  const [address, setAddress] = useState({ fullAddress: '', addressComponents: null });
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const mapRef = useRef(null);

  // Reset states when modal opens and fetch current location
  useEffect(() => {
    if (visible) {
      if (initialLocation) {
        setPosition(initialLocation);
        setAddress({ fullAddress: '', addressComponents: null });
        setInitialLoadDone(true);
      } else if (!initialLoadDone) {
        // Fetch current location on first open
        handleGetCurrentLocation();
        setInitialLoadDone(true);
      }
    }
  }, [visible, initialLocation, initialLoadDone, handleGetCurrentLocation]);

  // India bounds
  const INDIA_BOUNDS = {
    north: 37.5,
    south: 6.5,
    west: 68,
    east: 97.5,
  };

  // Clamp coordinates to India bounds
  const clampCoordinates = useCallback((lat, lng) => {
    return {
      latitude: Math.min(Math.max(lat, INDIA_BOUNDS.south), INDIA_BOUNDS.north),
      longitude: Math.min(Math.max(lng, INDIA_BOUNDS.west), INDIA_BOUNDS.east),
    };
  }, []);

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
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });

          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: clamped.latitude,
              longitude: clamped.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            });
          }

          // Fetch address for current location
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
  }, [clampCoordinates]);

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
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
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
      
      // Store the full address data for later use
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
      
      // Provide more specific error message
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

  // Handle map region change (when user drags the map)
  const handleRegionChangeComplete = (region) => {
    const clamped = clampCoordinates(region.latitude, region.longitude);
    
    setPosition({
      latitude: clamped.latitude,
      longitude: clamped.longitude,
      latitudeDelta: region.latitudeDelta,
      longitudeDelta: region.longitudeDelta,
    });

    // Fetch address for the new center position
    fetchAddressFromCoordinates(clamped.latitude, clamped.longitude);
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

    // Extract components from Nominatim address data
    const components = address.addressComponents || {};
    
    // Extract pincode (postcode in Nominatim)
    const pincode = components.postcode || '';
    
    // Extract city (can be city, town, village, or municipality)
    const city = components.city || components.town || components.village || 
                 components.municipality || components.county || '';
    
    // Extract state
    const state = components.state || components.state_district || '';
    
    // Extract area/locality (can be neighbourhood, suburb, or locality)
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
      addressComponents: components, // Pass full components for custom extraction
    });

    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={28} color="#333" />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>Location</AppText>
          <View style={styles.headerSpacer} />
        </View>

        {/* Map Container with Fixed Center Pin */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={position}
            onRegionChangeComplete={handleRegionChangeComplete}
            onError={(error) => {
              console.error('MapView error:', error);
              Toast.show({
                type: 'error',
                text1: 'Map Error',
                text2: 'Failed to load map. Please try again.',
              });
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            scrollEnabled={true}
            zoomEnabled={true}
            rotateEnabled={false}
            pitchEnabled={false}
          />
          
          {/* Fixed Center Pin - doesn't move with map */}
          <View style={styles.centerMarker}>
            <Icon name="location-on" size={50} color="#FF6B35" />
            <View style={styles.pinShadow} />
          </View>
          
          {/* Hint Text */}
          <View style={styles.hintContainer}>
            <AppText style={styles.hintText}>Move pin to adjust</AppText>
          </View>
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
    justifyContent: 'space-between',
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
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pinShadow: {
    width: 30,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 15,
    marginTop: -5,
  },
  hintContainer: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
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

export default LocationMapModal;
