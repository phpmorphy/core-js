// Copyright (c) 2020 UMI
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// tslint:disable:no-bitwise

import { Address } from '../address/Address'
import { SecretKey } from '../key/ed25519/SecretKey'
import { AbstractTransaction } from './AbstractTransaction'
import { sha256 } from '../util/sha256'
import { validateInt } from '../util/validator'

/**
 * Базовый класс для работы с транзакциями.
 * @class
 * @lends Transaction
 * @private
 */
abstract class AbstractTransactionBase extends AbstractTransaction {
  /**
   * Транзакция в бинарном виде, 150 байт.
   * @type {number[]}
   * @readonly
   */
  get bytes (): number[] {
    return this._bytes.slice(0)
  }

  /**
   * Хэш транзакции, sha256 от всех 150 байт.
   * @type {number[]}
   * @readonly
   */
  get hash (): number[] {
    return sha256(this._bytes)
  }

  /**
   * Версия (тип) транзакции.
   * Обязательное поле, необходимо задать сразу после создания новой транзакции.
   * Изменять тип транзакции, после того как он был задан, нельзя.
   * @type {number}
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
  get version (): number {
    this._checkFields(['version'])
    return this._bytes[0]
  }

  set version (version: number) {
    if (Object.prototype.hasOwnProperty.call(this._fieldsMap, 'version')) {
      throw new Error('could not update version')
    }

    validateInt(version, 0, 7)

    this._bytes[0] = version
    this._setFields(['version'])
  }

  /**
   * Устанавливает версию и возвращяет this.
   * @param {number} version Версия адреса.
   * @returns {this}
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
   * Отправитель. Доступно для всех типов транзакций.
   * @type {Address}
   * @throws {Error}
   */
  get sender (): Address {
    this._checkFields(['sender'])

    // sender length = 34
    // sender begin = 1
    // sender end = 35
    return new Address(this._bytes.slice(1, 35))
  }

  set sender (address: Address) {
    this._checkFields(['version'])

    if (!(address instanceof Address)) {
      throw new Error('address type must be Address')
    }

    if (this.version === AbstractTransactionBase.Genesis &&
      address.version !== Address.Genesis) {
      throw new Error('address version must be genesis')
    }

    if (this.version !== AbstractTransactionBase.Genesis &&
      address.version === Address.Genesis) {
      throw new Error('address version must not be genesis')
    }

    // sender length = 34
    // sender begin = 1
    const b = address.bytes
    for (let i = 0; i < 34; i++) {
      this._bytes[1 + i] = b[i]
    }
    this._setFields(['sender'])
  }

  /**
   * Устанавливает отправителя и возвращяет this.
   * @param {Address} address Адрес получателя.
   * @returns {this}
   * @throws {Error}
   */
  setSender (address: Address): this {
    this.sender = address
    return this
  }

  /**
   * Получатель.
   * Недоступно для транзакций CreateStructure и UpdateStructure.
   * @type {Address}
   * @throws {Error}
   */
  get recipient (): Address {
    this._checkFields(['version'])
    this._checkVersionIsNotStruct()
    this._checkFields(['recipient'])

    // recipient length = 34
    // recipient begin = 35
    // recipient enf = 69
    return new Address(this._bytes.slice(35, 69))
  }

  set recipient (address: Address) {
    this._checkFields(['version'])
    this._checkVersionIsNotStruct()

    if (!(address instanceof Address)) {
      throw new Error('recipient type must be Address')
    }

    if (address.version === Address.Genesis) {
      throw new Error('recipient version must not be genesis')
    }

    if (this.version === AbstractTransactionBase.Genesis &&
      address.version !== Address.Umi) {
      throw new Error('recipient version must be umi')
    }

    if (this.version !== AbstractTransactionBase.Genesis &&
      this.version !== AbstractTransactionBase.Basic &&
      address.version === Address.Umi) {
      throw new Error('recipient version must not be umi')
    }

    // recipient length = 34
    // recipient begin = 35
    const b = address.bytes
    for (let i = 0; i < 34; i++) {
      this._bytes[35 + i] = b[i]
    }
    this._setFields(['recipient'])
  }

  /**
   * Устанавливает получателя и возвращяет this.
   * Доступно для всех типов транзакций кроме CreateStructure и UpdateStructure.
   * @param {Address} address Адрес получателя.
   * @returns {this}
   * @throws {Error}
   */
  setRecipient (address: Address): this {
    this.recipient = address
    return this
  }

  /**
   * Сумма перевода в UMI-центах, цело число в промежутке от 1 до 18446744073709551615.
   * Из-за ограничений JavaScript максимальное доступное значение 9007199254740991.
   * Доступно только для Genesis и Basic транзакций.
   * @type {number}
   * @throws {Error}
   */
  get value (): number {
    this._checkFields(['version'])
    this._checkVersionIsBasic()
    this._checkFields(['value'])

    // value offset = 69
    return this._bytesToNumber(this._bytes.slice(69, 76))
  }

  set value (value: number) {
    this._checkFields(['version'])
    this._checkVersionIsBasic()
    validateInt(value, 1, 9007199254740991)

    const b = this._numberToBytes(value)
    for (let i = 0; i < 8; i++) {
      this._bytes[69 + i] = b[i]
    }
    this._setFields(['value'])
  }

  private _numberToBytes (value: number): number[] {
    const l = 1
    const h = (value - l) / 0x1_0000_0000 // value >>> 32

    // value offset = 69
    this._bytes[69] = (h >>> 24) & 0xff
    this._bytes[70] = (h >>> 16) & 0xff
    this._bytes[71] = (h >>> 8) & 0xff
    this._bytes[72] = h & 0xff
    this._bytes[73] = (l >>> 24) & 0xff
    this._bytes[74] = (l >>> 16) & 0xff
    this._bytes[75] = (l >>> 8) & 0xff
    this._bytes[76] = l & 0xff

    return []
  }

  private _bytesToNumber (bytes: number[]): number {
    if (((this._bytes[69] << 8) + this._bytes[70]) > 0x001f) {
      throw new Error('value is not safe integer')
    }

    const h = (this._bytes[69] << 24) + (this._bytes[70] << 16) + (this._bytes[71] << 8) + this._bytes[72]
    const l = (this._bytes[73] << 24) + (this._bytes[74] << 16) + (this._bytes[75] << 8) + this._bytes[76]

    return (h * 0x1_0000_0000) + l // h << 32 | l
  }

  /**
   * Устанавливает сумму и возвращяет this.
   * Принимает значения в промежутке от 1 до 9007199254740991.
   * Доступно только для Genesis и Basic транзакций.
   * @param {number} value
   * @returns {this}
   * @throws {Error}
   */
  setValue (value: number): this {
    this.value = value
    return this
  }

  /**
   * Nonce, целое число в промежутке от 0 до 18446744073709551615.
   * Из-за ограничений JavaScript максимальное доступное значение 9007199254740991.
   * Генерируется автоматичеки при вызове sign().
   * @type {number}
   * @throws {Error}
   */
  get nonce (): number {
    this._checkFields(['nonce'])

    // nonce offset = 77
    return this._bytesToNumber(this._bytes.slice(77, 85))
  }

  set nonce (nonce: number) {
    validateInt(nonce, 0, 9007199254740991)

    const b = this._numberToBytes(nonce)
    for (let i = 0; i < 8; i++) {
      this._bytes[77 + i] = b[i] // nonce offset = 77
    }
    this._setFields(['nonce'])
  }

  /**
   * Устанавливает nonce и возвращяет this.
   * @param {number} nonce Nonce, целое числов промежутке от 0 до 9007199254740991.
   * @returns {this}
   * @throws {Error}
   */
  setNonce (nonce: number): this {
    this.nonce = nonce
    return this
  }

  /**
   * Цифровая подпись транзакции, длина 64 байта.
   * Генерируется автоматически при вызове sign().
   * @type {number[]}
   * @throws {Error}
   */
  get signature (): number[] | Uint8Array | Buffer {
    this._checkFields(['signature'])

    // signature length = 64
    const len = this.sender.publicKey.signatureLength

    // signature offset = 85
    return this._bytes.slice(85, 85 + len)
  }

  set signature (signature: number[] | Uint8Array | Buffer) {
    this._checkFields(['version', 'sender'])
    if (signature.length !== this.sender.publicKey.signatureLength) {
      throw new Error('invalid length')
    }

    // signature offset = 85
    for (let i = 0, l = signature.length; i < l; i++) {
      this._bytes[85 + i] = signature[i]
    }
    this._setFields(['signature'])
  }

  /**
   * Устанавливает цифровую подпись и возвращяет this.
   * @param {number[]|Uint8Array|Buffer} signature Подпись, длина 64 байта.
   * @returns {this}
   * @throws {Error}
   */
  setSignature (signature: number[] | Uint8Array | Buffer): this {
    this.signature = signature
    return this
  }

  /**
   * Подписать транзакцию приватным ключем.
   * @param {SecretKey} secretKey
   * @returns {this}
   * @throws {Error}
   */
  sign (secretKey: SecretKey): this {
    this._checkFields(['version', 'sender'])

    if (!(secretKey instanceof SecretKey)) {
      throw new Error('secretKey type must be SecretKey')
    }

    // unsigned begin = 0
    // unsigned end = 85
    const msg = this._bytes.slice(0, 85)
    this.signature = secretKey.sign(msg)
    return this
  }

  /**
   * Проверить транзакцию на соотвествие формальным правилам.
   * @returns {boolean}
   * @throws {Error}
   */
  verify (): boolean {
    this._checkFields(['version', 'sender', 'signature'])

    // unsigned begin = 0
    // unsigned end = 85
    const msg = this._bytes.slice(0, 85)
    return this.sender.publicKey.verifySignature(this.signature, msg)
  }

  /**
   * @throws {Error}
   * @private
   * @internal
   */
  protected _checkVersionIsBasic (): void {
    const versions = [AbstractTransaction.Genesis, AbstractTransaction.Basic]
    if (versions.indexOf(this.version) === -1) {
      throw new Error('unavailable for this transaction type')
    }
  }

  /**
   * @throws {Error}
   * @private
   * @internal
   */
  protected _checkVersionIsNotStruct (): void {
    const versions = [AbstractTransaction.CreateStructure, AbstractTransaction.UpdateStructure]
    if (versions.indexOf(this.version) !== -1) {
      throw new Error('unavailable for this transaction type')
    }
  }
}

export { AbstractTransactionBase }
