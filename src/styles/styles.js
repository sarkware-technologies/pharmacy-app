import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { Fonts } from "../utils/fontHelper";

const CommonStyle = StyleSheet.create({
    SpaceBetween: { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.primaryText,
        marginRight: 'auto',
        marginLeft: 10,
        marginRight: 20
    },
    secondaryText: {
        color: colors.secondaryText,
        fontFamily: Fonts.Regular,
        fontWeight: 400,
    },
    primaryText: {
        color: colors.primaryText,
        fontFamily: Fonts.Bold,
        fontWeight: 600,
    },
    secondaryButton: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: colors.primaryText
    },
    secondaryButtonText: {
        color: colors.primaryText
    },
    primaryInput: {
        borderWidth: 1,
        borderColor: "#909090",
        backgroundColor: "white",
        borderRadius: 10,
        paddingHorizontal:20,
        paddingVertical:15
    }

});


export default CommonStyle;