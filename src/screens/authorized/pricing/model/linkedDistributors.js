import { FlatList, StyleSheet, View } from "react-native";
import Button from "../../../../components/Button";
import CustomModal from "../../../../components/view/customModal";
import { AppInput, AppText } from "../../../../components";
import { colors } from "../../../../styles/colors";
import CommonStyle from "../../../../styles/styles";
import CustomCheckbox from "../../../../components/view/checkbox";
import Svg, { Path } from "react-native-svg";
import RadioOption from "../../../../components/view/RadioOption";

const LinkDistributorModal = ({ visible, onClose, onPress }) => {

    const List = [
        { name: "Mahalaxmi distributors", code: "2536", city: "Pune", supplyType: 1 },
        { name: "Mahalaxmi distributors", code: "2536", city: "Pune", supplyType: 1 },
        { name: "Mahalaxmi distributors", code: "2536", city: "Pune", supplyType: 1 },
        { name: "Mahalaxmi distributors", code: "2536", city: "Pune", supplyType: 2 },
        { name: "Mahalaxmi distributors", code: "2536", city: "Pune", supplyType: 1 },
        { name: "Mahalaxmi distributors", code: "2536", city: "Pune", supplyType: 1 },
        { name: "Mahalaxmi distributors", code: "2536", city: "Pune", supplyType: 2 },
        { name: "Mahalaxmi distributors", code: "2536", city: "Pune", supplyType: 1 },
        { name: "Mahalaxmi distributors", code: "2536", city: "Pune", supplyType: 1 },
        { name: "Mahalaxmi distributors", code: "2536", city: "Pune", supplyType: 2 },
    ]

    const renderItem = ({ item }) => (
        <View style={[CommonStyle.SpaceBetween, { paddingVertical: 10, marginHorizontal: 20, borderBottomColor: "#90909080", borderBottomWidth: 0.5 }]}>
            <View style={{ gap: 10 }}>
                <AppText style={[CommonStyle.primaryText, { fontSize: 14 }]}>{item?.name}</AppText>
                <AppText style={[CommonStyle.secondaryText, { fontSize: 14 }]}>{item?.code} | {item?.city}</AppText>
            </View>
            <View style={{ gap: 10, }}>
                <RadioOption label="Net Rate" selected={item.supplyType == 1} />
                <RadioOption label="Chargeback" selected={item.supplyType == 2} />
            </View>
        </View>
    );

    return (
        <CustomModal
            visible={visible}
            bodyScrollable={false}
            onClose={onClose}
            showClose={false}
            title="Linked Distributors"
            footer={
                <Button style={{ paddingVertical: 10 }} onPress={onPress}>
                    Done
                </Button>
            }
            footerStyle={{ borderTopWidth: 0, paddingHorizontal: 20 }}
            body={
                <FlatList
                    data={List}
                    keyExtractor={(item, index) => item.labal + index.toString()}
                    renderItem={renderItem}
                    stickyHeaderIndices={[0]}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListHeaderComponent={
                        <View style={styles.stickyInput}>
                            <View style={[CommonStyle.SpaceBetween, { alignItems: "flex-start", paddingVertical: 5, paddingHorizontal: 22, paddingBottom: 12 }]}>
                                <View style={{ gap: 10 }}>
                                    <AppText style={{ fontSize: 16 }}>Columbia Asia</AppText>
                                    <View style={[CommonStyle.SpaceBetween, { gap: 7 }]}>
                                        <Svg width="11" height="10" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <Path d="M7.16667 1.16667H12.5M7.16667 3.83333H10.5M7.16667 7.83333H12.5M7.16667 10.5H10.5M0.5 1.16667C0.5 0.989856 0.570238 0.820287 0.695262 0.695262C0.820286 0.570238 0.989856 0.5 1.16667 0.5H3.83333C4.01014 0.5 4.17971 0.570238 4.30474 0.695262C4.42976 0.820287 4.5 0.989856 4.5 1.16667V3.83333C4.5 4.01014 4.42976 4.17971 4.30474 4.30474C4.17971 4.42976 4.01014 4.5 3.83333 4.5H1.16667C0.989856 4.5 0.820286 4.42976 0.695262 4.30474C0.570238 4.17971 0.5 4.01014 0.5 3.83333V1.16667ZM0.5 7.83333C0.5 7.65652 0.570238 7.48695 0.695262 7.36193C0.820286 7.2369 0.989856 7.16667 1.16667 7.16667H3.83333C4.01014 7.16667 4.17971 7.2369 4.30474 7.36193C4.42976 7.48695 4.5 7.65652 4.5 7.83333V10.5C4.5 10.6768 4.42976 10.8464 4.30474 10.9714C4.17971 11.0964 4.01014 11.1667 3.83333 11.1667H1.16667C0.989856 11.1667 0.820286 11.0964 0.695262 10.9714C0.570238 10.8464 0.5 10.6768 0.5 10.5V7.83333Z" stroke="#909090" strokeLinecap="round" strokeLinejoin="round" />
                                        </Svg>
                                        <AppText style={[CommonStyle.secondaryText, { fontSize: 14 }]}>2536  |  Pune</AppText>

                                    </View>
                                </View>
                                <View>
                                    <AppText style={{ fontSize: 16 }}>SUNRC_1</AppText>
                                </View>
                            </View>
                            <View style={[[CommonStyle.SpaceBetween, { paddingVertical: 20, backgroundColor: "#F6F6F6", paddingHorizontal: 22 }]]}>
                                <AppText style={[CommonStyle.secondaryText, { fontSize: 14 }]}>Distributor name</AppText>
                                <AppText style={[CommonStyle.secondaryText, { fontSize: 14 }]}>Supply Mode</AppText>
                            </View>
                        </View>
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                />
            }
        />
    );
};

const styles = StyleSheet.create({
    stickyInput: {
        backgroundColor: "#fff",
        paddingTop: 10,
        paddingBottom: 10,
        zIndex: 10, // Android safety
    },
    bottomModalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        // paddingBottom: 25,
        width: '100%',
        paddingHorizontal: 20
    },
});

export default LinkDistributorModal;
