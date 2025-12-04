import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { mockClaimsData, mockPendingClaims } from './Mockdata';
import ClaimOrderListModal from '../../../components/chargeback/ClaimOrderListModal';
import Bell from '../../../components/icons/Bell';
import Menu from '../../../components/icons/Menu';
import { colors } from '../../../styles/colors';
import Filter from '../../../components/icons/Filter';
import Calendar from '../../../components/icons/Calendar';
import Download from '../../../components/icons/Download';
import AddrLine from '../../../components/icons/AddrLine';
import { AppText, AppInput } from "../../../components"
import EyeOpenChargeBack from '../../../components/icons/EyeOpenChargeBack';
import Upload from '../../../components/icons/Upload';

const ChargebackListing = () => {

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('Claims');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrderListModal, setShowOrderListModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [spilType, setSpilType] = useState('SPIL');
  const [overdueFilter, setOverdueFilter] = useState('Overdue');
  const [searchText, setSearchText] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const tabScrollRef = useRef(null);
  const tabRefs = useRef({});

  const tabs = ['Claims', 'Pending', 'Missed Claims', 'Reassigned'];

  // Handle tab press with centering
  const handleTabPress = async (tabName) => {
    // First reset the list and set active tab
    setActiveTab(tabName);

    // Scroll the tab into visible area after a small delay to ensure layout is ready
    setTimeout(() => {
      if (tabRefs.current[tabName] && tabScrollRef.current) {
        tabRefs.current[tabName].measureLayout(
          tabScrollRef.current.getNode ? tabScrollRef.current.getNode() : tabScrollRef.current,
          (x, y, w, h) => {
            const screenWidth = Dimensions.get('window').width;
            // Center the tab in the screen
            const scrollX = x - (screenWidth / 2) + (w / 2);

            tabScrollRef.current?.scrollTo({
              x: Math.max(0, scrollX),
              animated: true
            });
          },
          () => {
            console.log('measureLayout failed');
          }
        );
      }
    }, 100);
  };

  const renderClaimItem = ({ item }) => {
    const isSubmitted = item.status === 'SUBMITTED';
    const isDraft = item.status === 'DRAFT';

    return (
      <TouchableOpacity
        style={styles.claimCard}
        onPress={() => {
          if (isDraft) {
            setSelectedClaim(item);
            setShowOrderListModal(true);
          }
        }}
      >
        <View style={styles.claimHeader}>
          <View style={styles.claimIdContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText style={styles.claimId}>{item.id}</AppText>
              <Icon name="chevron-right" size={24} color="#FFA500" />
            </View>
            <AppText style={styles.dateText}>{item.date}</AppText>
          </View>
          <View style={styles.amountContainer}>
            <AppText style={styles.amount}>₹ {item.amount?.toLocaleString('en-IN') || '0'}</AppText>
            {item.crtnNumber && (
              <AppText style={styles.crtnText}>
                {item.crtnNumber} ₹ {item.crtnAmount?.toLocaleString('en-IN')}
              </AppText>
            )}
          </View>
        </View>


        <View style={styles.customerInfo}>
          <AppText style={styles.customerName}>{item.customerName}</AppText>
          {isDraft && (
            <TouchableOpacity>
              <Download />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.codeContainer}>
            <AddrLine />
            <AppText style={styles.codeText}>{item.customerCode}</AppText>
          </View>
          <AppText style={styles.separator}>|</AppText>
          <AppText style={styles.typeText}>{item.customerType}</AppText>
          <AppText style={styles.separator}>|</AppText>
          <AppText style={styles.orderText}>
            {item.orderCode} <AppText style={styles.spilBadge}>+{item.spilCount}</AppText> ({item.spilType})
          </AppText>
        </View>

        {isSubmitted && (
          <View style={styles.statusContainer}>
            <View style={styles.submittedBadge}>
              <AppText style={styles.submittedText}>SUBMITTED</AppText>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              {/* <Icon name="visibility" size={20} color="#FFA500" /> */}
              <EyeOpenChargeBack/>
              
              <AppText style={styles.viewText}>View</AppText>
            </TouchableOpacity>
          </View>
        )}

        {isDraft && (
          <View style={styles.draftContainer}>
            <View style={styles.draftBadge}>
              <AppText style={styles.draftText}>DRAFT</AppText>
            </View>
            <TouchableOpacity style={styles.uploadButton}>
              <Upload color='white'/>
              <AppText style={styles.uploadText}>Upload Documents</AppText>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderPendingItem = ({ item }) => {
    return (
      <View style={styles.pendingCard}>
        <View style={styles.pendingHeaderWrapper}>
        <View style={styles.pendingHeader}>
          <AppText style={styles.customerName}>{item.customerName}</AppText>
          <AppText style={styles.amount}>₹ {item.amount?.toLocaleString('en-IN')}</AppText>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.codeContainer}>
            <AddrLine />
            <AppText style={styles.codeText}>{item.customerCode}</AppText>
          </View>
          <AppText style={styles.separator}>|</AppText>
          <AppText style={styles.typeText}>{item.customerType}</AppText>
          <AppText style={styles.separator}>|</AppText>
          <AppText style={styles.claimText}>
            {item.claimNumber} <AppText style={styles.spilBadge}>+{item.spilCount}</AppText>
          </AppText>
        </View>
</View>
        <View style={styles.statsRow}>
          <AppText style={styles.statText}>PO Count <AppText style={styles.statTextVal}>{item.poCount}</AppText></AppText>
          <AppText style={styles.separator}>|</AppText>
          <AppText style={styles.statText}>Order Count <AppText style={styles.statTextVal}>{item.orderCount}</AppText></AppText>
          <AppText style={styles.separator}>|</AppText>
          <AppText style={styles.statText}>POD/Invoice <AppText style={styles.statTextVal}>{item.podInvoiceRatio}</AppText></AppText>
        </View>

        <View style={styles.claimValueContainer}>
          <AppText style={styles.claimValueLabel}>Claim Value <AppText style={styles.claimValueLabelVal}>₹ {item.claimValue?.toLocaleString('en-IN')}</AppText></AppText>
          <TouchableOpacity>
            <Icon name="arrow-drop-down" size={24} color="#FFA500" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Claims':
        return (
          <FlatList
            data={mockClaimsData}
            renderItem={renderClaimItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'Pending':
        return (
         
         
            <FlatList
              data={mockPendingClaims}
              renderItem={renderPendingItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          
        );
      case 'Missed Claims':
      case 'Reassigned':
        return (
          <View style={styles.emptyContainer}>
            <AppText style={styles.emptyText}>No {activeTab.toLowerCase()} available</AppText>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Menu />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Chargeback</AppText>
        <View style={styles.headerRight}>
          <TouchableOpacity>
            <Bell />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ ...styles.tabContainer, height: 55 }}
        scrollEventThrottle={16}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            ref={(ref) => tabRefs.current[tab] = ref}
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => handleTabPress(tab)}
          >
            <AppText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

     

      <View style={{ backgroundColor: '#F5F5F5', flex: 1 }}>

         {activeTab === "Pending" &&(

            //  <View style={styles.filterContainer}>
            //   <View style={styles.spilToggle}>
            //     <TouchableOpacity
            //       style={[styles.toggleButton, spilType === 'SPIL' && styles.activeToggle]}
            //       onPress={() => setSpilType('SPIL')}
            //     >
            //       <AppText style={[styles.toggleText, spilType === 'SPIL' && styles.activeToggleText]}>
            //         SPIL
            //       </AppText>
            //     </TouchableOpacity>
            //     <TouchableOpacity
            //       style={[styles.toggleButton, spilType === 'SPLL' && styles.activeToggle]}
            //       onPress={() => setSpilType('SPLL')}
            //     >
            //       <AppText style={[styles.toggleText, spilType === 'SPLL' && styles.activeToggleText]}>
            //         SPLL
            //       </AppText>
            //     </TouchableOpacity>
            //   </View>

            //   <View style={styles.overdueToggle}>
            //     <TouchableOpacity
            //       style={styles.radioButton}
            //       onPress={() => setOverdueFilter('Overdue')}
            //     >
            //       <View style={styles.radio}>
            //         {overdueFilter === 'Overdue' && <View style={styles.radioSelected} />}
            //       </View>
            //       <AppText style={styles.radioText}>Overdue</AppText>
            //     </TouchableOpacity>
            //     <TouchableOpacity
            //       style={styles.radioButton}
            //       onPress={() => setOverdueFilter('Due')}
            //     >
            //       <View style={styles.radio}>
            //         {overdueFilter === 'Due' && <View style={styles.radioSelected} />}
            //       </View>
            //       <AppText style={styles.radioText}>Due</AppText>
            //     </TouchableOpacity>
            //   </View>
            // </View>

            <View style={styles.filterWrapper}>

              {/* LEFT GROUP: SPIL + Radio (touching each other) */}
              <View style={styles.leftGroup}>

                {/* SPIL */}
                <TouchableOpacity
                  style={[styles.spilBox, spilType === 'SPIL' && styles.activeBox]}
                  onPress={() => setSpilType('SPIL')}
                >
                  <AppText style={[styles.spilText, spilType === 'SPIL' && styles.activeText]}>
                    SPIL
                  </AppText>
                </TouchableOpacity>

                {/* RADIO BOX */}
                <View style={styles.radioBox}>
                  <TouchableOpacity style={[styles.radioOption, styles.extraMargin]} onPress={() => setOverdueFilter('Overdue')}>
                    <View style={[styles.radioCircle, overdueFilter === 'Overdue' && styles.radioCircleActive]}>
                      {overdueFilter === 'Overdue' && <View style={styles.radioDot} />}
                    </View>
                    <AppText style={[styles.radioLabel, overdueFilter === 'Overdue' && styles.radioLabelActive]}>
                      Overdue
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.radioOption} onPress={() => setOverdueFilter('Due')}>
                    <View style={[styles.radioCircle, overdueFilter === 'Due' && styles.radioCircleActive]}>
                      {overdueFilter === 'Due' && <View style={styles.radioDot} />}
                    </View>
                    <AppText style={[styles.radioLabel, overdueFilter === 'Due' && styles.radioLabelActive]}>
                      Due
                    </AppText>
                  </TouchableOpacity>
                </View>

              </View>

              {/* SPLL */}
              <TouchableOpacity
                style={[styles.spllBox, spilType === 'SPLL' && styles.activeBox]}
                onPress={() => setSpilType('SPLL')}
              >
                <AppText style={[styles.spllText, spilType === 'SPLL' && styles.activeText]}>
                  SPLL
                </AppText>
              </TouchableOpacity>

            </View>



 

        )}



        {(activeTab === 'Claims' || activeTab === 'Pending') && (

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Icon name="search" size={20} color="#999" />
              <AppInput
                style={styles.searchInput}
                placeholder="Search customer name/code..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#999"
              />
            </View>
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
              <Filter />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Calendar />
            </TouchableOpacity>
          </View>
        )}

        

        {renderContent()}

        <ClaimOrderListModal
          visible={showOrderListModal}
          onClose={() => setShowOrderListModal(false)}
          claim={selectedClaim}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  headerRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tabContainer: {

    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    maxHeight: 55,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    // Remove the borderWidth: 1 line that was here
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  searchContainer: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: '#F6F6F6' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#333' },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  claimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowRadius: 4,
  },
  claimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth:1,
    borderBlockColor:"#EDEDED"
  },
  claimIdContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10
  },
  claimId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  crtnText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    marginTop: -10,
    fontWeight:400
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    width:"70%"
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  separator: {
    fontSize: 12,
    color: '#E0E0E0',
    marginHorizontal: 8,
  },
  typeText: {
    fontSize: 12,
    color: '#999',
  },
  orderText: {
    fontSize: 12,
    color: '#999',
  },
  spilBadge: {
    color: '#FFA500',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submittedBadge: {
    backgroundColor: '#4481B41A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  submittedText: {
    fontSize: 12,
    color: '#4481B4',
    fontWeight: '700',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef4e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewText: {
    fontSize: 14,
    color: '#F7941E',
    marginLeft: 4,
    fontWeight: '500',
  },
  draftContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  draftBadge: {
    backgroundColor: '#f7f1e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius:8,
  },
  draftText: {
    fontSize: 12,
    color: '#AE7017',
    fontWeight: '700',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap:4
  },
  uploadText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  spilToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  activeToggle: {
    backgroundColor: '#FFA500',
  },
  toggleText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  overdueToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFA500',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFA500',
  },
  radioText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },

  pendingHeaderWrapper:{

    borderBottomWidth:1,
    borderBottomColor:"#EDEDED"

  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  
    
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },

  statTextVal:{
 color: '#000',
  },
  claimText: {
    fontSize: 12,
    color: '#999',
  },
  claimValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: 8,
  },
  claimValueLabel: {
    fontSize: 14,
    color: '#000',
  },
  claimValueLabelVal:{
    color:"#666"

  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },



  filterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
     paddingHorizontal: 16,
     gap:10,
     
  },

  /* SPIL + Radio side together */
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
   
  },

  /* SPIL BOX */
  spilBox: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    // borderTopRightRadius: 0,
    // borderBottomRightRadius: 0,
    zIndex:10
  },

  /* ACTIVE BOX (SPIL or SPLL) */
  activeBox: {
    borderColor: '#FFA500',
    backgroundColor: '#FFF4E5',
  },

  spilText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeText: {
    color: '#000',
  },

  /* RADIO BOX (touching SPIL, connected border) */
  radioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderRadius: 10,
    marginLeft:- 10
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,

    
  },

  extraMargin:{
    marginLeft:10
  },

  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C7C7C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#FFA500',
  },

  radioDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFA500',
  },

  radioLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: '#999',
  },
  radioLabelActive: {
    color: '#000',
    fontWeight: '600',
  },

  /* SPLL BOX (right side) */
  spllBox: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },

  spllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },

  
});

export default ChargebackListing;