
import { act, useCallback, useEffect, useMemo, useState } from "react";
import CustomerItem from "./CustomerItem";
import { SkeletonList } from "../../../../../components/SkeletonLoader";
import AppView from "../../../../../components/AppView";
import { AppText } from "../../../../../components";
import Liststyles from "../style/listStyle";
import People from '../../../../../components/icons/People';
import WorkflowTimelineModal from "../../../../../components/modals/WorkflowTimelineModal";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import DocumentsModal from '../../../../../components/modals/documents/DocumentsModal'
import DocumentPreviewModal from '../../../../../components/modals/documents/DocumentPreviewModal'
import { AppToastService } from '../../../../../components/AppToast';
import { BASE_URL } from '../../../.././../api/apiClient'
import { customerAPI } from "../../../../../api/customer";
import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmActionModal from '../../../../../components/modals/ConfirmActionModal';
import { showLoader, hideLoader } from '../../../../../components/ScreenLoader';
import { useDispatch, useSelector } from 'react-redux';


const CustomerListView = ({ customers = [], loadMore, primaryTab, secondaryTab, loading, searchText, refreshCurrentPage, refreshing }) => {

    const loggedInUser = useSelector(state => state.auth.user);

    const [expandedChild, setExpandedChild] = useState(null);
    const [actionCustomer, setActionCustomer] = useState(null);
    const [action, setAction] = useState(null);

    const [showDocumentsModal, setShowDocumentsModal] = useState(false);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const [customerDocuments, setCustomerDocuments] = useState(null);

    // preview
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewSignedUrl, setPreviewSignedUrl] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    //reject modal
    const [rejectModalVisible, setRejectModalVisible] = useState(false);



    const fetchCustomerDocuments = async (customer) => {
        setDocumentsLoading(true);
        try {
            const customerId = customer?.customerId || customer?.stgCustomerId;
            const isStaging = !!customer?.stgCustomerId;
            const res = await customerAPI.getCustomerDetails(customerId, isStaging);
            if (res?.data) {
                const details = res.data;
                setCustomerDocuments({
                    gstDoc: details.docType?.find(d => d.doctypeName === 'GSTIN') || null,
                    panDoc: details.docType?.find(d => d.doctypeName === 'PAN CARD') || null,
                    allDocuments: details.docType || [],
                });
            }
        } finally {
            setDocumentsLoading(false);
        }
    };

    const handleDownloadAll = async () => {
        try {
            if (!actionCustomer) {
                AppToastService.show('Customer not found', 'error', 'Error');
                return;
            }

            const customerId =
                actionCustomer?.stgCustomerId ?? actionCustomer?.customerId;
            const isStaging = !!actionCustomer?.stgCustomerId;

            if (!customerId) {
                AppToastService.show('Customer ID missing', 'error', 'Error');
                return;
            }

            AppToastService.show('Please wait...', 'warning', 'Preparing ZIP');

            // 🔐 Get access token (same one ApiClient uses)
            const token = await AsyncStorage.getItem('authToken');

            const zipFileName = 'customer_documents.zip';

            const downloadUrl =
                `${BASE_URL}/user-management/customer/download-doc-zip` +
                `?customerId=${customerId}&isStaging=${isStaging}`;

            await ReactNativeBlobUtil.config({
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    title: zipFileName,
                    description: 'Downloading documents...',
                    mime: 'application/zip',
                    mediaScannable: true,
                },
            }).fetch(
                'GET',
                downloadUrl,
                token
                    ? { Authorization: `Bearer ${token}` }
                    : {}
            );

            AppToastService.show(
                'ZIP file downloading',
                'success',
                'Download started'
            );

        } catch (error) {

            AppToastService.show(
                error?.message || 'Something went wrong',
                'error',
                'Download failed'
            );
        }
    };

    const handleAction = (customer, action) => {        
        setActionCustomer(customer);
        setAction(action);
        if (action == 'DOWNLOAD') {
            setShowDocumentsModal(true);
            fetchCustomerDocuments(customer);
        } else if (action == 'REJECT') {
            setRejectModalVisible(true)
        }
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





    const handlePreview = async (doc) => {
        setPreviewVisible(true);
        setPreviewDoc(doc);
        setPreviewSignedUrl(null);
        setPreviewLoading(true);

        try {
            const res = await customerAPI.getDocumentSignedUrl(doc.s3Path);
            if (res?.data?.signedUrl) {
                setPreviewSignedUrl(res.data.signedUrl);
            }
        } catch (e) {
            AppToastService.show('Preview fetch failed', 'error', 'Error');
        } finally {
            setPreviewLoading(false);
        }
    };


    const handleRejectConfirm = async (comment) => {
        try {
            showLoader();
            const instanceId = actionCustomer?.instaceId || actionCustomer?.stgCustomerId;
            const actorId = loggedInUser?.userId || loggedInUser?.id;
            const parellGroupId = actionCustomer?.instance?.stepInstances[0]?.parallelGroup
            const stepOrderId = actionCustomer?.instance?.stepInstances[0]?.stepOrder

            const actionDataPyaload = {
                stepOrder: stepOrderId,
                parallelGroup: parellGroupId,
                actorId: actorId,
                action: "REJECT",
                comments: comment || "Rejected",
                instanceId: instanceId,
                actionData: {
                    field: "status",
                    newValue: "Rejected"
                },
                dataChanges: {
                    previousStatus: "Pending",
                    newStatus: "Rejected"
                }
            };

            const response = await customerAPI.workflowAction(instanceId, actionDataPyaload);

            if (response?.status == "success") {
                setRejectModalVisible(false);
                AppToastService.show("Customer has been rejected!", "error", "Reject");
                setActionCustomer(null);
                refreshCurrentPage?.(true)
            }

        } catch (error) {
            setRejectModalVisible(false);
            AppToastService.show("Failed to reject customer", "error", "Reject");

            setActionCustomer(null);
        } finally {
            hideLoader();
        }
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
                    refreshing={refreshing}
                    onRefresh={refreshCurrentPage}
                />
            )}



            <ConfirmActionModal
                visible={rejectModalVisible}
                onClose={() => setRejectModalVisible(false)}
                onConfirm={handleRejectConfirm}
                title={"Are you sure you want to\nReject customer?"}
                confirmColor="#FF7779"
            />


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

            <DocumentsModal
                visible={showDocumentsModal}
                loadingDocuments={documentsLoading}
                customerDocuments={customerDocuments}
                onClose={() => {
                    setShowDocumentsModal(false);
                    setCustomerDocuments(null);
                }}
                onPreview={handlePreview}
                onDownloadAll={() => {
                    handleDownloadAll()
                }}
            />

            <DocumentPreviewModal
                visible={previewVisible}
                document={previewDoc}
                signedUrl={previewSignedUrl}
                loading={previewLoading}
                onClose={() => {
                    setPreviewVisible(false);
                    setPreviewDoc(null);
                    setPreviewSignedUrl(null);
                }}
            />


        </AppView>
    );
};

export default CustomerListView;
