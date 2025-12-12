import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TextInput,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../styles/colors';
import Filter from '../../../components/icons/Filter';
import { AppText, AppInput } from "../../../components"
import Button from '../../../components/Button';
import BackButton from '../../../components/view/backButton';

const GroupUpdateScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectProduct, selectProductOld, selectProductNew, selectedCustomers, groupType, rcAction } = route.params || {};


    const TITLE_MAP = {
        addNew: "Add Products",
        productSwapping: "Product Swapping",
        updateDiscount: "Discount Update",
        updateSupply: "Supply Mode Update",
        quotation: "Quotation",
    };

    const title = TITLE_MAP[groupType] || "No page found";



    return (
        <>
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <View style={styles.header}>
                    <View>
                        <BackButton />
                        <AppText>{title}</AppText>
                    </View>
                </View>


                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                </ScrollView>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.lastSavedRow}>
                        <Icon name="refresh" size={16} color={colors.textSecondary} />
                        <AppText style={styles.lastSavedText}>Last saved 05/04/2025</AppText>
                    </TouchableOpacity>
                    <Button>
                        Submit
                    </Button>

                </View>



            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        paddingTop: 0,
        backgroundColor: '#F6F6F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        margin: -15,
        marginBottom: 15
    },
    content: {
        flex: 1,
    },

});

export default GroupUpdateScreen;