import { Modal, StyleSheet, TouchableOpacity, View, FlatList, ActivityIndicator } from "react-native";
import { AppInput, AppText } from "../../../../components"
import { CloseIcon } from "../../../../components/icons/pricingIcon";
import { Fonts } from "../../../../utils/fontHelper";
import { useState, useEffect } from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { getDivisions } from "../../../../api/division";
import { colors } from "../../../../styles/colors";
import Button from "../../../../components/Button"
const SearchIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <Circle cx="9" cy="9" r="6" stroke="#999" strokeWidth="1.5" />
        <Path d="M13.5 13.5L17 17" stroke="#999" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
);

const SelectDivision = ({
    visible,
    onClose,
    onSelectDivision,
    multiSelect = false,
    showDone
}) => {
    const [searchText, setSearchText] = useState("");
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoading, setInitialLoading] = useState(false);

    // ✅ Selected state
    const [selectedDivisions, setSelectedDivisions] = useState([]);

    useEffect(() => {
        if (visible && searchText) {
            const timer = setTimeout(() => {
                resetAndFetch(searchText);
            }, 500);
            return () => clearTimeout(timer);
        } else if (visible && !searchText) {
            resetAndFetch("");
        }
    }, [searchText, visible]);

    const resetAndFetch = (search) => {
        setDivisions([]);
        setPage(1);
        setHasMore(true);
        fetchDivisions(1, search);
    };

    const fetchDivisions = async (pageNum, search) => {
        try {
            pageNum === 1 ? setInitialLoading(true) : setLoading(true);

            const response = await getDivisions(pageNum, 50, search);

            setDivisions((prev) =>
                pageNum === 1
                    ? response?.divisions || []
                    : [...prev, ...(response?.divisions || [])]
            );

            setHasMore(response?.divisions?.length == 0 ? false : true);
            setPage(pageNum);
        } catch (e) {
            console.error("Error fetching divisions", e);
        } finally {
            setInitialLoading(false);
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore && divisions.length > 0) {
            fetchDivisions(page + 1, searchText);
        }
    };

    // ✅ Selection logic
    const handleSelectDivision = (item) => {
        if (multiSelect) {
            setSelectedDivisions((prev) => {
                const exists = prev.some(
                    (d) => d.divisionId === item.divisionId
                );
                return exists
                    ? prev.filter((d) => d.divisionId !== item.divisionId)
                    : [...prev, item];
            });
        } else {
            setSelectedDivisions([item]);
            onSelectDivision?.(item);
            onClose?.(false);
        }
    };

    const renderDivisionItem = ({ item }) => {
        const isSelected = selectedDivisions.some(
            (d) => d.divisionId === item.divisionId
        );

        return (
            <TouchableOpacity
                style={[
                    styles.divisionItem,
                    isSelected && styles.divisionItemActive,
                ]}
                onPress={() => handleSelectDivision(item)}
            >
                <AppText style={[styles.divisionName, isSelected && styles.divisionNameActive,]}>
                    {item.divisionName}
                </AppText>
            </TouchableOpacity>
        );
    };

    const renderFooter = () =>
        loading ? (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#F7941E" />
            </View>
        ) : null;

    const renderEmpty = () => {
        if (initialLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#F7941E" />
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <AppText style={styles.emptyText}>No divisions found</AppText>
            </View>
        );
    };

    const HEADER_HEIGHT = 110;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={() => onClose?.(false)}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={() => onClose?.(false)}
                />

                <View style={styles.createOrderModalContent}>
                    {/* HEADER */}
                    <View style={[styles.overlayHeader, { height: HEADER_HEIGHT }]}>
                        <View style={styles.modalHeader}>
                            <AppText style={styles.modalTitle}>
                                Select Division
                            </AppText>
                            <TouchableOpacity onPress={() => onClose?.(false)}>
                                <CloseIcon />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <SearchIcon />
                            <AppInput
                                style={styles.searchInput}
                                placeholder="Search division/code here"
                                placeholderTextColor="#777777"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                    </View>

                    {/* LIST */}
                    <FlatList
                        data={divisions}
                        renderItem={renderDivisionItem}
                        keyExtractor={(item, index) =>
                            (item.divisionId || index).toString()
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderEmpty}
                        contentContainerStyle={{
                            paddingTop: HEADER_HEIGHT,
                            flexGrow: 1,
                        }}
                    />

                    {/* DONE (ONLY FOR MULTI SELECT) */}
                    {(multiSelect && selectedDivisions.length > 0 || showDone) && (
                        <View style={{ marginHorizontal: 10 }}>
                            <Button
                                onPress={() => {
                                    onSelectDivision?.(selectedDivisions);
                                    onClose?.(false);
                                }}
                            >Done</Button>
                        </View>
                    )}

                </View>
            </View>
        </Modal>
    );
};

/* ✅ STYLES — UNCHANGED */
const styles = StyleSheet.create({
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    createOrderModalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "80%",
        minHeight: "40%",
        overflow: "hidden",
        paddingBottom: 10,
    },
    overlayHeader: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 20,
        backgroundColor: "rgba(255,255,255,0.98)",
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 16,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        gap: 10,
        borderWidth: 1,
        borderColor: "#EDEDED",
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#777777",
        fontFamily: Fonts.Regular,
    },
    divisionItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 2,
    },
    divisionItemActive: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginBottom: 2,
        backgroundColor: "#fef4e8",
    },
    divisionName: {
        fontSize: 14,
        fontWeight: "400",
        color: colors.secondaryText,
        fontFamily: Fonts.Regular,
        paddingLeft: 10,
    },
    divisionNameActive: {
        color: "#F7941E",
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: "#999",
        fontFamily: Fonts.Regular,
    },
});

export default SelectDivision; 