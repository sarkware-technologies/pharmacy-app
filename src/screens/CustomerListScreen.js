import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Modal,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors } from '../styles/colors';

import Menu from '../components/icons/Menu';
import Phone from '../components/icons/Phone';
import Edit from '../components/icons/Edit';
import Download from '../components/icons/Download';
import Filter from '../components/icons/Filter';
import AddrLine from '../components/icons/AddrLine';
import Email from '../components/icons/Email';
import Search from '../components/icons/Search';
import Locked from '../components/icons/Locked';
import UnLocked from '../components/icons/UnLocked';
import AlertFilled from '../components/icons/AlertFilled';
import Bell from '../components/icons/Bell';

import { authAPI } from '../api/auth';

const { width } = Dimensions.get('window');

const CustomerListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: ['All', 'Pharmacists in hospitals', 'Hospitals', 'Doctors'],
    subCategory: [],
    status: [],
    state: [],
    city: [],
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Mock data
  const customers = [
    {
      id: '1',
      name: 'Dr. Sudhakar Joshi',
      code: '2536',
      location: 'Pune',
      type: '9-Contract',
      category: 'Doctor',
      phone: '9080807070',
      email: 'Sudhakarjoshi123@gmail.com',
      status: 'ACTIVE',
    },
    {
      id: '2',
      name: 'Jahangir General Hospital',
      code: '3594',
      location: 'Pune',
      type: '11-RFQ',
      category: 'Hospital',
      phone: '9080807070',
      email: 'Sudhakarjoshi123@gmail.com',
      status: 'NOT ONBOARDED',
    },
    {
      id: '3',
      name: 'Dr. Sudhakar Joshi',
      code: '2536',
      location: 'Pune',
      type: '9-Contract',
      category: 'Doctor',
      phone: '9080807070',
      email: 'Sudhakarjoshi123@gmail.com',
      status: 'LOCKED',
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#E8F5E9';
      case 'NOT ONBOARDED':
        return '#FFF3E0';
      case 'LOCKED':
        return '#FFEBEE';
      default:
        return '#F5F5F5';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#2E7D32';
      case 'NOT ONBOARDED':
        return '#F57C00';
      case 'LOCKED':
        return '#C62828';
      default:
        return '#757575';
    }
  };

  const renderCustomerItem = ({ item, index }) => {
    return (
      <Animated.View
        style={[
          styles.customerCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CustomerDetail', { customer: item })}
        >
          <View style={styles.customerHeader}>
            <Text style={styles.customerName}>{item.name}</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Edit color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Download color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <AddrLine color="#999" />
              <Text style={styles.infoText}>{item.code}</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={styles.infoText}>{item.location}</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={styles.infoText}>{item.type}</Text>
              <Text style={styles.divider}>|</Text>
              <Text style={styles.infoText}>{item.category}</Text>
              {item.category === 'Hospital' && (
                <AlertFilled color="#999" style={styles.infoIcon} />
              )}
            </View>

            <View style={styles.contactRow}>
              <Phone color="#999" />
              <Text style={styles.contactText}>{item.phone}</Text>
              <Email color="#999" style={styles.mailIcon} />
              <Text style={styles.contactText}>{item.email}</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={[styles.statusText, { color: getStatusTextColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
            {item.status === 'ACTIVE' ? (
              <TouchableOpacity style={styles.blockButton}>
                <Locked color="#666" />
                <Text style={styles.blockButtonText}>Block</Text>
              </TouchableOpacity>
            ) : item.status === 'NOT ONBOARDED' ? (
              <TouchableOpacity style={styles.onboardButton}>
                <Text style={styles.onboardButtonText}>Onboard</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.unlockButton}>
                <UnLocked color="#D32F2F" />
                <Text style={styles.unlockButtonText}>Unlock</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const DownloadModal = () => (
    <Modal
      visible={downloadModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setDownloadModalVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setDownloadModalVisible(false)}
      >
        <Animated.View style={styles.downloadModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Click to download documents</Text>
            <TouchableOpacity onPress={() => setDownloadModalVisible(false)}>
              <AlertFilled color="#666" />
            </TouchableOpacity>
          </View>

          {[
            { name: 'GST', icon: 'document-text-outline' },
            { name: 'PAN', icon: 'document-text-outline' },
            { name: 'Registration Certificate', icon: 'document-outline' },
            { name: 'Practice License', icon: 'document-outline' },
            { name: 'Address Proof', icon: 'location-outline' },
            { name: 'Image', icon: 'image-outline' },
          ].map((doc, index) => (
            <TouchableOpacity key={index} style={styles.documentItem}>
              <View style={styles.documentLeft}>
                <Icon name={doc.icon} size={20} color="#666" />
                <Text style={styles.documentText}>{doc.name}</Text>
              </View>
              <Icon name="eye-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu />

        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customers</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>CREATE</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Bell color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDownloadModalVisible(true)}>
            <Download color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All (20)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notOnboarded' && styles.activeTab]}
          onPress={() => setActiveTab('notOnboarded')}
        >
          <Text style={[styles.tabText, activeTab === 'notOnboarded' && styles.activeTabText]}>
            Not Onboarded (12)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unverified' && styles.activeTab]}
          onPress={() => setActiveTab('unverified')}
        >
          <Text style={[styles.tabText, activeTab === 'unverified' && styles.activeTabText]}>
            Unverified(1)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer name/code"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter color="#666" />
        </TouchableOpacity>
      </View>

      {/* Customer List */}
      <Animated.View
        style={[
          styles.listContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <FlatList
          data={customers}
          renderItem={renderCustomerItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
        </Animated.View>

        <DownloadModal />

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginRight: 'auto',
    marginLeft: 10
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  createButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterButton: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  customerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  customerInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  divider: {
    color: '#999',
    marginHorizontal: 8,
  },
  infoIcon: {
    marginLeft: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  mailIcon: {
    marginLeft: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  blockButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  onboardButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  onboardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D32F2F',
  },
  unlockButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#D32F2F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  downloadModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  documentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default CustomerListScreen;