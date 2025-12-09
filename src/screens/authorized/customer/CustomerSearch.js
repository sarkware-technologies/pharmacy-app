/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../styles/colors';
import {AppText,AppInput} from "../../../components"
import { fetchCustomersList, resetCustomersList, selectCustomers, selectLoadingStates } from '../../../redux/slices/customerSlice';
import { SkeletonList } from '../../../components/SkeletonLoader';
import FilterModal from '../../../components/FilterModal';
import CustomerSearchResultsIcon from '../../../components/icons/CustomerSearchResultsIcon';
import { customerAPI } from '../../../api/customer';
import Toast from 'react-native-toast-message';
import { handleOnboardCustomer } from '../../../utils/customerNavigationHelper';
import Phone from '../../../components/icons/Phone';
import Edit from '../../../components/icons/Edit';
import Download from '../../../components/icons/Download';
import AddrLine from '../../../components/icons/AddrLine';
import Email from '../../../components/icons/Email';
import Locked from '../../../components/icons/Locked';
import UnLocked from '../../../components/icons/UnLocked';
import AlertFilled from '../../../components/icons/AlertFilled';
import CloseCircle from '../../../components/icons/CloseCircle';
import EyeOpen from '../../../components/icons/EyeOpen';
import ChevronRight from '../../../components/icons/ChevronRight';
import ApproveCustomerModal from '../../../components/modals/ApproveCustomerModal';
import RejectCustomerModal from '../../../components/modals/RejectCustomerModal';

const CustomerSearch = ({ navigation }) => {
  const dispatch = useDispatch();
  const customers = useSelector(selectCustomers);
  const { listLoading } = useSelector(selectLoadingStates);
  
  // Get logged-in user data
  const loggedInUser = useSelector(state => state.auth.user);
  
  const [searchText, setSearchText] = useState('');
  const [recentSearches] = useState([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // State for modals and actions (same as CustomerList)
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedCustomerForAction, setSelectedCustomerForAction] = useState(null);
  
  // Documents modal state
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [customerDocuments, setCustomerDocuments] = useState(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocumentForPreview, setSelectedDocumentForPreview] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSignedUrl, setPreviewSignedUrl] = useState(null);
  
  // Block/Unblock state
  const [blockUnblockLoading, setBlockUnblockLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const searchBarScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(searchBarScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-focus on search input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchInputRef = useRef(null);

  const handleSearch = (text) => {
    setSearchText(text);
    
    if (text.trim()) {
      // Animate search action
      const pulseAnim = new Animated.Value(1);
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Call API with search text
      dispatch(resetCustomersList());
      dispatch(fetchCustomersList({
        page: 1,
        limit: 20,
        searchText: text,
        isLoadMore: false,
      }));
    } else {
      dispatch(resetCustomersList());
    }
  };



//   useEffect(() => {
//   return () => {
//     // Reset customers list when screen unmounts
//     dispatch(resetCustomersList());
//   };
// }, []);

  const handleRecentSearchClick = (search) => {
    const bounceAnim = new Animated.Value(1);
    
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSearchText(search);
      handleSearch(search);
    });
  };

  // Status color helpers (same as CustomerList)
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'ACCEPTED':
      case 'APPROVED':
      case 'UN-VERIFIED':
        return 'rgba(34, 197, 94, 0.1)';
      case 'PENDING':
        return 'rgba(251, 146, 60, 0.1)';
      case 'LOCKED':
        return 'rgba(239, 68, 68, 0.1)';
      case 'DRAFT':
        return 'rgba(156, 163, 175, 0.08)';
      case 'NOT ONBOARDED':
      case 'NOT-ONBOARDED':
        return '#FFF3E0';
      default:
        return '#F5F5F5';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'ACCEPTED':
      case 'APPROVED':
      case 'UN-VERIFIED':
        return '#22C55E';
      case 'PENDING':
        return '#FB923C';
      case 'LOCKED':
        return '#EF4444';
      case 'DRAFT':
        return '#9CA3AF';
      case 'NOT ONBOARDED':
      case 'NOT-ONBOARDED':
        return '#F57C00';
      default:
        return '#666';
    }
  };

  // Fetch customer documents
  const fetchCustomerDocuments = async (customer) => {
    setLoadingDocuments(true);
    try {
      const customerId = customer?.stgCustomerId || customer?.customerId;
      const isStaging = customer?.statusName === 'NOT-ONBOARDED' ? false : (customer?.statusName === 'PENDING' ? true : false);

      const response = await customerAPI.getCustomerDetails(customerId, isStaging);

      if (response?.data) {
        const details = response.data;
        const docs = {
          gst: details.securityDetails?.gstNumber || null,
          gstDoc: details.docType?.find(d => d.doctypeName === 'GSTIN') || null,
          pan: details.securityDetails?.panNumber || null,
          panDoc: details.docType?.find(d => d.doctypeName === 'PAN CARD') || null,
          registrationCertificate: details.docType?.find(d => d.doctypeName === 'REGISTRATION') || null,
          practiceCertificate: details.docType?.find(d => d.doctypeName === 'PRACTICE') || null,
          electricityBill: details.docType?.find(d => d.doctypeName === 'ELECTRICITY BILL') || null,
          image: details.docType?.find(d => d.doctypeName === 'IMAGE') || null,
          allDocuments: details.docType || []
        };
        setCustomerDocuments(docs);
        setShowDocumentsModal(true);
      }
    } catch (error) {
      console.error('Error fetching customer documents:', error);
      Alert.alert('Error', 'Failed to load customer documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Preview document
  const previewDocument = async (doc) => {
    if (!doc || !doc.s3Path) {
      Alert.alert('Info', 'Document not available');
      return;
    }

    setSelectedDocumentForPreview(doc);
    setPreviewModalVisible(true);
    setPreviewLoading(true);

    try {
      const response = await customerAPI.getDocumentSignedUrl(doc.s3Path);
      if (response?.data?.signedUrl) {
        setPreviewSignedUrl(response.data.signedUrl);
      }
    } catch (error) {
      console.error('Error fetching document URL:', error);
      Alert.alert('Error', 'Failed to load document');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download document
  const downloadDocument = async (doc) => {
    if (!doc || !doc.s3Path) {
      Alert.alert('Info', 'Document not available for download');
      return;
    }

    try {
      const response = await customerAPI.getDocumentSignedUrl(doc.s3Path);
      if (response?.data?.signedUrl) {
        await Linking.openURL(response.data.signedUrl);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Alert.alert('Error', 'Failed to download document');
    }
  };

  // Handle approve customer
  const handleApprovePress = (customer) => {
    setSelectedCustomerForAction(customer);
    setApproveModalVisible(true);
  };

  const handleApproveConfirm = async (comment) => {
    try {
      const instanceId = selectedCustomerForAction?.instaceId || selectedCustomerForAction?.instaceId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      const parellGroupId = selectedCustomerForAction?.instance?.stepInstances[0]?.parallelGroup;
      const stepOrderId = selectedCustomerForAction?.instance?.stepInstances[0]?.stepOrder;

      const actionDataPyaload = {
        stepOrder: stepOrderId,
        parallelGroup: parellGroupId,
        actorId: actorId,
        action: "APPROVE",
        comments: comment || "Approved",
        instanceId: instanceId,
        actionData: {
          field: "status",
          newValue: "Approved"
        },
        dataChanges: {
          previousStatus: "Pending",
          newStatus: "Approved"
        }
      };

      await customerAPI.workflowAction(instanceId, actionDataPyaload);

      setApproveModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Customer ${selectedCustomerForAction?.customerName} approved successfully!`,
        position: 'top',
      });
      setSelectedCustomerForAction(null);

      // Refresh the customer list after approval
      dispatch(resetCustomersList());
      dispatch(fetchCustomersList({
        page: 1,
        limit: 20,
        searchText: searchText,
        isLoadMore: false,
      }));
    } catch (error) {
      console.error('Error approving customer:', error);
      setApproveModalVisible(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to approve customer: ${error.message}`,
        position: 'top',
      });
      setSelectedCustomerForAction(null);
    }
  };

  // Handle reject customer
  const handleRejectPress = (customer) => {
    setSelectedCustomerForAction(customer);
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = async (comment) => {
    try {
      const instanceId = selectedCustomerForAction?.instaceId || selectedCustomerForAction?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      const parellGroupId = selectedCustomerForAction?.instance?.stepInstances[0]?.parallelGroup;
      const stepOrderId = selectedCustomerForAction?.instance?.stepInstances[0]?.stepOrder;

      const actionDataPyaload = {
        stepOrder: stepOrderId,
        parallelGroup: parellGroupId,
        actorId: actorId,
        action: "REJECT",
        comments: comment || "Rejected",
        instanceId: instanceId,
        actionData: {
          field: "status",
          newValue: "Rejected"
        },
        dataChanges: {
          previousStatus: "Pending",
          newStatus: "Rejected"
        }
      };

      await customerAPI.workflowAction(instanceId, actionDataPyaload);

      setRejectModalVisible(false);
      Toast.show({
        type: 'error',
        text1: 'Rejected',
        text2: `Customer ${selectedCustomerForAction?.customerName} rejected!`,
        position: 'top',
      });
      setSelectedCustomerForAction(null);

      // Refresh the customer list after rejection
      dispatch(resetCustomersList());
      dispatch(fetchCustomersList({
        page: 1,
        limit: 20,
        searchText: searchText,
        isLoadMore: false,
      }));
    } catch (error) {
      console.error('Error rejecting customer:', error);
      setRejectModalVisible(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to reject customer: ${error.message}`,
        position: 'top',
      });
      setSelectedCustomerForAction(null);
    }
  };

  // Handle block customer
  const handleBlockCustomer = async (customer) => {
    try {
      setBlockUnblockLoading(true);
      const customerId = customer?.stgCustomerId || customer?.customerId;
      const distributorId = loggedInUser?.distributorId || 1;

      await customerAPI.blockUnblockCustomer(
        [customerId],
        distributorId,
        false // isActive = false for blocking
      );

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Customer ${customer?.customerName} blocked successfully!`,
        position: 'top',
      });

      // Refresh the customer list
      dispatch(resetCustomersList());
      dispatch(fetchCustomersList({
        page: 1,
        limit: 20,
        searchText: searchText,
        isLoadMore: false,
      }));
    } catch (error) {
      console.error('Error blocking customer:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to block customer: ${error.message}`,
        position: 'top',
      });
    } finally {
      setBlockUnblockLoading(false);
    }
  };

  // Handle unblock customer
  const handleUnblockCustomer = async (customer) => {
    try {
      setBlockUnblockLoading(true);
      const customerId = customer?.stgCustomerId || customer?.customerId;
      const distributorId = loggedInUser?.distributorId || 1;

      await customerAPI.blockUnblockCustomer(
        [customerId],
        distributorId,
        true // isActive = true for unblocking
      );

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Customer ${customer?.customerName} unblocked successfully!`,
        position: 'top',
      });

      // Refresh the customer list
      dispatch(resetCustomersList());
      dispatch(fetchCustomersList({
        page: 1,
        limit: 20,
        searchText: searchText,
        isLoadMore: false,
      }));
    } catch (error) {
      console.error('Error unblocking customer:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to unblock customer: ${error.message}`,
        position: 'top',
      });
    } finally {
      setBlockUnblockLoading(false);
    }
  };

  // Render customer item (same as CustomerList)
  const renderSearchResult = ({ item, index }) => {
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
            <View style={styles.customerNameRow}>
              <AppText
                style={styles.customerName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.customerName}
              </AppText>
              <ChevronRight
                height={12}
                color={colors.primary}
                style={{ marginLeft: 6 }}
              />
            </View>
            <View style={styles.actionsContainer}>
              {item.statusName === 'NOT-ONBOARDED' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    const customerId = item.customerId || item.stgCustomerId;
                    const isStaging = false;
                    handleOnboardCustomer(
                      navigation,
                      customerId,
                      isStaging,
                      customerAPI,
                      (toastConfig) => Toast.show(toastConfig),
                      item.statusName
                    );
                  }}
                >
                  <Edit color="#666" />
                </TouchableOpacity>
              )}

              {(item.statusName?.toLowerCase() === 'approved' || item.statusName?.toLowerCase() === 'active') && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    const customerId = item.customerId || item.stgCustomerId;
                    const isStaging = false;
                    handleOnboardCustomer(
                      navigation,
                      customerId,
                      isStaging,
                      customerAPI,
                      (toastConfig) => Toast.show(toastConfig),
                      item.statusName
                    );
                  }}
                >
                  <Edit color="#666" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => fetchCustomerDocuments(item)}
              >
                <Download color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <AddrLine color="#999" />
              <AppText style={styles.infoText}>{item.customerCode || item.stgCustomerId}</AppText>
              <AppText style={styles.divider}>|</AppText>
              {item.cityName && (<><AppText style={styles.infoText}>{item.cityName}</AppText>
                <AppText style={styles.divider}>|</AppText></>)}

              <AppText style={styles.infoText}>{item.groupName}</AppText>
              <AppText style={styles.divider}>|</AppText>
              <AppText
                style={[styles.infoText, { flex: 1, maxWidth: 80 }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.customerType}
              </AppText>

              {item.customerType === 'Hospital' && (
                <AlertFilled color="#999" style={styles.infoIcon} />
              )}
            </View>
            <View style={styles.contactRow}>
              <Phone color="#999" />
              <AppText style={{ ...styles.contactText, marginRight: 15 }}>{item.mobile}</AppText>
              <Email color="#999" style={styles.mailIcon} />
              <AppText
                style={[styles.contactText, { flex: 1, maxWidth: "100%" }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.email}
              </AppText>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statusName) }]}>
              <AppText style={[styles.statusText, { color: getStatusTextColor(item.statusName) }]}>
                {item.statusName}
              </AppText>
            </View>
            {item.statusName === 'LOCKED' ? (
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={() => handleUnblockCustomer(item)}
                disabled={blockUnblockLoading}
              >
                <UnLocked fill="#EF4444" />
                <AppText style={styles.unlockButtonText}>Unblock</AppText>
              </TouchableOpacity>
            ) : (item.statusName === 'ACTIVE' || item.statusName === 'UN-VERIFIED') ? (
              <TouchableOpacity
                style={styles.blockButton}
                onPress={() => handleBlockCustomer(item)}
                disabled={blockUnblockLoading}
              >
                <Locked fill="#666" />
                <AppText style={styles.blockButtonText}>Block</AppText>
              </TouchableOpacity>
            ) : item.statusName === 'PENDING' && item.action === 'APPROVE' ? (
              <View style={styles.pendingActions}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApprovePress(item)}
                >
                  <View style={styles.approveButtonContent}>
                    <Icon name="checkmark-outline" size={18} color="white" />
                    <AppText style={styles.approveButtonText}>Approve</AppText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleRejectPress(item)}
                >
                  <CloseCircle color='#000'/>
                </TouchableOpacity>
              </View>
            ) : item.statusName === 'NOT-ONBOARDED' ? (
              <TouchableOpacity
                style={styles.onboardButton}
                onPress={() => {
                  const customerId = item.customerId || item.stgCustomerId;
                  const isStaging = false;
                  handleOnboardCustomer(
                    navigation,
                    customerId,
                    isStaging,
                    customerAPI,
                    (toastConfig) => Toast.show(toastConfig),
                    item.statusName
                  );
                }}>
                <AppText style={styles.onboardButtonText}>Onboard</AppText>
              </TouchableOpacity>
            ) : null}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <Animated.View 
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ scale: searchBarScale }],
        },
      ]}
    >
      <CustomerSearchResultsIcon />
      <AppText style={styles.emptyStateText}>Searched results will display here</AppText>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        
        {/* Header with Search Bar */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: searchBarScale },
            ],
          },
        ]}
      >
        <View style={styles.searchBar}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <AppInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search by name or code"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                dispatch(resetCustomersList());
              }}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Icon name="options-outline" size={24} color="#666" />
        </TouchableOpacity>
      </Animated.View>

      {/* Recent Searches */}
      {searchText.length === 0 && recentSearches.length > 0 && (
        <Animated.View
          style={[
            styles.recentSearchContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <AppText style={styles.recentSearchTitle}>Recent Searches</AppText>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => handleRecentSearchClick(search)}
              activeOpacity={0.7}
            >
              <Icon name="time-outline" size={18} color="#999" />
              <AppText style={styles.recentSearchText}>{search}</AppText>
              <Icon name="arrow-forward-outline" size={16} color="#999" />
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Search Results */}
      {searchText.length > 0 && listLoading ? (
        <SkeletonList items={5} />
      ) : searchText.length > 0 && customers.length > 0 ? (
        <FlatList
          data={customers}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.customerId || item.stgCustomerId || item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : searchText.length > 0 && customers.length === 0 && !listLoading ? (
        <View style={styles.noResults}>
          <Icon name="search-outline" size={60} color="#DDD" />
          <AppText style={styles.noResultsText}>No results found for "{searchText}"</AppText>
          <AppText style={styles.noResultsSubtext}>Try searching with different keywords</AppText>
        </View>
      ) : searchText.length === 0 && recentSearches.length === 0 ? (
        <EmptyState />
      ) : null}

      {/* Keyboard with Done button */}
      {Platform.OS === 'ios' && (
        <View style={styles.keyboardAccessory}>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => Keyboard.dismiss()}
          >
            <AppText style={styles.doneButtonText}>DONE</AppText>
          </TouchableOpacity>
        </View>)}
      </KeyboardAvoidingView>

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={(filters) => {
          // Handle filter application
          setFilterModalVisible(false);
        }}
      />

      {/* Documents Modal */}
      <Modal
        visible={showDocumentsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDocumentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.documentsModalContent}>
            <View style={styles.documentsModalHeader}>
              <AppText style={styles.documentsModalTitle}>All Documents</AppText>
              <TouchableOpacity onPress={() => setShowDocumentsModal(false)}>
                <CloseCircle />
              </TouchableOpacity>
            </View>

            {loadingDocuments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <AppText style={styles.loadingText}>Loading documents...</AppText>
              </View>
            ) : customerDocuments && customerDocuments.allDocuments && customerDocuments.allDocuments.length > 0 ? (
              <ScrollView style={styles.documentsListContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.documentsTopRow}>
                  {customerDocuments.gstDoc && (
                    <View style={styles.documentCardSmall}>
                      <View style={styles.documentCardContentSmall}>
                        <View style={styles.documentCardLeftSmall}>
                          <Icon name="document-outline" size={20} color={colors.primary} />
                          <View style={styles.documentInfoSmall}>
                            <AppText style={styles.documentFileNameSmall} numberOfLines={1}>
                              {customerDocuments.gstDoc.fileName || 'GST'}
                            </AppText>
                            <AppText style={styles.documentTypeSmall}>{customerDocuments.gstDoc.doctypeName}</AppText>
                          </View>
                        </View>
                        <View style={styles.documentActionsSmall}>
                          <TouchableOpacity
                            style={styles.documentActionButtonSmall}
                            onPress={() => previewDocument(customerDocuments.gstDoc)}
                          >
                            <EyeOpen width={16} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.documentActionButtonSmall}
                            onPress={() => downloadDocument(customerDocuments.gstDoc)}
                          >
                            <Download width={16} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                  {customerDocuments.panDoc && (
                    <View style={styles.documentCardSmall}>
                      <View style={styles.documentCardContentSmall}>
                        <View style={styles.documentCardLeftSmall}>
                          <Icon name="document-outline" size={20} color={colors.primary} />
                          <View style={styles.documentInfoSmall}>
                            <AppText style={styles.documentFileNameSmall} numberOfLines={1}>
                              {customerDocuments.panDoc.fileName || 'PAN'}
                            </AppText>
                            <AppText style={styles.documentTypeSmall}>{customerDocuments.panDoc.doctypeName}</AppText>
                          </View>
                        </View>
                        <View style={styles.documentActionsSmall}>
                          <TouchableOpacity
                            style={styles.documentActionButtonSmall}
                            onPress={() => previewDocument(customerDocuments.panDoc)}
                          >
                            <EyeOpen width={16} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.documentActionButtonSmall}
                            onPress={() => downloadDocument(customerDocuments.panDoc)}
                          >
                            <Download width={16} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

                {customerDocuments.allDocuments
                  .filter(doc => doc.doctypeName !== 'GSTIN' && doc.doctypeName !== 'PAN CARD')
                  .map((doc, index) => (
                    <View key={index} style={styles.documentCard}>
                      <View style={styles.documentCardContent}>
                        <View style={styles.documentCardLeft}>
                          <Icon name="document-outline" size={24} color={colors.primary} />
                          <View style={styles.documentInfo}>
                            <AppText style={styles.documentFileName} numberOfLines={1}>
                              {doc.fileName || doc.doctypeName}
                            </AppText>
                            <AppText style={styles.documentType}>{doc.doctypeName}</AppText>
                          </View>
                        </View>
                        <View style={styles.documentActions}>
                          <TouchableOpacity
                            style={styles.documentActionButton}
                            onPress={() => previewDocument(doc)}
                          >
                            <EyeOpen width={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.documentActionButton}
                            onPress={() => downloadDocument(doc)}
                          >
                            <Download width={18} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
              </ScrollView>
            ) : (
              <View style={styles.noDocumentsContainer}>
                <Icon name="document-outline" size={48} color="#ccc" />
                <AppText style={styles.noDocumentsText}>No documents available</AppText>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        visible={previewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.previewModalOverlay}>
          <View style={styles.previewModalContent}>
            <View style={styles.previewModalHeader}>
              <AppText style={styles.previewModalTitle} numberOfLines={1}>
                {selectedDocumentForPreview?.fileName || selectedDocumentForPreview?.doctypeName}
              </AppText>
              <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
                <CloseCircle />
              </TouchableOpacity>
            </View>

            <View style={styles.previewContainer}>
              {previewLoading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : previewSignedUrl && (selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.jpg') ||
                selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.jpeg') ||
                selectedDocumentForPreview?.fileName?.toLowerCase().endsWith('.png')) ? (
                <Image
                  source={{ uri: previewSignedUrl }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.documentPreviewPlaceholder}>
                  <Icon name="document-text-outline" size={64} color="#999" />
                  <AppText style={styles.documentPreviewText}>{selectedDocumentForPreview?.fileName}</AppText>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.downloadButtonInPreview}
              onPress={() => downloadDocument(selectedDocumentForPreview)}
            >
              <Download width={20} color="#fff" />
              <AppText style={styles.downloadButtonText}>Download</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Approve Customer Modal */}
      <ApproveCustomerModal
        visible={approveModalVisible}
        onClose={() => {
          setApproveModalVisible(false);
          setSelectedCustomerForAction(null);
        }}
        onConfirm={handleApproveConfirm}
        customerName={selectedCustomerForAction?.customerName}
      />

      {/* Reject Customer Modal */}
      <RejectCustomerModal
        visible={rejectModalVisible}
        onClose={() => {
          setRejectModalVisible(false);
          setSelectedCustomerForAction(null);
        }}
        onConfirm={handleRejectConfirm}
        customerName={selectedCustomerForAction?.customerName}
      />
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
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingLeft: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 14,
    color: '#333',
    height: 20,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    marginLeft: 12,
    padding: 4,
  },
  recentSearchContainer: {
    backgroundColor: 'red',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',

  },
  recentSearchTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  recentSearchText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: '#333',
  },
  resultsList: {
    paddingVertical: 8,
  },
  resultItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  resultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  divider: {
    color: '#999',
    marginHorizontal: 6,
  },
  infoIcon: {
    marginLeft: 4,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  mailIcon: {
    marginLeft: 12,
  },
  onboardButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  onboardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  noResultsSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  keyboardAccessory: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingRight: 16,
    paddingBottom: 8,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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

  customerNameRow: {
    gap: 2,
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "80%",     // ⬅ LEFT BLOCK TAKES 80%
    flexShrink: 1,       // ⬅ allow text to shrink
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,       // ⬅ allows truncation

  },

  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
    marginTop: 2,
  },
  customerInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flexShrink: 1,
  },
  divider: {
    color: '#999',
    marginHorizontal: 4,
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
    paddingVertical: 10,
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
  pendingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    gap: 4,
  },
  approveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',   // ⬅️ PERFECT vertical alignment
  },

  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,          // ⬅️ spacing between icon & text
  },


  rejectButton: {
    padding: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
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

export default CustomerSearch;