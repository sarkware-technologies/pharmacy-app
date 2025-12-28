import { StatusBar, TouchableOpacity, View } from "react-native";
import { AppText } from "../../../components";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCustomerLinkage } from "./service/useCustomerLinkage"
import { useEffect, useState } from "react";
import Customerstyles from "./linkage/style/style"
import { SafeAreaView } from "react-native-safe-area-context";
import PermissionWrapper from "../../../utils/RBAC/permissionWrapper";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ChevronLeft from "../../../components/icons/ChevronLeft";
import PERMISSIONS from "../../../utils/RBAC/permissionENUM";
import Details from "../../../components/icons/Details";
import Linkage from "../../../components/icons/Linkage";
import { colors } from "../../../styles/colors";
import DetailsView from "./linkage/details"
import LinkageView from "./linkage/linkage"
const ChildLinkageDetails = ({ customerId, isStaging, activeTab, onClose, setChildCustomer, parantCustomer }) => {
    const {
        data,
        draft,
        hasDraft,
        isLoading,
    } = useCustomerLinkage({
        customerId,
        isStaging: isStaging,
    });

    const [customerDetails, setCustomerDetails] = useState();
    const [loading, setLoading] = useState(true);
    const [active, setActiveTab] = useState(activeTab);

    useEffect(() => {
        if (data && !isLoading) {
            setLoading(true);
            setCustomerDetails(data);
        }
        else {
            setLoading(false);
        }
    }, [data, isLoading])

    const saveDraft = (action, data) => {
        setCustomerDetails((prev) => ({ ...prev, ...data }));
    }


    return (
        <View style={Customerstyles.safeArea} edges={['top']}>
            <View style={Customerstyles.header}>
                {/* LEFT SECTION – 60% */}
                <View style={Customerstyles.leftSection}>
                    <TouchableOpacity
                        onPress={() => onClose?.()}
                        style={Customerstyles.backBtn}
                    >
                        <ChevronLeft color="#333" />
                    </TouchableOpacity>

                    <AppText
                        style={Customerstyles.headerTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >

                        {customerDetails?.generalDetails?.customerName} child
                    </AppText>
                </View>

            </View>
            <View style={Customerstyles.tabContainer}>
                <TouchableOpacity
                    style={[Customerstyles.tab, active === 'details' && Customerstyles.activeTab]}
                    onPress={() => setActiveTab('details')}
                >
                    <Details color={active === 'details' ? colors.primary : '#999'} />
                    <AppText style={[Customerstyles.tabText, active === 'details' && Customerstyles.activeTabText]}>
                        Details
                    </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[Customerstyles.tab, active === 'linkaged' && Customerstyles.activeTab]}
                    onPress={() => setActiveTab('linkaged')}
                >
                    <Linkage color={active === 'linkaged' ? colors.primary : '#999'} />
                    <AppText style={[Customerstyles.tabText, active === 'linkaged' && Customerstyles.activeTabText]}>
                        Linkages
                    </AppText>
                </TouchableOpacity>
            </View>

            {active == "details" ? <DetailsView customerData={customerDetails} loading={isLoading} saveDraft={saveDraft} /> : <LinkageView setChildCustomer={setChildCustomer} customerData={customerDetails} loading={isLoading} isChild={true} saveDraft={saveDraft} />}


        </View>
    )

}


export default ChildLinkageDetails;