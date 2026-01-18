import { memo, useEffect, useMemo, useRef, useState } from "react";
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
import { ActivityIndicator, ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import ChevronLeft from "../../../components/icons/ChevronLeft";
import AnimatedContent from "../../../components/view/AnimatedContent";
import AppView from "../../../components/AppView";
import Button from "../../../components/Button";
import { ErrorMessage } from "../../../components/view/error";
import { validateForm, converScheme, initialFormData, buildCreatePayload, buildDraftPayload, updateFormData, getChangedValues } from "./utils/fieldMeta";
import validateScheme from "./utils/validateScheme.json";
import { AppToastService } from '../../../components/AppToast';
import { useCustomerLinkage } from "../customer/service/useCustomerLinkage";

import Svg, { Path } from "react-native-svg";

const Loading = memo(({ height = "minHeight" }) => {
    return (
        <AppView style={{ [height]: "100%" }} paddingTop={height == 'minHeight' ? 0 : 150} alignItems={"center"} justifyContent={"center"}>
            <ActivityIndicator size={30} color="#F7941E" />
        </AppView>
    )
})


const RegisterForm = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const [rawScheme, setRawScheme] = useState(validateScheme);

    // onboard
    const {
        customerId,
        isStaging,
        action = "register",
    } = route.params || {};

    const [transferData, setTransferData] = useState({});



    const [formData, setFormData] = useState(initialFormData);
    const [isFormSubmited, setIsFormSubmited] = useState(true);
    const [loading, setLoading] = useState(false);
    const [customerApiresponse, setCustomerApiresponse] = useState({});
    const [customerDetails, setCustomerDetails] = useState({});
    const [draftValue, setDraftValue] = useState({});

    const [uploadDocument, setUploadDocument] = useState(action != 'onboard');


    const {
        data,
        draft,
        hasDraft,
        isLoading,
    } = useCustomerLinkage({
        customerId,
        isStaging,
    });
    useEffect(() => {
        if (data && !isLoading) {
            setCustomerApiresponse(data);
            setTransferData((prev) => ({ ...prev, ...(data?.generalDetails?.cityId && { cityOptions: [{ id: data?.generalDetails?.cityId, name: data?.generalDetails?.cityName }] }) }))
            setCustomerDetails(updateFormData(data, action));
            setFormData(updateFormData(data, action));
        }
        setDraftValue(draft ?? {});
        console.log(data, draft, hasDraft, isLoading, 2938749283)

    }, [data, isLoading])

    const [error, setError] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

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
            setLoading(true);
            const response = await customerAPI.getCustomerTypes();
            setCustomerType(response?.data?.customerType);
        }
        catch (error) {
            console.log(error);
            if (error?.status == 400) {
                ErrorMessage(error);
            }
        }
        finally {
            setLoading(false)
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
            setLoading(true);
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
                                    code: item?.code,
                                    docTypeId: item.docTypeId,
                                    hospitalCode: existingLicence?.hospitalCode || "",
                                    licenceNo: existingLicence?.licenceNo || "",
                                    licenceTypeId: item.id,
                                    licenceValidUpto: existingLicence?.licenceValidUpto || "",
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
        finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        setLicenseList([]);
        setIsFormSubmited(false);
        setError({});
        setIsFormValid(false);
        if (formData?.typeId && customerType) {
            builLicense(customerType, formData);
        }
        else {
            setLicenseList([]);
        }

    }, [customerType, formData?.typeId, formData?.categoryId, formData?.subCategoryId])


    const scheme = useMemo(() => {
        if (!rawScheme) return null;
        return converScheme(rawScheme, formData?.typeId, formData?.categoryId, formData?.subCategoryId, formData?.licenceDetails, uploadDocument);
    }, [rawScheme, formData?.typeId, formData?.categoryId, formData?.subCategoryId, formData?.licenceDetails, uploadDocument]);



    const runValidation = async (submitted) => {
        const result = await validateForm(formData, scheme);
        setIsFormValid(result.isValid);
        if (submitted) {
            setError(result.errors);
        }
        else {
            setError({});
        }
    };

    useEffect(() => {
        runValidation(isFormSubmited);
    }, [formData, scheme, isFormSubmited]);


    useEffect(() => {
        console.log(formData, "*****formData")
        console.log(customerDetails, "*****customerDetails")
        console.log(getChangedValues(customerDetails ?? {}, formData), 928347293)
    }, [formData, customerDetails])

    const handleRegister = async () => {
        setIsFormSubmited(true);
        const result = await validateForm(formData, scheme);
        setIsFormValid(result.isValid);
        setError(result.errors);
        if (result?.errors && !result.isValid) {
            if (result?.errors?.licenceDetails) {
                scrollToSection("license")
            }
            else if (result?.errors?.generalDetails) {
                scrollToSection("general")
            }
            else if (result?.errors?.securityDetails || result?.errors?.isPanVerified || result?.errors?.isMobileVerified || result?.errors?.isEmailVerified) {
                scrollToSection("security")
            }
            else {
                scrollToSection("top")
            }

        }
        if (!result.isValid) return;

        const payload = buildCreatePayload(formData);


        try {
            if (customerApiresponse?.instance?.stepInstances) {
                const step = customerApiresponse?.instance?.stepInstances?.[0];
                if (step?.approverType == "INITIATOR") {
                    await customerAPI?.workflowAction(customerApiresponse?.instance?.workflowInstance?.id, {
                        action: "MODIFY",
                        parallelGroup: step?.parallelGroup,
                        stepOrder: step?.stepOrder,
                        actorId: Number(step?.assignedUserId),
                        dataChanges: { ...draftValue, ...getChangedValues(customerDetails, formData) },
                    })
                    AppToastService.show("Customer Edit Success", "success", "Edited");
                    navigation.goBack();
                }
                else {
                    const draftEditPayload = {
                        stepOrder: step?.stepOrder || 1,
                        parallelGroup: step?.parallelGroup,
                        comments: '',
                        actorId: step?.assignedUserId,
                        dataChanges: { ...draftValue, ...getChangedValues(customerDetails, formData) },
                    };
                    const saveDraft = await customerAPI.draftEdit(
                        customerApiresponse?.instance?.workflowInstance?.id,
                        draftEditPayload
                    );
                    AppToastService.show("Customer Edit Success", "success", "Edited");
                    navigation.goBack();
                }
            }
            else {
                const response = await customerAPI.createCustomer(payload);
                if (response?.success) {
                    AppToastService.show(response?.message, "success", "created");
                    navigation.navigate('RegistrationSuccess', {});

                }
            }
        } catch (err) {
            AppToastService.show(err?.message ?? "Error while creationg customer", "error", "Error");
        }
    };



    const handleuploadDocument = async () => {
        setIsFormSubmited(true);
        const result = await validateForm(formData, scheme);
        setIsFormValid(result.isValid);
        setError(result.errors);
        if (result?.errors && !result.isValid) {
            if (result?.errors?.licenceDetails) {
                scrollToSection("license")
            }
            else if (result?.errors?.generalDetails) {
                scrollToSection("general")
            }
            else if (result?.errors?.securityDetails || result?.errors?.isPanVerified || result?.errors?.isMobileVerified || result?.errors?.isEmailVerified) {
                scrollToSection("security")
            }
            else {
                scrollToSection("top")
            }

        }
        if (!result.isValid) return;
        if (uploadDocument) {
            handleRegister();
            return;
        }
        setIsFormSubmited(false);
        setUploadDocument(true);
        setTimeout(() => {
            scrollToSection("license")
        })


    }
    const handleSaveDraft = async (data) => {
        const payload = buildDraftPayload(data);

        try {
            const response = await customerAPI.saveCustomerDraft(payload);
            if (response?.success) {
                AppToastService.show(response?.message, "success", "Draft Saved");

                setFormData(prev => ({
                    ...prev,
                    stgCustomerId: response?.data?.data?.stgCustomerId,
                }));
            }

        } catch (err) {
            AppToastService.show(err?.message, "error", "Error");
        }
    };

    const handleSendRequest = async () => {
        if (transferData?.licenseResponse?.conflicts?.length == 0) {
            return
        }

        const customerData = transferData?.licenseResponse?.conflicts?.[0]
        try {
            const response = await customerAPI.sendRequest(customerData?.existingCustomerId, customerData?.isStaging,);
            console.log(response);

            if (response?.success) {
                AppToastService.show("Your request for adding customer sent successfully!", "success", "Request Sent");
                navigation.goBack();
            }

        } catch (err) {
            console.log(err)
        }
    };


    useEffect((e) => {
        console.log(error, 3249823468)
    }, [error])

    useEffect(() => {
        setTransferData({})
    }, [formData.typeId, formData.categoryId, formData.subCategoryId])



    console.log(transferData, 67676767);
    const renderForm = [
        { key: "license", component: <LicenseDetails setTransferData={setTransferData} transferData={transferData} error={error} scrollToSection={scrollToSection} licenseList={licenseList} action={action} setValue={setFormData} formData={formData} isAccordion={action == 'onboard'} />, show: uploadDocument, order: action == 'onboard' ? 5 : 1 },
        { key: "general", component: <GeneralDetails setTransferData={setTransferData} transferData={transferData} error={error} scrollToSection={scrollToSection} action={action} setValue={setFormData} formData={formData} isAccordion={action == 'onboard'} />, show: true, order: 2 },
        { key: "security", component: <SecurityDetails setTransferData={setTransferData} transferData={transferData} error={error} scrollToSection={scrollToSection} action={action} setValue={setFormData} formData={formData} isAccordion={action == 'onboard'} handleSaveDraft={handleSaveDraft} />, show: true, order: 3 },
        { key: "mapping", component: <MappingDetails setTransferData={setTransferData} transferData={transferData} error={error} scrollToSection={scrollToSection} action={action} setValue={setFormData} formData={formData} isAccordion={action == 'onboard'} />, show: true, order: 4 },
    ]


    const sortedForms = useMemo(() => {
        return renderForm
            .filter(item => item.show)
            .sort((a, b) => a.order - b.order);
    }, [renderForm]);


    const title = useMemo(() => {
        switch (action) {
            case "register":
                return "Registration";
            case "edit":
                return "Edit";
            case "onboard":
                return "Registration-Existing";
            default:
                return "Registration";
        }
    }, [action]);


    const isDirty = useMemo(() => Object.entries(getChangedValues(customerDetails ?? {}, formData) ?? {}).length == 0)

    const conflicts = transferData?.licenseResponse?.conflicts ?? [];

    const showSendRequest =
        conflicts.some(
            c =>
                c.existingCustomerId &&
                c.isStaging !== undefined
        ) &&
        !conflicts.some(c => c.isOwnDraft);

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
                <AppText style={OnboardStyle.headerTitle}>
                    {title}
                </AppText>


                {(licenseList?.length > 0 && !isLoading && !customerApiresponse?.instance?.stepInstances) &&
                    <TouchableOpacity
                        style={OnboardStyle.saveDraftButton}
                        onPress={() => handleSaveDraft(formData)}
                    >

                        <AppText style={OnboardStyle.saveDraftButtonText}>Save as Draft</AppText>

                    </TouchableOpacity>
                }

            </AppView>

            {/* Selection Section - Always visible at top */}
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={OnboardStyle.scrollContent}
            >
                {isLoading && (
                    <Loading />
                )}
                {!isLoading && (
                    <>
                        {customerType != null && action != 'edit' && (
                            <AnimatedContent >
                                <CustomerType action={action} setFormData={setFormData} formData={formData} customerType={customerType} />
                            </AnimatedContent>
                        )}
                        {loading && (
                            <Loading height={!customerType || action == 'edit' ? 'minHeight' : 'maxHeight'} />
                        )}

                        {showSendRequest &&
                            <AppView style={{ padding: 20 }} >
                                <AppView style={{ paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10 }} flexDirection={"row"} alignItems={"center"} backgroundColor={"#FFE2E2"} >
                                    <Svg style={{ marginRight: 5 }} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <Path d="M5.83333 11.6667C2.61158 11.6667 0 9.05508 0 5.83333C0 2.61158 2.61158 0 5.83333 0C9.05508 0 11.6667 2.61217 11.6667 5.83333C11.6667 9.0545 9.05508 11.6667 5.83333 11.6667ZM5.83333 2.91667C5.67862 2.91667 5.53025 2.97812 5.42085 3.08752C5.31146 3.19692 5.25 3.34529 5.25 3.5V6.41667C5.25 6.57138 5.31146 6.71975 5.42085 6.82915C5.53025 6.93854 5.67862 7 5.83333 7C5.98804 7 6.13642 6.93854 6.24581 6.82915C6.35521 6.71975 6.41667 6.57138 6.41667 6.41667V3.5C6.41667 3.34529 6.35521 3.19692 6.24581 3.08752C6.13642 2.97812 5.98804 2.91667 5.83333 2.91667ZM5.83333 8.75C5.98804 8.75 6.13642 8.68854 6.24581 8.57915C6.35521 8.46975 6.41667 8.32138 6.41667 8.16667C6.41667 8.01196 6.35521 7.86358 6.24581 7.75419C6.13642 7.64479 5.98804 7.58333 5.83333 7.58333C5.67862 7.58333 5.53025 7.64479 5.42085 7.75419C5.31146 7.86358 5.25 8.01196 5.25 8.16667C5.25 8.32138 5.31146 8.46975 5.42085 8.57915C5.53025 8.68854 5.67862 8.75 5.83333 8.75Z" fill="#E94346" />
                                    </Svg>
                                    <AppText color={"#E94346"}>Customer has been already registered </AppText>
                                </AppView>
                            </AppView>}


                        {customerType != null && licenseList && licenseList.length != 0 && (
                            sortedForms.map((e) => (
                                <AnimatedContent key={e.order}>
                                    <View ref={sectionRefs[e.key]}>
                                        {e.component}
                                    </View>
                                </AnimatedContent>
                            ))


                        )}
                    </>
                )}
            </ScrollView>

            {(licenseList?.length > 0 && !isLoading) &&
                <AppView>
                    {action == 'onboard' ?
                        (<AppView flexDirection={"row"} gap={20} paddingHorizontal={25} paddingVertical={10}>
                            <Button style={{ flex: 1, borderColor: "#F7941E", borderWidth: 1, backgroundColor: "white", paddingVertical: 12 }} textStyle={{ color: "#F7941E", fontSize: 15 }}>
                                Assign to Customer
                            </Button>
                            <Button onPress={() => handleuploadDocument()} style={(!isFormValid || isDirty) ? { flex: 1, backgroundColor: "#D3D4D6", paddingVertical: 6 } : { flex: 1, backgroundColor: "#F7941E", paddingVertical: 12 }} textStyle={{ color: "white", fontSize: 15 }}>
                                {uploadDocument ? 'Register' : 'Upload Dcouments'}
                            </Button>
                        </AppView>) :
                        (<AppView flexDirection={"row"} gap={20} paddingHorizontal={25} paddingVertical={10}>
                            <Button style={{ flex: 1, borderColor: "#F7941E", borderWidth: 1, backgroundColor: "white", paddingVertical: 12 }} textStyle={{ color: "#F7941E" }}>
                                Cancel
                            </Button>


                            {showSendRequest ? (
                                <Button
                                    onPress={handleSendRequest}
                                    style={{
                                        flex: 1,
                                        backgroundColor: "#F7941E",
                                        paddingVertical: 12
                                    }}
                                    textStyle={{ color: "white" }}
                                >
                                    Send Request
                                </Button>
                            ) : (
                                <Button
                                    onPress={handleRegister}
                                    style={{
                                        flex: 1,
                                        backgroundColor:
                                            !isFormValid || isDirty ? "#D3D4D6" : "#F7941E",
                                        paddingVertical: 12
                                    }}
                                    textStyle={{ color: "white" }}
                                >
                                    {action === 'register' ? 'Register' : 'Update'}
                                </Button>
                            )}




                        </AppView>)
                    }
                </AppView>
            }

        </SafeAreaView>
    )


}


export default RegisterForm;