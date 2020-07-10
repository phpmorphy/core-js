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
const converter = require('../util/converter.js')
const integer = require('../util/integer.js')
const bech32 = require('../util/bech32.js')

/**
 * Базовый класс для работы с адресами.
 * @class
 */
class Address {
  constructor () {
    /**
     * Адрес в бинарном виде, длина 34 байта.
     * @type {number[]}
     * @private
     */
    this._bytes = array.arrayNew(34)
    this.setPrefix('umi')
  }

  /**
   * Публичный ключ.
   * @returns {PublicKey}
   */
  getPublicKey () {
    return new PublicKey.PublicKey(this._bytes.slice(2))
  }

  /**
   * Устанавливает публичный ключи и возвращает this.
   * @param {PublicKey} publicKey Публичный ключ.
   * @returns {Address}
   * @throws {Error}
   */
  setPublicKey (publicKey) {
    if (!(publicKey instanceof PublicKey.PublicKey)) {
      throw new Error('publicKey type must be PublicKey')
    }
    array.arraySet(this._bytes, publicKey.toBytes(), 2)
    return this
  }

  /**
   * Префикс адреса, три символа латиницы в нижнем регистре.
   * @returns {string}
   * @throws {Error}
   */
  getPrefix () {
    return converter.versionToPrefix(integer.bytesToUint16(this._bytes.slice(0, 2)))
  }

  /**
   * Устанавливает префикс адреса и возвращает this.
   * @param {string} prefix Префикс адреса, три символа латиницы в нижнем регистре.
   * @returns {Address}
   * @throws {Error}
   */
  setPrefix (prefix) {
    array.arraySet(this._bytes, integer.uint16ToBytes(converter.prefixToVersion(prefix)))
    return this
  }

  /**
   * Адрес в формате Bech32, длина 62 символа.
   * @returns {string}
   */
  toBech32 () {
    return bech32.bech32Encode(this._bytes)
  }

  /**
   * Адрес в бинарном виде, длина 34 байта.
   * @returns {number[]}
   */
  toBytes () {
    return this._bytes.slice(0)
  }

  /**
   * @param {ArrayLike<number>} bytes
   * @returns {Address}
   * @throws {Error}
   */
  static fromBytes (bytes) {
    if (bytes.length !== 34) {
      throw new Error('bytes length must be 34 bytes')
    }
    const adr = new Address()
    array.arraySet(adr._bytes, bytes)
    return adr
  }

  /**
   * Статический метод, создает объект из адреса в формате Bech32.
   * @param {string} bech32 Адрес в формате Bech32, длина 62 или 65 символов.
   * @returns {Address}
   * @throws {Error}
   */
  static fromBech32 (bech32$1) {
    const adr = new Address()
    array.arraySet(adr._bytes, bech32.bech32Decode(bech32$1))
    return adr
  }

  /**
   * Статический метод, создает объект из публичного или приватного ключа.
   * @param {(PublicKey|SecretKey)} key Публичный или приватный ключ.
   * @returns {Address}
   */
  static fromKey (key) {
    return new Address().setPublicKey(key.getPublicKey())
  }
}

exports.Address = Address
