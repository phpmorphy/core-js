/**
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

import { Ed25519 } from '../../util/Ed25519'

export class PublicKey {
  /**
   * @description Длина публичного ключа в формате libsodium в байтах.
   * @constant
   * @type {number}
   * @default 32
   */
  static get LENGTH (): number { return Ed25519.PUBLIC_KEY_BYTES }

  /**
   * @description Публичный ключ в бинарном виде. В формате libsodium.
   * Ссылка на внутренний массив, поэтому НЕбезопасно использовать вне класса.
   * @private
   * @readonly
   * @type {Uint8Array}
   */
  private readonly _bytes: Uint8Array = new Uint8Array(PublicKey.LENGTH)

  /**
   * @constructor
   * @param {Uint8Array} bytes Публичный ключ в бинарном виде.
   * В формате libsodium, 32 байта (256 бит).
   * @throws {Error}
   */
  constructor (bytes: Uint8Array) {
    if (bytes instanceof Uint8Array === false) {
      throw new Error('bytes must be Uint8Array')
    }

    if (bytes.byteLength !== PublicKey.LENGTH) {
      throw new Error('bytes must be 32 bytes length')
    }

    this._bytes.set(bytes)
  }

  /**
   * @description Публичный ключ в бинарном виде.
   * В формате libsodium, 32 байта (256 бит).
   * @readonly
   * @type {Uint8Array}
   */
  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * @description Проверяет цифровую подпись.
   * @param {Uint8Array} message Сообщение
   * @param {Uint8Array} signature Подпись, 64 байта.
   * @returns {boolean}
   * @throws {Error}
   * @example
   * let msg = new Uint8Array(1)
   * let sig = new Uint8Array(64)
   * let key = new Uint8Array(32)
   * let ver = new PublicKey(key).verifySignature(msg, sig)
   */
  verifySignature (message: Uint8Array, signature: Uint8Array): boolean {
    if (message instanceof Uint8Array === false) {
      throw new Error('message must be Uint8Array')
    }

    if (signature instanceof Uint8Array === false) {
      throw new Error('signature must be Uint8Array')
    }

    if (signature.byteLength !== Ed25519.SIGNATURE_BYTES) {
      throw new Error('signature must be 64 bytes length')
    }

    return Ed25519.verify(message, signature, this._bytes)
  }
}