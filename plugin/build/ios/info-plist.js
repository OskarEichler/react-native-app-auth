"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withUrlSchemes = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withUrlSchemes = (config, props) => {
    const scheme = props?.ios?.urlScheme;
    if (!scheme) {
        return config;
    }
    if (typeof scheme !== 'string' || !/^[A-Za-z][A-Za-z0-9+.-]*$/.test(scheme)) {
        throw new Error('ios.urlScheme must be a valid URL scheme');
    }
    return (0, config_plugins_1.withInfoPlist)(config, cfg => {
        const urlTypes = cfg.modResults.CFBundleURLTypes ?? [];
        if (!urlTypes.some(type => type.CFBundleURLSchemes?.includes(scheme))) {
            cfg.modResults.CFBundleURLTypes = [
                ...urlTypes,
                {
                    CFBundleURLName: '$(PRODUCT_BUNDLE_IDENTIFIER)',
                    CFBundleURLSchemes: [scheme],
                },
            ];
        }
        return cfg;
    });
};
exports.withUrlSchemes = withUrlSchemes;
