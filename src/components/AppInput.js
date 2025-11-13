// AppInput.js
import React from "react";
import { TextInput } from "react-native";

const AppInput = ({ style, ...props }) => {
    return (
        <TextInput
            {...props}
            style={[{ fontFamily: "Lato-Bold" }, style]}
        />
    );
};

export default AppInput;
