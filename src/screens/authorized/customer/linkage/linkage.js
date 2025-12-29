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
import HorizontalSelector from "../../../../components/view/HorizontalSelector";
import { SkeletonDetailPage } from "../../../../components/SkeletonLoader";

const LinkageView = ({ activeTab = "divisions", customerData, loading, isChild, saveDraft,setChildCustomer,instance }) => {
    const [hasOtherDivisionPermission, setHasOtherDivisionPermission] = useState(false);
    const [hasPreferredDistributorPermission, setHasPreferredDistributorPermission,] = useState(false);
    const [checkLinkeEditAccess, setCheckLinkeEditAccess,] = useState(false);
    const [hasAllDistributorPermission, setHasAllDistributorPermission] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState(activeTab);

    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const otherDivision = await checkPermission(
                    PERMISSIONS.ONBOARDING_LINKAGE_PAGE_DIVISION_OTHER_DIVISION_SECTION
                );

                const preferredDistributor = await checkPermission(
                    PERMISSIONS.ONBOARDING_LINKAGE_PAGE_DISTRIBUTOR_PREFERRED_DISTRIBUTOR_PAGE_VIEW
                );

                const checkLinkeEditAccess = await checkPermission(
                    PERMISSIONS.ONBOARDING_LINKAGE_PAGE_DISTRIBUTOR_LINKED_DISTRIBUTOR_ADD
                );
                const allDistributor = await checkPermission(
                    PERMISSIONS.ONBOARDING_LINKAGE_PAGE_DISTRIBUTOR_ALL_DISTRIBUTOR_PAGE_VIEW
                );

                setHasOtherDivisionPermission(otherDivision);
                setHasPreferredDistributorPermission(preferredDistributor);
                setHasPreferredDistributorPermission(preferredDistributor);
                setHasAllDistributorPermission(allDistributor);
                setCheckLinkeEditAccess(checkLinkeEditAccess);
            } catch (error) {
                console.error("Permission check failed", error);
            }
        };

        checkPermissions();
    }, []);



    console.log(loading, 868);
    

    const tabs = [
        {
            label: "Divisions",
            key: "divisions",
            icon: <Divisions color={activeSubTab === 'divisions' ? '#000' : '#999'} />,
            disabled: false,
            component: <DivisionLinkage setActiveSubTab={setActiveSubTab} hasOtherDivisionPermission={hasOtherDivisionPermission} customerData={customerData} isLoading={loading} isChild={isChild} saveDraft={saveDraft} />
        },
        {
            label: "Distributors",
            key: "distributors",
            icon: <Distributors color={activeSubTab === 'distributors' ? '#000' : '#999'}
            />,
            disabled: customerData?.divisions?.length == 0,
            component: <DistributorLinkage permisions={{ hasPreferredDistributorPermission, checkLinkeEditAccess, hasAllDistributorPermission }} setActiveSubTab={setActiveSubTab} hasAllDistributorPermission={hasAllDistributorPermission} hasPreferredDistributorPermission={hasPreferredDistributorPermission} customerData={customerData} isLoading={loading} isChild={isChild} saveDraft={saveDraft} />
        },
        {
            label: "Field",
            key: "field",
            icon: <Field color={activeSubTab === 'field' ? '#000' : '#999'} />,
            disabled: customerData?.divisions?.length == 0,
            component: <Fields customerData={customerData} isLoading={loading} isChild={isChild} saveDraft={saveDraft} />
        },
        {
            label: "Customer Hierarchy",
            key: "hierarchy",
            icon: <CustomerHierarchyIcons
            // color={openedDivisionsData.length > 0 ? activeSubTab === 'hierarchy' ? '#000' : '#999' : '#CCC'}
            />,
            disabled: isChild,
            component: <CustomerHierarchy instance={instance} setChildCustomer={setChildCustomer} customerData={customerData} isLoading={loading} isChild={isChild} saveDraft={saveDraft} />

        },
    ]

    return (

       
        

        loading ? ( <SkeletonDetailPage/>):( <View style={Linkagestyles.container}>
            <View style={Linkagestyles.stickyTabsContainer}>
               
                <HorizontalSelector
                    onTabChange={(index) => {
                        if (!tabs[index].disabled) {
                            setActiveSubTab(tabs[index].key)
                        }
                    }}
                    itemGap={0}
                    style={Linkagestyles.subTabsContainer}
                    activeIndex={tabs.findIndex((e) => e.key == activeSubTab)}
                >
                    {tabs.map((e) => (
                        <View
                            key={e.key}
                            style={[
                                Linkagestyles.subTab,
                                activeSubTab === e.key && Linkagestyles.activeSubTab,
                                e.disabled && { opacity: 0.5 }
                            ]}
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
                        </View>
                    ))}
                </HorizontalSelector>
                {/* </ScrollView> */}
            </View>
            <View style={{ paddingTop: 50 }}>
                {tabs.find((e) => e?.key == activeSubTab)?.component}
            </View>
        </View>)
       
    )

}


export default LinkageView;