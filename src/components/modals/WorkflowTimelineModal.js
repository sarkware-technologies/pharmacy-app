/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../';
import AppView from '../AppView';
import { colors } from '../../styles/colors';
import CloseCircle from '../icons/CloseCircle';
import { customerAPI } from '../../api/customer';
import Toast from 'react-native-toast-message';
import Reassigned from '../icons/Reassigned';
import Downarrow from "../icons/downArrow";


// Reusable Vertical Timeline Component
const VerticalTimeline = ({ steps }) => {
  return (
    <View style={styles.timelineContainer}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === 'APPROVED' || step.status === 'APPROVE' || step.status === 'SUBMITTED' || step.status === 'submitted' || step.status === 'COMPLETED' || step.status === 'RE-SUBMITTED' || step.status === 're-submitted';
        const isRejected = step.status === 'REJECTED' || step.status === 'rejected';
        const isPending = step.status === 'PENDING' || step.status === 'pending';
        const isInProgress = step.status === 'IN_PROGRESS';
        const isOthers = step.status === 'NOT_ASSIGNED' || !step.status || step.status === 'SKIPPED';
        const isReassigned = step.status === 'REASSIGNED' || !step.status || step.status === 'reassigned';

        // Status indicator colors
        let indicatorColor = '#D1D5DB';

        if (isCompleted) indicatorColor = '#10B981';
        else if (isRejected) indicatorColor = '#EF4444';
        else if (isReassigned) indicatorColor = '#AB65AD';
        else if (isPending || isInProgress) indicatorColor = '#F4AD48';

        const status = (step.status || '').toUpperCase();
        const badgeColor = isCompleted
          ? '#1695601A'
          : isRejected
            ? '#F568681A'
            : isReassigned
              ? '#AB65AD1A'
              : isPending
                ? '#F4AD481A'
                : status === 'SUBMITTED'
                  ? '#5995C71A'
                  : '#9CA3AF';

        const badgeTextColor = isCompleted
          ? '#169560'
          : isRejected
            ? '#F56868'
            : isReassigned
              ? '#AB65AD'
              : isPending
                ? '#F4AD48'
                : status === 'SUBMITTED'
                  ? '#5995C7'
                  : '#e5e7eb';

        return (
          <View key={index} style={styles.timelineStep}>
            {/* Left: Step Label */}
            <View style={styles.stepLabelContainer}>
              <AppText style={styles.stepLabel}>
                {step.label}
              </AppText>
              <AppText style={styles.stepLabel}>
                {step.subHeaderName ? step.subHeaderName : ''}
              </AppText>
            </View>

            {/* Center: Status Indicator and Vertical Line */}
            <View style={styles.indicatorContainer}>
              <View style={[styles.statusIndicator, {
                backgroundColor: indicatorColor,
                borderColor: '#fff'
              }]}>
                {isCompleted && (
                  <Icon name="checkmark" size={12} color="#fff" />
                )}
                {isRejected && (
                  <Icon name="close" size={12} color="#fff" />
                )}

                {(isPending || isInProgress) && (
                  <Icon name="time-outline" size={12} color="#fff" />
                )}

                {(isReassigned) && (
                  // <Icon name="arrow-undo-outline" size={12} color="#fff" />
                  <Reassigned />
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.verticalLine,

                    {
                      backgroundColor: isCompleted
                        ? '#000000'
                        : '#E3E3E3'
                    }
                  ]}
                />
              )}
            </View>

            {/* Right: Status Details */}
            <View style={styles.stepDetailsContainer}>
              {step.status && !isOthers ? (
                <>
                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                    <AppText style={[styles.statusBadgeText, { color: badgeTextColor }]}>
                      {step.status === 'submitted' ? 'SUBMITTED' :
                        step.status === 'approved' ? 'APPROVED' :
                          step.status === 'rejected' ? 'REJECTED' :
                            step.status === 'REASSIGNED' ? 'SENT BACK' :
                              step.status.toUpperCase()}
                    </AppText>
                  </View>

                  {/* User Name */}

                  {step.userName != null && <AppText style={styles.userName}>{step.userName}</AppText>}


                  {/* Date/Time with Calendar Icon */}
                  {step.dateTime && (
                    <View style={styles.dateTimeContainer}>
                      <Icon name="calendar-outline" size={14} color="#6B7280" />
                      <AppText style={styles.dateTime}>{step.dateTime}</AppText>
                    </View>
                  )}


                  {step.comments && (
                    <AppText style={styles.comments}>{step.comments}</AppText>
                  )}
                </>
              ) : (
                // Pending steps show nothing (empty view) as per screenshot design
                <View style={styles.pendingPlaceholder} />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

// Accordion Item Component
const AccordionItem = ({ title, isExpanded, onToggle, children }) => {
  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <AppText style={styles.accordionTitle}>{title}</AppText>
        <Icon
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.accordionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

const renderLinkedCustomerDropdown = ({ selectedCustomer, linkedCustomers, isDropdownOpen, setIsDropdownOpen, setSelectedCustomer }) => {


  return (
    <View style={styles.dropdownSection}>
      <AppText style={[styles.title, { marginBottom: 5 }]}>Linkages</AppText>

      {/* 👇 IMPORTANT: relative container */}
      <View style={styles.dropdownWrapper}>
        {/* Selected box */}
        <TouchableOpacity
          style={[
            styles.dropdownSelector,
            selectedCustomer?.parentCustomerId && styles.selectedCustomer
          ]}
          activeOpacity={0.8}
          onPress={() => setIsDropdownOpen(prev => !prev)}
        >

          <AppText style={styles.dropdownSelectedText}>
            {selectedCustomer?.parentCustomerId
              ? selectedCustomer.customerName
              : linkedCustomers.length > 0
                ? `${linkedCustomers.length} linkage${linkedCustomers.length > 1 ? 's' : ''}`
                : 'No linkage'}
          </AppText>


          {selectedCustomer?.stageCustomerId && (
            <AppText style={styles.parentId}>
              {selectedCustomer?.stageCustomerId}
            </AppText>
          )}


          <View style={{ paddingRight: 5, paddingLeft: 10, transform: [{ rotate: !isDropdownOpen ? "0deg" : "180deg" }] }} >
            <Downarrow />
          </View>

        </TouchableOpacity>

        {/* Floating list */}
        {(isDropdownOpen && linkedCustomers?.length) && (
          <View style={styles.dropdownList}>
            <ScrollView nestedScrollEnabled>
              {linkedCustomers.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCustomer(item);
                    setIsDropdownOpen(false);
                  }}
                >
                  <AppView>
                    <AppView width={"100%"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"}>
                      <AppText style={styles.itemName}>{item.customerName}</AppText>
                      <AppText style={styles.parentId}>
                        {item?.stageCustomerId}
                      </AppText>
                    </AppView>


                    <AppText style={styles.itemType}>
                      {item.customerType || 'Doctor'}
                    </AppText>
                  </AppView>

                  <AppText style={styles.itemId}>
                    {item.customerCode || item.cityId}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {selectedCustomer?.stageCustomerId &&
        <AppText style={styles.classification}>
          Classification: <AppText color='#2B2B2B'>{selectedCustomer?.customerType}</AppText>
        </AppText>}
    </View>

  );
};


const WorkflowTimelineModal = ({ visible, onClose, customer }) => {

  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accordionData, setAccordionData] = useState([]);
  const [linkedCustomers, setLinkedCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Format date to "DD/MM/YYYY | HH:MM:SS"
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      // Handle both formats: "2025-12-08 02:08:19" and ISO format
      const date = new Date(dateString.replace(' ', 'T'));
      if (isNaN(date.getTime())) return dateString; // Return original if invalid

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} | ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return dateString;
    }
  };

  // Transform API response to accordion data
  const transformWorkflowData = (apiResponse) => {
    if (!apiResponse || !apiResponse.data || !Array.isArray(apiResponse.data) || apiResponse.data.length === 0) {
      return [];
    }

    const workflow = apiResponse.data[0];
    const progressions = workflow.progressions || [];
    const instanceId = workflow.instanceId || workflow.moduleRecordId || 'N/A';

    const accordions = progressions.map((progression, index) => {
      const restartCycle = progression.restartCycle || index;
      const approvers = progression.approvers || [];
      const stepHeaders = progression.stepHeaders || workflow.stepHeaders || [];

      // Create a map of approvers by stepOrder for quick lookup
      const approverMap = {};
      approvers.forEach((approver) => {
        approverMap[approver.stepOrder] = approver;
      });

      // Build timeline steps by combining stepHeaders with approvers
      const steps = [];

      // Create a map of stepHeaders by stepOrder
      const stepHeaderMap = {};

      stepHeaders.forEach((stepHeader) => {
        stepHeaderMap[stepHeader.stepOrder] = stepHeader;
      });

      // Get all unique stepOrders from both approvers and stepHeaders
      const allStepOrders = new Set();
      stepHeaders.forEach(stepHeader => allStepOrders.add(stepHeader.stepOrder));
      approvers.forEach(approver => allStepOrders.add(approver.stepOrder));

      // Sort stepOrders to maintain proper order
      const sortedStepOrders = Array.from(allStepOrders).sort((a, b) => a - b);



      // Build steps in order
      sortedStepOrders.forEach((stepOrder) => {
        const stepHeader = stepHeaderMap[stepOrder];
        const approver = approverMap[stepOrder];


        // Handle INITIATOR (stepOrder 0) - "Submitted" or show subroleName like "MR"
        if (stepOrder === 0 || (stepHeader && stepHeader.approverType === 'INITIATOR')) {
          if (approver) {
            // For INITIATOR, prefer subroleName (e.g., "MR") over headerName ("Submitted")
            const label = approver.subroleName || approver.headerName || 'Submitted';
            steps.push({
              label: label,
              status: approver.status || 'submitted',
              userName: approver.assignedUserName || null,
              dateTime: approver.actedAt ? formatDateTime(approver.actedAt) : null,
              subHeaderName: '', // Don't show subHeaderName for INITIATOR,
              comments: approver.comments || null

            });


          }
          return;
        }
        // Handle FINAL_STATUS
        if (stepHeader && stepHeader.approverType === 'FINAL_STATUS') {
          if (stepHeader) {
            steps.push({
              label: approver.stepName || 'Final Status',
              status: approver.status || 'COMPLETED',
              userName: approver.assignedUserName || null,
              dateTime: approver.actedAt ? formatDateTime(approver.actedAt) : null,
              subHeaderName: approver.subHeaderName || stepHeader.subHeaderName || '',
              comment: approver.comment || null
            });
          }
          return;
        }
        if (approver) {
          const isSkipped = approver.status === 'SKIPPED';
          const activity = isSkipped && approver.activities?.length
            ? approver.activities[0]
            : null;
          steps.push({
            label: approver.headerName || stepHeader?.headerName || 'Unknown',

            // ✅ status from activity if skipped
            status: isSkipped && activity?.action
              ? activity.action
              : approver.status || 'PENDING',

            // ✅ actor name from activity if skipped
            userName: isSkipped && activity?.actorName
              ? activity.actorName
              : approver.assignedUserName || null,

            // ✅ timestamp from activity if skipped
            dateTime: isSkipped && activity?.timestamp
              ? formatDateTime(activity.timestamp)
              : approver.actedAt
                ? formatDateTime(approver.actedAt)
                : null,

            subHeaderName: approver.subHeaderName || stepHeader?.subHeaderName || '',
            comments: approver.comments || null
          });
        }
        else if (stepHeader) {
          // Step exists in stepHeaders but no approver yet (pending)
          steps.push({
            label: stepHeader.headerName || stepHeader.stepName || 'Unknown',
            status: 'PENDING',
            userName: null,
            dateTime: null,
            subHeaderName: stepHeader.subHeaderName || ''
          });
        }
      });

      // Determine accordion title based on restart cycle
      let title = `Task Id ${instanceId}`;
      if (restartCycle === 0) {
        title += ' | Creation';
      } else {
        title += ` | Approve`;
      }

      return {
        id: `task-${instanceId}-${restartCycle}`,
        title: title,
        steps: steps
      };
    });

    return accordions;
  };

  useEffect(() => {
    if (customer) {
      setSelectedCustomer(customer);
    }
  }, [customer]);

  useEffect(() => {
    if (!visible) {
      setAccordionData([]);
      setExpandedAccordion(null);
      setLinkedCustomers([]);
      setSelectedCustomer(null);
      setIsDropdownOpen(false);
      setLoading(false);
      return;
    }

    if (!customer) return;
    setLoading(true);

    if (customer?.isStaging) {
      fetchLinkedCustomers();
    }

  }, [visible, customer]);
  useEffect(() => {
    if (selectedCustomer) {
      fetchWorkflowData(selectedCustomer);
    }
  }, [selectedCustomer]);




  const fetchWorkflowData = async (cust) => {
    if (!cust) return;

    try {
      setLoading(true);
      let id = null;
      if (cust?.stageId?.length) {
        id = cust?.childStageId?.length
          ? [...cust.stageId]
          : cust.stageId;
      } else if (cust?.stgCustomerId) {
        id = cust.stgCustomerId;
      } else if (cust?.stageCustomerId) {
        id = cust.stageCustomerId;
      }



      const response = await customerAPI.getWorkflowProgression(id);
      const transformed = transformWorkflowData(response);

      setAccordionData(transformed);
      setExpandedAccordion(transformed?.[0]?.id ?? null);

    } catch (error) {
      setAccordionData([]);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch workflow progression',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkedCustomers = async () => {
    if (!customer?.stgCustomerId) return;

    try {
      const response = await customerAPI.getLinkedChildByParentId(
        customer?.stgCustomerId
      );

      if (Array.isArray(response?.data) && response.data.length > 0) {
        setLinkedCustomers(response?.data);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch linked customers',
      });
    }
  };

  const toggleAccordion = (id) => {
    setExpandedAccordion(expandedAccordion === id ? null : id);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <AppText style={styles.title}>
              {customer?.isStaging ? "Customer" : (customer?.customerName + " | " + customer?.customerType || 'Workflow Timeline')}
            </AppText>
            <TouchableOpacity onPress={onClose}>
              <CloseCircle color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
          >
            {customer?.isStaging && (
              <>

                <View style={styles.parentCustomerSection}>
                  {/* Parent Customer Box */}
                  <TouchableOpacity style={[
                    styles.parentCustomerBox,
                    !selectedCustomer?.parentCustomerId && styles.selectedCustomer
                  ]} onPress={() => { setSelectedCustomer(customer) }}>
                    <AppText style={styles.parentName}>
                      {customer?.customerName}
                    </AppText>
                    <AppText style={styles.parentId}>
                      {customer?.stgCustomerId ?? customer?.customerId}
                    </AppText>


                  </TouchableOpacity>

                  <AppText style={styles.classification}>
                    Classification: <AppText color='#2B2B2B'>{customer?.customerType}</AppText>
                  </AppText>

                </View>


                {renderLinkedCustomerDropdown({

                  selectedCustomer,
                  linkedCustomers,
                  isDropdownOpen,
                  setIsDropdownOpen,
                  setSelectedCustomer
                })}



              </>
            )}


            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <AppText style={styles.loadingText}>Loading workflow timeline...</AppText>
              </View>
            ) : accordionData.length > 0 ? (


              <View>






                {/* Render Accordions for each progression */}
                {accordionData && accordionData.length > 0 ? (
                  accordionData.map((accordion) => {
                    if (!accordion || !accordion.id) {
                      return null;
                    }
                    return (
                      <AccordionItem
                        key={accordion.id}
                        title={accordion.title || 'Untitled'}
                        isExpanded={expandedAccordion === accordion.id}
                        onToggle={() => toggleAccordion(accordion.id)}
                      >
                        {accordion.steps && accordion.steps.length > 0 ? (
                          <VerticalTimeline steps={accordion.steps} />
                        ) : (
                          <View style={styles.emptyContainer}>
                            <AppText style={styles.emptyText}>No steps available</AppText>
                          </View>
                        )}
                      </AccordionItem>
                    );
                  })
                ) : (
                  <View style={styles.emptyContainer}>
                    <AppText style={styles.emptyText}>No workflow timeline data available</AppText>
                  </View>
                )}

              </View>

            ) : (
              <View style={styles.emptyContainer}>
                <AppText style={styles.emptyText}>No workflow data available</AppText>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingBottom: 20,
  },
  header: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E5E7EB',
    flexShrink: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    maxWidth: "90%"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  // Accordion Styles
  accordionItem: {
    marginBottom: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  accordionContent: {
    padding: 20,
  },
  // Timeline Styles
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 20,
    minHeight: 60,
  },
  stepLabelContainer: {
    width: 115,
    paddingRight: 4,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  indicatorContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 50,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  verticalLine: {
    position: 'absolute',
    width: 2,
    top: 20,
    bottom: -20,
    left: '50%',
    marginLeft: -1,
    minHeight: 50,
  },
  stepDetailsContainer: {
    flex: 1,
    paddingTop: 0,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusBadgeText: {

    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    // marginBottom: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dateTime: {
    fontSize: 12,
    color: '#6B7280',
  },

  comments: {
    backgroundColor: "#F5F5F6",
    padding: 10,
    marginTop: 6,
    borderRadius: 10,
    fontSize: 11,
    color: "#2B2B2B"


  },
  pendingPlaceholder: {
    paddingTop: 4,
  },
  pendingText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },



  dropdownSection: {
    marginBottom: 16,

  },

  dropdownWrapper: {
    position: 'relative',

  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
  },

  /* Selected value box */
  dropdownSelector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: "#909090",
  },

  dropdownSelectedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },

  /* Dropdown list container */
  dropdownList: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    maxHeight: 280,
    overflow: 'hidden',
  },

  /* Each row */
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 15
  },

  /* Left side text */
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },

  itemType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  /* Right side ID */
  itemId: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 12,
    textAlign: 'right',
  },





  parentCustomerSection: {
    marginBottom: 20,
  },

  parentCustomerBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: "#909090",

  },

  parentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  parentId: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },

  classification: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
  },


  selectedCustomer: {
    borderColor: "#F7941E",
    backgroundColor: "#F7941E0D"
  }
});

export default WorkflowTimelineModal;
