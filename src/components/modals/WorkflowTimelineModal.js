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
import { colors } from '../../styles/colors';
import CloseCircle from '../icons/CloseCircle';
import { customerAPI } from '../../api/customer';
import Toast from 'react-native-toast-message';

// Reusable Vertical Timeline Component
const VerticalTimeline = ({ steps }) => {
  return (
    <View style={styles.timelineContainer}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.status === 'APPROVED' || step.status === 'SUBMITTED' || step.status === 'submitted' || step.status === 'COMPLETED';
        const isRejected = step.status === 'REJECTED' || step.status === 'rejected';
        const isPending = step.status === 'PENDING' || step.status === 'NOT_ASSIGNED' || !step.status || step.status === 'SKIPPED';

        // Status indicator colors
        const indicatorColor = isCompleted 
          ? '#10B981' // green
          : isRejected 
          ? '#EF4444' // red
          : '#D1D5DB'; // grey

        // Badge colors
        const badgeColor = step.status === 'SUBMITTED' || step.status === 'submitted'
          ? '#3B82F6' // blue
          : step.status === 'APPROVED' || step.status === 'approved'
          ? '#10B981' // green
          : step.status === 'REJECTED' || step.status === 'rejected'
          ? '#EF4444' // red
          : step.status === 'COMPLETED'
          ? '#10B981' // green
          : '#9CA3AF'; // grey

        return (
          <View key={index} style={styles.timelineStep}>
            {/* Left: Step Label */}
            <View style={styles.stepLabelContainer}>
              <AppText style={styles.stepLabel}>
                {step.label}
                {step.subHeaderName ? ` ${step.subHeaderName}` : ''}
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
              </View>
              {!isLast && (
                <View 
                  style={[
                    styles.verticalLine,
                    { 
                      backgroundColor: isCompleted || isRejected 
                        ? (isCompleted ? '#10B981' : '#EF4444') 
                        : '#E5E7EB'
                    }
                  ]} 
                />
              )}
            </View>

            {/* Right: Status Details */}
            <View style={styles.stepDetailsContainer}>
              {step.status && !isPending ? (
                <>
                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
                    <AppText style={styles.statusBadgeText}>
                      {step.status === 'submitted' ? 'SUBMITTED' : 
                       step.status === 'approved' ? 'APPROVED' :
                       step.status === 'rejected' ? 'REJECTED' :
                       step.status.toUpperCase()}
                    </AppText>
                  </View>
                  
                  {/* User Name */}
                  <AppText style={styles.userName}>{step.userName}</AppText>
                  
                  {/* Date/Time with Calendar Icon */}
                  {step.dateTime && (
                    <View style={styles.dateTimeContainer}>
                      <Icon name="calendar-outline" size={14} color="#6B7280" />
                      <AppText style={styles.dateTime}>{step.dateTime}</AppText>
                    </View>
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

const WorkflowTimelineModal = ({ visible, onClose, stageId, customerName, customerType }) => {
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accordionData, setAccordionData] = useState([]);

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
      approvers.forEach(approver => allStepOrders.add(approver.stepOrder));
      stepHeaders.forEach(stepHeader => allStepOrders.add(stepHeader.stepOrder));
      
      // Sort stepOrders to maintain proper order
      const sortedStepOrders = Array.from(allStepOrders).sort((a, b) => a - b);

      // Build steps in order
      sortedStepOrders.forEach((stepOrder) => {
        const approver = approverMap[stepOrder];
        const stepHeader = stepHeaderMap[stepOrder];

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
              subHeaderName: '' // Don't show subHeaderName for INITIATOR
            });
          }
          return;
        }

        // Handle FINAL_STATUS
        if (stepHeader && stepHeader.approverType === 'FINAL_STATUS') {
          if (approver) {
            steps.push({
              label: approver.headerName || stepHeader.headerName || 'Final Status',
              status: approver.status || 'COMPLETED',
              userName: approver.assignedUserName || null,
              dateTime: approver.actedAt ? formatDateTime(approver.actedAt) : null,
              subHeaderName: approver.subHeaderName || stepHeader.subHeaderName || ''
            });
          }
          return;
        }

        // Handle regular approval steps
        if (approver) {
          // Use approver data (it has the actual status and user info)
          steps.push({
            label: approver.headerName || (stepHeader ? stepHeader.headerName : 'Unknown'),
            status: approver.status || 'PENDING',
            userName: approver.assignedUserName || null,
            dateTime: approver.actedAt ? formatDateTime(approver.actedAt) : null,
            subHeaderName: approver.subHeaderName || (stepHeader ? stepHeader.subHeaderName : '')
          });
        } else if (stepHeader) {
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

  // Fetch workflow data when modal opens
  useEffect(() => {
    if (visible && stageId) {
      fetchWorkflowData();
    } else if (visible && !stageId) {
      // Show error if no stageId
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Stage ID is required to fetch workflow timeline',
      });
      setLoading(false);
    } else {
      // Reset when modal closes
      setAccordionData([]);
      setExpandedAccordion(null);
    }
  }, [visible, stageId]);

  const fetchWorkflowData = async () => {
    if (!stageId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Stage ID is required',
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Fetching workflow data for stageId:', stageId);
      const response = await customerAPI.getWorkflowProgression([stageId]);
      console.log('🔍 API Response:', JSON.stringify(response, null, 2));
      
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        const workflow = response.data[0];
        console.log('🔍 Workflow object:', workflow);
        console.log('🔍 Progressions:', workflow.progressions?.length);
        
        const transformed = transformWorkflowData(response);
        console.log('🔍 Transformed accordion data:', transformed);
        console.log('🔍 Number of accordions:', transformed.length);
        setAccordionData(transformed);
        
        // Auto-expand first accordion if available
        if (transformed.length > 0) {
          setExpandedAccordion(transformed[0].id);
          console.log('✅ Auto-expanded first accordion:', transformed[0].id);
        } else {
          Toast.show({
            type: 'info',
            text1: 'No Timeline',
            text2: 'No workflow progressions found',
          });
        }
      } else {
        console.warn('⚠️ Invalid response structure:', response);
        Toast.show({
          type: 'info',
          text1: 'No Data',
          text2: 'No workflow data available for this customer',
        });
        setAccordionData([]);
      }
    } catch (error) {
      console.error('❌ Error fetching workflow progression:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch workflow progression',
      });
      setAccordionData([]);
    } finally {
      setLoading(false);
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
              {customerName || 'Workflow Timeline'}
            </AppText>
            <TouchableOpacity onPress={onClose}>
              <CloseCircle color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText style={styles.loadingText}>Loading workflow timeline...</AppText>
            </View>
          ) : accordionData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>No workflow data available</AppText>
            </View>
          ) : (
            <ScrollView 
              style={styles.scrollView} 
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.scrollContent}
            >
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
            </ScrollView>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexShrink: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
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
    padding: 20,
    paddingBottom: 40,
  },
  // Accordion Styles
  accordionItem: {
    marginBottom: 16,
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
    width: 140,
    paddingRight: 16,
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
    marginRight: 16,
    position: 'relative',
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
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
  pendingPlaceholder: {
    paddingTop: 4,
  },
  pendingText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default WorkflowTimelineModal;
