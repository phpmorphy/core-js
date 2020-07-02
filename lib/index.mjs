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

/**
 * Базовый класс для работы с адресами.
 * @class
 */
class Address {
  /**
   * @param {number[]|Uint8Array} [bytes] Адрес в бинарном виде, длина 34 байта.
   * @throws {Error}
   */
  constructor (bytes) {
    /**
     * Адрес в бинарном виде, длина 34 байта.
     * @type {number[]}
     * @private
     */
    this._bytes = []
    if (bytes === undefined) {
      this.version = Address.Umi
    } else {
      if (bytes.length !== 34) {
        throw new Error('bytes length must be 34 bytes')
      }
      for (let i = 0; i < 34; i++) {
        this._bytes[i] = bytes[i]
      }
    }
  }

  /**
   * Версия Genesis-адрса.
   * @type {number}
   * @constant
   */
  static get Genesis () { return 0 }
  /**
   * Версия Umi-адреса.
   * @type {number}
   * @constant
   */
  static get Umi () { return 21929 }
  /**
   * Адрес в бинарном виде, длина 34 байта.
   * @type {number[]}
   * @readonly
   */
  get bytes () {
    return this._bytes.slice(0)
  }

  /**
   * Версия адреса, префикс в числовом виде.
   * @type {number}
   * @throws {Error}
   */
  get version () {
    return (this._bytes[0] << 8) + this._bytes[1]
  }

  set version (version) {
    versionToPrefix(version)
    this._bytes[0] = (version >> 8) & 0xff
    this._bytes[1] = version & 0xff
  }

  /**
   * Устанавливает версию адреса и возвращяет this.
   * @param {number} version Версия адреса.
   * @returns {Address}
   * @throws {Error}
   */
  setVersion (version) {
    this.version = version
    return this
  }

  /**
   * Публичный ключ.
   * @type {PublicKey}
   * @throws {Error}
   */
  get publicKey () {
    return new PublicKey(this._bytes.slice(2))
  }

  set publicKey (publicKey) {
    if (!(publicKey instanceof PublicKey)) {
      throw new Error('publicKey type must be PublicKey')
    }
    const b = publicKey.bytes
    for (let i = 0; i < 32; i++) {
      this._bytes[2 + i] = b[i]
    }
  }

  /**
   * Устанавливает публичный ключи и возвращяет this.
   * @param {PublicKey} publicKey Публичный ключ.
   * @returns {Address}
   * @throws {Error}
   */
  setPublicKey (publicKey) {
    this.publicKey = publicKey
    return this
  }

  /**
   * Префикс адреса, три символа латиницы в нижнем регистре.
   * @type {string}
   * @throws {Error}
   */
  get prefix () {
    return versionToPrefix(this.version)
  }

  set prefix (prefix) {
    this.version = prefixToVersion(prefix)
  }

  /**
   * Устанавливает префикс адреса и возвращяет this.
   * @param {string} prefix Префикс адреса, три символа латиницы в нижнем регистре.
   * @returns {Address}
   * @throws {Error}
   */
  setPrefix (prefix) {
    this.prefix = prefix
    return this
  }

  /**
   * Адрес в формате Bech32, длина 62 символа.
   * @type {string}
   * @throws {Error}
   */
  get bech32 () {
    return encode(this._bytes)
  }

  set bech32 (bech32) {
    const b = decode(bech32)
    for (let i = 0; i < 32; i++) {
      this._bytes[i] = b[i]
    }
  }

  /**
   * Устанавливает адрес в формате Bech32.
   * @param {string} bech32 Адрес в формате Bech32, длина 62 символа.
   * @returns {Address}
   * @throws {Error}
   */
  setBech32 (bech32) {
    this.bech32 = bech32
    return this
  }

  /**
   * Статический фабричный метод, создающий объект из адреса в формате Bech32.
   * @param {string} bech32 Адрес в формате Bech32, длина 62 символа.
   * @returns {Address}
   * @throws {Error}
   */
  static fromBech32 (bech32) {
    return new Address().setBech32(bech32)
  }

  /**
   * Статический фабричный метод, создающий объект из публичного или приватного ключа.
   * @param {PublicKey|SecretKey} key Публичный или приватный ключ.
   * @returns {Address}
   * @throws {Error}
   */
  static fromKey (key) {
    if (key instanceof SecretKey) {
      return new Address().setPublicKey(key.publicKey)
    }
    if (key instanceof PublicKey) {
      return new Address().setPublicKey(key)
    }
    throw new Error('key type must be PublicKey or SecretKey')
  }
}
/**
 * Базовый класс для работы с блоками.
 * @class
 */
class Block {
}
/**
 * Базовый класс для работы с заголовками блоков.
 * @class
 */
class BlockHeader {
}
/**
 * Базовый класс для работы с публичными ключами.
 * @class
 */
class PublicKey {
  /**
   * @param {number[]} bytes Публичный ключ в формате libsodium, 32 байта (256 бит).
   * @throws {Error}
   */
  constructor (bytes) {
    /**
     * Публичный ключ в бинарном виде. В формате libsodium.
     * @type {number[]}
     * @private
     */
    this._bytes = []
    if (bytes.length !== 32) {
      throw new Error('invalid length')
    }
    for (let i = 0; i < 32; i++) {
      this._bytes[i] = bytes[i]
    }
  }

  /**
   * Длина публичного ключа в формате libsodium в байтах.
   * @type {number}
   * @constant
   */
  static get LENGTH () { return 32 }
  /**
   * Длина цифровой подписи в байтах.
   * @type {number}
   * @constant
   */
  static get SIGNATURE_LENGTH () { return 64 }
  /**
   * Длина цифровой подписи в байтах.
   * @type {number}
   * @constant
   */
  get signatureLength () { return 64 }
  /**
   * Публичный ключ в формате libsodium, 32 байта (256 бит).
   * @type {number[]}
   * @readonly
   */
  get bytes () {
    return this._bytes.slice(0, 32)
  }

  /**
   * Проверяет цифровую подпись.
   * @param {number[]|Uint8Array|Buffer} signature Подпись, 64 байта.
   * @param {number[]|Uint8Array|Buffer} message Сообщение
   * @returns {boolean}
   * @throws {Error}
   * @example
   * let key = new Uint8Array(32)
   * let sig = new Uint8Array(64)
   * let msg = new Uint8Array(1)
   * let ver = new PublicKey(key).verifySignature(sig, msg)
   */
  verifySignature (signature, message) {
    if (signature.length !== 64) {
      throw new Error('invalid length')
    }
    return verify(signature, message, this._bytes)
  }
}
/**
 * Базовый класс для работы с приватными ключами.
 * @class
 */
class SecretKey {
  /**
   * @param {number[]|Uint8Array|Buffer} bytes Приватный ключ в бинарном виде.
   * В формате libsodium, 64 байта (512 бит).
   * @throws {Error}
   */
  constructor (bytes) {
    /**
     * Приватный ключ в бинарном виде. В формате libsodium.
     * @type {number[]}
     * @private
     */
    this._bytes = []
    if (bytes.length !== 64) {
      throw new Error('invalid length')
    }
    for (let i = 0; i < 64; i++) {
      this._bytes[i] = bytes[i]
    }
  }

  /**
   * Длина приватного ключа в формате libsodium в байтах.
   * @type {number}
   */
  static get LENGTH () { return 64 }
  /**
   * Приватный ключ в бинарном виде. В формате libsodium, 64 байта (512 бит).
   * @type {number[]}
   * @readonly
   */
  get bytes () {
    return this._bytes.slice(0, 64)
  }

  /**
   * Публичный ключ, соответствующий приватному ключу.
   * @type {PublicKey}
   * @readonly
   */
  get publicKey () {
    return new PublicKey(this._bytes.slice(32, 64))
  }

  /**
   * Создает цифровую подпись сообщения.
   * @param {number[]|Uint8Array|Buffer} message Сообщение, которое необходимо подписать.
   * @returns {number[]} Цифровая подпись длиной 64 байта (512 бит).
   * @throws {Error}
   * @example
   * let seed = new Uint8Array(32)
   * let msg = new Uint8Array(1)
   * let sig = SecretKey.fromSeed(seed).sign(msg)
   */
  sign (message) {
    return sign(message, this._bytes)
  }

  /**
   * Статический фабричный метод, создающий приватный ключ из seed.
   * Libsodium принимает seed длиной 32 байта (256 бит), если длина
   * отличается, то берется sha256 хэш.
   * @param {number[]|Uint8Array|Buffer} seed Seed длиной от 0 до 128 байт.
   * @returns {SecretKey}
   * @throws {Error}
   * @example
   * let seed = new Uint8Array(32)
   * let key = SecretKey.fromSeed(seed)
   */
  static fromSeed (seed) {
    let entropy = seed
    if (seed.length !== 32) {
      entropy = sha256(entropy)
    }
    return new SecretKey(secretKeyFromSeed(entropy))
  }
}
/**
 * @class
 * @lends Transaction
 * @private
 */
class AbstractTransaction {
  /**
   * @param {number[]|Uint8Array} [bytes] Транзакция в бинарном виде, 150 байт.
   * @throws {Error}
   * @private
   */
  constructor (bytes) {
    /**
     * Транзакция в бинарном виде.
     * @type {number[]}
     * @private
     */
    this._bytes = []
    /**
     * Заполоненные свойства.
     * @type {Object}
     * @private
     */
    this._fieldsMap = {}
    for (let i = 0; i < 150; i++) {
      this._bytes[i] = 0
    }
    if (bytes !== undefined) {
      if (bytes.length !== 150) {
        throw new Error('incorrect length')
      }
      for (let i = 0; i < 150; i++) {
        this._bytes[i] = bytes[i]
      }
      this._setFields([
        'version', 'sender', 'recipient', 'value', 'prefix',
        'name', 'profitPercent', 'feePercent', 'nonce', 'signature'
      ])
    }
  }

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
/**
 * Базовый класс для работы с транзакциями.
 * @class
 * @lends Transaction
 * @private
 */
class AbstractTransactionBase extends AbstractTransaction {
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
  get version () {
    this._checkFields(['version'])
    return this._bytes[0]
  }

  set version (version) {
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
    return new Address(this._bytes.slice(1, 35))
  }

  set sender (address) {
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
    return new Address(this._bytes.slice(35, 69))
  }

  set recipient (address) {
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
    validateInt(value, 1, 9007199254740991)
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
    validateInt(nonce, 0, 9007199254740991)
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
    if (!(secretKey instanceof SecretKey)) {
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
    const versions = [AbstractTransaction.Genesis, AbstractTransaction.Basic]
    if (versions.indexOf(this.version) === -1) {
      throw new Error('unavailable for this transaction type')
    }
  }

  /**
   * @throws {Error}
   * @private
   */
  _checkVersionIsNotStruct () {
    const versions = [AbstractTransaction.CreateStructure, AbstractTransaction.UpdateStructure]
    if (versions.indexOf(this.version) !== -1) {
      throw new Error('unavailable for this transaction type')
    }
  }
}
/**
 * Класс для работы с транзакциями.
 * @class
 * @param {number[]} [bytes] Транзакция в бинарном виде, 150 байт.
 * @throws {Error}
 */
class Transaction extends AbstractTransactionBase {
  /**
   * @throws {Error}
   * @private
   */
  _checkVersionIsStruct () {
    const versions = [Transaction.CreateStructure, Transaction.UpdateStructure]
    if (versions.indexOf(this.version) === -1) {
      throw new Error('unavailable for this transaction type')
    }
  }

  /**
   * Префикс адресов, принадлежащих структуре.
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {string}
   * @throws {Error}
   */
  get prefix () {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['prefix'])
    const ver = (this._bytes[35] << 8) + this._bytes[36]
    return versionToPrefix(ver)
  }

  set prefix (prefix) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    const ver = prefixToVersion(prefix)
    this._bytes[35] = (ver >>> 8) & 0xff
    this._bytes[36] = ver & 0xff
    this._setFields(['prefix'])
  }

  /**
   * Устанавливает префикс и возвращяет this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} prefix Префикс адресов, принадлежащих структуре.
   * @returns {this}
   * @throws {Error}
   */
  setPrefix (prefix) {
    this.prefix = prefix
    return this
  }

  /**
   * Название структуры в кодировке UTF-8.
   * Доступно только для CreateStructure и UpdateStructure.
   * @type {string}
   * @throws {Error}
   */
  get name () {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['name'])
    const txt = this._bytes.slice(42, 42 + this._bytes[41])
    return Utf8Decode(txt)
  }

  set name (name) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    if (typeof name !== 'string') {
      throw new Error('name type must be a string')
    }
    const txt = Utf8Encode(name)
    if (txt.length >= 36) {
      throw new Error('name is too long')
    }
    this._bytes[41] = txt.length
    for (let i = 0; i < 35; i++) {
      this._bytes[42 + i] = txt[i] || 0
    }
    this._setFields(['name'])
  }

  /**
   * Устанавливает название структуры.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {string} name Название структуры в кодировке UTF-8.
   * @returns {this}
   * @throws {Error}
   */
  setName (name) {
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
  get profitPercent () {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['profitPercent'])
    return (this._bytes[37] << 8) + this._bytes[38]
  }

  set profitPercent (percent) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    validateInt(percent, 100, 500)
    this._bytes[37] = (percent >>> 8) & 0xff
    this._bytes[38] = percent & 0xff
    this._setFields(['profitPercent'])
  }

  /**
   * Устанавливает процент профита и возвращяет this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Профит в сотых долях процента с шагом в 0.01%. Валидные значения от 100 до 500 (соотвественно от 1% до 5%).
   * @returns {this}
   * @throws {Error}
   */
  setProfitPercent (percent) {
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
  get feePercent () {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._checkFields(['feePercent'])
    return (this._bytes[39] << 8) + this._bytes[40]
  }

  set feePercent (percent) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    validateInt(percent, 0, 2000)
    this._bytes[39] = (percent >>> 8) & 0xff
    this._bytes[40] = percent & 0xff
    this._setFields(['feePercent'])
  }

  /**
   * Устанавливает размер комиссии и возвращает this.
   * Доступно только для CreateStructure и UpdateStructure.
   * @param {number} percent Комиссия в сотых долях процента с шагом в 0.01%. Валидные значения от 0 до 2000 (соотвественно от 0% до 20%).
   * @returns {this}
   * @throws {Error}
   */
  setFeePercent (percent) {
    this.feePercent = percent
    return this
  }
}
const alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
/**
 * @param {number[]|Uint8Array|Buffer} bytes
 * @returns {string}
 */
function encode (bytes) {
  const version = (bytes[0] << 8) + bytes[1]
  const prefix = versionToPrefix(version)
  const data = convert8to5(bytes.slice(2))
  const checksum = createChecksum(prefix, data)
  return prefix + '1' + data + checksum
}
/**
 * @param {string} bech32
 * @returns {number[]}
 */
function decode (bech32) {
  if (bech32.length !== 62 && bech32.length !== 66) {
    throw new Error('bech32: invalid length')
  }
  const str = bech32.toLowerCase()
  const sepPos = str.lastIndexOf('1')
  if (sepPos === -1) {
    throw new Error('bech32: missing separator')
  }
  const pfx = str.slice(0, sepPos)
  const ver = prefixToVersion(pfx)
  const data = str.slice(sepPos + 1)
  checkAlphabet(data)
  verifyChecksum(pfx, data)
  const res = []
  res[0] = (ver >>> 8) & 0xff
  res[1] = ver & 0xff
  return res.concat(convert5to8(data.slice(0, -6)))
}
function convert5to8 (data) {
  let value = 0
  let bits = 0
  const bytes = strToBytes(data)
  const result = []
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 5) | bytes[i]
    bits += 5
    while (bits >= 8) {
      bits -= 8
      result.push((value >> bits) & 0xff)
    }
  }
  if ((bits >= 5) || (value << (8 - bits)) & 0xff) {
    throw new Error('bech32: invalid data')
  }
  return result
}
function convert8to5 (data) {
  let value = 0
  let bits = 0
  let result = ''
  for (let i = 0; i < data.length; i++) {
    value = (value << 8) | data[i]
    bits += 8
    while (bits >= 5) {
      bits -= 5
      result += alphabet[(value >> bits) & 0x1f]
    }
  }
  /* istanbul ignore else */
  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 0x1f]
  }
  return result
}
function createChecksum (prefix, data) {
  const bytes = strToBytes(data)
  const pfx = prefixExpand(prefix)
  const values = new Uint8Array(pfx.length + bytes.length + 6)
  values.set(pfx)
  values.set(bytes, pfx.length)
  const poly = polyMod(values) ^ 1
  let checksum = ''
  for (let i = 0; i < 6; i++) {
    checksum += alphabet[(poly >> 5 * (5 - i)) & 31]
  }
  return checksum
}
function polyMod (values) {
  const gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
  let chk = 1
  for (let i = 0; i < values.length; i++) {
    const top = chk >> 25
    chk = (chk & 0x1ffffff) << 5 ^ values[i]
    for (let j = 0; j < 5; j++) {
      chk ^= ((top >> j) & 1)
        ? gen[j]
        : 0
    }
  }
  return chk
}
function prefixExpand (prefix) {
  const res = []
  res[prefix.length] = 0
  for (let i = 0; i < prefix.length; i++) {
    const ord = prefix.charCodeAt(i)
    res[i] = ord >> 5
    res[i + prefix.length + 1] = ord & 31
  }
  return res
}
function strToBytes (str) {
  const bytes = []
  for (const chr of str) {
    bytes.push(alphabet.indexOf(chr))
  }
  return bytes
}
function verifyChecksum (prefix, data) {
  const pfx = prefixExpand(prefix)
  const bytes = strToBytes(data)
  const values = new Uint8Array(pfx.length + bytes.length)
  values.set(pfx)
  values.set(bytes, pfx.length)
  const poly = polyMod(values)
  if (poly !== 1) {
    throw new Error('bech32: invalid checksum')
  }
}
function checkAlphabet (chars) {
  for (const chr of chars) {
    if (alphabet.indexOf(chr) === -1) {
      throw new Error('bech32: invalid character')
    }
  }
}
/**
 * Конвертер цифровой версии префикса в текстовое представление.
 * @param {number} version
 * @returns {string}
 * @throws {Error}
 * @private
 */
function versionToPrefix (version) {
  validateInt(version, 0, 65535)
  if (version === 0) {
    return 'genesis'
  }
  if ((version & 0x8000) === 0x8000) {
    throw new Error('bech32: incorrect version')
  }
  const a = (version & 0x7C00) >> 10
  const b = (version & 0x03E0) >> 5
  const c = (version & 0x001F)
  checkChars([a, b, c])
  return String.fromCharCode((a + 96), (b + 96), (c + 96))
}
/**
 * Конвертер текстовой версии префикса в числовое представление.
 * @param {string} prefix
 * @returns {number}
 * @throws {Error}
 * @private
 */
function prefixToVersion (prefix) {
  if (prefix === 'genesis') {
    return 0
  }
  validateStr(prefix, 3)
  const a = prefix.charCodeAt(0) - 96
  const b = prefix.charCodeAt(1) - 96
  const c = prefix.charCodeAt(2) - 96
  checkChars([a, b, c])
  return (a << 10) + (b << 5) + c
}
/**
 * @param {number[]} chars
 * @throws {Error}
 */
function checkChars (chars) {
  for (const chr of chars) {
    if (chr < 1 || chr > 26) {
      throw new Error('bech32: incorrect prefix character')
    }
  }
}
const gf0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const gf1 = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
const D2 = [
  0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0,
  0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406
]
const X = [
  0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c,
  0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169
]
const Y = [
  0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,
  0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666
]
const L = [
  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2,
  0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10
]
/**
 * @param {number[]} r
 * @private
 */
function reduce (r) {
  const x = []
  for (let i = 0; i < 64; i++) {
    x[i] = r[i]
    r[i] = 0
  }
  modL(r, x)
}
/**
 * @param {number[]} r
 * @param {number[]} x
 * @private
 */
function modL (r, x) {
  let carry
  let j
  let k
  for (let i = 63; i >= 32; --i) {
    carry = 0
    for (j = i - 32, k = i - 12; j < k; ++j) {
      x[j] += carry - 16 * x[i] * L[j - (i - 32)]
      carry = Math.floor((x[j] + 128) / 256)
      x[j] -= carry * 256
    }
    x[j] += carry
    x[i] = 0
  }
  return modLSub(r, x)
}
function modLSub (r, x) {
  let carry = 0
  for (let j = 0; j < 32; j++) {
    x[j] += carry - (x[31] >> 4) * L[j]
    carry = x[j] >> 8
    x[j] &= 255
  }
  for (let j = 0; j < 32; j++) {
    x[j] -= carry * L[j]
  }
  for (let i = 0; i < 32; i++) {
    x[i + 1] += x[i] >> 8
    r[i] = x[i] & 255
  }
  return r
}
/**
 * @param {number[][]} p
 * @param {number[][]} q
 * @param {number[]} s
 * @private
 */
function scalarmult (p, q, s) {
  set25519(p[0], gf0)
  set25519(p[1], gf1)
  set25519(p[2], gf1)
  set25519(p[3], gf0)
  for (let i = 255; i >= 0; --i) {
    const b = (s[(i / 8) | 0] >> (i & 7)) & 1
    cswap(p, q, b)
    add(q, p)
    add(p, p)
    cswap(p, q, b)
  }
}
/**
 * @param {number[][]} p
 * @param {number[][]} q
 * @param {number} b
 * @private
 */
function cswap (p, q, b) {
  for (let i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b)
  }
}
/**
 * @param {number[][]} p
 * @param {number[][]} q
 * @private
 */
function add (p, q) {
  const a = []
  const b = []
  const c = []
  const d = []
  const e = []
  const f = []
  const g = []
  const h = []
  const t = []
  fnZ(a, p[1], p[0])
  fnZ(t, q[1], q[0])
  fnM(a, a, t)
  fnA(b, p[0], p[1])
  fnA(t, q[0], q[1])
  fnM(b, b, t)
  fnM(c, p[3], q[3])
  fnM(c, c, D2)
  fnM(d, p[2], q[2])
  fnA(d, d, d)
  fnZ(e, b, a)
  fnZ(f, d, c)
  fnA(g, d, c)
  fnA(h, b, a)
  fnM(p[0], e, f)
  fnM(p[1], h, g)
  fnM(p[2], g, f)
  fnM(p[3], e, h)
}
/**
 * @param {number[]} o
 * @param {number[]} a
 * @param {number[]} b
 * @private
 */
function fnA (o, a, b) {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] + b[i]
  }
}
/**
 * @param {number[]} o
 * @param {number[]} a
 * @param {number[]} b
 * @private
 */
function fnM (o, a, b) {
  const t = []
  for (let i = 0; i < 31; i++) {
    t[i] = 0
  }
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      t[i + j] += a[i] * b[j]
    }
  }
  for (let i = 0; i < 15; i++) {
    t[i] += 38 * t[i + 16]
  }
  for (let i = 0; i < 16; i++) {
    o[i] = t[i]
  }
  car25519(o)
  car25519(o)
}
/**
 * @param {number[]} o
 * @param {number[]} a
 * @param {number[]} b
 * @private
 */
function fnZ (o, a, b) {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] - b[i]
  }
}
/**
 * @param {number[]} r
 * @param {number[]} a
 * @private
 */
function set25519 (r, a) {
  for (let i = 0; i < 16; i++) {
    r[i] = a[i]
  }
}
/**
 * @param {number[][]} p
 * @param {number[]} s
 * @private
 */
function scalarbase (p, s) {
  const q = [[], [], [], []]
  set25519(q[0], X)
  set25519(q[1], Y)
  set25519(q[2], gf1)
  fnM(q[3], X, Y)
  scalarmult(p, q, s)
}
/**
 * @param {number[]} o
 * @private
 */
function car25519 (o) {
  let v
  let c = 1
  for (let i = 0; i < 16; i++) {
    v = o[i] + c + 65535
    c = Math.floor(v / 65536)
    o[i] = v - c * 65536
  }
  o[0] += c - 1 + 37 * (c - 1)
}
/**
 * @param {number[]} r
 * @param {number[][]} p
 * @private
 */
function pack (r, p) {
  const tx = []
  const ty = []
  const zi = []
  inv25519(zi, p[2])
  fnM(tx, p[0], zi)
  fnM(ty, p[1], zi)
  pack25519(r, ty)
  r[31] ^= par25519(tx) << 7
}
/**
 * @param {number[]} a
 * @returns {number}
 * @private
 */
function par25519 (a) {
  const d = []
  pack25519(d, a)
  return d[0] & 1
}
/**
 * @param {number[]} o
 * @param {number[]} a
 * @private
 */
function fnS (o, a) {
  fnM(o, a, a)
}
/**
 * @param {number[]} o
 * @param {number[]} i
 * @private
 */
function inv25519 (o, i) {
  const c = []
  for (let a = 0; a < 16; a++) {
    c[a] = i[a]
  }
  for (let a = 253; a >= 0; a--) {
    fnM(c, c, c)
    if (a !== 2 && a !== 4) {
      fnM(c, c, i)
    }
  }
  for (let a = 0; a < 16; a++) {
    o[a] = c[a]
  }
}
/**
 * @param {number[]} p
 * @param {number[]} q
 * @param {number} b
 * @private
 */
function sel25519 (p, q, b) {
  const c = ~(b - 1)
  for (let i = 0; i < 16; i++) {
    const t = c & (p[i] ^ q[i])
    p[i] ^= t
    q[i] ^= t
  }
}
/**
 * @param {number[]} o
 * @param {number[]} n
 * @private
 */
function pack25519 (o, n) {
  const m = []
  const t = n.slice(0)
  car25519(t)
  car25519(t)
  car25519(t)
  for (let j = 0; j < 2; j++) {
    m[0] = t[0] - 0xffed
    for (let i = 1; i < 15; i++) {
      m[i] = t[i] - 0xffff - ((m[i - 1] >> 16) & 1)
      m[i - 1] &= 0xffff
    }
    m[15] = t[15] - 0x7fff - ((m[14] >> 16) & 1)
    const b = (m[15] >> 16) & 1
    m[14] &= 0xffff
    sel25519(t, m, 1 - b)
  }
  for (let i = 0; i < 16; i++) {
    o[2 * i] = t[i] & 0xff
    o[2 * i + 1] = t[i] >> 8
  }
}
/**
 * @param {number[]|Uint8Array|Buffer} seed
 * @returns {number[]}
 */
function secretKeyFromSeed (seed) {
  const sk = []
  const pk = []
  const p = [[], [], [], []]
  for (let i = 0; i < 32; i++) {
    sk[i] = seed[i]
  }
  const d = sha512(sk)
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64
  scalarbase(p, d)
  pack(pk, p)
  return sk.concat(pk)
}
/**
 * Note: difference from C - smlen returned, not passed as argument.
 * @param {number[]|Uint8Array|Buffer} message
 * @param {number[]|Uint8Array|Buffer} secretKey
 * @returns {number[]}
 * @private
 */
function sign (message, secretKey) {
  if (secretKey.length !== 64) {
    throw new Error('secretKey - invalid length')
  }
  const d = sha512(secretKey.slice(0, 32))
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64
  const sm = d.slice(0)
  for (let i = 0, l = message.length; i < l; i++) {
    sm[64 + i] = message[i]
  }
  const r = sha512(sm.slice(32))
  reduce(r)
  const p = [[], [], [], []]
  scalarbase(p, r)
  pack(sm, p)
  for (let i = 32; i < 64; i++) {
    sm[i] = secretKey[i]
  }
  const h = sha512(sm)
  reduce(h)
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      r[i + j] += h[i] * d[j]
    }
  }
  return sm.slice(0, 32).concat(modL(sm.slice(32), r).slice(0, 32))
}
const D = [
  0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070,
  0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203
]
const I = [
  0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43,
  0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83
]
/**
 * @param {number[]|Uint8Array|Buffer} signature
 * @param {number[]|Uint8Array|Buffer} message
 * @param {number[]|Uint8Array|Buffer} pubKey
 * @returns {boolean}
 * @private
 */
function verify (signature, message, pubKey) {
  const sm = []
  const m = []
  const t = []
  const p = [[], [], [], []]
  const q = [[], [], [], []]
  /* istanbul ignore if */
  if (!unpackneg(q, pubKey)) {
    return false
  }
  for (let i = 0; i < 64; i++) {
    sm[i] = signature[i]
    m[i] = signature[i]
  }
  for (let i = 0, l = message.length; i < l; i++) {
    sm[64 + i] = message[i]
    m[64 + i] = message[i]
  }
  for (let i = 0; i < 32; i++) {
    m[i + 32] = pubKey[i]
  }
  const h = sha512(m)
  reduce(h)
  scalarmult(p, q, h)
  scalarbase(q, sm.slice(32))
  add(p, q)
  pack(t, p)
  return cryptoVerify32(sm, t)
}
/**
 * @param {number[][]} r
 * @param {number[]|Uint8Array} p
 * @returns {boolean}
 * @private
 */
function unpackneg (r, p) {
  const t = []
  const chk = []
  const num = []
  const den = []
  const den2 = []
  const den4 = []
  const den6 = []
  set25519(r[2], gf1)
  unpack25519(r[1], p)
  fnS(num, r[1])
  fnM(den, num, D)
  fnZ(num, num, r[2])
  fnA(den, r[2], den)
  fnS(den2, den)
  fnS(den4, den2)
  fnM(den6, den4, den2)
  fnM(t, den6, num)
  fnM(t, t, den)
  pow2523(t, t)
  fnM(t, t, num)
  fnM(t, t, den)
  fnM(t, t, den)
  fnM(r[0], t, den)
  fnS(chk, r[0])
  fnM(chk, chk, den)
  if (!neq25519(chk, num)) {
    fnM(r[0], r[0], I)
  }
  fnS(chk, r[0])
  fnM(chk, chk, den)
  /* istanbul ignore if */
  if (!neq25519(chk, num)) {
    return false
  }
  if (par25519(r[0]) === (p[31] >> 7)) {
    fnZ(r[0], gf0, r[0])
  }
  fnM(r[3], r[0], r[1])
  return true
}
/**
 * @param {number[]} x
 * @param {number[]} y
 * @returns {boolean}
 * @private
 */
function cryptoVerify32 (x, y) {
  let d = 0
  for (let i = 0; i < 32; i++) {
    d |= x[i] ^ y[i]
  }
  return (1 & ((d - 1) >>> 8)) === 1
}
/**
 * @param {number[]} o
 * @param {number[]} n
 * @private
 */
function unpack25519 (o, n) {
  for (let i = 0; i < 16; i++) {
    o[i] = n[2 * i] + (n[2 * i + 1] << 8)
  }
  o[15] &= 0x7fff
}
/**
 * @param {number[]} o
 * @param {number[]} i
 * @private
 */
function pow2523 (o, i) {
  const c = []
  for (let a = 0; a < 16; a++) {
    c[a] = i[a]
  }
  for (let a = 250; a >= 0; a--) {
    fnS(c, c)
    if (a !== 1) {
      fnM(c, c, i)
    }
  }
  for (let a = 0; a < 16; a++) {
    o[a] = c[a]
  }
}
/**
 * @param {number[]} a
 * @param {number[]} b
 * @throws {boolean}
 * @private
 */
function neq25519 (a, b) {
  const c = []
  const d = []
  pack25519(c, a)
  pack25519(d, b)
  return cryptoVerify32(c, d)
}
const sha256K = [
  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
]
/**
 * Безопасный алгоритм хеширования, SHA2-256.
 * @see https://en.wikipedia.org/wiki/SHA-2
 * @param {number[]|Uint8Array|Buffer} message message
 * @returns {number[]} hash
 * @private
 */
function sha256 (message) {
  const h = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19]
  const chunks = sha256PreProcess(message)
  chunks.forEach(function (w) {
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)
      w[i] = w[i - 16] + s0 + w[i - 7] + s1
    }
    sha256Block(h, w)
  })
  const digest = []
  h.forEach(function (v) {
    digest.push((v >>> 24 & 0xff), (v >>> 16 & 0xff), (v >>> 8 & 0xff), (v & 0xff))
  })
  return digest
}
/**
 * @param {number[]|Uint8Array|Buffer} message
 * @returns {number[][]}
 */
function sha256PreProcess (message) {
  const bytes = []
  for (let i = 0, l = message.length + 8 + (64 - ((message.length + 8) % 64)); i < l; i++) {
    bytes[i] = message[i] || 0
  }
  bytes[message.length] = 0x80
  bytes[bytes.length - 2] = ((message.length * 8) >>> 8) & 0xff
  bytes[bytes.length - 1] = (message.length * 8) & 0xff
  const chunks = []
  for (let i = 0, l = bytes.length; i < l; i += 64) {
    const chunk = []
    for (let j = 0; j < 64; j += 4) {
      let n = i + j
      chunk.push((bytes[n] << 24) + (bytes[++n] << 16) + (bytes[++n] << 8) + bytes[++n])
    }
    chunks.push(chunk)
  }
  return chunks
}
/**
 * @param {number[]} h
 * @param {number[]} w
 */
function sha256Block (h, w) {
  const a = []
  h.forEach(function (v, i) {
    a[i] = v
  })
  for (let i = 0; i < 64; i++) {
    const S1 = rotr(a[4], 6) ^ rotr(a[4], 11) ^ rotr(a[4], 25)
    const ch = (a[4] & a[5]) ^ ((~a[4]) & a[6])
    const t1 = a[7] + S1 + ch + sha256K[i] + w[i]
    const S0 = rotr(a[0], 2) ^ rotr(a[0], 13) ^ rotr(a[0], 22)
    const ma = (a[0] & a[1]) ^ (a[0] & a[2]) ^ (a[1] & a[2])
    const t2 = S0 + ma
    a[7] = a[6]
    a[6] = a[5]
    a[5] = a[4]
    a[4] = a[3] + t1
    a[3] = a[2]
    a[2] = a[1]
    a[1] = a[0]
    a[0] = t1 + t2
  }
  a.forEach(function (v, i) {
    h[i] = h[i] + v | 0
  })
}
/**
 * @param {number} n
 * @param {number} i
 * @returns {number}
 */
function rotr (n, i) {
  return (n >>> i) | (n << (32 - i))
}
const sha512K = [
  [0x428a2f98, 0xd728ae22], [0x71374491, 0x23ef65cd], [0xb5c0fbcf, 0xec4d3b2f], [0xe9b5dba5, 0x8189dbbc], [0x3956c25b, 0xf348b538],
  [0x59f111f1, 0xb605d019], [0x923f82a4, 0xaf194f9b], [0xab1c5ed5, 0xda6d8118], [0xd807aa98, 0xa3030242], [0x12835b01, 0x45706fbe],
  [0x243185be, 0x4ee4b28c], [0x550c7dc3, 0xd5ffb4e2], [0x72be5d74, 0xf27b896f], [0x80deb1fe, 0x3b1696b1], [0x9bdc06a7, 0x25c71235],
  [0xc19bf174, 0xcf692694], [0xe49b69c1, 0x9ef14ad2], [0xefbe4786, 0x384f25e3], [0x0fc19dc6, 0x8b8cd5b5], [0x240ca1cc, 0x77ac9c65],
  [0x2de92c6f, 0x592b0275], [0x4a7484aa, 0x6ea6e483], [0x5cb0a9dc, 0xbd41fbd4], [0x76f988da, 0x831153b5], [0x983e5152, 0xee66dfab],
  [0xa831c66d, 0x2db43210], [0xb00327c8, 0x98fb213f], [0xbf597fc7, 0xbeef0ee4], [0xc6e00bf3, 0x3da88fc2], [0xd5a79147, 0x930aa725],
  [0x06ca6351, 0xe003826f], [0x14292967, 0x0a0e6e70], [0x27b70a85, 0x46d22ffc], [0x2e1b2138, 0x5c26c926], [0x4d2c6dfc, 0x5ac42aed],
  [0x53380d13, 0x9d95b3df], [0x650a7354, 0x8baf63de], [0x766a0abb, 0x3c77b2a8], [0x81c2c92e, 0x47edaee6], [0x92722c85, 0x1482353b],
  [0xa2bfe8a1, 0x4cf10364], [0xa81a664b, 0xbc423001], [0xc24b8b70, 0xd0f89791], [0xc76c51a3, 0x0654be30], [0xd192e819, 0xd6ef5218],
  [0xd6990624, 0x5565a910], [0xf40e3585, 0x5771202a], [0x106aa070, 0x32bbd1b8], [0x19a4c116, 0xb8d2d0c8], [0x1e376c08, 0x5141ab53],
  [0x2748774c, 0xdf8eeb99], [0x34b0bcb5, 0xe19b48a8], [0x391c0cb3, 0xc5c95a63], [0x4ed8aa4a, 0xe3418acb], [0x5b9cca4f, 0x7763e373],
  [0x682e6ff3, 0xd6b2b8a3], [0x748f82ee, 0x5defb2fc], [0x78a5636f, 0x43172f60], [0x84c87814, 0xa1f0ab72], [0x8cc70208, 0x1a6439ec],
  [0x90befffa, 0x23631e28], [0xa4506ceb, 0xde82bde9], [0xbef9a3f7, 0xb2c67915], [0xc67178f2, 0xe372532b], [0xca273ece, 0xea26619c],
  [0xd186b8c7, 0x21c0c207], [0xeada7dd6, 0xcde0eb1e], [0xf57d4f7f, 0xee6ed178], [0x06f067aa, 0x72176fba], [0x0a637dc5, 0xa2c898a6],
  [0x113f9804, 0xbef90dae], [0x1b710b35, 0x131c471b], [0x28db77f5, 0x23047d84], [0x32caab7b, 0x40c72493], [0x3c9ebe0a, 0x15c9bebc],
  [0x431d67c4, 0x9c100d4c], [0x4cc5d4be, 0xcb3e42b6], [0x597f299c, 0xfc657e2a], [0x5fcb6fab, 0x3ad6faec], [0x6c44198c, 0x4a475817]
]
/**
 * Безопасный алгоритм хеширования, SHA2-512.
 * @see https://en.wikipedia.org/wiki/SHA-2
 * @param {number[]|Uint8Array|Buffer} message message
 * @returns {number[]} hash
 * @private
 */
function sha512 (message) {
  const h = [
    [0x6a09e667, 0xf3bcc908], [0xbb67ae85, 0x84caa73b], [0x3c6ef372, 0xfe94f82b], [0xa54ff53a, 0x5f1d36f1],
    [0x510e527f, 0xade682d1], [0x9b05688c, 0x2b3e6c1f], [0x1f83d9ab, 0xfb41bd6b], [0x5be0cd19, 0x137e2179]
  ]
  const chunks = sha512PreProcess(message)
  chunks.forEach(function (w) {
    for (let i = 16; i < 80; i++) {
      const s0 = xor64(xor64(rotr64(w[i - 15], 1), rotr64(w[i - 15], 8)), shft64(w[i - 15], 7))
      const s1 = xor64(xor64(rotr64(w[i - 2], 19), rotr64(w[i - 2], 61)), shft64(w[i - 2], 6))
      w[i] = sum64(sum64(w[i - 16], s0), sum64(w[i - 7], s1))
    }
    sha512Block(h, w)
  })
  const digest = []
  h.forEach(function (v) {
    digest.push((v[0] >>> 24 & 0xff), (v[0] >>> 16 & 0xff), (v[0] >>> 8 & 0xff), (v[0] & 0xff))
    digest.push((v[1] >>> 24 & 0xff), (v[1] >>> 16 & 0xff), (v[1] >>> 8 & 0xff), (v[1] & 0xff))
  })
  return digest
}
/**
 * @param {number[]|Uint8Array|Buffer} message
 * @returns {[number, number][][]}
 */
function sha512PreProcess (message) {
  const bytez = []
  for (let i = 0, l = message.length + 16 + (128 - ((message.length + 16) % 128)); i < l; i++) {
    bytez[i] = message[i] || 0
  }
  bytez[message.length] = 0x80
  bytez[bytez.length - 2] = ((message.length * 8) >>> 8) & 0xff
  bytez[bytez.length - 1] = (message.length * 8) & 0xff
  const chunks = []
  for (let i = 0, l = bytez.length; i < l; i += 128) {
    const chunk = []
    for (let j = 0; j < 128; j += 8) {
      let n = i + j
      chunk.push([
        (bytez[n] << 24) + (bytez[++n] << 16) + (bytez[++n] << 8) + bytez[++n],
        (bytez[++n] << 24) + (bytez[++n] << 16) + (bytez[++n] << 8) + bytez[++n]
      ])
    }
    chunks.push(chunk)
  }
  return chunks
}
/**
 * @param {[number, number][]} h
 * @param {[number, number][]} w
 */
function sha512Block (h, w) {
  const a = []
  h.forEach(function (v, i) {
    a[i] = [v[0], v[1]]
  })
  for (let i = 0; i < 80; i++) {
    const S1 = xor64(xor64(rotr64(a[4], 14), rotr64(a[4], 18)), rotr64(a[4], 41))
    const ch = xor64(and64(a[4], a[5]), and64(not64(a[4]), a[6]))
    const t1 = sum64(sum64(sum64(a[7], S1), sum64(ch, sha512K[i])), w[i])
    const S0 = xor64(xor64(rotr64(a[0], 28), rotr64(a[0], 34)), rotr64(a[0], 39))
    const ma = xor64(xor64(and64(a[0], a[1]), and64(a[0], a[2])), and64(a[1], a[2]))
    const t2 = sum64(S0, ma)
    a[7] = a[6]
    a[6] = a[5]
    a[5] = a[4]
    a[4] = sum64(a[3], t1)
    a[3] = a[2]
    a[2] = a[1]
    a[1] = a[0]
    a[0] = sum64(t1, t2)
  }
  a.forEach(function (v, i) {
    h[i] = sum64(h[i], v)
  })
}
function shft64 (n, i) {
  return [(n[0] >>> i), (n[1] >>> i) | (n[0] << (32 - i))]
}
function rotr64 (n, i) {
  if (i < 32) {
    return [n[0] >>> i | n[1] << (32 - i), n[1] >>> i | n[0] << (32 - i)]
  }
  return [
    n[1] >>> (i - 32) | n[0] << (32 - (i - 32)),
    n[0] >>> (i - 32) | n[1] << (32 - (i - 32))
  ]
}
function xor64 (a, b) {
  return [(a[0] ^ b[0]), (a[1] ^ b[1])]
}
function and64 (a, b) {
  return [(a[0] & b[0]), (a[1] & b[1])]
}
function not64 (n) {
  return [~n[0], ~n[1]]
}
/**
 * @param {[number, number]} a
 * @param {[number, number]} b
 * @returns {[number, number]}
 * @private
 */
function sum64 (a, b) {
  const x = [0, 0, 0, 0]
  x[3] = (a[1] & 0xffff) + (b[1] & 0xffff)
  x[2] = (a[1] >>> 16) + (b[1] >>> 16) + (x[3] >>> 16)
  x[1] = (a[0] & 0xffff) + (b[0] & 0xffff) + (x[2] >>> 16)
  x[0] = (a[0] >>> 16) + (b[0] >>> 16) + (x[1] >>> 16)
  return [((x[0] & 0xffff) << 16) + (x[1] & 0xffff), ((x[2] & 0xffff) << 16) + (x[3] & 0xffff)]
}
/**
 * Конвертер строки в типизированный массив UTF-8 байтов.
 * @function
 * @param {string} text
 * @returns {number[]}
 * @private
 */
function Utf8Encode (text) {
  const bytes = []
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i)
    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push((0xe0 | (code >> 12)), (0x80 | ((code >> 6) & 0x3f)))
      bytes.push(0x80 | (code & 0x3f))
    } else {
      code = 0x10000 + ((code & 0x3ff) << 10) + (text.charCodeAt(++i) & 0x3ff)
      bytes.push((0xf0 | (code >> 18)), (0x80 | ((code >> 12) & 0x3f)))
      bytes.push((0x80 | ((code >> 6) & 0x3f)), (0x80 | (code & 0x3f)))
    }
  }
  return bytes
}
/**
 * Конвертер из типизированного массива UTF-8 байтов в строку.
 * @function
 * @param {number[]|Uint8Array|Buffer} bytes
 * @returns {string}
 * @private
 */
function Utf8Decode (bytes) {
  let str = ''
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] < 0x80) {
      str += String.fromCharCode(bytes[i])
    } else if (bytes[i] > 0xBF && bytes[i] < 0xE0) {
      str += String.fromCharCode((bytes[i] & 0x1F) << 6 | bytes[++i] & 0x3F)
    } else if (bytes[i] > 0xDF && bytes[i] < 0xF0) {
      str += String.fromCharCode((bytes[i] & 0x0F) << 12 |
        (bytes[++i] & 0x3F) << 6 | bytes[++i] & 0x3F)
    } else {
      const code = ((bytes[i] & 0x07) << 18 | (bytes[++i] & 0x3F) << 12 |
        (bytes[++i] & 0x3F) << 6 | bytes[++i] & 0x3F) - 0x010000
      str += String.fromCharCode(code >> 10 | 0xD800, code & 0x03FF | 0xDC00)
    }
  }
  return str
}
/**
 * @param {number} arg
 * @param {number} min
 * @param {number} max
 * @throws {Error}
 */
function validateInt (arg, min, max) {
  if (typeof arg !== 'number') {
    throw new Error('incorrect type')
  }
  if (Math.floor(arg) !== arg) {
    throw new Error('not integer')
  }
  if (arg < min || arg > max) {
    throw new Error('incorrect value')
  }
}
/**
 * @param {string} arg
 * @param {number} [len]
 */
function validateStr (arg, len) {
  if (typeof arg !== 'string') {
    throw new Error('incorrect type')
  }
  if (len !== undefined && arg.length !== len) {
    throw new Error('incorrect length')
  }
}

export { Address, Block, BlockHeader, PublicKey, SecretKey, Transaction }
