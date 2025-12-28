import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

const AnimatedContent = ({
    loading,
    children,
    style,
    duration = 250,
    translateY = 20,
}) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translate = useRef(new Animated.Value(translateY)).current;

    useEffect(() => {
        if (!loading) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(translate, {
                    toValue: 0,
                    duration,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset when loading starts again
            opacity.setValue(0);
            translate.setValue(translateY);
        }
    }, [loading, duration, translateY]);

    return (
        <Animated.View
            style={[
                {
                    opacity,
                    transform: [{ translateY: translate }],
                },
                style,
            ]}
        >
            {children}
        </Animated.View>
    );
};

export default AnimatedContent;
