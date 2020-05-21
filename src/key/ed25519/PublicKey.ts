import nacl from 'tweetnacl'
import { PublicKeyInterface } from '../PublicKeyInterface'

export class PublicKey implements PublicKeyInterface {
  private readonly _bytes: Uint8Array = new Uint8Array(
    nacl.sign.publicKeyLength)

  constructor (bytes: Uint8Array) {
    this._bytes.set(bytes)
  }

  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  verifySignature (message: Uint8Array, signature: Uint8Array): boolean {
    return nacl.sign.detached.verify(message, signature, this._bytes)
  }
}