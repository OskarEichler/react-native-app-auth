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
exports.withAppAuthAppDelegateHeader = void 0;
const fs = __importStar(require("fs"));
const config_plugins_1 = require("@expo/config-plugins");
const expo_version_1 = require("../expo-version");
const insert_protocol_declaration_1 = require("./utils/insert-protocol-declaration");
const codeModIOs = require('@expo/config-plugins/build/ios/codeMod');
const withAppAuthAppDelegateHeader = rootConfig => {
    if ((0, expo_version_1.isExpo53OrLater)(rootConfig)) {
        return rootConfig;
    }
    return (0, config_plugins_1.withDangerousMod)(rootConfig, [
        'ios',
        config => {
            // find the AppDelegate.h file in the project
            const headerFilePath = config_plugins_1.IOSConfig.Paths.getAppDelegateObjcHeaderFilePath(config.modRequest.projectRoot);
            // BEWARE: we update the AppDelegate.h file *outside* of the standard Expo config procedure !
            let contents = fs.readFileSync(headerFilePath, 'utf8');
            const importExpoHeader = '#import <Expo/Expo.h>';
            const importRNAppAuthHeaders = '#import <React/RCTLinkingManager.h>\n#import "RNAppAuthAuthorizationFlowManager.h"';
            contents = contents.replace(importExpoHeader, `${importExpoHeader}\n${importRNAppAuthHeaders}`);
            // adds a new protocol to the AppDelegate interface (unless it already exists)
            contents = (0, insert_protocol_declaration_1.insertProtocolDeclaration)({
                source: contents,
                interfaceName: 'AppDelegate',
                protocolName: 'RNAppAuthAuthorizationFlowManager',
                baseClassName: 'EXAppDelegateWrapper',
            });
            contents = codeModIOs.insertContentsInsideObjcInterfaceBlock(contents, '@interface AppDelegate', `\n
@property(nonatomic, weak) id<RNAppAuthAuthorizationFlowManagerDelegate> authorizationFlowManagerDelegate;`, { position: 'head' });
            // and finally we write the file back to the disk
            fs.writeFileSync(headerFilePath, contents, 'utf8');
            return config;
        },
    ]);
};
exports.withAppAuthAppDelegateHeader = withAppAuthAppDelegateHeader;
