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
import { uint16ToPrefix, prefixToUint16 } from '../util/Converter'

/**
 * Базовый класс для работы с транзакциями.
 * @class
 */
export class Transaction {
  /**
   * Длина транзакции в байтах.
   * @type {number}
   */
  static get LENGTH (): number { return 150 }

  /**
   * Genesis-транзакция.
   * Может быть добавлена только в Genesis-блок.
   * Адрес отправителя должен иметь префикс genesis, адрес получаетеля - umi.
   * @type {number}
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
   * @type {boolean}
   * @private
   * @internal
   */
  private _isVersionSet: boolean = false

  /**
   * @type {boolean}
   * @private
   * @internal
   */
  private _isSenderSet: boolean = false

  /**
   * @type {boolean}
   * @private
   * @internal
   */
  private _isRecipientSet: boolean = false

  /**
   * @type {boolean}
   * @private
   * @internal
   */
  private _isValueSet: boolean = false

  /**
   * @type {boolean}
   * @private
   * @internal
   */
  private _isPrefixSet: boolean = false

  /**
   * @type {boolean}
   * @private
   * @internal
   */
  private _isNameSet: boolean = false

  /**
   * @type {boolean}
   * @private
   * @internal
   */
  private _isProfitPercentSet: boolean = false

  /**
   * @type {boolean}
   * @private
   * @internal
   */
  private _isFeePercentSet: boolean = false

  /**
   * @type {boolean}
   * @private
   * @internal
   */
  private _isNonceSet: boolean = false

  /**
   * @type {boolean}
   * @private
   * @internal
   */
  private _isSignatureSet: boolean = false

  /**
   * @param {Uint8Array} [bytes] Транзакция в бинарном виде, 150 байт.
   * @throws {Error}
   */
  constructor (bytes?: Uint8Array) {
    if (bytes !== undefined) {
      if (!(bytes instanceof Uint8Array)) {
        throw new Error('bytes type must be Uint8Array')
      }

      if (bytes.byteLength !== Transaction.LENGTH) {
        throw new Error('bytes length must be 150 bytes')
      }

      this._bytes.set(bytes)

      this._isVersionSet = true
      this._isSenderSet = true
      this._isRecipientSet = true
      this._isValueSet = true
      this._isPrefixSet = true
      this._isNameSet = true
      this._isProfitPercentSet = true
      this._isFeePercentSet = true
      this._isNonceSet = true
      this._isSignatureSet = true
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
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }
    return this._bytes[0]
  }

  set version (version: number) {
    if (this._isVersionSet) {
      throw new Error('could not update version')
    }

    if (typeof version !== 'number') {
      throw new Error('version type must be number')
    }

    if (Math.floor(version) !== version) {
      throw new Error('version type must be integer')
    }

    if (version < Transaction.Genesis ||
      version > Transaction.DeleteTransitAddress) {
      throw new Error('incorrect version')
    }

    this._bytes[0] = version
    this._isVersionSet = true
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
    if (!this._isSenderSet) {
      throw new Error('must set sender first')
    }

    // sender length = 34
    // sender begin = 1
    // sender end = 35
    return new Address(this._bytes.subarray(1, 35))
  }

  set sender (address: Address) {
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

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
    this._isSenderSet = true
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
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version === Transaction.CreateStructure ||
      this.version === Transaction.UpdateStructure) {
      throw new Error('recipient unavailable for this transaction type')
    }

    if (!this._isRecipientSet) {
      throw new Error('must set recipient first')
    }

    // recipient length = 34
    // recipient begin = 35
    // recipient enf = 69
    return new Address(this._bytes.subarray(35, 69))
  }

  set recipient (address: Address) {
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version === Transaction.CreateStructure ||
      this.version === Transaction.UpdateStructure) {
      throw new Error('recipient unavailable for this transaction type')
    }

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
    this._isRecipientSet = true
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
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version !== Transaction.Genesis &&
      this.version !== Transaction.Basic) {
      throw new Error('value unavailable for this transaction type')
    }

    if (!this._isValueSet) {
      throw new Error('must set value first')
    }

    // value offset = 69
    if (this._view.getUint16(69) > 0x001f) {
      throw new Error('value is not safe integer')
    }

    return this._view.getUint32(69) * 0x1_0000_0000 +
      this._view.getUint32(69 + 4)
  }

  set value (value: number) {
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version !== Transaction.Genesis &&
      this.version !== Transaction.Basic) {
      throw new Error('value unavailable for this transaction type')
    }

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
    this._isValueSet = true
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
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version !== Transaction.CreateStructure &&
      this.version !== Transaction.UpdateStructure) {
      throw new Error('prefix unavailable for this transaction type')
    }

    if (!this._isPrefixSet) {
      throw new Error('must set prefix first')
    }

    // prefix offset = 35
    return uint16ToPrefix(this._view.getUint16(35))
  }

  set prefix (prefix: string) {
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version !== Transaction.CreateStructure &&
      this.version !== Transaction.UpdateStructure) {
      throw new Error('prefix unavailable for this transaction type')
    }

    // prefix offset = 35
    this._view.setUint16(35, prefixToUint16(prefix))
    this._isPrefixSet = true
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
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version !== Transaction.CreateStructure &&
      this.version !== Transaction.UpdateStructure) {
      throw new Error('name unavailable for this transaction type')
    }

    if (!this._isNameSet) {
      throw new Error('must set name first')
    }

    // name offset = 41
    const txt = this._bytes.subarray(41 + 1, 41 + 1 + this._bytes[41])
    return new TextDecoder().decode(txt)
  }

  set name (name: string) {
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version !== Transaction.CreateStructure &&
      this.version !== Transaction.UpdateStructure) {
      throw new Error('name unavailable for this transaction type')
    }

    if (typeof name !== 'string') {
      throw new Error('name type must be a string')
    }

    // name length = 36
    const txt = new TextEncoder().encode(name)

    if (txt.byteLength >= 36) {
      throw new Error('name is too long')
    }

    // name offset = 41
    this._bytes[41] = txt.byteLength
    this._bytes.set(txt, 41 + 1)
    this._isNameSet = true
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
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version !== Transaction.CreateStructure &&
      this.version !== Transaction.UpdateStructure) {
      throw new Error('profitPercent unavailable for this transaction type')
    }

    if (!this._isProfitPercentSet) {
      throw new Error('must set profitPercent first')
    }

    // profit offset = 37
    return this._view.getUint16(37)
  }

  set profitPercent (percent: number) {
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version !== Transaction.CreateStructure &&
      this.version !== Transaction.UpdateStructure) {
      throw new Error('profitPercent unavailable for this transaction type')
    }

    if (typeof percent !== 'number') {
      throw new Error('percent must be number')
    }

    if (Math.floor(percent) !== percent) {
      throw new Error('percent must be integer')
    }

    if (percent < 100 || percent > 500) {
      throw new Error('percent value must be between 100 and 500')
    }

    // profit offset = 37
    this._view.setUint16(37, percent)
    this._isProfitPercentSet = true
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
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version !== Transaction.CreateStructure &&
      this.version !== Transaction.UpdateStructure) {
      throw new Error('feePercent unavailable for this transaction type')
    }

    if (!this._isFeePercentSet) {
      throw new Error('must set feePercent first')
    }

    // fee offset = 39
    return this._view.getUint16(39)
  }

  set feePercent (percent: number) {
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (this.version !== Transaction.CreateStructure &&
      this.version !== Transaction.UpdateStructure) {
      throw new Error('feePercent unavailable for this transaction type')
    }

    if (typeof percent !== 'number') {
      throw new Error('percent type must be number')
    }

    if (Math.floor(percent) !== percent) {
      throw new Error('percent type must be integer')
    }

    if (percent < 0 || percent > 2000) {
      throw new Error('percent value must be between 100 and 500')
    }

    // fee offset = 39
    this._view.setUint16(39, percent)
    this._isFeePercentSet = true
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
    if (!this._isNonceSet) {
      throw new Error('must set nonce first')
    }

    // nonce offset = 77
    if (this._view.getUint16(77) > 0x001f) {
      throw new Error('nonce is not safe integer')
    }

    return this._view.getUint32(77) * 0x1_0000_0000 +
      this._view.getUint32(77 + 4)
  }

  set nonce (nonce: number) {
    if (typeof nonce !== 'number') {
      throw new Error('nonce type must be number')
    }

    if (Math.floor(nonce) !== nonce) {
      throw new Error('nonce type must be integer')
    }

    if (nonce < 0 || nonce > Number.MAX_SAFE_INTEGER) {
      throw new Error('nonce value must be between 0 and 9007199254740991')
    }

    // nonce offset = 77
    // tslint:disable-next-line:no-bitwise
    this._view.setInt32(77 + 4, nonce | 0)
    this._view.setInt32(77,
      (nonce - this._view.getUint32(77 + 4)) / 0x1_0000_0000)
    this._isNonceSet = true
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
    if (!this._isSenderSet) {
      throw new Error('must set sender first')
    }

    if (!this._isSignatureSet) {
      throw new Error('must set signature first')
    }

    // signature length = 64
    const len = this.sender.publicKey.signatureLength
    const sig = new Uint8Array(len)

    // signature offset = 85
    sig.set(this._bytes.subarray(85, 85 + len))
    return sig
  }

  set signature (signature: Uint8Array) {
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (!this._isSenderSet) {
      throw new Error('must set sender first')
    }

    if (!(signature instanceof Uint8Array)) {
      throw new Error('signature type must be Uint8Array')
    }

    if (signature.byteLength !== this.sender.publicKey.signatureLength) {
      throw new Error('incorrect signature length')
    }

    // signature offset = 85
    this._bytes.set(signature, 85)
    this._isSignatureSet = true
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
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

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
    if (!this._isVersionSet) {
      throw new Error('must set version first')
    }

    if (!this._isSenderSet) {
      throw new Error('must set sender first')
    }

    if (!this._isSignatureSet) {
      throw new Error('must set signature first')
    }

    // unsigned begin = 0
    // unsigned end = 85
    const msg = this._bytes.subarray(0, 85)
    return this.sender.publicKey.verifySignature(msg, this.signature)
  }
}
