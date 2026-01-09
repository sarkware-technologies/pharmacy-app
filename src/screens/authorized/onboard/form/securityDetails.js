import { AppInput, AppText } from "../../../../components";
import { Platform, TouchableOpacity, View } from "react-native";
import AccordionCard from "../../../../components/view/AccordionCard";
import FloatingInput from "../../../../components/form/floatingInput";
import FloatingDropdown from "../../../../components/form/floatingDropdown";
import { act, useCallback, useEffect, useRef, useState } from "react";
import OnboardStyle from "../style/onboardStyle";
import Downarrow from "../../../../components/icons/downArrow";
import CommonStyle from "../../../../styles/styles";
import { colors } from "../../../../styles/colors";
import FilePicker from "../../../../components/form/fileUpload"
import AppView from "../../../../components/AppView";
import PanAndGST from "./panAndGst"
import { customerAPI } from "../../../../api/customer";
import TextButton from "../../../../components/view/textButton";
import AnimatedContent from "../../../../components/view/AnimatedContent";
import { ErrorMessage } from "../../../../components/view/error";



const OTPForm = ({ onComplete, onResend, autoFill, dummy = false }) => {
    const otpRefs = useRef([]);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [timer, setTimer] = useState(55);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (dummy && autoFill) {
            const otpArray = String(autoFill).split("").slice(0, 4);

            setOtp(otpArray);

            // ✅ Focus last filled input
            requestAnimationFrame(() => {
                const lastIndex = otpArray.length - 1;
                otpRefs.current[lastIndex]?.focus();
            });

            // ✅ Auto submit
            setTimeout(() => {
                onComplete?.(otpArray.join(""));
            }, 400);
        }
    }, [dummy, autoFill]);


    // ⏱ TIMER LOGIC
    useEffect(() => {
        if (timer === 0) {
            setCanResend(true);
            return;
        }

        const interval = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    const resetTimer = () => {
        setTimer(55);
        setCanResend(false);
    };

    const handleChange = (value, index) => {
        const newOtp = [...otp];

        // ⬅ BACKSPACE FIX
        if (value === "") {
            newOtp[index] = "";
            setOtp(newOtp);

            if (index > 0) {
                otpRefs.current[index - 1]?.focus();
            }
            return;
        }

        if (!/^\d$/.test(value)) return;

        newOtp[index] = value;
        setOtp(newOtp);

        if (index < 3) {
            otpRefs.current[index + 1]?.focus();
        }

        if (newOtp.every(d => d !== "")) {
            onComplete?.(newOtp.join(""));
        }
    };

    const handleResend = () => {
        if (!canResend) return;

        resetTimer();
        setOtp(["", "", "", ""]);
        otpRefs.current[0]?.focus();
        onResend?.();
    };

    return (
        <AppView
            flexDirection="row"
            justifyContent="space-between"
            marginVertical={10}
            marginBottom={20}
        >
            {/* OTP INPUTS */}
            <AppView flexDirection="row" gap={10}>
                {[0, 1, 2, 3].map(index => (
                    <AppInput
                        key={index}
                        ref={ref => (otpRefs.current[index] = ref)}
                        style={CommonStyle.otpInput}
                        value={otp[index]}
                        keyboardType="number-pad"
                        maxLength={1}
                        autoFocus={index === 0}
                        onChangeText={value => handleChange(value, index)}
                        textContentType={index === 0 ? "oneTimeCode" : "none"}
                        autoComplete={
                            Platform.OS === "android" ? "sms-otp" : "one-time-code"
                        }
                        importantForAutofill="yes"
                    />
                ))}
            </AppView>

            {/* TIMER + RESEND */}
            <AppView alignItems="flex-end" gap={10}>
                <AppText color="#F7941E">
                    {`0:${timer < 10 ? `0${timer}` : timer} Sec`}
                </AppText>

                <TextButton
                    disabled={!canResend}
                    color={canResend ? "#F7941E" : "#909090"}
                    onPress={handleResend}
                >
                    Resend
                </TextButton>
            </AppView>
        </AppView>
    );
};





const SecurityDetails = ({ setValue, isAccordion = false, formData, action, error, handleSaveDraft }) => {
    const [toggle, setToggle] = useState("open");
    const [otpInProgress, setOtpInProgress] = useState("");

    const handleToggle = useCallback(() => {
        setToggle(p => (p === "open" ? "close" : "open"));
    }, []);


    useEffect(() => {
        if (
            action !== "edit" &&
            (formData?.isEmailVerified === true ||
            formData?.isMobileVerified === true)
        ) {
            handleSaveDraft?.();
        }
    }, [
        formData?.isEmailVerified,
        formData?.isMobileVerified,
        action
    ]);

    const handleSetValue = (key, value) => {
        setValue?.((prev) => {
            return { ...prev, securityDetails: { ...prev?.securityDetails, [key]: value } }
        })
    }

    const secutiryVerfiy = async (type) => {
        if (!formData?.securityDetails?.[type] || formData?.securityDetails?.[type] == "") return;
        try {
            setOtpInProgress({ type })
            const response = await customerAPI.generateOTP({ [type]: formData?.securityDetails?.[type] });
            setOtpInProgress({ type, otp: response?.data?.otp })
        }
        catch (error) {
            console.log(error);
            setOtpInProgress({})
            if (error?.status == 400) {
                ErrorMessage(error);
            }
        }
    }



    const onComplete = async (otp, type, verify) => {
        try {
            const response = await customerAPI.validateOTP(otp, { [type]: formData?.securityDetails?.[type], customerId: formData?.customerId != "" ? formData?.customerId : 1 });
            setOtpInProgress({})
            setValue?.((prev) => {
                return { ...prev, [verify]: true }
            })

        }
        catch (error) {
            console.log(error);
            if (error?.status == 400) {
                ErrorMessage(error);
            }
        }
    }
    const onResend = (type) => {

    }

    return (
        <AppView style={{ marginTop: 20 }}>
            <AccordionCard
                title={
                    <TouchableOpacity
                        onPress={isAccordion ? handleToggle : undefined}
                        activeOpacity={0.8}
                        style={[CommonStyle.SpaceBetween, { paddingRight: 20, paddingBottom: 10 }]}
                    >
                        <AppText style={OnboardStyle.accordionTitle}>Security details <AppText style={OnboardStyle.requiredIcon}>*</AppText> </AppText>
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
                        <FloatingInput
                            disabled={formData?.isMobileVerified}
                            disabledColor="white"
                            keyboardType="number-pad"
                            value={formData?.securityDetails?.mobile} onChangeText={(text) => handleSetValue("mobile", text)} label="Mobile number" isRequired={true}
                            suffix={<TouchableOpacity
                                onPress={() => !formData?.isMobileVerified && secutiryVerfiy("mobile")}
                                style={{ paddingRight: 10 }}><AppText style={{ color: colors.primary }}>{formData?.isMobileVerified ? 'Verified' : 'Verify'} {!formData?.isMobileVerified && <AppText style={[OnboardStyle.requiredIcon, { fontSize: 14 }]}>*</AppText>}</AppText></TouchableOpacity>}
                            maxLength={10}
                            error={error?.securityDetails?.mobile ?? error?.isMobileVerified}
                        />
                        {otpInProgress?.type == 'mobile' && (
                            <AnimatedContent>
                                <OTPForm onComplete={(otp) => onComplete(otp, 'mobile', "isMobileVerified")} onResend={() => onResend("mobile")} dummy={otpInProgress?.otp != null} autoFill={otpInProgress?.otp} />
                            </AnimatedContent>
                        )}
                    </AppView>
                    <AppView>
                        <FloatingInput
                            disabledColor="white"
                            error={error?.securityDetails?.email ?? error?.isEmailVerified}
                            disabled={formData?.isEmailVerified} value={formData?.securityDetails?.email} onChangeText={(text) => handleSetValue("email", text)} label="Email address" isRequired={true}
                            suffix={<TouchableOpacity
                                onPress={() => !formData?.isEmailVerified && secutiryVerfiy("email")}
                                style={{ paddingRight: 10 }}><AppText style={{ color: colors.primary }}>{formData?.isEmailVerified ? 'Verified' : 'Verify'} {!formData?.isEmailVerified && <AppText style={[OnboardStyle.requiredIcon, { fontSize: 14 }]}>*</AppText>}</AppText></TouchableOpacity>}
                        />
                        {otpInProgress?.type == 'email' && (
                            <AnimatedContent>
                                <OTPForm onComplete={(otp) => onComplete(otp, 'email', "isEmailVerified")} onResend={() => onResend("email")} dummy={otpInProgress?.otp != null} autoFill={otpInProgress?.otp} />
                            </AnimatedContent>
                        )}
                    </AppView>
                    {action != 'onboard' && (
                        <PanAndGST error={error} formData={formData} setValue={setValue} action={action} />
                    )}
                </AppView>
            </AccordionCard>
        </AppView>
    );
};

export default SecurityDetails;