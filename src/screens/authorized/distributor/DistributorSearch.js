import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../../styles/colors';
import {AppText,AppInput} from "../../../components"

const DistributorSearch = ({ onSelect }) => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [distributors, setDistributors] = useState([]);

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.length < 2) {
      setDistributors([]);
      return;
    }

    setLoading(true);
    try {
      // Mock search - replace with actual API call
      const mockData = [
        { id: '1', name: 'A.A. Pharma', code: '10106555', type: 'CFA-DT' },
        { id: '2', name: 'A A PHARMACEUTICALS', code: '10106555', type: 'CFA-DT' },
        { id: '3', name: 'A A PHARMACEUTICALS MED...', code: '10106555', type: 'CFA-DT' },
      ];
      
      const filtered = mockData.filter(d => 
        d.name.toLowerCase().includes(text.toLowerCase()) ||
        d.code.includes(text)
      );
      
      setDistributors(filtered);
    } catch (error) {
      console.error('Error searching distributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDistributor = ({ item }) => (
    <TouchableOpacity
      style={styles.distributorItem}
      onPress={() => {
        if (onSelect) {
          onSelect(item);
        }
        navigation.goBack();
      }}
    >
      <View style={styles.distributorInfo}>
        <AppText style={styles.distributorName}>{item.name}</AppText>
        <AppText style={styles.distributorDetails}>
          {item.code} | {item.type}
        </AppText>
      </View>
      <Icon name="chevron-right" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Search Distributor</AppText>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <AppInput
            style={styles.searchInput}
            placeholder="Search by name or code..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={distributors}
          renderItem={renderDistributor}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            searchText.length > 1 && (
              <View style={styles.emptyContainer}>
                <Icon name="search-off" size={48} color="#ccc" />
                <AppText style={styles.emptyText}>No distributors found</AppText>
              </View>
            )
          }
        />
      )}
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  listContent: {
    flexGrow: 1,
  },
  distributorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  distributorInfo: {
    flex: 1,
  },
  distributorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  distributorDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});

export default DistributorSearch;