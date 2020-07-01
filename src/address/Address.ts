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
import { SecretKey } from '../key/ed25519/SecretKey'
import { validateStr } from '../util/validator'
import { prefixToVersion, versionToPrefix } from '../util/converter'
import { decode, encode } from '../util/bech32'

/**
 * Базовый класс для работы с адресами.
 * @class
 */
export class Address {
  /**
   * Длина адреса в байтах.
   * @type {number}
   * @constant
   */
  static get LENGTH (): number { return 34 }

  /**
   * Версия Genesis-адрса.
   * @type {number}
   * @constant
   */
  static get Genesis (): number { return 0 }

  /**
   * Версия Umi-адреса.
   * @type {number}
   * @constant
   */
  static get Umi (): number { return 21929 }

  /**
   * Адрес в бинарном виде, длина 34 байта.
   * @type {Uint8Array}
   * @private
   * @internal
   */
  private readonly _bytes: Uint8Array = new Uint8Array(Address.LENGTH)

  /**
   * @param {Uint8Array} [bytes] Адрес в бинарном виде, длина 34 байта.
   * @throws {Error}
   */
  constructor (bytes?: Uint8Array) {
    if (bytes === undefined) {
      this.version = Address.Umi
    } else {
      if (!(bytes instanceof Uint8Array)) {
        throw new Error('bytes type must be Uint8Array')
      }

      if (bytes.byteLength !== Address.LENGTH) {
        throw new Error('bytes length must be 34 bytes')
      }

      this._bytes.set(bytes)
    }
  }

  /**
   * Адрес в бинарном виде, длина 34 байта.
   * @type {Uint8Array}
   * @readonly
   */
  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * Версия адреса, префикс в числовом виде.
   * @type {number}
   * @throws {Error}
   */
  get version (): number {
    // version length = 2
    // version offset = 0
    return new DataView(this._bytes.buffer).getUint16(0)
  }

  set version (version: number) {
    versionToPrefix(version) // validation

    // tslint:disable-next-line:no-bitwise
    new DataView(this._bytes.buffer).setUint16(0, (version & 0x7FFF))
  }

  /**
   * Устанавливает версию адреса и возвращяет this.
   * @param {number} version Версия адреса.
   * @returns {Address}
   * @throws {Error}
   */
  setVersion (version: number): Address {
    this.version = version
    return this
  }

  /**
   * Публичный ключ.
   * @type {PublicKey}
   * @throws {Error}
   */
  get publicKey (): PublicKey {
    // public key begin = 2
    return new PublicKey(this._bytes.subarray(2))
  }

  set publicKey (publicKey: PublicKey) {
    if (!(publicKey instanceof PublicKey)) {
      throw new Error('publicKey type must be PublicKey')
    }

    // public key offset = 2
    this._bytes.set(publicKey.bytes, 2)
  }

  /**
   * Устанавливает публичный ключи и возвращяет this.
   * @param {PublicKey} publicKey Публичный ключ.
   * @returns {Address}
   * @throws {Error}
   */
  setPublicKey (publicKey: PublicKey): Address {
    this.publicKey = publicKey
    return this
  }

  /**
   * Префикс адреса, три символа латиницы в нижнем регистре.
   * @type {string}
   * @throws {Error}
   */
  get prefix (): string {
    return versionToPrefix(this.version)
  }

  set prefix (prefix: string) {
    this.version = prefixToVersion(prefix)
  }

  /**
   * Устанавливает префикс адреса и возвращяет this.
   * @param {string} prefix Префикс адреса, три символа латиницы в нижнем регистре.
   * @returns {Address}
   * @throws {Error}
   */
  setPrefix (prefix: string): Address {
    this.prefix = prefix
    return this
  }

  /**
   * Адрес в формате Bech32, длина 62 символа.
   * @type {string}
   * @throws {Error}
   */
  get bech32 (): string {
    return encode(this._bytes)
  }

  set bech32 (bech32: string) {
    validateStr(bech32)
    this._bytes.set(decode(bech32))
  }

  /**
   * Устанавливает адрес в формате Bech32.
   * @param {string} bech32 Адрес в формате Bech32, длина 62 символа.
   * @returns {Address}
   * @throws {Error}
   */
  setBech32 (bech32: string): Address {
    this.bech32 = bech32
    return this
  }

  /**
   * Статический фабричный метод, создающий объект из адреса в формате Bech32.
   * @param {string} bech32 Адрес в формате Bech32, длина 62 символа.
   * @returns {Address}
   * @throws {Error}
   */
  static fromBech32 (bech32: string): Address {
    return new Address().setBech32(bech32)
  }

  /**
   * Статический фабричный метод, создающий объект из публичного или приватного ключа.
   * @param {PublicKey|SecretKey} key Публичный или приватный ключ.
   * @returns {Address}
   * @throws {Error}
   */
  static fromKey (key: PublicKey | SecretKey): Address {
    if (key instanceof SecretKey) {
      return new Address().setPublicKey(key.publicKey)
    }

    if (key instanceof PublicKey) {
      return new Address().setPublicKey(key)
    }

    throw new Error('key type must be PublicKey or SecretKey')
  }
}
