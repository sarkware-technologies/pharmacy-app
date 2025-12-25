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
const CustomerDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const {
        customerId,
        isStaging,
        activeTab = "details",
    } = route.params || {};
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
        console.log(data, draft, hasDraft, isLoading, 2938749283)
    }, [data, isLoading])

    const saveDraft = (action, data) => {
        setCustomerDetails((prev) => ({ ...prev, ...data }));
        // console.log(action, data, 239482637)
        // if (action == "divisions") {
        //     setCustomerDetails((prev) => ({ ...prev, ...data }));
        // }
        // else {
        //     setCustomerDetails((prev) => ({ ...prev, ...data }));
        // }
    }


    return (
        <SafeAreaView style={Customerstyles.safeArea} edges={['top']}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <View style={Customerstyles.header}>
                {/* LEFT SECTION – 60% */}
                <View style={Customerstyles.leftSection}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={Customerstyles.backBtn}
                    >
                        <ChevronLeft color="#333" />
                    </TouchableOpacity>

                    <AppText
                        style={Customerstyles.headerTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >

                        {customerDetails?.generalDetails?.customerName}
                    </AppText>
                </View>

                {/* RIGHT SECTION – 40% */}
                <View style={Customerstyles.rightSection}>

                    {active === 'details' ? (
                        <TouchableOpacity
                            style={Customerstyles.logsButton}
                        >
                            <MaterialIcons
                                name="history"
                                size={20}
                                color="#2B2B2B"
                            />
                            <AppText style={Customerstyles.logsButtonText}>Logs</AppText>
                        </TouchableOpacity>
                    ) : (
                        <>

                        </>

                    )}

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

            {active == "details" ? <DetailsView customerData={customerDetails} loading={isLoading} saveDraft={saveDraft} /> : <LinkageView customerData={customerDetails} loading={isLoading} isChild={false} saveDraft={saveDraft} />}


        </SafeAreaView>
    )

}


export default CustomerDetails;