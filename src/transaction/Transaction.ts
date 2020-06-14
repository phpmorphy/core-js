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

import { SecretKey } from '../key/ed25519/SecretKey' // eslint-disable-line
import { Address } from '../address/Address'
import { sha256 } from '../util/Sha256'
import { uint16ToPrefix, prefixToUint16 } from '../util/Converter'

export class Transaction {
  /**
   * @description Длина транзакции в байтах.
   * @constant
   * @type {number}
   * @default 150
   */
  static get LENGTH (): number { return 150 }

  /**
   * @description Genesis-транзакция.
   * Может быть добавлена только в Genesis-блок.
   * Адрес отправителя должен иметь префикс genesis, адрес получаетеля - umi.
   * @constant
   * @type {number}
   * @default 0
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('genesis')
   * let recipient = Address.fromKey(secKey).setPrefix('umi')
   * let tx = new Transaction().
   *   setVersion(Transaction.Genesis).
   *   setSender(sender).
   *   setRecipient(recipient).
   *   setValue(42).
   *   sign(secKey)
   */
  static get Genesis (): number { return 0 }

  /**
   * @description Стандартная транзакция. Перевод монет из одного кошелька в другой.
   * @constant
   * @type {number}
   * @default 1
   */
  static get Basic (): number { return 1 }

  /**
   * @description Создание новой структуры.
   * @constant
   * @type {number}
   * @default 2
   */
  static get CreateStructure (): number { return 2 }

  /**
   * @description Обновление настроек существующей структуры.
   * @constant
   * @type {number}
   * @default 3
   */
  static get UpdateStructure (): number { return 3 }

  /**
   * @description Изменение адреса для начисления профита.
   * @constant
   * @type {number}
   * @default 4
   */
  static get UpdateProfitAddress (): number { return 4 }

  /**
   * @description Изменение адреса для перевода комиссии.
   * @constant
   * @type {number}
   * @default 5
   */
  static get UpdateFeeAddress (): number { return 5 }

  /**
   * @description Активация транзитного адреса.
   * @constant
   * @type {number}
   * @default 6
   */
  static get CreateTransitAddress (): number { return 6 }

  /**
   * @description Деактивация транзитного адреса.
   * @constant
   * @type {number}
   * @default 7
   */
  static get DeleteTransitAddress (): number { return 7 }

  /**
   * @description Транзакция в бинарном виде.
   * @private
   * @readonly
   * @type {Uint8Array}
   */
  private readonly _bytes: Uint8Array = new Uint8Array(Transaction.LENGTH)

  /**
   * @description Транзакция в бинарном виде.
   * @private
   * @readonly
   * @type {DataView}
   */
  private readonly _view: DataView = new DataView(this._bytes.buffer)

  /**
   * @constructor
   * @param {Uint8Array} [bytes] Транзакция в бинарном виде, 150 байт.
   * @throws {Error}
   */
  constructor (bytes?: Uint8Array) {
    if (bytes === undefined) {
      this.version = Transaction.Basic
    } else if (bytes.byteLength !== Transaction.LENGTH) {
      throw new Error('incorrect length')
    } else {
      this._bytes.set(bytes)
    }
  }

  /**
   * @description Транзакция в бинарном виде, 150 байт.
   * @readonly
   * @type {Uint8Array}
   */
  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * @readonly
   * @type {Uint8Array}
   */
  get hash (): Uint8Array {
    return sha256(this._bytes)
  }

  /**
   * @type {number}
   */
  get version (): number {
    return this._bytes[0]
  }

  set version (version: number) {
    this._bytes[0] = version
  }

  /**
   * @param {number} version Версия адреса.
   * @returns {Transaction}
   * @throws {Error}
   * @see Transaction.Genesis
   * @see Transaction.Basic
   * @see Transaction.CreateStructure
   * @see Transaction.UpdateStructure
   * @see Transaction.UpdateProfitAddress
   * @see Transaction.UpdateFeeAddress
   * @see Transaction.CreateTransitAddress
   * @see Transaction.DeleteTransitAddress
   */
  setVersion (version: number): this {
    this.version = version
    return this
  }

  /**
   * @type {Address}
   */
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

  /**
   * @param {Address} address Адрес получателя.
   * @returns {Transaction}
   * @throws {Error}
   */
  setSender (address: Address): this {
    this.sender = address
    return this
  }

  /**
   * @type {Address}
   */
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

  /**
   * @param {Address} address Адрес получателя.
   * @returns {Transaction}
   * @throws {Error}
   */
  setRecipient (address: Address): this {
    this.recipient = address
    return this
  }

  /**
   * @type {number}
   */
  get value (): number {
    // value offset = 69
    if (this._view.getUint16(69) > 0x001f) {
      throw new Error('value is not safe integer')
    }

    return this._view.getUint32(69) * 0x1_0000_0000 +
      this._view.getUint32(69 + 4)
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

    // value offset = 69
    // tslint:disable-next-line:no-bitwise
    this._view.setInt32(69 + 4, value | 0)
    this._view.setInt32(69,
      (value - this._view.getUint32(69 + 4)) / 0x1_0000_0000)
  }

  /**
   * @param {number} value
   * @returns {Transaction}
   * @throws {Error}
   */
  setValue (value: number): this {
    this.value = value
    return this
  }

  /**
   * @type {string}
   */
  get prefix (): string {
    // prefix offset = 35
    return uint16ToPrefix(this._view.getUint16(35))
  }

  set prefix (prefix: string) {
    // prefix offset = 35
    this._view.setUint16(35, prefixToUint16(prefix))
  }

  /**
   * @param {string} prefix
   * @returns {Transaction}
   * @throws {Error}
   */
  setPrefix (prefix: string): this {
    this.prefix = prefix
    return this
  }

  /**
   * @type {string}
   */
  get name (): string {
    // name offset = 41
    const txt = this._bytes.subarray(41 + 1, 41 + 1 + this._bytes[41])
    return new TextDecoder().decode(txt)
  }

  set name (name: string) {
    // name offset = 41
    // name length = 36
    const txt = new TextEncoder().encode(name)

    if (txt.byteLength >= 36) {
      throw new Error('too long')
    }

    this._bytes[41] = txt.byteLength
    this._bytes.set(txt, 41 + 1)
  }

  /**
   * @param {string} name
   * @returns {Transaction}
   * @throws {Error}
   */
  setName (name: string): this {
    this.name = name
    return this
  }

  /**
   * @type {number}
   */
  get profitPercent (): number {
    // profit offset = 37
    return this._view.getUint16(37)
  }

  set profitPercent (percent: number) {
    // profit offset = 37
    this._view.setUint16(37, percent)
  }

  /**
   * @param {number} percent
   * @returns {Transaction}
   * @throws {Error}
   */
  setProfitPercent (percent: number): this {
    this.profitPercent = percent
    return this
  }

  /**
   * @type {number}
   */
  get feePercent (): number {
    // fee offset = 39
    return this._view.getUint16(39)
  }

  set feePercent (value: number) {
    // fee offset = 39
    this._view.setUint16(39, value)
  }

  /**
   * @param {number} value
   * @returns {Transaction}
   * @throws {Error}
   */
  setFeePercent (value: number): this {
    this.feePercent = value
    return this
  }

  /**
   * @type {number}
   */
  get nonce (): number {
    // nonce offset = 77
    if (this._view.getUint16(77) > 0x001f) {
      throw new Error('nonce is not safe integer')
    }

    return this._view.getUint32(77) * 0x1_0000_0000 +
      this._view.getUint32(77 + 4)
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

    // nonce offset = 77
    // tslint:disable-next-line:no-bitwise
    this._view.setInt32(77 + 4, nonce | 0)
    this._view.setInt32(77,
      (nonce - this._view.getUint32(77 + 4)) / 0x1_0000_0000)
  }

  /**
   * @param {number} nonce
   * @returns {Transaction}
   * @throws {Error}
   */
  setNonce (nonce: number): this {
    this.nonce = nonce
    return this
  }

  /**
   * @type {Uint8Array}
   */
  get signature (): Uint8Array {
    // signature offset = 85
    // signature length = 64
    const len = 64
    const sig = new Uint8Array(len)
    sig.set(this._bytes.subarray(85, 85 + len))
    return sig
  }

  set signature (signature: Uint8Array) {
    // signature offset = 85
    this._bytes.set(signature, 85)
  }

  /**
   * @param {Uint8Array} signature
   * @returns {Transaction}
   * @throws {Error}
   */
  setSignature (signature: Uint8Array): this {
    this.signature = signature
    return this
  }

  /**
   * @description Подписать транзакцию приватным ключем.
   * @param {SecretKey} secretKey
   * @throws {Error}
   */
  sign (secretKey: SecretKey): this {
    // unsigned begin = 0
    // unsigned end = 85
    const msg = this._bytes.subarray(0, 85)
    this.signature = secretKey.sign(msg)
    return this
  }

  /**
   * @description Проверить транзакцию на соотвествие формальным правилам.
   * @returns {boolean}
   */
  verify (): boolean {
    // unsigned begin = 0
    // unsigned end = 85
    const msg = this._bytes.subarray(0, 85)
    return this.sender.publicKey.verifySignature(msg, this.signature)
  }
}
