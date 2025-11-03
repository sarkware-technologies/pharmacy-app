import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { colors } from '../../../styles/colors';
import { getDistributors } from '../../../api/orders';
import { setSelectedDistributor } from '../../../redux/slices/orderSlice';

const SelectDistributor = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(true);
  
  // Determine if coming from Upload Order flow
  const isUploadFlow = route.params?.fromUpload || false;

  useEffect(() => {
    loadDistributors();
  }, []);

  const loadDistributors = async () => {
    try {
      const data = await getDistributors();
      setDistributors(data);
    } catch (error) {
      console.error('Error loading distributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDistributor = (distributor) => {
    dispatch(setSelectedDistributor(distributor));
    setShowModal(false);
    
    // Navigate based on flow type
    if (isUploadFlow) {
      navigation.goBack(); // Return to UploadOrder screen
    } else {
      navigation.navigate('SearchAddProducts'); // Continue to manual order flow
    }
  };

  const handleClose = () => {
    setShowModal(false);
    navigation.goBack();
  };

  const renderDistributor = ({ item }) => (
    <TouchableOpacity 
      style={styles.distributorItem}
      onPress={() => handleSelectDistributor(item)}
    >
      <View style={styles.distributorInfo}>
        <Text style={styles.distributorName}>{item.name}</Text>
        <Text style={styles.distributorMeta}>{item.code} | {item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Distributor</Text>
            <TouchableOpacity onPress={handleClose}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={distributors}
              renderItem={renderDistributor}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    paddingBottom: 32,
  },
  distributorItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  distributorInfo: {
    flex: 1,
  },
  distributorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  distributorMeta: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
});

export default SelectDistributor;