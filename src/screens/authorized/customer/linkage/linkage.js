import { ScrollView, TouchableOpacity, View } from "react-native";
import AppText from "../../../../components/AppText"
import { useEffect, useState } from "react";
import Divisions from "../../../../components/icons/Divisions";
import Distributors from "../../../../components/icons/Distributors";
import Field from "../../../../components/icons/Field";
import CustomerHierarchyIcons from "../../../../components/icons/CustomerHierarchy";
import Linkagestyles from "./style/linkagestyle"
import DivisionLinkage from "./component/division"
import DistributorLinkage from "./component/distributor"
import Fields from "./component/field"
import CustomerHierarchy from "./component/CustomerHierarchy"
import PERMISSIONS from "../../../../utils/RBAC/permissionENUM";
import checkPermission from "../../../../utils/RBAC/permissionHelper";

const LinkageView = ({ activeTab = "divisions", customerData, isLoading, isChild, saveDraft }) => {
    const [hasOtherDivisionPermission, setHasOtherDivisionPermission] = useState(false);
    const [hasPreferredDistributorPermission, setHasPreferredDistributorPermission,] = useState(false);
    const [hasAllDistributorPermission, setHasAllDistributorPermission] = useState(false);

    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const otherDivision = await checkPermission(
                    PERMISSIONS.ONBOARDING_LINKAGE_PAGE_DIVISION_OTHER_DIVISION_SECTION
                );

                const preferredDistributor = await checkPermission(
                    PERMISSIONS.ONBOARDING_LINKAGE_PAGE_DISTRIBUTOR_PREFERRED_DISTRIBUTOR_PAGE_VIEW
                );

                const allDistributor = await checkPermission(
                    PERMISSIONS.ONBOARDING_LINKAGE_PAGE_DISTRIBUTOR_PREFERRED_DISTRIBUTOR_PAGE_VIEW
                );

                setHasOtherDivisionPermission(otherDivision);
                setHasPreferredDistributorPermission(preferredDistributor);
                setHasAllDistributorPermission(allDistributor);

                console.log(
                    otherDivision,
                    preferredDistributor,
                    allDistributor,
                    "Permissions loaded"
                );
            } catch (error) {
                console.error("Permission check failed", error);
            }
        };

        checkPermissions();
    }, []);



    const tabs = [
        {
            label: "Divisions",
            key: "divisions",
            icon: <Divisions color={activeSubTab === 'divisions' ? '#000' : '#999'} />,
            disabled: false,
            component: <DivisionLinkage hasOtherDivisionPermission={hasOtherDivisionPermission} customerData={customerData} isLoading={isLoading} isChild={isChild} saveDraft={saveDraft} />
        },
        {
            label: "Distributors",
            key: "distributors",
            icon: <Distributors color={activeSubTab === 'distributors' ? '#000' : '#999'}
            />,
            disabled: false,
            component: <DistributorLinkage hasAllDistributorPermission={hasAllDistributorPermission} hasPreferredDistributorPermission={hasPreferredDistributorPermission} customerData={customerData} isLoading={isLoading} isChild={isChild} saveDraft={saveDraft} />
        },
        {
            label: "Field",
            key: "field",
            icon: <Field color={activeSubTab === 'field' ? '#000' : '#999'} />,
            disabled: false,
            component: <Fields customerData={customerData} isLoading={isLoading} isChild={isChild} saveDraft={saveDraft} />
        },
        {
            label: "Customer Hierarchy",
            key: "hierarchy",
            icon: <CustomerHierarchyIcons
            // color={openedDivisionsData.length > 0 ? activeSubTab === 'hierarchy' ? '#000' : '#999' : '#CCC'}
            />,
            disabled: false,
            component: <CustomerHierarchy customerData={customerData} isLoading={isLoading} isChild={isChild} saveDraft={saveDraft} />

        },
    ]
    const [activeSubTab, setActiveSubTab] = useState(activeTab);

    return (
        <View style={Linkagestyles.container}>
            <View style={Linkagestyles.stickyTabsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={Linkagestyles.subTabsContainer}
                    scrollEventThrottle={16}
                >
                    {tabs.map((e) => (
                        <TouchableOpacity
                            key={e.key}
                            style={[
                                Linkagestyles.subTab,
                                activeSubTab === e.key && Linkagestyles.activeSubTab,
                            ]}
                            onPress={() => setActiveSubTab(e.key)}
                            disabled={e.disabled}
                        >
                            {e.icon}
                            <AppText
                                style={[
                                    Linkagestyles.subTabText,
                                    activeSubTab === e.key && Linkagestyles.activeSubTabText,
                                ]}
                            >
                                {e.label}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={{ paddingTop: 50 }}>
                {tabs.find((e) => e?.key == activeSubTab)?.component}
            </View>
        </View>
    )

}


export default LinkageView;