// tslint:disable:no-bitwise

import { prefixToUint16 } from './Converter'

const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

// pre-compute lookup table
const ALPHABET_MAP: any = {}

for (let z = 0; z < ALPHABET.length; z++) {
  const x: string = ALPHABET.charAt(z)

  if (ALPHABET_MAP[x] !== undefined) {
    throw new TypeError(x + ' is ambiguous')
  }

  ALPHABET_MAP[x] = z
}

function polymodStep (pre: any) {
  const b = pre >> 25
  return ((pre & 0x1FFFFFF) << 5) ^
    (-((b >> 0) & 1) & 0x3b6a57b2) ^
    (-((b >> 1) & 1) & 0x26508e6d) ^
    (-((b >> 2) & 1) & 0x1ea119fa) ^
    (-((b >> 3) & 1) & 0x3d4233dd) ^
    (-((b >> 4) & 1) & 0x2a1462b3)
}

function prefixChk (prefix: any) {
  let chk = 1
  for (let i = 0; i < prefix.length; ++i) {
    const c = prefix.charCodeAt(i)
    if (c < 33 || c > 126) {
      return 'Invalid prefix (' + prefix + ')'
    }

    chk = polymodStep(chk) ^ (c >> 5)
  }
  chk = polymodStep(chk)

  for (let i = 0; i < prefix.length; ++i) {
    const v = prefix.charCodeAt(i)
    chk = polymodStep(chk) ^ (v & 0x1f)
  }
  return chk
}

function encode (prefix: any, words: any, LIMIT: any) {
  LIMIT = LIMIT || 90
  if ((prefix.length + 7 + words.length) > LIMIT) throw new TypeError(
    'Exceeds length limit')

  prefix = prefix.toLowerCase()

  // determine chk mod
  let chk = prefixChk(prefix)
  if (typeof chk === 'string') {
    throw new Error(chk)
  }

  let result = prefix + '1'
  let word
  for (word of words) {
    if ((word >> 5) !== 0) {
      throw new Error('Non 5-bit word')
    }

    chk = polymodStep(chk) ^ word
    result += ALPHABET.charAt(word)
  }

  for (let i = 0; i < 6; ++i) {
    chk = polymodStep(chk)
  }
  chk ^= 1

  for (let i = 0; i < 6; ++i) {
    const v = (chk >> ((5 - i) * 5)) & 0x1f
    result += ALPHABET.charAt(v)
  }

  return result
}

function __decode (str: any, LIMIT: any) {
  LIMIT = LIMIT || 90

  if (str.length < 8) {
    return str + ' too short'
  }

  if (str.length > LIMIT) {
    return 'Exceeds length limit'
  }

  // don't allow mixed case
  const lowered = str.toLowerCase()
  const uppered = str.toUpperCase()
  if (str !== lowered && str !== uppered) {
    return 'Mixed-case string ' + str
  }
  str = lowered

  const split = str.lastIndexOf('1')
  if (split === -1) return 'No separator character for ' + str
  if (split === 0) return 'Missing prefix for ' + str

  const prefix = str.slice(0, split)
  const wordChars = str.slice(split + 1)
  if (wordChars.length < 6) {
    return 'Data too short'
  }

  let chk = prefixChk(prefix)
  if (typeof chk === 'string') {return chk}

  const words = []
  for (let i = 0; i < wordChars.length; ++i) {
    const c = wordChars.charAt(i)
    const v = ALPHABET_MAP[c]
    if (v === undefined) {
      return 'Unknown character ' + c
    }
    chk = polymodStep(chk) ^ v

    // not in the checksum?
    if (i + 6 >= wordChars.length) {
      continue
    }
    words.push(v)
  }

  if (chk !== 1) {
    return 'Invalid checksum for ' + str
  }
  return { prefix, words }
}

// function decodeUnsafe () {
//   const res = __decode.apply(null, arguments)
//   if (typeof res === 'object') {
//     return res
//   }
// }

// function decode (str: any) {
//   const res = __decode.apply(null, arguments)
//   if (typeof res === 'object') {
//     return res
//   }
//
//   throw new Error(res)
// }

function convert (data: any, inBits: any, outBits: any, pad: any) {
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
      return 'Excess padding'
    }
    if ((value << (outBits - bits)) & maxV) {
      return 'Non-zero padding'
    }
  }

  return result
}

function toWordsUnsafe (bytes: any) {
  const res = convert(bytes, 8, 5, true)
  if (Array.isArray(res)) {
    return res
  }
}

function toWords (bytes: any) {
  const res = convert(bytes, 8, 5, true)
  if (Array.isArray(res)) {
    return res
  }

  throw new Error(res)
}

function fromWordsUnsafe (words: any) {
  const res = convert(words, 5, 8, false)
  if (Array.isArray(res)) {
    return res
  }
}

function fromWords (words: any) {
  const res = convert(words, 5, 8, false)
  if (Array.isArray(res)) {
    return res
  }

  throw new Error(res)
}

export class Bech32 {
  static encode(bytes: Uint8Array): string {
    // return bech32.encode(
    //   this.prefix,
    //   bech32.toWords(this._bytes.subarray(PUBKEY_OFFSET)),
    // )

    return ''
  }

  static decode(bech32: string): Uint8Array {
    return new Uint8Array(0)

    // const raw = bech32.decode(adr)
    // this.version = prefixToUint16(raw.prefix)
    // this._bytes.set(new Uint8Array(bech32.fromWords(raw.words)), PUBKEY_OFFSET)

  }
}