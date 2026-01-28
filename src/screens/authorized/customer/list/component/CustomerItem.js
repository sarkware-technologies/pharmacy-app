import { TouchableOpacity } from "react-native";
import { AppText } from "../../../../../components";
import AppView from "../../../../../components/AppView";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import Edit from "../../../../../components/icons/Edit";
import Download from "../../../../../components/icons/Download";
import TextButton from "../../../../../components/view/textButton";
import ChevronRight from "../../../../../components/icons/ChevronRight";
import AddrLine from "../../../../../components/icons/AddrLine";
import AlertFilled from "../../../../../components/icons/AlertFilled";
import Phone from "../../../../../components/icons/Phone";
import Email from "../../../../../components/icons/Email";
import LinkIcon from "../../../../../components/icons/LinkIcon";
import ExpandMore from "../../../../../components/icons/expandMore";
import { useNavigation } from "@react-navigation/native";
import PERMISSIONS from "../../../../../utils/RBAC/permissionENUM";
import { Approve, Lock, Reject, UnLock } from "../../../../../components/icons/customerDetails";
import { customerAPI } from "../../../../../api/customer";
import AnimatedContent from "../../../../../components/view/AnimatedContent";
import { SkeletonListItem } from "../../../../../components/SkeletonLoader";
import usePermissions from "../../../../../utils/RBAC/usePermissions"

/* -------------------- Safe Button -------------------- */
const Button = ({
    title,
    icon,
    onPress,
    borderWidth,
    borderColor,
    backgroundColor,
    fontSize = 14,
    color = "#FFFFFF",
    borderRadius = 8,
}) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <AppView
                paddingHorizontal={10}
                paddingVertical={7}
                borderRadius={borderRadius}
                borderColor={borderColor}
                borderWidth={borderWidth}
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                gap={5}
                backgroundColor={backgroundColor}
            >
                {icon ?? null}
                <AppText fontSize={fontSize} color={color}>
                    {title}
                </AppText>
            </AppView>
        </TouchableOpacity>
    );
};

/* -------------------- CustomerView -------------------- */
const CustomerView = ({ item, primaryTab, secondaryTab, handleAction }) => {
    const instanceData = item?.instance?.stepInstances?.[0];
    const { can } = usePermissions();

    const editPermissionTabBased = {
        all: [
            PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_EDIT,
            PERMISSIONS.ONBOARDING_WORKFLOW_EDIT,
        ],
        waitingForApproval: [
            PERMISSIONS.ONBOARDING_LISTING_PAGE_WAITING_FOR_APPROVAL_EDIT,
            PERMISSIONS.ONBOARDING_LISTING_PAGE_WAITING_FOR_APPROVAL_REASSIGNED_EDIT,
            PERMISSIONS.ONBOARDING_WORKFLOW_EDIT,
        ],
        notOnboarded: [],
        unverified: [
            PERMISSIONS.ONBOARDING_LISTING_PAGE_UNVERIFIED_EDIT,
        ],
        rejected: [
            PERMISSIONS.ONBOARDING_LISTING_PAGE_REJECTED_EDIT,
        ],
        doctorSupply: [],
        draft: [
            PERMISSIONS.ONBOARDING_LISTING_PAGE_DRAFT_EDIT_DELETE,
        ],
    };

    const canEnterEditFlow =
        item?.statusName !== 'NOT-ONBOARDED' &&
        (
            item?.statusName === 'DRAFT' ||
            !!item?.instance?.stepInstances?.length ||
            (item?.customerId && !item?.stgCustomerId)
        );
    const canEditByPermission = can(
        editPermissionTabBased[primaryTab?.key] || []
    );

    const unverifiedEdit = can(PERMISSIONS.ONBOARDING_LISTING_PAGE_UNVERIFIED_EDIT);

    const hideEdit =
        (item?.statusName === 'UNVERIFIED' && !unverifiedEdit) ||
        item?.instance?.stepInstances?.[0]?.stepInstanceStatus === 'APPROVED' ||
        (item?.childStageId || []).length > 0;

    const statusColor = useMemo(() => {
        const color = {
            ACTIVE: { backgroundColor: "#E8F5F0", color: "#169560" },
            MODIFIED: { backgroundColor: "#5995C71A", color: "#5995C7" },
            LOCKED: { backgroundColor: "#E841411A", color: "#E84141" },
            "NOT-ONBOARDED": { backgroundColor: "#F7941E1A", color: "#F7941E" },
            PENDING: { backgroundColor: "#F4AD481A", color: "#F4AD48" },
            IN_PROGRESS: { backgroundColor: "#F4AD481A", color: "#F4AD48" },
            UNVERIFIED: { backgroundColor: "#2B2B2B1A", color: "#2B2B2B" },
            DRAFT: { backgroundColor: "#9C561E1A", color: "#63321A" },
            REJECTED: { backgroundColor: "#E841411A", color: "#E84141" },
            REASSIGNED: { backgroundColor: "#AB65AD1A", color: "#AB65AD" },
        };

        let status =
            instanceData?.approverType === "INITIATOR" &&
                instanceData?.stepInstanceStatus !== "APPROVED"
                ? "REASSIGNED"
                : instanceData?.approverType === "INITIATOR" &&
                    instanceData?.stepInstanceStatus === "APPROVED"
                    ? "APPROVED"
                    : instanceData?.stepInstanceStatus ?? item?.statusName;

        if (item?.childStageId?.length) status = "MODIFIED";

        return {
            ...(color[status] ?? color.ACTIVE),
            status,
        };
    }, [instanceData, item]);

    const isInstance = ["IN_PROGRESS", "PENDING"].includes(
        instanceData?.stepInstanceStatus ?? ""
    );

    const customerButton = useMemo(() => {
        const isModified = !!item?.childStageId?.length;
        const action = isModified ? "MODIFIED" : item?.action;

        const canBlockUnblock = can([
            PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_BLOCK_UNBLOCK,
        ]);

        const canOnboard = can([
            PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_ONBOARD,
            PERMISSIONS.ONBOARDING_LISTING_PAGE_NOT_ONBOARDED_ONBOARD,
        ]);

        const canLinkDT = can([
            PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_LINK_DT,
        ]);

        const canApproveReject = can([
            PERMISSIONS.ONBOARDING_LISTING_PAGE_ALL_APPROVE_REJECT,
            PERMISSIONS.ONBOARDING_LISTING_PAGE_WAITING_FOR_APPROVAL_APPROVE_REJECT,
        ]);

        if (action === "UNBLOCK" && canBlockUnblock) {
            return (
                <Button
                    onPress={() => handleAction("UNBLOCK")}
                    borderColor="#E84141"
                    borderWidth={0.5}
                    color="#E84141"
                    title="Unblock"
                    icon={<UnLock />}
                />
            );
        }

        if (action === "BLOCK" && canBlockUnblock) {
            return (
                <Button
                    onPress={() => handleAction("BLOCK")}
                    borderColor="#2B2B2B"
                    borderWidth={0.5}
                    color="#2B2B2B"
                    title="Block"
                    icon={<Lock />}
                />
            );
        }

        if (action === "ONBOARD" && canOnboard) {
            return (
                <Button
                    onPress={() => handleAction("ONBOARD")}
                    backgroundColor="#F7941E"
                    title="Onboard"
                />
            );
        }

        if (action === "MODIFIED") {
            return (
                <TouchableOpacity onPress={() => handleAction("MODIFIED")}>
                    <AppView borderColor="#2B2B2B" borderWidth={0.5} padding={11} borderRadius={8}>
                        <ExpandMore />
                    </AppView>
                </TouchableOpacity>
            );
        }

        const showLinkDT =
            canLinkDT &&
            !item?.customerId &&
            isInstance &&
            (
                primaryTab?.key === "all" ||
                (primaryTab?.key === "waitingForApproval" && secondaryTab?.filter === "NEW")
            );

        if (showLinkDT) {
            return (
                <AppView flexDirection="row" gap={8} alignItems="center">
                    <Button
                        onPress={() => handleAction("APPROVE")}
                        color="#F7941E"
                        borderColor="#F7941E"
                        borderWidth={1}
                        title="Link - DT"
                    />
                    <TouchableOpacity onPress={() => handleAction("REJECT")}>
                        <Reject />
                    </TouchableOpacity>
                </AppView>
            );
        }

        if (!isInstance || !canApproveReject) return null;

        return (
            <AppView flexDirection="row" gap={8} alignItems="center">
                <Button
                    onPress={() => handleAction("APPROVE")}
                    backgroundColor="#F7941E"
                    title={
                        instanceData?.approverValue !== "DistributionTeam"
                            ? "Approve"
                            : "Verify"
                    }
                    icon={<Approve />}
                />
                <TouchableOpacity onPress={() => handleAction("REJECT")}>
                    <Reject />
                </TouchableOpacity>
            </AppView>
        );
    }, [
        item,
        isInstance,
        instanceData,
        primaryTab,
        secondaryTab,
        handleAction,
        can
    ]);


    const visibleFields = [
        item?.customerCode,
        item?.cityName,
        item?.groupName,
        item?.customerCategory,
    ].filter(Boolean);
    const width = `${100 / visibleFields.length - 5}%`;

    return (
        <AppView>
            <AppView flexDirection={"row"} justifyContent={"space-between"}>
                <AppView maxWidth={"80%"}>
                    <TextButton gap={10} onPress={() => handleAction("details")}>
                        <AppView flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} gap={5}>
                            <AppText fontSize={16} fontWeight={700}>{item?.customerName} </AppText>
                            <ChevronRight width={7.5} height={12} color="#F7941E" />
                        </AppView>
                    </TextButton>
                </AppView>

                <AppView flexDirection={"row"} gap={10} >
                    {canEnterEditFlow && canEditByPermission && !hideEdit && (
                        <TouchableOpacity   onPress={() => handleAction("EDIT")} >
                            <Edit width={15} height={15} />
                        </TouchableOpacity>
                    )}
                    {item?.statusName !== 'NOT-ONBOARDED' && (

                          <TouchableOpacity   onPress={() => handleAction("DOWNLOAD")}>
                        <Download width={15} height={15} />
                        </TouchableOpacity>
                    )}

                </AppView>

            </AppView>
            <AppView marginTop={10} flexDirection={"row"} alignItems={"center"} justifyContent={"space-between"}>
                <AppView maxWidth={"80%"} flexDirection={"row"} alignItems={"center"} gap={7}>
                    <AppView flexDirection={"row"} gap={6} alignItems={"center"} maxWidth={width}>
                        <AddrLine />
                        <AppText numberOfLines={1} fontSize={14} color="#777777" fontFamily="regular" fontWeight={400}>{item?.customerCode}</AppText>
                    </AppView>
                    <AppText fontSize={14} color="#777777" fontFamily="regular" fontWeight={400}>|</AppText>
                    <AppView flexDirection={"row"} gap={6} alignItems={"center"} maxWidth={width}>
                        <AppText numberOfLines={1} fontSize={14} color="#777777" fontFamily="regular" fontWeight={400}>{item?.cityName ?? ''}</AppText>
                    </AppView>
                    <AppText fontSize={14} color="#777777" fontFamily="regular" fontWeight={400}>|</AppText>
                    <AppView flexDirection={"row"} gap={6} alignItems={"center"} maxWidth={width}>
                        <AppText numberOfLines={1} fontSize={14} color="#777777" fontFamily="regular" fontWeight={400}>
                            {item?.groupName}
                        </AppText>
                    </AppView>
                    <AppText fontSize={14} color="#777777" fontFamily="regular" fontWeight={400}>|</AppText>
                    <AppView flexDirection={"row"} gap={6} alignItems={"center"} maxWidth={width}>
                        <AppText numberOfLines={1} fontSize={14} color="#777777" fontFamily="regular" fontWeight={400}>
                            {item?.customerCategory}
                        </AppText>
                        <AppText></AppText>
                    </AppView>
                </AppView>
                <AppView maxWidth={"20%"} flexDirection={"row"} justifyContent={"space-between"} alignItems={"center"} gap={6}>
                    <TouchableOpacity onPress={() => handleAction("linkaged")}>
                        <LinkIcon />
                    </TouchableOpacity>
                    <AppText color="#F7941E" fontSize={14}>{item?.linkageCount}</AppText>
                </AppView>
            </AppView>
            <AppView marginTop={8} gap={10} flexDirection={"row"} alignItems={"center"} >
                <AppView flexDirection={"row"} alignItems={"center"} gap={5} maxWidth={"30%"}>
                    <Phone />
                    <AppText numberOfLines={1} fontSize={14} color="#777777" fontFamily="regular">
                        {item?.mobile}
                    </AppText>
                </AppView>
                <AppView flexDirection={"row"} alignItems={"center"} gap={5} maxWidth={"62%"}>
                    <Email />
                    <AppText numberOfLines={1} fontSize={14} color="#777777" fontFamily="regular">
                        {item?.email}
                    </AppText>
                </AppView>
            </AppView>
            <AppView marginTop={15} flexDirection={"row"} alignItems={"center"} gap={5} justifyContent={"space-between"} >
                <TouchableOpacity onPress={() => handleAction("status")}>
                    <AppView backgroundColor={statusColor?.backgroundColor} paddingHorizontal={10} paddingVertical={8} borderRadius={8}>
                        <AppText fontSize={12} color={statusColor?.color}>
                            {statusColor?.status}
                        </AppText>
                    </AppView>
                </TouchableOpacity>
                {customerButton}
            </AppView>
        </AppView>
    )
};



/* -------------------- Parent -------------------- */
const CustomerItem = ({
    item = {},
    primaryTab,
    secondaryTab,
    setExpandedChild,
    expandedChild,
    _handleAction
}) => {
    const navigation = useNavigation();
    const customerId = item?.stgCustomerId ?? item?.customerId;
    const [childTask, setChildTask] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchChildtask = useCallback(async () => {
        if (!item?.childStageId) return;
        try {
            setIsLoading(true);
            const res = await customerAPI.getChildtask(item.childStageId);
            setChildTask(Array.isArray(res?.customers) ? res.customers : []);
        } finally {
            setIsLoading(false);
        }
    }, [item?.childStageId]);

    const handleAction = useCallback(
        (action) => {
            if (action === "MODIFIED") {
                setExpandedChild((prev) => (prev === customerId ? null : customerId));
            }
           
            else if (action == "APPROVE" || action == "linkaged" || action == 'details') {
                navigation.navigate('CustomerDetail', {
                    customerId: item?.stgCustomerId ?? item?.customerId,
                    isStaging: !!item?.stgCustomerId,
                    activeTab: action == 'APPROVE' ? 'linkaged' : action,
                    activeSubTab: action == 'details' ? 'divisions' : 'hierarchy',
                })
            }
            else if (action === "ONBOARD" || action === "EDIT") {
                const finalAction =
                    action === "ONBOARD"
                        ? "onboard"
                        : item?.statusName === "DRAFT"
                            ? "register"
                            : "edit";

                navigation.navigate("onboading", {
                    customerId: item?.stgCustomerId ?? item?.customerId,
                    isStaging: !!item?.stgCustomerId,
                    action: finalAction,
                });
            }
            else {
                _handleAction?.(item, action);
            }

            //UNBLOCK
            // BLOCK
            // ONBOARD
            // MODIFIED
            // APPROVE
            // REJECT
            // EDIT
            // DOWNLOAD
            // LINKAGE
            // 
        },
        [customerId, setExpandedChild]
    );

    useEffect(() => {
        if (expandedChild === customerId) fetchChildtask();
        else setChildTask([]);
    }, [expandedChild, customerId, fetchChildtask]);





    return (
        <AppView backgroundColor="white" marginBottom={16} marginHorizontal={10} borderRadius={16} padding={20}>
            <CustomerView
                handleAction={handleAction}
                item={item}
                primaryTab={primaryTab}
                secondaryTab={secondaryTab}
            />

            {childTask.length > 0 && (
                <AppView
                    marginVertical={10}
                    marginTop={15}
                    style={{ borderBottomColor: "#909090", borderBottomWidth: 0.5 }}
                />
            )}
            {expandedChild === customerId && (
                <AnimatedContent loading={isLoading}>
                    {childTask?.map((e) => (
                        <CustomerView
                            key={e?.id ?? e?.customerId}
                            handleAction={handleAction}
                            item={e}
                            primaryTab={primaryTab}
                            secondaryTab={secondaryTab}
                        />
                    ))}
                </AnimatedContent>
            )}
            {isLoading && (
                <AppView marginTop={10}>
                    <SkeletonListItem marginHorizontal={0} marginVertical={0} />
                </AppView>
            )}
        </AppView>
    );
};

export default CustomerItem;
