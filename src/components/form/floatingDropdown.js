import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Animated,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import OnboardStyle from "../../screens/authorized/onboard/style/onboardStyle";
import AppText from "../AppText";
import AppInput from "../AppInput";
import { colors } from "../../styles/colors";
import Downarrow from "../icons/downArrow";
import SearchableDropdownModal from "../modals/SearchableDropdownModal";
import AppView from "../AppView";

const FloatingDropdown = ({
    label,
    selected,
    error,
    disabled = false,
    style,
    inputStyle,
    labelStyle = { fontSize: 14 },
    isRequired = false,
    searchTitle,
    onSelect,
    options = [],
    onSearch,
    onAddNew,
    onPress,
    rightIcon=true,
    ...props
}) => {
    const isFirstRender = useRef(true);
    const [isFocused, setIsFocused] = useState(false);
    const [visible, setVisible] = useState(false);

    const value = useMemo(() => {
        return options?.find((e) => e?.id == selected)
    }, [selected, options])
    const animatedValue = useRef(new Animated.Value(selected ? 1 : 0)).current;


    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        Animated.timing(animatedValue, {
            toValue: visible || selected ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();

        setIsFocused(visible);
    }, [visible, selected]);



    const LocallabelStyle = {
        position: "absolute",
        left: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 16],
        }),
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [14, -10],
        }),
        color: disabled
            ? "#bdbdbd"
            : isFocused
                ? colors.primary
                : "#999",
        backgroundColor: "white",
        paddingLeft: 5,
        paddingRight: 0,
        zIndex: 99
    };

    return (
        <AppView marginVertical={10}>
            <View>
                <TouchableOpacity
                    onPress={() => onPress ? onPress?.() : setVisible(true)}
                    disabled={disabled}
                    style={[
                        styles.container,
                        isFocused && !disabled && !error && styles.focusedContainer,
                        error && styles.errorContainer,
                        style,
                    ]}
                >
                    <Animated.Text style={[LocallabelStyle, labelStyle]}>{label} {isRequired && (<AppText style={[OnboardStyle.requiredIcon, { fontSize: 12 }]}>*</AppText>)}  </Animated.Text>
                    <AppText style={{ paddingLeft: 20 }}>{value?.name}</AppText>

                    {rightIcon &&
                    <View style={{ paddingHorizontal: 20, transform: [{ rotate: !visible ? "0deg" : "180deg" }] }} >
                        <Downarrow />
                    </View>
                    }
                    


                </TouchableOpacity>
                
                     <SearchableDropdownModal onAddNew={onAddNew} selectedId={selected} onSearch={onSearch} onSelect={onSelect} visible={visible} onClose={() => setVisible(false)} data={options} title={searchTitle} />
           
            </View>
            {error && <AppText style={{ marginTop: 5, paddingLeft: 15 }} fontFamily="regular" fontWeight={400} color="red" >{error}</AppText>}

        </AppView>
    );
};

export default FloatingDropdown;


const styles = StyleSheet.create({
    container: {
        borderWidth: 1.5,
        borderColor: "#E3E3E3",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 17,
        justifyContent: "space-between"
    },
    input: {
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#000",
        flex: 1
    },
    errorInput: {
        borderColor: "#d32f2f",
    },
    disabledInput: {
        borderColor: "#e0e0e0",
        backgroundColor: "#f5f5f5",
        color: "#9e9e9e",
    },
    inputStyle: {
        paddingVertical: 20,

    },
    focusedContainer: {
        borderColor: colors.primary,
        borderWidth: 1.5,
        fontWeight: 600
    },
    errorContainer: {
        borderColor: "red",
        borderWidth: 1
    }
});

