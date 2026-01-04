// AppView.js
import { View } from "react-native";

const AppView = ({ style, children, backgroundColor, width, maxWidth, minWidth, height, minHeight, maxHeight, flexDirection, flex, display, justifyContent, alignItems, borderRadius, borderWidth, borderColor, gap, margin, padding, paddingHorizontal, paddingVertical, marginHorizontal, marginVertical, paddingLeft, paddingRight, paddingBottom, paddingTop, marginTop, marginRight, marginBottom, flexWrap,marginLeft, ...props }) => {
    return (
        <View {...props} style={[{ width, maxWidth, minWidth, height, minHeight, maxHeight, backgroundColor, flexDirection, flex, display, justifyContent, alignItems, borderRadius, borderWidth, borderColor, gap, margin, padding, paddingHorizontal, paddingVertical, marginHorizontal, marginVertical, paddingLeft, paddingRight, paddingBottom, paddingTop, marginTop, marginRight, marginBottom, marginLeft,flexWrap }, style]}>
            {children}
        </View>
    );
};

export default AppView;
