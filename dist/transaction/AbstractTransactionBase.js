/**
 * @license
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

'use strict'

const sha256 = require('../util/sha256.js')
const SecretKey = require('../key/ed25519/SecretKey.js')
const validator = require('../util/validator.js')
const Address = require('../address/Address.js')
const AbstractTransaction = require('./AbstractTransaction.js')

/**
 * Базовый класс для работы с транзакциями.
 * @class
 * @lends Transaction
 * @private
 */
class AbstractTransactionBase extends AbstractTransaction.AbstractTransaction {
  /**
   * Транзакция в бинарном виде, 150 байт.
   * @type {number[]}
   * @readonly
   */
  get bytes () {
    return this._bytes.slice(0)
  }

  /**
   * Хэш транзакции, sha256 от всех 150 байт.
   * @type {number[]}
   * @readonly
   */
  get hash () {
    return sha256.sha256(this._bytes)
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
  get version () {
    this._checkFields(['version'])
    return this._bytes[0]
  }

  set version (version) {
    if (Object.prototype.hasOwnProperty.call(this._fieldsMap, 'version')) {
      throw new Error('could not update version')
    }
    validator.validateInt(version, 0, 7)
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
  setVersion (version) {
    this.version = version
    return this
  }

  /**
   * Отправитель. Доступно для всех типов транзакций.
   * @type {Address}
   * @throws {Error}
   */
  get sender () {
    this._checkFields(['sender'])
    return new Address.Address(this._bytes.slice(1, 35))
  }

  set sender (address) {
    this._checkFields(['version'])
    if (!(address instanceof Address.Address)) {
      throw new Error('address type must be Address')
    }
    if (this.version === AbstractTransactionBase.Genesis &&
      address.version !== Address.Address.Genesis) {
      throw new Error('address version must be genesis')
    }
    if (this.version !== AbstractTransactionBase.Genesis &&
      address.version === Address.Address.Genesis) {
      throw new Error('address version must not be genesis')
    }
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
  setSender (address) {
    this.sender = address
    return this
  }

  /**
   * Получатель.
   * Недоступно для транзакций CreateStructure и UpdateStructure.
   * @type {Address}
   * @throws {Error}
   */
  get recipient () {
    this._checkFields(['version'])
    this._checkVersionIsNotStruct()
    this._checkFields(['recipient'])
    return new Address.Address(this._bytes.slice(35, 69))
  }

  set recipient (address) {
    this._checkFields(['version'])
    this._checkVersionIsNotStruct()
    if (!(address instanceof Address.Address)) {
      throw new Error('recipient type must be Address')
    }
    if (address.version === Address.Address.Genesis) {
      throw new Error('recipient version must not be genesis')
    }
    if (this.version === AbstractTransactionBase.Genesis &&
      address.version !== Address.Address.Umi) {
      throw new Error('recipient version must be umi')
    }
    if (this.version !== AbstractTransactionBase.Genesis &&
      this.version !== AbstractTransactionBase.Basic &&
      address.version === Address.Address.Umi) {
      throw new Error('recipient version must not be umi')
    }
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
  setRecipient (address) {
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
  get value () {
    this._checkFields(['version'])
    this._checkVersionIsBasic()
    this._checkFields(['value'])
    return this._bytesToNumber(this._bytes.slice(69, 76))
  }

  set value (value) {
    this._checkFields(['version'])
    this._checkVersionIsBasic()
    validator.validateInt(value, 1, 9007199254740991)
    const b = this._numberToBytes(value)
    for (let i = 0; i < 8; i++) {
      this._bytes[69 + i] = b[i]
    }
    this._setFields(['value'])
  }

  _numberToBytes (value) {
    const l = 1
    const h = (value - l) / 4294967296
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

  _bytesToNumber (bytes) {
    if (((this._bytes[69] << 8) + this._bytes[70]) > 0x001f) {
      throw new Error('value is not safe integer')
    }
    const h = (this._bytes[69] << 24) + (this._bytes[70] << 16) + (this._bytes[71] << 8) + this._bytes[72]
    const l = (this._bytes[73] << 24) + (this._bytes[74] << 16) + (this._bytes[75] << 8) + this._bytes[76]
    return (h * 4294967296) + l
  }

  /**
   * Устанавливает сумму и возвращяет this.
   * Принимает значения в промежутке от 1 до 9007199254740991.
   * Доступно только для Genesis и Basic транзакций.
   * @param {number} value
   * @returns {this}
   * @throws {Error}
   */
  setValue (value) {
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
  get nonce () {
    this._checkFields(['nonce'])
    return this._bytesToNumber(this._bytes.slice(77, 85))
  }

  set nonce (nonce) {
    validator.validateInt(nonce, 0, 9007199254740991)
    const b = this._numberToBytes(nonce)
    for (let i = 0; i < 8; i++) {
      this._bytes[77 + i] = b[i]
    }
    this._setFields(['nonce'])
  }

  /**
   * Устанавливает nonce и возвращяет this.
   * @param {number} nonce Nonce, целое числов промежутке от 0 до 9007199254740991.
   * @returns {this}
   * @throws {Error}
   */
  setNonce (nonce) {
    this.nonce = nonce
    return this
  }

  /**
   * Цифровая подпись транзакции, длина 64 байта.
   * Генерируется автоматически при вызове sign().
   * @type {number[]}
   * @throws {Error}
   */
  get signature () {
    this._checkFields(['signature'])
    const len = this.sender.publicKey.signatureLength
    return this._bytes.slice(85, 85 + len)
  }

  set signature (signature) {
    this._checkFields(['version', 'sender'])
    if (signature.length !== this.sender.publicKey.signatureLength) {
      throw new Error('invalid length')
    }
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
  setSignature (signature) {
    this.signature = signature
    return this
  }

  /**
   * Подписать транзакцию приватным ключем.
   * @param {SecretKey} secretKey
   * @returns {this}
   * @throws {Error}
   */
  sign (secretKey) {
    this._checkFields(['version', 'sender'])
    if (!(secretKey instanceof SecretKey.SecretKey)) {
      throw new Error('secretKey type must be SecretKey')
    }
    const msg = this._bytes.slice(0, 85)
    this.signature = secretKey.sign(msg)
    return this
  }

  /**
   * Проверить транзакцию на соотвествие формальным правилам.
   * @returns {boolean}
   * @throws {Error}
   */
  verify () {
    this._checkFields(['version', 'sender', 'signature'])
    const msg = this._bytes.slice(0, 85)
    return this.sender.publicKey.verifySignature(this.signature, msg)
  }

  /**
   * @throws {Error}
   * @private
   */
  _checkVersionIsBasic () {
    const versions = [AbstractTransaction.AbstractTransaction.Genesis, AbstractTransaction.AbstractTransaction.Basic]
    if (versions.indexOf(this.version) === -1) {
      throw new Error('unavailable for this transaction type')
    }
  }

  /**
   * @throws {Error}
   * @private
   */
  _checkVersionIsNotStruct () {
    const versions = [AbstractTransaction.AbstractTransaction.CreateStructure, AbstractTransaction.AbstractTransaction.UpdateStructure]
    if (versions.indexOf(this.version) !== -1) {
      throw new Error('unavailable for this transaction type')
    }
  }
}

exports.AbstractTransactionBase = AbstractTransactionBase
