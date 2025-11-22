import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { colors } from '../../../styles/colors';
import { getDistributors } from '../../../api/orders';
import { setSelectedDistributor } from '../../../redux/slices/orderSlice';
import AppText from "../../../components/AppText"
import { Fonts } from '../../../utils/fontHelper';
import Svg, { Circle, Path } from 'react-native-svg';

const SelectDistributor = ({ visible, onClose, onSelect, customerId, selectedCustomer, changeCustomer }) => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (visible) {
      loadDistributors();
    }
  }, [visible, customerId]);

  const loadDistributors = async () => {
    try {
      const data = await getDistributors(customerId);
      console.log(data, 8987)
      // setDistributors(data);
      if (data?.customer) {
        setDistributors(data.customer?.distributorDetails);
      }
    } catch (error) {
      console.error('Error loading distributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDistributor = (distributor) => {
    onSelect?.(distributor);
  };

  const handleClose = () => {
    onClose?.();
  };

  const renderDistributor = ({ item }) => (
    <View style={{ paddingHorizontal: 17 }}>
      <TouchableOpacity
        style={styles.distributorItem}
        onPress={() => handleSelectDistributor(item)}
      >
        <View style={styles.distributorInfo}>
          <AppText style={styles.distributorName}>{item.name}</AppText>
          <AppText style={styles.distributorMeta}>{item.code} | {item.cityName}</AppText>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}  // ✅ controlled by parent
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={() => { }}>
        <View
          style={styles.modalOverlay}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>Select Distributor</AppText>
              <TouchableOpacity onPress={handleClose}>
                <Svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <Circle cx="11" cy="11" r="10.5" fill="white" stroke="#909090" />
                  <Path d="M7.79468 7.79688L14.2049 14.2071M7.79468 14.2071L14.2049 7.79688" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>

              </TouchableOpacity>
            </View>

            <View style={styles.selectedContainer}>
              <View style={styles.selectedCustomer}>
                <View style={{ gap: 5, width: "80%" }}>
                  <AppText style={styles.selectedCustomer_title}>
                    Selected Hospital
                  </AppText>
                  <AppText style={styles.selectedCustomer_name}>
                    {selectedCustomer?.customerName}
                  </AppText>
                  <AppText style={styles.selectedCustomer_info}>
                    {selectedCustomer?.customerCode} | {selectedCustomer?.cityName}
                  </AppText>
                </View>
                <View style={{ width: "20%", alignItems: "flex-end" }}>
                  <TouchableOpacity style={{ flexDirection: "row", gap: 5, display: "flex", alignItems: "center" }} onPress={() => changeCustomer?.()}>
                    <AppText style={{ color: "#F7941E", fontWeight: 900, fontFamily: Fonts.Black }}>
                      Change
                    </AppText>
                    <Svg style={{ marginTop: 3 }} width="5" height="10" viewBox="0 0 4 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <Path d="M0.5 0.5L3.5 3.5L0.5 6.5" stroke="#F7941E" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={{ marginTop: 5, marginLeft: 24, marginBottom: 5 }}>
              <AppText style={{ colors: colors.primaryText, fontSize: 16, fontWeight: 600 }}>
                Select Distributor
              </AppText>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={distributors}
                renderItem={renderDistributor}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
  },
  listContent: {
    paddingBottom: 32,
  },
  distributorItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FBFBFB',
    marginVertical: 5,
    borderRadius: 12
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
  selectedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  selectedCustomer: {
    backgroundColor: "#f9f6f5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    display: "flex", flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  selectedCustomer_title: {
    fontWeight: 400,
    fontFamily: Fonts.Regular,
    fontSize: 14,
    color: colors.secondaryText
  },
  selectedCustomer_name: {
    fontWeight: 600,
    fontFamily: Fonts.Bold,
    fontSize: 20,
    color: colors.primaryText

  },
  selectedCustomer_info: {
    fontWeight: 400,
    fontFamily: Fonts.Regular,
    fontSize: 14,
    color: colors.secondaryText
  },
});

export default SelectDistributor;