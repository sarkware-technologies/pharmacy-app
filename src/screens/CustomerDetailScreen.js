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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

const CustomerDetailScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Mock customer data
  const customerData = {
    code: '2536',
    mobileNumber: '9993365310',
    email: 'Sudhakarjoshi123@gmail.com',
    address: 'Mohalla darwar, E kalan, Ho, No00, near Muradabadi gate',
    pincode: '244221',
    city: 'Pune',
    state: 'Maharashtra',
    registrationNumber: 'CLNC12345678',
    registrationExpiry: '25-10-2035',
    practiceNumber: 'PRACT12345678',
    practiceExpiry: '25-10-2035',
    pan: 'CGOPP3203KJL',
    gst: 'GST123203KJ',
    documents: {
      electricityBill: 'Electricitybillfilename.pdf',
      registrationCertificate: 'filenamecertificate.pdf',
      practiceCertificate: 'filenamecertificate.pdf',
      image: 'Camerawhasappfrontimage.jpeg',
    },
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

  const DocumentModal = () => (
    <Modal
      visible={showDocumentModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowDocumentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.documentModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>DUMMY IMAGE</Text>
            <TouchableOpacity onPress={() => setShowDocumentModal(false)}>
              <Icon name="close-circle" size={30} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.documentImageContainer}>
            <View style={styles.dummyDocument}>
              <Icon name="document-text" size={100} color="#999" />
              <Text style={styles.documentName}>{selectedDocument}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.downloadButton}>
            <Icon name="download-outline" size={24} color="#fff" />
            <Text style={styles.downloadButtonText}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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

  const openDocument = (docName) => {
    setSelectedDocument(docName);
    setShowDocumentModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        
        {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dr. Sudhakar Joshi</Text>
        <TouchableOpacity>
          <MaterialIcons name="tune" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Icon name="document-text-outline" size={20} color={activeTab === 'details' ? colors.primary : '#999'} />
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'linkaged' && styles.activeTab]}
          onPress={() => setActiveTab('linkaged')}
        >
          <Icon name="link-outline" size={20} color={activeTab === 'linkaged' ? colors.primary : '#999'} />
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
              <InfoRow label="Code" value={customerData.code} />
              <InfoRow label="Mobile Number" value={customerData.mobileNumber} />
              <InfoRow label="Email Address" value={customerData.email} />
            </View>
          </AnimatedSection>

          {/* Address Details */}
          <AnimatedSection delay={200}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Address Details</Text>
              <TouchableOpacity
                onPress={() => openDocument(customerData.documents.electricityBill)}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>{customerData.documents.electricityBill}</Text>
                <View style={styles.iconGroup}>
                  <Icon name="eye-outline" size={20} color={colors.primary} />
                  <Icon name="download-outline" size={20} color={colors.primary} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <InfoRow label="Address" value={customerData.address} />
              <View style={styles.rowContainer}>
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
              <TouchableOpacity 
                style={styles.uploadedFile}
                onPress={() => openDocument(customerData.documents.registrationCertificate)}
              >
                <Text style={styles.uploadedFileLabel}>Uploaded file</Text>
                <View style={styles.fileRow}>
                  <Text style={styles.fileName}>{customerData.documents.registrationCertificate}</Text>
                  <View style={styles.iconGroup}>
                    <Icon name="eye-outline" size={20} color={colors.primary} />
                    <Icon name="download-outline" size={20} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
              
              <View style={[styles.licenseRow, { marginTop: 16 }]}>
                <View style={styles.licenseInfo}>
                  <Text style={styles.infoLabel}>Practice License</Text>
                  <Text style={styles.infoValue}>{customerData.practiceNumber}</Text>
                </View>
                <View style={styles.licenseExpiry}>
                  <Text style={styles.infoLabel}>Expiry</Text>
                  <Text style={styles.infoValue}>{customerData.practiceExpiry}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.uploadedFile}
                onPress={() => openDocument(customerData.documents.practiceCertificate)}
              >
                <Text style={styles.uploadedFileLabel}>Uploaded file</Text>
                <View style={styles.fileRow}>
                  <Text style={styles.fileName}>{customerData.documents.practiceCertificate}</Text>
                  <View style={styles.iconGroup}>
                    <Icon name="eye-outline" size={20} color={colors.primary} />
                    <Icon name="download-outline" size={20} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
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
                    <View style={styles.iconGroup}>
                      <Icon name="eye-outline" size={20} color={colors.primary} />
                      <Icon name="download-outline" size={20} color={colors.primary} />
                    </View>
                  </View>
                </View>
                <View style={[styles.otherDetailItem, { marginLeft: 16 }]}>
                  <Text style={styles.infoLabel}>GST</Text>
                  <View style={styles.valueWithIcons}>
                    <Text style={styles.infoValue}>{customerData.gst}</Text>
                    <View style={styles.iconGroup}>
                      <Icon name="eye-outline" size={20} color={colors.primary} />
                      <Icon name="download-outline" size={20} color={colors.primary} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </AnimatedSection>

          {/* Image */}
          <AnimatedSection delay={500}>
            <Text style={styles.sectionTitle}>Image</Text>
            <View style={styles.card}>
              <TouchableOpacity 
                style={styles.imageRow}
                onPress={() => openDocument(customerData.documents.image)}
              >
                <Text style={styles.imageName}>{customerData.documents.image}</Text>
                <View style={styles.iconGroup}>
                  <Icon name="eye-outline" size={20} color={colors.primary} />
                  <Icon name="download-outline" size={20} color={colors.primary} />
                </View>
              </TouchableOpacity>
            </View>
          </AnimatedSection>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
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
    padding: 16,
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
    marginTop: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
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
    color: colors.primary,
    marginRight: 8,
  },
  iconGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  licenseRow: {
    flexDirection: 'row',
  },
  licenseInfo: {
    flex: 1,
  },
  licenseExpiry: {
    marginLeft: 16,
  },
  uploadedFile: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  uploadedFileLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  fileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 13,
    color: colors.primary,
    flex: 1,
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
    color: colors.primary,
    flex: 1,
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

export default CustomerDetailScreen;