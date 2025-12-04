import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import Order screens
import OrderList from '../screens/authorized/orders/OrderList';
import SelectDistributor from '../screens/authorized/orders/SelectDistributor';
import SearchAddProducts from '../screens/authorized/orders/SearchAddProducts';
import Cart from '../screens/authorized/orders/Cart';
import UploadOrder from '../screens/authorized/orders/UploadOrder';
import ProductMapping from '../screens/authorized/orders/ProductMapping';
import OrderDetailsScreen from '../screens/authorized/orders/OrderDetails';


const Stack = createStackNavigator();

// Orders Stack Navigator
const OrdersStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyleInterpolator: ({ current, layouts }) => {
        return {
          cardStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [layouts.screen.width, 0],
                }),
              },
            ],
            opacity: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        };
      },
    }}
  >
    <Stack.Screen name="OrderList" component={OrderList} options={{ unmountOnBlur: true }} />
  </Stack.Navigator>
);

export default OrdersStack;