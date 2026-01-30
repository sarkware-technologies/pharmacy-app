import React, { useRef, useState, useEffect, memo, useCallback } from "react";
import {
    Dimensions,
    TouchableOpacity,
    View,
    Animated,
    ActivityIndicator,
    ScrollView,
} from "react-native";

import { SkeletonDetailPage } from "../../../../components/SkeletonLoader";
import AppText from "../../../../components/AppText";
import Customerstyles from "./style/style";
import PermissionWrapper from "../../../../utils/RBAC/permissionWrapper";
import EyeOpen from "../../../../components/icons/EyeOpen";
import Download from "../../../../components/icons/Download";
import Comment from "../../../../components/icons/Comment";
import Sync from "../../../../components/icons/Sync";
import PERMISSIONS from "../../../../utils/RBAC/permissionENUM";
import DocumentModal from "./modal/documentModal"
import { downloadDocument } from "../../../../utils/download"
import { customerAPI } from "../../../../api/customer";
import CommentsModal from "../../../../components/modals/CommentsModal";
import Reassigned from "../../../../components/icons/Reassigned";
import { colors } from "../../../../styles/colors";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CloseCircle from "../../../../components/icons/CloseCircle";
import ConfirmActionModal from '../../../../components/modals/ConfirmActionModal';

import { AppToastService } from "../../../../components/AppToast"
import { isAllApprovedChecked } from "./service/formatData";


const DetailsView = ({ loading = false, customerData, instance, isChild = false, saveDraft, workflowAction, setActiveTab, onGoBack }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(0.96)).current;
    const [isEditingCustomerGroup, setIsEditingCustomerGroup] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState();
    const [customerGroups, setCustomerGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [updatingCustomerGroup, setUpdatingCustomerGroup] = useState(false);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [sendBackModalVisible, setSendBackModalVisible] = useState(false);

    console.log(customerData);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
        loadCustomerGroups();
    }, []);


    useEffect(() => {
        if (customerData) {
            const isMappingdone = isAllApprovedChecked(customerData?.mapping);
            if (instance?.stepInstances?.[0]?.approverType !== "ROLE") {
                setIsDisabled(!isMappingdone);
            } else {
                if (customerData) {
                    setIsDisabled(
                        !isMappingdone ||
                        !customerData?.divisions?.length ||
                        !customerData?.distributors?.length
                    );
                }
            }
        }
    }, [customerData]);




    const InfoRow = ({ label, value, icon, onPress }) => (
        <TouchableOpacity
            style={Customerstyles.infoRow}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={Customerstyles.infoContent}>
                <AppText style={Customerstyles.infoLabel}>{label}</AppText>
                <AppText style={Customerstyles.infoValue}>{value ?? "-"}</AppText>
            </View>
            {icon && <View style={Customerstyles.infoIcon}>{icon}</View>}
        </TouchableOpacity>
    );

    const handleDocAction = (licence, action) => {
        if (!licence?.s3Path) {

            AppToastService("Document not available", "error", "Document Error")
            return;
        }

        if (action === "view") {

            setShowDocumentModal(licence);
        } else if (action === "download") {
            downloadDocument(
                licence?.s3Path,
                licence?.fileName,
                licence?.doctypeName
            );
        }
    };

    const loadCustomerGroups = useCallback(async () => {
        try {
            const groupsResponse = await customerAPI.getCustomerGroups();
            if (groupsResponse.success && groupsResponse.data) {
                console.log('Customer groups:', groupsResponse.data);
                setCustomerGroups(groupsResponse.data || []);
            }
        } catch (error) {
            console.error('Error loading customer groups:', error);
        }
    }, []);

    // Memoize handlers to prevent unnecessary re-renders
    const handleChangeCustomerGroup = useCallback(async () => {
        // Load customer groups if not already loaded
        if (customerGroups.length === 0) {
            await loadCustomerGroups();
        }
        if (customerData?.customerGroupId) {
            setSelectedGroupId(customerData.customerGroupId);
        }
        setIsEditingCustomerGroup(true);
    }, [customerGroups.length, loadCustomerGroups, customerData?.customerGroupId]);




    const handleCancelCustomerGroup = useCallback(() => {
        setIsEditingCustomerGroup(false);
        if (customerData?.customerGroupId) {
            setSelectedGroupId(customerData.customerGroupId);
        }
    }, [customerData?.customerGroupId]);


    const handleDoneCustomerGroup = () => {
        saveDraft("customerGroup", { customerGroupId: selectedGroupId })
        setIsEditingCustomerGroup(false);
    }

    const FindDoc = (find, marginBottom = 0, name, key = "doctypeId") => {
        const license = customerData?.docType?.find((e) => e?.[key] == find);
        if (!license) {
            return <></>
        }
        return (
            <>
                <View style={[Customerstyles.fileRow, { marginBottom: marginBottom }]}>
                    <AppText style={Customerstyles.fileName} numberOfLines={1}
                        ellipsizeMode="tail">{name ?? license?.fileName}</AppText>
                    <View style={{ ...Customerstyles.iconGroup, justifyContent: 'space-around' }}>
                        <TouchableOpacity
                            style={Customerstyles.uploadedFile}
                            onPress={() => handleDocAction(license, "view")}
                        >
                            <EyeOpen width={18} color={colors.primary} />
                        </TouchableOpacity>
                        <AppText style={{ color: '#777' }}>|</AppText>
                        <TouchableOpacity
                            style={Customerstyles.uploadedFile}
                            onPress={() => handleDocAction(license, "download")}
                        >
                            <Download width={16} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        )
    }



    return (
        <View style={{ flex: 1, paddingBottom: 50 }}>
            <ScrollView
                style={{
                    paddingVertical: 0,
                    paddingHorizontal: 20,
                    backgroundColor: '#fff'
                }}
                showsVerticalScrollIndicator={false}
            >
                {loading || !customerData ? (
                    <SkeletonDetailPage />
                ) : (
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                        }}
                    >
                        <AnimatedSection>
                            <AppText style={Customerstyles.sectionTitle}>Details</AppText>
                            <View style={Customerstyles.card}>
                                <View style={{ flexDirection: "row", gap: 120 }}>
                                    <InfoRow label="Code" value={customerData?.customerCode} />
                                    <InfoRow
                                        label="Mobile Number"
                                        value={customerData?.securityDetails?.mobile}
                                    />
                                </View>
                                <InfoRow label="Email Address" value={customerData?.securityDetails?.email} />
                            </View>
                        </AnimatedSection>

                        <AnimatedSection>
                            <View style={Customerstyles.sectionHeader}>
                                <AppText style={Customerstyles.sectionTitle}>
                                    Address Details
                                </AppText>

                                {(() => {
                                    const addressProof = customerData?.docType?.find(
                                        doc => doc.doctypeName === 'ADDRESS PROOF'
                                    );

                                    if (!addressProof) return null;

                                    return (
                                        <View style={{ ...Customerstyles.fileLinkGroup, marginTop: 4 }}>


                                            <View style={Customerstyles.valueWithIcons}>
                                                {FindDoc(11, 0)}
                                            </View>

                                        </View>
                                    );
                                })()}
                            </View>
                            <View style={Customerstyles.card}>
                                <InfoRow label="Address" value={customerData?.generalDetails?.address1 + " " + customerData?.generalDetails?.address2 + " " + customerData?.generalDetails?.address3 + " " + customerData?.generalDetails?.address4} />
                                <View style={{ ...Customerstyles.rowContainer, marginTop: 5, paddingBottom: 10 }}>
                                    <View style={[Customerstyles.halfRow, { marginRight: 8 }]}>
                                        <AppText style={Customerstyles.infoLabel}>Pincode</AppText>
                                        <AppText style={Customerstyles.infoValue}>{customerData?.generalDetails?.pincode}</AppText>
                                    </View>
                                    <View style={[Customerstyles.halfRow, { marginLeft: 8 }]}>
                                        <AppText style={Customerstyles.infoLabel}>City</AppText>
                                        <AppText style={Customerstyles.infoValue}>{customerData?.generalDetails?.cityName}</AppText>
                                    </View>
                                    <View style={[Customerstyles.halfRow, { marginLeft: 8 }]}>
                                        <AppText style={Customerstyles.infoLabel}>State</AppText>
                                        <AppText style={Customerstyles.infoValue}>{customerData?.generalDetails?.stateName}</AppText>
                                    </View>
                                </View>
                            </View>
                        </AnimatedSection>

                        {customerData?.licenceDetails?.licence && customerData.licenceDetails?.licence?.length > 0 && (
                            <AnimatedSection >
                                <AppText style={Customerstyles.sectionTitle}>License Details</AppText>
                                <View style={Customerstyles.card}>
                                    {customerData.licenceDetails?.licence.map((license, index) => (
                                        <View key={index}>
                                            <View style={[Customerstyles.licenseRow, index > 0 && { marginTop: 10 }]}>
                                                <View style={Customerstyles.licenseInfo}>
                                                    <AppText style={Customerstyles.infoValue}>{license.licenceTypeName}</AppText>
                                                    <AppText style={Customerstyles.infoLabel}>{license.licenceNo}</AppText>
                                                </View>
                                                <View style={Customerstyles.licenseExpiry}>
                                                    <AppText style={Customerstyles.infoLabel}>Expiry</AppText>
                                                    <AppText style={Customerstyles.infoValue}>{new Date(license.licenceValidUpto).toLocaleDateString("en-GB").replace(/\//g, "-")}</AppText>
                                                </View>
                                            </View>
                                            {customerData?.docType?.find((e) => e?.["doctypeId"] == license?.docTypeId) && (
                                                <AppText style={Customerstyles.uploadedFileLabel}>Uploaded file</AppText>

                                            )}
                                            {FindDoc(license?.docTypeId, index === customerData.licenceDetails?.licence?.length - 1 ? 8 : 0)}
                                        </View>
                                    ))}
                                </View>
                            </AnimatedSection>
                        )}
                        <AnimatedSection >
                            <AppText style={Customerstyles.sectionTitle}>Security Details</AppText>
                            <View style={Customerstyles.card}>
                                <View style={Customerstyles.otherDetailRow}>
                                    <View style={Customerstyles.otherDetailItem}>
                                        <AppText style={Customerstyles.infoLabel}>PAN</AppText>
                                        <View style={Customerstyles.valueWithIcons}>
                                            {FindDoc("PAN CARD", 0, customerData?.securityDetails?.panNumber, "doctypeName")}
                                        </View>
                                    </View>


                                    {(customerData?.securityDetails?.gstNumber || customerData?.docType?.find((e) => e?.doctypeName == "GSTIN")) &&

                                        <View style={[Customerstyles.otherDetailItem, { marginLeft: 0 }]}>
                                            <AppText style={Customerstyles.infoLabel}>GST</AppText>
                                            <View style={Customerstyles.valueWithIcons}>
                                                {FindDoc("GSTIN", 0, customerData?.securityDetails?.gstNumber, "doctypeName")}
                                            </View>
                                        </View>}

                                </View>
                            </View>
                        </AnimatedSection>


                        {(() => {
                            const imageDoc = customerData?.docType?.find(
                                doc => Number(doc.doctypeId) === 1   // 👈 CLINIC IMAGE
                            );

                            if (!imageDoc) return null;

                            return (
                                <AnimatedSection>
                                    <AppText style={Customerstyles.sectionTitle}>Image</AppText>

                                    <View style={Customerstyles.card}>
                                        <View style={Customerstyles.valueWithIcons}>
                                            {FindDoc(1, 0)}
                                        </View>
                                    </View>
                                </AnimatedSection>
                            );
                        })()}
                        {customerData?.customerGroupId && (
                            <AnimatedSection  >
                                <View style={Customerstyles.sectionHeaderRow}>
                                    <AppText style={Customerstyles.sectionTitle}>Customer Group</AppText>
                                    <TouchableOpacity
                                        onPress={() => setCommentsVisible(true)}
                                        style={Customerstyles.commentIconButton}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <View style={Customerstyles.commentWrapper}>
                                            <Comment width={22} height={22} color={colors.primary} />

                                        </View>
                                    </TouchableOpacity>
                                </View>

                                <View style={[Customerstyles.card, { marginBottom: 20 }]}>
                                    {!isEditingCustomerGroup ? (
                                        // Display mode - show customer group name and Change button
                                        <View style={Customerstyles.customerGroupRow}>
                                            <AppText style={Customerstyles.infoValue}>
                                                {customerGroups?.find((e) => e?.customerGroupId == customerData.customerGroupId)?.customerGroupName}
                                            </AppText>
                                            <PermissionWrapper permission={PERMISSIONS.ONBOARDING_DETAILS_PAGE_CHANGE_CUSTOMER_GROUP}>
                                                <TouchableOpacity
                                                    style={Customerstyles.changeButton}
                                                    onPress={handleChangeCustomerGroup}
                                                    activeOpacity={0.7}
                                                >

                                                    <Sync />
                                                    <AppText style={Customerstyles.changeButtonText}>Change</AppText>
                                                </TouchableOpacity>
                                            </PermissionWrapper>
                                        </View>
                                    ) : (
                                        // Edit mode - show radio buttons inline
                                        <View style={Customerstyles.customerGroupEditContainer}>
                                            <View style={Customerstyles.radioGroupContainer}>
                                                {customerGroups.length > 0 ? (
                                                    <>
                                                        <View style={Customerstyles.radioRow}>
                                                            {customerGroups.slice(0, 2).map((group) => (
                                                                <TouchableOpacity
                                                                    key={group.customerGroupId}
                                                                    style={[Customerstyles.radioOption, Customerstyles.radioOptionFlex]}
                                                                    onPress={() => {
                                                                        setSelectedGroupId(group.customerGroupId);
                                                                    }}
                                                                >
                                                                    <View style={Customerstyles.radioCircle}>
                                                                        {selectedGroupId === group.customerGroupId && (
                                                                            <View style={Customerstyles.radioSelected} />
                                                                        )}
                                                                    </View>
                                                                    <AppText style={Customerstyles.radioText}>
                                                                        {group.customerGroupId}-{group.customerGroupName}
                                                                    </AppText>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                        {customerGroups?.length > 2 && (
                                                            <View style={Customerstyles.radioRow}>
                                                                {customerGroups.slice(2, 4).map((group) => (
                                                                    <TouchableOpacity
                                                                        key={group.customerGroupId}
                                                                        style={[Customerstyles.radioOption, Customerstyles.radioOptionFlex]}
                                                                        onPress={() => setSelectedGroupId(group.customerGroupId)}
                                                                    >
                                                                        <View style={Customerstyles.radioCircle}>
                                                                            {selectedGroupId === group.customerGroupId && (
                                                                                <View style={Customerstyles.radioSelected} />
                                                                            )}
                                                                        </View>
                                                                        <AppText style={Customerstyles.radioText}>
                                                                            {group.customerGroupId}-{group.customerGroupName}
                                                                        </AppText>
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </>
                                                ) : (
                                                    <ActivityIndicator size="small" color={colors.primary} />
                                                )}
                                            </View>

                                            <View style={Customerstyles.inlineModalButtons}>

                                                <TouchableOpacity
                                                    style={Customerstyles.inlineDoneButton}
                                                    onPress={() => handleDoneCustomerGroup()}
                                                    disabled={updatingCustomerGroup}
                                                >
                                                    {updatingCustomerGroup ? (
                                                        <ActivityIndicator size="small" color="#fff" />
                                                    ) : (
                                                        <AppText style={Customerstyles.inlineDoneButtonText}>Done</AppText>
                                                    )}
                                                </TouchableOpacity>


                                                <TouchableOpacity
                                                    style={Customerstyles.inlineCancelButton}
                                                    onPress={handleCancelCustomerGroup}
                                                >
                                                    <AppText style={Customerstyles.inlineCancelButtonText}>Cancel</AppText>
                                                </TouchableOpacity>

                                            </View>
                                        </View>
                                    )}
                                </View>
                            </AnimatedSection>
                        )}
                    </Animated.View>
                )}
                <CommentsModal
                    visible={commentsVisible}
                    onClose={() => setCommentsVisible(false)}
                    moduleRecordId={(() => {
                        let id = null;
                        if (customerData?.stageId) {
                            id = customerData?.stageId;
                        } else if (customerData?.stgCustomerId) {
                            id = customerData.stgCustomerId;
                        }
                        return id;
                    })()}
                    moduleName={["NEW_CUSTOMER_ONBOARDING", "EXISTING_CUSTOMER_ONBOARDING"]}
                />
                <DocumentModal s3Path={showDocumentModal?.s3Path} fileName={showDocumentModal?.fileName} doctypeName={showDocumentModal?.doctypeName} showDocumentModal={showDocumentModal != null} close={() => setShowDocumentModal(null)} />
            </ScrollView>
            {!loading && instance?.stepInstances && (

                <View style={Customerstyles.stickyFooter}>
                    {!isChild ? (
                        <PermissionWrapper permission={PERMISSIONS.ONBOARDING_DETAILS_PAGE_APPROVE_REJECT}>
                            <View style={Customerstyles.actionButtonsContainer}>
                                {/* Send Back */}
                                {instance?.stepInstances && instance?.stepInstances?.[0]?.approverType !==
                                    "INITIATOR" && (
                                        <TouchableOpacity
                                            style={Customerstyles.sendBackButton}
                                            onPress={() => setSendBackModalVisible(true)}
                                        >

                                            <>
                                                <Reassigned color={colors.primary} width={18} height={18} />
                                                <AppText style={Customerstyles.sendBackButtonText}>Send Back</AppText>
                                            </>
                                        </TouchableOpacity>
                                    )}


                                {/* Approve / Verify */}
                                <TouchableOpacity
                                    style={
                                        [Customerstyles.approveButton, isDisabled && { opacity: 0.5 }]
                                    }
                                    disabled={isDisabled}
                                    onPress={() => {
                                        onGoBack?.()
                                        setApproveModalVisible(true)
                                    }}
                                >
                                    <>
                                        <MaterialIcons name="check" size={20} color="#fff" />
                                        <AppText
                                            style={Customerstyles.approveButtonText}
                                        >
                                            {instance?.stepInstances?.[0]?.approverType === 'ROLE' ? "Verify" : 'Approve'}
                                        </AppText>
                                    </>
                                </TouchableOpacity>

                                {/* Reject */}
                                <TouchableOpacity
                                    style={Customerstyles.rejectButton}
                                    onPress={() => setRejectModalVisible(true)}
                                >
                                    <CloseCircle color="#2B2B2B" />
                                    <AppText style={Customerstyles.rejectButtonText}>Reject</AppText>
                                </TouchableOpacity>
                            </View>
                        </PermissionWrapper>
                    ) : (
                        customerData?.isApproved == null && (
                            <View style={Customerstyles.actionButtonsContainer}>
                                {instance?.stepInstances?.[0]?.approverType === "ROLE" ? (
                                    <TouchableOpacity
                                        style={
                                            [Customerstyles.approveButton]
                                        }
                                        onPress={() => {
                                            setActiveTab?.("linkaged");
                                        }}

                                    >
                                        <>
                                            <MaterialIcons name="check" size={20} color="#fff" />
                                            <AppText
                                                style={Customerstyles.approveButtonText}
                                            >
                                                Continue
                                            </AppText>
                                        </>
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={
                                                [Customerstyles.approveButton]
                                            }
                                            onPress={() => saveDraft("mapping", { isApproved: true }, true)}
                                        >
                                            <>
                                                <MaterialIcons name="check" size={20} color="#fff" />
                                                <AppText
                                                    style={Customerstyles.approveButtonText}
                                                >
                                                    Approve
                                                </AppText>
                                            </>
                                        </TouchableOpacity>

                                        {/* Reject */}
                                        <TouchableOpacity
                                            style={Customerstyles.rejectButton}
                                            onPress={() => saveDraft("mapping", { isApproved: false }, true)}
                                        >
                                            <CloseCircle color="#2B2B2B" />
                                            <AppText style={Customerstyles.rejectButtonText}>Reject</AppText>
                                        </TouchableOpacity>
                                    </>
                                )}

                            </View>
                        )
                    )}


                </View>


            )
            }
            <ConfirmActionModal
                visible={approveModalVisible}
                onClose={() => setApproveModalVisible(false)}
                onConfirm={(comment) => {
                    workflowAction("APPROVE", comment)
                    setApproveModalVisible(false)
                }
                }
                title={"Are you sure you want to\nApprove customer?"}
                showCheckbox
                confirmColor={colors.primary}
            />

            <ConfirmActionModal
                visible={rejectModalVisible}
                onClose={() => setRejectModalVisible(false)}
                onConfirm={(comment) => {
                    workflowAction("REJECT", comment)
                    setRejectModalVisible(false)
                }
                }
                title={"Are you sure you want to\nReject customer?"}
                confirmColor="#FF7779"
            />


            <ConfirmActionModal
                visible={sendBackModalVisible}
                onClose={() => setSendBackModalVisible(false)}
                onConfirm={(comment) => {
                    workflowAction("sendBack", comment)
                    setSendBackModalVisible(false)
                }
                }
                title={"Are you sure you want to send\nthis request back to the MR?"}
                iconColor="#777777"
                confirmColor={colors.primary}
            />

        </View >
    );
};




const AnimatedSection = memo(({ children }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

    }, []);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
});

AnimatedSection.displayName = "AnimatedSection";

export default DetailsView;
