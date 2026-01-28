// AppInput.js
import React from "react";
import { TextInput } from "react-native";

const AppInput = ({ style, ref, ...props }) => {
    return (
        <TextInput
            ref={ref}
            {...props}
            style={[{ fontFamily: "Lato-Bold" }, style]}
        />
    );
};

export default AppInput;
