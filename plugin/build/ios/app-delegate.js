"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAppAuthAppDelegate = exports.withLegacyAppAuthAppDelegate = exports.applyExpo53AppDelegatePatch = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const expo_version_1 = require("../expo-version");
const codeModIOs = require('@expo/config-plugins/build/ios/codeMod');
const APP_AUTH_PROTOCOL = 'RNAppAuthAuthorizationFlowManager';
const APP_AUTH_DELEGATE_PROPERTY = 'public weak var authorizationFlowManagerDelegate: RNAppAuthAuthorizationFlowManagerDelegate?';
const APP_AUTH_DELEGATE_PROPERTY_PATTERN = /\bvar\s+authorizationFlowManagerDelegate\s*:\s*RNAppAuthAuthorizationFlowManagerDelegate\??/;
const APP_AUTH_RESUME_BLOCK = `if let authorizationFlowManagerDelegate = self.authorizationFlowManagerDelegate {
      if authorizationFlowManagerDelegate.resumeExternalUserAgentFlow(with: url) {
        return true
      }
    }`;
const applyExpo53AppDelegatePatch = (contents) => {
    const appDelegatePattern = /^(\s*(?:(?:public|open|final)\s+)*class\s+AppDelegate\s*:\s*ExpoAppDelegate)([^{]*)(\{)/m;
    if (!appDelegatePattern.test(contents)) {
        throw new Error('Unable to find the Expo AppDelegate declaration; configure AppAuth manually');
    }
    contents = contents.replace(appDelegatePattern, (match, declaration, conformances, openingBrace) => {
        if (conformances.split(',').some((protocol) => protocol.trim() === APP_AUTH_PROTOCOL)) {
            return match;
        }
        const trailingWhitespace = conformances.match(/\s*$/)?.[0] ?? '';
        const existingConformances = conformances.slice(0, conformances.length - trailingWhitespace.length);
        return `${declaration}${existingConformances}, ${APP_AUTH_PROTOCOL}${trailingWhitespace}${openingBrace}`;
    });
    if (!APP_AUTH_DELEGATE_PROPERTY_PATTERN.test(contents)) {
        contents = contents.replace(appDelegatePattern, match => `${match}\n  ${APP_AUTH_DELEGATE_PROPERTY}\n`);
    }
    if (!contents.includes('resumeExternalUserAgentFlow(with: url)')) {
        const openUrlPattern = /((?:public\s+)?override\s+func\s+application\s*\([^)]*\bopen\s+url\s*:\s*URL[^)]*\)\s*->\s*Bool\s*\{)/m;
        if (!openUrlPattern.test(contents)) {
            throw new Error('Unable to find the AppDelegate open URL handler; configure AppAuth manually');
        }
        contents = contents.replace(openUrlPattern, match => `${match}\n    ${APP_AUTH_RESUME_BLOCK}\n`);
    }
    return contents;
};
exports.applyExpo53AppDelegatePatch = applyExpo53AppDelegatePatch;
const withAppDelegateSwift = rootConfig => {
    return (0, config_plugins_1.withAppDelegate)(rootConfig, config => {
        (0, expo_version_1.assertExpo53OrLater)(config, config.modRequest.projectRoot);
        config.modResults.contents = (0, exports.applyExpo53AppDelegatePatch)(config.modResults.contents);
        return config;
    });
};
const withLegacyAppAuthAppDelegate = rootConfig => {
    return (0, config_plugins_1.withAppDelegate)(rootConfig, config => {
        let { contents } = config.modResults;
        // insert the code that handles the custom scheme redirections
        contents = codeModIOs.insertContentsInsideObjcFunctionBlock(contents, 'application:openURL:options:', `// react-native-app-auth
  if ([self.authorizationFlowManagerDelegate resumeExternalUserAgentFlowWithURL:url]) {
    return YES;
  }
`, { position: 'head' });
        config.modResults.contents = contents;
        return config;
    });
};
exports.withLegacyAppAuthAppDelegate = withLegacyAppAuthAppDelegate;
const withAppAuthAppDelegate = rootConfig => {
    if ((0, expo_version_1.isExpo53OrLater)(rootConfig)) {
        return withAppDelegateSwift(rootConfig);
    }
    return (0, exports.withLegacyAppAuthAppDelegate)(rootConfig);
};
exports.withAppAuthAppDelegate = withAppAuthAppDelegate;
