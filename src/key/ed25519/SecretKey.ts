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

import { PublicKey } from './PublicKey'
import { sign, secretKeyFromSeed } from '../../util/ed25519/index'
import { sha256 } from '../../util/sha256'
import { arraySet } from '../../util/array'

/**
 * Базовый класс для работы с приватными ключами.
 * @class
 */
export class SecretKey {
  /**
   * Приватный ключ в бинарном виде. В формате libsodium.
   * @type {number[]}
   * @private
   * @internal
   */
  private readonly _bytes: number[] = []

  /**
   * @param {number[]|Uint8Array|Buffer} bytes Приватный ключ в бинарном виде.
   * В формате libsodium, 64 байта (512 бит).
   * @throws {Error}
   */
  constructor (bytes: number[] | Uint8Array | Buffer) {
    if (bytes.length !== 64) {
      throw new Error('invalid length')
    }
    arraySet(this._bytes, bytes)
  }

  /**
   * Приватный ключ в бинарном виде. В формате libsodium, 64 байта (512 бит).
   * @type {number[]}
   * @readonly
   */
  get bytes (): number[] {
    return this._bytes.slice(0)
  }

  /**
   * Публичный ключ, соответствующий приватному ключу.
   * @type {PublicKey}
   * @readonly
   */
  get publicKey (): PublicKey {
    return new PublicKey(this._bytes.slice(32, 64))
  }

  /**
   * Создает цифровую подпись сообщения.
   * @param {number[]|Uint8Array|Buffer} message Сообщение, которое необходимо подписать.
   * @returns {number[]} Цифровая подпись длиной 64 байта (512 бит).
   * @example
   * let seed = new Uint8Array(32)
   * let msg = new Uint8Array(1)
   * let sig = SecretKey.fromSeed(seed).sign(msg)
   */
  sign (message: number[] | Uint8Array | Buffer): number[] {
    return sign(message, this._bytes)
  }

  /**
   * Статический фабричный метод, создающий приватный ключ из seed.
   * Libsodium принимает seed длиной 32 байта (256 бит), если длина
   * отличается, то берется sha256 хэш.
   * @param {number[]|Uint8Array|Buffer} seed Seed длиной от 0 до 128 байт.
   * @returns {SecretKey}
   * @example
   * let seed = new Uint8Array(32)
   * let key = SecretKey.fromSeed(seed)
   */
  static fromSeed (seed: number[] | Uint8Array | Buffer): SecretKey {
    let entropy = seed
    if (seed.length !== 32) {
      entropy = sha256(entropy)
    }

    return new SecretKey(secretKeyFromSeed(entropy))
  }
}
