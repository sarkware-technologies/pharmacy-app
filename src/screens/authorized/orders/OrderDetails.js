import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Icon Components
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ClockIcon = () => (
  <Svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path d="M5.32617 3.10938C9.31212 -0.703001 15.7798 -0.70318 19.7656 3.10938C23.7451 6.91599 23.7451 13.084 19.7656 16.8906C15.7798 20.7032 9.31212 20.703 5.32617 16.8906C5.17821 16.7491 5.09671 16.5594 5.09668 16.3643C5.09668 16.1691 5.17721 15.9785 5.3252 15.8369C5.47355 15.6954 5.67752 15.6152 5.8916 15.6152C6.10544 15.6152 6.30873 15.6957 6.45703 15.8369V15.8379C7.83397 17.1551 9.63536 17.9859 11.5664 18.1973C13.4976 18.4086 15.4476 17.9879 17.0986 17.0029C18.7497 16.0179 20.0056 14.5259 20.6592 12.7676C21.3128 11.009 21.3246 9.09001 20.6924 7.32422C20.0602 5.55869 18.8227 4.05218 17.1836 3.04883C15.5446 2.04558 13.5996 1.60311 11.666 1.79297C9.73242 1.98285 7.92117 2.79383 6.52832 4.0957C5.13525 5.39779 4.24315 7.11526 3.99902 8.96777L3.96094 9.25H5.22754C5.38726 9.24992 5.54263 9.29517 5.67383 9.37891C5.80495 9.46261 5.90497 9.58097 5.96387 9.7168C6.02257 9.8523 6.0384 10.0005 6.00879 10.1436C5.98644 10.2512 5.93901 10.3535 5.87012 10.4424L5.79492 10.5264L3.7041 12.5254L3.70312 12.5264C3.63017 12.5967 3.54235 12.6526 3.44531 12.6914C3.34822 12.7302 3.24354 12.7508 3.1377 12.751C3.03193 12.7512 2.92729 12.7318 2.83008 12.6934C2.73287 12.655 2.64555 12.5984 2.57227 12.5283L2.57031 12.5264L0.478516 10.5264C0.368286 10.4208 0.294466 10.2876 0.264648 10.1445C0.234891 10.0014 0.249939 9.85239 0.308594 9.7168C0.367399 9.58099 0.46859 9.46267 0.599609 9.37891C0.730538 9.29532 0.885518 9.25011 1.04492 9.25H2.36719L2.39062 9.02539C2.62256 6.78986 3.65867 4.69829 5.3252 3.10938H5.32617ZM11.5 5.25C11.7145 5.25 11.918 5.33167 12.0664 5.47363C12.2144 5.61523 12.2959 5.80478 12.2959 6V10.25H16.7275C16.942 10.25 17.1456 10.3317 17.2939 10.4736C17.4419 10.6152 17.5225 10.8048 17.5225 11C17.5225 11.1952 17.4419 11.3848 17.2939 11.5264C17.1456 11.6683 16.942 11.75 16.7275 11.75H11.5C11.2855 11.75 11.082 11.6683 10.9336 11.5264C10.7856 11.3848 10.7041 11.1952 10.7041 11V6C10.7041 5.80479 10.7856 5.61523 10.9336 5.47363C11.082 5.33167 11.2855 5.25001 11.5 5.25Z" fill="#2B2B2B" stroke="white" stroke-width="0.5" />
  </Svg> 

);

const DownloadIcon = () => (
  <Svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <Path d="M0.75 12.254V13.25C0.75 14.0456 1.06607 14.8087 1.62868 15.3713C2.19129 15.9339 2.95435 16.25 3.75 16.25H13.75C14.5456 16.25 15.3087 15.9339 15.8713 15.3713C16.4339 14.8087 16.75 14.0456 16.75 13.25V12.25M8.75 0.75V11.75M8.75 11.75L12.25 8.25M8.75 11.75L5.25 8.25" stroke="#2B2B2B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </Svg>

);

const ChevronUp = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M18 15L12 9L6 15" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronDown = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M6 9L12 15L18 9" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SearchIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Circle cx="9" cy="9" r="6" stroke="#999" strokeWidth="1.5" />
    <Path d="M13.5 13.5L17 17" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const EyeIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path d="M1 10C1 10 4 4 10 4C16 4 19 10 19 10C19 10 16 16 10 16C4 16 1 10 1 10Z" stroke="#FF8C00" strokeWidth="1.5" />
    <Circle cx="10" cy="10" r="3" stroke="#FF8C00" strokeWidth="1.5" />
  </Svg>
);

const CommentIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path d="M18 2H2C1 2 0 3 0 4V14C0 15 1 16 2 16H6L10 19V16H18C19 16 20 15 20 14V4C20 3 19 2 18 2Z" stroke="#666" strokeWidth="1.5" />
  </Svg>
);

const HistoryIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="8" stroke="#666" strokeWidth="1.5" />
    <Path d="M10 6V10L13 11.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const HoldIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path d="M6 4V16M14 4V16" stroke="#666" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path d="M3 6H17M8 6V4C8 3 9 2 10 2C11 2 12 3 12 4V6M9 10V14M11 10V14M5 6L6 16C6 17 7 18 8 18H12C13 18 14 17 14 16L15 6" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const MinusIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M5 12H19" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const PlusIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12H19" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const OrderDetailsScreen = () => {
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [showDeletedProducts, setShowDeletedProducts] = useState(false);
  const [quantities, setQuantities] = useState({
    'product1': 50,
    'product2': 50,
  });

  const orderData = {
    orderNumber: 'SUNPH-10286',
    status: 'SUBMITTED',
    poNumber: 'PO_No_123',
    amount: '6,345.33',
    skus: 48,
    date: '14/01/2025 18:37:41',
    type: 'Net Rate',
    orderedBy: 'A A PHARMACEUTICALS',
    cfaName: 'SunPharma Limited',
    savings: '1,15,000',
    grossOrderValue: '1,15,000',
    tax: '36.15',
    invoiceItems: '0 of 3',
    invoiceValue: '0',
    supplyType: 'Net Rate',
    rateContractHolder: 'Columbia Asia',
    rateContractId: '10106555',
    rateContractLocation: 'Pune',
  };

  const products = [
    {
      id: 'INF30R0552',
      name: 'CALDIKIND PLUS CAPSULES 150 MG',
      customerProduct: 'CALDIKIND PLUS CAPSULES',
      price: '64.29',
      pth: 'PTH',
      quantity: 50,
    },
    {
      id: 'INF30R0552',
      name: 'CALDIKIND PLUS CAPSULES 150 MG',
      customerProduct: 'CALDIKIND PLUS CAPSULES',
      price: '64.29',
      pth: 'PTH',
      quantity: 50,
    },
  ];

  const updateQuantity = (productId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, prev[productId] + delta)
    }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.orderNumber}>SUNPH-10286</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <ClockIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <DownloadIcon />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText]}>SUBMITTED</Text>
        </View>

      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.poNumber}>{orderData.poNumber}</Text>
              <Text style={styles.dateText}>{orderData.date} | {orderData.type}</Text>
            </View>
            <View style={styles.amountSection}>
              <Text style={styles.amount}>₹ {orderData.amount}</Text>
              <Text style={styles.skuCount}>SKU's: {orderData.skus}</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Ordered by</Text>
              <Text style={[styles.detailValue, styles.underlinedText]}>{orderData.orderedBy}</Text>
            </View>
            <View style={[styles.detailItem, styles.alignRight]}>
              <Text style={styles.detailLabel}>CFA Name</Text>
              <TouchableOpacity onPress={() => setHeaderExpanded(!headerExpanded)}>
                <View style={styles.expandableValue}>
                  <Text style={[styles.detailValue, styles.underlinedText]}>{orderData.cfaName}</Text>
                  {headerExpanded ? <ChevronUp /> : <ChevronDown />}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {headerExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.expandedRow}>
                <View style={styles.expandedItem}>
                  <Text style={styles.expandedLabel}>(-) Savings</Text>
                  <Text style={styles.expandedLabel}>Trade</Text>
                </View>
                <View style={styles.expandedItem}>
                  <Text style={styles.expandedLabel}>(=) Gross Order Value</Text>
                  <Text style={styles.expandedValue}>₹ {orderData.grossOrderValue}</Text>
                </View>
                <View style={styles.expandedItem}>
                  <Text style={styles.expandedLabel}>(+) Tax</Text>
                  <Text style={styles.expandedValue}>₹ {orderData.tax}</Text>
                </View>
              </View>

              <View style={styles.expandedRow}>
                <View style={styles.expandedItem}>
                  <Text style={styles.expandedLabel}>Invoice Items</Text>
                  <Text style={styles.expandedValue}>{orderData.invoiceItems}</Text>
                </View>
                <View style={styles.expandedItem}>
                  <Text style={styles.expandedLabel}>Invoice Value</Text>
                  <Text style={styles.expandedValue}>₹ {orderData.invoiceValue}</Text>
                </View>
                <View style={styles.expandedItem}>
                  <Text style={styles.expandedLabel}>Supply Type</Text>
                  <Text style={styles.expandedValue}>{orderData.supplyType}</Text>
                </View>
              </View>

              <View style={styles.contractHolder}>
                <Text style={styles.expandedLabel}>Rate Contract Holder</Text>
                <Text style={styles.contractName}>{orderData.rateContractHolder}</Text>
                <Text style={styles.contractDetails}>{orderData.rateContractId} | {orderData.rateContractLocation}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search & Add products to cart"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <View style={styles.tabs}>
            <TouchableOpacity onPress={() => setSelectedTab('all')} style={styles.tabButton}>
              <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTab]}>All</Text>
              {selectedTab === 'all' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedTab('multi')} style={styles.tabButton}>
              <Text style={[styles.tabText, selectedTab === 'multi' && styles.activeTab]}>Multi-Mapped</Text>
              {selectedTab === 'multi' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          </View>
          <View style={styles.tabActions}>
            <TouchableOpacity style={styles.searchIconButton}>
              <SearchIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.divDropdown}>
              <Text style={styles.divDropdownText}>All Div</Text>
              <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <Path d="M3 4.5L6 7.5L9 4.5" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity>
              <EyeIcon />
            </TouchableOpacity>
          </View>
        </View>

        {/* Select All / Show Deleted */}
        <View style={styles.selectRow}>
          <TouchableOpacity style={styles.selectAll}>
            <View style={styles.checkbox} />
            <Text style={styles.selectAllText}>Select all</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.showDeleted}
            onPress={() => setShowDeletedProducts(!showDeletedProducts)}
          >
            <View style={[styles.checkbox, showDeletedProducts && styles.checkboxChecked]} />
            <Text style={styles.selectAllText}>Show Deleted Products</Text>
          </TouchableOpacity>
        </View>

        {/* Product List */}
        <View style={styles.productList}>
          {products.map((product, index) => (
            <View key={index} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productCheckbox}>
                  <View style={styles.checkbox} />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCode}>{product.id}</Text>
                </View>
              </View>

              <View style={styles.productDetails}>
                <Text style={styles.productLabel}>Customer Product</Text>
                <View style={styles.productDetailRow}>
                  <Text style={styles.productDetailText}>{product.customerProduct}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.pthLabel}>{product.pth}</Text>
                    <Text style={styles.productPrice}>₹ {product.price}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.productActions}>
                <View style={styles.actionTabs}>
                  <View style={styles.actionTab}>
                    <Text style={styles.actionTabLabel}>Mapping</Text>
                    <TouchableOpacity>
                      <Text style={styles.changeText}>Change &gt;</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.actionTab}>
                    <Text style={styles.actionTabLabel}>Comment</Text>
                    <CommentIcon />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionTab}>
                    <Text style={styles.actionTabLabel}>Activity</Text>
                    <HistoryIcon />
                  </TouchableOpacity>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity onPress={() => updateQuantity(`product${index + 1}`, -1)}>
                    <MinusIcon />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{quantities[`product${index + 1}`]}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(`product${index + 1}`, 1)}>
                    <PlusIcon />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton}>
                    <DeleteIcon />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.holdButton}>
          <HoldIcon />
          <Text style={styles.holdButtonText}>Hold</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path d="M15 5L5 15M5 5L15 15" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" />
          </Svg>
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveButton}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path d="M4 10L8 14L16 6" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  time: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  signal: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'flex-end',
  },
  bar: {
    width: 3,
    backgroundColor: '#000',
  },
  wifi: {
    marginLeft: 5,
  },
  battery: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 5,
  },
  batteryOuter: {
    width: 22,
    height: 11,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 2,
    padding: 1,
  },
  batteryInner: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 1,
  },
  batteryCap: {
    width: 1,
    height: 4,
    backgroundColor: '#000',
    marginLeft: 1,
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 6
  },
  backButton: {
    padding: 4,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  statusBadge: {
    backgroundColor: '#4481B41A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginLeft: 35
  },
  statusText: {
    color: '#4481B4',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  orderSummary: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  poNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  skuCount: {
    fontSize: 14,
    color: '#666',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  underlinedText: {
    textDecorationLine: 'underline',
  },
  expandableValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  expandedItem: {
    flex: 1,
  },
  expandedLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  expandedValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  contractHolder: {
    marginTop: 8,
  },
  contractName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginTop: 4,
  },
  contractDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabs: {
    flexDirection: 'row',
    gap: 24,
  },
  tabButton: {
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    paddingBottom: 8,
  },
  activeTab: {
    color: '#FF8C00',
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF8C00',
  },
  tabActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchIconButton: {
    padding: 4,
  },
  divDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  divDropdownText: {
    fontSize: 14,
    color: '#333',
  },
  selectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  showDeleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#CCC',
    borderRadius: 4,
  },
  checkboxChecked: {
    backgroundColor: '#FF8C00',
    borderColor: '#FF8C00',
  },
  selectAllText: {
    fontSize: 14,
    color: '#666',
  },
  productList: {
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#FFF',
    marginBottom: 1,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productCheckbox: {
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 14,
    color: '#666',
  },
  productDetails: {
    marginBottom: 12,
  },
  productDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productLabel: {
    fontSize: 12,
    color: '#999',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pthLabel: {
    fontSize: 12,
    color: '#999',
  },
  productDetailText: {
    fontSize: 14,
    color: '#000',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  actionTabs: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  actionTab: {
    alignItems: 'center',
  },
  actionTabLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  changeText: {
    color: '#FF8C00',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 16,
  },
  quantity: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    minWidth: 40,
    textAlign: 'center',
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  holdButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCC',
    gap: 8,
  },
  holdButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF8C00',
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 16,
    color: '#FF8C00',
    fontWeight: '500',
  },
  approveButton: {
    flex: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#FF8C00',
    gap: 8,
  },
  approveButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});

export default OrderDetailsScreen;
