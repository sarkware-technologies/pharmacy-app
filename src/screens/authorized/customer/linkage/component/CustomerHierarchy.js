import { ScrollView, TouchableOpacity, View } from "react-native";
import { AppText } from "../../../../../components";
import Linkagestyles from "../style/linkagestyle";
import { useEffect, useMemo, useRef, useState } from "react";
import HorizontalSelector from "../../../../../components/view/HorizontalSelector";
import Button from "../../../../../components/Button";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ModalClose from "../../../../../components/icons/modalClose";
import CommonStyle from "../../../../../styles/styles";
import Customerstyles from "../style/style";
import AccordionCard from "../../../../../components/view/AccordionCard"
import { colors } from "../../../../../styles/colors";
import Svg, { Path } from "react-native-svg";

const CustomerHierarchy = ({ customerData, isLoading, isChild, saveDraft, setChildCustomer, instance }) => {

    const [activeCustomerTab, setActiveCustomerTab] = useState(0);
    const [expanded, setExpanded] = useState(null);
    const [mapping, setMapping] = useState(null);

    const renderRef = useRef(false);

    useEffect(() => {
        setMapping(customerData.mapping);
    }, [customerData?.mapping]);



    const CustomerTabs = useMemo(() => {
        const tabs = [];
        if (mapping) {
            const mappedData = mapping;
            if (mappedData?.pharmacy && mappedData?.pharmacy?.length) {
                tabs.push({ key: "pharmacy", label: "Linked Pharmacies", count: mappedData?.pharmacy?.length, data: mappedData?.pharmacy });
            }
            if (mappedData?.doctors && mappedData?.doctors?.length) {
                tabs.push({ key: "doctors", label: "Linked Doctors", count: mappedData?.doctors?.length, data: mappedData?.doctors });
            }
            if (mappedData?.hospitals && mappedData?.hospitals.length) {

                tabs.push(
                    {
                        key: "hospitals",
                        label: "Linked Hospitals",
                        count: mappedData?.hospitals?.length,
                        data: mappedData?.hospitals,
                    });
            }

        }

        return tabs;
    }, [mapping]);

    const tableHeaders = ["Pharmacy Details", "Doctor Details", "Hospital Details"];
    const childHeader = ["Pharmacy Details", "Doctor Details"];

    const activeTab = CustomerTabs?.[activeCustomerTab];

    const handleToggle = (id) => {
        if (expanded == id) {
            setExpanded(null);
        }
        else {
            setExpanded(id);
        }
    }

    const handleAction = (action, customer, tab, childTab, parentId) => {
        if (action) {
            console.log({ customer: customer, tab, childTab, parentId, isStaging: customer?.isNew == true }, 239842397)
            setChildCustomer({ customer: customer, tab, childTab, parentId, isStaging: customer?.isNew == true });
        }
        else {
            if (!customerData?.mapping || !tab || !customer?.id) return;

            const mappedData = customerData.mapping;

            const updatedTabData = mappedData[tab]?.map((item) => {
                // 👉 Child level update
                if (childTab && parentId && item.id === parentId) {
                    return {
                        ...item,
                        [childTab]: item[childTab]?.map((child) =>
                            child.id === customer.id
                                ? { ...child, isApproved: action }
                                : child
                        ),
                    };
                }

                // 👉 Parent level update
                if (!childTab && item.id === customer.id) {
                    return {
                        ...item,
                        isApproved: action,
                    };
                }

                return item;
            });

            const updatedMapping = {
                ...mappedData,
                [tab]: updatedTabData,
            };


            saveDraft("mapping", { mapping: updatedMapping });
        }
    };


    const HeaderView = () => {
        return (
            <>
                <HorizontalSelector onTabChange={(i) => setActiveCustomerTab(i)} itemGap={20} >
                    {CustomerTabs.map((tab, index) => (
                        <View key={tab.key}>
                            <AppText
                                style={[
                                    Linkagestyles.distributorTabText,
                                    activeCustomerTab === index &&
                                    Linkagestyles.activeDistributorTabText,
                                ]}
                            >
                                {tab.label} ({tab.count})
                            </AppText>
                        </View>
                    ))}
                </HorizontalSelector>
                {activeTab && activeTab?.data?.length != 0 && (
                    <View style={[Linkagestyles.flatheader, { marginTop: 15 }]}>
                        <AppText style={[Linkagestyles.flatheaderText, { width: "65%" }]}>{tableHeaders[activeCustomerTab]}</AppText>
                        <AppText style={[Linkagestyles.flatheaderText, { width: "35%" }]}>Action</AppText>
                    </View>
                )}
            </>
        )
    }

    const ApproveRejectButton = ({ tab, customer, childTab, parantId }) => {
        return (
            <View style={[CommonStyle.SpaceBetween, { gap: 10, width: "35%" }]}>
                <TouchableOpacity
                    onPress={() => handleAction(true, customer, tab, childTab, parantId)}
                    style={[CommonStyle.SpaceBetween, { paddingVertical: 7, paddingHorizontal: 7, backgroundColor: "#F7941E", borderRadius: 8 }]} >
                    <MaterialIcons name="check" size={14} color="#fff" />
                    <AppText
                        style={[Customerstyles.approveButtonText, { fontSize: 14 }]}
                    >
                        Approve
                    </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleAction(false, customer, tab, childTab, parantId)}
                >
                    <ModalClose />
                </TouchableOpacity>
            </View>
        )
    }

    const groupHospitals = (customer) => {
        return (
            <View style={[CommonStyle.SpaceBetween, { paddingHorizontal: 15, paddingVertical: 15, alignItems: "flex-start", backgroundColor: "#FBFBFB", borderRadius: 12 }]}>
                <View style={{ gap: 5 }}>
                    <AppText style={[CommonStyle.secondaryText, { fontSize: 12 }]}>{customer?.customerName}</AppText>
                    <AppText style={[CommonStyle.primaryText, { fontSize: 16 }]}>Parent Hospital</AppText>
                    <AppText style={[CommonStyle.secondaryText, { fontSize: 12, color: colors.primaryText }]}>Tata Group  |  1563</AppText>
                </View>
                <ApproveRejectButton customer={customer} tab={"groupHospitals"} />

            </View>
        )
    }

    const RenderCustomer = ({ customer, tab, childTab, parantId, toggle = false, borderBottomWidth = 0.5, paddingVertical = 14, backgroundColor, paddingHorizontal, overflow, message = "Pharmacies & Doctors" }) => {
        return (
            <View style={[CommonStyle.SpaceBetween, { borderBottomColor: '#90909080', borderBottomWidth: borderBottomWidth, paddingVertical, backgroundColor, paddingHorizontal, overflow }]}>
                <View style={{ gap: 5, maxWidth: "60%" }}>
                    <TouchableOpacity onPress={() => handleAction(true, customer, tab, childTab, parantId)}>
                        <AppText style={[CommonStyle.secondaryText, { fontSize: 12, color: colors.primaryText, textDecorationLine: "underline" }]}>{customer?.customerName}</AppText>
                    </TouchableOpacity>
                    <AppText style={[CommonStyle.secondaryText, { fontSize: 12, color: colors.secondaryText }]}>{customer?.customerCode}  |  {customer?.cityName}</AppText>
                    {toggle && (
                        <TouchableOpacity onPress={() => handleToggle(customer?.id)} style={[CommonStyle.SpaceBetween, { gap: 5 }]}>
                            <AppText style={[CommonStyle.primaryText, { fontSize: 12, color: colors.secondaryText }]}>Linked {message} </AppText>
                            <Svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <Path d="M0.75 0.75L5.125 5.125L9.5 0.75" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                    )}
                </View>
                {customer?.isApproved == null ? (
                    instance?.stepInstances && (
                        <ApproveRejectButton
                            tab={tab}
                            childTab={childTab}
                            customer={customer}
                            parantId={parantId}
                        />
                    )
                ) : (
                    <View style={[CommonStyle.SpaceBetween, { gap: 5, width: "30%", justifyContent: "flex-start" }]}>
                        {customer?.isApproved ? (
                            <Svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <Path d="M10.0833 0.75L3.66667 7.16667L0.75 4.25" stroke="#169560" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        ) : (
                            <Svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <Path d="M11.15 11.15L6.35 6.35M6.35 11.15L11.15 6.35M16.75 8.75C16.75 4.3316 13.1684 0.75 8.75 0.75C4.3316 0.75 0.75 4.3316 0.75 8.75C0.75 13.1684 4.3316 16.75 8.75 16.75C13.1684 16.75 16.75 13.1684 16.75 8.75Z" stroke="#E84141" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        )}

                        <AppText style={[customer?.isApproved ? { color: "#169560" } : { color: "#E84141" }]}>
                            {customer?.isApproved ? "Approved" : "Rejected"}
                        </AppText>

                    </View>

                )
                }

            </View >
        )
    }


    const CustomerAccordionItem = ({ tab, e, activeTabKey }) => {
        const checkChildPharmacy = e?.pharmacy?.length > 0;
        const checkChildDoctor = e?.doctors?.length > 0;

        const [childActive, setChildActive] = useState(
            checkChildPharmacy ? "pharmacy" : "doctors"
        );

        return (
            <View style={{ borderColor: "#e8e8e8ff", borderWidth: 1, borderRadius: 12, marginBottom: 15 }}>
                <AccordionCard
                    insideToggle={false}
                    title={
                        <RenderCustomer
                            overflow="hidden"
                            paddingHorizontal={15}
                            paddingVertical={15}
                            toggle
                            borderBottomWidth={0}
                            backgroundColor="#FBFBFB"
                            customer={e}
                            message={checkChildPharmacy && checkChildDoctor ? 'Pharmacies & Doctors' : checkChildPharmacy ? 'Pharmacies' : 'Doctors'}
                            tab={tab}
                        />
                    }
                    onToggle={expanded == e?.id ? 'open' : 'close'}
                >
                    {/* Tabs */}
                    <View style={{ marginTop: 13 }}>
                        <HorizontalSelector
                            itemGap={20}
                            onTabChange={(index) =>
                                setChildActive(index === 0 ? "pharmacy" : "doctors")
                            }
                        >
                            {checkChildPharmacy && (
                                <View>
                                    <AppText
                                        style={[
                                            Linkagestyles.distributorTabText,
                                            childActive === "pharmacy" &&
                                            Linkagestyles.activeDistributorTabText,
                                        ]}
                                    >
                                        Pharmacies ({e?.pharmacy?.length})
                                    </AppText>
                                </View>
                            )}

                            {checkChildDoctor && (
                                <View>
                                    <AppText
                                        style={[
                                            Linkagestyles.distributorTabText,
                                            childActive === "doctors" &&
                                            Linkagestyles.activeDistributorTabText,
                                        ]}
                                    >
                                        Doctors ({e?.doctors?.length})
                                    </AppText>
                                </View>
                            )}
                        </HorizontalSelector>
                    </View>

                    {/* Header */}
                    <View style={[Linkagestyles.flatheader, { marginTop: 13, paddingVertical: 16 }]}>
                        <AppText style={[Linkagestyles.flatheaderText, { width: "65%" }]}>
                            {childHeader[childActive == "pharmacy" ? 0 : 1]}
                        </AppText>
                        <AppText style={[Linkagestyles.flatheaderText, { width: "35%" }]}>
                            Action
                        </AppText>
                    </View>

                    {/* List */}
                    <View style={{ paddingHorizontal: 10 }}>
                        {e?.[childActive]?.map((item, idx) => (

                            <RenderCustomer parantId={e?.id} childTab={childActive} tab={tab} customer={item} key={idx} />
                        ))}
                    </View>
                </AccordionCard>
            </View>
        );
    };



    return (
        <View style={Linkagestyles.accordionCardG}>
            {/* Header (FIXED) */}
            <View style={Linkagestyles.header}>
                <View style={{ marginTop: 30 }}>
                    {mapping?.groupHospitals && mapping?.groupHospitals.length != 0 && (
                        mapping?.groupHospitals.map((e, i) => (
                            <View key={i + "groupHospital"} style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
                                {groupHospitals(e)}
                            </View>
                        ))

                    )}
                    {HeaderView()}
                </View>
            </View>

            {/* Body (SCROLLABLE) */}
            <ScrollView
                style={Linkagestyles.body}
                contentContainerStyle={[Linkagestyles.bodyContent, { padding: 0 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ paddingHorizontal: 10, paddingHorizontal: 14 }}>
                    {mapping?.[activeTab?.key]?.map((e, i) => {
                        const hasChildren = e?.pharmacy?.length || e?.doctors?.length;

                        if (!hasChildren) {
                            return (
                                <View key={i + activeTab?.key} style={{ paddingHorizontal: 10 }}>
                                    <RenderCustomer tab={activeTab?.key} customer={e} />
                                </View>
                            );
                        }

                        return (
                            <CustomerAccordionItem
                                key={i + activeTab?.key}
                                e={e}
                                activeTabKey={activeTab?.key}
                                tab={activeTab?.key}
                            />
                        );
                    })}


                </View>
            </ScrollView>

            {/* Footer (FIXED) */}
            <View style={Linkagestyles.footer}>

            </View>
        </View>
    )

}

export default CustomerHierarchy;