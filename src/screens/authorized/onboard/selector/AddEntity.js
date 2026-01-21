import { memo, useEffect, useMemo, useRef, useState } from "react";
import { customerAPI } from "../../../../api/customer";
import { AppText } from "../../../../components";
import LicenseDetails from "../form/LicentceDetails"
import GeneralDetails from "../form/generalDetails"
import MappingDetails from "./components/mappingDetails"
import SecurityDetails from "../form/securityDetails"
import CustomerType from "./components/CustomerType"
import EntityStyle from "../style/EntityStyle"
import { colors } from "../../../../styles/colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, ScrollView, StatusBar, TouchableOpacity, View, Modal } from "react-native";
import ChevronLeft from "../../../../components/icons/ChevronLeft";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { buildEntityPayload } from '../utils/buildEntityPayload'

import AnimatedContent from "../../../../components/view/AnimatedContent";
import AppView from "../../../../components/AppView";
import Button from "../../../../components/Button";
import { ErrorMessage } from "../../../../components/view/error";
import { validateForm, converScheme, initialFormData, buildCreatePayload, buildDraftPayload, updateFormData, getChangedValues } from "../utils/fieldMeta";
import validateScheme from "../utils/validateScheme.json";
import { AppToastService } from '../../../../components/AppToast';
import { useCustomerLinkage } from "../../customer/service/useCustomerLinkage";
import XCircle from "../../../../components/icons/XCircle";
import OnboardStyle from "../style/onboardStyle";
import DraftExistsModal from '../../../../components/modals/DraftExistsModal'

const Loading = memo(({ height = "minHeight" }) => {
    return (
        <AppView style={{ [height]: "100%" }} paddingTop={height == 'minHeight' ? 0 : 150} alignItems={"center"} justifyContent={"center"}>
            <ActivityIndicator size={30} color="#F7941E" />
        </AppView>
    )
})


const AddEntity = ({ visible, onClose, title, parentData, onSubmit, entityType, allowMultiple = true, parentHospitalId = null }) => {
    const route = useRoute();
    const [rawScheme, setRawScheme] = useState(validateScheme);

    // onboard
    // const {
    //     customerId,
    //     isStaging,
    //     action = "register",
    // } = route.params || {};

    const action = "register"

    const [transferData, setTransferData] = useState({});
    const [formData, setFormData] = useState(initialFormData);
    const [isFormSubmited, setIsFormSubmited] = useState(true);
    const [loading, setLoading] = useState(false);
    const [customerDetails, setCustomerDetails] = useState({});
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [uploadDocument, setUploadDocument] = useState(action != 'onboard');
    const [selectedCustomers, setSelectedCustomers] = useState(null);



    const [error, setError] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        fetchCustomerType(entityType);
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

    const buildCustomerTypeByEntity = (apiData = [], entityType) => {

        /* ================= DOCTORS ================= */
        if (entityType === 'doctors') {
            const doctor = apiData.find(e => e.code === 'DOCT');

            return {
                typeId: doctor?.id ?? 0,
                categoryId: 0,
                subCategoryId: 0,
                types: [], // ❌ No UI
            };
        }

        /* ================= GROUP HOSPITAL ================= */
        if (entityType === 'groupHospitals') {
            const hospital = apiData.find(e => e.code === 'HOSP');
            const privateCat = hospital?.customerCategories?.find(c => c.code === 'PRI');
            const groupSub = privateCat?.customerSubcategories?.find(
                s => s.code === 'PGH'
            );

            return {
                typeId: hospital?.id ?? 0,
                categoryId: privateCat?.id ?? 0,
                subCategoryId: groupSub?.id ?? 0,
                types: [], // ❌ No UI

            };
        }

        /* ================= PHARMACY ================= */
        if (entityType === 'pharmacy') {
            const pharmacy = apiData.find(e => e.code === 'PCM');

            const types = pharmacy.customerCategories.map(cat => ({
                typeId: pharmacy.id,
                categoryId: cat.id,
                subCategoryId: 0,
                name: cat.name,
                updateKey: 'categoryId'
            }));

            return {
                typeId: pharmacy.id,
                categoryId: types[0]?.categoryId ?? 0,
                types,
            };
        }

        /* ================= HOSPITAL ================= */
        if (entityType === 'hospitals') {
            const hospital = apiData.find(e => e.code === 'HOSP');
            const privateCat = hospital.customerCategories.find(c => c.code === 'PRI');

            const allowed = ['PCL', 'PIH'];

            const types = privateCat.customerSubcategories
                .filter(sub => allowed.includes(sub.code))
                .map(sub => ({
                    typeId: hospital.id,
                    categoryId: privateCat.id,
                    subCategoryId: sub.id,
                    name: sub.name,
                    updateKey: 'subCategoryId'
                }));

            return {
                typeId: hospital.id,
                categoryId: privateCat.id,
                types,
            };
        }

        return { types: [] };
    };

    const fetchCustomerType = async (entityType) => {
        try {
            setLoading(true);

            const response = await customerAPI.getCustomerTypes();
            const apiData = response?.data?.customerType || [];

            const formattedData = buildCustomerTypeByEntity(apiData, entityType);

            // store for UI rendering
            setCustomerType(formattedData);

            // 🔥 ALWAYS fill IDs (UI or not)
            setFormData(prev => ({
                ...prev,
                typeId: formattedData?.typeId ?? prev.typeId,
                categoryId: formattedData?.categoryId ?? 0,
                subCategoryId:
                    formattedData?.subCategoryId ??
                    formattedData?.types?.[0]?.subCategoryId ??
                    0,
            }));

        } catch (error) {
            if (error?.status === 400) {
                ErrorMessage(error);
            }
        } finally {
            setLoading(false);
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

    const buildLicense = async (formData) => {
        try {
            setLoading(true);

            const payload = {
                typeId: formData?.typeId,
                categoryId: formData?.categoryId || undefined,
                subCategoryId: formData?.subCategoryId || undefined,
            };

            // ❌ If no typeId, do nothing
            if (!payload.typeId) {
                setLicenseList([]);
                return;
            }

            const getLicense = await customerAPI.getLicenseTypes(
                payload.typeId,
                payload.categoryId,
                payload.subCategoryId
            );

            setFormData(prev => {
                const prevLicenceDetails = prev?.licenceDetails ?? {};
                const prevLicences = prevLicenceDetails?.licence ?? [];

                return {
                    ...prev,
                    licenceDetails: {
                        registrationDate:
                            prevLicenceDetails.registrationDate ?? new Date().toISOString(),

                        licence: (getLicense?.data ?? []).map(item => {
                            const existingLicence = prevLicences.find(
                                lic =>
                                    lic.licenceTypeId === item.id &&
                                    lic.docTypeId === item.docTypeId
                            );

                            return {
                                code: item.code,
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

            setLicenseList(getLicense?.data ?? []);

            requestAnimationFrame(() => {
                if (action !== "onboard") {
                    scrollToSection("license");
                }
            });

        } catch (error) {
            console.log(error);
            if (error?.status === 400) {
                ErrorMessage(error);
            }
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        setLicenseList([]);
        setIsFormSubmited(false);
        setError({});
        setIsFormValid(false);
        if (formData?.typeId) {
            buildLicense(formData);
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
        const payload = {
            ...buildCreatePayload(formData),
            customerGroupId: 1,
            isChildCustomer: true,
        };

        try {
            const response = await customerAPI.createCustomer(payload);
            if (response?.success) {
                const newEntity = [{
                    id: response?.data?.data?.stgCustomerId,
                    customerName: response?.data?.data?.generalDetails?.name,
                    isNew: true,
                    isActive: true
                }];

                onSubmit(entityType, newEntity, parentHospitalId, allowMultiple);
                AppToastService.show(response?.message, "success", "created");
                onClose?.();
            }
        } catch (err) {
            AppToastService.show(err?.message ?? "Error while creationg customer", "error", "Error");
        }
    };

     const handleDeleteDraft = async () => {
        const draftCustomer =
            transferData?.licenseResponse?.conflicts?.find(
                c => c?.existingCustomerId && c?.isOwnDraft === true
            );

        if (!draftCustomer?.existingCustomerId) {
            return;
        }

        try {
            const response = await customerAPI.deleteDraft({
                customerId: draftCustomer.existingCustomerId,
            });

            if (response?.success) {
                AppToastService.show(
                    response?.data?.message,
                    "success",
                    "Draft Delete"
                );
                setShowDraftModal(false);
            }
        } catch (err) {
            console.log(err);
        }
    };



    useEffect((e) => {
        console.log(error, 3249823468)
    }, [error])

    useEffect(() => {
        setTransferData({})
    }, [formData.typeId, formData.categoryId, formData.subCategoryId])


    useEffect(() => {
        const fetchCustomerMapping = async () => {
            const customerData =
                transferData?.licenseResponse?.conflicts?.find(
                    c =>
                        c?.existingCustomerId &&
                        c?.isStaging !== undefined &&
                        !c?.isOwnDraft
                );

            if (!customerData) return;

            const payload = buildEntityPayload({
                typeId: parentData?.typeId,
                categoryId: parentData?.categoryId,
                subCategoryId: parentData?.subCategoryId,
                entity: entityType,
                customerIds: [customerData.existingCustomerId]
            });

            try {
                const res = await customerAPI.getCustomersListMapping(payload);
                const customers = res?.customers || [];

                if (customers.length !== 0) {
                    setSelectedCustomers(customers[0]);
                }

            } catch (err) {
                console.log("Customer mapping API failed", err);
            }
        };

        fetchCustomerMapping();
    }, [transferData?.licenseResponse]);

    const handleSelectCustomer = () => {
        const newEntity = [
            {
                id: selectedCustomers?.stgCustomerId ?? selectedCustomers?.customerId,
                customerName: selectedCustomers?.customerName,
                isNew: false,
                isActive: true
            }
        ];

        onSubmit(entityType, newEntity, parentHospitalId, allowMultiple);
        AppToastService.show("Customer Selected", "success", "Selected");
        onClose?.();
    };

    const renderForm = [
        { key: "license", component: <LicenseDetails setTransferData={setTransferData} transferData={transferData} error={error} scrollToSection={scrollToSection} licenseList={licenseList} action={action} setValue={setFormData} formData={formData} isAccordion={action == 'onboard'} formType={"child"} />, show: uploadDocument, order: 1 },
        { key: "general", component: <GeneralDetails setTransferData={setTransferData} transferData={transferData} error={error} scrollToSection={scrollToSection} action={action} setValue={setFormData} formData={formData} isAccordion={action == 'onboard'} />, show: true, order: 2 },
        { key: "security", component: <SecurityDetails setTransferData={setTransferData} transferData={transferData} error={error} scrollToSection={scrollToSection} action={action} setValue={setFormData} formData={formData} isAccordion={action == 'onboard'} />, show: true, order: 3 },
        { key: "mapping", component: <MappingDetails error={error} scrollToSection={scrollToSection} action={action} setValue={setFormData} formData={formData} isAccordion={action == 'onboard'} parentData={parentData} parentHospitalId={parentHospitalId} />, show: true, order: 4 },
    ]


    const sortedForms = useMemo(() => {
        return renderForm
            .filter(item => item.show)
            .sort((a, b) => a.order - b.order);
    }, [renderForm]);

    const isDirty = useMemo(() => Object.entries(getChangedValues(customerDetails ?? {}, formData) ?? {}).length == 0);

      // owndraft popup visibility check
    const hasOwnDraftConflict =
        transferData?.licenseResponse?.conflicts?.some(
            c => c?.existingCustomerId && c?.isOwnDraft === true
        );

    useEffect(() => {
        if (hasOwnDraftConflict) {
            setShowDraftModal(true);
        }
    }, [hasOwnDraftConflict]);


    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => onClose()}
        >

            <SafeAreaView style={[EntityStyle.modalContainer]}
            >
                <View style={EntityStyle.modalHeader}>
                    <TouchableOpacity onPress={() => onClose()} style={OnboardStyle.closeButton}>
                        <XCircle color="#2b2b2b" />
                    </TouchableOpacity>
                    <AppText style={EntityStyle.modalTitle}>Add {entityType == "groupHospitals" ? " Group Hospital" : title} Account {parentHospitalId && <AppText>(Link Hospital)</AppText>}</AppText>
                </View>

                <ScrollView style={EntityStyle.modalContent} showsVerticalScrollIndicator={false}>


                    {customerType?.types?.length > 0 && (
                        <AnimatedContent>
                            <CustomerType
                                action={action}
                                setFormData={setFormData}
                                formData={formData}
                                customerType={customerType}
                            />
                        </AnimatedContent>
                    )}

                    {licenseList && licenseList.length != 0 && (
                        sortedForms.map((e) => (
                            <AnimatedContent key={e.order}>
                                <View ref={sectionRefs[e.key]} >
                                    {e.component}
                                </View>
                            </AnimatedContent>
                        ))


                    )}
                    {loading && (
                        <Loading height={'maxHeight'} />
                    )}


                </ScrollView>


                {licenseList?.length != 0 && !loading && (
                    <AppView>

                        <AppView flexDirection={"row"} gap={20} paddingHorizontal={25} paddingVertical={10}>
                            <Button onPress={() => onClose?.()} style={{ flex: 1, borderColor: "#F7941E", borderWidth: 1, backgroundColor: "white", paddingVertical: 12 }} textStyle={{ color: "#F7941E" }}>
                                Cancel
                            </Button>
                            {/* <Button onPress={() => handleRegister()} style={(!isFormValid || isDirty) ? { flex: 1, backgroundColor: "#D3D4D6", paddingVertical: 12 } : { flex: 1, backgroundColor: "#F7941E", paddingVertical: 12 }} textStyle={{ color: "white" }}>
                                {action == 'register' ? 'Submit' : 'Update'}
                            </Button> */}

                            <Button
                                onPress={() => {
                                    if (selectedCustomers) {
                                        handleSelectCustomer();
                                    } else {
                                        handleRegister();
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    backgroundColor: selectedCustomers
                                        ? "#F7941E" 
                                        : (!isFormValid || isDirty)
                                            ? "#D3D4D6"
                                            : "#F7941E",
                                    paddingVertical: 12
                                }}
                                textStyle={{ color: "white" }}
                                disabled={
                                    selectedCustomers
                                        ? false
                                        : (!isFormValid || isDirty)
                                }
                            >
                                {selectedCustomers
                                    ? "Select"
                                    : action === "register"
                                        ? "Submit"
                                        : "Update"}
                            </Button>


                        </AppView>

                    </AppView>
                )}

                 <DraftExistsModal
                visible={showDraftModal}
                onConfirm={() => handleDeleteDraft()}
                onClose={() => {
                    setShowDraftModal(false)
                    onClose?.();
                }}
            />


            </SafeAreaView>

        </Modal>
    )


}


export default AddEntity;