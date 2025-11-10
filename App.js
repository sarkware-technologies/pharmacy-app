import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import NoInternetScreen from './src/components/NoInternetscreen';
import SplashScreen from './src/components/SplashScreen';


const App = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
            setTimeout(() => {
                setChecking(false);
            }, 1500)
        });

        return () => unsubscribe();
    }, []);

    const handleRetry = () => {
        NetInfo.fetch().then(state => {
            setIsConnected(state.isConnected);
        });
    };

    if (checking) {
        return <SplashScreen />
    }

    return (
        <Provider store={store}>
            <View style={{ flex: 1 }}>
                <AppNavigator />
                {!isConnected && (
                    <View style={styles.overlay}>
                        <NoInternetScreen onRetry={handleRetry} />
                    </View>
                )}
            </View>
            <Toast />
        </Provider>
    );
};

export default App;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999, // ensures it’s above everything
        elevation: 10, // for Android
    },
});
