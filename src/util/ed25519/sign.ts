import { sha512 } from '../sha512'
import { reduce, modL, scalarbase, pack } from './common'

function sign (message: Uint8Array, secretKey: Uint8Array): Uint8Array {
  const signedMsg = new Uint8Array(64 + message.length)
  cryptoSign(signedMsg, message, message.length, secretKey)

  return new Uint8Array(signedMsg.buffer, 0, 64)
}

/**
 * Note: difference from C - smlen returned, not passed as argument.
 * @param {Uint8Array} sm
 * @param {Uint8Array} m
 * @param {number} n
 * @param {Uint8Array} sk
 * @private
 * @internal
 */
function cryptoSign (
  sm: Uint8Array, m: Uint8Array, n: number, sk: Uint8Array): void {
  // const h = new Uint8Array(64)
  // const r = new Uint8Array(64)
  let i
  let j
  const x = new Float64Array(64)
  const p = [
    new Float64Array(16),
    new Float64Array(16),
    new Float64Array(16),
    new Float64Array(16)]

  const d = new Uint8Array(sha512(sk.slice(0, 32)))
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64

  sm.set(m, 64)
  sm.set(d.subarray(32), 32)
  const r = new Uint8Array(sha512(sm.slice(32, 64)))
  // cryptoHash(r, sm.subarray(32), n + 32)
  reduce(r)
  scalarbase(p, r)
  pack(sm, p)
  sm.set(sk.subarray(32), 32)
  // cryptoHash(h, sm, n + 64)
  const h = new Uint8Array(sha512(sm))
  reduce(h)

  x.set(r)

  for (i = 0; i < 32; i++) {
    for (j = 0; j < 32; j++) {
      x[i + j] += h[i] * d[j]
    }
  }

  modL(sm.subarray(32), x)
}

export { sign }
