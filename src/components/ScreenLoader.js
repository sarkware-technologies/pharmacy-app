import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import SunLogo from './icons/SunLogo';

const ScreenLoader = ({ visible }) => {
  if (!visible) return null;

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,          // speed (ms)
        easing: Easing.linear,   // smooth constant rotation
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.overlay}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <SunLogo width={70} height={70} />
      </Animated.View>
    </View>
  );
};

export default ScreenLoader;
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999, // Android
  },
});