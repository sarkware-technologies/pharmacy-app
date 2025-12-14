import { ScrollView, StyleSheet, View } from "react-native";
import Button from "../../../../components/Button";
import CustomModal from "../../../../components/view/customModal"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppInput, AppText } from "../../../../components";
import { colors } from "../../../../styles/colors";
import ModalWarning from "../../../../components/icons/modelWarning"
import CommonStyle from "../../../../styles/styles";
import { Fonts } from "../../../../utils/fontHelper";
import CustomCheckbox from "../../../../components/view/checkbox";

const DiscountModal = ({ visible, onClose, onPress }) => {

    const List = [
        { labal: "5%-10%(100)", value: "1" },
        { labal: "10%-15%(50)", value: "2" },
        { labal: "15%-20%(10)", value: "3" },
        { labal: "20%-25%(25)", value: "4" },
        { labal: "25%-30%(10)", value: "5" },
        { labal: "More than 30%(10)", value: "6" },
    ]




    return (
        <CustomModal
            onClose={onClose}
            visible={visible}
            title={"Discount %"}
            headerStyle={{ borderBottomWidth: 0 }}
            footer={
                <Button style={{ paddingVertical: 10 }} onPress={() => onPress?.()}>Apply</Button>
            }
            footerStyle={{ borderTopWidth: 0, paddingHorizontal: 20 }}
            body={
                <View style={styles.bottomModalContainer}>
                    <AppInput style={CommonStyle.primaryInput} placeholder="Enter custom %" />

                    <View style={{ marginTop: 25, gap: 15, paddingHorizontal: 6 }}>
                        {List.map((e) => <CustomCheckbox borderWidth={1} checkboxStyle={{ marginRight: 5 }} size={14} activeColor="#F7941E" title={<AppText style={[CommonStyle.secondaryText, { color: colors.primaryText, fontSize: 16 }]}> {e.labal}</AppText>} />)}
                    </View>

                </View>
            }
        />

    );
};


const styles = StyleSheet.create({

    bottomModalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 25,
        width: '100%',
        paddingHorizontal: 20
    },

});


export default DiscountModal;