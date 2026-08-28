"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedirectUrlScheme = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const ios_1 = require("./ios");
const android_1 = require("./android");
const packageJson = require('../../package.json');
const getRedirectUrlScheme = (redirectUrl) => {
    return redirectUrl?.split(':')[0];
};
exports.getRedirectUrlScheme = getRedirectUrlScheme;
const withAppAuth = (config, props) => {
    const redirectUrlScheme = (0, exports.getRedirectUrlScheme)(props?.redirectUrls?.[0]);
    // Transform redirectUrls configuration to platform-specific format
    const transformedProps = props?.redirectUrls ? {
        ios: {
            urlScheme: redirectUrlScheme,
        },
        android: {
            appAuthRedirectScheme: redirectUrlScheme,
        },
        ...props,
    } : (props || {});
    return (0, config_plugins_1.withPlugins)(config, [
        // iOS
        ios_1.withBridgingHeader,
        ios_1.withAppAuthAppDelegate,
        ios_1.withAppAuthAppDelegateHeader,
        [ios_1.withUrlSchemes, transformedProps],
        // Android
        [android_1.withAppAuthAppBuildGradle, transformedProps],
    ]);
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withAppAuth, packageJson.name, packageJson.version);
