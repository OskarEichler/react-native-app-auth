interface InsertProtocolDeclarationParams {
    source: string;
    interfaceName: string;
    protocolName: string;
    baseClassName?: string;
}
export declare const insertProtocolDeclaration: ({ source, interfaceName, protocolName, baseClassName, }: InsertProtocolDeclarationParams) => string;
export {};
