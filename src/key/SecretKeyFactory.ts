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

import { Ed25519 } from '../util/Ed25519'
import { SecretKey } from './ed25519/SecretKey'
import { sha256 } from '../util/Sha256'

/**
 * @class
 * @classdesc This is a description of the SecretKeyFactory class.
 * @hideconstructor
 */
export class SecretKeyFactory {
  /**
   * @static
   * @summary Sum
   * @description Desc
   * @param {Uint8Array} seed seed
   * @returns {SecretKey}
   */
  static fromSeed (seed: Uint8Array): SecretKey {
    if (seed.byteLength === Ed25519.SEED_BYTES) {
      return new SecretKey(Ed25519.secretKeyFromSeed(seed))
    }

    return new SecretKey(Ed25519.secretKeyFromSeed(sha256(seed)))
  }
}