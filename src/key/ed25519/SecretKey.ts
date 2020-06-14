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
import { PublicKey } from './PublicKey'
import { sha256 } from '../../util/Sha256'

export class SecretKey {
  /**
   * @description Длина приватного ключа в формате libsodium в байтах.
   * @constant
   * @type {number}
   * @default 64
   */
  static get LENGTH (): number { return Ed25519.SECRET_KEY_BYTES }

  /**
   * @description Приватный ключ в бинарном виде. В формате libsodium.
   * Ссылка на внутренний массив, поэтому НЕбезопасно использовать вне класса.
   * @private
   * @readonly
   * @type {Uint8Array}
   */
  private readonly _bytes: Uint8Array = new Uint8Array(SecretKey.LENGTH)

  /**
   * @constructor
   * @param {Uint8Array} bytes Приватный ключ в бинарном виде.
   * В формате libsodium, 64 байта (512 бит).
   * @throws {Error}
   */
  constructor (bytes: Uint8Array) {
    if (bytes instanceof Uint8Array === false) {
      throw new Error('bytes must be Uint8Array')
    }

    if (bytes.byteLength !== SecretKey.LENGTH) {
      throw new Error('bytes must be 64 bytes length')
    }

    this._bytes.set(bytes)
  }

  /**
   * @description Приватный ключ в бинарном виде.
   * В формате libsodium, 64 байта (512 бит).
   * @readonly
   * @type {Uint8Array}
   */
  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * @description Публичный ключ, соотвествующий приватному ключу.
   * @readonly
   * @type {PublicKey}
   */
  get publicKey (): PublicKey {
    return new PublicKey(Ed25519.publicKeyFromSecretKey(this._bytes))
  }

  /**
   * @description Создает цифровую подпись сообщения.
   * @param {Uint8Array} message Сообщение, которое необходимо подписать.
   * @returns {Uint8Array} Цифровая подпись длиной 64 байта (512 бит).
   * @throws {Error}
   * @example
   * let seed = new Uint8Array(32)
   * let msg = new Uint8Array(1)
   * let sig = SecretKey.fromSeed(seed).sign(msg)
   */
  sign (message: Uint8Array): Uint8Array {
    if (message instanceof Uint8Array === false) {
      throw new Error('message must be Uint8Array')
    }

    return Ed25519.sign(message, this._bytes)
  }

  /**
   * @description Статический фабричный метод, создающий приватный ключ из seed.
   * Libsodium принимает seed длиной 32 байта (256 бит), если seed имеет
   * другуой размер, от него берется sha256 хэш.
   * @static
   * @param {Uint8Array} seed Seed длиной от 0 до 128 байт.
   * @returns {SecretKey}
   * @throws {Error}
   * @example
   * let seed = new Uint8Array(32)
   * let key = SecretKey.fromSeed(seed)
   */
  static fromSeed (seed: Uint8Array): SecretKey {
    if (seed instanceof Uint8Array === false) {
      throw new Error('seed must be Uint8Array')
    }

    if (seed.byteLength > 128) {
      throw new Error('seed length must be not greater than 128 bytes')
    }

    if (seed.byteLength === Ed25519.SEED_BYTES) {
      return new SecretKey(Ed25519.secretKeyFromSeed(seed))
    }

    return new SecretKey(Ed25519.secretKeyFromSeed(sha256(seed)))
  }
}