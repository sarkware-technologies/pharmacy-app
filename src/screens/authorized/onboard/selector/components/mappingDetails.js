import AppText from "../../../../../components/AppText";
import { TouchableOpacity, View, Modal, Animated } from "react-native";
import AccordionCard from "../../../../../components/view/AccordionCard";
import FloatingInput from "../../../../../components/form/floatingInput";
import { memo, useCallback, useState, } from "react";
import OnboardStyle from "../../style/onboardStyle";
import Downarrow from "../../../../../components/icons/downArrow";
import CommonStyle from "../../../../../styles/styles";
import AppView from "../../../../../components/AppView"
import Svg, { Path } from "react-native-svg";
import TextButton from "../../../../../components/view/textButton"
import LabeledSelector from '../../../../../components/form/labeledSelector'
import { resolveCategoryLabel } from '../../utils/helper'
import EntityStyle from "../../style/EntityStyle";

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

const MappingDetails = ({ setValue, isAccordion = false, formData, action, scrollToSection, error, parentData, parentHospitalId }) => {
    const [toggle, setToggle] = useState("open");
    const [customerOption, setCustomerOption] = useState([]);
    const [activeSelector, setActiveSelector] = useState(null);
    const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
    const [showAddHospitalModal, setShowAddHospitalModal] = useState(null);
    const [showAddPharmacyModal, setShowAddPharmacyModal] = useState(false);


    const handleToggle = useCallback(() => {
        setToggle(p => (p === "open" ? "close" : "open"));
    }, []);

    const handleSetValue = (key, value) => {
        setValue?.((prev) => {
            return { ...prev, [key]: value }
        })
    }

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
                                </AppText>

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

                        {parentHospitalId && (
                            <AppView>
                                <AppView marginTop={10} marginBottom={4}>
                                    <AppText fontSize={16}>Parent Group Hospital</AppText>
                                </AppView>

                                <>
                                    <LabeledSelector
                                        value={parentData?.mapping?.hospitals?.find((h) => h.id == parentHospitalId)?.customerName}
                                        placeholder=""
                                         disabled
                                    sufix={false}
                                    />
                                </>
                            </AppView>
                        )}

                        <AppView>
                            <AppView marginTop={10} marginBottom={4}>
                                <AppText fontSize={16} >
                                    {resolveCategoryLabel({
                                        typeId: parentData?.typeId,
                                        categoryId: parentData?.categoryId,
                                        subCategoryId: parentData?.subCategoryId,
                                    })}

                                </AppText>
                            </AppView>

                            <>
                                <LabeledSelector
                                    value={parentData?.generalDetails?.name}
                                    placeholder=""
                                    disabled
                                    sufix={false}
                                />

                            
                            </>


                        </AppView>









                        {formData?.typeId == 2 && (
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
                                        <TextButton onPress={() => addMoreStockiest()} fontWeight={600} fontFamily="regular">+ Add More Stockist</TextButton>
                                    </AppText>
                                )}
                            </AppView>
                        )}



                    </AppView>
                </AccordionCard>
            </AppView>
        </>
    );
};



export default MappingDetails;


