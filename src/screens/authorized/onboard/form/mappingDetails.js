import { AppText } from "../../../../components";
import { TouchableOpacity, View, Modal } from "react-native";
import AccordionCard from "../../../../components/view/AccordionCard";
import FloatingInput from "../../../../components/form/floatingInput";
import FloatingDropdown from "../../../../components/form/floatingDropdown";
import { memo, useCallback, useEffect, useState } from "react";
import OnboardStyle from "../style/onboardStyle";
import Downarrow from "../../../../components/icons/downArrow";
import CommonStyle from "../../../../styles/styles";
import { colors } from "../../../../styles/colors";
import FilePicker from "../../../../components/form/fileUpload"
import Animated from "react-native-reanimated";
import AppView from "../../../../components/AppView"
import CustomCheckbox from "../../../../components/view/checkbox";
import Svg, { Path } from "react-native-svg";
import TextButton from "../../../../components/view/textButton"
import RadioOption from "../../../../components/view/RadioOption";
import { customerAPI } from "../../../../api/customer";
import EntitySelector from "../selector/EntitySelector"

const ENTITY_CONFIG = {
    hospital: {
        title: 'Hospital',
        entityType: 'hospitals',
        allowMultiple: false
    },

    doctor: {
        title: 'Doctor',
        entityType: 'doctors',
        allowMultiple: true
    },

    pharmacy: {
        title: 'Pharmacy',
        entityType: 'pharmacy',
        allowMultiple: true
    },

    group_hospital: {
        title: 'Hospital',
        entityType: 'groupHospitals',
        allowMultiple: false
    },

    linked_hospital: {
        title: 'Hospital',
        entityType: 'hospitals',
        allowMultiple: true
    },
    linked_hospital_child: {
        title: 'Pharmacy',
        entityType: 'pharmacy',
        allowMultiple: true
    },
};

const RenderStockist = memo(({
    index,
    Namestockist,
    distributorCode,
    City,
    onRemove,
}) => {
    return (
        <AppView>
            <AppView
                marginTop={15}
                flexDirection={"row"}
                justifyContent={"space-between"}
                paddingHorizontal={10}
            >
                <AppText fontSize={14}>Stockist {index}</AppText>

                <TouchableOpacity onPress={onRemove}>
                    <Svg
                        width="18"
                        height="18"
                        viewBox="0 0 12 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <Path
                            d="M10.125 2.54167L9.76333 8.38958C9.67117 9.8835 9.62508 10.6308 9.25 11.168C9.06483 11.4335 8.82645 11.6576 8.55 11.826C7.99175 12.1667 7.24333 12.1667 5.7465 12.1667C4.24733 12.1667 3.49775 12.1667 2.93833 11.8254C2.66177 11.6567 2.42337 11.4322 2.23833 11.1663C1.86383 10.6284 1.81833 9.88 1.7285 8.38375L1.375 2.54167M0.5 2.54167H11"
                            stroke="#909090"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                </TouchableOpacity>
            </AppView>

            <AppView>
                <FloatingInput {...Namestockist} />
            </AppView>
            <AppView marginTop={5}>
                <FloatingInput {...distributorCode} />
            </AppView>
            <AppView marginTop={5}>
                <FloatingInput {...City} />
            </AppView>
        </AppView>
    );
});

const MappingDetails = ({ setValue, isAccordion = false, formData, action, scrollToSection }) => {
    const [toggle, setToggle] = useState("open");
    const [customerOption, setCustomerOption] = useState([]);
    const [activeSelector, setActiveSelector] = useState(null);


    useEffect(() => {
        if (!formData) return;
        if ((formData?.typeId == 1 || formData?.typeId ==3)&& action === 'register') {
            updateMapping(() => ({
                hospitals: [],
            }));
        }
    }, [formData?.typeId, action]);



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

    const removeStockist = (index) => {
        handleSetValue(
            "suggestedDistributors",
            formData?.suggestedDistributors?.filter((item, i) => i !== index)
        );
    };


    const updateStockist = (index, key, value) => {

        handleSetValue(
            "suggestedDistributors",
            formData?.suggestedDistributors.map((item, i) =>
                i === index ? { ...item, [key]: value } : item
            )
        );
    };




    const updateMapping = (updater) => {
        setValue(prev => ({
            ...prev,
            mapping: updater(prev.mapping),
        }));
    };

    // const onSelectRadio = (value) => {
    //     updateMapping(mapping => ({
    //         ...mapping,
    //         activeRadio: value,
    //         entities: {
    //             hospitals: [],
    //             doctors: [],
    //             pharmacies: [],
    //             groupHospitals: [],
    //         },
    //     }));
    // };


    // const onToggleCheckbox = (value) => {
    //     updateMapping(mapping => {
    //         const exists = mapping.activeCheckbox.includes(value);

    //         return {
    //             ...mapping,
    //             activeCheckbox: exists
    //                 ? mapping.activeCheckbox.filter(v => v !== value)
    //                 : [...mapping.activeCheckbox, value],
    //         };
    //     });
    // };

    const onSelectRadio = (selector) => {
        const entityKey = ENTITY_CONFIG[selector]?.entityType;
        if (!entityKey) return;

        updateMapping(() => ({
            [entityKey]: [],
        }));
    };
    const onToggleCheckbox = (selector) => {
        const entityKey = ENTITY_CONFIG[selector]?.entityType;
        if (!entityKey) return;

        updateMapping(prev => {
            const updated = { ...prev };

            if (updated[entityKey]) {
                delete updated[entityKey];   // uncheck
            } else {
                updated[entityKey] = [];     // check
            }

            return updated;
        });
    };


    const handleEntitySelect = (entityType, items, parentHospitalId = null) => {
        updateMapping(mapping => {
            const updatedMapping = { ...mapping };

            // 🔹 Pharmacy under a specific hospital
            if (entityType === 'pharmacy' && parentHospitalId) {
                updatedMapping.hospitals = (updatedMapping.hospitals || []).map(hospital => {
                    if (hospital.id !== parentHospitalId) return hospital;

                    return {
                        ...hospital,
                        pharmacy: [
                            ...(hospital.pharmacy || []),
                            ...items.filter(
                                p => !(hospital.pharmacy || []).some(e => e.id === p.id)
                            ),
                        ],
                    };
                });

                return updatedMapping;
            }

            // 🔹 Hospitals
            if (entityType === 'hospitals') {
                updatedMapping.hospitals = [
                    ...(updatedMapping.hospitals || []),
                    ...items.filter(
                        item => !(updatedMapping.hospitals || []).some(h => h.id === item.id)
                    ),
                ];
            }

            // 🔹 Doctors
            if (entityType === 'doctors') {
                updatedMapping.doctors = [
                    ...(updatedMapping.doctors || []),
                    ...items.filter(
                        item => !(updatedMapping.doctors || []).some(d => d.id === item.id)
                    ),
                ];
            }

            // 🔹 Pharmacy (standalone)
            if (entityType === 'pharmacy' && !parentHospitalId) {
                updatedMapping.pharmacy = [
                    ...(updatedMapping.pharmacy || []),
                    ...items.filter(
                        item => !(updatedMapping.pharmacy || []).some(p => p.id === item.id)
                    ),
                ];
            }

            // 🔹 Group Hospitals
            if (entityType === 'groupHospitals') {
                updatedMapping.groupHospitals = [
                    ...(updatedMapping.groupHospitals || []),
                    ...items.filter(
                        item =>
                            !(updatedMapping.groupHospitals || []).some(g => g.id === item.id)
                    ),
                ];
            }

            return updatedMapping;
        });

        setActiveSelector(null);
    };







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
                                            // formData?.markAsBuyingEntity && OnboardStyle.switchActive,
                                        ]}
                                        onPress={() => { }
                                            // setFormData(prev => ({
                                            //     ...prev,
                                            //     // markAsBuyingEntity: !prev.markAsBuyingEntity,
                                            // }))
                                        }
                                        activeOpacity={0.8}
                                    >
                                        <Animated.View
                                            style={[
                                                OnboardStyle.switchThumb,
                                                // formData?.markAsBuyingEntity && styles.switchThumbActive,
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
                                <FloatingDropdown style={{ borderRadius: 12 }} label={"Search Hospital name/code"} onPress={() => setActiveSelector({ key: 'linked_hospital' })} />
                                <View>
                                    <TextButton fontWeight={600} fontFamily="regular">+ Add New Hospital</TextButton>
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
                                        onChange={() => onToggleCheckbox('group_hospital')}

                                    />
                                </AppView>
                                {formData?.mapping?.groupHospitals && (
                                    <>
                                        <FloatingDropdown style={{ borderRadius: 12 }} label={"Search hospital name/code"} onPress={() => setActiveSelector({ key: 'group_hospital' })} />
                                        <View>
                                            <TextButton fontWeight={600} fontFamily="regular">+ Add Group Hospital</TextButton>
                                        </View>
                                    </>
                                )}

                            </AppView>
                        )}


                        {/* Hospital Or Doctor or Pharmacy */}
                        {(formData?.typeId == 1 || formData?.typeId == 3) && (
                            <AppView>
                                <AppView marginTop={30} marginBottom={4} flexDirection={"row"} gap={30}>
                                    <RadioOption width={15} height={15} label={<AppText fontSize={16} fontWeight={"bold"}>Hospital</AppText>} selected={formData?.mapping?.hospitals} onSelect={() => onSelectRadio('hospital')} />
                                    {formData?.typeId == 1 && (
                                        <RadioOption width={15} height={15} label={<AppText fontSize={16} fontWeight={"bold"}>Doctor</AppText>} selected={formData?.mapping?.doctors} onSelect={() => onSelectRadio('doctor')} />
                                    )}
                                    {formData?.typeId == 3 && (
                                        <RadioOption width={15} height={15} label={<AppText fontSize={16} fontWeight={"bold"}>Pharmacy</AppText>} selected={formData?.mapping?.pharmacy} onSelect={() => onSelectRadio('pharmacy')} />
                                    )}
                                </AppView>

                                {formData?.mapping?.hospitals && (
                                    <>
                                        <FloatingDropdown style={{ borderRadius: 12 }} label={"Search hospital name/code"} onPress={() => setActiveSelector({ key: 'hospital' })} />
                                        <View>
                                            <TextButton fontWeight={600} fontFamily="regular">+ Add New Hospital</TextButton>
                                        </View>
                                    </>
                                )}

                                {formData?.mapping?.doctors && (
                                    <>
                                        <FloatingDropdown style={{ borderRadius: 12 }} label={"Search doctor name/code"} onPress={() => setActiveSelector({ key: 'doctor' })} />
                                        <View>
                                            <TextButton fontWeight={600} fontFamily="regular">+ Add New doctor</TextButton>
                                        </View>
                                    </>
                                )}

                                {formData?.mapping?.pharmacy && (
                                    <>
                                        <FloatingDropdown style={{ borderRadius: 12 }} label={"Search pharmacy name/code"} onPress={() => setActiveSelector({ key: 'pharmacy' })} />
                                        <View>
                                            <TextButton fontWeight={600} fontFamily="regular">+ Add New Pharmacy</TextButton>
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
                                        checked={formData?.mapping.pharmacy}
                                        onChange={() => onToggleCheckbox('pharmacy')} />
                                </AppView>

                                {formData?.mapping.pharmacy && (
                                    <>
                                        <FloatingDropdown style={{ borderRadius: 12 }} label={"Search pharmacy name/code"} onPress={() => setActiveSelector({ key: 'pharmacy' })} />
                                        <View>
                                            <TextButton fontWeight={600} fontFamily="regular">+ Add New Pharmacy</TextButton>
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
                                {customerOption?.map((e, i) => (
                                    <AppView width={"50%"} marginTop={15} key={e?.customerGroupId + i}>
                                        <RadioOption selected={e?.customerGroupId == formData?.customerGroupId} onSelect={() => handleSetValue("customerGroupId", e?.customerGroupId)} label={e?.customerGroupName} />
                                    </AppView>
                                ))}

                            </AppView>
                        </AppView>



                        {/* Stockist Suggestions */}
                        <AppView>
                            <AppView gap={10} flexDirection={"row"} alignItems={"center"} marginTop={30}>
                                <AppText fontSize={18}>Stockist Suggestions</AppText>
                                <AppText fontSize={14} color="#909090" fontFamily="regular" fontWeight={400}>(Optional)</AppText>
                            </AppView>
                            {formData?.suggestedDistributors?.map((e, i) => (
                                <RenderStockist
                                    key={i}
                                    index={i + 1}
                                    Namestockist={{
                                        label: `Name of the Stockist ${i + 1}`,
                                        value: e.distributorName,
                                        onChangeText: (text) =>
                                            updateStockist(i, "distributorName", text),
                                    }}
                                    distributorCode={{
                                        label: "Distributor Code",
                                        value: e.distributorCode,
                                        onChangeText: (text) =>
                                            updateStockist(i, "distributorCode", text),
                                    }}
                                    City={{
                                        label: "City",
                                        value: e.city,
                                        onChangeText: (text) =>
                                            updateStockist(i, "city", text),
                                    }}
                                    onRemove={() => removeStockist(i)}
                                />
                            ))}


                            {formData?.suggestedDistributors?.length != 4 && (
                                <AppText marginTop={10} marginBottom={20} >
                                    <TextButton onPres={() => addMoreStockiest()} fontWeight={600} fontFamily="regular">+ Add More Stockist</TextButton>
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
            // onRequestClose={() => setActiveSelector(null)}
            >

                <EntitySelector
                    {...ENTITY_CONFIG[activeSelector?.key]}
                    formData={formData}
                    onSelect={handleEntitySelect}
                    parentHospitalId={activeSelector?.parentHospitalId}
                    onClose={setActiveSelector}
                />



            </Modal>
        </>
    );
};



export default MappingDetails;


