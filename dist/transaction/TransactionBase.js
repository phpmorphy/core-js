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

const Validator = require('../util/Validator.js')
const Sha256 = require('../util/Sha256.js')
const SecretKey = require('../key/ed25519/SecretKey.js')
const Address = require('../address/Address.js')

/**
 * Базовый класс для работы с транзакциями.
 * @class
 * @lends Transaction
 * @private
 */
class TransactionBase {
  /**
   * @param {Uint8Array} [bytes] Транзакция в бинарном виде, 150 байт.
   * @throws {Error}
   * @private
   */
  constructor (bytes) {
    /**
     * Транзакция в бинарном виде.
     * @type {Uint8Array}
     * @private
     */
    this._bytes = new Uint8Array(TransactionBase.LENGTH)
    /**
     * Транзакция в бинарном виде.
     * @type {DataView}
     * @private
     */
    this._view = new DataView(this._bytes.buffer)
    /**
     * Заполоненные свойства.
     * @type {Object}
     * @private
     */
    this._fieldsMap = {}
    if (bytes !== undefined) {
      Validator.validateUint8Array(bytes, TransactionBase.LENGTH)
      this._bytes.set(bytes)
      this._setFields([
        'version', 'sender', 'recipient', 'value', 'prefix',
        'name', 'profitPercent', 'feePercent', 'nonce', 'signature'
      ])
    }
  }

  /**
   * Длина транзакции в байтах.
   * @type {number}
   * @constant
   */
  static get LENGTH () { return 150 }
  /**
   * Genesis-транзакция.
   * Может быть добавлена только в Genesis-блок.
   * Адрес отправителя должен иметь префикс genesis, адрес получаетеля - umi.
   * @type {number}
   * @constant
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
  static get Genesis () { return 0 }
  /**
   * Стандартная транзакция. Перевод монет из одного кошелька в другой.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let recipient = Address.fromKey(secKey).setPrefix('aaa')
   * let tx = new Transaction().
   *   setVersion(Transaction.Basic).
   *   setSender(sender).
   *   setRecipient(recipient).
   *   setValue(42).
   *   sign(secKey)
   */
  static get Basic () { return 1 }
  /**
   * Создание новой структуры.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let tx = new Transaction().
   *   setVersion(Transaction.CreateStructure).
   *   setSender(sender).
   *   setPrefix('aaa').
   *   setName('🙂').
   *   setProfitPercent(100).
   *   setFeePercent(0).
   *   sign(secKey)
   */
  static get CreateStructure () { return 2 }
  /**
   * Обновление настроек существующей структуры.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let tx = new Transaction().
   *   setVersion(Transaction.UpdateStructure).
   *   setSender(sender).
   *   setPrefix('aaa').
   *   setName('🙂').
   *   setProfitPercent(500).
   *   setFeePercent(2000).
   *   sign(secKey)
   */
  static get UpdateStructure () { return 3 }
  /**
   * Изменение адреса для начисления профита.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let newPrf = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction().
   *   setVersion(Transaction.UpdateProfitAddress).
   *   setSender(sender).
   *   setRecipient(newPrf).
   *   sign(secKey)
   */
  static get UpdateProfitAddress () { return 4 }
  /**
   * Изменение адреса на который переводоится комиссия.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let newFee = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction().
   *   setVersion(Transaction.UpdateFeeAddress).
   *   setSender(sender).
   *   setRecipient(newFee).
   *   sign(secKey)
   */
  static get UpdateFeeAddress () { return 5 }
  /**
   * Активация транзитного адреса.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let transit = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction().
   *   setVersion(Transaction.CreateTransitAddress).
   *   setSender(sender).
   *   setRecipient(transit).
   *   sign(secKey)
   */
  static get CreateTransitAddress () { return 6 }
  /**
   * Деактивация транзитного адреса.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let transit = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction().
   *   setVersion(Transaction.DeleteTransitAddress).
   *   setSender(sender).
   *   setRecipient(transit).
   *   sign(secKey)
   */
  static get DeleteTransitAddress () { return 7 }
  /**
   * Транзакция в бинарном виде, 150 байт.
   * @type {Uint8Array}
   * @readonly
   */
  get bytes () {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * Хэш транзакции, sha256 от всех 150 байт.
   * @type {Uint8Array}
   * @readonly
   */
  get hash () {
    return Sha256.sha256(this._bytes)
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
    Validator.validateInt(version, TransactionBase.Genesis, TransactionBase.DeleteTransitAddress)
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
    return new Address.Address(this._bytes.subarray(1, 35))
  }

  set sender (address) {
    this._checkFields(['version'])
    if (!(address instanceof Address.Address)) {
      throw new Error('address type must be Address')
    }
    if (this.version === TransactionBase.Genesis &&
      address.version !== Address.Address.Genesis) {
      throw new Error('address version must be genesis')
    }
    if (this.version !== TransactionBase.Genesis &&
      address.version === Address.Address.Genesis) {
      throw new Error('address version must not be genesis')
    }
    this._bytes.set(address.bytes, 1)
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
    return new Address.Address(this._bytes.subarray(35, 69))
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
    if (this.version === TransactionBase.Genesis &&
      address.version !== Address.Address.Umi) {
      throw new Error('recipient version must be umi')
    }
    if (this.version !== TransactionBase.Genesis &&
      this.version !== TransactionBase.Basic &&
      address.version === Address.Address.Umi) {
      throw new Error('recipient version must not be umi')
    }
    this._bytes.set(address.bytes, 35)
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
    if (this._view.getUint16(69) > 0x001f) {
      throw new Error('value is not safe integer')
    }
    return this._view.getUint32(69) * 4294967296 +
      this._view.getUint32(69 + 4)
  }

  set value (value) {
    this._checkFields(['version'])
    this._checkVersionIsBasic()
    Validator.validateInt(value, 1, 9007199254740991)
    this._view.setInt32(69 + 4, value | 0)
    this._view.setInt32(69, (value - this._view.getUint32(69 + 4)) / 4294967296)
    this._setFields(['value'])
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
    if (this._view.getUint16(77) > 0x001f) {
      throw new Error('nonce is not safe integer')
    }
    return this._view.getUint32(77) * 4294967296 +
      this._view.getUint32(77 + 4)
  }

  set nonce (nonce) {
    Validator.validateInt(nonce, 0, 9007199254740991)
    this._view.setInt32(77 + 4, nonce | 0)
    this._view.setInt32(77, (nonce - this._view.getUint32(77 + 4)) / 4294967296)
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
   * Цифровая подпись транзкции, длина 64 байта.
   * Генерируется автоматически при вызове sign().
   * @type {Uint8Array}
   * @throws {Error}
   */
  get signature () {
    this._checkFields(['signature'])
    const len = this.sender.publicKey.signatureLength
    const sig = new Uint8Array(len)
    sig.set(this._bytes.subarray(85, 85 + len))
    return sig
  }

  set signature (signature) {
    this._checkFields(['version', 'sender'])
    Validator.validateUint8Array(signature, this.sender.publicKey.signatureLength)
    this._bytes.set(signature, 85)
    this._setFields(['signature'])
  }

  /**
   * Устанавливает цифровую подпись и возвращяет this.
   * @param {Uint8Array} signature Подпись, длина 64 байта.
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
    const msg = this._bytes.subarray(0, 85)
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
    const msg = this._bytes.subarray(0, 85)
    return this.sender.publicKey.verifySignature(this.signature, msg)
  }

  /**
   * Проверить наличие свойства.
   * @param {string[]} fields
   * @throws {Error}
   * @private
   */
  _checkFields (fields) {
    for (const field of fields) {
      if (!Object.prototype.hasOwnProperty.call(this._fieldsMap, field)) {
        throw new Error(`${field} must be set`)
      }
    }
  }

  /**
   * @throws {Error}
   * @private
   */
  _checkVersionIsBasic () {
    const versions = [TransactionBase.Genesis, TransactionBase.Basic]
    if (versions.indexOf(this.version) === -1) {
      throw new Error('unavailable for this transaction type')
    }
  }

  /**
   * @throws {Error}
   * @private
   */
  _checkVersionIsNotStruct () {
    const versions = [TransactionBase.CreateStructure, TransactionBase.UpdateStructure]
    if (versions.indexOf(this.version) !== -1) {
      throw new Error('unavailable for this transaction type')
    }
  }

  /**
   * Отметить свойство как установленное.
   * @param {string[]} fields
   * @private
   */
  _setFields (fields) {
    for (const field of fields) {
      this._fieldsMap[field] = true
    }
  }
}

exports.TransactionBase = TransactionBase
