import { FlatList } from "react-native-gesture-handler";
import { useCallback, useEffect, useMemo, useState } from "react";
import CustomerItem from "./CustomerItem";
import { SkeletonList } from "../../../../../components/SkeletonLoader";
import AppView from "../../../../../components/AppView";
import { AppText } from "../../../../../components";
import Liststyles from "../style/listStyle";
import People from '../../../../../components/icons/People';
import WorkflowTimelineModal from "../../../../../components/modals/WorkflowTimelineModal";
import { ActivityIndicator } from "react-native";

const CustomerListView = ({ customers = [], loadMore, primaryTab, secondaryTab, loading, searchText }) => {
    const [expandedChild, setExpandedChild] = useState(null);

    const [actionCustomer, setActionCustomer] = useState(null);
    const [action, setAction] = useState(null);
    const handleAction = (customer, action) => {
        console.log(customer, action, 2398479)
        setActionCustomer(customer);
        setAction(action);
    }

    const renderCustomerItem = useCallback(
        ({ item }) => (
            <CustomerItem
                item={item}
                primaryTab={primaryTab}
                secondaryTab={secondaryTab}
                setExpandedChild={setExpandedChild}
                expandedChild={expandedChild}
                _handleAction={handleAction}
            />
        ),
        [primaryTab, secondaryTab, expandedChild]
    );

    const handleLoadMore = useCallback(() => {
        loadMore?.();
    }, [loadMore]);

    if (customers?.length === 0 && loading) {
        return <SkeletonList />;
    }

    const renderFooter = () => {
        if (!loading) return null;

        return (
            <AppView style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator color={"#F7941E"} />
            </AppView>
        );
    };



    return (
        <AppView style={{ flex: 1 }} >
            {!loading && customers?.length == 0 ? (
                <AppView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <AppView alignItems={"center"}>
                        <People size={60} color="#9CA3AF" />
                        <AppText style={Liststyles.emptyTitle}>No Customers Found</AppText>
                        <AppText style={Liststyles.emptyMessage}>
                            {searchText ? `No customers match "${searchText}"` : 'Start by adding your first customer'}
                        </AppText>
                    </AppView>
                </AppView>
            ) : (
                <FlatList
                    data={customers}
                    renderItem={renderCustomerItem}
                    keyExtractor={(item, index) =>
                        (item?.stgCustomerId ?? item?.customerId) + index?.toString()
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    ListFooterComponent={renderFooter}

                />
            )}


            {/* 
            <ApproveCustomerModal
                visible={approveModalVisible}
                onClose={() => {
                    setApproveModalVisible(false);
                    setSelectedCustomerForAction(null);
                }}
                onConfirm={handleApproveConfirm}
                customerName={selectedCustomerForAction?.customerName}
                loading={actionLoading}
            />

            <RejectCustomerModal
                visible={rejectModalVisible}
                onClose={() => {
                    setRejectModalVisible(false);
                    setSelectedCustomerForAction(null);
                }}
                onConfirm={handleRejectConfirm}
                customerName={selectedCustomerForAction?.customerName}
                loading={actionLoading}
            />

            <ApproveCustomerModal
                visible={verifyModalVisible}
                onClose={() => {
                    setVerifyModalVisible(false);
                    setLatestDraftData(null);
                    setSelectedCustomerForAction(null);
                }}
                onConfirm={handleVerifyConfirm}
                customerName={selectedCustomerForAction?.customerName}
                loading={actionLoading}
            /> */}

            <WorkflowTimelineModal
                visible={action == 'status'}
                onClose={() => {
                    setActionCustomer(null);
                    setAction(null);
                }}
                customer={actionCustomer}
                customerName={actionCustomer?.customerName}
                customerType={actionCustomer?.customerType}
            />
        </AppView>
    );
};

export default CustomerListView;
