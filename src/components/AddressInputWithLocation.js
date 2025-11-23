import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import CustomInput from './CustomInput';
import LeafletMapModal from './LeafletMapModal';
import MapLocator from './icons/MapLocator';
import { colors } from '../styles/colors';

const AddressInputWithLocation = ({
  label,
  value,
  onChangeText,
  placeholder,
  error = null,
  mandatory = false,
  onLocationSelect = null,
  ...props
}) => {
  const [showMapModal, setShowMapModal] = useState(false);

  const handleLocationSelect = (locationData) => {
    // Update address field with selected address
    onChangeText(locationData.address);
    
    // Call the callback with full location data if provided
    if (onLocationSelect) {
      onLocationSelect(locationData);
    }
  };

  const locationButton = (
    <TouchableOpacity
      style={styles.locationButton}
      onPress={() => setShowMapModal(true)}
      activeOpacity={0.7}
    >
      <MapLocator width={24} height={24} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View>
      <CustomInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        error={error}
        mandatory={mandatory}
        rightComponent={locationButton}
        {...props}
      />
      
      <LeafletMapModal
        visible={showMapModal}
        onClose={() => setShowMapModal(false)}
        onSelectLocation={handleLocationSelect}
        initialLocation={null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  locationButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddressInputWithLocation;
