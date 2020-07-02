import { sha512 } from '../sha512'
import { reduce, modL, scalarbase, pack } from './common'

/**
 * Note: difference from C - smlen returned, not passed as argument.
 * @param {number[]|Uint8Array} message
 * @param {number[]|Uint8Array} secretKey
 * @returns {number[]}
 * @private
 * @internal
 */
function sign (message: number[]|Uint8Array, secretKey: number[]|Uint8Array): number[] {
  const sm: number[] = []
  const x: number[] = []
  const p: number[][] = [[], [], [], []]

  const d = sha512(secretKey.slice(0, 32))
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64

  for (let i = 0, n = message.length; i < n; i++) {
    sm[64 + i] = message[i]
  }

  for (let i = 32; i < 64; i++) {
    sm[i] = d[i]
  }

  const r = sha512(sm.slice(32))
  reduce(r)

  scalarbase(p, r)
  pack(sm, p)

  for (let i = 32; i < 64; i++) {
    sm[i] = secretKey[i]
  }

  const h = sha512(sm)
  reduce(h)

  for (let i = 0; i < 64; i++) {
    x[i] = 0
  }

  for (let i = 0; i < 32; i++) {
    x[i] = r[i]
  }

  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      x[i + j] += h[i] * d[j]
    }
  }

  const sm2 = sm.slice(32)
  modL(sm2, x)

  return sm.slice(0, 32).concat(sm2.slice(0, 32))
}

export { sign }
