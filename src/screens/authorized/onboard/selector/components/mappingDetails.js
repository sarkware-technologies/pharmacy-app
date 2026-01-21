import AppText from "../../../../../components/AppText";
import { TouchableOpacity, View, Modal, Animated } from "react-native";
import AccordionCard from "../../../../../components/view/AccordionCard";
import { memo, useCallback, useState, } from "react";
import OnboardStyle from "../../style/onboardStyle";
import Downarrow from "../../../../../components/icons/downArrow";
import CommonStyle from "../../../../../styles/styles";
import AppView from "../../../../../components/AppView"
import TextButton from "../../../../../components/view/textButton"
import LabeledSelector from '../../../../../components/form/labeledSelector'
import { resolveCategoryLabel } from '../../utils/helper'
import StockistSection from "../../form/StockistSection";



const MappingDetails = ({ setValue, isAccordion = false, formData, action, scrollToSection, error, parentData, parentHospitalId }) => {
    const [toggle, setToggle] = useState("open");



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










                        <AppView>
                            <AppView gap={10} flexDirection={"row"} alignItems={"center"} marginTop={30}>
                                <AppText fontSize={18}>Stockist Suggestions</AppText>
                                <AppText fontSize={14} color="#909090" fontFamily="regular" fontWeight={400}>(Optional)</AppText>
                            </AppView>
                            <StockistSection formData={formData} setValue={setValue} />


                            {formData?.suggestedDistributors?.length != 4 && (
                                <AppText marginTop={10} marginBottom={20} >
                                    <TextButton onPress={() => addMoreStockiest()} fontWeight={600} fontFamily="regular">+ Add More Stockist</TextButton>
                                </AppText>
                            )}
                        </AppView>




                    </AppView>
                </AccordionCard>
            </AppView>
        </>
    );
};



export default MappingDetails;


