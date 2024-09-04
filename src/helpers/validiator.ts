export const ValidateEmail = (mail:string) => {
    if (/^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/.test(mail)) {
        return true;
    } else {
        return false;
    }
};
export const ValidatePhone = (mail:string) => {
    if (/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(mail)) {
        return true;
    } else {
        return false;
    }
};
export const ValidateLandline = (mail:string) => {
    if (/^\d{2,5}-\d{6,8}$/.test(mail)) {
        return true;
    } else {
        return false;
    }
};
export const validMobileNo = (mail:string) => {
    if (/^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(mail)) {
        return true;
    } else {
        return false;
    }
};
export const validNo = /^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

export const isValid = (value:string) => {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    return true;
};

export const isValidRole = (value:string) => {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    if (!(['SUBADMIN', 'USER', 'SELLER'].includes(value))) return false;
    return true;
};

export const isValidPermission = (value:string) => {
    if (typeof value === 'undefined' || value === null) return false;
    if (typeof value === 'string' && value.trim().length === 0) return false;
    if (!(['UPDATE', 'CREATE', 'GET', 'DELETE'].includes(value))) return false;
    return true;
};