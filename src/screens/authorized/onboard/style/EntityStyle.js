import { StyleSheet } from "react-native";
import { colors } from "../../../../styles/colors";
import CommonStyle from "../../../../styles/styles";




const EntityStyle = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    // paddingHorizontal: 16,
    paddingVertical: 0,
  },
      customerType: {
        paddingHorizontal: 16,
    },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom:20

  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalTitle: {
    marginLeft:10,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
     ...CommonStyle.primaryText,
  },
  modalSectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C42',
    marginLeft: -16,
  },
  modalFieldLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  mandatory: {
    color: colors.error,
  },
  fileUploadRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  fileUploadButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#FFF5ED',
    alignItems: 'center',
  },
  fileUploadButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 13,
    color: '#333',
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
    marginVertical: 8
  },
  sectionTopSpacing: {
    marginTop: 20

  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
 
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  errorText: {

    color: colors.error,
    fontSize: 12,
    marginLeft: 4,
    marginTop: 2
  },

  dropdown: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
 

 
  countryCode: {
    fontSize: 13,
    color: '#333',
    marginRight: 8,
    fontWeight: '500',
  },
  inputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
  },

  inlineVerifyText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
 
  mappingPharmacyBox: {
    padding: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.loginInputBorderColor,
    backgroundColor: '#F5F5F5',
    minHeight: 50,
  },
  mappingPharmacyText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  otpContainer: {
    marginVertical: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  otpTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#FFF',
  },
  otpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpTimer: {
    fontSize: 12,
    color: '#999',
  },
  resendText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  countryCode: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  inputField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
  },


  verifiedText: {
    color: colors.primary
  },
  floatingLabel: {
    position: 'absolute',
    top: -10,
    left: 12,
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    zIndex: 1,
  },



  placeholderText: {
    fontSize: 16,
    color: colors.gray,
    marginLeft: 8
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },

  inputTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inlineAsterisk: {
    color: 'red',
    fontSize: 16,
    marginLeft: 2,
  },
  optionalText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#999',
  },
  dropdownContainer: {
    marginBottom: 18,
  },
  asteriskPrimary: {
    color: "red",
    fontSize: 16
  },
   categoryLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 20,
  },
  categoryPlaceholder: {
    fontSize: 18,
    fontWeight: '400',
    color: '#999',
  },
radioGroupHorizontal: {
  flexDirection: 'row',
  flexWrap: 'wrap',     
  marginVertical: 12,
  rowGap: 12,            
  columnGap: 24,         
},
  radioOptionHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
});


export default EntityStyle;