import { AppInput, AppText } from "../../../../components";
import { TouchableOpacity, View } from "react-native";
import AccordionCard from "../../../../components/view/AccordionCard";
import FloatingInput from "../../../../components/form/floatingInput";
import FloatingDropdown from "../../../../components/form/floatingDropdown";
import Icon from 'react-native-vector-icons/Ionicons';
import { useCallback, useEffect, useState } from "react";
import OnboardStyle from "../style/onboardStyle";
import Downarrow from "../../../../components/icons/downArrow";
import CommonStyle from "../../../../styles/styles";
import MapLocator from "../../../../components/icons/MapLocator";
import { colors } from "../../../../styles/colors";
import AppView from "../../../../components/AppView";
import { customerAPI } from "../../../../api/customer";
import LeafletMapModal from "../../../../components/LeafletMapModal";
import { useSelector } from "react-redux";
import { ErrorMessage } from "../../../../components/view/error";

const GeneralDetails = ({ License, setValue, isAccordion = false, formData, action }) => {
    const [toggle, setToggle] = useState("open");
    const loggedInUser = useSelector(state => state.auth.user);

    const handleToggle = useCallback(() => {
        setToggle(p => (p === "open" ? "close" : "open"));
    }, []);

    const handleSetValue = (key, value) => {
        setValue?.((prev) => {
            return { ...prev, generalDetails: { ...prev?.generalDetails, [key]: value } }
        })
    }


    const [areaOptions, setAreaOptions] = useState([]);
    const [cityOptions, setCityOptions] = useState([]);
    const [stateOptions, setStateOptions] = useState([]);

    const [leafletMapModal, setLeafletMapModal] = useState(false);

    const [stationCodeOptions, setStationCodeOptions] = useState([]);

    useEffect(() => {
        setStationCodeOptions(loggedInUser?.userDetails?.stationCodes?.map((item) => ({
            id: item.stationCode,
            name: item.stationCode,
        })) ?? [])
    }, [loggedInUser])


    useEffect(() => {
        console.log(formData?.generalDetails?.pincode,293746236)
        if (formData?.generalDetails?.pincode && String(formData?.generalDetails?.pincode)?.length == 6) {
            fetchCitybyPincode(String(formData?.generalDetails?.pincode))
        }
        else {
            setAreaOptions([]);
            setCityOptions([]);
            setStateOptions([]);
            setValue?.((prev) => {
                return { ...prev, generalDetails: { ...prev?.generalDetails, area: "", areaId: "", stateId: "", cityId: "" } }
            })
        }
    }, [formData?.generalDetails?.pincode])

    const fetchCitybyPincode = async (pincode) => {
        try {
            const response = await customerAPI.getCityByPin(pincode);
            const data = response?.data;
            const area = data?.cities?.[0]?.area?.map((e) => ({ id: e?.value, name: e?.label }));
            const city = data?.cities?.map((e) => ({ id: e?.value, name: e?.label }));
            const state = data?.states?.map((e) => ({ id: e?.value, name: e?.label }));
            setValue?.((prev) => {
                return { ...prev, generalDetails: { ...prev?.generalDetails, area: area?.[0]?.name, areaId: area?.[0]?.id, stateId: state?.[0]?.id } }
            })
            setAreaOptions(area)
            setCityOptions(city)
            setStateOptions(state)
        }
        catch (error) {
            console.log(error);
            if (error?.status == 400) {
                ErrorMessage(error);
            }
        }
    }

    const handleLocationSelect = async (value) => {
        try {
            const addressParts = value.address
                .split(',')
                .map(part => part.trim());
            const extractedPincode = value.pincode || '';
            const filteredParts = addressParts.filter(part => {
                return (
                    !part.match(/^\d{6}$/) && part.toLowerCase() !== 'india'
                );
            });

            setValue?.((prev) => {
                return {
                    ...prev, generalDetails: {
                        ...prev?.generalDetails,
                        address1: filteredParts?.[0] ?? '',
                        address2: filteredParts?.[1] ?? '',
                        address3: filteredParts?.[2] ?? '',
                        address4: filteredParts.slice(3).join(', ') || '',
                        pincode: extractedPincode
                    }
                }
            })


        }
        catch (error) {
            console.log(error);
            if (error?.status == 400) {
                ErrorMessage(error);
            }
        }

    }


    const getPlaceholder = useCallback(
        (type) => {
            const { typeId, categoryId, subCategoryId } = formData || {};

            if (type === "name") {
                if (typeId === 1)
                    return "Name of the Pharmacy";
                if (typeId === 2 && ([1, 2, 3].includes(subCategoryId)))
                    return typeId === 2 && subCategoryId == 3 ? 'Hospital name' : "Enter hospital name";
                if (typeId === 2 && categoryId == 5)
                    return "Hospital name";
                if (typeId === 3)
                    return "Name of the Doctor";
            }

            if (type === "shortName") {
                if (typeId === 1)
                    return "Enter OP, IP, Cathlab etc";
                if (typeId === 2)
                    return "Enter short name";
            }

            return "";
        },
        [formData]
    );



    return (
        <AppView style={{ marginTop: 20 }}>
            <AccordionCard
                title={
                    <TouchableOpacity
                        onPress={isAccordion ? handleToggle : undefined}
                        activeOpacity={0.8}
                        style={[CommonStyle.SpaceBetween, { paddingRight: 20, paddingBottom: 10 }]}
                    >
                        <AppText style={OnboardStyle.accordionTitle}>General details <AppText style={OnboardStyle.requiredIcon}>*</AppText> </AppText>
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
                    <AppView>
                        <FloatingInput value={formData?.generalDetails?.name} onChangeText={(text) => handleSetValue("name", text)} label={getPlaceholder("name")} isRequired={true} />
                    </AppView>
                    {formData?.typeId != 3 && (
                        <AppView>
                            <FloatingInput value={formData?.generalDetails?.shortName} onChangeText={(text) => handleSetValue("shortName", text)} label={getPlaceholder("shortName")} isRequired={true} />
                        </AppView>
                    )}
                    {formData?.typeId == 3 && (
                        <AppView>
                            <FloatingInput value={formData?.generalDetails?.specialist} onChangeText={(text) => handleSetValue("specialist", text)} label={"Speciality"} isRequired={true} />
                        </AppView>
                    )}
                    {formData?.typeId == 3 && (
                        <AppView>
                            <FloatingInput value={formData?.generalDetails?.clinicName} onChangeText={(text) => handleSetValue("clinicName", text)} label={"Clinic name"} isRequired={true} />
                        </AppView>
                    )}

                    <AppView>
                        <FloatingDropdown
                            selected={formData?.stationCode}
                            label="Station"
                            isRequired={true}
                            searchTitle="Station Code"
                            onSelect={(e) => setValue?.((prev) => {
                                return { ...prev, stationCode: e?.id }
                            })}
                            options={stationCodeOptions}
                        />
                    </AppView>
                    <AppView>
                        <FloatingInput

                            value={formData?.generalDetails?.address1} onChangeText={(text) => handleSetValue("address1", text)} label="Address 1" isRequired={true}
                            suffix={<TouchableOpacity
                                activeOpacity={0.7}
                                style={{ paddingRight: 5 }}
                                onPress={() => setLeafletMapModal(true)}
                            >
                                <MapLocator width={24} height={24} color={colors.primary} />
                            </TouchableOpacity>}
                        />
                    </AppView>
                    <AppView>
                        <FloatingInput value={formData?.generalDetails?.address2} onChangeText={(text) => handleSetValue("address2", text)} label="Address 2" isRequired={true} />
                    </AppView>
                    <AppView>
                        <FloatingInput value={formData?.generalDetails?.address3} onChangeText={(text) => handleSetValue("address3", text)} label="Address 3" isRequired={true} />
                    </AppView>
                    <AppView>
                        <FloatingInput value={formData?.generalDetails?.address4} onChangeText={(text) => handleSetValue("address4", text)} label="Address 4" isRequired={true} />
                    </AppView>
                    <AppView>
                        <FloatingInput keyboardType="number-pad" maxLength={6} value={String(formData?.generalDetails?.pincode)} onChangeText={(text) => handleSetValue("pincode", text)} label="Pincode" isRequired={true} />
                    </AppView>
                    <AppView>


                        <FloatingDropdown
                            selected={formData?.generalDetails?.areaId}
                            label="Area"
                            isRequired={true}
                            searchTitle="Area"
                            onSelect={(e) => {
                                setValue?.((prev) => {
                                    return { ...prev, generalDetails: { ...prev?.generalDetails, areaId: e?.id, area: e?.name } }
                                })
                            }}
                            options={areaOptions}
                        />
                    </AppView>
                    <AppView>
                        <FloatingDropdown
                            selected={formData?.generalDetails?.cityId}
                            label="City"
                            isRequired={true}
                            searchTitle="City"
                            onSelect={(e) => handleSetValue("cityId", e?.id)}
                            options={cityOptions}
                            onAddNew={() => { }}
                        />
                    </AppView>
                    <AppView>
                        <FloatingDropdown
                            selected={formData?.generalDetails?.stateId}
                            label="State"
                            isRequired={true}
                            searchTitle="State"
                            onSelect={(e) => handleSetValue("stateId", e?.id)}
                            options={stateOptions}
                        />
                    </AppView>
                </AppView>
            </AccordionCard>

            <LeafletMapModal
                visible={leafletMapModal}
                onClose={() => setLeafletMapModal(false)}
                onSelectLocation={handleLocationSelect}
                initialLocation={null}
            />
        </AppView>
    );
};

export default GeneralDetails;
