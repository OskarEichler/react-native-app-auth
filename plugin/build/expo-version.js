"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertExpo53OrLater = exports.isExpo53OrLater = exports.getExpoSdkMajorVersion = exports.MIN_EXPO_SDK_MAJOR_VERSION = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.MIN_EXPO_SDK_MAJOR_VERSION = 53;
const parseMajorVersion = (version) => {
    if (!version) {
        return null;
    }
    const match = version.match(/\d+/);
    if (!match) {
        return null;
    }
    return Number.parseInt(match[0], 10);
};
const readExpoPackageVersion = (projectRoot) => {
    if (!projectRoot) {
        return undefined;
    }
    try {
        const expoPackagePath = require.resolve('expo/package.json', { paths: [projectRoot] });
        return JSON.parse(fs.readFileSync(expoPackagePath, 'utf8')).version;
    }
    catch (error) {
        if (error.code !== 'MODULE_NOT_FOUND') {
            throw error;
        }
    }
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        return undefined;
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.dependencies?.expo || packageJson.devDependencies?.expo;
};
const getExpoSdkMajorVersion = (config, projectRoot = config._internal?.projectRoot) => {
    return (parseMajorVersion(config.sdkVersion) ??
        parseMajorVersion(readExpoPackageVersion(projectRoot)));
};
exports.getExpoSdkMajorVersion = getExpoSdkMajorVersion;
const isExpo53OrLater = (config, projectRoot) => {
    const major = (0, exports.getExpoSdkMajorVersion)(config, projectRoot);
    return major != null && major >= exports.MIN_EXPO_SDK_MAJOR_VERSION;
};
exports.isExpo53OrLater = isExpo53OrLater;
const assertExpo53OrLater = (config, projectRoot) => {
    const major = (0, exports.getExpoSdkMajorVersion)(config, projectRoot);
    if (major != null && major < exports.MIN_EXPO_SDK_MAJOR_VERSION) {
        throw new Error(`react-native-app-auth iOS Swift AppDelegate patch requires Expo SDK ${exports.MIN_EXPO_SDK_MAJOR_VERSION} or later. Detected Expo SDK ${major}.`);
    }
};
exports.assertExpo53OrLater = assertExpo53OrLater;
