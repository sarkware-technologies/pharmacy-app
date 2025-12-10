import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  Modal,
  StatusBar,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCustomerDetails, clearSelectedCustomer, fetchCustomersList, setCurrentCustomerId } from '../../../redux/slices/customerSlice';
import { customerAPI } from '../../../api/customer';
import LinkagedTab from './LinkagedTab';
import { SkeletonDetailPage } from '../../../components/SkeletonLoader';

import ChevronLeft from '../../../components/icons/ChevronLeft';
import Details from '../../../components/icons/Details';
import Linkage from '../../../components/icons/Linkage';
import EyeOpen from '../../../components/icons/EyeOpen';
import Download from '../../../components/icons/Download';
import AppText from "../../../components/AppText"

import { Link } from '@react-navigation/native';
import RejectCustomerModal from '../../../components/modals/RejectCustomerModal';
import ApproveCustomerModal from '../../../components/modals/ApproveCustomerModal';

import CloseCircle from '../../../components/icons/CloseCircle';



const { width } = Dimensions.get('window');

const CustomerDetail = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { customer } = route.params;

  const [activeTab, setActiveTab] = useState('details');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [customerGroups, setCustomerGroups] = useState([]);

  // Get customer data from Redux
  const { selectedCustomer, detailsLoading, detailsError } = useSelector(
    (state) => state.customer
  );

  // Get logged in user
  const { loggedInUser } = useSelector((state) => state.auth);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Fetch customer details on mount - FIXED to prevent double API calls
  useEffect(() => {
    // For staging customers (PENDING, NOT-ONBOARDED), use stgCustomerId, otherwise use customerId
    const customerId = customer?.stgCustomerId || customer?.customerId;
    // Set isStaging=false only for NOT-ONBOARDED status, true for PENDING
    const isStaging = customer?.statusName === 'NOT-ONBOARDED' ? false : (customer?.statusName === 'PENDING' ? true : false);

    if (customerId) {
      console.log('Fetching customer details for:', { customerId, isStaging });
      // Save customerId to Redux for use in LinkagedTab
      dispatch(setCurrentCustomerId(customerId));
      dispatch(fetchCustomerDetails({
        customerId,
        isStaging
      }));
    }

    // Cleanup: clear selected customer when component unmounts or customer changes
    return () => {
      dispatch(clearSelectedCustomer());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.stgCustomerId, customer?.customerId, dispatch]);

  console.log('CustomerDetail - selectedCustomer:', selectedCustomer);
  console.log('CustomerDetail - detailsLoading:', detailsLoading);
  console.log('CustomerDetail - detailsError:', detailsError);



  const loadCustomerGroups = async () => {
    try {
      const groupsResponse = await customerAPI.getCustomerGroups();
      if (groupsResponse.success && groupsResponse.data) {
        console.log('Customer groups:', groupsResponse.data);
        setCustomerGroups(groupsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading customer groups:', error);
    }
  };



  // Helper function to determine required license fields based on registration type
  const getRequiredLicenseFields = (typeId, categoryId) => {
    // Pharmacy types (typeId: 1)
    if (typeId === 1) {
      if (categoryId === 2) {
        // Pharmacy Wholesaler - only 20B and 21B
        return [
          { licenseTypeId: 2, label: '20B', docTypeIds: [4], docTypeNames: ['REGISTRATION', '20B'] },
          { licenseTypeId: 4, label: '21B', docTypeIds: [6], docTypeNames: ['REGISTRATION', '21B'] }
        ];
      } else if (categoryId === 1) {
        // Pharmacy Retailer - only 20 and 21
        return [
          { licenseTypeId: 1, label: '20', docTypeIds: [3], docTypeNames: ['REGISTRATION', '20'] },
          { licenseTypeId: 3, label: '21', docTypeIds: [5], docTypeNames: ['REGISTRATION', '21'] }
        ];
      } else if (categoryId === 3) {
        // Pharmacy Wholesaler & Retailer - all 4 licenses
        return [
          { licenseTypeId: 1, label: '20', docTypeIds: [3], docTypeNames: ['REGISTRATION', '20'] },
          { licenseTypeId: 3, label: '21', docTypeIds: [5], docTypeNames: ['REGISTRATION', '21'] },
          { licenseTypeId: 2, label: '20B', docTypeIds: [4], docTypeNames: ['REGISTRATION', '20B'] },
          { licenseTypeId: 4, label: '21B', docTypeIds: [6], docTypeNames: ['REGISTRATION', '21B'] }
        ];
      }
    }
    // Doctor type (typeId: 3)
    else if (typeId === 3) {
      return [
        { licenseTypeId: 6, label: 'Hospital Registration Number', docTypeIds: [10], docTypeNames: ['REGISTRATION', 'CLINIC REGISTRATION'] },
        { licenseTypeId: 7, label: 'Practice License', docTypeIds: [8], docTypeNames: ['PRACTICE', 'PRACTICE LICENSE'] }
      ];
    }
    // Hospital type (typeId: 2) - uses licenseTypeId 7 for registration
    else if (typeId === 2) {
      return [
        { licenseTypeId: 7, label: 'Hospital Registration Number', docTypeIds: [8], docTypeNames: ['REGISTRATION'] }
      ];
    }
    // Default: return empty array
    return [];
  };

  // Get registration type from customer data
  const typeId = selectedCustomer?.typeId;
  const categoryId = selectedCustomer?.categoryId;
  const requiredLicenseFields = getRequiredLicenseFields(typeId, categoryId);

  // Map license data from API to display format
  // const mapLicenseData = () => {
  //   if (!selectedCustomer?.licenceDetails?.licence) return [];

  //   return requiredLicenseFields.map(field => {
  //     const license = selectedCustomer.licenceDetails.licence.find(
  //       lic => lic.licenceTypeId === field.licenseTypeId
  //     );

  //     // Find corresponding document by matching docTypeId (from license) or doctypeName
  //     const document = selectedCustomer.docType?.find(
  //       doc => {
  //         // First, try to match using the docTypeId from the license object (most accurate)
  //         if (license?.docTypeId) {
  //           const licenseDocTypeId = typeof license.docTypeId === 'string'
  //             ? parseInt(license.docTypeId, 10)
  //             : license.docTypeId;
  //           const docTypeId = typeof doc.docTypeId === 'string'
  //             ? parseInt(doc.docTypeId, 10)
  //             : (doc.docTypeId || (typeof doc.doctypeId === 'string' ? parseInt(doc.doctypeId, 10) : doc.doctypeId));

  //           if (licenseDocTypeId === docTypeId) {
  //             return true;
  //           }
  //         }

  //         // Match by docTypeId from field definition
  //         if (doc.docTypeId !== undefined) {
  //           const docTypeId = typeof doc.docTypeId === 'string'
  //             ? parseInt(doc.docTypeId, 10)
  //             : (doc.docTypeId || (typeof doc.doctypeId === 'string' ? parseInt(doc.doctypeId, 10) : doc.doctypeId));
  //           if (field.docTypeIds?.includes(docTypeId)) {
  //             return true;
  //           }
  //         }

  //         // Also check doctypeId (alternative field name)
  //         if (doc.doctypeId !== undefined) {
  //           const doctypeId = typeof doc.doctypeId === 'string'
  //             ? parseInt(doc.doctypeId, 10)
  //             : doc.doctypeId;
  //           if (field.docTypeIds?.includes(doctypeId)) {
  //             return true;
  //           }
  //         }

  //         // Match by doctypeName as fallback
  //         if (doc.doctypeName) {
  //           const docNameUpper = doc.doctypeName.toUpperCase();
  //           return field.docTypeNames?.some(name =>
  //             docNameUpper.includes(name.toUpperCase()) ||
  //             name.toUpperCase().includes(docNameUpper)
  //           );
  //         }

    
          
          
  //         return false;
  //       }
  //     );

  //     return {
  //       label: field.label,
  //       licenseNumber: license?.licenceNo || '',
  //       expiry: license?.licenceValidUpto
  //         ? new Date(license.licenceValidUpto).toLocaleDateString('en-GB').replace(/\//g, '-')
  //         : '',
  //       document: document || null,
  //     };
  //   });
  // };

const mapLicenseData = () => {
  const licenseList = selectedCustomer?.licenceDetails?.licence || [];
  const docList = selectedCustomer?.docType || [];

  return licenseList.map(lic => {
    const licName = String(lic.licenceTypeName || "").toUpperCase().trim();

    // Extract trailing token from licenceTypeName
    const licToken = licName.match(/([A-Z0-9]+)$/)?.[1] || "";

    let document = null;

    // 1️⃣ Find match by trailing token (smart matching)
    document = docList.find(doc => {
      const docName = String(doc.doctypeName || "").toUpperCase().trim();
      const docToken = docName.match(/([A-Z0-9]+)$/)?.[1] || "";
      return docToken === licToken;
    }) || null;

    return {
      label: lic.licenceTypeName || "",
      licenseNumber: lic.licenceNo || "",
      expiry: lic.licenceValidUpto
        ? new Date(lic.licenceValidUpto).toLocaleDateString("en-GB").replace(/\//g, "-")
        : "",
      document
    };
  });
};


  const licenseData = mapLicenseData();

  console.log(selectedCustomer);


  // Format customer data from API response to match the UI structure
  const customerData = selectedCustomer ? {
    code: selectedCustomer.customerCode || selectedCustomer.id || '',
    mobileNumber: selectedCustomer.securityDetails?.mobile || '',
    email: selectedCustomer.securityDetails?.email || '',
    customerGroupId: selectedCustomer?.customerGroupId || '',
    customerGroupName:
      customerGroups?.find(
        g => g.customerGroupId === selectedCustomer?.customerGroupId
      )?.customerGroupName || 'N/A',
    address: [
      selectedCustomer.generalDetails?.address1,
      selectedCustomer.generalDetails?.address2,
      selectedCustomer.generalDetails?.address3,
      selectedCustomer.generalDetails?.address4
    ].filter(Boolean).join(', ') || '',
    pincode: selectedCustomer.generalDetails?.pincode || '',
    city: selectedCustomer.generalDetails?.cityName || '',
    state: selectedCustomer.generalDetails?.stateName || '',
    pan: selectedCustomer.securityDetails?.panNumber || '',
    gst: selectedCustomer.securityDetails?.gstNumber || '',
    // Store actual document objects with s3Path
    documents: {
      addressProof: selectedCustomer.docType?.find(d => d.doctypeName === 'ADDRESS PROOF') || null,
      panDoc: selectedCustomer.docType?.find(d => d.doctypeName === 'PAN CARD') || null,
      gstDoc: selectedCustomer.docType?.find(d => d.doctypeName === 'GSTIN') || null,
      image: selectedCustomer.docType?.find(d =>
        d.doctypeName === 'PHARMACY IMAGE' ||
        d.doctypeName === 'HOSPITAL IMAGE' ||
        d.doctypeName === 'CLINIC IMAGE' ||
        d.doctypeName?.toLowerCase().includes('image')
      ) || null,
    },
    licenseData: licenseData,
  } : {
    // Empty data if no API response
    code: '',
    mobileNumber: '',
    email: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    pan: '',
    gst: '',
    documents: {
      addressProof: null,
      panDoc: null,
      gstDoc: null,
      image: null,
    },
    licenseData: [],
  };

  // Get customer name for header
  const getCustomerName = () => {
    if (selectedCustomer?.clinicName) {
      return selectedCustomer?.clinicName;
    } else if (selectedCustomer?.generalDetails?.ownerName) {
      return `${selectedCustomer.generalDetails.ownerName}`;
    } else if (selectedCustomer?.generalDetails?.customerName) {
      return selectedCustomer.generalDetails.customerName;
    } else if (customer?.customerName) {
      return customer.customerName;
    }
    return 'Customer Details';
  };

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


    loadCustomerGroups()

  }, []);

  console.log(customerGroups);


  const AnimatedSection = ({ children }) => {
    const sectionAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(sectionAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={{
          opacity: sectionAnim,
          transform: [
            {
              translateY: sectionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        {children}
      </Animated.View>
    );
  };

  const DocumentModal = () => {
    const [loadingDoc, setLoadingDoc] = useState(false);
    const [signedUrl, setSignedUrl] = useState(null);

    useEffect(() => {
      if (showDocumentModal && selectedDocument?.s3Path) {
        fetchSignedUrl();
      }
    }, [showDocumentModal, selectedDocument]);

    const fetchSignedUrl = async () => {
      if (!selectedDocument?.s3Path) return;

      setLoadingDoc(true);
      try {
        const response = await customerAPI.getDocumentSignedUrl(selectedDocument.s3Path);
        if (response?.data?.signedUrl) {
          setSignedUrl(response.data.signedUrl);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load document');
      } finally {
        setLoadingDoc(false);
      }
    };

    const closeModal = () => {
      setShowDocumentModal(false);
      setSignedUrl(null);
      setSelectedDocument(null);
    };

    return (
      <Modal
        visible={showDocumentModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.documentModalContent}>
            <View style={styles.modalHeader}>
              <AppText style={styles.modalTitle}>
                {selectedDocument?.doctypeName || selectedDocument?.fileName || 'DOCUMENT'}
              </AppText>
              <TouchableOpacity onPress={closeModal}>
                <CloseCircle />
              </TouchableOpacity>
            </View>

            <View style={styles.documentImageContainer}>
              {loadingDoc ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : signedUrl && (selectedDocument?.fileName?.toLowerCase().endsWith('.jpg') ||
                selectedDocument?.fileName?.toLowerCase().endsWith('.jpeg') ||
                selectedDocument?.fileName?.toLowerCase().endsWith('.png')) ? (
                <Image
                  source={{ uri: signedUrl }}
                  style={{ width: '100%', height: 300 }}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.dummyDocument}>
                  <Icon name="document-text" size={100} color="#999" />
                  <AppText style={styles.documentName}>{selectedDocument?.fileName}</AppText>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const InfoRow = ({ label, value, icon, onPress }) => (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.infoContent}>
        <AppText style={styles.infoLabel}>{label}</AppText>
        <AppText style={styles.infoValue}>{value}</AppText>
      </View>
      {icon && (
        <View style={styles.infoIcon}>
          {icon}
        </View>
      )}
    </TouchableOpacity>
  );

  const openDocument = (docInfo) => {
    console.log("openDocument is called"); console.log(docInfo);
    if (typeof docInfo !== 'string') {
      // For actual document object from API
      setSelectedDocument(docInfo);
      setShowDocumentModal(true);
    } else {
      Alert.alert("Info", "No document available");
    }
  };

  const downloadDocument = async (docInfo) => {
    if (!docInfo || typeof docInfo === 'string') {
      Alert.alert('Info', 'Document not available for download');
      return;
    }

    try {
      const response = await customerAPI.getDocumentSignedUrl(docInfo.s3Path);
      if (response?.data?.signedUrl) {
        await Linking.openURL(response.data.signedUrl);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Alert.alert('Error', 'Failed to download document');
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    Alert.alert(type === 'success' ? 'Success' : 'Error', message);
  };

  // Handle approve customer
  const handleApproveConfirm = async (comment) => {
    try {
      setActionLoading(true);
      const instanceId = selectedCustomer?.instaceId || selectedCustomer?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      const parallelGroupId = selectedCustomer?.instance?.stepInstances[0]?.parallelGroup;
      const stepOrderId = selectedCustomer?.instance?.stepInstances[0]?.stepOrder;

      const actionDataPayload = {
        stepOrder: stepOrderId,
        parallelGroup: parallelGroupId,
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

      const response = await customerAPI.workflowAction(instanceId, actionDataPayload);

      setApproveModalVisible(false);
      showToast(`Customer approved successfully!`, 'success');

      // Navigate back after approval
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('Error approving customer:', error);
      showToast(`Failed to approve customer: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject customer
  const handleRejectConfirm = async (comment) => {
    try {
      setActionLoading(true);
      const instanceId = selectedCustomer?.instaceId || selectedCustomer?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      const parallelGroupId = selectedCustomer?.instance?.stepInstances[0]?.parallelGroup;
      const stepOrderId = selectedCustomer?.instance?.stepInstances[0]?.stepOrder;

      const actionDataPayload = {
        stepOrder: stepOrderId,
        parallelGroup: parallelGroupId,
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

      const response = await customerAPI.workflowAction(instanceId, actionDataPayload);

      setRejectModalVisible(false);
      showToast(`Customer rejected!`, 'error');

      // Navigate back after rejection
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('Error rejecting customer:', error);
      showToast(`Failed to reject customer: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft color="#333" />
          </TouchableOpacity>
          <AppText style={styles.headerTitle}>{getCustomerName()}</AppText>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.activeTab]}
            onPress={() => setActiveTab('details')}
          >
            <Details color={activeTab === 'details' ? colors.primary : '#999'} />
            <AppText style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
              Details
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'linkaged' && styles.activeTab]}
            onPress={() => setActiveTab('linkaged')}
          >
            <Linkage color={activeTab === 'linkaged' ? colors.primary : '#999'} />
            <AppText style={[styles.tabText, activeTab === 'linkaged' && styles.activeTabText]}>
              Linkaged
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'details' && (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {detailsLoading ? (
              <SkeletonDetailPage />
            ) : !selectedCustomer ? (
              <View style={{ padding: 20 }}>
                <AppText>No customer data available</AppText>
              </View>
            ) : (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                }}
              >

                {console.log(customerData)
                }
                {/* Details Section */}
                <AnimatedSection >
                  <AppText style={styles.sectionTitle}>Details</AppText>
                  <View style={styles.card}>
                    <View style={{ display: 'flex', flexDirection: 'row', gap: 120 }}>
                      <InfoRow label="Code" value={customerData.code} />
                      <InfoRow label="Mobile Number" value={customerData.mobileNumber} />
                    </View>

                    <InfoRow label="Email Address" value={customerData.email} />
                  </View>
                </AnimatedSection>

                {/* Address Details */}
                <AnimatedSection >
                  <View style={styles.sectionHeader}>
                    <AppText style={styles.sectionTitle}>Address Details</AppText>
                    {customerData.documents.addressProof && (
                      // <View style={{...styles.fileLinkGroup, marginTop: 4}}>
                      //   <AppText style={styles.linkText}>{customerData.documents.addressProof?.fileName || customerData.documents.addressProof}</AppText>
                      //   <View style={{...styles.iconGroup, width: 60, justifyContent: 'space-around'}}>
                      //     <TouchableOpacity
                      //       onPress={() => openDocument(customerData.documents.addressProof)}
                      //       style={styles.linkButton}
                      //     ><EyeOpen width={18} color={colors.primary} /></TouchableOpacity>
                      //     <AppText style={{ color: '#777' }}>|</AppText>
                      //     <TouchableOpacity
                      //       onPress={() => downloadDocument(customerData.documents.addressProof)}
                      //       style={styles.linkButton}
                      //     ><Download width={16} color={colors.primary} /></TouchableOpacity>
                      //   </View>
                      // </View>

                      <View style={{ ...styles.fileLinkGroup, marginTop: 4 }}>
                        <AppText
                          style={styles.linkText}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {customerData.documents.addressProof?.fileName ||
                            customerData.documents.addressProof}
                        </AppText>

                        <View style={{ ...styles.iconGroup, justifyContent: 'space-around' }}>
                          <TouchableOpacity onPress={() => openDocument(customerData.documents.addressProof)}>
                            <EyeOpen width={18} color={colors.primary} />
                          </TouchableOpacity>

                          <AppText style={{ color: '#777' }}>|</AppText>

                          <TouchableOpacity onPress={() => downloadDocument(customerData.documents.addressProof)}>
                            <Download width={16} color={colors.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                  </View>
                  <View style={styles.card}>
                    <InfoRow label="Address" value={customerData.address} />
                    <View style={{ ...styles.rowContainer, marginTop: 5, paddingBottom: 10 }}>
                      <View style={[styles.halfRow, { marginRight: 8 }]}>
                        <AppText style={styles.infoLabel}>Pincode</AppText>
                        <AppText style={styles.infoValue}>{customerData.pincode}</AppText>
                      </View>
                      <View style={[styles.halfRow, { marginLeft: 8 }]}>
                        <AppText style={styles.infoLabel}>City</AppText>
                        <AppText style={styles.infoValue}>{customerData.city}</AppText>
                      </View>
                      <View style={[styles.halfRow, { marginLeft: 8 }]}>
                        <AppText style={styles.infoLabel}>State</AppText>
                        <AppText style={styles.infoValue}>{customerData.state}</AppText>
                      </View>
                    </View>
                  </View>
                </AnimatedSection>

                {/* License Details */}
                {customerData.licenseData && customerData.licenseData.length > 0 && (
                  <AnimatedSection >
                    <AppText style={styles.sectionTitle}>License Details</AppText>
                    <View style={styles.card}>
                      {customerData.licenseData.map((license, index) => (
                        <View key={index}>
                          <View style={[styles.licenseRow, index > 0 && { marginTop: 10 }]}>
                            <View style={styles.licenseInfo}>
                              <AppText style={styles.infoLabel}>{license.label}</AppText>
                              <AppText style={styles.infoValue}>{license.licenseNumber}</AppText>
                            </View>
                            <View style={styles.licenseExpiry}>
                              <AppText style={styles.infoLabel}>Expiry</AppText>
                              <AppText style={styles.infoValue}>{license.expiry}</AppText>
                            </View>
                          </View>

                          {license.document && (
                            <>
                              <AppText style={styles.uploadedFileLabel}>Uploaded file</AppText>
                              <View style={[styles.fileRow, index === customerData.licenseData.length - 1 && { marginBottom: 8 }]}>
                                <AppText style={styles.fileName} numberOfLines={1}
                                  ellipsizeMode="tail">{license.document?.fileName || ''}</AppText>
                                <View style={{ ...styles.iconGroup, justifyContent: 'space-around' }}>
                                  <TouchableOpacity
                                    style={styles.uploadedFile}
                                    onPress={() => openDocument(license.document)}
                                  >
                                    <EyeOpen width={18} color={colors.primary} />
                                  </TouchableOpacity>
                                  <AppText style={{ color: '#777' }}>|</AppText>
                                  <TouchableOpacity
                                    style={styles.uploadedFile}
                                    onPress={() => downloadDocument(license.document)}
                                  >
                                    <Download width={16} color={colors.primary} />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </>
                          )}
                        </View>
                      ))}
                    </View>
                  </AnimatedSection>
                )}


                {/* Image */}
                {customerData.documents.image && (
                  <AnimatedSection >
                    <AppText style={styles.sectionTitle}>Image</AppText>
                    <View style={styles.card}>
                      <View style={styles.valueWithIcons}>
                        <AppText style={styles.imageName} numberOfLines={1}
                          ellipsizeMode="tail">{customerData.documents.image?.fileName || customerData.documents.image}</AppText>
                        <View style={{ ...styles.iconGroup, justifyContent: 'space-around' }}>
                          <TouchableOpacity
                            style={styles.uploadedFile}
                            onPress={() => openDocument(customerData.documents.image)}
                          ><EyeOpen width={18} color={colors.primary} /></TouchableOpacity>
                          <AppText style={{ color: '#777' }}>|</AppText>
                          <TouchableOpacity
                            style={{ ...styles.uploadedFile }}
                            onPress={() => downloadDocument(customerData.documents.image)}
                          ><Download width={16} color={colors.primary} /></TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </AnimatedSection>
                )}
                {/* Security Details */}
                <AnimatedSection >
                  <AppText style={styles.sectionTitle}>Security Details</AppText>
                  <View style={styles.card}>
                    <View style={styles.otherDetailRow}>
                      <View style={styles.otherDetailItem}>
                        <AppText style={styles.infoLabel}>PAN</AppText>
                        <View style={styles.valueWithIcons}>
                          <AppText style={styles.infoValue}>{customerData.pan}</AppText>
                          {customerData.documents.panDoc && (
                            <View style={{ ...styles.iconGroup, justifyContent: 'space-around' }}>
                              <TouchableOpacity
                                style={styles.uploadedFile}
                                onPress={() => openDocument(customerData.documents.panDoc)}
                              ><EyeOpen width={18} color={colors.primary} /></TouchableOpacity>
                              <AppText style={{ color: '#777' }}>|</AppText>
                              <TouchableOpacity
                                style={styles.uploadedFile}
                                onPress={() => downloadDocument(customerData.documents.panDoc)}
                              ><Download width={16} color={colors.primary} /></TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>


                      {(customerData.documents.gstDoc || customerData.gst) &&

                        <View style={[styles.otherDetailItem, { marginLeft: 0 }]}>
                          <AppText style={styles.infoLabel}>GST</AppText>
                          <View style={styles.valueWithIcons}>
                            {customerData.gst &&
                              <AppText style={styles.infoValue}>{customerData.gst}</AppText>
                            }
                            {customerData.documents.gstDoc && (
                              <View style={{ ...styles.iconGroup, justifyContent: 'space-around' }}>
                                <TouchableOpacity
                                  style={styles.uploadedFile}
                                  onPress={() => openDocument(customerData.documents.gstDoc)}
                                ><EyeOpen width={18} color={colors.primary} /></TouchableOpacity>
                                <AppText style={{ color: '#777' }}>|</AppText>
                                <TouchableOpacity
                                  style={styles.uploadedFile}
                                  onPress={() => downloadDocument(customerData.documents.gstDoc)}
                                ><Download width={16} color={colors.primary} /></TouchableOpacity>
                              </View>
                            )}
                          </View>
                        </View>}

                    </View>
                  </View>
                </AnimatedSection>

                {/* Customer Group */}
                {customerData.customerGroupId && (
                  <AnimatedSection  >
                    <AppText style={styles.sectionTitle}>Customer Group</AppText>

                
                    <View style={[styles.card, { marginBottom: 20 }]}>
                           <View style={styles.infoContent}>
                      <AppText style={styles.infoValue}>{customerData.customerGroupName}</AppText>
                      </View>

                    </View>
                  </AnimatedSection>
                )}


              </Animated.View>
            )}
          </ScrollView>
        )}

        {activeTab === 'linkaged' && <LinkagedTab
          customerType={customerData.customerType}
          customerId={customerData.customerId}
          mappingData={selectedCustomer?.mapping}
          hasApprovePermission={customer?.action === 'APPROVE'}
          isCustomerActive={customer?.statusName === 'ACTIVE' || selectedCustomer?.statusName === 'ACTIVE'}
        />}

        {/* Action Buttons - Show only on Details tab and if customer action is APPROVE */}
        {activeTab === 'details' && customer?.action === 'APPROVE' && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => setRejectModalVisible(true)}
              disabled={actionLoading}
            >
              <Icon name="close-circle-outline" size={20} color={colors.primary} />
              <AppText style={styles.rejectButtonText}>Reject</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => setApproveModalVisible(true)}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="checkmark-outline" size={20} color="#fff" />
                  
                  <AppText style={styles.approveButtonText}>Approve</AppText>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <DocumentModal />

        {/* Approve Modal */}
        <ApproveCustomerModal
          visible={approveModalVisible}
          onClose={() => setApproveModalVisible(false)}
          onConfirm={handleApproveConfirm}
          title="Approve Customer"
          actionType="approve"
          loading={actionLoading}
        />

        {/* Reject Modal */}
        <RejectCustomerModal
          visible={rejectModalVisible}
          onClose={() => setRejectModalVisible(false)}
          onConfirm={handleRejectConfirm}
          loading={actionLoading}
        />
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    zIndex: 999
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 'auto',
    marginLeft: 15,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  approveHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  approveHeaderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  rejectHeaderButton: {
    padding: 6,
  },
  tabContainer: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 0,
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: 'flex-end',
    borderBottomColor: '#E0E0E0',
    marginTop: -10,
    zIndex: 999
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    marginBottom: -8,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#999',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 20,
    backgroundColor: '#fff'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#90909033',
    paddingBottom: 10
  },
  infoRow: {
    marginBottom: 10
  },
  infoContent: {
    flex: 1,
    marginBottom: 5
  },
  infoLabel: {
    fontSize: 13,
    color: '#909090',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#777777',
    fontWeight: '500',
  },
  infoIcon: {
    marginLeft: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    marginTop: -8,
  },
  halfRow: {
    flex: 1,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: '#777777',


    flexShrink: 1,
    marginRight: 8,
  },
  fileLinkGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: "55%"
  },
  iconGroup: {
    flexDirection: 'row',
    // rowGap: 17,
    marginRight: 'auto',
    // width:50,
    alignItems: "center",
    gap: 4
  },
  licenseRow: {
    flexDirection: 'row',
  },
  licenseInfo: {
    width: '50%'
  },
  licenseExpiry: {
    marginLeft: 2,
  },
  uploadedFile: {
    // paddingHorizontal: 10,
  },
  uploadedFileLabel: {
    fontSize: 13,
    color: '#999',
    marginTop: 10
  },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: "100%",
    gap: 10
  },
  fileName: {
    fontSize: 14,
    // width: '50%',
    color: '#777777',
    flexShrink: 1,
  },
  otherDetailRow: {
    flexDirection: 'row',
    justifyContent: "space-around",
    width: "100%",


  },
  otherDetailItem: {
    flex: 1,
    flexShrink: 1
  },
  valueWithIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: "100%",
    gap: 10
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageName: {
    fontSize: 14,
    color: '#777777',
    flexShrink: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentModalContent: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  documentImageContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
  },
  dummyDocument: {
    alignItems: 'center',
  },
  documentName: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 8,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },


});

export default CustomerDetail;