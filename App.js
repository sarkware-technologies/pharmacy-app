import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import NoInternetScreen from './src/components/NoInternetscreen';
import SplashScreen from './src/components/SplashScreen';
import { requestAllPermissions } from './src/utils/permissions';

import './GlobalFont';

const App = () => {
    const navigationRef = useRef(null);
    const [isConnected, setIsConnected] = useState(true);
    const [checking, setChecking] = useState(true);
    const [permissionsRequested, setPermissionsRequested] = useState(false);

    useEffect(() => {
        // Request permissions at app startup (sequentially)
        const requestPermissions = async () => {
            try {
                // Show splash screen while requesting permissions
                console.log('Starting permission requests...');
                
                // Request permissions one by one
                const permissions = await requestAllPermissions();
                
                console.log('All permissions requested. Status:', permissions);
                
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
                console.log('Hiding splash screen, starting app...');
                setChecking(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [permissionsRequested]);


    if (checking) {
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
            </View>
            <Toast topOffset={60} />
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
