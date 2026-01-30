import { FlatList, ScrollView, View } from "react-native";
import { AppText } from "../../../../../components";
import Linkagestyles from "../style/linkagestyle";
import { useEffect, useState } from "react";
import { customerAPI } from "../../../../../api/customer";
import AnimatedContent from "../../../../../components/view/AnimatedContent";
import CommonStyle from "../../../../../styles/styles";
import { colors } from "../../../../../styles/colors";

const Fields = ({ customerData, isLoading, isChild, saveDraft }) => {

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [fieldList, setFieldList] = useState([]);

    useEffect(() => {
        initLoad();
    }, []);

    const initLoad = () => {
        setPage(1);
        setHasMore(true);
        setFieldList([]);
        fetchField(1, true);
    };

    const fetchField = async (pageNo, isInitial = false) => {
        if (loading || loadingMore) return;

        isInitial ? setLoading(true) : setLoadingMore(true);

        try {
            const response = await customerAPI.getFieldList({
                customerId: customerData?.stgCustomerId ?? customerData?.customerId,
                isStaging: customerData?.stgCustomerId != null,
                page: pageNo,
            });
            console.log(response?.data?.companyUsers, 2398427)
            const list = response?.data?.companyUsers || [];

            setFieldList(prev =>
                pageNo === 1 ? list : [...prev, ...list]
            );

            setHasMore(list.length > 0); // or response.data.hasMore
            setPage(pageNo);
        } catch (e) {
            console.error("Field list fetch failed", e);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchField(page + 1);
        }
    };
    useEffect(() => {
        console.log(fieldList, 23984)
    }, [fieldList])


    return (
        <View style={Linkagestyles.accordionCardG}>
            {/* Header (FIXED) */}
            <View style={Linkagestyles.header}>
                <>
                    <View style={[Linkagestyles.flatheader, { marginTop: 20 }]}>
                        <AppText style={Linkagestyles.flatheaderText}>Employee Details</AppText>
                        <AppText style={Linkagestyles.flatheaderText}>Division Details</AppText>
                    </View>
                    <View
                        style={{
                            paddingHorizontal: 20,
                            borderBottomColor: "#90909080",
                            borderBottomWidth: 0.5,
                        }}
                    />
                </>

            </View>

            {loading && page === 1 ? (
                <View style={{ paddingVertical: 30 }}>
                    <AppText style={{ textAlign: "center" }}>
                        Loading distributors...
                    </AppText>
                </View>
            ) : (
                <AnimatedContent style={[Linkagestyles.body, { paddingHorizontal: 0, paddingTop: 10 }]}>
                    <FlatList
                        contentContainerStyle={[Linkagestyles.bodyContent, { padding: 0 }]}
                        data={fieldList}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }) => {
                            return (
                                <View
                                    style={[
                                        CommonStyle.SpaceBetween,
                                        {
                                            borderBottomColor: "#90909080",
                                            borderBottomWidth: 0.5,
                                            paddingHorizontal: 20,
                                            paddingVertical: 7,
                                            alignItems: "top",
                                        },
                                    ]}
                                >
                                    {/* LEFT COLUMN */}
                                    <View style={{ gap: 6, flex: 1, marginRight: 10 }}>
                                        <AppText
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            style={[
                                                CommonStyle.secondaryText,
                                                { color: colors.primaryText, fontSize: 14 },
                                            ]}
                                        >
                                            {item?.userName}
                                        </AppText>

                                        <AppText
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            style={[
                                                CommonStyle.secondaryText,
                                                { color: colors.secondaryText, fontSize: 12 },
                                            ]}
                                        >

                                            {console.log(item, 'itemitemitemitem')}


                                            {item?.userCode}
                                            {item?.designation && ` | ${item.designation}`}
                                        </AppText>

                                        <AppText

                                            style={[
                                                CommonStyle.secondaryText,
                                                { color: colors.primaryText, fontSize: 12 },
                                            ]}
                                        >
                                            {item?.cityCode}
                                        </AppText>
                                    </View>

                                    {/* RIGHT COLUMN */}

                                    <View
                                        style={{
                                            alignItems: 'flex-end',   // align to right
                                        }}
                                    >
                                        <AppText
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                            style={[
                                                CommonStyle.secondaryText,
                                                {
                                                    color: colors.primaryText,
                                                    fontSize: 14,
                                                    textAlign: 'right',
                                                },
                                            ]}
                                        >
                                            {item?.divisions?.[0]?.divisionName}
                                        </AppText>

                                        <AppText
                                            style={[
                                                CommonStyle.secondaryText,
                                                {
                                                    color: colors.secondaryText,
                                                    fontSize: 12,
                                                    textAlign: 'right',
                                                },
                                            ]}
                                        >
                                            {item?.divisions?.[0]?.divisionCode}
                                        </AppText>
                                    </View>





                                </View>

                            )
                        }}
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

            {/* Footer (FIXED) */}
            <View style={Linkagestyles.footer}>

            </View>
        </View>
    )

}

export default Fields;