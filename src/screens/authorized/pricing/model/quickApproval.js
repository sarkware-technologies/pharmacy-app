import React from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
} from 'react-native';
import { AppText } from '../../../../components';
import { CloseIcon } from '../../../../components/icons/pricingIcon';
import QuickApprovalIcon from '../../../../components/icons/quickApproval';
import Button from '../../../../components/Button';

import CustomModal from "../../../../components/view/customModal"

const QuickApproval = ({ visible, onClose, onPress }) => {
    const QCLIST = [
        { label: 'SLM & ABOVE', value: 'SLM & ABOVE' },
        { label: 'TLM & ABOVE', value: 'TLM & ABOVE' },
        { label: 'NSM & ABOVE', value: 'NSM & ABOVE' },
        { label: 'SBU & ABOVE', value: 'SBU & ABOVE' },
        { label: 'GSBU & ABOVE', value: 'GSBU & ABOVE' },
        { label: 'CLUSTER HEAD', value: 'CLUSTER HEAD' },

    ];

    const renderItem = ({ item }) => (
        <Button style={styles.quickList} onPress={() => onPress?.(item)}>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <AppText style={styles.quickText}>{item.label}</AppText>
                <QuickApprovalIcon />
            </View>
        </Button>
    );

    return (
        <CustomModal
            bodyScrollable={false}
            visible={visible}
            title={"Quick Approval"}
            onClose={() => onClose?.()}
            body={
                <View style={{ paddingHorizontal: 25, paddingTop: 20, paddingBottom: 15 }}>
                    <FlatList
                        data={QCLIST}
                        renderItem={renderItem}
                        keyExtractor={(item, i) => item.value + i}
                    />
                </View>
            }

        />
    );
};

const styles = StyleSheet.create({

    quickList: {
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 15,
        borderWidth: 0.5,
        borderColor: '#F7941E',
        backgroundColor: "white",
        borderRadius: 10,
        marginBottom: 16
    },
    quickText: {
        fontSize: 16,
        color: '#333',
    },
});

export default QuickApproval;
