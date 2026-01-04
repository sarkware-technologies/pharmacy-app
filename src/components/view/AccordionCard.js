import React, { useState, memo, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import AnimatedContent from "./AnimatedContent";

if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const AccordionCard = ({
    title,
    children,
    insideToggle = true,
    onToggle,
    isOpen=false
}) => {
    const [open, setOpen] = useState(isOpen);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen(prev => !prev);
    };

    // External trigger
    useEffect(() => {
        if (onToggle == "open") {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOpen(true);
        }
        else if (onToggle == "close") {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOpen(false);
        }
    }, [onToggle]);

    return (
        <View >
            {/* Header */}
            {insideToggle ? (
                <TouchableOpacity onPress={toggle} activeOpacity={0.8}>
                    {title}
                </TouchableOpacity>
            ) : (
                title
            )}

            {/* Body */}
            {open &&
                <AnimatedContent><View >{children}</View></AnimatedContent>
            }
        </View>
    );
};

export default memo(AccordionCard);



