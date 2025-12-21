/* eslint-disable react/no-unstable-nested-components */
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
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
  PanResponder,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
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
import Reassigned from '../../../components/icons/Reassigned';
import PermissionWrapper from '../../../utils/RBAC/permissionWrapper';
import PERMISSIONS from '../../../utils/RBAC/permissionENUM';
import Sync from '../../../components/icons/Sync';
import Comment from '../../../components/icons/Comment';
import CommentsModal from '../../../components/modals/CommentsModal';
import Toast from 'react-native-toast-message';



const { width } = Dimensions.get('window');

// Move AnimatedSection outside component to prevent recreation on every render
const AnimatedSection = React.memo(({ children }) => {
  const sectionAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(sectionAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
});

AnimatedSection.displayName = 'AnimatedSection';

const CustomerDetail = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { customer } = route.params;

  const [activeTab, setActiveTab] = useState('details');
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [sendBackModalVisible, setSendBackModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [latestDraftData, setLatestDraftData] = useState(null);
  const [customerGroups, setCustomerGroups] = useState([]);
  const [isEditingCustomerGroup, setIsEditingCustomerGroup] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [updatingCustomerGroup, setUpdatingCustomerGroup] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);

  // Get customer data from Redux
  const { selectedCustomer, detailsLoading, detailsError } = useSelector(
    (state) => state.customer
  );

  useEffect(() => {
    if(selectedCustomer?.action == "LINK_DT"){
      setActiveTab('linkaged');
    }
  }, [selectedCustomer]);

  // Get logged in user
  const loggedInUser = useSelector(state => state.auth.user);


  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Fetch customer details on mount - FIXED to prevent double API calls
  useEffect(() => {

    console.log(customer, "custoemr");
    
    const customerId = customer?.stgCustomerId || customer?.customerId;
    const isStaging = customer?.customerId === null || customer?.customerId === undefined;

    if (customerId) {
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



  const loadCustomerGroups = useCallback(async () => {
    try {
      const groupsResponse = await customerAPI.getCustomerGroups();
      if (groupsResponse.success && groupsResponse.data) {
        console.log('Customer groups:', groupsResponse.data);
        setCustomerGroups(groupsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading customer groups:', error);
    }
  }, []);

  // Memoize handlers to prevent unnecessary re-renders
  const handleChangeCustomerGroup = useCallback(async () => {
    // Load customer groups if not already loaded
    if (customerGroups.length === 0) {
      await loadCustomerGroups();
    }
    if (customerData?.customerGroupId) {
      setSelectedGroupId(customerData.customerGroupId);
    }
    setIsEditingCustomerGroup(true);
  }, [customerGroups.length, loadCustomerGroups, customerData?.customerGroupId]);

  const handleCancelCustomerGroup = useCallback(() => {
    setIsEditingCustomerGroup(false);
    if (customerData?.customerGroupId) {
      setSelectedGroupId(customerData.customerGroupId);
    }
  }, [customerData?.customerGroupId]);

  const handleDoneCustomerGroup = useCallback(async () => {
    if (!selectedGroupId || !selectedCustomer) {
      setIsEditingCustomerGroup(false);
      return;
    }

    // Only update if group actually changed
    if (selectedGroupId === selectedCustomer?.customerGroupId) {
      setIsEditingCustomerGroup(false);
      return;
    }

    try {
      setUpdatingCustomerGroup(true);

      // Build payload from selectedCustomer data
      const stgCustomerId = selectedCustomer.stgCustomerId || customer?.stgCustomerId || customerId;

      const payload = {
        typeId: selectedCustomer.typeId || selectedCustomer.type?.typeId || 1,
        categoryId: selectedCustomer.categoryId || selectedCustomer.category?.categoryId || 0,
        subCategoryId: selectedCustomer.subCategoryId || selectedCustomer.subCategory?.subCategoryId || 0,
        licenceDetails: selectedCustomer.licenceDetails ? {
          licence: selectedCustomer.licenceDetails.licence?.map(l => ({
            licenceTypeId: l.licenceTypeId,
            licenceNo: l.licenceNo,
            licenceValidUpto: l.licenceValidUpto,
            licenceTypeName: l.licenceTypeName,
            licenceTypeCode: l.licenceTypeCode,
            hospitalCode: l.hospitalCode ?? null
          })) || [],
          registrationDate: selectedCustomer.licenceDetails.registrationDate || null
        } : {
          licence: [],
          registrationDate: null
        },
        customerId: customerId,
        stgCustomerId: Number(stgCustomerId),
        customerDocs: selectedCustomer.docType?.map(doc => ({
          s3Path: doc.s3Path,
          docTypeId: Number(doc.doctypeId),
          fileName: doc.fileName,
          customerId: customerId,
          id: doc.id
        })) || [],
        isBuyer: selectedCustomer.isBuyer !== undefined ? selectedCustomer.isBuyer : false,
        customerGroupId: selectedGroupId, // Updated customer group ID
        generalDetails: selectedCustomer.generalDetails ? {
          name: selectedCustomer.generalDetails.name || selectedCustomer.generalDetails.customerName || '',
          shortName: selectedCustomer.generalDetails.shortName || null,
          address1: selectedCustomer.generalDetails.address1 || '',
          address2: selectedCustomer.generalDetails.address2 || '',
          address3: selectedCustomer.generalDetails.address3 || '',
          address4: selectedCustomer.generalDetails.address4 || '',
          pincode: selectedCustomer.generalDetails.pincode || null,
          area: selectedCustomer.generalDetails.area || null,
          cityId: selectedCustomer.generalDetails.cityId || null,
          stateId: selectedCustomer.generalDetails.stateId || null,
          ownerName: selectedCustomer.generalDetails.ownerName || null,
          clinicName: selectedCustomer.generalDetails.clinicName || null,
          specialist: selectedCustomer.generalDetails.specialist || null,
          areaId: selectedCustomer.generalDetails.areaId || null
        } : {
          name: '',
          shortName: null,
          address1: '',
          address2: '',
          address3: '',
          address4: '',
          pincode: null,
          area: null,
          cityId: null,
          stateId: null,
          ownerName: null,
          clinicName: null,
          specialist: null,
          areaId: null
        },
        securityDetails: selectedCustomer.securityDetails ? {
          mobile: selectedCustomer.securityDetails.mobile || '',
          email: selectedCustomer.securityDetails.email || '',
          panNumber: selectedCustomer.securityDetails.panNumber || null,
          gstNumber: selectedCustomer.securityDetails.gstNumber || null
        } : {
          mobile: '',
          email: '',
          panNumber: null,
          gstNumber: null
        },
        mapping: selectedCustomer.mapping ? {
          hospitals: selectedCustomer.mapping.hospitals?.map(h => ({
            id: Number(h.id),          // MUST be number
            isNew: h.isNew ?? false
          })) || [],
          doctors: selectedCustomer.mapping.doctors?.map(d => ({
            id: Number(d.id),
            isNew: d.isNew ?? false
          })) || [],
          pharmacy: selectedCustomer.mapping.pharmacy?.map(p => ({
            id: Number(p.id),
            isNew: p.isNew ?? false
          })) || [],
          groupHospitals: []
        } : {
          hospitals: [],
          doctors: [],
          pharmacy: [],
          groupHospitals: []
        },
        suggestedDistributors: selectedCustomer.suggestedDistributors || [],
        isEmailVerified: selectedCustomer.isEmailVerified !== undefined ? selectedCustomer.isEmailVerified : false,
        isMobileVerified: selectedCustomer.isMobileVerified !== undefined ? selectedCustomer.isMobileVerified : false,
        isExisting: selectedCustomer.isExisting !== undefined ? selectedCustomer.isExisting : false,
        divisions: selectedCustomer.divisions || [],
        isChildCustomer: selectedCustomer.isChildCustomer !== undefined ? selectedCustomer.isChildCustomer : false,
        stationCode: selectedCustomer.stationCode || loggedInUser?.stationCode || '',
        isAssignedToCustomer: selectedCustomer.isAssignedToCustomer !== undefined ? selectedCustomer.isAssignedToCustomer : false
      };

      console.log('🔍 Updating customer group - payload:', JSON.stringify(payload, null, 2));

      await customerAPI.updateCustomerGroup(payload);

      // Show success message
      // Refresh customer details to get updated data
      const customerId = customer?.stgCustomerId || customer?.customerId;
      const isStaging = customer?.statusName === 'ACTIVE' ? false : true;

      if (customerId) {
        dispatch(fetchCustomerDetails({
          customerId,
          isStaging
        }));
      }

      setIsEditingCustomerGroup(false);
    } catch (error) {
      console.error('❌ Error updating customer group:', error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to update customer group');
    } finally {
      setUpdatingCustomerGroup(false);
    }
  }, [selectedGroupId, selectedCustomer, customer, loggedInUser, dispatch]);



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

  // Memoize license data to prevent unnecessary recalculations
  const licenseData = useMemo(() => {
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
  }, [selectedCustomer?.licenceDetails?.licence, selectedCustomer?.docType]);

  console.log(selectedCustomer);

  // Memoize customer data to prevent unnecessary re-renders
  // Only recalculate when selectedCustomer or customerGroups change
  const customerData = useMemo(() => {
    if (!selectedCustomer) {
      return {
        code: '',
        mobileNumber: '',
        email: '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        pan: '',
        gst: '',
        customerGroupId: '',
        customerGroupName: 'N/A',
        documents: {
          addressProof: null,
          panDoc: null,
          gstDoc: null,
          image: null,
        },
        licenseData: [],
      };
    }

    return {
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
    };
  }, [selectedCustomer, customerGroups, licenseData]);

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


    loadCustomerGroups();
    // Set initial selected group when customer data loads
    if (selectedCustomer?.customerGroupId) {
      setSelectedGroupId(selectedCustomer.customerGroupId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(customerGroups);

  // Zoomable Image Component - Using React Native built-in APIs only
  const ZoomableImage = ({ imageUri, containerWidth, containerHeight }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const savedScale = useRef(1);
    const currentTranslateX = useRef(0);
    const currentTranslateY = useRef(0);
    const lastTap = useRef(null);
    const initialDistance = useRef(null);
    const initialScale = useRef(1);
    const touchStartTime = useRef(null);
    const activeTouches = useRef([]);

    const MIN_SCALE = 1;
    const MAX_SCALE = 5;

    // Calculate distance between two touch points
    const getDistance = (touches) => {
      if (touches.length < 2) return null;
      const dx = touches[0].pageX - touches[1].pageX;
      const dy = touches[0].pageY - touches[1].pageY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Handle touch start - better multi-touch detection
    const handleTouchStart = (evt) => {
      const touches = evt.nativeEvent.touches;
      activeTouches.current = Array.from(touches);

      if (touches.length === 2) {
        // Pinch gesture
        initialDistance.current = getDistance(touches);
        initialScale.current = savedScale.current;
        touchStartTime.current = Date.now();
      } else if (touches.length === 1) {
        // Single touch - check for double tap
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
          // Double tap detected
          if (savedScale.current > MIN_SCALE) {
            // Reset zoom
            Animated.parallel([
              Animated.spring(scale, {
                toValue: MIN_SCALE,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
              }),
              Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
              }),
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
              }),
            ]).start(() => {
              savedScale.current = MIN_SCALE;
              currentTranslateX.current = 0;
              currentTranslateY.current = 0;
            });
          } else {
            // Zoom in
            Animated.spring(scale, {
              toValue: 2,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start(() => {
              savedScale.current = 2;
            });
          }
          lastTap.current = null;
        } else {
          lastTap.current = now;
        }

        // Save current translation for pan
        translateX.stopAnimation((x) => {
          currentTranslateX.current = x;
        });
        translateY.stopAnimation((y) => {
          currentTranslateY.current = y;
        });
      }
    };

    // Handle touch move - better multi-touch detection
    const handleTouchMove = (evt) => {
      const touches = evt.nativeEvent.touches;
      activeTouches.current = Array.from(touches);

      if (touches.length === 2) {
        const currentDistance = getDistance(touches);

        // Initialize distance if not set
        if (!initialDistance.current && currentDistance) {
          initialDistance.current = currentDistance;
          initialScale.current = savedScale.current;
        }

        // Perform pinch zoom
        if (currentDistance && initialDistance.current && initialDistance.current > 0) {
          const scaleRatio = currentDistance / initialDistance.current;
          const newScale = initialScale.current * scaleRatio;
          const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

          scale.setValue(clampedScale);
          savedScale.current = clampedScale;
        }
      }
    };

    // Handle touch end
    const handleTouchEnd = (evt) => {
      const touches = evt.nativeEvent.touches;
      activeTouches.current = Array.from(touches);

      if (touches.length === 0) {
        initialDistance.current = null;
        translateX.stopAnimation((x) => {
          translateY.stopAnimation((y) => {
            constrainTranslation(savedScale.current, x, y);
          });
        });
      }
    };

    const constrainTranslation = (scaleValue, currentX, currentY) => {
      if (scaleValue <= MIN_SCALE) {
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
        ]).start();
        currentTranslateX.current = 0;
        currentTranslateY.current = 0;
      } else {
        const maxTranslateX = (containerWidth * (scaleValue - 1)) / 2;
        const maxTranslateY = (containerHeight * (scaleValue - 1)) / 2;

        const clampedX = Math.max(-maxTranslateX, Math.min(maxTranslateX, currentX));
        const clampedY = Math.max(-maxTranslateY, Math.min(maxTranslateY, currentY));

        Animated.parallel([
          Animated.spring(translateX, {
            toValue: clampedX,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.spring(translateY, {
            toValue: clampedY,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
        ]).start();

        currentTranslateX.current = clampedX;
        currentTranslateY.current = clampedY;
      }
    };

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          return true;
        },
        onMoveShouldSetPanResponder: (evt) => {
          return true;
        },
        onPanResponderGrant: (evt) => {
          handleTouchStart(evt);
        },
        onPanResponderMove: (evt, gestureState) => {
          const touches = evt.nativeEvent.touches;

          // Handle pinch in touch move handler
          handleTouchMove(evt);

          // Handle single finger pan when zoomed
          if (touches.length === 1 && savedScale.current > MIN_SCALE) {
            const newX = currentTranslateX.current + gestureState.dx;
            const newY = currentTranslateY.current + gestureState.dy;
            translateX.setValue(newX);
            translateY.setValue(newY);
          }
        },
        onPanResponderRelease: (evt) => {
          handleTouchEnd(evt);
        },
        onPanResponderTerminate: () => {
          initialDistance.current = null;
          activeTouches.current = [];
        },
      })
    ).current;

    const animatedStyle = {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
    };

    return (
      <View
        style={[styles.zoomableImageWrapper, { width: containerWidth, height: containerHeight }]}
        {...panResponder.panHandlers}
      >
        <Animated.Image
          source={{ uri: imageUri }}
          style={[styles.previewImage, animatedStyle]}
          resizeMode="contain"
        />
      </View>
    );
  };

  const DocumentModal = () => {
    const [loadingDoc, setLoadingDoc] = useState(false);
    const [signedUrl, setSignedUrl] = useState(null);
    const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
    const isFetchingRef = useRef(false);
    const lastFetchedPathRef = useRef(null);

    useEffect(() => {
      // Only fetch when modal opens and we have a document
      if (showDocumentModal && selectedDocument?.s3Path) {
        // Prevent duplicate calls - check if we're already fetching or if this is the same document
        if (!isFetchingRef.current && lastFetchedPathRef.current !== selectedDocument.s3Path) {
          fetchSignedUrl();
        }
      } else if (!showDocumentModal) {
        // Reset when modal closes
        setIsFullScreenPreview(false);
        setSignedUrl(null);
        lastFetchedPathRef.current = null;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showDocumentModal, selectedDocument?.s3Path]);

    const fetchSignedUrl = async () => {
      if (!selectedDocument?.s3Path || isFetchingRef.current) return;

      // Mark as fetching and store the path
      isFetchingRef.current = true;
      lastFetchedPathRef.current = selectedDocument.s3Path;

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
        isFetchingRef.current = false;
      }
    };

    const closeModal = () => {
      setShowDocumentModal(false);
      setSignedUrl(null);
      setSelectedDocument(null);
      setIsFullScreenPreview(false);
    };

    const isImageFile = selectedDocument?.fileName?.toLowerCase().endsWith('.jpg') ||
      selectedDocument?.fileName?.toLowerCase().endsWith('.jpeg') ||
      selectedDocument?.fileName?.toLowerCase().endsWith('.png');

    // Full Screen Image Preview
    if (isFullScreenPreview && signedUrl && isImageFile) {
      return (
        <Modal
          visible={showDocumentModal}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
          statusBarTranslucent
        >
          <View style={styles.fullScreenPreviewContainer}>
            <View style={styles.fullScreenPreviewHeader}>
              <TouchableOpacity onPress={() => setIsFullScreenPreview(false)} style={styles.fullScreenCloseButton}>
                <Icon name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <ZoomableImage
              imageUri={signedUrl}
              containerWidth={width}
              containerHeight={Dimensions.get('window').height}
            />
          </View>
        </Modal>
      );
    }

    // Regular Modal View
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
              ) : signedUrl && isImageFile ? (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => setIsFullScreenPreview(true)}
                  style={styles.imagePreviewTouchable}
                >
                  <ZoomableImage
                    imageUri={signedUrl}
                    containerWidth={width * 0.95 - 32}
                    containerHeight={300}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.dummyDocument}>
                  <Icon name="document-text" size={100} color="#999" />
                  <AppText style={styles.documentName}>{selectedDocument?.fileName} </AppText>
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
    if (typeof docInfo !== 'string') {
      // For actual document object from API
      setSelectedDocument(docInfo);
      setShowDocumentModal(true);
    } else {
      Alert.alert("Info", "No document available");
    }
  };

  // Download document - using WebView to trigger automatic download
  const [downloadWebViewUrl, setDownloadWebViewUrl] = useState(null);
  const downloadWebViewRef = useRef(null);

  const downloadDocument = async (docInfo) => {
    if (!docInfo || typeof docInfo === 'string') {
      Alert.alert('Info', 'Document not available for download');
      return;
    }

    try {
      const response = await customerAPI.getDocumentSignedUrl(docInfo.s3Path);
      if (response?.data?.signedUrl) {
        let signedUrl = response.data.signedUrl;
        const fileName = docInfo.fileName || docInfo.doctypeName || 'document';

        // Add download parameter to force download
        const separator = signedUrl.includes('?') ? '&' : '?';
        const downloadUrl = `${signedUrl}${separator}response-content-disposition=attachment${fileName ? `; filename="${encodeURIComponent(fileName)}"` : ''}`;

        if (Platform.OS === 'android') {
          try {
            // Check Android version - Android 10+ doesn't need WRITE_EXTERNAL_STORAGE
            const androidVersion = Platform.Version;
            let hasPermission = true;

            if (androidVersion < 29) {
              const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                  title: 'Storage Permission',
                  message: 'App needs access to storage to download files',
                  buttonNeutral: 'Ask Me Later',
                  buttonNegative: 'Cancel',
                  buttonPositive: 'OK',
                }
              );
              hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
            }

            if (hasPermission) {
              // Use WebView to trigger download
              setDownloadWebViewUrl(downloadUrl);
              
              Toast.show({
                type: 'success',
                text1: 'Download Started',
                text2: `${fileName} is being downloaded`,
                position: 'bottom',
              });
            } else {
              Alert.alert('Permission Denied', 'Storage permission is required to download files');
            }
          } catch (err) {
            console.error('Download error:', err);
            // Fallback: use WebView
            setDownloadWebViewUrl(downloadUrl);
            Toast.show({
              type: 'info',
              text1: 'Download',
              text2: 'Download initiated',
              position: 'bottom',
            });
          }
        } else {
          // For iOS, use WebView to trigger download
          setDownloadWebViewUrl(downloadUrl);
          Toast.show({
            type: 'success',
            text1: 'Download Started',
            text2: `${fileName} is being downloaded`,
            position: 'bottom',
          });
        }
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Alert.alert('Error', 'Failed to download document');
    }
  };

  // Show toast notification
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const showToast = (message, type = 'success') => {
   Toast.show({
    type: type,
    text1: type === 'success' ? 'Success' : 'Error',
    text2: message,
    position: 'bottom',
   });
  };

  const handleSendBackConfirm = useCallback(async (comment) => {
    if (!selectedCustomer) {
      return;
    }

    try {
      setActionLoading(true);
      const instanceId = selectedCustomer?.instaceId || selectedCustomer?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;
      const parallelGroupId = selectedCustomer?.instance?.stepInstances?.[0]?.parallelGroup;
      const stepOrderId = selectedCustomer?.instance?.stepInstances?.[0]?.stepOrder;

      const payload = {
        stepOrder: stepOrderId,
        parallelGroup: parallelGroupId,
        actorId,
        reason: comment || 'Sending back',
        dataChanges: {}
      };

      await customerAPI.workflowReassign(instanceId, payload);
      showToast('Customer sent back successfully!', 'success');
      setSendBackModalVisible(false);

      navigation.navigate('CustomerList', { sendBackToast: true });
    } catch (error) {
      console.error('Error sending back customer:', error);
      showToast(error.response?.data?.message || error.message || 'Failed to send back customer', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [selectedCustomer, loggedInUser, navigation, showToast]);

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

      // Navigate back to customer list (refresh will happen via useFocusEffect)
      // Store action in a way that persists across navigation
      // We'll use a global ref or navigation state
      const parentNav = navigation.getParent();
      if (parentNav) {
        // Set params on the parent tab navigator
        parentNav.setParams({ pendingCustomerAction: 'approve' });
      }

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

  // Handle verify customer (for LINK_DT action)
  // Handle Verify button click - fetch latest draft first
  const handleVerifyClick = async () => {
    try {
      setActionLoading(true);
      const instanceId = selectedCustomer?.instaceId || selectedCustomer?.stgCustomerId || customer?.instaceId || customer?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;

      if (!instanceId || !actorId) {
        showToast('Missing instance ID or actor ID', 'error');
        return;
      }

      // Fetch latest draft data
      const latestDraftResponse = await customerAPI.getLatestDraft(instanceId, actorId);
      
      if (latestDraftResponse?.data?.data) {
        setLatestDraftData(latestDraftResponse.data.data);
        setVerifyModalVisible(true);
      } else {
        showToast('Failed to fetch latest draft data', 'error');
      }
    } catch (error) {
      console.error('Error fetching latest draft:', error);
      showToast(`Failed to fetch latest draft: ${error.message}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Verify confirmation - call workflow action API with latest draft data
  const handleVerifyConfirm = async (comment) => {
    try {
      setActionLoading(true);
      const instanceId = selectedCustomer?.instaceId || selectedCustomer?.stgCustomerId || customer?.instaceId || customer?.stgCustomerId;
      const actorId = loggedInUser?.userId || loggedInUser?.id;

      if (!instanceId || !actorId) {
        showToast('Missing instance ID or actor ID', 'error');
        return;
      }

      // Get data from latest draft
      const draftData = latestDraftData;
      if (!draftData) {
        showToast('Latest draft data not available', 'error');
        return;
      }

      // Extract data from latest draft response
      const parallelGroup = draftData?.parallelGroup || selectedCustomer?.instance?.stepInstances?.[0]?.parallelGroup || 1;
      const stepOrder = draftData?.stepOrder || selectedCustomer?.instance?.stepInstances?.[0]?.stepOrder || 1;
      const draftEdits = draftData?.draftEdits || {};

      // Build dataChanges from latest draft
      const dataChanges = {
        mapping: draftEdits.mapping || {},
        customerGroupId: draftEdits.customerGroupId || selectedCustomer?.customerGroupId || customer?.customerGroupId,
      };

      // Add divisions if present
      if (draftEdits.divisions && draftEdits.divisions.length > 0) {
        dataChanges.divisions = draftEdits.divisions;
      }

      // Add distributors if present
      if (draftEdits.distributors && draftEdits.distributors.length > 0) {
        dataChanges.distributors = draftEdits.distributors;
      }

      const actionDataPayload = {
        action: "APPROVE",
        parallelGroup: parallelGroup,
        stepOrder: stepOrder,
        actorId: actorId,
        comments: comment || "approved",
        dataChanges: dataChanges,
      };

      const response = await customerAPI.workflowAction(instanceId, actionDataPayload);

      setVerifyModalVisible(false);
      setLatestDraftData(null);
      showToast(`Customer verified successfully!`, 'success');

      // Navigate back to customer list (refresh will happen via useFocusEffect)
      // Store action in a way that persists across navigation
      const parentNav = navigation.getParent();
      if (parentNav) {
        // Set params on the parent tab navigator
        parentNav.setParams({ pendingCustomerAction: 'verify' });
      }

      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error) {
      console.error('Error verifying customer:', error);
      showToast(`Failed to verify customer: ${error.message}`, 'error');
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

      // Navigate back to customer list (refresh will happen via useFocusEffect)
      // Store action in a way that persists across navigation
      const parentNav = navigation.getParent();
      if (parentNav) {
        // Set params on the parent tab navigator
        parentNav.setParams({ pendingCustomerAction: 'reject' });
      }

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
          {/* LEFT SECTION – 60% */}
          <View style={styles.leftSection}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
            >
              <ChevronLeft color="#333" />
            </TouchableOpacity>

            <AppText
              style={styles.headerTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getCustomerName()}
            </AppText>
          </View>

          {/* RIGHT SECTION – 40% */}
          <View style={styles.rightSection}>

            {activeTab === 'details' ? (
              <TouchableOpacity
                style={styles.logsButton}
              >
                <MaterialIcons
                  name="history"
                  size={20}
                  color="#2B2B2B"
                />
                <AppText style={styles.logsButtonText}>Logs</AppText>
              </TouchableOpacity>
            ) : (
              <>
                {/* Approve/Reject buttons for APPROVE action */}
                {customer?.statusName === 'PENDING' && customer?.action === 'APPROVE' && (
                  <PermissionWrapper permission={PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_APPROVE_REJECT}>
                    <View style={styles.topActionButtons}>
                      <TouchableOpacity 
                        style={styles.topApproveButton}
                        onPress={() => setApproveModalVisible(true)}
                        disabled={actionLoading}
                      >
                        <MaterialIcons name="check" size={14} color="#fff" />
                        <AppText style={styles.topApproveButtonText}>Approve</AppText>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.topRejectButton}
                        onPress={() => setRejectModalVisible(true)}
                        disabled={actionLoading}
                      >
                        <Icon name="close" size={14} color="#2B2B2B" />
                      </TouchableOpacity>
                    </View>
                  </PermissionWrapper>
                )}

                {/* Verify/Reject buttons for LINK_DT action */}
                {(customer?.action === 'LINK_DT' || selectedCustomer?.action === 'LINK_DT') && 
                 (customer?.statusName === 'IN_PROGRESS' || customer?.statusName === 'PENDING' || 
                  selectedCustomer?.statusName === 'IN_PROGRESS' || selectedCustomer?.statusName === 'PENDING') && (
                  <PermissionWrapper permission={PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_APPROVE_REJECT}>
                    <View style={styles.topActionButtons}>
                      <TouchableOpacity 
                        style={styles.topVerifyButton}
                        onPress={handleVerifyClick}
                        disabled={actionLoading}
                      >
                        <MaterialIcons name="check" size={14} color="#fff" />
                        <AppText style={styles.topVerifyButtonText}>Verify</AppText>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.topRejectButton}
                        onPress={() => setRejectModalVisible(true)}
                        disabled={actionLoading}
                      >
                        <CloseCircle color="#2B2B2B" />
                      </TouchableOpacity>
                    </View>
                  </PermissionWrapper>
                )}
              </>
            )            }

          </View>
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
              Linkages
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'details' && (

          <>
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
                    <View style={styles.sectionHeaderRow}>
                      <AppText style={styles.sectionTitle}>Customer Group</AppText>
                      <TouchableOpacity
                        onPress={() => setCommentsVisible(true)}
                        style={styles.commentIconButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                         <View style={styles.commentWrapper}>
                        <Comment width={22} height={22} color={colors.primary} />

                        </View>
                      </TouchableOpacity>
                    </View>

                    <View style={[styles.card, { marginBottom: 20 }]}>
                      {!isEditingCustomerGroup ? (
                        // Display mode - show customer group name and Change button
                        <View style={styles.customerGroupRow}>
                          <AppText style={styles.infoValue}>{customerData.customerGroupName}</AppText>
                          <PermissionWrapper permission={PERMISSIONS.ONBOARDING_DETAILS_PAGE_CHANGE_CUSTOMER_GROUP}>
                            <TouchableOpacity
                              style={styles.changeButton}
                              onPress={handleChangeCustomerGroup}
                              activeOpacity={0.7}
                            >

                              <Sync />
                              <AppText style={styles.changeButtonText}>Change</AppText>
                            </TouchableOpacity>
                          </PermissionWrapper>
                        </View>
                      ) : (
                        // Edit mode - show radio buttons inline
                        <View style={styles.customerGroupEditContainer}>
                          <View style={styles.radioGroupContainer}>
                            {customerGroups.length > 0 ? (
                              <>
                                <View style={styles.radioRow}>
                                  {customerGroups.slice(0, 2).map((group) => (
                                    <TouchableOpacity
                                      key={group.customerGroupId}
                                      style={[styles.radioOption, styles.radioOptionFlex]}
                                      onPress={() => {
                                        setSelectedGroupId(group.customerGroupId);
                                      }}
                                    >
                                      <View style={styles.radioCircle}>
                                        {selectedGroupId === group.customerGroupId && (
                                          <View style={styles.radioSelected} />
                                        )}
                                      </View>
                                      <AppText style={styles.radioText}>
                                        {group.customerGroupId}-{group.customerGroupName}
                                      </AppText>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                                {customerGroups.length > 2 && (
                                  <View style={styles.radioRow}>
                                    {customerGroups.slice(2, 4).map((group) => (
                                      <TouchableOpacity
                                        key={group.customerGroupId}
                                        style={[styles.radioOption, styles.radioOptionFlex]}
                                        onPress={() => setSelectedGroupId(group.customerGroupId)}
                                      >
                                        <View style={styles.radioCircle}>
                                          {selectedGroupId === group.customerGroupId && (
                                            <View style={styles.radioSelected} />
                                          )}
                                        </View>
                                        <AppText style={styles.radioText}>
                                          {group.customerGroupId}-{group.customerGroupName}
                                        </AppText>
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                )}
                              </>
                            ) : (
                              <ActivityIndicator size="small" color={colors.primary} />
                            )}
                          </View>

                          <View style={styles.inlineModalButtons}>

                            <TouchableOpacity
                              style={styles.inlineDoneButton}
                              onPress={handleDoneCustomerGroup}
                              disabled={updatingCustomerGroup}
                            >
                              {updatingCustomerGroup ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <AppText style={styles.inlineDoneButtonText}>Done</AppText>
                              )}
                            </TouchableOpacity>


                            <TouchableOpacity
                              style={styles.inlineCancelButton}
                              onPress={handleCancelCustomerGroup}
                            >
                              <AppText style={styles.inlineCancelButtonText}>Cancel</AppText>
                            </TouchableOpacity>

                          </View>
                        </View>
                      )}


                    </View>


                    
                  </AnimatedSection>
                )}





              </Animated.View>
            )}
          </ScrollView>

          </>
        )}



        {activeTab === 'linkaged' && <LinkagedTab
          customerType={customerData.customerType}
          customerId={customerData.customerId}
          mappingData={selectedCustomer?.mapping}
          hasApprovePermission={customer?.action === 'APPROVE'}
          isCustomerActive={customer?.statusName === 'ACTIVE' || selectedCustomer?.statusName === 'ACTIVE'}
          customerRequestedDivisions={selectedCustomer?.divisions || []}
          instanceId={(() => {
            const statusName = customer?.statusName || selectedCustomer?.statusName;
            // If status is ACTIVE, use stageId[0]
            if (statusName === 'ACTIVE') {
              return selectedCustomer?.stageId?.[0] || customer?.stageId?.[0];
            }
            // For PENDING and other customers, use stageId[0] or stgCustomerId
            return selectedCustomer?.stageId?.[0] || customer?.stageId?.[0] || selectedCustomer?.stgCustomerId || customer?.stgCustomerId;
          })()}
          instance={customerData?.instance || selectedCustomer?.instance}
          customerGroupId={selectedCustomer?.customerGroupId || customer?.customerGroupId}
          action={customer?.action || selectedCustomer?.action}
        />}

        {/* Action Buttons - Show only on Details tab and if customer action is APPROVE and status is PENDING */}
        {activeTab === 'details' && customer?.statusName === 'PENDING' && customer?.action === 'APPROVE' && (
          <PermissionWrapper permission={PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_APPROVE_REJECT}>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.sendBackButton}
                onPress={() => setSendBackModalVisible(true)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>

                    <Reassigned color={colors.primary} width={18} height={18} />

                    <AppText style={styles.sendBackButtonText}>Send Back</AppText>
                  </>
                )}
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
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => setRejectModalVisible(true)}
                disabled={actionLoading}
              >
                <Icon name="close-circle-outline" size={20} color="#2B2B2B" />
                <AppText style={styles.rejectButtonText}>Reject</AppText>
              </TouchableOpacity>

            </View>
          </PermissionWrapper>
        )}

        {/* Action Buttons for LINK_DT - Show only on Details tab and if customer action is LINK_DT */}
        {activeTab === 'details' && (customer?.action === 'LINK_DT' || selectedCustomer?.action === 'LINK_DT') && (
          <PermissionWrapper permission={PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_APPROVE_REJECT}>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.sendBackButton}
                onPress={() => setSendBackModalVisible(true)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Reassigned color={colors.primary} width={18} height={18} />
                    <AppText style={styles.sendBackButtonText}>Send Back</AppText>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={handleVerifyClick}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="check" size={20} color="#fff" />
                    <AppText style={styles.verifyButtonText}>Verify</AppText>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => setRejectModalVisible(true)}
                disabled={actionLoading}
              >
                <CloseCircle color="#2B2B2B" />
                <AppText style={styles.rejectButtonText}>Reject</AppText>
              </TouchableOpacity>
            </View>
          </PermissionWrapper>
        )}

        <DocumentModal />

        {/* Hidden WebView for automatic downloads */}
        {downloadWebViewUrl && (
          <WebView
            ref={downloadWebViewRef}
            source={{ uri: downloadWebViewUrl }}
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
            onShouldStartLoadWithRequest={(request) => {
              // Allow the download to proceed
              return true;
            }}
            onLoadEnd={() => {
              // Reset after a short delay to allow download to start
              setTimeout(() => {
                setDownloadWebViewUrl(null);
              }, 2000);
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              setDownloadWebViewUrl(null);
            }}
            // Android download handler - this triggers the download manager
            onFileDownload={(request) => {
              // Download request received
              console.log('Download request:', request);
              // The download should start automatically
              setTimeout(() => {
                setDownloadWebViewUrl(null);
              }, 1000);
            }}
            // iOS - downloads are handled automatically
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            // Enable downloads
            allowsBackForwardNavigationGestures={false}
            startInLoadingState={false}
          />
        )}

        <CommentsModal
          visible={commentsVisible}
          onClose={() => setCommentsVisible(false)}
          moduleRecordId={(() => {
            const statusName = customer?.statusName || selectedCustomer?.statusName;
            if (statusName === 'ACTIVE') {
              return selectedCustomer?.stageId?.[0] || customer?.stageId?.[0] || selectedCustomer?.stgCustomerId || customer?.stgCustomerId;
            }
            // For PENDING and other customers, use regular customerId (actual flow)
            return selectedCustomer?.stgCustomerId || customer?.customerId || selectedCustomer?.stgCustomerId || customer?.stgCustomerId;
          })()}
          moduleName={selectedCustomer?.moduleName || 'NEW_CUSTOMER_ONBOARDING'}
        />

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

        {/* Send Back Modal */}
        <RejectCustomerModal
          visible={sendBackModalVisible}
          onClose={() => setSendBackModalVisible(false)}
          onConfirm={handleSendBackConfirm}
          titleText={'Are you sure you want to\nSend back customer?'}
          confirmLabel="Send Back"
          requireComment={true}
          loading={actionLoading}
        />

        {/* Verify Modal */}
        <ApproveCustomerModal
          visible={verifyModalVisible}
          onClose={() => {
            setVerifyModalVisible(false);
            setLatestDraftData(null);
          }}
          onConfirm={handleVerifyConfirm}
          title="Verify Customer"
          actionType="verify"
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
  // header: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   paddingHorizontal: 20,
  //   paddingVertical: 12,
  //   backgroundColor: '#fff',
  //   zIndex: 999
  // },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 'auto',
    marginLeft: 15,
    flex: 1,
    flexShrink: 1,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  commentIconButton: {
    padding: 6,
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
  customerGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E67E22', // Darker orange border
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 4,
  },
  changeButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  // Customer Group Inline Edit Styles
  customerGroupEditContainer: {

    backgroundColor: "#fbfbfbr",
    padding: 20,

    borderRadius: 10
  },
  radioGroupContainer: {
    marginBottom: 0,
  },
  radioRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 30,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    flex: 1,
  },
  radioOptionFlex: {
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  inlineModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 0,
    maxWidth: "70%"
  },
  inlineDoneButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inlineCancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineCancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
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
    overflow: 'hidden',
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
    overflow: 'hidden',
    height: 300,
    justifyContent: 'center',
    width: '100%',
  },
  zoomableImageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
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
    paddingHorizontal: 15,
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
    borderWidth: 1,
    borderColor: "#2B2B2B",
    backgroundColor: '#fff',
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: "#2B2B2B",
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
  verifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 8,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sendBackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "#fff",
    gap: 8,
  },
  sendBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },

  leftSection: {
    flex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  rightSection: {
    flex: 4,
    alignItems: 'flex-end',
  },

  backBtn: {
    marginRight: 8,
  },

  logsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#2B2B2B",
    backgroundColor: '#fff',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  logsButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: "#2B2B2B",
  },
  topActionButtons: {

    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  topApproveButton: {

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 10,
  },
  topApproveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  topVerifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 6,
  },
  topVerifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  topRejectButton: {
    width: 24,
    height: 24,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#2B2B2B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPreviewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenPreviewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullScreenCloseButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  imagePreviewTouchable: {
    width: '100%',
    height: '100%',
  },
  commentWrapper:{

    backgroundColor:"#F7941E1A",
    borderRadius:100,
    padding:10
    

  },
});

export default CustomerDetail;