"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateDifference = void 0;
const moment_1 = __importDefault(require("moment"));
const dateDifference = (date1, date2) => {
    var start = (0, moment_1.default)(date1);
    var end = (0, moment_1.default)(date2);
    let difference = end.diff(start, "days");
    return difference;
};
exports.dateDifference = dateDifference;
