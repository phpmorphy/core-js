const VERSION_GENESIS: number = 0x0000
const VERSION_UMI: number = 0x55A9
const ASCII_SHIFT: number = 96

export class Converter {
  static uint16ToPrefix (version: number): string {
    if (version === VERSION_GENESIS) {
      return 'genesis'
    }

    // tslint:disable:no-bitwise
    return String.fromCharCode(
      (((version & 0x7C00) >> 10) + ASCII_SHIFT),
      (((version & 0x03E0) >> 5) + ASCII_SHIFT),
      ((version & 0x001F) + ASCII_SHIFT),
    )
  }

  static prefixToUint16 (prefix: string): number {
    if (prefix === 'genesis') {
      return VERSION_GENESIS
    }

    // tslint:disable:no-bitwise
    return ((prefix.charCodeAt(0) - ASCII_SHIFT) << 10) +
      ((prefix.charCodeAt(1) - ASCII_SHIFT) << 5) +
      ((prefix.charCodeAt(2) - ASCII_SHIFT))
  }
}