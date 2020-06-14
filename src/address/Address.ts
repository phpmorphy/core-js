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

import { Bech32 } from '../util/Bech32'
import { PublicKey } from '../key/ed25519/PublicKey'
import { SecretKey } from '../key/ed25519/SecretKey'
import { prefixToUint16, uint16ToPrefix } from '../util/Converter'

export class Address {
  /**
   * @description Длина адреса в байтах.
   * @constant
   * @type {number}
   * @default 34
   */
  static get LENGTH (): number { return 34 }

  /**
   * @description Адрес в бинарном виде, длина 34 байта.
   * @private
   * @readonly
   * @type {Uint8Array}
   */
  private readonly _bytes: Uint8Array = new Uint8Array(Address.LENGTH)

  /**
   * @constructor
   * @param {Uint8Array} [bytes] Адрес в бинарном виде, длина 34 байта.
   * @throws {Error}
   */
  constructor (bytes?: Uint8Array) {
    if (bytes === undefined) {
      this.prefix = 'umi'
    } else {
      this._bytes.set(bytes)
    }
  }

  /**
   * @description Адрес в бинарном виде, длина 34 байта.
   * @readonly
   * @type {Uint8Array}
   */
  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * @description Версия адреса.
   * @type {number}
   */
  get version (): number {
    // version length = 2
    // version offset = 0
    return new DataView(this._bytes.buffer).getUint16(0)
  }

  set version (version: number) {
    // tslint:disable-next-line:no-bitwise
    new DataView(this._bytes.buffer).setUint16(0, (version & 0x7FFF))
  }

  /**
   * @param {number} version Версия адреса.
   * @returns {Address}
   * @throws {Error}
   */
  setVersion (version: number): this {
    this.version = version
    return this
  }

  /**
   * @description Публиный ключ.
   * @type {PublicKey}
   */
  get publicKey (): PublicKey {
    // public key begin = 2
    return new PublicKey(this._bytes.subarray(2))
  }

  set publicKey (publicKey: PublicKey) {
    // public key offset = 2
    this._bytes.set(publicKey.bytes, 2)
  }

  /**
   * @param {PublicKey} publicKey Публичный ключ.
   * @returns {Address}
   * @throws {Error}
   */
  setPublicKey (publicKey: PublicKey): this {
    this.publicKey = publicKey
    return this
  }

  /**
   * @description Префикс адреса, три символа латиницы в нижнем регистре.
   * @type {string}
   */
  get prefix (): string {
    return uint16ToPrefix(this.version)
  }

  set prefix (prefix: string) {
    this.version = prefixToUint16(prefix)
  }

  /**
   * @param {string} prefix Префикс адреса, три символа латиницы в нижнем регистре.
   * @returns {Address}
   * @throws {Error}
   */
  setPrefix (prefix: string): this {
    this.prefix = prefix
    return this
  }

  /**
   * @description Адрес в формате Bech32, длина 62 символа.
   * @type {string}
   */
  get bech32 (): string {
    return Bech32.encode(this._bytes)
  }

  set bech32 (bech32: string) {
    const regexp = /^(genesis|[a-z]{3})1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{58}$/

    if (!regexp.test(bech32)) {
      throw new Error('incorrect address')
    }

    this._bytes.set(Bech32.decode(bech32))
  }

  /**
   * @param {string} bech32 Адрес в формате Bech32, длина 62 символа.
   * @returns {Address}
   * @throws {Error}
   */
  setBech32 (bech32: string): this {
    this.bech32 = bech32
    return this
  }

  /**
   * @description Статический фабричный метод, создающий объект из адреса в формате Bech32.
   * @param {string} bech32 Адрес в формате Bech32, длина 62 символа.
   * @returns {Address}
   * @throws {Error}
   */
  static fromBech32 (bech32: string): Address {
    return new Address().setBech32(bech32)
  }

  /**
   * @description Статический фабричный метод, создающий объект из публичного или приватного ключа.
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
