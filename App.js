import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import AppToast from "./src/components/AppToast"
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import NoInternetScreen from './src/components/NoInternetscreen';
import SplashScreen from './src/components/SplashScreen';
import { requestAllPermissions } from './src/utils/permissions';

import './GlobalFont';
import ScreenLoader from './src/components/ScreenLoader';
import { authAPI } from './src/api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserDetails } from './src/redux/slices/authSlice';

const App = () => {
    const navigationRef = useRef(null);
    const [isConnected, setIsConnected] = useState(true);
    const [checking, setChecking] = useState(true);
    const [fetchingCustomer, setFetchingCustomer] = useState(true);
    const [permissionsRequested, setPermissionsRequested] = useState(false);



    useEffect(() => {
        // Request permissions at app startup (sequentially)
        const requestPermissions = async () => {
            try {

                // Request permissions one by one
                const permissions = await requestAllPermissions();

                // Wait a bit to ensure all permission dialogs are closed
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mark permissions as requested
                setPermissionsRequested(true);
            } catch (error) {
                console.error('Error requesting permissions:', error);
                // Even if there's an error, continue with app
                setPermissionsRequested(true);
            }
        };

        // Start permission requests
        requestPermissions();

        // Check network connectivity
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);


    useEffect(() => {
        // Once permissions are requested, wait a bit then hide splash screen
        // This ensures the app doesn't freeze and all permission dialogs are closed
        if (permissionsRequested) {
            const timer = setTimeout(() => {
                setChecking(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [permissionsRequested]);



    const fetchCustomerDetails = async () => {
        try {
            if (!await AsyncStorage.getItem('authToken')) return
            setFetchingCustomer(true);
            const response = await authAPI.getUserDetails();
            console.log(response?.data, 23498237)
            if (response?.data) {
                await updateUserDetails({
                    roleName: response.data?.roleName,
                    subrolename: response.data?.subrolename,
                    userId: response.data?.userId,
                    permissions: response.data?.permissions,
                    user: {
                        id: response.data?.userId,
                        name: response.data?.userDetails?.[0]?.employeeName,
                        email: response.data?.email,
                        mobile: response.data?.mobile,
                        roleId: response.data?.roleId,
                        subroleId: response.data?.subroleId,
                        stationCode: response.data?.stationCode,
                        isFirstLogin: response.data?.isFirstLogin,
                        userDetails: response.data?.userDetails?.[0],
                        userPermissions: response.data?.userPermissions,
                        roleName: response.data?.roleName,
                        subRoleName: response.data?.subRoleName ?? null
                    }
                });
            }
        }
        catch (e) {

        }
        finally {
            setFetchingCustomer(false)
        }
    }

    useEffect(() => {
        fetchCustomerDetails();
    }, [])


    if (checking || fetchingCustomer) {
        return <SplashScreen />;
    }

    return (
        <Provider store={store}>
            <View style={{ flex: 1 }}>
                <AppNavigator navigationRef={navigationRef} />

                {!isConnected && (
                    <View style={styles.overlay}>
                        <NoInternetScreen onRetry={() => NetInfo.fetch().then(state => setIsConnected(state.isConnected))} />
                    </View>
                )}

                <Toast topOffset={60} />

                <AppToast />
            </View>

            <ScreenLoader />
        </Provider>
    );
};

export default App;

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        elevation: 10,
    },
});
