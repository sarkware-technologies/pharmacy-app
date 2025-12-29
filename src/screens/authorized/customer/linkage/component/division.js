import React, { useMemo, useState, useCallback, useEffect, } from "react";
import { ScrollView, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { AppText } from "../../../../../components";
import CustomCheckbox from "../../../../../components/view/checkbox";
import Linkagestyles from "../style/linkagestyle";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { customerAPI } from "../../../../../api/customer";
import { Fonts } from "../../../../../utils/fontHelper";
import Svg, { Path } from "react-native-svg";
import Button from "../../../../../components/Button";
import AnimatedContent from "../../../../../components/view/AnimatedContent"
const DivisionLinkage = ({
    customerData = {},
    isLoading,
    isChild,
    saveDraft,
    hasOtherDivisionPermission = false,
    setActiveSubTab
}) => {
    const divisions = customerData?.divisions ?? [];
    console.log(customerData, 43087298)


    const [filteredOtherDivisionsData, setFilteredOtherDivisionsData] = useState([]);
    const [selectedDivisions, setSelectedDivisions] = useState([]);
    const [blockingDivision, setBlockingDivision] = useState(null);
    const [selectedAll, setSelectedAll] = useState(false);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        setLoading(true)
    }, [])

    useEffect(() => {
        const fetchDivisions = async () => {
            try {
                const res = await customerAPI.getAllDivisions();
                setFilteredOtherDivisionsData(res?.data?.divisions ?? []);
            } catch (err) {
                setFilteredOtherDivisionsData([]);
            }
            finally {
                setLoading(false)
            }
        };
        if (hasOtherDivisionPermission) {
            setLoading(true)
            fetchDivisions();
        }
        else {
            setLoading(false)
        }
    }, [hasOtherDivisionPermission]);



    const sortByDivisionName = (a, b) =>
        (a?.divisionName || "").localeCompare(
            b?.divisionName || "",
            undefined,
            { sensitivity: "base" }
        );

    /* -------------------- Memoized Data -------------------- */
    const requestedDivisions = useMemo(
        () =>
            (divisions ?? [])
                .filter(d => d?.isOpen !== true)
                .sort(sortByDivisionName),
        [divisions]
    );

    const openedDivisions = useMemo(
        () =>
            (divisions ?? [])
                .filter(d => d?.isOpen === true)
                .sort(sortByDivisionName),
        [divisions]
    );

    const existingDivisionIds = useMemo(
        () => new Set((divisions ?? []).map(d => d?.divisionId)),
        [divisions]
    );

    const otherDivisions = useMemo(
        () =>
            (filteredOtherDivisionsData ?? [])
                .filter(d => !existingDivisionIds.has(d?.divisionId))
                .sort(sortByDivisionName),
        [filteredOtherDivisionsData, existingDivisionIds]
    );

    const selectedDivisionIds = useMemo(
        () => new Set((selectedDivisions ?? []).map(d => d?.divisionId)),
        [selectedDivisions]
    );

    /* -------------------- Handlers -------------------- */
    const handleToggleDivision = (division, e) => {
        if (division == "all") {
            setSelectedDivisions(e ? otherDivisions : []);
        }
        else {
            setSelectedDivisions(prev =>
                prev.some(d => d.divisionId == division.divisionId)
                    ? prev.filter(d => d.divisionId != division.divisionId)
                    : [...prev, division]
            );
        }
    };

    const handleBlockUnblockDivision = useCallback(async (division) => {
        setBlockingDivision(division.divisionId);
        try {
            // API logic here
        } finally {
            setBlockingDivision(null);
        }
    }, []);

    useEffect(() => {
        if (otherDivisions?.length) {
            setSelectedAll(otherDivisions?.length == selectedDivisions?.length)
        }
    }, [otherDivisions, selectedDivisions])

    /* -------------------- Render Helpers -------------------- */
    const renderEmpty = () => (
        <AppText style={[Linkagestyles.emptyText, { textAlign: "center" }]}>No divisions</AppText>
    );

    const renderDivisionRow = (div) => (
        <View key={div.divisionId} style={Linkagestyles.reqRow}>
            <AppText style={Linkagestyles.divisionName}>{div.divisionName}</AppText>
            <AppText style={Linkagestyles.divisionCode}>{div.divisionCode}</AppText>
        </View>
    );

    const handleContinue = () => {
        const divisionIdSet = new Set(divisions?.map(d => d.divisionId));
        const filteredOther = selectedDivisions?.filter(
            e => !divisionIdSet.has(e?.divisionId)
        ) ?? [];
        saveDraft("divisions", { divisions: [...filteredOther, ...(divisions ?? [])] })
        setSelectedDivisions([]);
        setActiveSubTab("distributors")
    }
    /* -------------------- UI -------------------- */
    return (
        <View style={Linkagestyles.accordionCardG}>
            <View style={[Linkagestyles.body,]}>
                {loading || isLoading ? (
                    <View style={{ display: "flex", alignItems: "center", height: "100%", justifyContent: "center" }}>
                        <ActivityIndicator size="large" color="#F7941E" />
                    </View>
                ) : (
                    <AnimatedContent duration={100} translateY={20}>
                        <View style={[{ flexDirection: "row", justifyContent: "space-between", paddingTop: 30, }]}>
                            {/* ---------------- Requested ---------------- */}
                            <View style={[Linkagestyles.accordionCardG, { flex: 1, paddingBottom: 20 }]}>
                                <View style={Linkagestyles.header}>
                                    <AppText style={Linkagestyles.headerTitle}>Requested</AppText>
                                    <View style={{ backgroundColor: "#FBFBFB", width: "100%", borderRightWidth: 0.5, borderRightColor: "#90909080" }}>
                                        <AppText style={Linkagestyles.subHeaderText}>Name & Code</AppText>
                                    </View>
                                </View>

                                <ScrollView style={[Linkagestyles.body, { borderRightWidth: 0.5, borderRightColor: "#90909080", width: "100%", paddingHorizontal: 10, paddingVertical: 20 }]}>
                                    <AnimatedContent duration={350} translateY={20}>
                                        <View style={[Linkagestyles.colRequested, { width: "100%" }]}>
                                            {requestedDivisions.length
                                                ? requestedDivisions.map(renderDivisionRow)
                                                : renderEmpty()}
                                        </View>
                                    </AnimatedContent>
                                </ScrollView>

                                <View style={Linkagestyles.footer} />
                            </View>

                            {/* ---------------- Other ---------------- */}
                            {hasOtherDivisionPermission && (
                                <View style={[Linkagestyles.accordionCardG, { width: "34%" }]}>
                                    <View style={Linkagestyles.header}>
                                        {hasOtherDivisionPermission && (
                                            <AppText style={Linkagestyles.headerTitle}>Other</AppText>
                                        )}
                                        <View style={{ backgroundColor: "#FBFBFB", borderRightWidth: 0.5, borderRightColor: "#90909080" }}>
                                            <AppText style={Linkagestyles.subHeaderText}>Name & Code</AppText>
                                        </View>
                                    </View>

                                    <ScrollView style={[Linkagestyles.body, { borderRightWidth: 0.5, borderRightColor: "#90909080", paddingHorizontal: 10, paddingVertical: 20 }]}>
                                        <AnimatedContent duration={350} translateY={20}>
                                            {hasOtherDivisionPermission && (
                                                <View style={[Linkagestyles.colOther, { gap: 15, paddingBottom: 20 }]}>
                                                    {otherDivisions?.length != 0 && (
                                                        <CustomCheckbox
                                                            checkboxStyle={{ marginTop: 3 }}
                                                            containerStyle={{ alignItems: "flex-start" }}
                                                            activeColor="#F7941E"
                                                            size={15}
                                                            checked={selectedAll}
                                                            borderWidth={2}
                                                            onChange={(e) => handleToggleDivision("all", e)}
                                                            checkIcon={
                                                                <Svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <Path d="M8.25 0.75L3.09375 5.90625L0.75 3.5625" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </Svg>
                                                            }
                                                            title={
                                                                <View style={{ flexShrink: 1, paddingBottom: 10 }}>
                                                                    <AppText style={Linkagestyles.divisionName}>
                                                                        Select All
                                                                    </AppText>
                                                                </View>
                                                            }
                                                        />
                                                    )}
                                                    {otherDivisions.length ? (
                                                        otherDivisions.map(div => (
                                                            <CustomCheckbox
                                                                checkboxStyle={{ marginTop: 3 }}
                                                                containerStyle={{ alignItems: "flex-start" }}
                                                                key={div.divisionId}
                                                                checked={selectedDivisionIds.has(div.divisionId)}
                                                                activeColor="#F7941E"
                                                                size={15}
                                                                borderWidth={1}
                                                                onChange={() => handleToggleDivision(div)}
                                                                checkIcon={
                                                                    <Svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <Path d="M8.25 0.75L3.09375 5.90625L0.75 3.5625" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </Svg>
                                                                }
                                                                title={
                                                                    <View style={{ flexShrink: 1 }}>
                                                                        <AppText style={Linkagestyles.divisionName}>
                                                                            {div.divisionName}
                                                                        </AppText>
                                                                        <AppText style={Linkagestyles.divisionCode}>
                                                                            {div.divisionCode}
                                                                        </AppText>
                                                                    </View>
                                                                }
                                                            />
                                                        ))
                                                    ) : (
                                                        renderEmpty()
                                                    )}
                                                </View>
                                            )}
                                        </AnimatedContent>
                                    </ScrollView>

                                    <View style={Linkagestyles.footer} />
                                </View>
                            )}
                            {/* ---------------- Opened ---------------- */}
                            <View style={[Linkagestyles.accordionCardG, { flex: 1 }]}>
                                <View style={Linkagestyles.header}>
                                    <AppText style={Linkagestyles.headerTitle}>Opened</AppText>
                                    <View style={{ backgroundColor: "#FBFBFB" }}>
                                        <AppText style={Linkagestyles.subHeaderText}>Name & Code</AppText>
                                    </View>
                                </View>

                                <ScrollView style={[Linkagestyles.body, { paddingVertical: 20, paddingHorizontal: 10 }]}>
                                    <AnimatedContent duration={350} translateY={20}>
                                        <View style={[Linkagestyles.colOpened, { paddingBottom: 20 }]}>
                                            {openedDivisions.length ? (
                                                openedDivisions.map(div => (
                                                    <View key={div.divisionId} style={Linkagestyles.openedRow}>
                                                        <View style={{ flexShrink: 1 }}>
                                                            <AppText style={Linkagestyles.divisionName}>
                                                                {div.divisionName}
                                                            </AppText>
                                                            <AppText style={Linkagestyles.divisionCode}>
                                                                {div.divisionCode}
                                                            </AppText>
                                                        </View>

                                                        <TouchableOpacity
                                                            style={[
                                                                Linkagestyles.blockButton,
                                                                div.isBlocked && Linkagestyles.unblockButton,
                                                                blockingDivision === div.divisionId &&
                                                                Linkagestyles.blockButtonDisabled,
                                                            ]}
                                                            disabled={blockingDivision === div.divisionId}
                                                            onPress={() => handleBlockUnblockDivision(div)}
                                                        >
                                                            <Icon
                                                                name={
                                                                    div.isBlocked ? "lock-open-outline" : "lock-outline"
                                                                }
                                                                size={15}
                                                                color={div.isBlocked ? "#EF4444" : "#2B2B2B"}
                                                            />
                                                            <AppText
                                                                style={[
                                                                    Linkagestyles.blockText,
                                                                    div.isBlocked && Linkagestyles.unblockText,
                                                                ]}
                                                            >
                                                                {blockingDivision === div.divisionId
                                                                    ? "Processing..."
                                                                    : div.isBlocked
                                                                        ? "Unblock"
                                                                        : "Block"}
                                                            </AppText>
                                                        </TouchableOpacity>
                                                    </View>
                                                ))
                                            ) : (
                                                renderEmpty()
                                            )}
                                        </View>
                                    </AnimatedContent>
                                </ScrollView>
                                <View style={Linkagestyles.footer} />
                            </View>
                        </View>
                    </AnimatedContent>
                )}

            </View>

            {/* Footer (FIXED) */}
            {selectedDivisions?.length != 0 && (
                <View style={[Linkagestyles.footer, { paddingHorizontal: 20 }]} >
                    <Button onPress={() => handleContinue()}>Continue</Button>
                </View>
            )}

        </View>
    );
};

export default DivisionLinkage;
