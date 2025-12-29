import { Modal, StatusBar, TouchableOpacity, View } from "react-native";
import { AppText } from "../../../components";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCustomerLinkage } from "./service/useCustomerLinkage"
import { useEffect, useState, useCallback  } from "react";
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
import ChildLinkageDetails from "./childLinkage"
import { customerAPI } from "../../../api/customer";
import { findAndUpdate, transformCustomerData } from "./service/formatData";
import Toast from "react-native-toast-message";

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
    const [draftValue, setDraftValue] = useState();
    const [loading, setLoading] = useState(true);
    const [active, setActiveTab] = useState(activeTab);
    const [childCustomer, setChildCustomer] = useState(null);
    useEffect(() => {
        console.log(childCustomer, 3498273)
    }, [childCustomer])

    useEffect(() => {
        if (data && !isLoading) {
            setLoading(true);
            setCustomerDetails(data);
        }
        else {
            setLoading(false);
        }
        setDraftValue(draft ?? {});
        console.log(data, draft, hasDraft, isLoading, 2938749283)
    }, [data, isLoading])

    const saveDraft = async (action, data) => {
        console.log(customerDetails, 238942938)
        if (customerDetails?.instance?.stepInstances) {
            let filterData = data;
            if (action == "distributors") {
                filterData = { ...data, distributors: data?.distributors?.filter((e) => e.isActive == true) }
            }

            setCustomerDetails((prev) => ({ ...prev, ...filterData }));
            const instance = customerDetails?.instance;
            const draftEditPayload = {
                stepOrder: instance?.stepInstances?.[0]?.stepOrder || 1,
                parallelGroup: instance?.stepInstances?.[0]?.parallelGroup,
                comments: '',
                actorId: instance?.stepInstances?.[0]?.assignedUserId,
                dataChanges: {
                    ...draftValue,
                    ...filterData
                },
            };
            setDraftValue(draftEditPayload?.dataChanges)
            await customerAPI.draftEdit(instance?.workflowInstance?.id, draftEditPayload);
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
        // console.log(action, data, 239482637)
        // if (action == "divisions") {
        //     setCustomerDetails((prev) => ({ ...prev, ...data }));
        // }
        // else {
        //     setCustomerDetails((prev) => ({ ...prev, ...data }));
        // }
    }

    const workflowAction = async (action, comment = "") => {
        try {
            const instance = customerDetails?.instance;

            if (!instance?.stepInstances?.length) {
                Toast.show({
                    type: "error",
                    text1: "Action failed",
                    text2: "Workflow instance not found",
                });
                return;
            }

            const stepInstance = instance.stepInstances[0];
            const instanceId = instance.workflowInstance?.id;
            const basePayload = {
                stepOrder: stepInstance?.stepOrder || 1,
                parallelGroup: stepInstance?.parallelGroup,
                actorId: stepInstance?.assignedUserId,
                comments: comment,
                dataChanges: {
                    customerGroupId: customerDetails?.customerGroupId,
                    mapping: customerDetails?.mapping || [],
                    divisions: (customerDetails?.divisions || []).filter(
                        (div) => div?.isOpen !== true
                    ),
                    distributorMapping: customerDetails?.distributors || [],
                },
            };


            if (
                action === "APPROVE" ||
                action === "REJECT"
            ) {
                const payload = {
                    ...basePayload,
                    action,
                };

                const response = await customerAPI.workflowAction(instanceId, payload);

                // ✅ SUCCESS HANDLING
                if (response?.status === 'success') {
                    // notify parent list to refresh (optional but recommended)
                    const parentNav = navigation.getParent();
                    parentNav?.setParams({
                        pendingCustomerAction: action, // APPROVE / REJECT
                    });

                    if (action == "APPROVE") {
                        Toast.show({
                            type: "success",
                            text1: "Approve",
                            text2: `Customer has been successfully approved!`,
                        });
                    } else {
                        Toast.show({
                            type: "error",
                            text1: "Reject",
                            text2: `Customer has been rejected!`,
                        });
                    }

                    // go back
                    setTimeout(() => {
                        navigation.goBack();
                    }, 300);
                }

                return response;
            }

            if (action === "send_back") {
                const response = await customerAPI.workflowReassign(instanceId, basePayload);

                console.log(response, 345);

                // ✅ SUCCESS HANDLING
                if (response?.status === 'success') {
                    // notify parent list to refresh (optional but recommended)
                    Toast.show({
                        type: "error",
                        text1: "Send Back",
                        text2: `Customer form has been sent back!`,
                    });

                    const parentNav = navigation.getParent();
                    parentNav?.setParams({
                        pendingCustomerAction: action, // APPROVE / REJECT
                    });

                    // go back
                    setTimeout(() => {
                        navigation.goBack();
                    }, 300);
                }

                return response;
            }

            Toast.show({
                type: "error",
                text1: "Invalid action",
                text2: `Unsupported action: ${action}`,
            });
        } catch (error) {
            console.error("performCustomerAction error:", error);
            Toast.show({
                type: "error",
                text1: "Action failed",
                text2: error?.message || "Something went wrong",
            });
            throw error;
        }
    };




    const saveDraftParent = (action, data) => {
        let parantData = findAndUpdate({ mapping: customerDetails?.mapping, tab: childCustomer?.tab, childTab: childCustomer?.childTab, customerId: childCustomer?.customer?.id, parentId: childCustomer?.parentId, updateValue: data })
        saveDraft(action, { mapping: parantData })
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



            {active == "details" ? <DetailsView instance={customerDetails?.instance} customerData={customerDetails} loading={isLoading} saveDraft={saveDraft} workflowAction={workflowAction} setActiveTab={setActiveTab} /> : <LinkageView instance={customerDetails?.instance} setChildCustomer={setChildCustomer} customerData={customerDetails} loading={isLoading} isChild={false} saveDraft={saveDraft} />}

            <Modal
                visible={childCustomer != null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setChildCustomer(null)}
            >
                <ChildLinkageDetails saveDraftParent={saveDraftParent} instance={customerDetails?.instance} parantCustomer={childCustomer?.customer} setChildCustomer={setChildCustomer} onClose={() => setChildCustomer(null)} activeTab={"details"} customerId={childCustomer?.customer?.id} isStaging={childCustomer?.isStaging} />

            </Modal>
        </SafeAreaView>
    )

}


export default CustomerDetails;