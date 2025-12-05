import { useState, useCallback } from 'react';
import { customerAPI } from '../api/customer';
import Toast from 'react-native-toast-message';

/**
 * Custom hook for pincode-based city, state, and area lookup
 * @returns {Object} - { areas, cities, states, loading, lookupByPincode, clearData }
 */
export const usePincodeLookup = () => {
  const [areas, setAreas] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  // lookupByPincode now returns the extracted arrays so callers can act immediately
  const lookupByPincode = useCallback(async (pinCode) => {
    // Validate pincode (should be 6 digits)
    if (!pinCode || pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
      // Clear data if pincode is invalid
      setAreas([]);
      setCities([]);
      setStates([]);
      return { areas: [], cities: [], states: [] };
    }

    setLoading(true);
    try {
      const response = await customerAPI.getCityByPin(pinCode);
      
      if (response?.success && response?.data) {
        // Extract areas from cities
        const allAreas = [];
        const extractedCities = [];
        const extractedStates = [];

        // Process cities and their areas
        if (response.data.cities && Array.isArray(response.data.cities)) {
          response.data.cities.forEach(city => {
            // Add city
            extractedCities.push({
              id: city.value,
              name: city.label,
              raw: city,
            });

            // Add areas for this city
            if (city.area && Array.isArray(city.area)) {
              city.area.forEach(area => {
                allAreas.push({
                  id: area.value,
                  name: area.label,
                  cityId: city.value,
                  raw: area,
                });
              });
            }
          });
        }

        // Process states
        if (response.data.states && Array.isArray(response.data.states)) {
          response.data.states.forEach(state => {
            extractedStates.push({
              id: state.value,
              name: state.label,
              gstCode: state.gstCode,
              raw: state,
            });
          });
        }

        // Update hook state
        setAreas(allAreas);
        setCities(extractedCities);
        setStates(extractedStates);

        // RETURN the extracted arrays so the caller can use them immediately
        return {
          areas: allAreas,
          cities: extractedCities,
          states: extractedStates,
        };
      } else {
        // No data found for this pincode
        setAreas([]);
        setCities([]);
        setStates([]);
        Toast.show({
          type: 'info',
          text1: 'No data found',
          text2: 'No city/state found for this pincode',
          position: 'top',
        });
        return { areas: [], cities: [], states: [] };
      }
    } catch (error) {
      console.error('Error looking up pincode:', error);
      setAreas([]);
      setCities([]);
      setStates([]);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to lookup pincode. Please try again.',
        position: 'top',
      });
      return { areas: [], cities: [], states: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setAreas([]);
    setCities([]);
    setStates([]);
  }, []);

  return {
    areas,
    cities,
    states,
    loading,
    lookupByPincode,
    clearData,
  };
};
