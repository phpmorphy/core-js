import crypto from 'crypto'
import {
  TransactionInterface,
  TransactionVersions,
} from './TransactionInterface'
import { SecretKeyInterface } from '../key'
import { Address, AddressInterface } from '../address'
import { Converter } from '../util'

const UNSIGNED_OFFSET: number = 0
const UNSIGNED_LENGTH: number = 85
const SENDER_OFFSET: number = 1
const SENDER_LENGTH: number = 34
const RECIPIENT_OFFSET: number = 35
const RECIPIENT_LENGTH: number = 34
const PREFIX_OFFSET: number = 35
const PREFIX_LENGTH: number = 2
const PROFIT_OFFSET: number = 37
const PROFIT_LENGTH: number = 2
const FEE_OFFSET: number = 39
const FEE_LENGTH: number = 2
const NAME_OFFSET: number = 41
const NAME_LENGTH: number = 36
const VALUE_OFFSET: number = 69
const VALUE_LENGTH: number = 8
const NONCE_OFFSET: number = 77
const NONCE_LENGTH: number = 8
const SIGNATURE_OFFSET: number = 85
const SIGNATURE_LENGTH: number = 64
const TRANSACTION_LENGTH: number = 150

export class Transaction implements TransactionInterface {
  private readonly _bytes: Uint8Array = new Uint8Array(TRANSACTION_LENGTH)
  private readonly _view: DataView = new DataView(this._bytes.buffer)

  constructor (bytes?: Uint8Array) {
    if (bytes === undefined) {
      this._bytes[0] = TransactionVersions.Basic
    } else if (bytes.byteLength !== TRANSACTION_LENGTH) {
      throw new Error('incorrect length')
    } else {
      this._bytes.set(bytes)
    }
  }

  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  get hash (): Uint8Array {
    return new Uint8Array(
      crypto.createHash('sha256').update(this._bytes).digest().buffer,
    )
  }

  get version (): TransactionVersions {
    return this._bytes[0]
  }

  set version (version: TransactionVersions) {
    this._bytes[0] = version
  }

  setVersion (version: TransactionVersions): this {
    this.version = version
    return this
  }

  get sender (): AddressInterface {
    return new Address(
      this._bytes.subarray(SENDER_OFFSET, (SENDER_OFFSET + SENDER_LENGTH)),
    )
  }

  set sender (address: AddressInterface) {
    this._bytes.set(address.bytes, SENDER_OFFSET)
  }

  setSender (address: AddressInterface): this {
    this.sender = address
    return this
  }

  get recipient (): AddressInterface {
    return new Address(
      this._bytes.subarray(
        RECIPIENT_OFFSET,
        (RECIPIENT_OFFSET + RECIPIENT_LENGTH),
      ),
    )
  }

  set recipient (address: AddressInterface) {
    this._bytes.set(address.bytes, RECIPIENT_OFFSET)
  }

  setRecipient (address: AddressInterface): this {
    this.recipient = address
    return this
  }

  get value (): bigint {
    return this._view.getBigUint64(VALUE_OFFSET)
  }

  set value (value: bigint) {
    this._view.setBigUint64(VALUE_OFFSET, value)
  }

  setValue (value: bigint): this {
    this.value = value
    return this
  }

  get prefix (): string {
    return Converter.uint16ToPrefix(this._view.getUint16(PREFIX_OFFSET))
  }

  set prefix (prefix: string) {
    this._view.setUint16(PREFIX_OFFSET, Converter.prefixToUint16(prefix))
  }

  setPrefix (prefix: string): this {
    this.prefix = prefix
    return this
  }

  get name (): string {
    const txt = this._bytes.subarray(
      NAME_OFFSET + 1,
      NAME_OFFSET + 1 + this._bytes[NAME_OFFSET],
    )
    return new TextDecoder().decode(txt)
  }

  set name (name: string) {
    const txt = new TextEncoder().encode(name)
    if (txt.byteLength >= NAME_LENGTH) {
      throw new Error('too long')
    }

    this._bytes[NAME_OFFSET] = txt.byteLength
    this._bytes.set(txt, NAME_OFFSET + 1)
  }

  setName (name: string): this {
    this.name = name
    return this
  }

  get profitPercent (): number {
    return this._view.getUint16(PROFIT_OFFSET)
  }

  set profitPercent (percent: number) {
    this._view.setUint16(PROFIT_OFFSET, percent)
  }

  setProfitPercent (percent: number): this {
    this.profitPercent = percent
    return this
  }

  get feePercent (): number {
    return this._view.getUint16(FEE_OFFSET)
  }

  set feePercent (value: number) {
    this._view.setUint16(FEE_OFFSET, value)
  }

  setFeePercent (value: number): this {
    this.feePercent = value
    return this
  }

  get nonce (): bigint {
    return this._view.getBigUint64(NONCE_OFFSET)
  }

  set nonce (nonce: bigint) {
    this._view.setBigUint64(NONCE_OFFSET, nonce)
  }

  setNonce (nonce: bigint): this {
    this.nonce = nonce
    return this
  }

  get signature (): Uint8Array {
    const len = SIGNATURE_LENGTH
    const sig = new Uint8Array(len)
    sig.set(this._bytes.subarray(SIGNATURE_OFFSET, SIGNATURE_OFFSET + len))
    return sig
  }

  set signature (signature: Uint8Array) {
    this._bytes.set(signature, SIGNATURE_OFFSET)
  }

  setSignature (signature: Uint8Array): this {
    this.signature = signature
    return this
  }

  sign (secretKey: SecretKeyInterface): this {
    const msg = this._bytes.subarray(UNSIGNED_OFFSET, UNSIGNED_LENGTH)
    this.signature = secretKey.sign(msg)
    return this
  }

  verify (): boolean {
    const msg = this._bytes.subarray(UNSIGNED_OFFSET, UNSIGNED_LENGTH)
    return this.sender.publicKey.verifySignature(msg, this.signature)
  }
}