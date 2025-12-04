import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import NoInternetScreen from './src/components/NoInternetscreen';
import SplashScreen from './src/components/SplashScreen';


import './GlobalFont';

const App = () => {
    const navigationRef = useRef(null);
    const [isConnected, setIsConnected] = useState(true);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            setTimeout(() => setChecking(false), 1500);
        });

        return () => unsubscribe();
    }, []);


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
