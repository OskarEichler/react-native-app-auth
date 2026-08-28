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
exports.withBridgingHeader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_plugins_1 = require("@expo/config-plugins");
const expo_version_1 = require("../expo-version");
const BRIDGING_HEADER_NAME = 'AppDelegate+RNAppAuth.h';
const BRIDGING_HEADER_IMPORT = '#import "RNAppAuthAuthorizationFlowManager.h"';
const withBridgingHeader = rootConfig => {
    if (!(0, expo_version_1.isExpo53OrLater)(rootConfig)) {
        return rootConfig;
    }
    return (0, config_plugins_1.withXcodeProject)(rootConfig, config => {
        const project = config.modResults;
        const projectRoot = config.modRequest.projectRoot;
        const iosRoot = path.join(projectRoot, 'ios');
        const projectName = config_plugins_1.IOSConfig.XcodeUtils.getProjectName(projectRoot);
        const { target } = config_plugins_1.IOSConfig.XcodeUtils.getApplicationNativeTarget({ project, projectName });
        const configurations = config_plugins_1.IOSConfig.XcodeUtils.getBuildConfigurationsForListId(project, target.buildConfigurationList);
        const projectConfigurations = config_plugins_1.IOSConfig.XcodeUtils.getBuildConfigurationsForListId(project, project.getFirstProject().firstProject.buildConfigurationList);
        const defaultHeader = path.join(path.dirname(config_plugins_1.IOSConfig.Paths.getAppDelegateFilePath(projectRoot)), BRIDGING_HEADER_NAME);
        const headers = new Map();
        for (const [, configuration] of configurations) {
            const inherited = projectConfigurations.find(([, item]) => item.name === configuration.name)?.[1].buildSettings ?? {};
            const settings = { ...inherited, ...configuration.buildSettings };
            const configuredHeader = settings.SWIFT_OBJC_BRIDGING_HEADER;
            let headerPath = defaultHeader;
            if (configuredHeader) {
                const variables = {
                    ...settings,
                    SRCROOT: iosRoot,
                    PROJECT_DIR: iosRoot,
                    PROJECT_NAME: projectName,
                    TARGET_NAME: config_plugins_1.IOSConfig.XcodeUtils.unquote(target.name),
                    CONFIGURATION: config_plugins_1.IOSConfig.XcodeUtils.unquote(configuration.name),
                    inherited: inherited.SWIFT_OBJC_BRIDGING_HEADER ?? '',
                };
                const resolved = config_plugins_1.IOSConfig.XcodeUtils.resolveXcodeBuildSetting(config_plugins_1.IOSConfig.XcodeUtils.unquote(configuredHeader).replace(/\$\{([^}]+)\}/g, '$($1)'), name => {
                    const value = variables[name];
                    if (value === undefined) {
                        throw new Error(`Unable to resolve bridging header build setting: ${name}`);
                    }
                    return config_plugins_1.IOSConfig.XcodeUtils.unquote(String(value));
                });
                if (!resolved || resolved.includes('$')) {
                    throw new Error('Unable to resolve SWIFT_OBJC_BRIDGING_HEADER; configure the AppAuth import manually');
                }
                headerPath = path.resolve(iosRoot, resolved);
                if (!fs.existsSync(headerPath)) {
                    throw new Error(`Configured bridging header does not exist: ${headerPath}`);
                }
            }
            else {
                configuration.buildSettings.SWIFT_OBJC_BRIDGING_HEADER = JSON.stringify(path.relative(iosRoot, headerPath));
            }
            if (!headers.has(headerPath)) {
                const contents = fs.existsSync(headerPath) ? fs.readFileSync(headerPath, 'utf8') : '';
                headers.set(headerPath, contents);
            }
        }
        for (const [headerPath, contents] of headers) {
            if (!contents.includes(BRIDGING_HEADER_IMPORT)) {
                fs.writeFileSync(headerPath, `${BRIDGING_HEADER_IMPORT}\n${contents}`, 'utf8');
            }
        }
        return config;
    });
};
exports.withBridgingHeader = withBridgingHeader;
