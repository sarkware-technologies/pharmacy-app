// AppText.js
import React from "react";
import { Text } from "react-native";

const AppText = ({ style, children, ...props }) => {
    return (
        <Text {...props} style={[{ fontFamily: "Lato-Bold" }, style]}>
            {children}
        </Text>
    );
};

export default AppText;
