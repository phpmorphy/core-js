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

import { SecretKey } from '../key/ed25519/SecretKey' // eslint-disable-line
import { Address } from '../address/Address'
import { sha256 } from '../util/Sha256'
import { versionToPrefix, prefixToVersion } from '../util/Converter'
import { Utf8Decode, Utf8Encode } from '../util/Utf8'
import { validateInt, validateUint8Array } from '../util/Validator'

/**
 * Базовый класс для работы с транзакциями.
 * @class
 */
export class Transaction {
  /**
   * Длина транзакции в байтах.
   * @type {number}
   * @constant
   */
  static get LENGTH (): number { return 150 }

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
  static get Genesis (): number { return 0 }

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
  static get Basic (): number { return 1 }

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
  static get CreateStructure (): number { return 2 }

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
  static get UpdateStructure (): number { return 3 }

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
  static get UpdateProfitAddress (): number { return 4 }

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
  static get UpdateFeeAddress (): number { return 5 }

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
  static get CreateTransitAddress (): number { return 6 }

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
  static get DeleteTransitAddress (): number { return 7 }

  /**
   * Транзакция в бинарном виде.
   * @type {Uint8Array}
   * @private
   * @internal
   */
  private readonly _bytes: Uint8Array = new Uint8Array(Transaction.LENGTH)

  /**
   * Транзакция в бинарном виде.
   * @type {DataView}
   * @private
   * @internal
   */
  private readonly _view: DataView = new DataView(this._bytes.buffer)

  /**
   * Заполоненные свойства.
   * @type {Object}
   * @private
   * @internal
   */
  private readonly _fieldsMap: { [key: string]: boolean } = {}

  /**
   * Проверить наличие свойства.
   * @param {string[]} fields
   * @throws {Error}
   * @private
   * @internal
   */
  private _checkFields (fields: string[]): void {
    for (const field of fields) {
      if (!Object.prototype.hasOwnProperty.call(this._fieldsMap, field)) {
        throw new Error(`${field} must be set`)
      }
    }
  }

  /**
   * @throws {Error}
   * @private
   * @internal
   */
  private _checkVersionIsStruct (): void {
    const versions = [Transaction.CreateStructure, Transaction.UpdateStructure]
    if (versions.indexOf(this.version) === -1) {
      throw new Error('unavailable for this transaction type')
    }
  }

  /**
   * @throws {Error}
   * @private
   * @internal
   */
  private _checkVersionIsNotStruct (): void {
    const versions = [Transaction.CreateStructure, Transaction.UpdateStructure]
    if (versions.indexOf(this.version) !== -1) {
      throw new Error('unavailable for this transaction type')
    }
  }

  /**
   * @throws {Error}
   * @private
   * @internal
   */
  private _checkVersionIsBasic (): void {
    const versions = [Transaction.Genesis, Transaction.Basic]
    if (versions.indexOf(this.version) === -1) {
      throw new Error('unavailable for this transaction type')
    }
  }

  /**
   * Отметить свойство как установленное.
   * @param {string[]} fields
   * @private
   * @internal
   */
  private _setFields (fields: string[]): void {
    for (const field of fields) {
      this._fieldsMap[field] = true
    }
  }

  /**
   * @param {Uint8Array} [bytes] Транзакция в бинарном виде, 150 байт.
   * @throws {Error}
   */
  constructor (bytes?: Uint8Array) {
    if (bytes !== undefined) {
      validateUint8Array(bytes, Transaction.LENGTH)

      this._bytes.set(bytes)
      this._setFields([
        'version', 'sender', 'recipient', 'value', 'prefix',
        'name', 'profitPercent', 'feePercent', 'nonce', 'signature'])
    }
  }

  /**
   * Транзакция в бинарном виде, 150 байт.
   * @type {Uint8Array}
   * @readonly
   */
  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * Хэш транзакции, sha256 от всех 150 байт.
   * @type {Uint8Array}
   * @readonly
   */
  get hash (): Uint8Array {
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

    validateInt(version, Transaction.Genesis, Transaction.DeleteTransitAddress)

    this._bytes[0] = version
    this._setFields(['version'])
  }

  /**
   * Устанавливает версию и возвращяет this.
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
  setVersion (version: number): Transaction {
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
    return new Address(this._bytes.subarray(1, 35))
  }

  set sender (address: Address) {
    this._checkFields(['version'])

    if (!(address instanceof Address)) {
      throw new Error('address type must be Address')
    }

    if (this.version === Transaction.Genesis &&
      address.version !== Address.Genesis) {
      throw new Error('address version must be genesis')
    }

    if (this.version !== Transaction.Genesis &&
      address.version === Address.Genesis) {
      throw new Error('address version must not be genesis')
    }

    // sender length = 34
    // sender begin = 1
    this._bytes.set(address.bytes, 1)
    this._setFields(['sender'])
  }

  /**
   * Устанавливает отправителя и возвращяет this.
   * @param {Address} address Адрес получателя.
   * @returns {Transaction}
   * @throws {Error}
   */
  setSender (address: Address): Transaction {
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
    return new Address(this._bytes.subarray(35, 69))
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

    if (this.version === Transaction.Genesis &&
      address.version !== Address.Umi) {
      throw new Error('recipient version must be umi')
    }

    if (this.version !== Transaction.Genesis &&
      this.version !== Transaction.Basic &&
      address.version === Address.Umi) {
      throw new Error('recipient version must not be umi')
    }

    // recipient length = 34
    // recipient begin = 35
    this._bytes.set(address.bytes, 35)
    this._setFields(['recipient'])
  }

  /**
   * Устанавливает получателя и возвращяет this.
   * Доступно для всех типов транзакций кроме CreateStructure и UpdateStructure.
   * @param {Address} address Адрес получателя.
   * @returns {Transaction}
   * @throws {Error}
   */
  setRecipient (address: Address): Transaction {
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
    if (this._view.getUint16(69) > 0x001f) {
      throw new Error('value is not safe integer')
    }

    return this._view.getUint32(69) * 0x1_0000_0000 +
      this._view.getUint32(69 + 4)
  }

  set value (value: number) {
    this._checkFields(['version'])
    this._checkVersionIsBasic()
    validateInt(value, 1, 9007199254740991)

    // value offset = 69
    // tslint:disable-next-line:no-bitwise
    this._view.setInt32(69 + 4, value | 0)
    this._view.setInt32(69,
      (value - this._view.getUint32(69 + 4)) / 0x1_0000_0000)
    this._setFields(['value'])
  }

  /**
   * Устанавливает сумму и возвращяет this.
   * Принимает значения в промежутке от 1 до 9007199254740991.
   * Доступно только для Genesis и Basic транзакций.
   * @param {number} value
   * @returns {Transaction}
   * @throws {Error}
   */
  setValue (value: number): Transaction {
    this.value = value
    return this
  }

  /**
   * Префикс адресов, принадлежащих структуре.
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {string}
   * @throws {Error}
   */
  get prefix (): string {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['prefix'])

    // prefix offset = 35
    return versionToPrefix(this._view.getUint16(35))
  }

  set prefix (prefix: string) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()

    // prefix offset = 35
    this._view.setUint16(35, prefixToVersion(prefix))
    this._setFields(['prefix'])
  }

  /**
   * Устанавливает префикс и возвращяет this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} prefix Префикс адресов, принадлежащих структуре.
   * @returns {Transaction}
   * @throws {Error}
   */
  setPrefix (prefix: string): Transaction {
    this.prefix = prefix
    return this
  }

  /**
   * Название структуры в кодировке UTF-8.
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {string}
   * @throws {Error}
   */
  get name (): string {
    this._checkFields(['version'])
    this._checkVersionIsStruct()

    this._checkFields(['name'])

    // name offset = 41
    const txt = this._bytes.subarray(41 + 1, 41 + 1 + this._bytes[41])
    return Utf8Decode(txt)
  }

  set name (name: string) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()

    if (typeof name !== 'string') {
      throw new Error('name type must be a string')
    }

    // name length = 36
    const txt = Utf8Encode(name)

    if (txt.byteLength >= 36) {
      throw new Error('name is too long')
    }

    // name offset = 41
    this._bytes[41] = txt.byteLength
    this._bytes.set(txt, 41 + 1)
    this._setFields(['name'])
  }

  /**
   * Устанавливает название структуры.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} name Название структуры в кодировке UTF-8.
   * @returns {Transaction}
   * @throws {Error}
   */
  setName (name: string): Transaction {
    this.name = name
    return this
  }

  /**
   * Профита в сотых долях процента с шагом в 0.01%.
   * Валидные значения от 100 до 500 (соотвественно от 1% до 5%).
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {number}
   * @throws {Error}
   */
  get profitPercent (): number {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['profitPercent'])

    // profit offset = 37
    return this._view.getUint16(37)
  }

  set profitPercent (percent: number) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    validateInt(percent, 100, 500)

    // profit offset = 37
    this._view.setUint16(37, percent)
    this._setFields(['profitPercent'])
  }

  /**
   * Устанавливает процент профита и возвращяет this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Профит в сотых долях процента с шагом в 0.01%. Валидные значения от 100 до 500 (соотвественно от 1% до 5%).
   * @returns {Transaction}
   * @throws {Error}
   */
  setProfitPercent (percent: number): Transaction {
    this.profitPercent = percent
    return this
  }

  /**
   * Комиссия в сотых долях процента с шагом в 0.01%.
   * Валидные значения от 0 до 2000 (соотвественно от 0% до 20%).
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {number}
   * @throws {Error}
   */
  get feePercent (): number {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['feePercent'])

    // fee offset = 39
    return this._view.getUint16(39)
  }

  set feePercent (percent: number) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    validateInt(percent, 0, 2000)

    // fee offset = 39
    this._view.setUint16(39, percent)
    this._setFields(['feePercent'])
  }

  /**
   * Устанавливает размер комисии и возвращяет this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Комиссия в сотых долях процента с шагом в 0.01%. Валидные значения от 0 до 2000 (соотвественно от 0% до 20%).
   * @returns {Transaction}
   * @throws {Error}
   */
  setFeePercent (percent: number): Transaction {
    this.feePercent = percent
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
    if (this._view.getUint16(77) > 0x001f) {
      throw new Error('nonce is not safe integer')
    }

    return this._view.getUint32(77) * 0x1_0000_0000 +
      this._view.getUint32(77 + 4)
  }

  set nonce (nonce: number) {
    validateInt(nonce, 0, 9007199254740991)

    // nonce offset = 77
    // tslint:disable-next-line:no-bitwise
    this._view.setInt32(77 + 4, nonce | 0)
    this._view.setInt32(77,
      (nonce - this._view.getUint32(77 + 4)) / 0x1_0000_0000)
    this._setFields(['nonce'])
  }

  /**
   * Устанавливает nonce и возвращяет this.
   * @param {number} nonce Nonce, целое числов промежутке от 0 до 9007199254740991.
   * @returns {Transaction}
   * @throws {Error}
   */
  setNonce (nonce: number): Transaction {
    this.nonce = nonce
    return this
  }

  /**
   * Цифровая подпись транзкции, длина 64 байта.
   * Генерируется автоматически при вызове sign().
   * @type {Uint8Array}
   * @throws {Error}
   */
  get signature (): Uint8Array {
    this._checkFields(['signature'])

    // signature length = 64
    const len = this.sender.publicKey.signatureLength
    const sig = new Uint8Array(len)

    // signature offset = 85
    sig.set(this._bytes.subarray(85, 85 + len))
    return sig
  }

  set signature (signature: Uint8Array) {
    this._checkFields(['version', 'sender'])
    validateUint8Array(signature, this.sender.publicKey.signatureLength)

    // signature offset = 85
    this._bytes.set(signature, 85)
    this._setFields(['signature'])
  }

  /**
   * Устанавливает цифровую подпись и возвращяет this.
   * @param {Uint8Array} signature Подпись, длина 64 байта.
   * @returns {Transaction}
   * @throws {Error}
   */
  setSignature (signature: Uint8Array): Transaction {
    this.signature = signature
    return this
  }

  /**
   * Подписать транзакцию приватным ключем.
   * @param {SecretKey} secretKey
   * @throws {Error}
   */
  sign (secretKey: SecretKey): Transaction {
    this._checkFields(['version', 'sender'])

    if (!(secretKey instanceof SecretKey)) {
      throw new Error('secretKey type must be SecretKey')
    }

    // unsigned begin = 0
    // unsigned end = 85
    const msg = this._bytes.subarray(0, 85)
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
    const msg = this._bytes.subarray(0, 85)
    return this.sender.publicKey.verifySignature(this.signature, msg)
  }
}
