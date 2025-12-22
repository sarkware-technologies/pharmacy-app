import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppText from "../AppText"
import { Fonts } from "../../utils/fontHelper";
import { colors } from "../../styles/colors";

const RadioOption = ({ label, selected, onSelect }) => (
    <TouchableOpacity style={styles.radioOption} onPress={() => onSelect?.()}>
        <View style={[styles.radio, selected && styles.radioSelected]}>
            {selected && <View style={styles.radioInner} />}
        </View>
        <AppText style={[styles.radioText, selected && styles.radioSelectedText]}>
            {label}
        </AppText>
    </TouchableOpacity>
);




const styles = StyleSheet.create({

    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radio: {
        width: 14,
        height: 14,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: "#909090",
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: "#F7941E",
    },
    radioSelectedText: {
        fontFamily: Fonts.Bold,
        fontWeight: 600,
        color: colors.primaryText
    },
    radioInner: {
        width: 7,
        height: 7,
        borderRadius: 5,
        backgroundColor: "#F7941E",
    },
    radioText: {
        fontSize: 13,
        color: colors.secondaryText,
        fontFamily: Fonts.Regular
    },

})




export default RadioOption;