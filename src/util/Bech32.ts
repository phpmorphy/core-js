/**
 * Copyright (c) 2017 Pieter Wuille
 * Copyright (c) 2018 bitcoinjs contributors
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

import { prefixToUint16, uint16ToPrefix } from './Converter'

// tslint:disable:no-bitwise

/**
 * Bech32 конвертер.
 * @class
 */
export class Bech32 {
  static get ALPHABET (): string { return 'qpzry9x8gf2tvdw0s3jn54khce6mua7l' }

  static get ALPHABET_MAP (): any {
    return {
      0: 15,
      2: 10,
      3: 17,
      4: 21,
      5: 20,
      6: 26,
      7: 30,
      8: 7,
      9: 5,
      q: 0,
      p: 1,
      z: 2,
      r: 3,
      y: 4,
      x: 6,
      g: 8,
      f: 9,
      t: 11,
      v: 12,
      d: 13,
      w: 14,
      s: 16,
      j: 18,
      n: 19,
      k: 22,
      h: 23,
      c: 24,
      e: 25,
      m: 27,
      u: 28,
      a: 29,
      l: 31
    }
  }

  /**
   * @param {Uint8Array} bytes
   * @returns {string}
   * @throws {Error}
   */
  static encode (bytes: Uint8Array): string {
    const prefix = uint16ToPrefix(new DataView(bytes.buffer).getUint16(0))
    const data = new Uint8Array(bytes.subarray(2))

    return this._encode(prefix, this._convert(data, 8, 5, true))
  }

  /**
   * @param {string} bech32
   * @returns {Uint8Array}
   * @throws {Error}
   */
  static decode (bech32: string): Uint8Array {
    const raw = this._decode(bech32)

    const res = new Uint8Array(34)
    res.set(this._convert(raw.words, 5, 8, false), 2)
    new DataView(res.buffer).setUint16(0, prefixToUint16(raw.prefix))

    return res
  }

  private static _encode (prefix: string, words: any) {
    prefix = prefix.toLowerCase()

    // determine chk mod
    let chk = this._prefixChk(prefix)
    if (typeof chk === 'string') {
      throw new Error(chk)
    }

    let result = prefix + '1'
    let word
    for (word of words) {
      if ((word >> 5) !== 0) {
        throw new Error('Non 5-bit word')
      }

      chk = this._polymodStep(chk) ^ word
      result += this.ALPHABET.charAt(word)
    }

    for (let i = 0; i < 6; ++i) {
      chk = this._polymodStep(chk)
    }
    chk ^= 1

    for (let i = 0; i < 6; ++i) {
      const v = (chk >> ((5 - i) * 5)) & 0x1f
      result += this.ALPHABET.charAt(v)
    }

    return result
  }

  private static _decode (str: string) {
    // don't allow mixed case
    const lowered = str.toLowerCase()
    const uppered = str.toUpperCase()
    if (str !== lowered && str !== uppered) {
      throw new Error('Mixed-case string ' + str)
    }
    str = lowered

    const split = str.lastIndexOf('1')
    if (split === -1) {
      throw new Error('No separator character for ' + str)
    }
    if (split === 0) {
      throw new Error('Missing prefix for ' + str)
    }

    const prefix = str.slice(0, split)
    const wordChars = str.slice(split + 1)
    if (wordChars.length < 6) {
      throw new Error('Data too short')
    }

    let chk = this._prefixChk(prefix)
    if (typeof chk === 'string') {
      throw new Error(chk)
    }

    const words = []
    for (let i = 0; i < wordChars.length; ++i) {
      const c = wordChars.charAt(i)
      const v = this.ALPHABET_MAP[c]
      if (v === undefined) {
        throw new Error('Unknown character ' + c)
      }
      chk = this._polymodStep(chk) ^ v

      // not in the checksum?
      if (i + 6 >= wordChars.length) {
        continue
      }
      words.push(v)
    }

    if (chk !== 1) {
      throw new Error('Invalid checksum for ' + str)
    }

    return { prefix, words }
  }

  private static _polymodStep (pre: any) {
    const b = pre >> 25
    return ((pre & 0x1FFFFFF) << 5) ^
      (-((b >> 0) & 1) & 0x3b6a57b2) ^
      (-((b >> 1) & 1) & 0x26508e6d) ^
      (-((b >> 2) & 1) & 0x1ea119fa) ^
      (-((b >> 3) & 1) & 0x3d4233dd) ^
      (-((b >> 4) & 1) & 0x2a1462b3)
  }

  private static _prefixChk (prefix: any) {
    let chk = 1
    for (let i = 0; i < prefix.length; ++i) {
      const c = prefix.charCodeAt(i)
      if (c < 33 || c > 126) {
        return 'Invalid prefix (' + prefix + ')'
      }

      chk = this._polymodStep(chk) ^ (c >> 5)
    }
    chk = this._polymodStep(chk)

    for (let i = 0; i < prefix.length; ++i) {
      const v = prefix.charCodeAt(i)
      chk = this._polymodStep(chk) ^ (v & 0x1f)
    }
    return chk
  }

  private static _convert (
    data: any, inBits: number, outBits: number, pad: boolean): number[] {
    let value = 0
    let bits = 0
    const maxV = (1 << outBits) - 1

    const result = []
    let dat
    for (dat of data) {
      value = (value << inBits) | dat
      bits += inBits

      while (bits >= outBits) {
        bits -= outBits
        result.push((value >> bits) & maxV)
      }
    }

    if (pad) {
      if (bits > 0) {
        result.push((value << (outBits - bits)) & maxV)
      }
    } else {
      if (bits >= inBits) {
        throw new Error('Excess padding')
      }
      if ((value << (outBits - bits)) & maxV) {
        throw new Error('Non-zero padding')
      }
    }

    return result
  }
}
