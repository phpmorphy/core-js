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

import { verify } from '../../util/ed25519/index'
import { arraySet } from '../../util/array'

/**
 * Базовый класс для работы с публичными ключами.
 * @class
 */
export class PublicKey {
  /**
   * Публичный ключ в бинарном виде. В формате libsodium.
   * @type {number[]}
   * @private
   * @internal
   */
  private readonly _bytes: number[] = []

  /**
   * @param {ArrayLike<number>} bytes Публичный ключ в формате libsodium, 32 байта (256 бит).
   * @throws {Error}
   * @example
   * let bytes = new Uint8Array(32)
   * let pubKey = new PublicKey(bytes)
   */
  constructor (bytes: ArrayLike<number>) {
    if (bytes.length !== 32) {
      throw new Error('invalid length')
    }
    arraySet(this._bytes, bytes)
  }

  /**
   * Публичный ключ в формате libsodium, 32 байта (256 бит).
   * @returns {number[]}
   * @example
   * let bytes = new PublicKey(new Uint8Array(32)).getBytes()
   */
  getBytes (): number[] {
    return this._bytes.slice(0)
  }

  /**
   * Публичный ключ.
   * @returns {PublicKey}
   * @private
   * @internal
   */
  getPublicKey (): PublicKey {
    return this
  }

  /**
   * Проверяет цифровую подпись.
   * @param {ArrayLike<number>} signature Подпись, 64 байта.
   * @param {ArrayLike<number>} message Сообщение.
   * @returns {boolean}
   * @throws {Error}
   * @example
   * let pubKey = new PublicKey(new Uint8Array(32))
   * let signature = new Uint8Array(64)
   * let message = new TextEncoder().encode('Hello World')
   * let ver = pubKey.verifySignature(signature, message)
   */
  verifySignature (
    signature: ArrayLike<number>,
    message: ArrayLike<number>
  ): boolean {
    if (signature.length !== 64) {
      throw new Error('invalid length')
    }
    return verify(signature, message, this._bytes)
  }
}
