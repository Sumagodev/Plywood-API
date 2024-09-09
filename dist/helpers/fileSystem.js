"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeFileAndReturnNameBase64 = void 0;
const fs_1 = __importDefault(require("fs"));
const storeFileAndReturnNameBase64 = (base64) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(base64, "base64");
    const tempBase64 = base64.split(",");
    const extension = tempBase64[0].split("/")[1];
    const filename = new Date().getTime() + `.${extension.split(";")[0]}`;
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(`./public/uploads/${filename}`, tempBase64[1], "base64", (err) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            console.log();
            resolve(filename);
        });
    });
});
exports.storeFileAndReturnNameBase64 = storeFileAndReturnNameBase64;
