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

import { Address } from '../address/Address'
import { SecretKey } from '../key/ed25519/SecretKey' // eslint-disable-line
import { versionToPrefix, prefixToVersion, bytesToUint16, bytesToUint64, uint16ToBytes, uint64ToBytes } from '../util/converter'
import { textDecode, textEncode } from '../util/text'
import { validateInt } from '../util/validator'
import { arrayNew, arraySet } from '../util/array'
import { sha256 } from '../util/sha256'

/**
 * Класс для работы с транзакциями.
 * @class
 */
export class Transaction {
  /**
   * Genesis-транзакция.\
   * Может быть добавлена только в Genesis-блок.\
   * Адрес отправителя должен иметь префикс genesis, адрес получателя - umi.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('genesis')
   * let recipient = Address.fromKey(secKey).setPrefix('umi')
   * let tx = new Transaction()
   *   .setVersion(Transaction.Genesis)
   *   .setSender(sender)
   *   .setRecipient(recipient)
   *   .setValue(42)
   *   .sign(secKey)
   */
  static Genesis: number = 0

  /**
   * Стандартная транзакция. Перевод монет из одного кошелька в другой.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let recipient = Address.fromKey(secKey).setPrefix('aaa')
   * let tx = new Transaction()
   *   .setVersion(Transaction.Basic)
   *   .setSender(sender)
   *   .setRecipient(recipient)
   *   .setValue(42)
   *   .sign(secKey)
   */
  static Basic: number = 1

  /**
   * Создание новой структуры.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let tx = new Transaction()
   *   .setVersion(Transaction.CreateStructure)
   *   .setSender(sender)
   *   .setPrefix('aaa')
   *   .setName('My Struct 🙂')
   *   .setProfitPercent(100)
   *   .setFeePercent(0)
   *   .sign(secKey)
   */
  static CreateStructure: number = 2

  /**
   * Обновление настроек существующей структуры.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let tx = new Transaction()
   *   .setVersion(Transaction.UpdateStructure)
   *   .setSender(sender)
   *   .setPrefix('aaa')
   *   .setName('My New Struct 😎')
   *   .setProfitPercent(500)
   *   .setFeePercent(2000)
   *   .sign(secKey)
   */
  static UpdateStructure: number = 3

  /**
   * Изменение адреса для начисления профита.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let newPrf = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction()
   *   .setVersion(Transaction.UpdateProfitAddress)
   *   .setSender(sender)
   *   .setRecipient(newPrf)
   *   .sign(secKey)
   */
  static UpdateProfitAddress: number = 4

  /**
   * Изменение адреса на который переводится комиссия.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let newFee = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction()
   *   .setVersion(Transaction.UpdateFeeAddress)
   *   .setSender(sender)
   *   .setRecipient(newFee)
   *   .sign(secKey)
   */
  static UpdateFeeAddress: number = 5

  /**
   * Активация транзитного адреса.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let transit = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction()
   *   .setVersion(Transaction.CreateTransitAddress)
   *   .setSender(sender)
   *   .setRecipient(transit)
   *   .sign(secKey)
   */
  static CreateTransitAddress: number = 6

  /**
   * Деактивация транзитного адреса.
   * @type {number}
   * @constant
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let sender = Address.fromKey(secKey).setPrefix('umi')
   * let transit = Address.fromBech32('aaa18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5svsuw66')
   * let tx = new Transaction()
   *   .setVersion(Transaction.DeleteTransitAddress)
   *   .setSender(sender)
   *   .setRecipient(transit)
   *   .sign(secKey)
   */
  static DeleteTransitAddress: number = 7

  /**
   * Транзакция в бинарном виде.
   * @type {number[]}
   * @private
   * @internal
   */
  protected readonly _bytes: number[] = arrayNew(150)

  /**
   * @example
   * let trx = new Transaction()
   */
  constructor () {
    this.setVersion(Transaction.Basic)
  }

  /**
   * Статический метод, создает объект из массива байтов.
   * @param {ArrayLike<number>} bytes Транзакция в бинарном виде.
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let bytes = new Uint8Array(150)
   * let trx = Transaction.fromBytes(bytes)
   */
  static fromBytes (bytes: ArrayLike<number>): Transaction {
    if (bytes.length !== 150) {
      throw new Error('invalid length')
    }
    const tx = new Transaction()
    arraySet(tx._bytes, bytes)
    return tx
  }

  /**
   * Транзакция в бинарном виде, 150 байт.
   * @returns {number[]}
   * @example
   * let bytes = new Transaction().getBytes()
   */
  getBytes (): number[] {
    return this._bytes.slice(0)
  }

  /**
   * Хэш (txid) транзакции.
   * @returns {number[]}
   * @example
   * let hash = new Transaction().getHash()
   */
  getHash (): number[] {
    return sha256(this._bytes)
  }

  /**
   * Версия (тип) транзакции.
   * @returns {number}
   * @example
   * let ver = new Transaction().getVersion()
   */
  getVersion (): number {
    return this._bytes[0]
  }

  /**
   * Устанавливает версию и возвращает this.
   * @param {number} version Версия (тип) транзакции.
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
  setVersion (version: number): Transaction {
    validateInt(version, 0, 7)
    this._bytes[0] = version
    return this
  }

  /**
   * Отправитель.\
   * Доступно для всех типов транзакций.
   * @returns {Address}
   * @example
   * let sender = new Transaction().getSender()
   */
  getSender (): Address {
    return Address.fromBytes(this._bytes.slice(1, 35))
  }

  /**
   * Устанавливает отправителя и возвращает this.
   * @param {Address} address Адрес отправителя.
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let sender = new Address()
   * let trx = new Transaction().setSender(sender)
   */
  setSender (address: Address): Transaction {
    arraySet(this._bytes, address.getBytes(), 1, 34)
    return this
  }

  /**
   * Получатель.\
   * Недоступно для транзакций CreateStructure и UpdateStructure.
   * @returns {Address}
   * @example
   * let recipient = new Transaction().getRecipient()
   */
  getRecipient (): Address {
    this.checkVersion([0, 1, 4, 5, 6, 7])
    return Address.fromBytes(this._bytes.slice(35, 69))
  }

  /**
   * Устанавливает получателя и возвращает this.\
   * Недоступно для транзакций CreateStructure и UpdateStructure.
   * @param {Address} address Адрес получателя.
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let recipient = new Address()
   * let trx = new Transaction().setRecipient(recipient)
   */
  setRecipient (address: Address): Transaction {
    this.checkVersion([0, 1, 4, 5, 6, 7])
    arraySet(this._bytes, address.getBytes(), 35)
    return this
  }

  /**
   * Сумма перевода в UMI-центах, цело число в промежутке от 1 до 18446744073709551615.\
   * Доступно только для Genesis и Basic транзакций.
   * @returns {number}
   * @example
   * let value = new Transaction().getValue()
   */
  getValue (): number {
    this.checkVersion([0, 1])
    return bytesToUint64(this._bytes.slice(69, 77))
  }

  /**
   * Устанавливает сумму и возвращает this.\
   * Принимает значения в промежутке от 1 до 18446744073709551615.\
   * Доступно только для Genesis и Basic транзакций.
   * @param {number} value Целое число от 1 до 18446744073709551615.
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let trx = new Transaction().setValue(42)
   */
  setValue (value: number): Transaction {
    this.checkVersion([0, 1])
    validateInt(value, 1, 18446744073709551615)
    arraySet(this._bytes, uint64ToBytes(value), 69)
    return this
  }

  /**
   * Nonce, целое число в промежутке от 0 до 18446744073709551615.\
   * Генерируется автоматически при вызове sign().
   * @returns {number}
   * @example
   * let nonce = new Transaction().getNonce()
   */
  getNonce (): number {
    return bytesToUint64(this._bytes.slice(77, 85))
  }

  /**
   * Устанавливает nonce и возвращает this.
   * @param {number} nonce Целое число в промежутке от 0 до 18446744073709551615.
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let nonce = Date.now()
   * let trx = new Transaction().setNonce(nonce)
   */
  setNonce (nonce: number): Transaction {
    validateInt(nonce, 0, 18446744073709551615)
    arraySet(this._bytes, uint64ToBytes(nonce), 77)
    return this
  }

  /**
   * Цифровая подпись транзакции, длина 64 байта.
   * @returns {number[]}
   * @example
   * let signature = new Transaction().getSignature()
   */
  getSignature (): number[] {
    return this._bytes.slice(85, 149)
  }

  /**
   * Устанавливает цифровую подпись и возвращает this.
   * @param {ArrayLike<number>} signature Подпись, длина 64 байта.
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let signature = new Uint8Array(64)
   * let trx = new Transaction().setSignature(signature)
   */
  setSignature (signature: ArrayLike<number>): Transaction {
    if (signature.length !== 64) {
      throw new Error('invalid length')
    }
    arraySet(this._bytes, signature, 85)
    return this
  }

  /**
   * Подписать транзакцию приватным ключом.
   * @param {SecretKey} secretKey Приватный ключ.
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let trx = new Transaction().sign(secKey)
   */
  sign (secretKey: SecretKey): Transaction {
    return this.setNonce(new Date().getTime()).setSignature(secretKey.sign(this._bytes.slice(0, 85)))
  }

  /**
   * Префикс адресов, принадлежащих структуре.\
   * Доступно только для CreateStructure и UpdateStructure.
   * @returns {string}
   * @throws {Error}
   * @example
   * let trx = new Transaction().setVersion(Transaction.CreateStructure)
   * let prefix = trx.getPrefix()
   */
  getPrefix (): string {
    this.checkVersion([2, 3])
    return versionToPrefix(bytesToUint16(this._bytes.slice(35, 37)))
  }

  /**
   * Устанавливает префикс и возвращает this.\
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} prefix Префикс адресов, принадлежащих структуре.
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let trx = new Transaction().setVersion(CreateStructure)
   * trx.setPrefix('aaa')
   */
  setPrefix (prefix: string): Transaction {
    this.checkVersion([2, 3])
    arraySet(this._bytes, uint16ToBytes(prefixToVersion(prefix)), 35)
    return this
  }

  /**
   * Название структуры в кодировке UTF-8.\
   * Доступно только для CreateStructure и UpdateStructure.
   * @returns {string}
   * @throws {Error}
   * @example
   * let trx = new Transaction().setVersion(Transaction.CreateStructure)
   * let name = trx.getName()
   */
  getName (): string {
    this.checkVersion([2, 3])
    if (this._bytes[41] > 35) {
      throw new Error('invalid length')
    }
    return textDecode(this._bytes.slice(42, 42 + this._bytes[41]))
  }

  /**
   * Устанавливает название структуры и возвращает this.\
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} name Название структуры в кодировке UTF-8.
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let trx = new Transaction().setVersion(Transaction.CreateStructure)
   * trx.setName('Hello World')
   */
  setName (name: string): Transaction {
    this.checkVersion([2, 3])
    const bytes = textEncode(name)
    if (bytes.length > 35) {
      throw new Error('name is too long')
    }
    arraySet(this._bytes, arrayNew(36), 41) // wipe
    arraySet(this._bytes, bytes, 42)
    this._bytes[41] = bytes.length
    return this
  }

  /**
   * Профита в сотых долях процента с шагом в 0.01%.\
   * Принимает значения от 100 до 500 (соответственно от 1% до 5%).\
   * Доступно только для CreateStructure и UpdateStructure.
   * @returns {number}
   * @example
   * let trx = new Transaction().setVersion(Transaction.CreateStructure)
   * let profit = trx.getProfitPercent(100)
   */
  getProfitPercent (): number {
    this.checkVersion([2, 3])
    return bytesToUint16(this._bytes.slice(37, 39))
  }

  /**
   * Устанавливает процент профита и возвращает this.\
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Профит в сотых долях процента с шагом в 0.01%.
   * Принимает значения от 100 до 500 (соответственно от 1% до 5%).
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let trx = new Transaction().setVersion(Transaction.CreateStructure)
   * trx.setProfitPercent(100)
   */
  setProfitPercent (percent: number): Transaction {
    this.checkVersion([2, 3])
    validateInt(percent, 100, 500)
    arraySet(this._bytes, uint16ToBytes(percent), 37)
    return this
  }

  /**
   * Комиссия в сотых долях процента с шагом в 0.01%.\
   * Принимает значения от 0 до 2000 (соответственно от 0% до 20%).\
   * Доступно только для CreateStructure и UpdateStructure.
   * @returns {number}
   * @example
   * let trx = new Transaction().setVersion(Transaction.CreateStructure)
   * let fee = trx.getFeePercent()
   */
  getFeePercent (): number {
    this.checkVersion([2, 3])
    return bytesToUint16(this._bytes.slice(39, 41))
  }

  /**
   * Устанавливает размер комиссии и возвращает this.\
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Комиссия в сотых долях процента с шагом в 0.01%. Принимает значения от 0 до 2000 (соответственно от 0% до 20%).
   * @returns {Transaction}
   * @throws {Error}
   * @example
   * let trx = new Transaction().setVersion(Transaction.CreateStructure)
   * trx.setFeePercent(100)
   */
  setFeePercent (percent: number): Transaction {
    this.checkVersion([2, 3])
    validateInt(percent, 0, 2000)
    arraySet(this._bytes, uint16ToBytes(percent), 39)
    return this
  }

  /**
   * Проверить транзакцию на соответствие формальным правилам.
   * @returns {boolean}
   * @throws {Error}
   * @example
   * let ver = new Transaction().verify()
   */
  verify (): boolean {
    return this.getSender().getPublicKey().verifySignature(this.getSignature(), this._bytes.slice(0, 85))
  }

  /**
   * @param {number[]} versions
   * @throws {Error}
   * @private
   * @internal
   */
  private checkVersion (versions: number[]): void {
    for (let i = 0, l = versions.length; i < l; i++) {
      if (versions[i] === this.getVersion()) {
        return
      }
    }
    throw new Error('invalid version')
  }
}
