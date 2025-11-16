import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../../../styles/colors';

const RCList = ({ product, onBack, onRCClick }) => {
  // Mock RC data
  const rateContracts = [
    {
      id: 'SUNRC_2',
      customer: 'Columbia Asia',
      code: '2536',
      location: 'Pune',
      specialPriceType: 'Discount on PTR',
      discount: '40%',
      specialPrice: '₹ 60.20',
      moq: '120',
      division: 'IN CNS',
    },
    {
      id: 'SUNRC_3',
      customer: 'Kokilaben Dhirubhai Hospital',
      code: '1336',
      location: 'Mumbai',
      specialPriceType: 'Discount on PTR',
      discount: '40%',
      specialPrice: '₹ 60.20',
      moq: '120',
      division: 'IN CNS',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar backgroundColor="#F6F6F6" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RC's (2)</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {rateContracts.map((rc, index) => (
          <TouchableOpacity 
            key={rc.id}
            style={styles.rcCard}
            onPress={() => onRCClick(rc)}
          >
            <View style={styles.rcHeader}>
              <View style={styles.rcIdRow}>
                <Text style={styles.rcId}>{rc.id}</Text>
                <Icon name="chevron-right" size={20} color={colors.primary} />
              </View>
            </View>

            <Text style={styles.customerName}>{rc.customer}</Text>
            
            <View style={styles.locationRow}>
              <Icon name="location-on" size={16} color={colors.textSecondary} />
              <Text style={styles.locationText}>{rc.code} | {rc.location}</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Special Price Type</Text>
                <Text style={styles.detailValue}>{rc.specialPriceType}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Discount (%)</Text>
                <Text style={styles.detailValue}>{rc.discount}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Special Price</Text>
                <Text style={styles.detailValue}>{rc.specialPrice}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>MOQ</Text>
                <Text style={styles.detailValue}>{rc.moq}</Text>
              </View>
            </View>

            <Text style={styles.division}>Division: {rc.division}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.approveButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onRCClick(rc);
                }}
              >
                <Icon name="check" size={18} color={colors.white} />
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  rcCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  rcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rcIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rcId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  division: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  approveText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
});

export default RCList;