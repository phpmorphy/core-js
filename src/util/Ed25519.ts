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

// tslint:disable:no-bitwise

import { cryptoHash } from './ed25519/sha512'
import { sign } from './ed25519/sign'
import { verify } from './ed25519/verify'
import { scalarbase, pack } from './ed25519/common'

/**
 * Цифровые подписи Ed25519.
 * Implementation derived from TweetNaCl version 20140427.
 * @see http://tweetnacl.cr.yp.to/
 * @class
 * @private
 */
class Ed25519 {
  /**
   * Подписать сообщение.
   * @param {Uint8Array} message
   * @param {Uint8Array} secretKey
   * @returns {Uint8Array}
   * @throws {Error}
   */
  sign (message: Uint8Array, secretKey: Uint8Array): Uint8Array {
    return sign(message, secretKey)
  }

  /**
   * Проверить подпись.
   * @param {Uint8Array} message
   * @param {Uint8Array} signature
   * @param {Uint8Array} publicKey
   * @returns {boolean}
   */
  verify (
    signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array
  ): boolean {
    return verify(signature, message, publicKey)
  }

  /**
   * Получить приватный ключ из seed.
   * @param {Uint8Array} seed
   * @returns {Uint8Array}
   */
  secretKeyFromSeed (seed: Uint8Array): Uint8Array {
    const pk = new Uint8Array(32)
    const sk = new Uint8Array(64)

    sk.set(seed)

    this._cryptoSignKeypair(pk, sk)

    return sk
  }

  /**
   * Получить публичный ключ из приватного ключа.
   * @param {Uint8Array} secretKey
   * @returns {Uint8Array}
   */
  publicKeyFromSecretKey (secretKey: Uint8Array): Uint8Array {
    const b = new Uint8Array(32)
    b.set(new Uint8Array(secretKey.buffer, 32, 32))
    return b
  }

  /**
   * @param {Uint8Array} pk
   * @param {Uint8Array} sk
   * @private
   * @internal
   */
  private _cryptoSignKeypair (pk: Uint8Array, sk: Uint8Array): number {
    const d = new Uint8Array(64)
    const p = [
      new Float64Array(16), new Float64Array(16),
      new Float64Array(16), new Float64Array(16)]

    cryptoHash(d, sk, 32)
    d[0] &= 248
    d[31] &= 127
    d[31] |= 64

    scalarbase(p, d)
    pack(pk, p)
    sk.set(pk, 32)

    return 0
  }
}

export { Ed25519 }
