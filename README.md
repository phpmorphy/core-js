# umi-core-js
UMI Core JavaScript Library

### Install

    npm i @umi-top/umi-core-js

### Example

```javascript
const umi = require('@umi-top/umi-core-js')

let mnemonic = 'hen faculty attract curve liquid include void cereal task sibling decorate ' +
  'dwarf brief sibling false diagram open parade aware real mention theme session evoke'

let sender = umi.mnemonicToAddress(mnemonic)

console.log(sender)  // umi1qqqumpt2jchfa63qc0jxztud7twd5x89ya49h58sw34hdls8kl3a60cl4qmrf

let recipient = 'umi1qqqnau6tregpsvew37qvwjd448j79j4m8pzk4ydzjwsvuqev4vm975sjtgw6g'

console.log(umi.validateAddress(recipient))  // true

let value = BigInt(123456789)
let secretKey = umi.mnemonicToSecretKey(mnemonic)
let tx = umi.createTransaction(sender, recipient, value, secretKey)

console.log(tx.toString('hex'))  // 010001cd856a962e9eea20c3e4612f8df2dcda18e5...

let message = Buffer.from('Hello World!')
let signature = umi.sign(message, secretKey)
let publicKey = umi.mnemonicToPublicKey(mnemonic)

console.log(signature.toString('hex'))  // 605fe31094f0a28a5d9...
console.log(umi.verify(message, signature, publicKey))  // true

```