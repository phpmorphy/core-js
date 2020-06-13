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
import { prefixToUint16, uint16ToPrefix } from '../util/Converter'

/**
 * @class
 * @classdesc This is a description of the Address class.
 * @hideconstructor
 */
export class Address {
  static get LENGTH(): number { return 34 }

  /**
   * @private
   * @readonly
   * @summary Summary.
   * @description Desc
   * @type Uint8Array
   */
  private readonly _bytes: Uint8Array = new Uint8Array(Address.LENGTH)

  constructor (bytes?: Uint8Array) {
    if (bytes === undefined) {
      this.prefix = 'umi'
    } else {
      this._bytes.set(bytes)
    }
  }

  /**
   * @summary Summary.
   * @description Desc
   * @readonly
   * @type Uint8Array
   */
  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  /**
   * @summary Summary.
   * @description Desc
   * @type number
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
   * @summary Summary.
   * @description Desc
   * @param {number} version
   * @throws {Error} error
   */
  setVersion (version: number): this {
    this.version = version
    return this
  }

  get publicKey (): PublicKey {
    // public key begin = 2
    return new PublicKey(this._bytes.subarray(2))
  }

  set publicKey (publicKey: PublicKey) {
    // public key offset = 2
    this._bytes.set(publicKey.bytes, 2)
  }

  setPublicKey (publicKey: PublicKey): this {
    this.publicKey = publicKey
    return this
  }

  get prefix (): string {
    return uint16ToPrefix(this.version)
  }

  set prefix (prefix: string) {
    this.version = prefixToUint16(prefix)
  }

  setPrefix (prefix: string): this {
    this.prefix = prefix
    return this
  }

  get bech32 (): string {
    return Bech32.encode(this._bytes)
  }

  set bech32 (adr: string) {
    this._bytes.set(Bech32.decode(adr))
  }

  static fromBech32 (adr: string): Address {
    const a = new Address()
    a.bech32 = adr
    return a
  }
}