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

import { PublicKey } from '../key/ed25519/PublicKey'
import { SecretKey } from '../key/ed25519/SecretKey' // eslint-disable-line
import { prefixToVersion, versionToPrefix } from '../util/converter'
import { bech32Decode, bech32Encode } from '../util/bech32'
import { arrayNew, arraySet } from '../util/array'
import { uint16ToBytes, bytesToUint16 } from '../util/integer'

/**
 * Базовый класс для работы с адресами.
 * @class
 */
export class Address {
  /**
   * Версия Genesis-адреса.
   * @type {number}
   * @constant
   */
  static Genesis: number = 0

  /**
   * Версия Umi-адреса.
   * @type {number}
   * @constant
   */
  static Umi: number = 21929

  /**
   * Адрес в бинарном виде, длина 34 байта.
   * @type {number[]}
   * @private
   * @internal
   */
  private readonly _bytes: number[] = arrayNew(34)

  constructor () {
    this.setVersion(Address.Umi)
  }

  /**
   * Версия адреса, префикс в числовом виде.
   * @returns {number}
   */
  getVersion (): number {
    return bytesToUint16(this._bytes.slice(0, 2))
  }

  /**
   * Устанавливает версию адреса и возвращает this.
   * @param {number} version Версия адреса.
   * @returns {Address}
   * @throws {Error}
   */
  setVersion (version: number) {
    versionToPrefix(version) // validation
    arraySet(this._bytes, uint16ToBytes(version))
    return this
  }

  /**
   * Публичный ключ.
   * @returns {PublicKey}
   */
  getPublicKey (): PublicKey {
    return new PublicKey(this._bytes.slice(2))
  }

  /**
   * Устанавливает публичный ключи и возвращает this.
   * @param {PublicKey} publicKey Публичный ключ.
   * @returns {Address}
   * @throws {Error}
   */
  setPublicKey (publicKey: PublicKey): this {
    if (!(publicKey instanceof PublicKey)) {
      throw new Error('publicKey type must be PublicKey')
    }
    arraySet(this._bytes, publicKey.toBytes(), 2)
    return this
  }

  /**
   * Префикс адреса, три символа латиницы в нижнем регистре.
   * @returns {string}
   */
  getPrefix (): string {
    return versionToPrefix(this.getVersion())
  }

  /**
   * Устанавливает префикс адреса и возвращает this.
   * @param {string} prefix Префикс адреса, три символа латиницы в нижнем регистре.
   * @returns {Address}
   * @throws {Error}
   */
  setPrefix (prefix: string): this {
    return this.setVersion(prefixToVersion(prefix))
  }

  /**
   * Адрес в формате Bech32, длина 62 символа.
   * @returns {string}
   */
  toBech32 (): string {
    return bech32Encode(this._bytes)
  }

  /**
   * Адрес в бинарном виде, длина 34 байта.
   * @returns {number[]}
   */
  toBytes (): number[] {
    return this._bytes.slice(0)
  }

  /**
   * @param {number[]|Uint8Array|Buffer} bytes
   * @returns {Address}
   * @throws {Error}
   */
  static fromBytes (bytes: number[] | Uint8Array | Buffer): Address {
    if (bytes.length !== 34) {
      throw new Error('bytes length must be 34 bytes')
    }
    const adr = new Address()
    arraySet(adr._bytes, bytes)
    return adr
  }

  /**
   * Статический метод, создает объект из адреса в формате Bech32.
   * @param {string} bech32 Адрес в формате Bech32, длина 62 или 65 символов.
   * @returns {Address}
   * @throws {Error}
   */
  static fromBech32 (bech32: string): Address {
    const adr = new Address()
    arraySet(adr._bytes, bech32Decode(bech32))
    return adr
  }

  /**
   * Статический метод, создает объект из публичного или приватного ключа.
   * @param {PublicKey|SecretKey} key Публичный или приватный ключ.
   * @returns {Address}
   */
  static fromKey (key: PublicKey | SecretKey): Address {
    return new Address().setPublicKey(key.getPublicKey())
  }
}
