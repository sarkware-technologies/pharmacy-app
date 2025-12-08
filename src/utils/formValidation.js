/**
 * Reusable form validation utility based on JSON schema
 * Validates form fields according to the provided schema structure
 *
 * Usage: import validation from './validation';
 * validation.validateField('pincode', '560001');
 */

 // Validation rules based on JSON schema
const VALIDATION_RULES = {
  registrationNumber: {
    type: ['string', 'null'],
    maxLength: 20,
    pattern: /^[A-Za-z0-9]+$/,
    required: false,
  },
  hospitalName: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z ]+$/,
    required: false,
  },
  shortName: {
    type: ['string', 'null'],
    maxLength: 25,
    pattern: /^[A-Za-z0-9]+$/,
    required: false,
  },

  drugLicenseNo: {
    type: ['string', 'null'],
    maxLength: 50,
    pattern: /^[A-Za-z0-9]+$/,
    required: false,
  },
  nameOfPharmacy: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z ]+$/,
    required: false,
  },
  opIpCathlab: {
    type: ['string', 'null'],
    maxLength: 30,
    pattern: /^[A-Za-z ]+$/,
    required: false,
  },
  hospitalCode: {
    type: ['string', 'null'],
    maxLength: 20,
    pattern: /^[A-Za-z0-9]+$/,
    required: false,
  },
  nin: {
    type: ['string', 'null'],
    maxLength: 20,
    // allow alphanumerics and some special chars (space, hyphen, dot, underscore, @, #)
    pattern: /^[A-Za-z0-9 \-._@#]+$/,
    required: false,
  },
  clinicRegistrationNo: {
    type: ['string', 'null'],
    maxLength: 20,
    pattern: /^[A-Za-z0-9]+$/,
    required: false,
  },
  practiceLicenseNo: {
    type: ['string', 'null'],
    maxLength: 20,
    pattern: /^[A-Za-z0-9]+$/,
    required: false,
  },
  nameOfDoctor: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z ]+$/,
    required: false,
  },
  speciality: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z ]+$/,
    required: false,
  },
  clinicName: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z ]+$/,
    required: false,
  },
  address1: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z0-9 .,#\-/()&']+$/,
    required: false,
  },
  address2: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z0-9 .,#\-/()&']+$/,
    required: false,
  },
  address3: {
    type: ['string', 'null'],
    maxLength: 60,
    pattern: /^[A-Za-z0-9 .,#\-/()&']+$/,
    required: false,
  },
  address4: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z0-9 .,#\-/()&']+$/,
    required: false,
  },
  pincode: {
    type: ['string', 'null'],
    maxLength: 10,
    pattern: /^[0-9]+$/,
    required: false,
  },
  area: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z0-9 .,#\-/()&']+$/,
    required: false,
  },
  city: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z ]+$/,
    required: false,
  },
  state: {
    type: ['string', 'null'],
    maxLength: 80,
    pattern: /^[A-Za-z ]+$/,
    required: false,
  },
  mobileNo: {
    type: ['string', 'null'],
    maxLength: 30,
    pattern: /^[0-9]+$/,
    required: false,
  },
  emailAddress: {
    type: ['string', 'null'],
    maxLength: 241,
    format: 'email',
    required: false,
  },
  panNo: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Z0-9]+$/,
    required: false,
  },
  gstNo: {
    type: ['string', 'null'],
    maxLength: 18,
    // GST regex expects state code(2 digits) + PAN(10 chars) + entity code(1) + Z + checksum(1)
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    required: false,
  },
  nameOfStockist: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z0-9 ]+$/,
    required: false,
  },
  distributorCode: {
    type: ['string', 'null'],
    maxLength: 20,
    pattern: /^[A-Za-z0-9]+$/,
    required: false,
  },

   distributorCity: {
    type: ['string', 'null'],
    maxLength: 40,
    pattern: /^[A-Za-z ]+$/,
    required: false,
  },
};

// Email validation regex
// const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const EMAIL_REGEX =
/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// PAN validation regex (standard format: ABCDE1234F)
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// GST validation regex (same as pattern above)
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/**
 * Gets a human-readable label for a field name
 * @param {string} fieldName
 * @returns {string}
 */
const getFieldLabel = (fieldName) => {
  const labels = {
    hospitalRegistrationNo: 'Hospital registration number',
    hospitalName: 'Hospital name',
    shortName: 'Short name',
    drugLicenseNo: 'Drug license number',
    nameOfPharmacy: 'Pharmacy name',
    opIpCathlab: 'OP/IP/Cathlab',
    hospitalCode: 'Hospital code',
    nin: 'NIN',
    clinicRegistrationNo: 'Clinic registration number',
    practiceLicenseNo: 'Practice license number',
    nameOfDoctor: 'Doctor name',
    speciality: 'Speciality',
    clinicName: 'Clinic name',
    address1: 'Address 1',
    address2: 'Address 2',
    address3: 'Address 3',
    address4: 'Address 4',
    pincode: 'Pincode',
    area: 'Area',
    city: 'City',
    state: 'State',
    mobileNo: 'Mobile number',
    emailAddress: 'Email address',
    panNo: 'PAN number',
    gstNo: 'GST number',
    nameOfStockist: 'Stockist name',
    distributorCode: 'Distributor code',
    distributorCity:"Distributor City"
  };

  return labels[fieldName] || fieldName;
};

/**
 * Validates a single field value against its schema rules
 * @param {string} fieldName
 * @param {any} value
 * @param {boolean} required - override to treat field as required
 * @param {string|null} customErrorMessage
 * @returns {string|null} error message or null if valid
 */
export const validateField = (fieldName, value, required = false, customErrorMessage = null) => {
  const rule = VALIDATION_RULES[fieldName];

  if (!rule) {
    console.warn(`No validation rule found for field: ${fieldName}`);
    return null;
  }

  // Treat undefined as empty
  const isEmpty = value === null || value === undefined || value === '';

  // Required check (override possible)
  const isRequired = required || rule.required;
  if (isRequired && isEmpty) {
    return customErrorMessage || `${getFieldLabel(fieldName)} is required`;
  }

  // If not required and empty, skip further checks
  if (!isRequired && isEmpty) return null;

  // Accept numbers as well; coerce to string for validations
  if (value !== null && typeof value !== 'string' && typeof value !== 'number') {
    return customErrorMessage || `${getFieldLabel(fieldName)} must be a string or number`;
  }

  const stringValue = String(value).trim();

  // Max length
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return customErrorMessage || `${getFieldLabel(fieldName)} must not exceed ${rule.maxLength} characters`;
  }

  // Pattern validation (if full-string pattern is present)
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return customErrorMessage || `${getFieldLabel(fieldName)} contains invalid characters`;
  }

  // Email format
  if (rule.format === 'email' && !EMAIL_REGEX.test(stringValue)) {
    return customErrorMessage || 'Invalid email address format';
  }

  // Field-specific validations
  if (fieldName === 'pincode') {
    if (!/^[1-9]\d{5}$/.test(stringValue)) {
      return customErrorMessage || 'Valid 6-digit pincode is required';
    }
  }

  if (fieldName === 'mobileNo') {
    if (!/^[0-9]{10}$/.test(stringValue)) {
      return customErrorMessage || 'Valid 10-digit mobile number is required';
    }
  }

  if (fieldName === 'panNo') {
    if (!PAN_REGEX.test(stringValue.toUpperCase())) {
      return customErrorMessage || 'Invalid PAN format (e.g., ABCDE1234F)';
    }
  }

  if (fieldName === 'gstNo') {
    if (stringValue && !GST_REGEX.test(stringValue.toUpperCase())) {
      return customErrorMessage || 'Invalid GST format (e.g., 27ASDSD1234F1Z5)';
    }
  }

  return null;
};

/**
 * Validates multiple fields at once
 * @param {Object} fields - { fieldName: { value, required?, customMessage? } }
 * @returns {Object} errors map { fieldName: errorMessage }
 */
export const validateFields = (fields) => {
  const errors = {};

  Object.keys(fields).forEach((fieldName) => {
    const cfg = fields[fieldName] || {};
    const error = validateField(fieldName, cfg.value, cfg.required || false, cfg.customMessage || null);
    if (error) errors[fieldName] = error;
  });

  return errors;
};

/**
 * Validates a form data object against required fields list
 * @param {Object} formData - plain object of form values
 * @param {Array<string>} requiredFields - list of field keys that are required
 * @param {Object} customMessages - { fieldName: customMessage }
 * @returns {Object} errors map
 */
export const validateForm = (formData, requiredFields = [], customMessages = {}) => {
  const errors = {};

  // Required fields
  requiredFields.forEach((fieldName) => {
    const value = formData[fieldName];
    const error = validateField(fieldName, value, true, customMessages[fieldName] || null);
    if (error) errors[fieldName] = error;
  });

  // Validate other fields that have values
  Object.keys(formData).forEach((fieldName) => {
    if (!requiredFields.includes(fieldName)) {
      const value = formData[fieldName];
      if (value !== null && value !== undefined && value !== '') {
        const error = validateField(fieldName, value, false, customMessages[fieldName] || null);
        if (error) errors[fieldName] = error;
      }
    }
  });

  return errors;
};

/**
 * Individual utility validators
 */
export const isValidPAN = (pan) => {
  if (!pan || (typeof pan !== 'string' && typeof pan !== 'number')) return false;
  return PAN_REGEX.test(String(pan).trim().toUpperCase());
};

export const isValidGST = (gst) => {
  if (!gst || (typeof gst !== 'string' && typeof gst !== 'number')) return false;
  return GST_REGEX.test(String(gst).trim().toUpperCase());
};

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

export const isValidMobile = (mobile) => {
  if (!mobile || (typeof mobile !== 'string' && typeof mobile !== 'number')) return false;
  return /^[0-9]{10}$/.test(String(mobile).trim());
};

export const isValidPincode = (pincode) => {
  if (!pincode || (typeof pincode !== 'string' && typeof pincode !== 'number')) return false;
  return /^[1-9]\d{5}$/.test(String(pincode).trim());
};

/**
 * Sanitizes a field value according to its pattern (removes invalid characters)
 * @param {string} fieldName
 * @param {string} value
 * @returns {string}
 */
export const sanitizeField = (fieldName, value) => {
  if (!value && value !== 0) return value;
  if (typeof value !== 'string') value = String(value);

  const rule = VALIDATION_RULES[fieldName];
  if (!rule || !rule.pattern) return value;

  // Remove chars that don't match allowed character class
  let sanitized = '';
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (rule.pattern.test(ch)) sanitized += ch;
  }
  // Apply max length
  if (rule.maxLength && sanitized.length > rule.maxLength) {
    sanitized = sanitized.slice(0, rule.maxLength);
  }
  return sanitized;
};

/**
 * Filters input text to only allow characters that match the field's pattern.
 * Use this for onChangeText to prevent invalid characters from being typed.
 * @param {string} schemaFieldName - field name as in VALIDATION_RULES
 * @param {string} text
 * @param {number|null} maxLength
 * @returns {string}
 */
export const filterInputByPattern = (schemaFieldName, text, maxLength = null) => {
  if (text === null || text === undefined) return '';
  if (typeof text !== 'string') text = String(text);

  const rule = VALIDATION_RULES[schemaFieldName];
  if (!rule) {
    // If unknown field, just enforce maxLength if provided
    if (maxLength) return text.slice(0, maxLength);
    if (rule && rule.maxLength) return text.slice(0, rule.maxLength);
    return text;
  }

  const maxLen = maxLength || rule.maxLength;

  // For email, don't filter characters aggressively; just enforce max length
if (rule.format === 'email') {
const allowed = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~@-]+$/;
  let filtered = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (allowed.test(ch)) filtered += ch;
    if (maxLen && filtered.length >= maxLen) break;
  }
  return filtered;
}

  if (rule.pattern) {
    let filtered = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (rule.pattern.test(ch)) filtered += ch;
      if (maxLen && filtered.length >= maxLen) break;
    }
    return filtered;
  }

  return maxLen ? text.slice(0, maxLen) : text;
};

/**
 * Field name mapping from form field names to validation schema field names
 */
export const FIELD_NAME_MAPPING = {
  // Pharmacy fields
  pharmacyName: 'nameOfPharmacy',
  shortName: 'shortName',


  // Hospital fields
  hospitalName: 'hospitalName',
  hospitalCode: 'hospitalCode',
  registrationNumber: 'hospitalRegistrationNo',

  // Doctor fields
  doctorName: 'nameOfDoctor',
  speciality: 'speciality',
  clinicName: 'clinicName',
  clinicRegistrationNumber: 'clinicRegistrationNo',
  practiceLicenseNumber: 'practiceLicenseNo',

  // Address fields
  address1: 'address1',
  address2: 'address2',
  address3: 'address3',
  address4: 'address4',
  pincode: 'pincode',
  area: 'area',
  city: 'city',
  state: 'state',

  // Contact fields
  mobileNumber: 'mobileNo',
  emailAddress: 'emailAddress',

  // Document fields
  panNumber: 'panNo',
  gstNumber: 'gstNo',

  // License fields (map to drugLicenseNo where appropriate)
  license20: 'drugLicenseNo',
  license21: 'drugLicenseNo',
  license20b: 'drugLicenseNo',
  license21b: 'drugLicenseNo',

  // Other fields
  nin: 'nin',
  nameOfStockist: 'nameOfStockist',
  distributorCode: 'distributorCode',
  opIpCathlab: 'opIpCathlab',
};

/**
 * Creates a filtered onChangeText handler that prevents invalid characters
 * @param {string} formFieldName - The form field name (e.g., 'pharmacyName', 'mobileNumber')
 * @param {Function} originalHandler - The original onChangeText handler
 * @param {number|null} maxLength - Optional max length override
 * @returns {Function}
 */
export const createFilteredInputHandler = (formFieldName, originalHandler, maxLength = null) => {
  return (text) => {
    const schemaFieldName = FIELD_NAME_MAPPING[formFieldName] || formFieldName;
    const filtered = filterInputByPattern(schemaFieldName, text, maxLength);
    if (originalHandler) originalHandler(filtered);
    return filtered;
  };
};

export default {
  validateField,
  validateFields,
  validateForm,
  isValidPAN,
  isValidGST,
  isValidEmail,
  isValidMobile,
  isValidPincode,
  sanitizeField,
  filterInputByPattern,
  createFilteredInputHandler,
  FIELD_NAME_MAPPING,
  VALIDATION_RULES,
};
