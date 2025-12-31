import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Modal } from 'react-native';
import SunLogo from './icons/SunLogo';

let showFn = null;
let hideFn = null;

export const showLoader = () => showFn?.();
export const hideLoader = () => hideFn?.();

const ScreenLoader = () => {
  const [visible, setVisible] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    showFn = () => setVisible(true);
    hideFn = () => setVisible(false);

    return () => {
      showFn = null;
      hideFn = null;
    };
  }, []);

  useEffect(() => {
    if (visible) {
      rotateAnim.setValue(0);

      animationRef.current = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animationRef.current.start();
    } else {
      animationRef.current?.stop();
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <SunLogo width={70} height={70} />
        </Animated.View>
      </View>
    </Modal>
  );
};

export default ScreenLoader;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
