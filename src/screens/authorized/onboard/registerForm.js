import { useEffect, useMemo, useRef, useState } from "react";
import { customerAPI } from "../../../api/customer";
import { AppText } from "../../../components";
import LicenseDetails from "./form/LicentceDetails"
import GeneralDetails from "./form/generalDetails"
import MappingDetails from "./form/mappingDetails"
import SecurityDetails from "./form/securityDetails"
import CustomerType from "./form/customerType"
import OnboardStyle from "./style/onboardStyle"
import { colors } from "../../../styles/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import ChevronLeft from "../../../components/icons/ChevronLeft";
import AnimatedContent from "../../../components/view/AnimatedContent";
import AppView from "../../../components/AppView";
import Button from "../../../components/Button";
import { ErrorMessage } from "../../../components/view/error";
import { initialFormData } from "./utils/fieldMeta";
const RegisterForm = () => {
    const navigation = useNavigation();
    const route = useRoute();
    // onboard
    const {
        customerId,
        isStaging,
        action = "register",
    } = route.params || {};

    const [formData, setFormData] = useState(initialFormData)

    useEffect(() => {
        fetchCustomerType();
    }, [])
    const [customerType, setCustomerType] = useState();
    const [licenseList, setLicenseList] = useState([]);

    const scrollRef = useRef(null);

    const sectionRefs = {
        license: useRef(null),
        general: useRef(null),
        mapping: useRef(null),
        security: useRef(null),
    };


    const fetchCustomerType = async () => {
        try {
            const response = await customerAPI.getCustomerTypes();
            setCustomerType(response?.data?.customerType);
        }
        catch (error) {
            console.log(error);
            if (error?.status == 400) {
                ErrorMessage(error);
            }
        }
    };

    const scrollToSection = (type = "top") => {
        if (!scrollRef.current) return;

        if (type === "top") {
            scrollRef.current.scrollTo({ y: 0, animated: true });
            return;
        }

        if (type === "bottom") {
            scrollRef.current.scrollToEnd({ animated: true });
            return;
        }

        const sectionRef = sectionRefs[type];
        if (!sectionRef?.current) return;

        sectionRef.current.measureLayout(
            scrollRef.current,
            (x, y) => {
                scrollRef.current.scrollTo({
                    y: y,
                    animated: true,
                });
            },
            (error) => console.log("measure error", error)
        );
    };



    const builLicense = async (customerType, formData) => {
        try {
            const payload = {}
            let fetch = true
            const findType = customerType?.find((e) => e.id == formData?.typeId);
            if (findType) {
                payload.typeId = findType?.id;
                if (findType?.customerCategories?.length != 0) {
                    fetch = false;
                    const findCategory = findType?.customerCategories?.find((e) => e?.id == formData?.categoryId);
                    if (findCategory) {
                        fetch = true;
                        payload.categoryId = findCategory?.id;
                        if (findCategory?.customerSubcategories?.length != 0) {
                            fetch = false;
                            const findChildCategory = findCategory?.customerSubcategories?.find((e) => e.id == formData?.subCategoryId)
                            if (findChildCategory) {
                                fetch = true;
                                payload.subCategoryId = findChildCategory?.id;
                            }
                        }
                    }
                }
            }
            if (fetch) {
                const getLicense = await customerAPI.getLicenseTypes(payload?.typeId, payload?.categoryId, payload?.subCategoryId);
                setFormData((prev) => {
                    const prevLicenceDetails = prev?.licenceDetails ?? {};
                    const prevLicences = prevLicenceDetails?.licence ?? [];
                    return {
                        ...prev,
                        licenceDetails: {
                            registrationDate:
                                prevLicenceDetails.registrationDate ?? new Date().toISOString(),

                            licence: (getLicense?.data ?? []).map((item) => {
                                const existingLicence = prevLicences.find(
                                    (lic) =>
                                        lic.licenceTypeId === item.id &&
                                        lic.docTypeId === item.docTypeId
                                );

                                return {
                                    licenceTypeId: item.id,
                                    docTypeId: item.docTypeId,
                                    licenceNo: existingLicence?.licenceNo || "",
                                    licenceValidUpto: existingLicence?.licenceValidUpto || "",
                                    hospitalCode: existingLicence?.hospitalCode || "",
                                };
                            }),
                        },
                    };
                });
                requestAnimationFrame(() => {
                    if (action != "onboard") {
                        scrollToSection("license")
                    }
                })
                setLicenseList(getLicense?.data)
            }
            else {
                setLicenseList([])
            }
        }
        catch (error) {
            console.log(error);
            if (error?.status == 400) {
                ErrorMessage(error);
            }
        }
    }
    useEffect(() => {
        setLicenseList([]);
        if (formData?.typeId && customerType) {
            builLicense(customerType, formData);
        }
        else {
            setLicenseList([]);
        }


    }, [customerType, formData?.typeId, formData?.categoryId, formData?.subCategoryId])




    useEffect(() => {
        console.log(formData, 2398423)
    }, [formData])


    const renderForm = [
        { key: "license", component: <LicenseDetails scrollToSection={scrollToSection} licenseList={licenseList} action={action} setValue={setFormData} formData={formData} isAccordion={false} />, show: true, order: 1 },
        { key: "general", component: <GeneralDetails scrollToSection={scrollToSection} action={action} setValue={setFormData} formData={formData} isAccordion={false} />, show: true, order: 2 },
        { key: "security", component: <MappingDetails scrollToSection={scrollToSection} action={action} setValue={setFormData} formData={formData} isAccordion={false} />, show: true, order: 4 },
        { key: "mapping", component: <SecurityDetails scrollToSection={scrollToSection} action={action} setValue={setFormData} formData={formData} isAccordion={false} />, show: true, order: 3 },
    ]


    const sortedForms = useMemo(() => {
        return renderForm
            .filter(item => item.show)
            .sort((a, b) => a.order - b.order);
    }, [renderForm]);

    return (
        <SafeAreaView style={OnboardStyle.container} edges={['top', 'bottom']}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            <AppView style={OnboardStyle.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={OnboardStyle.backButton}
                >
                    <ChevronLeft />
                </TouchableOpacity>
                <AppText style={OnboardStyle.headerTitle}>Registration</AppText>
                <TouchableOpacity
                    style={OnboardStyle.saveDraftButton}
                >
                    {/* {savingDraft ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : ( */}
                    <AppText style={OnboardStyle.saveDraftButtonText}>Save as Draft</AppText>
                    {/* )} */}
                </TouchableOpacity>
            </AppView>

            {/* Selection Section - Always visible at top */}
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={OnboardStyle.scrollContent}
            >
                {customerType != null && action != 'edit' && (
                    <AnimatedContent >
                        <CustomerType action={action} setFormData={setFormData} formData={formData} customerType={customerType} />
                    </AnimatedContent>
                )}
                {customerType != null && licenseList && licenseList.length != 0 && (
                    sortedForms.map((e) => (
                        <AnimatedContent key={e.order}>
                            <View ref={sectionRefs[e.key]}>
                                {e.component}
                            </View>
                        </AnimatedContent>
                    ))


                )}
            </ScrollView>
            <AppView flexDirection={"row"} gap={20} paddingHorizontal={25} paddingVertical={10}>
                <Button style={{ flex: 1, borderColor: "#F7941E", borderWidth: 1, backgroundColor: "white", paddingVertical: 12 }} textStyle={{ color: "#F7941E" }}>
                    Cancel
                </Button>
                <Button style={{ flex: 1, borderColor: "#F7941E", borderWidth: 0, backgroundColor: "#D3D4D6", paddingVertical: 12 }} textStyle={{ color: "white" }}>
                    Register
                </Button>
            </AppView>
        </SafeAreaView>
    )


}


export default RegisterForm;