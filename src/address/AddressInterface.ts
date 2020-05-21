import { PublicKeyInterface } from '../key'

export interface AddressInterface {
  readonly bytes: Uint8Array

  prefix: string
  publicKey: PublicKeyInterface
  bech32: string

  setPrefix (prefix: string): AddressInterface

  setPublicKey (publicKey: PublicKeyInterface): AddressInterface

  fromBech32 (address: string): AddressInterface
}