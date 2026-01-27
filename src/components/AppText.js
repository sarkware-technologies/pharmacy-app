// AppText.js
import React from "react";
import { Text } from "react-native";
import { Fonts } from "../utils/fontHelper";
import { colors } from "../styles/colors"

function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

const AppText = ({
    style,
    children,
    fontFamily = 'Bold',
    fontSize,
    color = colors.primaryText,
    fontWeight,
    letterSpacing,
    numberOfLines,
    ellipsizeMode = "tail",
    ...props
}) => {
    const findFont = Fonts?.[capitalize(fontFamily)] ?? Fonts.Bold;

    return (
        <Text
            {...props}
            numberOfLines={numberOfLines}
            ellipsizeMode={ellipsizeMode}
            style={[
                { fontFamily: findFont, color, fontSize, fontWeight, letterSpacing },
                style,
            ]}
        >
            {children}
        </Text>
    );
};


export default AppText;
