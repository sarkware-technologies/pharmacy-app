import React, { useEffect, useState, useCallback } from 'react';
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../';
import { colors } from '../../styles/colors';
import CloseCircle from '../icons/CloseCircle';
import { customerAPI } from '../../api/customer';

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString.replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const displayHours = date.getHours() % 12 || 12;
    return `${day} ${month} ${year} ${displayHours}:${minutes} ${ampm}`;
  } catch (e) {
    return dateString;
  }
};

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();
  let backgroundColor = '#E5E7EB';
  let textColor = '#4B5563';

  if (normalized === 'APPROVED' || normalized === 'APPROVE') {
    backgroundColor = '#D1F2E3';
    textColor = '#169560';
  } else if (normalized === 'SUBMITTED' || normalized === 'SUBMIT') {
    backgroundColor = '#E5EEFA';
    textColor = '#4B77BE';
  } else if (normalized === 'PENDING' || normalized === 'IN_PROGRESS') {
    backgroundColor = '#FFF4E5';
    textColor = '#F4AD48';
  } else if (normalized === 'REJECTED') {
    backgroundColor = '#FEE2E2';
    textColor = '#EF4444';
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <AppText style={[styles.statusBadgeText, { color: textColor }]}>
        {normalized || '—'}
      </AppText>
    </View>
  );
};

const CommentCard = ({ item }) => {
  return (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <AppText style={styles.commentTitle}>
          {item.title || '—'}
        </AppText>
        <StatusBadge status={item.status} />
      </View>
      <AppText style={styles.commentBody}>
        {item.comment || 'No comment provided.'}
      </AppText>
      <View style={styles.commentFooter}>
        {item.user && item.time && (
          <AppText style={styles.metaText}>
            {item.user} | {item.time}
          </AppText>
        )}
      </View>
    </View>
  );
};

const AccordionItem = ({ title, isExpanded, onToggle, children }) => {
  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onToggle} activeOpacity={0.7}>
        <AppText style={styles.accordionTitle}>{title}</AppText>
        <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#6B7280" />
      </TouchableOpacity>
      {isExpanded && <View style={styles.accordionContent}>{children}</View>}
    </View>
  );
};

const CommentsModal = ({ visible, onClose, moduleRecordId, moduleName }) => {
  const [loading, setLoading] = useState(false);
  const [accordionData, setAccordionData] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const transformData = useCallback((apiResponse) => {
    if (!apiResponse || !apiResponse.data || !Array.isArray(apiResponse.data)) return [];

    return apiResponse.data.map((item, idx) => {
      const approvers = item.approvers || [];
      const recordId = item.moduleRecordId || item.instanceId;

      // Determine action type - default to "Creation", can be "Approve" if needed
      // Based on the screenshot, we show both "Creation" and "Approve" as separate accordions
      // For now, we'll use "Creation" as default, but this can be enhanced based on business logic
      const actionType = 'Creation'; // Can be made dynamic based on workflow type or stepOrder

      const records = approvers.map((approver, i) => ({
        key: `${recordId}-${idx}-${i}`,
        title: approver.levelName || approver.stepName || approver.subroleName || 'User',
        status: approver.stepInstanceStatus || approver.workflowActionStatus || approver.status,
        comment: approver.comments || approver.comment || 'No comment provided.',
        user: approver.actorName || approver.userName || approver.assignedUserName,
        time: formatDateTime(approver.actedAt || approver.timestamp),
      }));

      return {
        id: `${recordId}-${actionType}-${idx}`,
        title: `Task Id ${recordId || '—'} | ${actionType}`,
        records,
      };
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!moduleRecordId) return;
    setLoading(true);
    try {
      const response = await customerAPI.getUserWiseAudit(moduleRecordId, moduleName);
      const transformed = transformData(response);
      console.log(transformed, 230427)
      setAccordionData(transformed);
      if (transformed.length > 0) {
        setExpanded(transformed[0].id);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setAccordionData([]);
    } finally {
      setLoading(false);
    }
  }, [moduleRecordId, moduleName, transformData]);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, loadData]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContainer}>
          <SafeAreaView edges={['bottom']} style={styles.safeAreaContent}>
            <View style={styles.header}>
              <AppText style={styles.headerTitle}>Comments</AppText>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <CloseCircle />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {accordionData.length === 0 && (
                  <AppText style={styles.emptyText}>No comments available.</AppText>
                )}

                {accordionData.map((item) => (
                  <AccordionItem
                    key={item.id}
                    title={item.title}
                    isExpanded={expanded === item.id}
                    onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
                  >
                    {item.records && item.records.length > 0 ? (
                      item.records.map((record) => (
                        <CommentCard key={record.key} item={record} />
                      ))
                    ) : (
                      <AppText style={styles.emptyText}>No comments in this task.</AppText>
                    )}
                  </AccordionItem>
                ))}
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

export default CommentsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  safeAreaContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  accordionItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  commentCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 16,
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  commentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  commentBody: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginVertical: 12,
  },
});

