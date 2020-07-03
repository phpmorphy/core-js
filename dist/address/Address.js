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
const PublicKey = require('../key/ed25519/PublicKey.js')
const SecretKey = require('../key/ed25519/SecretKey.js')
const converter = require('../util/converter.js')
const bech32 = require('../util/bech32.js')
const integer = require('../util/integer.js')

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
      array.arrayFill(this._bytes, 34)
      this.version = Address.Umi
    } else {
      if (bytes.length !== 34) {
        throw new Error('bytes length must be 34 bytes')
      }
      array.arraySet(this._bytes, bytes)
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
    return integer.bytesToUint16(this._bytes.slice(0, 2))
  }

  set version (version) {
    converter.versionToPrefix(version)
    array.arraySet(this._bytes, integer.uint16ToBytes(version))
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
    return new PublicKey.PublicKey(this._bytes.slice(2))
  }

  set publicKey (publicKey) {
    if (!(publicKey instanceof PublicKey.PublicKey)) {
      throw new Error('publicKey type must be PublicKey')
    }
    array.arraySet(this._bytes, publicKey.bytes, 2)
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
    return converter.versionToPrefix(this.version)
  }

  set prefix (prefix) {
    this.version = converter.prefixToVersion(prefix)
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
    return bech32.encode(this._bytes)
  }

  set bech32 (bech32$1) {
    array.arraySet(this._bytes, bech32.decode(bech32$1))
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
    if (key instanceof SecretKey.SecretKey) {
      return new Address().setPublicKey(key.publicKey)
    }
    if (key instanceof PublicKey.PublicKey) {
      return new Address().setPublicKey(key)
    }
    throw new Error('key type must be PublicKey or SecretKey')
  }
}

exports.Address = Address
