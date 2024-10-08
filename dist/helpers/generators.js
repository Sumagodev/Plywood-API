"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNumber = void 0;
function generateRandomNumber(n) {
    let add = 1;
    let max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.
    if (n > max) {
        return generateRandomNumber(max) + generateRandomNumber(n - max);
    }
    max = Math.pow(10, n + add);
    let min = max / 10; // Math.pow(10, n) basically
    let number = Math.floor(Math.random() * (max - min + 1)) + min;
    return ("" + number).substring(add);
}
exports.generateRandomNumber = generateRandomNumber;
