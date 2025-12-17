// AppText.js
import React from "react";
import { Text } from "react-native";

const AppText = ({ style, children, ...props }) => {
    return (
        <Text {...props} style={[{ fontFamily: "Lato-Bold", color:"#2b2b2b" }, style]}>
            {children}
        </Text>
    );
};

export default AppText;
