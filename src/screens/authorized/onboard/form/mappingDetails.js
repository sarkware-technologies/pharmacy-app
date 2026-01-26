import { AppText } from "../../../../components";
import { TouchableOpacity, View, Modal, Animated } from "react-native";
import AccordionCard from "../../../../components/view/AccordionCard";
import { memo, useCallback, useEffect, useState, useMemo } from "react";
import OnboardStyle from "../style/onboardStyle";
import Downarrow from "../../../../components/icons/downArrow";
import CommonStyle from "../../../../styles/styles";
import AppView from "../../../../components/AppView"
import CustomCheckbox from "../../../../components/view/checkbox";
import Svg, { Path } from "react-native-svg";
import TextButton from "../../../../components/view/textButton"
import RadioOption from "../../../../components/view/RadioOption";
import { customerAPI } from "../../../../api/customer";
import EntitySelector from "../selector/EntitySelector";
import LabeledSelector from '../../../../components/form/labeledSelector'
import DoctorDeleteIcon from "../../../../components/icons/DoctorDeleteIcon";
import { SELECTOR_ENTITY_CONFIG } from "../utils/fieldMeta"
import StockistSection from './StockistSection'
import LinearGradient from 'react-native-linear-gradient';

import AddEntity from '../selector/AddEntity';
import ChildLinkageDetails from "../../customer/childLinkage"
import CheckCircle from '../../../../components/icons/CheckCircle'

const MappingDetails = ({ setValue, isAccordion = false, formData, action, scrollToSection, error, handleSave }) => {
    const [toggle, setToggle] = useState("open");
    const [customerOption, setCustomerOption] = useState([]);
    const [activeSelector, setActiveSelector] = useState(null);
    const [showAddEntity, setShowAddEntity] = useState(false);
    const [showLinkageModal, setShowLinkageModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);


    useEffect(() => {
        if (!formData) return;

        const hasMappingData =
            formData?.mapping?.hospitals?.length ||
            formData?.mapping?.doctors?.length ||
            formData?.mapping?.pharmacy?.length ||
            formData?.mapping?.groupHospitals?.length;

        if (
            (formData?.typeId == 1 || formData?.typeId == 3) &&
            !hasMappingData
        ) {
            updateMapping(() => ({
                hospitals: [],
            }));
        }
    }, [formData?.typeId]);



    useEffect(() => {
        if (formData?.customerGroupId) return;

        setValue(prev => ({
            ...prev,
            customerGroupId: allowedCustomerGroupIds[0],
        }));
    }, [allowedCustomerGroupIds]);



    const allowedCustomerGroupIds = useMemo(() => {
        if (formData?.subCategoryId === 3) {
            return [3, 2];
        }

        if (formData?.categoryId === 5) {
            return [4];
        }

        return [1];
    }, [
        formData?.subCategoryId,
        formData?.categoryId,
    ]);


    const handleToggle = useCallback(() => {
        setToggle(p => (p === "open" ? "close" : "open"));
    }, []);

    const handleSetValue = (key, value) => {
        setValue?.((prev) => {
            return { ...prev, [key]: value }
        })
    }



    useEffect(() => {
        fetchCustomerGroups();
    }, [])


    const fetchCustomerGroups = useCallback(async () => {
        const response = await customerAPI.getCustomerGroups();
        setCustomerOption(response?.data ?? [])
    }, [])

    const addMoreStockiest = () => {
        const suggestedDistributors = formData?.suggestedDistributors ?? [];

        if (suggestedDistributors.length >= 4) return;

        handleSetValue("suggestedDistributors", [
            ...suggestedDistributors,
            {
                distributorCode: "",
                distributorName: "",
                city: "",
                customerId: "",
            },
        ]);
        requestAnimationFrame(() => {
            scrollToSection?.("bottom");
        });
    };



    const onSelectRadio = (selector) => {
        const entityKey = SELECTOR_ENTITY_CONFIG[selector]?.entityType;
        if (!entityKey) return;

        updateMapping(() => ({
            [entityKey]: [],
        }));
    };


    const onToggleCheckbox = (selector) => {
        const entityKey = SELECTOR_ENTITY_CONFIG[selector]?.entityType;
        if (!entityKey) return;

        updateMapping(prev => {
            const updated = { ...prev };

            if (updated[entityKey]) {
                delete updated[entityKey];
            } else {
                updated[entityKey] = [];
            }

            return updated;
        });
    };


    const cleanList = (list = [], customerId, allowMultiple) =>
        allowMultiple && customerId
            ? list.filter(item => item?.id != customerId)
            : list;


    const handleEntitySelect = (
        entityType,
        items,
        parentHospitalId = null,
        allowMultiple = false,
        customerId = null
    ) => {
        updateMapping(prevMapping => {
            const updatedMapping = { ...prevMapping };
            if (entityType === 'pharmacy' && parentHospitalId) {
                updatedMapping.hospitals = (updatedMapping.hospitals || []).map(hospital => {
                    if (hospital.id !== parentHospitalId) return hospital;


                    return {
                        ...hospital,
                        pharmacy: updateEntityList(
                            cleanList(hospital.pharmacy, customerId, allowMultiple),
                            items,
                            allowMultiple
                        ),
                    };
                });

                return updatedMapping;
            }

            if (entityType === 'hospitals') {




                updatedMapping.hospitals = updateEntityList(
                    cleanList(updatedMapping.hospitals, customerId, allowMultiple),
                    items,
                    allowMultiple
                );
            }

            if (entityType === 'doctors') {




                updatedMapping.doctors = updateEntityList(
                    cleanList(updatedMapping.doctors, customerId, allowMultiple),
                    items,
                    allowMultiple
                );
            }

            if (entityType === 'pharmacy' && !parentHospitalId) {
                updatedMapping.pharmacy = updateEntityList(
                    cleanList(updatedMapping.pharmacy, customerId, allowMultiple),
                    items,
                    allowMultiple
                );
            }
            if (entityType === 'groupHospitals') {
                updatedMapping.groupHospitals = updateEntityList(
                    cleanList(updatedMapping.groupHospitals, customerId, allowMultiple),
                    items,
                    allowMultiple
                );
            }
            const updatedFormData = {
                ...formData,
                mapping: updatedMapping,
            };

            if (action === 'onboard' || action === 'assigntocustomer') {
                handleSave(updatedFormData);
            }
            return updatedMapping;
        });

        // Close selector after selection
        setActiveSelector(null);


    };

    // helper start
    const updateEntityList = (prev = [], items = [], allowMultiple) => {

        if (!allowMultiple) {
            return items.filter(item => item.isActive);
        }

        let updated = [...prev];

        items.forEach(item => {
            const index = updated.findIndex(p => p.id == item.id);

            if (index > -1) {
                if (item.isActive) {
                    updated[index] = updated[index];
                } else {
                    updated.splice(index, 1);
                }
            } else if (item.isActive) {
                updated.push(item);
            }
        });

        return updated;
    };

    const updateMapping = (updater) => {
        setValue(prev => ({
            ...prev,
            mapping: updater(prev.mapping),
        }));
    };


    console.log(showAddEntity);


    const handleChipPress = (item, keyName, parentHospitalId = null) => {

        if (item?.allMandatoryDocsUploaded === false) {


            setShowAddEntity({
                key: keyName,
                parentHospitalId: parentHospitalId,
                customerId: item.id,
                isStaging: item.isNew,
                action: "edit"
            });


            // handleFalseCase(item);   // 🔴 only when explicitly false
        } else {
            setSelectedCustomer(item);
            setShowLinkageModal(true);
        }
    };
    const renderSelectedCustomers = ({
        data = [],
        keyName,
        setValue,
    }) => {
        if (!data.length) return null;

        const handleDelete = (index) => {
            setValue(prev => ({
                ...prev,
                mapping: {
                    ...prev.mapping,
                    [keyName]: prev.mapping[keyName].filter((_, i) => i !== index),
                },
            }));
        };

        return (
            <View style={OnboardStyle.selectedItemsContainer}>
                {data.map((item, index) => (
                    <View
                        key={item.id || index}

                    >
                        {/* CHIP PRESS */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => handleChipPress(item, keyName)}
                        >
                            <LinearGradient
                                colors={
                                    item?.allMandatoryDocsUploaded === false
                                        ? ['#F5F5F6', '#ffffff']
                                        : ['#D1FAE5', '#ffffff']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    OnboardStyle.selectedItemChip,
                                    {
                                        borderColor:
                                            item?.allMandatoryDocsUploaded === false
                                                ? '#D1D5DB'
                                                : '#10B981',
                                    },
                                ]}
                            >
                                <AppView flexDirection={"row"} alignItems={"center"} style={{ gap: 6 }}>
                                    {item?.allMandatoryDocsUploaded !== false && (
                                        <CheckCircle color="#169560" height={18} width={18} />
                                    )}

                                    <AppText style={OnboardStyle.chipText}>
                                        {item.customerName}
                                    </AppText>
                                </AppView>

                                {/* DELETE ONLY */}
                                <TouchableOpacity
                                    onPress={() => handleDelete(index)}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <DoctorDeleteIcon />
                                </TouchableOpacity>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        );
    };



    const renderLinkedHospitals = () => {
        return (
            <View style={OnboardStyle.hospitalsContainer}>
                {formData?.mapping?.hospitals.map((hospital, index) => (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleChipPress(hospital, "linked_hospital")}
                    >
                        <LinearGradient
                            colors={
                                hospital?.allMandatoryDocsUploaded === false
                                    ? ['#F5F5F6', '#ffffff']
                                    : ['#D1FAE5', '#ffffff']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                                OnboardStyle.hospitalAccordion,
                                {
                                    borderColor:
                                        hospital?.allMandatoryDocsUploaded === false
                                            ? '#D1D5DB'
                                            : '#10B981',
                                },
                            ]}
                        >


                            <View style={OnboardStyle.hospitalHeader}>
                                <AppView style={[OnboardStyle.hospitalHeaderContent, { gap: 6 }]} flexDirection={"row"} alignItems={"center"}>
                                    {hospital?.allMandatoryDocsUploaded !== false && (
                                        <CheckCircle color="#169560" height={18} width={18} />
                                    )}
                                    <AppText style={OnboardStyle.hospitalName}>

                                        {hospital.customerName}
                                    </AppText>
                                </AppView>

                                <TouchableOpacity
                                    style={OnboardStyle.removeButton}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        setValue(prev => ({
                                            ...prev,
                                            mapping: {
                                                ...prev.mapping,
                                                hospitals: prev.mapping.hospitals.filter(
                                                    (_, i) => i !== index
                                                ),
                                            },
                                        }));
                                    }}
                                >
                                    <DoctorDeleteIcon
                                        width={12}
                                        height={12}
                                        color="#999"
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={OnboardStyle.hospitalContent}>
                                <View style={OnboardStyle.pharmaciesSection}>
                                    {hospital?.pharmacy?.length > 0 && (
                                        <AppText style={OnboardStyle.pharmaciesLabel}>
                                            Pharmacies
                                        </AppText>
                                    )}

                                    {hospital?.pharmacy?.length > 0 && (
                                        <View style={OnboardStyle.pharmaciesTags}>
                                            {hospital?.pharmacy.map((pharmacy, pIndex) => (
                                                <TouchableOpacity
                                                    activeOpacity={0.8}
                                                    key={pharmacy.id || pIndex}
                                                    style={OnboardStyle.pharmacyTag}
                                                    onPress={() => handleChipPress(pharmacy, 'linked_hospital_child', hospital?.id)}
                                                >


                                                    <AppView flexDirection={"row"} alignItems={"center"} style={{ flex: 1, gap: 6 }}>
                                                        {pharmacy?.allMandatoryDocsUploaded !== false && (
                                                            <CheckCircle color="#169560" height={18} width={18} />
                                                        )}
                                                        <AppText style={OnboardStyle.pharmacyTagText} numberOfLines={1} ellipsizeMode="tail">
                                                            {pharmacy.customerName}
                                                        </AppText>
                                                    </AppView>


                                                    <TouchableOpacity
                                                        activeOpacity={0.8}
                                                        style={OnboardStyle.pharmacyTagRemove}
                                                        onPress={() => {
                                                            setValue(prev => ({
                                                                ...prev,
                                                                mapping: {
                                                                    ...prev.mapping,
                                                                    hospitals: prev.mapping.hospitals.map((hospital, hIndex) =>
                                                                        hIndex === index
                                                                            ? {
                                                                                ...hospital,
                                                                                pharmacy: hospital?.pharmacy.filter(
                                                                                    (_, pIdx) => pIdx !== pIndex
                                                                                ),
                                                                            }
                                                                            : hospital
                                                                    ),
                                                                },
                                                            }));
                                                        }}
                                                    >
                                                        <DoctorDeleteIcon
                                                            width={12}
                                                            height={12}
                                                            color="#666"
                                                        />
                                                    </TouchableOpacity>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    <TextButton fontWeight={600} fontFamily="regular" onPress={() => {
                                        setActiveSelector({ key: 'linked_hospital_child', parentHospitalId: hospital?.id });
                                    }}>+ Add Pharmacy</TextButton>

                                </View>
                            </View>
                        </LinearGradient>

                    </TouchableOpacity>
                ))}
            </View>
        );
    };


    const handleAddNewEntity = (key, parentHospitalId = null) => {
        const config = SELECTOR_ENTITY_CONFIG[key];

        if (!config) return;

        setShowAddEntity({
            key,
            ...(parentHospitalId && { parentHospitalId }),
        });
    };

    // helper end


    let mappingRadioDisable = !!(
        formData?.mapping?.hospitals?.length ||
        formData?.mapping?.pharmacy?.length ||
        formData?.mapping?.doctors?.length
    );

    return (
        <>
            <AppView style={{ marginTop: 20 }}>
                <AccordionCard
                    title={
                        <TouchableOpacity
                            onPress={isAccordion ? handleToggle : undefined}
                            activeOpacity={0.8}
                            style={[CommonStyle.SpaceBetween, { paddingRight: 20, paddingBottom: 10 }]}
                        >
                            <AppView gap={5} flexDirection={"row"} alignItems={"center"}>
                                <AppText style={OnboardStyle.accordionTitle}>
                                    Mapping
                                    {/* <AppText style={OnboardStyle.requiredIcon}>*</AppText> */}
                                </AppText>
                                {(formData?.typeId == 3) && (
                                    <AppText fontSize={20} color="#909090" fontFamily="regular" fontWeight={400}>(Optional)</AppText>
                                )}
                            </AppView>

                            {isAccordion && (
                                <AppView style={{
                                    transform: [{ rotate: toggle === "close" ? "0deg" : "180deg" }],
                                }}>
                                    <Downarrow />
                                </AppView>
                            )}

                        </TouchableOpacity>
                    }
                    insideToggle={false}
                    onToggle={!isAccordion ? '' : toggle}
                    isOpen={!isAccordion}
                >
                    <AppView style={OnboardStyle.accordionView}>

                        {(formData?.typeId != 1) && (
                            <AppView>
                                <AppView style={OnboardStyle.switchContainer}>
                                    <AppText fontFamily="regular" fontSize={16} style={OnboardStyle.switchLabel}>
                                        Mark as buying entity
                                    </AppText>
                                    <TouchableOpacity
                                        style={[
                                            OnboardStyle.switch,
                                            formData?.isBuyer && OnboardStyle.switchActive,
                                        ]}
                                        onPress={() => {
                                            setValue(prev => ({
                                                ...prev,
                                                isBuyer: !prev.isBuyer,
                                            }));
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <Animated.View
                                            style={[
                                                OnboardStyle.switchThumb,
                                                formData?.isBuyer && OnboardStyle.switchThumbActive,
                                            ]}
                                        />
                                    </TouchableOpacity>
                                </AppView>
                            </AppView>
                        )}

                        {(formData?.typeId == 2) && (

                            <AppView gap={10} flexDirection={"row"} alignItems={"center"} marginTop={20}>
                                <AppText fontSize={18}>Select category</AppText>
                                {(formData?.typeId == 2 && formData?.categoryId == 4 && [1, 2].includes(formData?.subCategoryId)) && (
                                    <AppText fontSize={14} color="#909090" fontFamily="regular" fontWeight={400}>(Optional)</AppText>
                                )}
                            </AppView>
                        )}



                        {/* Link child hospital */}

                        {(formData?.typeId == 2 && ((formData?.categoryId == 4 && formData?.subCategoryId == 3) || formData?.categoryId == 5)) && (
                            <AppView>
                                <AppView marginTop={20} marginBottom={4}>
                                    <AppView flexDirection={"row"} alignItems={"center"}>
                                        <AppText fontSize={16}>Link child hospital</AppText>
                                        <AppText style={OnboardStyle.requiredIcon}>*</AppText>
                                        <TouchableOpacity style={{ paddingLeft: 5 }}>
                                            <Svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <Path d="M6.66667 13.3333C2.98467 13.3333 0 10.3487 0 6.66667C0 2.98467 2.98467 0 6.66667 0C10.3487 0 13.3333 2.98467 13.3333 6.66667C13.3333 10.3487 10.3487 13.3333 6.66667 13.3333ZM6.66667 12C8.08115 12 9.43771 11.4381 10.4379 10.4379C11.4381 9.43771 12 8.08115 12 6.66667C12 5.25218 11.4381 3.89562 10.4379 2.89543C9.43771 1.89524 8.08115 1.33333 6.66667 1.33333C5.25218 1.33333 3.89562 1.89524 2.89543 2.89543C1.89524 3.89562 1.33333 5.25218 1.33333 6.66667C1.33333 8.08115 1.89524 9.43771 2.89543 10.4379C3.89562 11.4381 5.25218 12 6.66667 12ZM6.66667 5.33333C6.84348 5.33333 7.01305 5.40357 7.13807 5.5286C7.2631 5.65362 7.33333 5.82319 7.33333 6V9.33333C7.33333 9.51014 7.2631 9.67971 7.13807 9.80474C7.01305 9.92976 6.84348 10 6.66667 10C6.48986 10 6.32029 9.92976 6.19526 9.80474C6.07024 9.67971 6 9.51014 6 9.33333V6C6 5.82319 6.07024 5.65362 6.19526 5.5286C6.32029 5.40357 6.48986 5.33333 6.66667 5.33333ZM6.66667 4.66667C6.48986 4.66667 6.32029 4.59643 6.19526 4.4714C6.07024 4.34638 6 4.17681 6 4C6 3.82319 6.07024 3.65362 6.19526 3.5286C6.32029 3.40357 6.48986 3.33333 6.66667 3.33333C6.84348 3.33333 7.01305 3.40357 7.13807 3.5286C7.2631 3.65362 7.33333 3.82319 7.33333 4C7.33333 4.17681 7.2631 4.34638 7.13807 4.4714C7.01305 4.59643 6.84348 4.66667 6.66667 4.66667Z" fill="#777777" />
                                            </Svg>
                                        </TouchableOpacity>
                                    </AppView>
                                </AppView>


                                <LabeledSelector
                                    value={
                                        formData?.mapping?.hospitals?.length
                                            ? `${formData.mapping.hospitals.length} Hospitals selected`
                                            : ""
                                    }
                                    placeholder="Search Hospital name/code"
                                    onPress={() => setActiveSelector({ key: 'linked_hospital' })}
                                />

                                {formData?.mapping?.hospitals?.length > 0 && renderLinkedHospitals()}


                                <View>
                                    <TextButton fontWeight={600} fontFamily="regular" onPress={() => setShowAddEntity({ key: 'linked_hospital' })}>+ Add New Hospital</TextButton>
                                </View>
                            </AppView>
                        )}


                        {/* Group Hospital */}
                        {(formData?.typeId == 2 && formData?.categoryId == 4 && [1, 2].includes(formData?.subCategoryId)) && (
                            <AppView>
                                <AppView marginTop={30} marginBottom={4}>
                                    <CustomCheckbox
                                        size={20}
                                        activeColor="#F7941E"
                                        checkIcon={
                                            <Svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <Path d="M8.25 0.75L3.09375 5.90625L0.75 3.5625" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </Svg>
                                        }
                                        title={
                                            <AppView flexDirection={"row"} alignItems={"center"}>
                                                <AppText fontSize={16}>Group Corporate Hospital</AppText>
                                                <TouchableOpacity style={{ paddingLeft: 10 }}>
                                                    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <Path d="M6.66667 13.3333C2.98467 13.3333 0 10.3487 0 6.66667C0 2.98467 2.98467 0 6.66667 0C10.3487 0 13.3333 2.98467 13.3333 6.66667C13.3333 10.3487 10.3487 13.3333 6.66667 13.3333ZM6.66667 12C8.08115 12 9.43771 11.4381 10.4379 10.4379C11.4381 9.43771 12 8.08115 12 6.66667C12 5.25218 11.4381 3.89562 10.4379 2.89543C9.43771 1.89524 8.08115 1.33333 6.66667 1.33333C5.25218 1.33333 3.89562 1.89524 2.89543 2.89543C1.89524 3.89562 1.33333 5.25218 1.33333 6.66667C1.33333 8.08115 1.89524 9.43771 2.89543 10.4379C3.89562 11.4381 5.25218 12 6.66667 12ZM6.66667 5.33333C6.84348 5.33333 7.01305 5.40357 7.13807 5.5286C7.2631 5.65362 7.33333 5.82319 7.33333 6V9.33333C7.33333 9.51014 7.2631 9.67971 7.13807 9.80474C7.01305 9.92976 6.84348 10 6.66667 10C6.48986 10 6.32029 9.92976 6.19526 9.80474C6.07024 9.67971 6 9.51014 6 9.33333V6C6 5.82319 6.07024 5.65362 6.19526 5.5286C6.32029 5.40357 6.48986 5.33333 6.66667 5.33333ZM6.66667 4.66667C6.48986 4.66667 6.32029 4.59643 6.19526 4.4714C6.07024 4.34638 6 4.17681 6 4C6 3.82319 6.07024 3.65362 6.19526 3.5286C6.32029 3.40357 6.48986 3.33333 6.66667 3.33333C6.84348 3.33333 7.01305 3.40357 7.13807 3.5286C7.2631 3.65362 7.33333 3.82319 7.33333 4C7.33333 4.17681 7.2631 4.34638 7.13807 4.4714C7.01305 4.59643 6.84348 4.66667 6.66667 4.66667Z" fill="#777777" />
                                                    </Svg>
                                                </TouchableOpacity>
                                            </AppView>
                                        }
                                        checked={formData?.mapping?.groupHospitals}
                                        onChange={() => onToggleCheckbox('groupHospitals')}

                                    />
                                </AppView>
                                {formData?.mapping?.groupHospitals && (
                                    <>

                                        <LabeledSelector
                                            value={
                                                formData?.mapping?.groupHospitals?.length
                                                    ? `${formData.mapping.groupHospitals.length} Hospitals selected`
                                                    : ""
                                            }
                                            placeholder="Search hospital name/code"
                                            onPress={() => setActiveSelector({ key: 'groupHospitals' })}
                                        />
                                        {formData?.mapping?.groupHospitals?.length > 0 &&
                                            renderSelectedCustomers({
                                                data: formData.mapping.groupHospitals,
                                                keyName: 'groupHospitals',
                                                setValue,
                                            })}


                                        {!formData?.mapping?.groupHospitals?.length && (
                                            <View>
                                                <TextButton fontWeight={600} fontFamily="regular" onPress={() => setShowAddEntity({ key: 'groupHospitals' })}>+ Add Group Hospital</TextButton>
                                            </View>

                                        )}
                                    </>
                                )}

                            </AppView>
                        )}


                        {/* Hospital Or Doctor or Pharmacy */}
                        {(formData?.typeId == 1 || formData?.typeId == 3) && (
                            <AppView>
                                <AppView marginTop={30} marginBottom={4} flexDirection={"row"} gap={30}>
                                    <RadioOption disabled={mappingRadioDisable}
                                        width={15} height={15} label={<AppText fontSize={16} fontWeight={"bold"}>Hospital</AppText>} selected={formData?.mapping?.hospitals} onSelect={() => onSelectRadio('hospitals')} />
                                    {formData?.typeId == 1 && (
                                        <RadioOption disabled={mappingRadioDisable} width={15} height={15} label={<AppText fontSize={16} fontWeight={"bold"}>Doctor</AppText>} selected={formData?.mapping?.doctors} onSelect={() => onSelectRadio('doctors')} />
                                    )}
                                    {formData?.typeId == 3 && (
                                        <RadioOption disabled={mappingRadioDisable} width={15} height={15} label={<AppText fontSize={16} fontWeight={"bold"}>Pharmacy</AppText>} selected={formData?.mapping?.pharmacy} onSelect={() => onSelectRadio('pharmacy')} />
                                    )}
                                </AppView>

                                {formData?.mapping?.hospitals && (
                                    <>
                                        <LabeledSelector
                                            value={
                                                formData?.mapping?.hospitals?.length
                                                    ? `${formData.mapping.hospitals.length} Hospitals selected`
                                                    : ""
                                            }
                                            placeholder="Search hospital name/code"
                                            onPress={() => setActiveSelector({ key: 'hospitals' })}
                                        />

                                        {formData?.mapping?.hospitals?.length > 0 &&
                                            renderSelectedCustomers({
                                                data: formData.mapping.hospitals,
                                                keyName: 'hospitals',
                                                setValue,
                                            })}

                                        {!formData?.mapping?.hospitals?.length && (
                                            <View>
                                                <TextButton
                                                    fontWeight={600}
                                                    fontFamily="regular"
                                                    onPress={() => setShowAddEntity({ key: 'hospitals' })}
                                                >
                                                    + Add New Hospital
                                                </TextButton>
                                            </View>
                                        )}

                                    </>
                                )}

                                {formData?.mapping?.doctors && (
                                    <>
                                        <LabeledSelector
                                            value={
                                                formData?.mapping?.doctors?.length
                                                    ? `${formData.mapping.doctors.length} Doctors selected`
                                                    : ""
                                            } placeholder="Search doctor name/code"
                                            onPress={() => setActiveSelector({ key: 'doctors' })}
                                        />

                                        {formData?.mapping?.doctors?.length > 0 &&
                                            renderSelectedCustomers({
                                                data: formData.mapping.doctors,
                                                keyName: 'doctors',
                                                setValue,
                                            })}



                                        <View>
                                            <TextButton fontWeight={600} fontFamily="regular" onPress={() => setShowAddEntity({ key: 'doctors' })}>+ Add New doctor</TextButton>
                                        </View>

                                    </>
                                )}

                                {formData?.mapping?.pharmacy && (
                                    <>

                                        <LabeledSelector
                                            value={
                                                formData?.mapping?.pharmacy?.length
                                                    ? `${formData.mapping.pharmacy.length} Pharmacies selected`
                                                    : ""
                                            }
                                            placeholder="Search pharmacy name/code"
                                            onPress={() => setActiveSelector({ key: 'pharmacy' })}
                                        />

                                        {formData?.mapping?.pharmacy?.length > 0 &&
                                            renderSelectedCustomers({
                                                data: formData.mapping.pharmacy,
                                                keyName: 'pharmacy',
                                                setValue,
                                            })}



                                        <View>
                                            <TextButton fontWeight={600} fontFamily="regular" onPress={() => setShowAddEntity({ key: 'pharmacy' })}>+ Add New Pharmacy</TextButton>
                                        </View>
                                    </>
                                )}

                            </AppView>
                        )}



                        {/* Pharmarcy */}
                        {(formData?.typeId == 2) && (

                            <AppView>
                                <AppView marginTop={30} marginBottom={4}>
                                    <CustomCheckbox
                                        size={20}
                                        activeColor="#F7941E"
                                        checkIcon={
                                            <Svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <Path d="M8.25 0.75L3.09375 5.90625L0.75 3.5625" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </Svg>
                                        }
                                        title={
                                            <AppView flexDirection={"row"} alignItems={"center"}>
                                                <AppText fontSize={16}>Pharmacy</AppText>
                                                <TouchableOpacity style={{ paddingLeft: 5 }}>
                                                    <Svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <Path d="M6.66667 13.3333C2.98467 13.3333 0 10.3487 0 6.66667C0 2.98467 2.98467 0 6.66667 0C10.3487 0 13.3333 2.98467 13.3333 6.66667C13.3333 10.3487 10.3487 13.3333 6.66667 13.3333ZM6.66667 12C8.08115 12 9.43771 11.4381 10.4379 10.4379C11.4381 9.43771 12 8.08115 12 6.66667C12 5.25218 11.4381 3.89562 10.4379 2.89543C9.43771 1.89524 8.08115 1.33333 6.66667 1.33333C5.25218 1.33333 3.89562 1.89524 2.89543 2.89543C1.89524 3.89562 1.33333 5.25218 1.33333 6.66667C1.33333 8.08115 1.89524 9.43771 2.89543 10.4379C3.89562 11.4381 5.25218 12 6.66667 12ZM6.66667 5.33333C6.84348 5.33333 7.01305 5.40357 7.13807 5.5286C7.2631 5.65362 7.33333 5.82319 7.33333 6V9.33333C7.33333 9.51014 7.2631 9.67971 7.13807 9.80474C7.01305 9.92976 6.84348 10 6.66667 10C6.48986 10 6.32029 9.92976 6.19526 9.80474C6.07024 9.67971 6 9.51014 6 9.33333V6C6 5.82319 6.07024 5.65362 6.19526 5.5286C6.32029 5.40357 6.48986 5.33333 6.66667 5.33333ZM6.66667 4.66667C6.48986 4.66667 6.32029 4.59643 6.19526 4.4714C6.07024 4.34638 6 4.17681 6 4C6 3.82319 6.07024 3.65362 6.19526 3.5286C6.32029 3.40357 6.48986 3.33333 6.66667 3.33333C6.84348 3.33333 7.01305 3.40357 7.13807 3.5286C7.2631 3.65362 7.33333 3.82319 7.33333 4C7.33333 4.17681 7.2631 4.34638 7.13807 4.4714C7.01305 4.59643 6.84348 4.66667 6.66667 4.66667Z" fill="#777777" />
                                                    </Svg>
                                                </TouchableOpacity>
                                            </AppView>
                                        }
                                        checked={formData?.mapping?.pharmacy}
                                        onChange={() => onToggleCheckbox('pharmacy')} />
                                </AppView>

                                {formData?.mapping?.pharmacy && (
                                    <>
                                        <LabeledSelector
                                            value={
                                                formData?.mapping?.pharmacy?.length
                                                    ? `${formData.mapping.pharmacy.length} Pharmacies selected`
                                                    : ""
                                            }
                                            placeholder="Search pharmacy name/code"
                                            onPress={() => setActiveSelector({ key: 'pharmacy' })}
                                        />

                                        {formData?.mapping?.pharmacy?.length > 0 &&
                                            renderSelectedCustomers({
                                                data: formData.mapping.pharmacy,
                                                keyName: 'pharmacy',
                                                setValue,
                                            })}

                                        <View>
                                            <TextButton fontWeight={600} fontFamily="regular" onPress={() => setShowAddEntity({ key: 'pharmacy' })}>+ Add New Pharmacy</TextButton>
                                        </View>
                                    </>
                                )}

                            </AppView>
                        )}



                        {/* Customer Group */}

                        <AppView backgroundColor={"#fbfbfb"} marginTop={20} gap={6} paddingVertical={13} paddingHorizontal={15} borderRadius={12}>
                            <AppText fontSize={16}>
                                Customer group
                            </AppText>
                            <AppView flexDirection={"row"} paddingLeft={5} flexWrap="wrap">
                                {customerOption.map(e => {
                                    const isAllowed = allowedCustomerGroupIds.includes(e.customerGroupId);
                                    return (
                                        <AppView
                                            key={e.customerGroupId}
                                            width="50%"
                                            marginTop={15}
                                        // opacity={isAllowed ? 1 : 0.4}
                                        >
                                            <RadioOption
                                                label={e.customerGroupName}
                                                selected={e.customerGroupId === formData?.customerGroupId}
                                                disabled={!isAllowed}
                                                onSelect={() => {
                                                    if (!isAllowed) return;
                                                    handleSetValue("customerGroupId", e.customerGroupId);
                                                }}
                                            />
                                        </AppView>
                                    );
                                })}

                            </AppView>
                        </AppView>


                        {/* Stockist Suggestions */}
                        <AppView>
                            <AppView gap={10} flexDirection={"row"} alignItems={"center"} marginTop={30}>
                                <AppText fontSize={18}>Stockist Suggestions</AppText>
                                <AppText fontSize={14} color="#909090" fontFamily="regular" fontWeight={400}>(Optional)</AppText>
                            </AppView>

                            <StockistSection
                                formData={formData}
                                setValue={setValue}
                            />

                            {/* ))} */}
                            {formData?.suggestedDistributors?.length != 4 && (
                                <AppText marginTop={10} marginBottom={20} >
                                    <TextButton onPress={() => addMoreStockiest()} fontWeight={600} fontFamily="regular">+ Add More Stockist</TextButton>
                                </AppText>
                            )}
                        </AppView>
                    </AppView>
                </AccordionCard>
            </AppView>


            <Modal
                visible={!!activeSelector}
                animationType="slide"
                transparent={true}
            >

                <EntitySelector
                    {...SELECTOR_ENTITY_CONFIG[activeSelector?.key]}
                    formData={formData}
                    onSelect={handleEntitySelect}
                    parentHospitalId={activeSelector?.parentHospitalId}
                    onClose={setActiveSelector}
                    onAddNew={handleAddNewEntity}
                />



            </Modal>



            {showAddEntity && (
                <AddEntity
                    {...SELECTOR_ENTITY_CONFIG[showAddEntity?.key]}
                    visible={!!showAddEntity?.key}
                    onClose={() => setShowAddEntity(false)}
                    parentData={formData}
                    onSubmit={handleEntitySelect}
                    parentHospitalId={showAddEntity?.parentHospitalId}
                    action={showAddEntity?.action ?? 'register'}
                    customerId={showAddEntity?.customerId ?? null}
                    isStaging={showAddEntity?.isStaging ?? null}
                    parentAction={action}


                />
            )}

            <Modal
                visible={showLinkageModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowLinkageModal(false)}
            >
                <ChildLinkageDetails
                    customerId={selectedCustomer?.id}
                    isStaging={selectedCustomer?.isNew}
                    onClose={() => setShowLinkageModal(false)}
                    activeTab={"details"}
                />
            </Modal>

            {/*  */}





        </>
    );
};



export default MappingDetails;


