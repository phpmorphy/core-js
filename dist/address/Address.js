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
const bech32 = require('../util/bech32.js')

/**
 * Класс для работы с адресами.
 * @class
 */
class Address {
  /**
   * @example
   * let address = new Address()
   */
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
   * Статический метод, создает объект из адреса в формате Bech32.
   * @param {string} bech32 Адрес в формате Bech32, длина 62 или 65 символов.
   * @returns {Address}
   * @throws {Error}
   * @example
   * let address = Address.fromBech32('umi18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5s6rxnf6')
   */
  static fromBech32 (bech32$1) {
    const adr = new Address()
    array.arraySet(adr._bytes, bech32.bech32Decode(bech32$1))
    return adr
  }

  /**
   * Статический метод, создает объект из бинарного представления.
   * @param {ArrayLike<number>} bytes Адрес в бинарном виде, длина 34 байта.
   * @returns {Address}
   * @throws {Error}
   * @example
   * let address = Address.fromBytes(new Uint8Array(34))
   */
  static fromBytes (bytes) {
    if (bytes.length !== 34) {
      throw new Error('length must be 34 bytes')
    }
    const adr = new Address()
    array.arraySet(adr._bytes, bytes)
    return adr
  }

  /**
   * Статический метод, создает объект из публичного или приватного ключа.
   * @param {(PublicKey|SecretKey)} key Публичный или приватный ключ.
   * @returns {Address}
   * @example
   * let secKey = SecretKey.fromSeed([])
   * let address = Address.fromKey(secKey)
   */
  static fromKey (key) {
    return new Address().setPublicKey(key.getPublicKey())
  }

  /**
   * Адрес в формате Bech32, длина 62 или 65 символов.
   * @returns {string}
   * @example
   * let bech32 = new Address().getBech32()
   */
  getBech32 () {
    return bech32.bech32Encode(this._bytes)
  }

  /**
   * Адрес в бинарном виде, длина 34 байта.
   * @returns {number[]}
   * @example
   * let bytes = new Address().getBytes()
   */
  getBytes () {
    return this._bytes.slice(0)
  }

  /**
   * Префикс адреса, три символа латиницы в нижнем регистре.
   * @returns {string}
   * @throws {Error}
   * @example
   * let prefix = new Address().getPrefix()
   */
  getPrefix () {
    return converter.versionToPrefix(converter.bytesToUint16(this._bytes.slice(0, 2)))
  }

  /**
   * Устанавливает префикс адреса и возвращает this.
   * @param {string} prefix Префикс адреса, три символа латиницы в нижнем регистре.
   * @returns {Address}
   * @throws {Error}
   * @example
   * let address = new Address().setPrefix('umi')
   */
  setPrefix (prefix) {
    array.arraySet(this._bytes, converter.uint16ToBytes(converter.prefixToVersion(prefix)))
    return this
  }

  /**
   * Публичный ключ.
   * @returns {PublicKey}
   * @example
   * let pubKey = new Address().getPublicKey()
   */
  getPublicKey () {
    return new PublicKey.PublicKey(this._bytes.slice(2))
  }

  /**
   * Устанавливает публичный ключ и возвращает this.
   * @param {PublicKey} publicKey Публичный ключ.
   * @returns {Address}
   * @throws {Error}
   * @example
   * let pubKey = SecretKey.fromSeed([]).getPublicKey()
   * let address = new Address().setPublicKey(pubKey)
   */
  setPublicKey (publicKey) {
    array.arraySet(this._bytes, publicKey.getBytes(), 2)
    return this
  }
}

exports.Address = Address
