interface ExpoConfig {
    sdkVersion?: string;
    _internal?: {
        [key: string]: any;
        projectRoot?: string;
    };
}
export declare const MIN_EXPO_SDK_MAJOR_VERSION = 53;
export declare const getExpoSdkMajorVersion: (config: ExpoConfig, projectRoot?: string | undefined) => number | null;
export declare const isExpo53OrLater: (config: ExpoConfig, projectRoot?: string) => boolean;
export declare const assertExpo53OrLater: (config: ExpoConfig, projectRoot?: string) => void;
export {};
