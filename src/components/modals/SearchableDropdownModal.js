import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../AppText';
import { colors } from '../../styles/colors';

const SearchableDropdownModal = ({
  visible,
  onClose,
  title,
  data = [],
  selectedId,
  onSelect,
  loading = false,
  onSearch,
  onAddNew
}) => {
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (!visible) setSearchText('');
  }, [visible]);

  const filteredData = onSearch ? data : useMemo(() => {
    if (!searchText) return data;
    return data.filter(item =>
      item?.name?.toLowerCase().includes(searchText.toLowerCase()),
    );
  }, [searchText, data]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>{title}</AppText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#999" />
            <TextInput
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                onSearch?.(text); // 👈 API trigger
              }}
              placeholder={`Search ${title}`}
              style={styles.searchInput}
              placeholderTextColor="#999"

            />
          </View>

          {/* Content */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
            />
          ) : filteredData.length > 0 ? (
            <FlatList
              data={filteredData}
              keyExtractor={item => item.id?.toString()}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => {
                const isSelected = selectedId == item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.listItem,
                      isSelected && styles.listItemSelected,
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <AppText
                      style={[
                        styles.listItemText,
                        isSelected && styles.listItemTextSelected,
                      ]}
                    >
                      {item.name}
                    </AppText>

                    {isSelected && (
                      <Icon
                        name="check"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <AppText style={styles.emptyText}>
                No {title} available
              </AppText>

              {searchText && onAddNew ? (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => onAddNew?.(searchText)}
                >
                  <Icon name="add" size={18} color={colors.primary} />
                  <AppText style={styles.addButtonText}>
                    Add New City
                  </AppText>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  backdrop: {
    flex: 1,
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,


    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },

  loader: {
    paddingVertical: 50,
  },

  listContainer: {
    paddingHorizontal: 0,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  listItemSelected: {
    backgroundColor: '#FFF5ED',
  },

  listItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,

  },

  listItemTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },

  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 20
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#FFF',
  },

  addButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
});

export default SearchableDropdownModal;
