import { DrawerActions, useNavigation, useRoute } from "@react-navigation/native";
import { AppText } from "../../../../components";
import AppView from "../../../../components/AppView";
import PermissionWrapper from "../../../../utils/RBAC/permissionWrapper";
import { ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import Liststyles from "./style/listStyle"
import PERMISSIONS from "../../../../utils/RBAC/permissionENUM";
import { SafeAreaView } from "react-native-safe-area-context";
import Menu from "../../../../components/icons/Menu";
import Bell from "../../../../components/icons/Bell";
import HorizontalSelector from "../../../../components/view/HorizontalSelector";
import AnimatedContent from "../../../../components/view/AnimatedContent";
import Container from "../../../../components/view/container"
import { useEffect, useMemo, useState } from "react";
import checkPermission from "../../../../utils/RBAC/permissionHelper";
import CustomerListContainer from "./component/CustomerListContainer"
import { customerAPI } from "../../../../api/customer";
import CustomerSearch from "./component/CustomerSearch"

const CustomerList = ({ navigation: navigationProp }) => {
    const navigationHook = useNavigation();
    const navigation = navigationProp || navigationHook;

    const [activeTab, setActiveTab] = useState("all");
    const [activeSubTab, setActiveSubTab] = useState("newcustomer");
    const [appliedFilter, setAppliedFilter] = useState(null);
    const [searchText, setSearchText] = useState("");


    const [tabs, setTabs] = useState([]);
    const [tabCount, setTabCount] = useState({});

    useEffect(() => {
        getTabCounts();
    }, [])

    const getTabCounts = async () => {
        const response = await customerAPI.getTabCounts();
        setTabCount(response?.data);
    }

    useEffect(() => {

        const loadTabs = async () => {
            const [
                allPermission,
                unverifiedPermission,
                notOnboardedPermission,
                waitingForApprovalPermission,
                rejectedPermission,
                doctorSupplyPermission,
                draftPermission,
            ] = await Promise.all([
                checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_PAGE_VIEW),
                checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_UNVERIFIED_PAGE_VIEW),
                checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_NOT_ONBOARDED_PAGE_VIEW),
                checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_WAITING_FOR_APPROVAL_PAGE_VIEW),
                checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_REJECTED_PAGE_VIEW),
                checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_DOCTOR_SUPPLY_PAGE_VIEW),
                checkPermission(PERMISSIONS.ONBOARDING_LISTING_PAGE_DRAFT_PAGE_VIEW),
            ]);

            const result = [
                { label: `All(${tabCount?.allCount ?? 0})`, key: "all", show: allPermission, statusIds: [], isStaging: false, subMenu: [] },
                {
                    label: `Waiting for Approval(${tabCount?.waitingForApprovalCount ?? 0})`, key: "waitingForApproval", show: true, statusIds: [5], isStaging: true,
                    subMenu: [
                        { label: "New customer", key: "newcustomer", filter: "NEW" },
                        { label: "Customer group change", key: "customerchange", filter: "GROUP_CHANGED" },
                        { label: "Edit customer", key: "editcustomer", filter: "EDITED" },
                        { label: "Existing customer", key: "existingcustomer", filter: "EXISTING" },
                    ],
                },
                { label: `Not Onboarded(${tabCount?.notOnBoardCount ?? 0})`, key: "notOnboarded", show: notOnboardedPermission, statusIds: [18], isStaging: false, subMenu: [] },
                { label: `Unverified(${tabCount?.unverifiedCount ?? 0})`, key: "unverified", show: unverifiedPermission, statusIds: [19], isStaging: false, subMenu: [] },
                { label: `Rejected(${tabCount?.rejectedCount ?? 0})`, key: "rejected", show: rejectedPermission, statusIds: [6], isStaging: true, subMenu: [] },
                { label: `Doctor Supply(${tabCount?.doctorSupplyCount ?? 0})`, key: "doctorSupply", show: doctorSupplyPermission, statusIds: [7], isStaging: false, subMenu: [] },
                { label: `Draft(${tabCount?.draftCount ?? 0})`, key: "draft", show: draftPermission, statusIds: [4], isStaging: true, subMenu: [] },
            ].filter(t => t.show);

            setTabs(result);
        };

        loadTabs();
    }, [tabCount]);



    // Main Tabx

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some(t => t.key === activeTab)) {
            setActiveTab(tabs[0].key);
        }
    }, [tabs]);

    const activeIndex = useMemo(() => {
        const index = tabs.findIndex(t => t.key === activeTab);
        return index >= 0 ? index : 0;
    }, [tabs, activeTab]);

    const activeTabValue = useMemo(() => {
        return tabs?.find((e) => e.key == activeTab)
    }, [tabs, activeTab])



    // Sub Menu
    const activeSubIndex = useMemo(() => {
        if (!activeTabValue?.subMenu?.length) return 0;
        const index = activeTabValue.subMenu.findIndex(t => t.key === activeSubTab);
        return index >= 0 ? index : 0;
    }, [activeTabValue, activeSubTab]);


    const activeTabSubValue = useMemo(() => {
        return activeTabValue?.subMenu?.find(t => t.key === activeSubTab)
    }, [activeTabValue, activeSubTab])


    useEffect(() => {
        if (activeTabValue?.subMenu?.length > 0) {
            setActiveSubTab(activeTabValue.subMenu[0].key);
        }
    }, [activeTabValue]);


    const handleApplyFilters = (val) => {
        console.log(val, 23894237)
        setAppliedFilter(val);
    }



    return (
        <SafeAreaView style={Liststyles.safeArea} edges={['top']}>
            <Container
                backgroundColor={"#f6f6f6"}
                isScroll={false}
                header={
                    <AppView>
                        <AppView backgroundColor={"#fff"} style={{ paddingVertical: 12 }}>
                            <AppView flexDirection="row" alignItems="center" paddingHorizontal={10} marginBottom={8}>
                                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                                    <Menu />
                                </TouchableOpacity>

                                <AppText style={Liststyles.headerTitle}>Customers</AppText>

                                <AppView style={Liststyles.headerActions}>
                                    <PermissionWrapper permission={PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_CREATE_CUSTOMER}>
                                        <TouchableOpacity
                                            style={Liststyles.createButton}
                                            onPress={() => navigation.navigate('onboarding')}
                                        >
                                            <AppText style={Liststyles.createButtonText}>CREATE</AppText>
                                        </TouchableOpacity>
                                    </PermissionWrapper>

                                    <TouchableOpacity>
                                        <Bell color="#333" />
                                    </TouchableOpacity>
                                </AppView>
                            </AppView>

                            <HorizontalSelector
                                onTabChange={(index) => {
                                    const selected = tabs[index];
                                    if (selected) setActiveTab(selected.key);
                                }}

                                activeIndex={activeIndex}
                            >
                                {tabs.map((e) => (
                                    <AppView
                                        key={e.key}
                                        style={[
                                            Liststyles.tab,
                                            activeTab === e.key && Liststyles.activeTab,
                                        ]}
                                    >
                                        <AppText
                                            style={[
                                                Liststyles.tabText,
                                                activeTab === e.key && Liststyles.activeTabText,
                                            ]}
                                        >
                                            {e.label}
                                        </AppText>
                                    </AppView>
                                ))}
                            </HorizontalSelector>
                        </AppView>
                        {activeTabValue?.subMenu?.length > 0 && (
                            <AppView marginTop={14} marginBottom={0} paddingHorizontal={10}>
                                <HorizontalSelector
                                    style={{ marginBottom: 1 }}
                                    onTabChange={(index) => {
                                        const selected = activeTabValue?.subMenu?.[index];
                                        if (selected) setActiveSubTab(selected.key);
                                    }}
                                    activeIndex={activeSubIndex}
                                >
                                    {activeTabValue?.subMenu?.map((e) => (
                                        <AppView
                                            key={e.key}
                                            style={[
                                                Liststyles.subTab,
                                                activeSubTab === e.key && Liststyles.activeSubTab,
                                            ]}
                                        >
                                            <AppText
                                                style={[
                                                    Liststyles.subTabText,
                                                    activeSubTab === e.key && Liststyles.activeSubTabText,
                                                ]}
                                            >
                                                {e.label}
                                            </AppText>
                                        </AppView>
                                    ))}
                                </HorizontalSelector>
                            </AppView>
                        )}
                        <AppView marginTop={5} paddingHorizontal={15}>
                            <CustomerSearch
                                handleFocus={() => navigation.navigate('CustomerStack', {
                                    screen: 'CustomerSearchMain',
                                    params: { activeTabValue, activeTabSubValue, filter: appliedFilter }
                                })}
                                searchText={searchText}
                                setSearchText={setSearchText} appliedFilter={appliedFilter} handleApplyFilters={(val) => handleApplyFilters(val)} />
                        </AppView>
                    </AppView>
                }
                body={
                    <CustomerListContainer
                        search={searchText}
                        primaryTab={activeTabValue}
                        secondaryTab={activeTabSubValue}
                        appliedFilter={appliedFilter}
                    />

                }
            />
        </SafeAreaView>
    );
};


export default CustomerList;