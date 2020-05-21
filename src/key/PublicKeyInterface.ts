export interface PublicKeyInterface {
  readonly bytes: Uint8Array

  verifySignature (message: Uint8Array, signature: Uint8Array): boolean
}