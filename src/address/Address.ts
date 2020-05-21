import bech32 from 'bech32'
import { PublicKey, PublicKeyInterface } from '../key'
import { AddressInterface } from './AddressInterface'
import { Converter } from '../util'

const ADDRESS_LENGTH: number = 34
const VERSION_OFFSET: number = 0
const PUBKEY_OFFSET: number = 2
const FIFTEEN_BITS: number = 0x7FFF

export class Address implements AddressInterface {
  private readonly _bytes: Uint8Array = new Uint8Array(ADDRESS_LENGTH)

  constructor (bytes?: Uint8Array) {
    if (bytes === undefined) {
      this.prefix = 'umi'
    } else {
      this._bytes.set(bytes)
    }
  }

  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  get version (): number {
    return new DataView(this._bytes.buffer).getUint16(VERSION_OFFSET)
  }

  set version (ver: number) {
    // tslint:disable-next-line:no-bitwise
    new DataView(this._bytes.buffer).setUint16(0, (ver & FIFTEEN_BITS))
  }

  get publicKey (): PublicKeyInterface {
    return new PublicKey(this._bytes.subarray(PUBKEY_OFFSET))
  }

  set publicKey (publicKey: PublicKeyInterface) {
    this._bytes.set(publicKey.bytes, PUBKEY_OFFSET)
  }

  setPublicKey (publicKey: PublicKeyInterface): this {
    this.publicKey = publicKey
    return this
  }

  get prefix (): string {
    return Converter.uint16ToPrefix(this.version)
  }

  set prefix (prefix: string) {
    this.version = Converter.prefixToUint16(prefix)
  }

  setPrefix (prefix: string): this {
    this.prefix = prefix
    return this
  }

  get bech32 (): string {
    return bech32.encode(
      this.prefix,
      bech32.toWords(this._bytes.subarray(PUBKEY_OFFSET)),
    )
  }

  set bech32 (adr: string) {
    const raw = bech32.decode(adr)
    this.version = Converter.prefixToUint16(raw.prefix)
    this._bytes.set(new Uint8Array(bech32.fromWords(raw.words)), PUBKEY_OFFSET)
  }

  fromBech32 (adr: string): this {
    this.bech32 = adr
    return this
  }
}