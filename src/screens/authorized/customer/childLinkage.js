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
import { customerAPI } from "../../../api/customer";
import { transformCustomerData } from "./service/formatData";
import Toast from "react-native-toast-message";
const ChildLinkageDetails = ({ customerId, isStaging, activeTab, onClose, setChildCustomer, parantCustomer, instance, saveDraftParent }) => {
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
            const divisions = parantCustomer?.divisions ?? data?.divisions;
            const distributors = parantCustomer?.distributors ?? data?.distributors;
            const customerGroupId = parantCustomer?.customerGroupId ?? data?.customerGroupId;
            const isApproved = parantCustomer?.isApproved;
            setCustomerDetails({ ...data, ...{ divisions, distributors, customerGroupId, isApproved } });
        }
        else {
            setLoading(false);
        }
    }, [data, isLoading, parantCustomer])



    const saveDraft = async (action, data, close) => {
        console.log(customerDetails, 238942938)

        if (instance?.stepInstances) {
            setCustomerDetails((prev) => ({ ...prev, ...data }));
            saveDraftParent('mapping', data)
        }
        else {
            if (!customerDetails?.stgCustomerId && customerDetails?.customerId) {
                setCustomerDetails((prev) => ({ ...prev, ...data }));
                if (action == "divisions") {
                    const divi = data?.divisions.map((e) => {
                        return {
                            divisionId: parseInt(e?.divisionId),
                            isActive: true,
                        };
                    });
                    await customerAPI.linkDivisions(customerId, { divisions: divi });
                } else if (action == "distributors") {
                    const distributor = data?.distributors?.map((dist) => ({
                        distributorId: Number(dist?.id),
                        divisions:
                            dist?.divisions?.map((div) => ({
                                id: Number(div?.divisionId),
                                isActive: true,
                            })) ?? [],
                        supplyModeId: Number(dist?.supplyMode ?? 3),
                        margin: Number(dist?.margin ?? 0),
                        isActive: dist?.isActive,
                    }));
                    await customerAPI.linkDistributorDivisions(customerId, { mappings: distributor })
                } else if (action == "customerGroup") {
                    const cleanedPayload = transformCustomerData(customerDetails);
                    await customerAPI.updateCustomerGroup(customerId, { ...cleanedPayload, ...{ customerGroupId: data?.customerGroupId }, })

                }
            }
            else {
                Toast.show({
                    type: 'error',
                    text1: 'Task issue',
                    text2: 'Task Not Assignt to you',
                });
            }

        }
        if (close) {
            onClose?.();
        }
        // console.log(action, data, 239482637)
        // if (action == "divisions") {
        //     setCustomerDetails((prev) => ({ ...prev, ...data }));
        // }
        // else {
        //     setCustomerDetails((prev) => ({ ...prev, ...data }));
        // }
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

            {active == "details" ? <DetailsView instance={instance} isChild={true} customerData={customerDetails} loading={isLoading} saveDraft={saveDraft} /> : <LinkageView setChildCustomer={setChildCustomer} customerData={customerDetails} loading={isLoading} isChild={true} saveDraft={saveDraft} />}


        </View>
    )

}


export default ChildLinkageDetails;