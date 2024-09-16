"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPermission = exports.isValidRole = exports.isValid = exports.validNo = exports.validMobileNo = exports.ValidateLandline = exports.ValidatePhone = exports.ValidateEmail = void 0;
const ValidateEmail = (mail) => {
    if (/^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/.test(mail)) {
        return true;
    }
    else {
        return false;
    }
};
exports.ValidateEmail = ValidateEmail;
const ValidatePhone = (mail) => {
    if (/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(mail)) {
        return true;
    }
    else {
        return false;
    }
};
exports.ValidatePhone = ValidatePhone;
const ValidateLandline = (mail) => {
    if (/^\d{2,5}-\d{6,8}$/.test(mail)) {
        return true;
    }
    else {
        return false;
    }
};
exports.ValidateLandline = ValidateLandline;
const validMobileNo = (mail) => {
    if (/^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(mail)) {
        return true;
    }
    else {
        return false;
    }
};
exports.validMobileNo = validMobileNo;
exports.validNo = /^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const isValid = (value) => {
    if (typeof value === 'undefined' || value === null)
        return false;
    if (typeof value === 'string' && value.trim().length === 0)
        return false;
    return true;
};
exports.isValid = isValid;
const isValidRole = (value) => {
    if (typeof value === 'undefined' || value === null)
        return false;
    if (typeof value === 'string' && value.trim().length === 0)
        return false;
    if (!(['SUBADMIN', 'USER', 'SELLER'].includes(value)))
        return false;
    return true;
};
exports.isValidRole = isValidRole;
const isValidPermission = (value) => {
    if (typeof value === 'undefined' || value === null)
        return false;
    if (typeof value === 'string' && value.trim().length === 0)
        return false;
    if (!(['UPDATE', 'CREATE', 'GET', 'DELETE'].includes(value)))
        return false;
    return true;
};
exports.isValidPermission = isValidPermission;
