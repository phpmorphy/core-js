import { PublicKeyInterface } from './PublicKeyInterface'

export interface SecretKeyInterface {
  readonly bytes: Uint8Array
  readonly publicKey: PublicKeyInterface

  sign (message: Uint8Array): Uint8Array
}