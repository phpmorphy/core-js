import { sha512 } from '../sha512'
import { gf0, gf1, reduce, scalarmult, scalarbase, add, set25519, pack, fnA, fnM, fnS, fnZ, pack25519, par25519 } from './common'

const D: number[] = [
  0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070,
  0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]

const I: number[] = [
  0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43,
  0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]

/**
 * @param {number[]} signature
 * @param {number[]} message
 * @param {number[]} pubKey
 * @returns {boolean}
 * @private
 * @internal
 */
function verify (signature: number[] | Uint8Array, message: number[] | Uint8Array, pubKey: number[] | Uint8Array): boolean {
  const sm: number[] = []
  const m: number[] = []
  const t: number[] = []
  const p: number[][] = [[], [], [], []]
  const q: number[][] = [[], [], [], []]

  /** @istanbul ignore if */
  if (unpackneg(q, pubKey)) {
    return false
  }

  for (let i = 0; i < 64; i++) {
    sm[i] = signature[i]
    m[i] = signature[i]
  }

  for (let i = 0, l = message.length; i < l; i++) {
    sm[64 + i] = message[i]
    m[64 + i] = message[i]
  }

  for (let i = 0; i < 32; i++) {
    m[i + 32] = pubKey[i]
  }

  const h = sha512(m)
  reduce(h)

  scalarmult(p, q, h)
  scalarbase(q, sm.slice(32))
  add(p, q)
  pack(t, p)

  if (cryptoVerify32(sm, t)) {
    return false
  }

  return true
}

/**
 * @param {number[][]} r
 * @param {number[]|Uint8Array} p
 * @private
 * @internal
 */
function unpackneg (r: number[][], p: number[] | Uint8Array): number {
  const t: number[] = []
  const chk: number[] = []
  const num: number[] = []
  const den: number[] = []
  const den2: number[] = []
  const den4: number[] = []
  const den6: number[] = []

  set25519(r[2], gf1)
  unpack25519(r[1], p)
  fnS(num, r[1])
  fnM(den, num, D)
  fnZ(num, num, r[2])
  fnA(den, r[2], den)

  fnS(den2, den)
  fnS(den4, den2)
  fnM(den6, den4, den2)
  fnM(t, den6, num)
  fnM(t, t, den)

  pow2523(t, t)
  fnM(t, t, num)
  fnM(t, t, den)
  fnM(t, t, den)
  fnM(r[0], t, den)
  fnS(chk, r[0])
  fnM(chk, chk, den)

  if (neq25519(chk, num)) {
    fnM(r[0], r[0], I)
  }

  fnS(chk, r[0])
  fnM(chk, chk, den)

  /** @istanbul ignore if */
  if (neq25519(chk, num)) {
    return -1
  }

  if (par25519(r[0]) === (p[31] >> 7)) {
    fnZ(r[0], gf0, r[0])
  }

  fnM(r[3], r[0], r[1])

  return 0
}

/**
 * @param {number[]} x
 * @param {number[]} y
 * @private
 * @internal
 */
function cryptoVerify32 (x: number[], y: number[]): number {
  let d = 0
  for (let i = 0; i < 32; i++) {
    d |= x[i] ^ y[i]
  }

  return (1 & ((d - 1) >>> 8)) - 1
}

/**
 * @param {number[]} o
 * @param {number[]} n
 * @private
 * @internal
 */
function unpack25519 (o: number[], n: number[] | Uint8Array): void {
  for (let i = 0; i < 16; i++) {
    o[i] = n[2 * i] + (n[2 * i + 1] << 8)
  }
  o[15] &= 0x7fff
}

/**
 * @param {number[]} o
 * @param {number[]} i
 * @private
 * @internal
 */
function pow2523 (o: number[], i: number[]): void {
  const c: number[] = []

  for (let a = 0; a < 16; a++) {
    c[a] = i[a]
  }

  for (let a = 250; a >= 0; a--) {
    fnS(c, c)
    if (a !== 1) {
      fnM(c, c, i)
    }
  }

  for (let a = 0; a < 16; a++) {
    o[a] = c[a]
  }
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @private
 * @internal
 */
function neq25519 (a: number[], b: number[]): number {
  const c: number[] = []
  const d: number[] = []
  pack25519(c, a)
  pack25519(d, b)

  return cryptoVerify32(c, d)
}

export { verify }
