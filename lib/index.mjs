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
   * @param {Uint8Array} [bytes] Адрес в бинарном виде, длина 34 байта.
   * @throws {Error}
   */
  constructor (bytes) {
    /**
     * Адрес в бинарном виде, длина 34 байта.
     * @type {Uint8Array}
     * @private
     */
    this._bytes = new Uint8Array(Address.LENGTH)
    if (bytes === undefined) {
      this.version = Address.Umi
    } else {
      if (!(bytes instanceof Uint8Array)) {
        throw new Error('bytes type must be Uint8Array')
      }
      if (bytes.byteLength !== Address.LENGTH) {
        throw new Error('bytes length must be 34 bytes')
      }
      this._bytes.set(bytes)
    }
  }

  /**
   * Длина адреса в байтах.
   * @type {number}
   * @constant
   */
  static get LENGTH () { return 34 }
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
   * @type {Uint8Array}
   * @readonly
   */
  get bytes () {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * Версия адреса, префикс в числовом виде.
   * @type {number}
   * @throws {Error}
   */
  get version () {
    return new DataView(this._bytes.buffer).getUint16(0)
  }

  set version (version) {
    versionToPrefix(version)
    new DataView(this._bytes.buffer).setUint16(0, (version & 0x7FFF))
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
    return new PublicKey(this._bytes.subarray(2))
  }

  set publicKey (publicKey) {
    if (!(publicKey instanceof PublicKey)) {
      throw new Error('publicKey type must be PublicKey')
    }
    this._bytes.set(publicKey.bytes, 2)
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
    return Bech32.encode(this._bytes)
  }

  set bech32 (bech32) {
    validateStr(bech32)
    this._bytes.set(Bech32.decode(bech32))
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
   * @param {Uint8Array} bytes Публичный ключ в формате libsodium, 32 байта (256 бит).
   * @throws {Error}
   */
  constructor (bytes) {
    /**
     * Публичный ключ в бинарном виде. В формате libsodium.
     * @type {Uint8Array}
     * @private
     */
    this._bytes = new Uint8Array(PublicKey.LENGTH)
    validateUint8Array(bytes, PublicKey.LENGTH)
    this._bytes.set(bytes)
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
  get signatureLength () { return PublicKey.SIGNATURE_LENGTH }
  /**
   * Публичный ключ в формате libsodium, 32 байта (256 бит).
   * @type {Uint8Array}
   * @readonly
   */
  get bytes () {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * Проверяет цифровую подпись.
   * @param {Uint8Array} signature Подпись, 64 байта.
   * @param {Uint8Array} message Сообщение
   * @returns {boolean}
   * @throws {Error}
   * @example
   * let key = new Uint8Array(32)
   * let sig = new Uint8Array(64)
   * let msg = new Uint8Array(1)
   * let ver = new PublicKey(key).verifySignature(sig, msg)
   */
  verifySignature (signature, message) {
    validateUint8Array(signature, PublicKey.SIGNATURE_LENGTH)
    validateUint8Array(message)
    return verify(signature, message, this._bytes)
  }
}
/**
 * Базовый класс для работы с приватными ключами.
 * @class
 */
class SecretKey {
  /**
   * @param {Uint8Array} bytes Приватный ключ в бинарном виде.
   * В формате libsodium, 64 байта (512 бит).
   * @throws {Error}
   */
  constructor (bytes) {
    /**
     * Приватный ключ в бинарном виде. В формате libsodium.
     * @type {Uint8Array}
     * @private
     */
    this._bytes = new Uint8Array(SecretKey.LENGTH)
    validateUint8Array(bytes, SecretKey.LENGTH)
    this._bytes.set(bytes)
  }

  /**
   * Длина приватного ключа в формате libsodium в байтах.
   * @type {number}
   */
  static get LENGTH () { return 64 }
  /**
   * Приватный ключ в бинарном виде. В формате libsodium, 64 байта (512 бит).
   * @type {Uint8Array}
   * @readonly
   */
  get bytes () {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * Публичный ключ, соотвествующий приватному ключу.
   * @type {PublicKey}
   * @readonly
   */
  get publicKey () {
    return new PublicKey(publicKeyFromSecretKey(this._bytes))
  }

  /**
   * Создает цифровую подпись сообщения.
   * @param {Uint8Array} message Сообщение, которое необходимо подписать.
   * @returns {Uint8Array} Цифровая подпись длиной 64 байта (512 бит).
   * @throws {Error}
   * @example
   * let seed = new Uint8Array(32)
   * let msg = new Uint8Array(1)
   * let sig = SecretKey.fromSeed(seed).sign(msg)
   */
  sign (message) {
    validateUint8Array(message)
    return sign(message, this._bytes)
  }

  /**
   * Статический фабричный метод, создающий приватный ключ из seed.
   * Libsodium принимает seed длиной 32 байта (256 бит), если длина
   * отличается, то берется sha256 хэш.
   * @param {Uint8Array} seed Seed длиной от 0 до 128 байт.
   * @returns {SecretKey}
   * @throws {Error}
   * @example
   * let seed = new Uint8Array(32)
   * let key = SecretKey.fromSeed(seed)
   */
  static fromSeed (seed) {
    validateUint8Array(seed)
    if (seed.byteLength === 32) {
      return new SecretKey(secretKeyFromSeed(seed))
    }
    return new SecretKey(secretKeyFromSeed(sha256(seed)))
  }
}
/**
 * @class
 * @lends Transaction
 * @private
 */
class AbstractTransaction {
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
    this._bytes = new Uint8Array(AbstractTransaction.LENGTH)
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
      validateUint8Array(bytes, AbstractTransaction.LENGTH)
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
    validateInt(version, AbstractTransactionBase.Genesis, AbstractTransactionBase.DeleteTransitAddress)
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
    return new Address(this._bytes.subarray(1, 35))
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
    return new Address(this._bytes.subarray(35, 69))
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
    validateInt(value, 1, 9007199254740991)
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
    validateInt(nonce, 0, 9007199254740991)
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
    validateUint8Array(signature, this.sender.publicKey.signatureLength)
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
    if (!(secretKey instanceof SecretKey)) {
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
 * @param {Uint8Array} [bytes] Транзакция в бинарном виде, 150 байт.
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
    return versionToPrefix(this._view.getUint16(35))
  }

  set prefix (prefix) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    this._view.setUint16(35, prefixToVersion(prefix))
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
    const txt = this._bytes.subarray(41 + 1, 41 + 1 + this._bytes[41])
    return Utf8Decode(txt)
  }

  set name (name) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    if (typeof name !== 'string') {
      throw new Error('name type must be a string')
    }
    const txt = Utf8Encode(name)
    if (txt.byteLength >= 36) {
      throw new Error('name is too long')
    }
    this._bytes[41] = txt.byteLength
    this._bytes.set(txt, 41 + 1)
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
    return this._view.getUint16(37)
  }

  set profitPercent (percent) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    validateInt(percent, 100, 500)
    this._view.setUint16(37, percent)
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
    return this._view.getUint16(39)
  }

  set feePercent (percent) {
    this._checkFields(['version'])
    this._checkVersionIsStruct()
    validateInt(percent, 0, 2000)
    this._view.setUint16(39, percent)
    this._setFields(['feePercent'])
  }

  /**
   * Устанавливает размер комисии и возвращяет this.
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
/**
 * Конвертер адресов в формате Bech32.
 * @class
 * @private
 */
class Bech32 {
  /**
   * @type {string}
   * @private
   */
  static get _alphabet () { return 'qpzry9x8gf2tvdw0s3jn54khce6mua7l' }
  /**
   * @param {string} bech32
   * @returns {Uint8Array}
   * @throws {Error}
   */
  static decode (bech32) {
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
    this._checkAlphabet(data)
    this._verifyChecksum(pfx, data)
    const res = new Uint8Array(34)
    res.set(this._convert5to8(data.slice(0, -6)), 2)
    new DataView(res.buffer).setUint16(0, ver)
    return res
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {string}
   * @throws {Error}
   */
  static encode (bytes) {
    const version = (bytes[0] << 8) + bytes[1]
    const prefix = versionToPrefix(version)
    const data = this._convert8to5(bytes.subarray(2))
    const checksum = this._createChecksum(prefix, data)
    return prefix + '1' + data + checksum
  }

  /**
   * @param {string} chars
   * @throws {Error}
   * @private
   */
  static _checkAlphabet (chars) {
    for (const chr of chars) {
      if (this._alphabet.indexOf(chr) === -1) {
        throw new Error('bech32: invalid character')
      }
    }
  }

  /**
   * @param {string} data
   * @return {Uint8Array}
   * @private
   */
  static _convert5to8 (data) {
    let value = 0
    let bits = 0
    const bytes = this._strToBytes(data)
    const result = []
    for (let i = 0; i < bytes.byteLength; i++) {
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
    return new Uint8Array(result)
  }

  /**
   * @param {Uint8Array} data
   * @return {string}
   * @private
   */
  static _convert8to5 (data) {
    let value = 0
    let bits = 0
    let result = ''
    for (let i = 0; i < data.byteLength; i++) {
      value = (value << 8) | data[i]
      bits += 8
      while (bits >= 5) {
        bits -= 5
        result += this._alphabet[(value >> bits) & 0x1f]
      }
    }
    /* istanbul ignore else */
    if (bits > 0) {
      result += this._alphabet[(value << (5 - bits)) & 0x1f]
    }
    return result
  }

  /**
   * @param {string} prefix
   * @param {string} data
   * @private
   */
  static _createChecksum (prefix, data) {
    const bytes = this._strToBytes(data)
    const pfx = this._prefixExpand(prefix)
    const values = new Uint8Array(pfx.byteLength + bytes.byteLength + 6)
    values.set(pfx)
    values.set(bytes, pfx.byteLength)
    const polyMod = this._polyMod(values) ^ 1
    let checksum = ''
    for (let i = 0; i < 6; i++) {
      checksum += this._alphabet[(polyMod >> 5 * (5 - i)) & 31]
    }
    return checksum
  }

  /**
   * @param {Uint8Array} values
   * @return {number}
   * @private
   */
  static _polyMod (values) {
    const gen = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
    let chk = 1
    for (let i = 0; i < values.byteLength; i++) {
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

  /**
   * @param {Uint8Array} prefix
   * @throws {Uint8Array}
   * @private
   */
  static _prefixExpand (prefix) {
    const res = new Uint8Array((prefix.length * 2) + 1)
    for (let i = 0; i < prefix.length; i++) {
      const ord = prefix.charCodeAt(i)
      res[i] = ord >> 5
      res[i + prefix.length + 1] = ord & 31
    }
    return res
  }

  /**
   * @param {string} str
   * @throws {Error}
   * @private
   */
  static _strToBytes (str) {
    const bytes = []
    for (const chr of str) {
      bytes.push(this._alphabet.indexOf(chr))
    }
    return new Uint8Array(bytes)
  }

  /**
   * @param {string} prefix
   * @param {string} data
   * @private
   */
  static _verifyChecksum (prefix, data) {
    const pfx = this._prefixExpand(prefix)
    const bytes = this._strToBytes(data)
    const values = new Uint8Array(pfx.byteLength + bytes.byteLength)
    values.set(pfx)
    values.set(bytes, pfx.byteLength)
    const poly = this._polyMod(values)
    if (poly !== 1) {
      throw new Error('bech32: invalid checksum')
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
const gf0 = new Float64Array(16)
const gf1 = new Float64Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
const D2 = new Float64Array([
  0xf159, 0x26b2, 0x9b94, 0xebd6, 0xb156, 0x8283, 0x149a, 0x00e0,
  0xd130, 0xeef3, 0x80f2, 0x198e, 0xfce7, 0x56df, 0xd9dc, 0x2406
])
const X = new Float64Array([
  0xd51a, 0x8f25, 0x2d60, 0xc956, 0xa7b2, 0x9525, 0xc760, 0x692c,
  0xdc5c, 0xfdd6, 0xe231, 0xc0a4, 0x53fe, 0xcd6e, 0x36d3, 0x2169
])
const Y = new Float64Array([
  0x6658, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666,
  0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666, 0x6666
])
const L = new Float64Array([
  0xed, 0xd3, 0xf5, 0x5c, 0x1a, 0x63, 0x12, 0x58, 0xd6, 0x9c, 0xf7, 0xa2,
  0xde, 0xf9, 0xde, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x10
])
/**
 * @param {Uint8Array} r
 * @private
 */
function reduce (r) {
  const x = new Float64Array(64)
  x.set(r)
  r.set(new Float64Array(64))
  modL(r, x)
}
/**
 * @param {Uint8Array} r
 * @param {Float64Array} x
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
  modLSub(r, x)
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
}
/**
 * @param {Float64Array[]} p
 * @param {Float64Array[]} q
 * @param {Uint8Array} s
 * @private
 */
function scalarmult (p, q, s) {
  let b
  set25519(p[0], gf0)
  set25519(p[1], gf1)
  set25519(p[2], gf1)
  set25519(p[3], gf0)
  for (let i = 255; i >= 0; --i) {
    b = (s[(i / 8) | 0] >> (i & 7)) & 1
    cswap(p, q, b)
    add(q, p)
    add(p, p)
    cswap(p, q, b)
  }
}
/**
 * @param {Float64Array[]} p
 * @param {Float64Array[]} q
 * @param {number} b
 * @private
 */
function cswap (p, q, b) {
  for (let i = 0; i < 4; i++) {
    sel25519(p[i], q[i], b)
  }
}
/**
 * @param {Float64Array[]} p
 * @param {Float64Array[]} q
 * @private
 */
function add (p, q) {
  const a = new Float64Array(16)
  const b = new Float64Array(16)
  const c = new Float64Array(16)
  const d = new Float64Array(16)
  const e = new Float64Array(16)
  const f = new Float64Array(16)
  const g = new Float64Array(16)
  const h = new Float64Array(16)
  const t = new Float64Array(16)
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
 * @param {Float64Array} o
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @private
 */
function fnA (o, a, b) {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] + b[i]
  }
}
/**
 * @param {Float64Array} o
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @private
 */
function fnM (o, a, b) {
  const t = new Float64Array(31)
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      t[i + j] += a[i] * b[j]
    }
  }
  for (let i = 0; i < 15; i++) {
    t[i] += 38 * t[i + 16]
  }
  o.set(t.slice(0, 16))
  car25519(o)
  car25519(o)
}
/**
 * @param {Float64Array} o
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @private
 */
function fnZ (o, a, b) {
  for (let i = 0; i < 16; i++) {
    o[i] = a[i] - b[i]
  }
}
/**
 * @param {Float64Array} r
 * @param {Float64Array} a
 * @private
 */
function set25519 (r, a) {
  r.set(a)
}
/**
 * @param {Float64Array[]} p
 * @param {Uint8Array} s
 * @private
 */
function scalarbase (p, s) {
  const q = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)
  ]
  set25519(q[0], X)
  set25519(q[1], Y)
  set25519(q[2], gf1)
  fnM(q[3], X, Y)
  scalarmult(p, q, s)
}
/**
 * @param {Float64Array} o
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
 * @param {Uint8Array} r
 * @param {Float64Array[]} p
 * @private
 */
function pack (r, p) {
  const tx = new Float64Array(16)
  const ty = new Float64Array(16)
  const zi = new Float64Array(16)
  inv25519(zi, p[2])
  fnM(tx, p[0], zi)
  fnM(ty, p[1], zi)
  pack25519(r, ty)
  r[31] ^= par25519(tx) << 7
}
/**
 * @param {Float64Array} a
 * @private
 */
function par25519 (a) {
  const d = new Uint8Array(32)
  pack25519(d, a)
  return d[0] & 1
}
/**
 * @param {Float64Array} o
 * @param {Float64Array} a
 * @private
 */
function fnS (o, a) {
  fnM(o, a, a)
}
/**
 * @param {Float64Array} o
 * @param {Float64Array} i
 * @private
 */
function inv25519 (o, i) {
  const c = new Float64Array(16)
  c.set(i)
  for (let a = 253; a >= 0; a--) {
    fnS(c, c)
    if (a !== 2 && a !== 4) {
      fnM(c, c, i)
    }
  }
  o.set(c)
}
/**
 * @param {Float64Array} p
 * @param {Float64Array} q
 * @param {number} b
 * @private
 */
function sel25519 (p, q, b) {
  let t
  const c = ~(b - 1)
  for (let i = 0; i < 16; i++) {
    t = c & (p[i] ^ q[i])
    p[i] ^= t
    q[i] ^= t
  }
}
/**
 * @param {Uint8Array} o
 * @param {Float64Array} n
 * @private
 */
function pack25519 (o, n) {
  let b
  const m = new Float64Array(16)
  const t = new Float64Array(16)
  t.set(n)
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
    b = (m[15] >> 16) & 1
    m[14] &= 0xffff
    sel25519(t, m, 1 - b)
  }
  for (let i = 0; i < 16; i++) {
    o[2 * i] = t[i] & 0xff
    o[2 * i + 1] = t[i] >> 8
  }
}
function secretKeyFromSeed (seed) {
  const pk = new Uint8Array(32)
  const sk = new Uint8Array(64)
  sk.set(seed)
  cryptoSignKeypair(pk, sk)
  return sk
}
function publicKeyFromSecretKey (secretKey) {
  const b = new Uint8Array(32)
  b.set(new Uint8Array(secretKey.buffer, 32, 32))
  return b
}
/**
 * @param {Uint8Array} pk
 * @param {Uint8Array} sk
 * @private
 */
function cryptoSignKeypair (pk, sk) {
  const d = new Uint8Array(64)
  const p = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)
  ]
  cryptoHash(d, sk, 32)
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64
  scalarbase(p, d)
  pack(pk, p)
  sk.set(pk, 32)
  return 0
}
const K = new Float64Array([
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd, 0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019, 0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe, 0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1, 0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3, 0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483, 0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210, 0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725, 0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926, 0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8, 0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001, 0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910, 0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53, 0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb, 0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60, 0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9, 0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207, 0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6, 0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493, 0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a, 0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
])
/**
 * @param {Uint8Array} out
 * @param {Uint8Array} m
 * @param {number} n
 * @private
 */
function cryptoHash (out, m, n) {
  const hh = new Int32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ])
  const hl = new Int32Array([
    0xf3bcc908, 0x84caa73b, 0xfe94f82b, 0x5f1d36f1, 0xade682d1, 0x2b3e6c1f, 0xfb41bd6b, 0x137e2179
  ])
  const x = new Uint8Array(256)
  let i
  const b = n
  cryptoHashBlocksHl(hh, hl, m, n)
  n %= 128
  for (i = 0; i < n; i++) {
    x[i] = m[b - n + i]
  }
  x[n] = 128
  n = 256 - 128 * (n < 112 ? 1 : 0)
  x[n - 9] = 0
  ts64(x, n - 8, (b / 0x20000000) | 0, b << 3)
  cryptoHashBlocksHl(hh, hl, x, n)
  for (i = 0; i < 8; i++) {
    ts64(out, 8 * i, hh[i], hl[i])
  }
  return 0
}
/**
 * @param {Int32Array} hh
 * @param {Int32Array} hl
 * @param {Uint8Array} m
 * @param {number} n
 * @private
 */
function cryptoHashBlocksHl (hh, hl, m, n) {
  const wh = new Int32Array(16)
  const wl = new Int32Array(16)
  const bh = new Int32Array(8)
  const bl = new Int32Array(8)
  let th
  let tl
  let h
  let l
  let a
  let b
  let c
  let d
  const ah = new Int32Array(8)
  ah.set(hh)
  const al = new Int32Array(8)
  al.set(hl)
  let pos = 0
  while (n >= 128) {
    for (let i = 0; i < 16; i++) {
      const j = 8 * i + pos
      wh[i] = (m[j] << 24) | (m[j + 1] << 16) | (m[j + 2] << 8) | m[j + 3]
      wl[i] = (m[j + 4] << 24) | (m[j + 5] << 16) | (m[j + 6] << 8) | m[j + 7]
    }
    for (let i = 0; i < 80; i++) {
      bh.set(ah)
      bl.set(al)
      h = ah[7]
      l = al[7]
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = ((ah[4] >>> 14) | (al[4] << (32 - 14))) ^ ((ah[4] >>> 18) | (al[4] << (32 - 18))) ^ ((al[4] >>> (41 - 32)) | (ah[4] << (32 - (41 - 32))))
      l = ((al[4] >>> 14) | (ah[4] << (32 - 14))) ^ ((al[4] >>> 18) | (ah[4] << (32 - 18))) ^ ((ah[4] >>> (41 - 32)) | (al[4] << (32 - (41 - 32))))
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      h = (ah[4] & ah[5]) ^ (~ah[4] & ah[6])
      l = (al[4] & al[5]) ^ (~al[4] & al[6])
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      h = K[i * 2]
      l = K[i * 2 + 1]
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      h = wh[i % 16]
      l = wl[i % 16]
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      th = c & 0xffff | d << 16
      tl = a & 0xffff | b << 16
      h = th
      l = tl
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = ((ah[0] >>> 28) | (al[0] << (32 - 28))) ^ ((al[0] >>> (34 - 32)) | (ah[0] << (32 - (34 - 32)))) ^ ((al[0] >>> (39 - 32)) | (ah[0] << (32 - (39 - 32))))
      l = ((al[0] >>> 28) | (ah[0] << (32 - 28))) ^ ((ah[0] >>> (34 - 32)) | (al[0] << (32 - (34 - 32)))) ^ ((ah[0] >>> (39 - 32)) | (al[0] << (32 - (39 - 32))))
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      h = (ah[0] & ah[1]) ^ (ah[0] & ah[2]) ^ (ah[1] & ah[2])
      l = (al[0] & al[1]) ^ (al[0] & al[2]) ^ (al[1] & al[2])
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      bh[7] = (c & 0xffff) | (d << 16)
      bl[7] = (a & 0xffff) | (b << 16)
      h = bh[3]
      l = bl[3]
      a = l & 0xffff
      b = l >>> 16
      c = h & 0xffff
      d = h >>> 16
      h = th
      l = tl
      a += l & 0xffff
      b += l >>> 16
      c += h & 0xffff
      d += h >>> 16
      b += a >>> 16
      c += b >>> 16
      d += c >>> 16
      bh[3] = (c & 0xffff) | (d << 16)
      bl[3] = (a & 0xffff) | (b << 16)
      ah[1] = bh[0]
      ah[2] = bh[1]
      ah[3] = bh[2]
      ah[4] = bh[3]
      ah[5] = bh[4]
      ah[6] = bh[5]
      ah[7] = bh[6]
      ah[0] = bh[7]
      al[1] = bl[0]
      al[2] = bl[1]
      al[3] = bl[2]
      al[4] = bl[3]
      al[5] = bl[4]
      al[6] = bl[5]
      al[7] = bl[6]
      al[0] = bl[7]
      if (i % 16 === 15) {
        for (let j = 0; j < 16; j++) {
          h = wh[j]
          l = wl[j]
          a = l & 0xffff
          b = l >>> 16
          c = h & 0xffff
          d = h >>> 16
          h = wh[(j + 9) % 16]
          l = wl[(j + 9) % 16]
          a += l & 0xffff
          b += l >>> 16
          c += h & 0xffff
          d += h >>> 16
          th = wh[(j + 1) % 16]
          tl = wl[(j + 1) % 16]
          h = ((th >>> 1) | (tl << (32 - 1))) ^
            ((th >>> 8) | (tl << (32 - 8))) ^ (th >>> 7)
          l = ((tl >>> 1) | (th << (32 - 1))) ^
            ((tl >>> 8) | (th << (32 - 8))) ^ ((tl >>> 7) | (th << (32 - 7)))
          a += l & 0xffff
          b += l >>> 16
          c += h & 0xffff
          d += h >>> 16
          th = wh[(j + 14) % 16]
          tl = wl[(j + 14) % 16]
          h = ((th >>> 19) | (tl << (32 - 19))) ^ ((tl >>> (61 - 32)) | (th << (32 - (61 - 32)))) ^ (th >>> 6)
          l = ((tl >>> 19) | (th << (32 - 19))) ^ ((th >>> (61 - 32)) | (tl << (32 - (61 - 32)))) ^ ((tl >>> 6) | (th << (32 - 6)))
          a += l & 0xffff
          b += l >>> 16
          c += h & 0xffff
          d += h >>> 16
          b += a >>> 16
          c += b >>> 16
          d += c >>> 16
          wh[j] = (c & 0xffff) | (d << 16)
          wl[j] = (a & 0xffff) | (b << 16)
        }
      }
    }
    array64Sum(hh, hl, ah, al)
    pos += 128
    n -= 128
  }
  return n
}
function array64Sum (hh, hl, ah, al) {
  for (let i = 0; i < 8; i++) {
    let h = ah[i]
    let l = al[i]
    let a = l & 0xffff
    let b = l >>> 16
    let c = h & 0xffff
    let d = h >>> 16
    h = hh[i]
    l = hl[i]
    a += l & 0xffff
    b += l >>> 16
    c += h & 0xffff
    d += h >>> 16
    b += a >>> 16
    c += b >>> 16
    d += c >>> 16
    hh[i] = ah[i] = (c & 0xffff) | (d << 16)
    hl[i] = al[i] = (a & 0xffff) | (b << 16)
  }
}
/**
 * @param {Uint8Array} x
 * @param {number} i
 * @param {number} h
 * @param {number} l
 * @private
 */
function ts64 (x, i, h, l) {
  x[i] = (h >> 24) & 0xff
  x[i + 1] = (h >> 16) & 0xff
  x[i + 2] = (h >> 8) & 0xff
  x[i + 3] = h & 0xff
  x[i + 4] = (l >> 24) & 0xff
  x[i + 5] = (l >> 16) & 0xff
  x[i + 6] = (l >> 8) & 0xff
  x[i + 7] = l & 0xff
}
function sign (message, secretKey) {
  const signedMsg = new Uint8Array(64 + message.length)
  cryptoSign(signedMsg, message, message.length, secretKey)
  return new Uint8Array(signedMsg.buffer, 0, 64)
}
/**
 * Note: difference from C - smlen returned, not passed as argument.
 * @param {Uint8Array} sm
 * @param {Uint8Array} m
 * @param {number} n
 * @param {Uint8Array} sk
 * @private
 */
function cryptoSign (sm, m, n, sk) {
  const d = new Uint8Array(64)
  const h = new Uint8Array(64)
  const r = new Uint8Array(64)
  let i
  let j
  const x = new Float64Array(64)
  const p = [
    new Float64Array(16),
    new Float64Array(16),
    new Float64Array(16),
    new Float64Array(16)
  ]
  cryptoHash(d, sk, 32)
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64
  sm.set(m, 64)
  sm.set(d.subarray(32), 32)
  cryptoHash(r, sm.subarray(32), n + 32)
  reduce(r)
  scalarbase(p, r)
  pack(sm, p)
  sm.set(sk.subarray(32), 32)
  cryptoHash(h, sm, n + 64)
  reduce(h)
  x.set(r)
  for (i = 0; i < 32; i++) {
    for (j = 0; j < 32; j++) {
      x[i + j] += h[i] * d[j]
    }
  }
  modL(sm.subarray(32), x)
}
const D = new Float64Array([
  0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070,
  0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203
])
const I = new Float64Array([
  0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43,
  0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83
])
function verify (signature, message, publicKey) {
  const sm = new Uint8Array(64 + message.byteLength)
  const m = new Uint8Array(64 + message.byteLength)
  sm.set(signature)
  sm.set(message, 64)
  m.set(sm)
  return (cryptoSignOpen(m, sm, sm.byteLength, publicKey) >= 0)
}
/**
 * @param {Uint8Array} m
 * @param {Uint8Array} sm
 * @param {number} n
 * @param {Uint8Array} pk
 * @private
 */
function cryptoSignOpen (m, sm, n, pk) {
  const t = new Uint8Array(32)
  const h = new Uint8Array(64)
  const p = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)
  ]
  const q = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)
  ]
  /* istanbul ignore if */
  if (unpackneg(q, pk)) {
    return -1
  }
  m.set(sm)
  m.set(pk, 32)
  cryptoHash(h, m, n)
  reduce(h)
  scalarmult(p, q, h)
  scalarbase(q, sm.subarray(32))
  add(p, q)
  pack(t, p)
  if (cryptoVerify32(sm, t)) {
    return -1
  }
  return n
}
/**
 * @param {Float64Array[]} r
 * @param {Uint8Array} p
 * @private
 */
function unpackneg (r, p) {
  const t = new Float64Array(16)
  const chk = new Float64Array(16)
  const num = new Float64Array(16)
  const den = new Float64Array(16)
  const den2 = new Float64Array(16)
  const den4 = new Float64Array(16)
  const den6 = new Float64Array(16)
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
  if (neq25519(chk, num)) {
    fnM(r[0], r[0], I)
  }
  fnS(chk, r[0])
  fnM(chk, chk, den)
  /* istanbul ignore if */
  if (neq25519(chk, num)) {
    return -1
  }
  if (par25519(r[0]) === (p[31] >> 7)) {
    fnZ(r[0], gf0, r[0])
  }
  fnM(r[3], r[0], r[1])
  return 0
}
/**
 * @param {Uint8Array} x
 * @param {number} xi
 * @param {Uint8Array} y
 * @param {number} yi
 * @private
 */
function cryptoVerify32 (x, y) {
  let d = 0
  for (let i = 0; i < 32; i++) {
    d |= x[i] ^ y[i]
  }
  return (1 & ((d - 1) >>> 8)) - 1
}
/**
 * @param {Float64Array} o
 * @param {Uint8Array} n
 * @private
 */
function unpack25519 (o, n) {
  for (let i = 0; i < 16; i++) {
    o[i] = n[2 * i] + (n[2 * i + 1] << 8)
  }
  o[15] &= 0x7fff
}
/**
 * @param {Float64Array} o
 * @param {Float64Array} i
 * @private
 */
function pow2523 (o, i) {
  const c = new Float64Array(16)
  c.set(i)
  for (let a = 250; a >= 0; a--) {
    fnS(c, c)
    if (a !== 1) {
      fnM(c, c, i)
    }
  }
  o.set(c)
}
/**
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @private
 */
function neq25519 (a, b) {
  const c = new Uint8Array(32)
  const d = new Uint8Array(32)
  pack25519(c, a)
  pack25519(d, b)
  return cryptoVerify32(c, d)
}
/**
 * Безопасный алгоритм хеширования, SHA2-256.
 * @see https://en.wikipedia.org/wiki/SHA-2
 * @function
 * @param {Uint8Array} message message
 * @returns {Uint8Array} hash
 * @throws {Error}
 * @private
 */
function sha256 (message) {
  const h = new Int32Array([
    0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19
  ])
  const k = new Int32Array([
    0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
    0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
    0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
    0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
    0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
    0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
    0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
    0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
  ])
  /**
   * @param {Int32Array} h
   * @param {Int32Array} w
   */
  function block (h, w) {
    for (let i = 0; i < 64; i++) {
      const s1 = rotr(h[4], 6) ^ rotr(h[4], 11) ^ rotr(h[4], 25)
      const ch = (h[4] & h[5]) ^ ((~h[4]) & h[6])
      const t1 = h[7] + s1 + ch + k[i] + w[i]
      const s0 = rotr(h[0], 2) ^ rotr(h[0], 13) ^ rotr(h[0], 22)
      const ma = (h[0] & h[1]) ^ (h[0] & h[2]) ^ (h[1] & h[2])
      const t2 = s0 + ma
      h[7] = h[6]
      h[6] = h[5]
      h[5] = h[4]
      h[4] = h[3] + t1
      h[3] = h[2]
      h[2] = h[1]
      h[1] = h[0]
      h[0] = t1 + t2
    }
  }
  /**
   * @param {number} n
   * @param {number} i
   * @returns {number}
   */
  function rotr (n, i) {
    return (n >>> i) | (n << (32 - i))
  }
  /**
   * @param {Int32Array} arr
   * @returns {ArrayBuffer}
   */
  function convertEndianness (arr) {
    const d = new DataView(arr.buffer)
    arr.forEach(function (v, i) {
      d.setInt32(i * 4, v)
    })
    return d.buffer
  }
  const w = new Int32Array(64)
  const a = new Int32Array(8)
  const q = new Int32Array(new ArrayBuffer(message.length + 8 + (64 - ((message.length + 8) % 64))))
  new Uint8Array(q.buffer).set(message)
  new DataView(q.buffer).setInt8(message.byteLength, 0x80)
  new DataView(q.buffer).setUint32(q.byteLength - 4, message.byteLength * 8)
  convertEndianness(q)
  for (let j = 0; j < q.length; j += 16) {
    w.set(q.subarray(j))
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)
      w[i] = w[i - 16] + s0 + w[i - 7] + s1
    }
    a.set(h)
    block(a, w)
    a.forEach(function (v, i) {
      h[i] += v
    })
  }
  return new Uint8Array(convertEndianness(h))
}
/**
 * Конвертер строки в типизированный массив UTF-8 байтов.
 * @function
 * @param {string} text
 * @returns {Uint8Array}
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
  return new Uint8Array(bytes)
}
/**
 * Конвертер из типизированного массива UTF-8 байтов в строку.
 * @function
 * @param {Uint8Array} bytes
 * @returns {string}
 * @private
 */
function Utf8Decode (bytes) {
  let str = ''
  for (let i = 0; i < bytes.byteLength; i++) {
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
 * @param {Uint8Array} arg
 * @param {number} [len]
 */
function validateUint8Array (arg, len) {
  if (!(arg instanceof Uint8Array)) {
    throw new Error('incorrect type')
  }
  if (len !== undefined && arg.byteLength !== len) {
    throw new Error('incorrect length')
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
