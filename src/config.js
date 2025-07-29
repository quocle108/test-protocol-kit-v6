import dotenv from 'dotenv'
dotenv.config()

export const config = {
  rpcUrl: process.env.ETHEREUM_RPC_URL,
  safeServiceUrl: process.env.SAFE_SERVICE_URL,
  chainId: 11155111, // Sepolia testnet
  owners: {
    owner1: {
      privateKey: process.env.PRIVATE_KEY_1,
      address: '' // Will be derived from private key
    },
    owner2: {
      privateKey: process.env.PRIVATE_KEY_2,
      address: ''
    },
    owner3: {
      privateKey: process.env.PRIVATE_KEY_3,
      address: ''
    }
  }
}