import { sha512 } from '../sha512'
import { pack, scalarbase } from './common'

/**
 * @param {number[]|Uint8Array|Buffer} seed
 * @returns {number[]}
 */
function secretKeyFromSeed (seed: number[] | Uint8Array | Buffer): number[] {
  const sk: number[] = []
  const pk: number[] = []
  const p: number[][] = [[], [], [], []]

  for (let i = 0; i < 32; i++) {
    sk[i] = seed[i]
  }

  const d = sha512(sk)
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64

  scalarbase(p, d)
  pack(pk, p)

  return sk.concat(pk)
}

export { secretKeyFromSeed }
