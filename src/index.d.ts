export declare function createTransaction(sender: string, recipient: string, value: BigInt, secretKey: Uint8Array): Buffer;

export declare function mnemonicToAddress(mnemonic: string, type?: number, tag?: string): string;

export declare function mnemonicToPublicKey(mnemonic: string, password?: string): Uint8Array;

export declare function mnemonicToSecretKey(mnemonic: string, password?: string): Uint8Array;

export declare function sign(message: Buffer, secretKey: Uint8Array): Buffer;

export declare function validateAddress(address: string): boolean;

export declare function verify(message: Buffer, signature: Buffer, publicKey: Uint8Array): boolean;