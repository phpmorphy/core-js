import { sha512 } from '../sha512'
import { reduce, modL, scalarbase, pack } from './common'

/**
 * Note: difference from C - smlen returned, not passed as argument.
 * @param {number[]|Uint8Array|Buffer} message
 * @param {number[]|Uint8Array|Buffer} secretKey
 * @returns {number[]}
 * @private
 * @internal
 */
function sign (message: number[] | Uint8Array | Buffer, secretKey: number[] | Uint8Array | Buffer): number[] {
  if (secretKey.length !== 64) {
    throw new Error('secretKey - invalid length')
  }

  const d = sha512(secretKey.slice(0, 32))
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64

  const sm = d.slice(0)
  for (let i = 0, l = message.length; i < l; i++) {
    sm[64 + i] = message[i]
  }

  const r = sha512(sm.slice(32))
  reduce(r)

  const p: number[][] = [[], [], [], []]
  scalarbase(p, r)
  pack(sm, p)

  for (let i = 32; i < 64; i++) {
    sm[i] = secretKey[i]
  }

  const h = sha512(sm)
  reduce(h)

  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      r[i + j] += h[i] * d[j]
    }
  }

  return sm.slice(0, 32).concat(modL(sm.slice(32), r).slice(0, 32))
}

export { sign }
