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

const array = require('../util/array.js')
const sha256 = require('../util/sha256.js')
const SecretKey = require('../key/ed25519/SecretKey.js')
const validator = require('../util/validator.js')
const converter = require('../util/converter.js')
const integer = require('../util/integer.js')
const Address = require('../address/Address.js')
const utf8 = require('../util/utf8.js')
const base64 = require('../util/base64.js')

/**
 * Класс для работы с транзакциями.
 * @class
 * @param {number[]|Uint8Array|Buffer} [bytes] Транзакция в бинарном виде, 150 байт.
 * @throws {Error}
 */
class Transaction {
  constructor () {
    /**
     * Транзакция в бинарном виде.
     * @type {number[]}
     * @private
     */
    this._bytes = array.arrayNew(150)
  }

  /**
   * Транзакция в бинарном виде, 150 байт.
   * @returns {number[]}
   */
  toBytes () {
    return this._bytes.slice(0)
  }

  /**
   * Транзакция в виде строки в формате Base64.
   * @returns {string}
   */
  toBase64 () {
    return base64.base64Encode(this._bytes)
  }

  /**
   * Хэш транзакции, sha256 от всех 150 байт.
   * @returns {number[]}
   */
  getHash () {
    return sha256.sha256(this._bytes)
  }

  /**
   * Версия (тип) транзакции.
   * Обязательное поле, необходимо задать сразу после создания новой транзакции.
   * Изменять тип транзакции, после того как он был задан, нельзя.
   * @returns {number}
   * @see Transaction.Genesis
   * @see Transaction.Basic
   * @see Transaction.CreateStructure
   * @see Transaction.UpdateStructure
   * @see Transaction.UpdateProfitAddress
   * @see Transaction.UpdateFeeAddress
   * @see Transaction.CreateTransitAddress
   * @see Transaction.DeleteTransitAddress
   */
  getVersion () {
    return this._bytes[0]
  }

  /**
   * Устанавливает версию и возвращает this.
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
  setVersion (version) {
    validator.validateInt(version, 0, 7)
    this._bytes[0] = version
    return this
  }

  /**
   * Отправитель. Доступно для всех типов транзакций.
   * @returns {Address}
   */
  getSender () {
    return Address.Address.fromBytes(this._bytes.slice(1, 35))
  }

  /**
   * Устанавливает отправителя и возвращает this.
   * @param {Address} address Адрес получателя.
   * @returns {Transaction}
   * @throws {Error}
   */
  setSender (address) {
    if (!(address instanceof Address.Address)) {
      throw new Error('address type must be Address')
    }
    array.arraySet(this._bytes, address.toBytes(), 1)
    return this
  }

  /**
   * Получатель.
   * Недоступно для транзакций CreateStructure и UpdateStructure.
   * @returns {Address}
   */
  getRecipient () {
    return Address.Address.fromBytes(this._bytes.slice(35, 69))
  }

  /**
   * Устанавливает получателя и возвращает this.
   * Доступно для всех типов транзакций кроме CreateStructure и UpdateStructure.
   * @param {Address} address Адрес получателя.
   * @returns {Transaction}
   * @throws {Error}
   */
  setRecipient (address) {
    if (!(address instanceof Address.Address)) {
      throw new Error('recipient type must be Address')
    }
    array.arraySet(this._bytes, address.toBytes(), 35)
    return this
  }

  /**
   * Сумма перевода в UMI-центах, цело число в промежутке от 1 до 18446744073709551615.
   * Из-за ограничений JavaScript максимальное доступное значение 9007199254740991.
   * Доступно только для Genesis и Basic транзакций.
   * @returns {number}
   */
  getValue () {
    return integer.bytesToUint64(this._bytes.slice(69, 77))
  }

  /**
   * Устанавливает сумму и возвращает this.
   * Принимает значения в промежутке от 1 до 18446744073709551615.
   * Доступно только для Genesis и Basic транзакций.
   * @param {number} value
   * @returns {Transaction}
   * @throws {Error}
   */
  setValue (value) {
    validator.validateInt(value, 1, 18446744073709551615)
    array.arraySet(this._bytes, integer.uint64ToBytes(value), 69)
    return this
  }

  /**
   * Nonce, целое число в промежутке от 0 до 18446744073709551615.
   * Генерируется автоматически при вызове sign().
   * @returns {number}
   */
  getNonce () {
    return integer.bytesToUint64(this._bytes.slice(77, 85))
  }

  /**
   * Устанавливает nonce и возвращает this.
   * @param {number} nonce Nonce, целое число в промежутке от 0 до 18446744073709551615.
   * @returns {Transaction}
   * @throws {Error}
   */
  setNonce (nonce) {
    validator.validateInt(nonce, 0, 18446744073709551615)
    array.arraySet(this._bytes, integer.uint64ToBytes(nonce), 77)
    return this
  }

  /**
   * Цифровая подпись транзакции, длина 64 байта.
   * Генерируется автоматически при вызове sign().
   * @returns {number[]}
   */
  getSignature () {
    return this._bytes.slice(85, 149)
  }

  /**
   * Устанавливает цифровую подпись и возвращает this.
   * @param {number[]|Uint8Array|Buffer} signature Подпись, длина 64 байта.
   * @returns {Transaction}
   * @throws {Error}
   */
  setSignature (signature) {
    if (signature.length !== 64) {
      throw new Error('invalid length')
    }
    array.arraySet(this._bytes, signature, 85)
    return this
  }

  /**
   * Подписать транзакцию приватным ключом.
   * @param {SecretKey} secretKey
   * @returns {Transaction}
   * @throws {Error}
   */
  sign (secretKey) {
    if (!(secretKey instanceof SecretKey.SecretKey)) {
      throw new Error('secretKey type must be SecretKey')
    }
    return this.setSignature(secretKey.sign(this._bytes.slice(0, 85)))
  }

  /**
   * Проверить транзакцию на соответствие формальным правилам.
   * @returns {boolean}
   * @throws {Error}
   */
  verify () {
    return this.getSender().getPublicKey().verifySignature(this.getSignature(), this._bytes.slice(0, 85))
  }

  /**
   * Префикс адресов, принадлежащих структуре.
   * Доступно только для CreateStructure и UpdateStructure.
   * @returns {string}
   * @returns {Error}
   */
  getPrefix () {
    return converter.versionToPrefix(integer.bytesToUint16(this._bytes.slice(35, 37)))
  }

  /**
   * Устанавливает префикс и возвращает this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} prefix Префикс адресов, принадлежащих структуре.
   * @returns {Transaction}
   * @throws {Error}
   */
  setPrefix (prefix) {
    array.arraySet(this._bytes, integer.uint16ToBytes(converter.prefixToVersion(prefix)), 35)
    return this
  }

  /**
   * Название структуры в кодировке UTF-8.
   * Доступно только для CreateStructure и UpdateStructure.
   * @returns {string}
   * @throws {Error}
   */
  getName () {
    if (this._bytes[41] > 35) {
      throw new Error('invalid length')
    }
    return utf8.Utf8Decode(this._bytes.slice(42, 42 + this._bytes[41]))
  }

  /**
   * Устанавливает название структуры.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} name Название структуры в кодировке UTF-8.
   * @returns {Transaction}
   * @throws {Error}
   */
  setName (name) {
    const bytes = utf8.Utf8Encode(name)
    if (bytes.length > 35) {
      throw new Error('name is too long')
    }
    array.arraySet(this._bytes, array.arrayNew(36), 41)
    array.arraySet(this._bytes, bytes, 42)
    this._bytes[41] = bytes.length
    return this
  }

  /**
   * Профита в сотых долях процента с шагом в 0.01%.
   * Принимает значения от 100 до 500 (соответственно от 1% до 5%).
   * Доступно только для CreateStructure и UpdateStructure.
   * @returns {number}
   */
  getProfitPercent () {
    return integer.bytesToUint16(this._bytes.slice(37, 39))
  }

  /**
   * Устанавливает процент профита и возвращает this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Профит в сотых долях процента с шагом в 0.01%.
   * Принимает значения от 100 до 500 (соответственно от 1% до 5%).
   * @returns {Transaction}
   * @throws {Error}
   */
  setProfitPercent (percent) {
    validator.validateInt(percent, 100, 500)
    array.arraySet(this._bytes, integer.uint16ToBytes(percent), 37)
    return this
  }

  /**
   * Комиссия в сотых долях процента с шагом в 0.01%.
   * Принимает значения от 0 до 2000 (соответственно от 0% до 20%).
   * Доступно только для CreateStructure и UpdateStructure.
   * @returns {number}
   */
  getFeePercent () {
    return integer.bytesToUint16(this._bytes.slice(39, 41))
  }

  /**
   * Устанавливает размер комиссии и возвращает this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Комиссия в сотых долях процента с шагом в 0.01%. Принимает значения от 0 до 2000 (соответственно от 0% до 20%).
   * @returns {Transaction}
   * @throws {Error}
   */
  setFeePercent (percent) {
    validator.validateInt(percent, 0, 2000)
    array.arraySet(this._bytes, integer.uint16ToBytes(percent), 39)
    return this
  }

  /**
   * Статический метод, создает объект из Base64 строки.
   * @param {string} base64
   * @returns {Transaction}
   * @throws {Error}
   */
  static fromBase64 (base64$1) {
    if (base64$1.length !== 200) {
      throw new Error('invalid length')
    }
    return Transaction.fromBytes(base64.base64Decode(base64$1))
  }

  /**
   * @param {number[]|Uint8Array|Buffer} bytes
   * @returns {Transaction}
   * @throws {Error}
   */
  static fromBytes (bytes) {
    if (bytes.length !== 150) {
      throw new Error('incorrect length')
    }
    const tx = new Transaction()
    array.arraySet(tx._bytes, bytes)
    return tx
  }
}
/**
 * Genesis-транзакция.
 * Может быть добавлена только в Genesis-блок.
 * Адрес отправителя должен иметь префикс genesis, адрес получателя - umi.
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
Transaction.Genesis = 0
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
Transaction.Basic = 1
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
Transaction.CreateStructure = 2
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
Transaction.UpdateStructure = 3
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
Transaction.UpdateProfitAddress = 4
/**
 * Изменение адреса на который переводится комиссия.
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
Transaction.UpdateFeeAddress = 5
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
Transaction.CreateTransitAddress = 6
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
Transaction.DeleteTransitAddress = 7

exports.Transaction = Transaction
