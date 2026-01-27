import { useCallback, useEffect, useState } from "react";
import CustomerListView from "./CustomerListView";
import { customerAPI } from "../../../../../api/customer";
import AppView from "../../../../../components/AppView";

const CustomerListContainer = ({ search, primaryTab, secondaryTab, appliedFilter }) => {
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);


    const fetchCustomers = useCallback(
        async (pageNo = 1, append = false) => {
            if (loading) return;
            console.log(appliedFilter, 23892783)
            try {
                setLoading(true);

                const result = await customerAPI.getCustomersList({
                    page: pageNo,
                    searchText: search,
                    statusIds: primaryTab?.statusIds ?? [],
                    isStaging: primaryTab?.isStaging,
                    isAll: true,
                    ...(secondaryTab?.filter && { filter: secondaryTab?.filter }),
                    customerGroupIds: appliedFilter?.customerGroup ?? [],
                    stateIds: appliedFilter?.status ?? [],
                    categoryCode: appliedFilter?.category ?? [],
                    stateIds:appliedFilter?.state?.map((e)=>Number(e))??[],
                    cityIds:appliedFilter?.city?.map((e)=>Number(e))??[]
                });

                const newData = result?.data?.customers || [];
                setCustomers(prev =>
                    append ? [...prev, ...newData] : newData
                );

                setHasMore(newData.length > 0);
            } catch (e) {
                console.error("API error:", e);
            } finally {
                setLoading(false);
            }
        },
        [search, primaryTab, secondaryTab, appliedFilter]
    );


    useEffect(() => {
        if (primaryTab) {
            setPage(1);
            setHasMore(true);
            setCustomers([]);
            fetchCustomers(1, false);
        }
    }, [search, primaryTab, secondaryTab, appliedFilter]);

    const loadMore = useCallback(() => {
        if (loading || !hasMore) return;

        const nextPage = page + 1;
        setPage(nextPage);
        fetchCustomers(nextPage, true);
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
            />
        </AppView>
    );
};

export default CustomerListContainer;
