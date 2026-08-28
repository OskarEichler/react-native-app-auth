"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAppAuthAppBuildGradle = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
const codeModAndroid = require('@expo/config-plugins/build/android/codeMod');
const TAG = 'react-native-app-auth';
const withAppAuthAppBuildGradle = (rootConfig, props) => {
    const scheme = props?.android?.appAuthRedirectScheme;
    if (!scheme) {
        return rootConfig;
    }
    if (typeof scheme !== 'string' || !/^[A-Za-z][A-Za-z0-9+.-]*$/.test(scheme)) {
        throw new Error('appAuthRedirectScheme must be a valid URL scheme');
    }
    return (0, config_plugins_1.withAppBuildGradle)(rootConfig, config => {
        if (config.modResults.language !== 'groovy') {
            throw new Error('react-native-app-auth requires a Groovy app/build.gradle');
        }
        const contents = (0, generateCode_1.removeGeneratedContents)(config.modResults.contents, TAG) ?? config.modResults.contents;
        const assignment = `    manifestPlaceholders.appAuthRedirectScheme = '${scheme}'`;
        const insertion = [
            (0, generateCode_1.createGeneratedHeaderComment)(assignment, TAG, '//'),
            assignment,
            `// @generated end ${TAG}`,
            '',
        ].join('\n');
        config.modResults.contents = codeModAndroid.appendContentsInsideDeclarationBlock(contents, 'defaultConfig', insertion);
        return config;
    });
};
exports.withAppAuthAppBuildGradle = withAppAuthAppBuildGradle;
