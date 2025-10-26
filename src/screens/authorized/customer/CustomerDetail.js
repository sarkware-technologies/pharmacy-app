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
import { fetchCustomerDetails } from '../../../redux/slices/customerSlice';
import { customerAPI } from '../../../api/customer';

import ChevronLeft from '../../../components/icons/ChevronLeft';
import Details from '../../../components/icons/Details';
import Linkage from '../../../components/icons/Linkage';
import EyeOpen from '../../../components/icons/EyeOpen';
import Download from '../../../components/icons/Download';

import { Link } from '@react-navigation/native';
import CloseCircle from '../../../components/icons/CloseCircle';

const { width } = Dimensions.get('window');

const CustomerDetail = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { customer } = route.params;
  
  const [activeTab, setActiveTab] = useState('details');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Get customer data from Redux
  const { selectedCustomer, detailsLoading, detailsError } = useSelector(
    (state) => state.customer
  );
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Fetch customer details on mount
  useEffect(() => {
    if (customer?.customerId) {
      dispatch(fetchCustomerDetails(customer.customerId));
    }
  }, [customer?.customerId, dispatch]);

  // Format customer data from API response to match the UI structure
  const customerData = selectedCustomer ? {
    code: selectedCustomer.customerCode || selectedCustomer.id || '',
    mobileNumber: selectedCustomer.securityDetails?.mobile || '',
    email: selectedCustomer.securityDetails?.email || '',
    address: [
      selectedCustomer.generalDetails?.address1,
      selectedCustomer.generalDetails?.address2,
      selectedCustomer.generalDetails?.address3,
      selectedCustomer.generalDetails?.address4
    ].filter(Boolean).join(', ') || '',
    pincode: selectedCustomer.generalDetails?.pincode || '',
    city: selectedCustomer.generalDetails?.cityName || '',
    state: selectedCustomer.generalDetails?.stateName || '',
    registrationNumber: selectedCustomer.licenceDetails?.licence?.[0]?.licenceNo || '',
    registrationExpiry: selectedCustomer.licenceDetails?.licence?.[0]?.licenceValidUpto 
      ? new Date(selectedCustomer.licenceDetails.licence[0].licenceValidUpto).toLocaleDateString('en-GB').replace(/\//g, '-')
      : '',
    practiceNumber: selectedCustomer.licenceDetails?.licence?.[1]?.licenceNo || '',
    practiceExpiry: selectedCustomer.licenceDetails?.licence?.[1]?.licenceValidUpto
      ? new Date(selectedCustomer.licenceDetails.licence[1].licenceValidUpto).toLocaleDateString('en-GB').replace(/\//g, '-')
      : '',
    pan: selectedCustomer.securityDetails?.panNumber || '',
    gst: selectedCustomer.securityDetails?.gstNumber || '',
    // Store actual document objects with s3Path
    documents: {
      electricityBill: selectedCustomer.docType?.find(d => d.doctypeName === 'ELECTRICITY BILL') || null,
      registrationCertificate: selectedCustomer.docType?.find(d => d.doctypeName === 'REGISTRATION') || null,
      practiceCertificate: selectedCustomer.docType?.find(d => d.doctypeName === 'PRACTICE') || null,
      panDoc: selectedCustomer.docType?.find(d => d.doctypeName === 'PAN CARD') || null,
      gstDoc: selectedCustomer.docType?.find(d => d.doctypeName === 'GSTIN') || null,
      image: selectedCustomer.docType?.[0] || null,
    },
  } : {
    // Empty data if no API response
    code: '',
    mobileNumber: '',
    email: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    registrationNumber: '',
    registrationExpiry: '',
    practiceNumber: '',
    practiceExpiry: '',
    pan: '',
    gst: '',
    documents: {
      electricityBill: null,
      registrationCertificate: null,
      practiceCertificate: null,
      panDoc: null,
      gstDoc: null,
      image: null,
    },
  };

  // Get customer name for header
  const getCustomerName = () => {
    if (selectedCustomer?.generalDetails?.ownerName) {
      return `Dr. ${selectedCustomer.generalDetails.ownerName}`;
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
  }, []);

  const AnimatedSection = ({ children, delay = 0 }) => {
    const sectionAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      Animated.timing(sectionAnim, {
        toValue: 1,
        duration: 500,
        delay,
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
              <Text style={styles.modalTitle}>
                {selectedDocument?.doctypeName || selectedDocument?.fileName || 'DOCUMENT'}
              </Text>
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
                  <Text style={styles.documentName}>{selectedDocument?.fileName}</Text>
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
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {icon && (
        <View style={styles.infoIcon}>
          {icon}
        </View>
      )}
    </TouchableOpacity>
  );

  const openDocument = (docInfo) => { console.log("openDocument is called"); console.log(docInfo);
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.container}>        
        {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getCustomerName()}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Details color={activeTab === 'details' ? colors.primary : '#999'} />
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'linkaged' && styles.activeTab]}
          onPress={() => setActiveTab('linkaged')}
        >
          <Linkage color={activeTab === 'linkaged' ? colors.primary : '#999'} />
          <Text style={[styles.tabText, activeTab === 'linkaged' && styles.activeTabText]}>
            Linkaged
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }}
        >
          {/* Details Section */}
          <AnimatedSection delay={100}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.card}>
              <View style={{ display: 'flex', flexDirection: 'row', gap: 120 }}>
                <InfoRow label="Code" value={customerData.code} />
                <InfoRow label="Mobile Number" value={customerData.mobileNumber} />
              </View>
              
              <InfoRow label="Email Address" value={customerData.email} />
            </View>
          </AnimatedSection>

          {/* Address Details */}
          <AnimatedSection delay={200}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Address Details</Text>
              {customerData.documents.electricityBill && (
                <View style={{...styles.fileLinkGroup, marginTop: 4}}>
                  <Text style={styles.linkText}>{customerData.documents.electricityBill?.fileName || customerData.documents.electricityBill}</Text>
                  <View style={{...styles.iconGroup, width: 60, justifyContent: 'space-around'}}>
                    <TouchableOpacity
                      onPress={() => openDocument(customerData.documents.electricityBill)}
                      style={styles.linkButton}
                    ><EyeOpen width={18} color={colors.primary} /></TouchableOpacity>
                    <Text style={{ color: '#777' }}>|</Text>
                    <TouchableOpacity
                      onPress={() => downloadDocument(customerData.documents.electricityBill)}
                      style={styles.linkButton}
                    ><Download width={16} color={colors.primary} /></TouchableOpacity>
                  </View>
                </View>
              )}
              
            </View>
            <View style={styles.card}>
              <InfoRow label="Address" value={customerData.address} />
              <View style={{...styles.rowContainer, marginTop: 5, paddingBottom: 10}}>
                <View style={[styles.halfRow, { marginRight: 8 }]}>
                  <Text style={styles.infoLabel}>Pincode</Text>
                  <Text style={styles.infoValue}>{customerData.pincode}</Text>
                </View>
                <View style={[styles.halfRow, { marginLeft: 8 }]}>
                  <Text style={styles.infoLabel}>City</Text>
                  <Text style={styles.infoValue}>{customerData.city}</Text>
                </View>
                <View style={[styles.halfRow, { marginLeft: 8 }]}>
                  <Text style={styles.infoLabel}>State</Text>
                  <Text style={styles.infoValue}>{customerData.state}</Text>
                </View>
              </View>
            </View>
          </AnimatedSection>

          {/* License Details */}
          <AnimatedSection delay={300}>
            <Text style={styles.sectionTitle}>License Details</Text>
            <View style={styles.card}>
              <View style={styles.licenseRow}>
                <View style={styles.licenseInfo}>
                  <Text style={styles.infoLabel}>Registration Number</Text>
                  <Text style={styles.infoValue}>{customerData.registrationNumber}</Text>
                </View>
                <View style={styles.licenseExpiry}>
                  <Text style={styles.infoLabel}>Expiry</Text>
                  <Text style={styles.infoValue}>{customerData.registrationExpiry}</Text>
                </View>
              </View>
              
              {customerData.documents.registrationCertificate && (
                <>
                  <Text style={styles.uploadedFileLabel}>Uploaded file</Text>
                  <View style={styles.fileRow}>
                    <Text style={styles.fileName}>{customerData.documents.registrationCertificate?.fileName || customerData.documents.registrationCertificate}</Text>
                    <View style={styles.iconGroup}>
                      <TouchableOpacity 
                        style={styles.uploadedFile}
                        onPress={() => openDocument(customerData.documents.registrationCertificate)}
                      ><EyeOpen width={18} color={colors.primary} /></TouchableOpacity>
                      <Text style={{ color: '#777' }}>|</Text>
                      <TouchableOpacity 
                        style={styles.uploadedFile}
                        onPress={() => downloadDocument(customerData.documents.registrationCertificate)}
                      ><Download width={16} color={colors.primary} /></TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              
              <View style={[styles.licenseRow, { marginTop: 10 }]}>
                <View style={styles.licenseInfo}>
                  <Text style={styles.infoLabel}>Practice License</Text>
                  <Text style={styles.infoValue}>{customerData.practiceNumber}</Text>
                </View>
                <View style={styles.licenseExpiry}>
                  <Text style={styles.infoLabel}>Expiry</Text>
                  <Text style={styles.infoValue}>{customerData.practiceExpiry}</Text>
                </View>
              </View>
              
              {customerData.documents.practiceCertificate && (
                <>
                  <Text style={styles.uploadedFileLabel}>Uploaded file</Text>
                  <View style={{...styles.fileRow, marginBottom: 8}}>
                    <Text style={styles.fileName}>{customerData.documents.practiceCertificate?.fileName || customerData.documents.practiceCertificate}</Text>
                    <View style={styles.iconGroup}>
                      <TouchableOpacity 
                        style={styles.uploadedFile}
                        onPress={() => openDocument(customerData.documents.practiceCertificate)}
                      ><EyeOpen width={18} color={colors.primary} /></TouchableOpacity>
                      <Text style={{ color: '#777' }}>|</Text>
                      <TouchableOpacity 
                        style={styles.uploadedFile}
                        onPress={() => downloadDocument(customerData.documents.practiceCertificate)}
                      ><Download width={16} color={colors.primary} /></TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          </AnimatedSection>

          {/* Other Details */}
          <AnimatedSection delay={400}>
            <Text style={styles.sectionTitle}>Other Details</Text>
            <View style={styles.card}>
              <View style={styles.otherDetailRow}>
                <View style={styles.otherDetailItem}>
                  <Text style={styles.infoLabel}>PAN</Text>
                  <View style={styles.valueWithIcons}>
                    <Text style={styles.infoValue}>{customerData.pan}</Text>
                    {customerData.documents.panDoc && (
                      <View style={styles.iconGroup}>
                        <TouchableOpacity 
                          style={styles.uploadedFile}
                          onPress={() => openDocument(customerData.documents.panDoc)}
                        ><EyeOpen width={18} color={colors.primary} /></TouchableOpacity>
                        <Text style={{ color: '#777' }}>|</Text>
                        <TouchableOpacity 
                          style={styles.uploadedFile}
                          onPress={() => downloadDocument(customerData.documents.panDoc)}                        
                        ><Download width={16} color={colors.primary} /></TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
                <View style={[styles.otherDetailItem, { marginLeft: 16 }]}>
                  <Text style={styles.infoLabel}>GST</Text>
                  <View style={styles.valueWithIcons}>
                    <Text style={styles.infoValue}>{customerData.gst}</Text>
                    {customerData.documents.gstDoc && (
                      <View style={styles.iconGroup}>
                        <TouchableOpacity 
                          style={styles.uploadedFile}
                          onPress={() => openDocument(customerData.documents.gstDoc)}
                        ><EyeOpen width={18} color={colors.primary} /></TouchableOpacity>
                        <Text style={{ color: '#777' }}>|</Text>
                        <TouchableOpacity 
                          style={styles.uploadedFile}
                          onPress={() => downloadDocument(customerData.documents.gstDoc)}                        
                        ><Download width={16} color={colors.primary} /></TouchableOpacity>
                      </View>
                    )}
                    </View>
                  </View>
                </View>
              </View>            
          </AnimatedSection>

          {/* Image */}
          {customerData.documents.image && (
            <AnimatedSection delay={500}>
              <Text style={styles.sectionTitle}>Image</Text>
              <View style={{...styles.card, borderBottomWidth: 0, paddingBottom: 20}}>
                <View style={styles.valueWithIcons}>
                  <Text style={styles.imageName}>{customerData.documents.image?.fileName || customerData.documents.image}</Text>
                  <View style={{...styles.iconGroup}}>
                    <TouchableOpacity 
                      style={styles.uploadedFile}
                      onPress={() => openDocument(customerData.documents.image)}
                    ><EyeOpen width={18} color={colors.primary} /></TouchableOpacity>
                    <Text style={{ color: '#777' }}>|</Text>              
                    <TouchableOpacity 
                          style={{...styles.uploadedFile}}
                          onPress={() => downloadDocument(customerData.documents.image)}                        
                        ><Download width={16} color={colors.primary} /></TouchableOpacity>
                        </View>
                </View>
              </View>
            </AnimatedSection>
          )}
        </Animated.View>
        </ScrollView>

        <DocumentModal />
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
    marginLeft: 15
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
    fontWeight: '600',
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
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
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
    marginRight: 0,
  },
  fileLinkGroup: {
    flexDirection: 'row',
    rowGap: 12,
    alignItems: 'center'
  },
  iconGroup: {
    flexDirection: 'row',
    rowGap: 12,
    marginRight: 'auto'
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
    paddingHorizontal: 10,
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
  },
  fileName: {
    fontSize: 14,
    width: '50%',
    color: '#777777',
  },
  otherDetailRow: {
    flexDirection: 'row',
  },
  otherDetailItem: {
    flex: 1,
  },
  valueWithIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageName: {
    fontSize: 14,
    color: '#777777',
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
});

export default CustomerDetail;