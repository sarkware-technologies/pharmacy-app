import { useCallback, useEffect, useRef, useState } from "react";
import CustomerListView from "./CustomerListView";
import { customerAPI } from "../../../../../api/customer";
import AppView from "../../../../../components/AppView";
import { useNavigation } from "@react-navigation/native";

const CustomerListContainer = ({ search, primaryTab, secondaryTab, appliedFilter, searchRequired, selectedDate }) => {
    const navigation = useNavigation();
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const loadingRef = useRef(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.getParent()?.addListener("tabPress", e => {
            setCustomers([]);
            setPage(1);
            setHasMore(true);
            fetchCustomers({ pageNo: 1, append: false });
        });
        return unsubscribe;
    }, [navigation]);


    const fetchCustomers = useCallback(
        async ({ pageNo = 1, append = false, limit = 10 }) => {
            if (loadingRef.current) return;

            loadingRef.current = true;
            setLoading(true);

            try {
                const result = await customerAPI.getCustomersList({
                    page: pageNo,
                    limit,
                    searchText: search,
                    statusIds: primaryTab?.statusIds ?? [],
                    isStaging: primaryTab?.isStaging,
                    isAll: true,
                    ...(secondaryTab?.filter && { filter: secondaryTab?.filter }),
                    customerGroupIds: appliedFilter?.customerGroup ?? [],
                    stateIds: appliedFilter?.status ?? [],
                    categoryCode: appliedFilter?.category ?? [],
                    stateIds: appliedFilter?.state?.map((e) => Number(e)) ?? [],
                    cityIds: appliedFilter?.city?.map((e) => Number(e)) ?? [],
                    categoryCode: appliedFilter?.category ?? [],
                    typeCode: appliedFilter?.type ?? [],
                    subCategoryCode: appliedFilter?.subcategory ?? [],
                    ...((selectedDate?.startDate && selectedDate?.endDate) && { startDate: selectedDate?.startDate, endDate: selectedDate?.endDate }),
                });
                const newData = result?.data?.customers || [];

                setCustomers(prev =>
                    append ? [...prev, ...newData] : newData
                );

                setHasMore(newData.length > 0);
            } catch (e) {
                console.error("API error:", e);
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        },
        [search, primaryTab, secondaryTab, appliedFilter, selectedDate]
    );


    useEffect(() => {
        const shouldFetch =
            (primaryTab && !searchRequired) ||
            (searchRequired && search?.length > 0);

        if (shouldFetch) {
            setPage(1);
            setHasMore(true);
            setCustomers([]);
            fetchCustomers({ pageNo: 1, append: false });
        }
        else {
            setCustomers([]);
        }
    }, [search, primaryTab, secondaryTab, appliedFilter, selectedDate]);



    const refreshCurrentPage = useCallback(async (reFetch = false) => {
        let fetchPage = 1;
        let limit = 10;
        if (reFetch) {
            fetchPage = page;
            limit = 10 * page;
        }
        else {
            setCustomers([]);
        }
        setRefreshing(true);
        setPage(fetchPage);
        setHasMore(true);
        await fetchCustomers({ pageNo: 1, append: false, limit });
        setRefreshing(false);
    }, [fetchCustomers, page]);



    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchCustomers({ pageNo: nextPage, append: true });
    }, [page, loading, hasMore, fetchCustomers]);

    return (
        <AppView marginTop={5} style={{ flex: 1 }}>
            <CustomerListView
                customers={customers}
                loadMore={loadMore}
                primaryTab={primaryTab}
                secondaryTab={secondaryTab}
                loading={loading}
                searchText={search}
                refreshing={refreshing}
                refreshCurrentPage={refreshCurrentPage}
            />
        </AppView>
    );
};

export default CustomerListContainer;
