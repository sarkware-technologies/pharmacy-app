import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

export const SkeletonLoader = ({ height = 20, width: customWidth = '100%', borderRadius = 4, style = {} }) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          height,
          width: customWidth,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

export const SkeletonText = ({ lines = 1, style = {} }) => {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          height={16}
          width={index === lines - 1 ? '70%' : '100%'}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
};

export const SkeletonSection = ({ title = true, items = 3, style = {} }) => {
  return (
    <View style={[styles.section, style]}>
      {title && <SkeletonLoader height={20} width="40%" borderRadius={4} style={{ marginBottom: 12 }} />}
      {Array.from({ length: items }).map((_, index) => (
        <View key={index} style={{ marginBottom: 12 }}>
          <SkeletonLoader height={14} width="30%" style={{ marginBottom: 6 }} />
          <SkeletonLoader height={18} width="100%" borderRadius={4} />
        </View>
      ))}
    </View>
  );
};

export const SkeletonDetailPage = () => {
  return (
    <View style={styles.detailContainer}>
      {/* Header Skeleton */}
      <View style={styles.headerSkeleton}>
        <SkeletonLoader height={24} width="50%" borderRadius={4} />
      </View>

      {/* Tab Skeleton */}
      <View style={styles.tabSkeleton}>
        <SkeletonLoader height={40} width="100%" borderRadius={4} />
      </View>

      {/* Content Skeleton */}
      <View style={styles.contentSkeleton}>
        <SkeletonSection title={true} items={4} style={{ marginBottom: 20 }} />
        <SkeletonSection title={true} items={3} style={{ marginBottom: 20 }} />
        <SkeletonSection title={true} items={2} />
      </View>
    </View>
  );
};

export const SkeletonListItem = () => {
  return (
    <View style={styles.listItemSkeleton}>
      {/* Header Row: Title and Download Icon */}
      <View style={styles.headerRow}>
        <SkeletonLoader height={20} width="60%" borderRadius={4} />
        <SkeletonLoader height={24} width={24} borderRadius={4} />
      </View>

      {/* Info Row: Code, Location, License, Count */}
      <View style={styles.infoRow}>
        <SkeletonLoader height={14} width="25%" borderRadius={3} />
        <SkeletonLoader height={14} width="20%" borderRadius={3} />
        <SkeletonLoader height={14} width="20%" borderRadius={3} />
        <SkeletonLoader height={14} width="15%" borderRadius={3} />
      </View>

      {/* Contact Row: Phone and Email */}
      <View style={styles.contactRow}>
        <SkeletonLoader height={14} width="35%" borderRadius={3} />
        <SkeletonLoader height={14} width="40%" borderRadius={3} />
      </View>

      {/* Status and Button Row */}
      <View style={styles.actionRow}>
        <SkeletonLoader height={32} width="35%" borderRadius={16} />
        <SkeletonLoader height={40} width="30%" borderRadius={8} />
      </View>
    </View>
  );
};

export const SkeletonList = ({ items = 5 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: items }).map((_, index) => (
        <View key={index} style={{ marginBottom: 12 }}>
          <SkeletonListItem />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E8E8E8',
    overflow: 'hidden',
  },
  textContainer: {
    width: '100%',
  },
  section: {
    paddingHorizontal: 16,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSkeleton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabSkeleton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contentSkeleton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listItemSkeleton: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  listItemContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
});
