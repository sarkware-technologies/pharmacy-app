import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { AppInput, AppText } from "../../../../../components";
import Linkagestyles from "../style/linkagestyle";
import { useCallback, useEffect, useMemo, useState } from "react";
import HorizontalSelector from "../../../../../components/view/HorizontalSelector"
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import IconFeather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CommonTooltip from "../../../../../components/view/Tooltip"
import { getPreferredDistributors } from "../../../../../api/distributor";
import { useSelector } from "react-redux";
import CommonStyle from "../../../../../styles/styles";
import AnimatedContent from "../../../../../components/view/AnimatedContent";
import DistributorCard from "./DistributorCard"
import Button from "../../../../../components/Button";


const DistributorLinkage = ({ customerData, isLoading, isChild, saveDraft, setActiveSubTab, instance, permisions }) => {
    const stationCode = useSelector(state => state.auth?.user?.userDetails?.stationCode);
    const [activeDistributorTab, setActiveDistributorTab] = useState(0);
    const {
        hasPreferredDistributorPermission,
        hasAllDistributorPermission,
        checkLinkeEditAccess
    } = permisions;


    const distributorTabs = useMemo(() => {
        const tabs = [];

        if (hasPreferredDistributorPermission) {
            tabs.push({ key: "preferred", label: "Preferred Distributors" });
        }

        if (hasAllDistributorPermission) {
            tabs.push({ key: "all", label: "All Distributors" });
        }

        tabs.push({ key: "linked", label: "Linked Distributors" });

        return tabs;
    }, [hasPreferredDistributorPermission, hasAllDistributorPermission]);

    const activeTabKey = distributorTabs[activeDistributorTab]?.key;

    useEffect(() => {
        const firstValidIndex = distributorTabs.findIndex(
            (t) => t.key !== "linked"
        );

        setActiveDistributorTab(firstValidIndex !== -1 ? firstValidIndex : 0);
    }, [distributorTabs]);

    const [distributors, setDistributors] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(false); // initial loader


    const [linkedDistributor, setLinkedDistributor] = useState([]);

    useEffect(() => {
        setLinkedDistributor(customerData?.distributors ?? [])
    }, [customerData])




    const [distributorFilters, setDistributorFilters] = useState({
        state: [],
        city: [],
        stationCode: [stationCode],
        limit: 20,
        divisionIds: customerData?.divisions?.map(e => e.divisionId) || [],
        search: ""
    });


    const data = [
        { name: "Stockist name abhishek", city: "Pune" },
        { name: "Stockist name abhishek", city: "Pune" },
        { name: "Stockist name abhishek distributors pune", city: "Pune" },
        { name: "Stockist name abhishek", city: "Pune" },
    ];

    useEffect(() => {
        if (activeTabKey === "preferred" || activeTabKey === "all") {
            setPage(1);
            setHasMore(true);
            fetchDistributors(1, true);
        }
    }, [distributorFilters, activeTabKey]);

    const fetchDistributors = async (pageNo = 1, reset = false) => {
        if (loadingMore || (!hasMore && !reset)) return;

        reset ? setLoading(true) : setLoadingMore(true);

        const finalFilter = {
            ...distributorFilters,
            page: pageNo,
            ...(activeTabKey === "preferred" && {
                stationCode: [stationCode],
            }),

        };

        try {
            const response = await getPreferredDistributors(finalFilter);
            const list = response?.distributors || [];

            setDistributors(prev =>
                reset ? list : [...prev, ...list]
            );

            setHasMore(list.length === distributorFilters.limit);
            setPage(pageNo);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };



    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchDistributors(page + 1);
        }
    };


    const StockistTooltipContent = () => (
        <>
            {data.map((item, i) => (
                <View key={i} style={{ marginBottom: 14 }}>
                    <AppText style={{ fontSize: 16, fontWeight: "500" }}>
                        {item.name}
                    </AppText>
                    <AppText style={{ fontSize: 14, color: "#888" }}>
                        {item.city}
                    </AppText>
                </View>
            ))}
        </>
    );
    const handleAddDistributor = useCallback((distributor) => {
        setLinkedDistributor((prev = []) =>
            prev.some((e) => e?.id == distributor?.id)
                ? prev.map((e) =>
                    e?.id == distributor?.id ? distributor : e
                )
                : [...prev, distributor]
        );
    }, []);

    const handleFinish = () => {
        if (linkedDistributor?.length) {
            const latest = linkedDistributor?.map((e) => {
                let error = null;
                if (e?.divisions && !e.divisions?.some((a) => a.isChecked)) {
                    error = "division";
                } else if (e?.margin == null || e?.margin === "") {
                    error = "margin";
                } else if (e?.supplyMode == null) {
                    error = "supplyMode";
                } else if (Number(e?.margin) < 1 || Number(e?.margin) > 100) {
                    error = "margin";
                }
                return { ...e, error };
            });

            setLinkedDistributor(latest);
            if (latest.filter((e) => e.isActive != false).every((e) => e.error == null)) {
                const distributorsWithoutError = latest.map(({ error, ...rest }) => rest);
                console.log(distributorsWithoutError,3495827)
                saveDraft?.("distributors", { distributors: distributorsWithoutError })
                setActiveSubTab("hierarchy")
            }
        }
    }

    useEffect(() => {
        console.log(linkedDistributor, 2398276)
    }, [linkedDistributor])



    const renderDistributor = useCallback(({ item }) => {
        const distributor = item;
        return (
            <View style={[CommonStyle.SpaceBetween, { borderBottomWidth: 1, borderBottomColor: "#EDEDED", alignItems: "flex-start", paddingVertical: 10 }]}>
                <View style={[Linkagestyles.distributorInfoColumn, { width: "60%" }]}>
                    <AppText style={Linkagestyles.distributorRowName}>
                        {distributor?.name}
                    </AppText>
                    <AppText style={Linkagestyles.distributorRowCode}>
                        {distributor?.code} | {distributor?.cityName || 'N/A'}
                    </AppText>
                </View>

                <AppText style={[Linkagestyles.distributorRowCode, { width: "30%" }]}>
                    {distributor?.distributorType}
                </AppText>

                <TouchableOpacity
                    style={Linkagestyles.addButton}
                    onPress={() => handleAddDistributor(distributor)}
                >
                    <AppText style={Linkagestyles.addButtonText}>+ Add</AppText>
                </TouchableOpacity>
            </View>
        );
    }, []);


    const activeLinkedIds = useMemo(() => {
        return new Set(
            linkedDistributor
                ?.filter((e) => e?.isActive !== false)
                ?.map((e) => e.id)
        );
    }, [linkedDistributor]);

    const activeLinkedDistributors = useMemo(
        () => linkedDistributor?.filter((e) => e?.isActive !== false) || [],
        [linkedDistributor]
    );


    return (
        <View style={Linkagestyles.accordionCardG}>
            <View style={Linkagestyles.header}>
                <View style={{ marginTop: 20 }}>
                    <HorizontalSelector onTabChange={(i) => setActiveDistributorTab(i)} itemGap={20} >
                        {distributorTabs.map((tab, index) => (
                            <View key={tab.key}>
                                <AppText
                                    style={[
                                        Linkagestyles.distributorTabText,
                                        activeDistributorTab === index &&
                                        Linkagestyles.activeDistributorTabText,
                                    ]}
                                >
                                    {tab.label}
                                </AppText>
                            </View>
                        ))}
                    </HorizontalSelector>
                    {/* Filters */}

                    <View style={Linkagestyles.suggestedSection}>
                        <AppText style={Linkagestyles.suggestedTitle}>
                            Suggested Stockist by MR
                        </AppText>
                        <CommonTooltip
                            content={<StockistTooltipContent />}
                            style={Linkagestyles.infoIcon}
                            verticalOffset={12}
                            tooltipWidth={"90%"}

                        >
                            <Icon name="information-outline" size={20} color="#333" />
                        </CommonTooltip>
                    </View>
                    {activeTabKey === "preferred" || activeTabKey === "all" && (
                        <>
                            <View style={Linkagestyles.filterRow}>

                                <TouchableOpacity
                                    style={Linkagestyles.filterIcon}
                                // onPress={() => setShowFilterModal(true)}
                                >
                                    <Icon name="tune" size={20} color="#666" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={Linkagestyles.filterDropdown}
                                // onPress={() => setShowFilterModal(true)}
                                >
                                    <AppText style={Linkagestyles.filterText}>
                                        {distributorFilters.state.length > 0 &&
                                            !distributorFilters.state.includes('All')
                                            ? `State (${distributorFilters.state.length})`
                                            : 'State'}
                                    </AppText>
                                    <IconMaterial
                                        name="keyboard-arrow-down"
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={Linkagestyles.filterDropdown}
                                // onPress={() => setShowFilterModal(true)}
                                >
                                    <AppText style={Linkagestyles.filterText}>
                                        {distributorFilters.city.length > 0 &&
                                            !distributorFilters.city.includes('All')
                                            ? `City (${distributorFilters.city.length})`
                                            : 'City'}
                                    </AppText>
                                    <IconMaterial
                                        name="keyboard-arrow-down"
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Search */}
                            <View style={Linkagestyles.searchContainer}>
                                <IconFeather name="search" size={20} color="#999" />
                                <AppInput
                                    style={Linkagestyles.searchInput}
                                    placeholder="Search by distributor name & code"
                                    placeholderTextColor="#999"
                                    value={distributorFilters?.search}
                                    onChangeText={(text) => { setDistributorFilters((prev) => ({ ...prev, search: text })) }}
                                />
                            </View>

                            {/* Table Header */}
                            <View style={Linkagestyles.tableHeader}>
                                <AppText style={[Linkagestyles.tableHeaderText, { width: "65%", }]}>
                                    Name, Code & City
                                </AppText>
                                <AppText
                                    style={[
                                        Linkagestyles.tableHeaderText,
                                        { width: "18%", textAlign: 'right', },
                                    ]}
                                >
                                    Type
                                </AppText>
                                <AppText
                                    style={[
                                        Linkagestyles.tableHeaderText,
                                        { textAlign: 'right', width: "15%" },
                                    ]}
                                >
                                    Action
                                </AppText>
                            </View>
                        </>
                    )}
                </View>

            </View>
            {/* Body (SCROLLABLE) */}
            {activeTabKey === "preferred" || activeTabKey === "all" ? (
                <>
                    {loading && page === 1 ? (
                        <View style={{ paddingVertical: 30 }}>
                            <AppText style={{ textAlign: "center" }}>
                                Loading distributors...
                            </AppText>
                        </View>
                    ) : (
                        <AnimatedContent style={[Linkagestyles.body, { paddingHorizontal: 7, paddingTop: 10 }]}>
                            <FlatList
                                contentContainerStyle={Linkagestyles.bodyContent}
                                data={distributors?.filter(
                                    (distributor) => !activeLinkedIds.has(distributor.id)
                                )}

                                keyExtractor={(item) => String(item.id)}
                                renderItem={renderDistributor}
                                showsVerticalScrollIndicator={false}
                                onEndReached={handleLoadMore}
                                onEndReachedThreshold={0.4}
                                ListFooterComponent={
                                    loadingMore ? (
                                        <AppText style={{ textAlign: "center", padding: 10 }}>
                                            Loading more...
                                        </AppText>
                                    ) : null
                                }
                            />
                        </AnimatedContent>
                    )}
                </>

            ) : (
                <ScrollView
                    style={Linkagestyles.body}
                    contentContainerStyle={[Linkagestyles.bodyContent, { padding: 0 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {activeLinkedDistributors.filter((e) => e.isActive != false).map((e, i) =>
                        <DistributorCard disabled={!checkLinkeEditAccess} key={i.toString()} distributor={e} setValue={(value) => {
                            setLinkedDistributor((prev) =>
                                prev.filter((e) => e.isActive != false).map((item, index) =>
                                    index === i ? value : item
                                )
                            );
                        }} />)
                    }
                    {activeLinkedDistributors.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <AppText style={styles.emptyText}>
                                No distributors linked yet
                            </AppText>
                        </View>
                    )}


                </ScrollView>

            )}

            {/* Footer (FIXED) */}
            <View style={[Linkagestyles.footer, { paddingHorizontal: 20, paddingVertical: 10 }]}>
                {isChild ? (
                    activeLinkedDistributors.length != 0 && activeTabKey === "linked" && (
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <Button style={{ width: "48%" }} onPress={() => handleFinish()}>Approve</Button>
                            <Button style={{ width: "48%" }} onPress={() => handleFinish()}>Reject</Button>
                        </View>
                    )
                ) : (
                    activeLinkedDistributors.length != 0 && activeTabKey === "linked" && checkLinkeEditAccess && (
                        <Button onPress={() => handleFinish()}>Finish</Button>
                    )
                )}

            </View>
        </View >
    )

}

export default DistributorLinkage;


const styles = {
    emptyContainer: {
        paddingVertical: 24,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
    },
};
