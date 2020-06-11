import { SecretKeyInterface } from '../key'
import { AddressInterface } from '../address'

export enum TransactionVersions {
  Genesis,
  Basic,
  CreateStructure,
  UpdateStructure,
  UpdateProfitAddress,
  UpdateFeeAddress,
  CreateTransitAddress,
  DeleteTransitAddress,
}

export interface TransactionInterface {
  readonly bytes: Uint8Array
  readonly hash: Uint8Array

  // basic & genesis
  version: TransactionVersions
  sender: AddressInterface
  recipient: AddressInterface
  value: number
  nonce: number
  signature: Uint8Array

  // structure
  prefix: string
  name: string
  profitPercent: number
  feePercent: number

  setVersion (version: TransactionVersions): TransactionInterface

  setSender (address: AddressInterface): TransactionInterface

  setRecipient (address: AddressInterface): TransactionInterface

  setValue (value: number): TransactionInterface

  setNonce (nonce: number): TransactionInterface

  setSignature (signature: Uint8Array): TransactionInterface

  setPrefix (prefix: string): TransactionInterface

  setName (name: string): TransactionInterface

  setProfitPercent (percent: number): TransactionInterface

  setFeePercent (percent: number): TransactionInterface

  sign (secretKey: SecretKeyInterface): TransactionInterface

  verify (): boolean
}