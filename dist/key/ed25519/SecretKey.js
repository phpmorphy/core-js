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

const array = require('../../util/array.js')
const index = require('../../util/ed25519/index.js')
const PublicKey = require('./PublicKey.js')
const sha256 = require('../../util/sha256.js')

/**
 * Класс для работы с приватными ключами.
 * @class
 */
class SecretKey {
  /**
   * @param {ArrayLike<number>} bytes Приватный ключ в бинарном виде.
   * В формате libsodium, 64 байта.
   * @throws {Error}
   * @example
   * let bytes = SecretKey.fromSeed(new Uint8Array(32)).getBytes()
   * let secKey = new SecretKey(bytes)
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
    array.arraySet(this._bytes, bytes)
  }

  /**
   * Статический метод, создающий приватный ключ из seed.\
   * Libsodium принимает seed длиной 32 байта, поэтому если длина
   * отличается, то берется sha256 хэш.
   * @param {ArrayLike<number>} seed Массив байтов любой длины.
   * @returns {SecretKey}
   * @example
   * let seed = new Uint8Array(32)
   * let secKey = SecretKey.fromSeed(seed)
   */
  static fromSeed (seed) {
    let entropy = seed
    if (seed.length !== 32) {
      entropy = sha256.sha256(entropy)
    }
    return new SecretKey(index.secretKeyFromSeed(entropy))
  }

  /**
   * Приватный ключ в бинарном виде. В формате libsodium, 64 байта.
   * @returns {number[]}
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let bytes = secKey.getBytes()
   */
  getBytes () {
    return this._bytes.slice(0)
  }

  /**
   * Публичный ключ, соответствующий приватному ключу.
   * @returns {PublicKey}
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let pubKey = secKey.getPublicKey()
   */
  getPublicKey () {
    return new PublicKey.PublicKey(this._bytes.slice(32, 64))
  }

  /**
   * Создает цифровую подпись сообщения.
   * @param {ArrayLike<number>} message Сообщение, которое необходимо подписать.
   * @returns {number[]} Подпись длиной 64 байта.
   * @example
   * let secKey = SecretKey.fromSeed(new Uint8Array(32))
   * let message = new TextEncoder().encode('Hello World')
   * let signature = secKey.sign(message)
   */
  sign (message) {
    return index.sign(message, this._bytes)
  }
}

exports.SecretKey = SecretKey
