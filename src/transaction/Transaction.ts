/**
 * Copyright (c) 2020 UMI
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { SecretKey } from '../key/ed25519/SecretKey'
import { Address } from '../address/Address'
import { sha256 } from '../util/Sha256'
import { uint16ToPrefix, prefixToUint16 } from '../util/Converter'

const UNSIGNED_OFFSET: number = 0
const UNSIGNED_LENGTH: number = 85
// const SENDER_OFFSET: number = 1
// const SENDER_LENGTH: number = 34
// const RECIPIENT_OFFSET: number = 35
// const RECIPIENT_LENGTH: number = 34
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
// const TRANSACTION_LENGTH: number = 150

/**
 * @class
 * @classdesc This is a description of the Transaction class.
 * @implements TransactionInterface
 */
export class Transaction {
  /**
   * @constant
   * @type number
   * @default 150
   * @description Длина транзакции в байтах
   */
  static get LENGTH (): number { return 150 }

  static get Genesis (): number { return 0 }

  static get Basic (): number { return 1 }

  static get CreateStructure (): number { return 2 }

  static get UpdateStructure (): number { return 3 }

  static get UpdateProfitAddress (): number { return 4 }

  static get UpdateFeeAddress (): number { return 5 }

  static get CreateTransitAddress (): number { return 6 }

  static get DeleteTransitAddress (): number { return 7 }

  private readonly _bytes: Uint8Array = new Uint8Array(Transaction.LENGTH)
  private readonly _view: DataView = new DataView(this._bytes.buffer)

  constructor (bytes?: Uint8Array) {
    if (bytes === undefined) {
      this._bytes[0] = Transaction.Basic
    } else if (bytes.byteLength !== Transaction.LENGTH) {
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
    return sha256(this._bytes)
  }

  get version (): number {
    return this._bytes[0]
  }

  set version (version: number) {
    this._bytes[0] = version
  }

  setVersion (version: number): this {
    this.version = version
    return this
  }

  get sender (): Address {
    // sender length = 34
    // sender begin = 1
    // sender end = 35
    return new Address(this._bytes.subarray(1, 35))
  }

  set sender (address: Address) {
    // sender length = 34
    // sender begin = 1
    this._bytes.set(address.bytes, 1)
  }

  setSender (address: Address): this {
    this.sender = address
    return this
  }

  get recipient (): Address {
    // recipient length = 34
    // recipient begin = 35
    // recipient enf = 69
    return new Address(this._bytes.subarray(35, 69))
  }

  set recipient (address: Address) {
    // recipient length = 34
    // recipient begin = 35
    this._bytes.set(address.bytes, 35)
  }

  setRecipient (address: Address): this {
    this.recipient = address
    return this
  }

  get value (): number {
    if (this._view.getUint16(VALUE_OFFSET) > 0x001f) {
      throw new Error('value is not safe integer')
    }

    return this._view.getUint32(VALUE_OFFSET) * 0x1_0000_0000 +
      this._view.getUint32(VALUE_OFFSET + 4)
  }

  set value (value: number) {
    if (typeof value !== 'number') {
      throw new Error('value must be number')
    }

    if (Math.floor(value) !== value) {
      throw new Error('value must be integer')
    }

    if (value < 1 || value > Number.MAX_SAFE_INTEGER) {
      throw new Error('value must be between 1 and 9007199254740991')
    }

    // tslint:disable-next-line:no-bitwise
    this._view.setInt32(VALUE_OFFSET + 4, value | 0)
    this._view.setInt32(VALUE_OFFSET,
      (value - this._view.getUint32(VALUE_OFFSET + 4)) / 0x1_0000_0000)
  }

  setValue (value: number): this {
    this.value = value
    return this
  }

  get prefix (): string {
    return uint16ToPrefix(this._view.getUint16(PREFIX_OFFSET))
  }

  set prefix (prefix: string) {
    this._view.setUint16(PREFIX_OFFSET, prefixToUint16(prefix))
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

  get nonce (): number {
    if (this._view.getUint16(NONCE_OFFSET) > 0x001f) {
      throw new Error('nonce is not safe integer')
    }

    return this._view.getUint32(NONCE_OFFSET) * 0x1_0000_0000 +
      this._view.getUint32(NONCE_OFFSET + 4)
  }

  set nonce (nonce: number) {
    if (typeof nonce !== 'number') {
      throw new Error('nonce must be number')
    }

    if (Math.floor(nonce) !== nonce) {
      throw new Error('nonce must be integer')
    }

    if (nonce < 0 || nonce > Number.MAX_SAFE_INTEGER) {
      throw new Error('nonce must be between 0 and 9007199254740991')
    }

    // tslint:disable-next-line:no-bitwise
    this._view.setInt32(NONCE_OFFSET + 4, nonce | 0)
    this._view.setInt32(NONCE_OFFSET,
      (nonce - this._view.getUint32(NONCE_OFFSET + 4)) / 0x1_0000_0000)
  }

  setNonce (nonce: number): this {
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

  sign (secretKey: SecretKey): this {
    const msg = this._bytes.subarray(UNSIGNED_OFFSET, UNSIGNED_LENGTH)
    this.signature = secretKey.sign(msg)
    return this
  }

  verify (): boolean {
    const msg = this._bytes.subarray(UNSIGNED_OFFSET, UNSIGNED_LENGTH)
    return this.sender.publicKey.verifySignature(msg, this.signature)
  }
}