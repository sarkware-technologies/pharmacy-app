// Mock data and API functions for Orders

import apiClient from './apiClient';


export const mockOrders = [
  {
    id: 'SUNPH-10286',
    customerId: '0001003682',
    customerName: 'A. A Pharma',
    location: 'Bengaluru',
    division: 'In CNS',
    additionalCount: 2,
    date: '27/04/2023',
    time: '16:05:52',
    rateType: 'Net Rate',
    totalAmount: 5967.06,
    skuCount: 42,
    status: 'SUBMITTED',
    pendingActionBy: {
      name: 'Abhishek Purane',
      phone: '9090908070',
      role: 'MR'
    }
  },
  {
    id: 'SUNPH-10285',
    customerId: '0001003682',
    customerName: 'A A PHARMACEUTICALS',
    location: 'Bengaluru',
    division: 'In CNS',
    additionalCount: 2,
    date: '27/04/2023',
    time: '16:05:52',
    rateType: 'Net Rate',
    totalAmount: 5967.06,
    skuCount: 42,
    status: 'APPROVED',
    pendingActionBy: {
      name: 'Columbia Asia',
      phone: '9090908070',
      role: 'Hospital'
    }
  }
];

export const mockDistributors = [
  {
    id: '1',
    name: 'Mahalaxmi Distributors',
    code: '10106555',
    location: 'Pune'
  },
  {
    id: '2',
    name: 'Tapadiya Distributors',
    code: '10018019',
    location: 'Pimpri'
  },
  {
    id: '3',
    name: 'Modern Drug Stores and Distributors',
    code: '10106555',
    location: 'Pune'
  },
  {
    id: '4',
    name: 'Shree Sai Medico Stores',
    code: '0001004320',
    location: 'Vimannagar'
  }
];

export const mockProducts = [
  {
    id: 'INF30R0552',
    name: 'TELMIKIND-TRIO 12.5 TABLETS',
    customerProduct: 'TELMIKIND-TRIO',
    ptr: 46.34,
    margin: 10.34,
    discount: 10.34,
    pth: 56.34,
    taxGST: '4.6 (10%)',
    exhaustedQty: 100,
    maxQty: 200,
    moq: 50,
    orderValue: 2548.7,
    quantity: 50
  },
  {
    id: 'INF30R0553',
    name: 'WILLGO CR Tablet',
    customerProduct: 'WILLGO CR Tablet',
    ptr: 0,
    margin: 0,
    discount: 0,
    pth: 0,
    taxGST: 0,
    exhaustedQty: 0,
    maxQty: 0,
    moq: 50,
    orderValue: 0,
    quantity: 50,
    isMappingRequired: true
  }
];

// API functions (will be replaced with actual API calls)
export const getOrders = async ({ page = 1, limit = 10, search = '', status = 'All' } = {}) => {
  try {
    const data = {
      pageNo: page,
      limit
    };
    if (search) {
      data.searchText = search;
    }
    if (status && status !== "All") {
      switch (status) {
        case "Waiting for Confirmation":
          data.status = "PROCCESINGx";
          break;
        case "Hold":
          data.status = "HOLD";
          break;
        case "Track PO":
          data.status = "TRACKPO";
          break;
        default:
          break;
      }
    }

    const response = await apiClient.get('/orders/order/order-list', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getDistributors = async (customerId) => {
  try {

    const response = await apiClient.get(`/user-management/customer/linked-distributor-division/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Product APIs
export const getProducts = async ({ page = 1, limit = 20, search = '', customerIds, distributorIds }) => {
  try {
    const data = {
      pageNo: page,
      pageSize: limit
    };

    if (search) {
      data.search = search;
    }
    if (customerIds) {
      data.customerIds = customerIds;
    }
    if (distributorIds) {
      data.distributorIds = distributorIds;
    }

    const response = await apiClient.post('/rate-contract/rc/products-by-distributor-and-customer', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        orderId: `SUNPH-${Math.floor(10000 + Math.random() * 90000)}`,
        message: 'Order created successfully'
      });
    }, 1000);
  });
};