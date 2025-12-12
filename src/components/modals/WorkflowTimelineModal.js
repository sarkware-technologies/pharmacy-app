/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../';
import { colors } from '../../styles/colors';
import CloseCircle from '../icons/CloseCircle';
import CheckCircle from '../icons/CheckCircle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WorkflowTimelineModal = ({ visible, onClose, workflowData, loading, customerName, customerType }) => {


  

  // Format date to "DD/MM/YYYY | HH:MM:SS"
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} | ${hours}:${minutes}:${seconds}`;
  };

  // Extract workflow data from nested response structure
  const extractWorkflowData = () => {
    if (!workflowData) return null;
    
    // Handle nested response: response.data.data[0]
    let workflow = null;
    if (workflowData.data && workflowData.data.data && Array.isArray(workflowData.data.data) && workflowData.data.data.length > 0) {
      workflow = workflowData.data.data[0];
    } else if (workflowData.data && Array.isArray(workflowData.data) && workflowData.data.length > 0) {
      workflow = workflowData.data[0];
    } else if (workflowData.data && workflowData.data.instanceId) {
      workflow = workflowData.data;
    }
    
    return workflow;
  };

  const workflow = extractWorkflowData();

  if (!workflow) {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <AppText style={styles.title}>Workflow Timeline</AppText>
              <TouchableOpacity onPress={onClose}>
                <CloseCircle color="#666" />
              </TouchableOpacity>
            </View>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <AppText style={styles.emptyText}>No workflow data available</AppText>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  const progressions = workflow.progressions || [];
  const latestProgression = progressions[progressions.length - 1] || {};
  const approvers = latestProgression.approvers || [];
  const instanceId = workflow.instanceId || workflow.moduleRecordId || 'N/A';

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'COMPLETED':
        return '#10B981'; // green
      case 'SUBMITTED':
        return '#3B82F6'; // blue
      case 'REJECTED':
        return '#EF4444'; // red
      case 'PENDING':
      case 'IN_PROGRESS':
        return '#F59E0B'; // yellow
      case 'NOT_ASSIGNED':
        return '#9CA3AF'; // gray
      default:
        return '#9CA3AF'; // gray
    }
  };

  const isCompleted = (status) => {
    return status?.toUpperCase() === 'APPROVED' || status?.toUpperCase() === 'COMPLETED';
  };

  const isInProgress = (status) => {
    return status?.toUpperCase() === 'PENDING' || status?.toUpperCase() === 'IN_PROGRESS' || status?.toUpperCase() === 'SUBMITTED';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <AppText style={styles.title}>Workflow Timeline</AppText>
            <TouchableOpacity onPress={onClose}>
              <CloseCircle color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Workflow Header */}
              <View style={styles.workflowHeader}>
                <View style={styles.workflowHeaderTop}>
                  <AppText style={styles.taskIdText}>
                    Task Id {instanceId} | {workflow.workflowStatus || 'N/A'}
                  </AppText>
                </View>
                {customerName && (
                  <AppText style={styles.customerInfoText}>
                    {customerName}
                    {customerType && ` | ${customerType}`}
                  </AppText>
                )}
              </View>

              {/* Horizontal Timeline */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalTimelineContainer}
                style={styles.horizontalTimelineScroll}
              >
                {approvers.map((approver, index) => {
                  const isLast = index === approvers.length - 1;
                  const statusColor = getStatusColor(approver.status);
                  const completed = isCompleted(approver.status);
                  const inProgress = isInProgress(approver.status);
                  const stepName = approver.headerName || approver.stepName || approver.subHeaderName || '';
                  const hasAssignedUser = approver.assignedUserName && approver.assignedUserId;

                  // Determine line color - green if previous step is completed, gray if not
                  const prevApprover = index > 0 ? approvers[index - 1] : null;
                  const prevCompleted = prevApprover ? isCompleted(prevApprover.status) : false;
                  const lineColor = prevCompleted ? getStatusColor(prevApprover.status) : '#E5E7EB';

                  return (
                    <View key={index} style={styles.horizontalTimelineItem}>
                      {/* Step Content */}
                      <View style={styles.stepContent}>
                        {/* Checkmark or Status Icon */}
                        <View style={styles.checkmarkContainer}>
                          {completed ? (
                            <CheckCircle width={32} height={32} color={statusColor} />
                          ) : (
                            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                          )}
                        </View>

                        {/* Step Name */}
                        <AppText style={styles.stepNameText} numberOfLines={2}>
                          {stepName}
                        </AppText>

                        {/* Status Badge */}
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                          <AppText style={styles.statusBadgeText}>
                            {approver.status ? approver.status.replace('_', ' ') : 'PENDING'}
                          </AppText>
                        </View>

                        {/* Approver Name */}
                        {hasAssignedUser ? (
                          <AppText style={styles.approverNameText} numberOfLines={1}>
                            {approver.assignedUserName}
                          </AppText>
                        ) : (
                          <AppText style={styles.notAssignedText} numberOfLines={1}>
                            Not Assigned
                          </AppText>
                        )}

                        {/* Timestamp */}
                        {approver.actedAt ? (
                          <AppText style={styles.timestampText}>
                            {formatDateTime(approver.actedAt)}
                          </AppText>
                        ) : hasAssignedUser && inProgress ? (
                          <AppText style={styles.waitingText}>
                            Waiting...
                          </AppText>
                        ) : null}
                      </View>

                      {/* Connecting Line */}
                      {!isLast && (
                        <View style={styles.connectingLine}>
                          <View 
                            style={[
                              styles.line,
                              { backgroundColor: lineColor }
                            ]} 
                          />
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
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
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  workflowHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  workflowHeaderTop: {
    marginBottom: 8,
  },
  taskIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  customerInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  horizontalTimelineScroll: {
    marginTop: 20,
  },
  horizontalTimelineContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  horizontalTimelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  stepContent: {
    alignItems: 'center',
    minWidth: 140,
    maxWidth: 180,
  },
  checkmarkContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  stepNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 36,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  approverNameText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  notAssignedText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
  timestampText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 11,
    color: '#F59E0B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  connectingLine: {
    width: 60,
    height: 2,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: '100%',
    height: 2,
  },
});

export default WorkflowTimelineModal;

