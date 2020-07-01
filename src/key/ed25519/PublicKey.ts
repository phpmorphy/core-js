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

import { verify } from '../../util/ed25519/verify'
import { validateUint8Array } from '../../util/validator'

/**
 * Базовый класс для работы с публичными ключами.
 * @class
 */
export class PublicKey {
  /**
   * Длина публичного ключа в формате libsodium в байтах.
   * @type {number}
   * @constant
   */
  static get LENGTH (): number { return 32 }

  /**
   * Длина цифровой подписи в байтах.
   * @type {number}
   * @constant
   */
  static get SIGNATURE_LENGTH (): number { return 64 }

  /**
   * Длина цифровой подписи в байтах.
   * @type {number}
   * @constant
   */
  get signatureLength (): number { return PublicKey.SIGNATURE_LENGTH }

  /**
   * Публичный ключ в бинарном виде. В формате libsodium.
   * @type {Uint8Array}
   * @private
   * @internal
   */
  private readonly _bytes: Uint8Array = new Uint8Array(PublicKey.LENGTH)

  /**
   * @param {Uint8Array} bytes Публичный ключ в формате libsodium, 32 байта (256 бит).
   * @throws {Error}
   */
  constructor (bytes: Uint8Array) {
    validateUint8Array(bytes, PublicKey.LENGTH)
    this._bytes.set(bytes)
  }

  /**
   * Публичный ключ в формате libsodium, 32 байта (256 бит).
   * @type {Uint8Array}
   * @readonly
   */
  get bytes (): Uint8Array {
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
  verifySignature (signature: Uint8Array, message: Uint8Array): boolean {
    validateUint8Array(signature, PublicKey.SIGNATURE_LENGTH)
    validateUint8Array(message)

    return verify(signature, message, this._bytes)
  }
}
