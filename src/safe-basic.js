import { ethers } from 'ethers'
import Safe from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import { config } from './config.js'
import { sepolia } from 'viem/chains'


class BasicSafeWallet {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl)
    this.safeSdk = null
    this.safeService = null
    this.owners = []
  }

  async setup() {
    console.log('🔧 Setting up Safe wallet...')
    
    // Create signers from private keys
    const signer1 = new ethers.Wallet(config.owners.owner1.privateKey, this.provider)
    const signer2 = new ethers.Wallet(config.owners.owner2.privateKey, this.provider)
    const signer3 = new ethers.Wallet(config.owners.owner3.privateKey, this.provider)
    
    this.owners = [signer1.address, signer2.address, signer3.address]
    
    console.log('👥 Owners:', this.owners)
    
    // Create Safe API kit (updated API)
    this.safeService = new SafeApiKit({
      chainId: BigInt(config.chainId),
      txServiceUrl: config.safeServiceUrl
    })
    
    return { signers: [signer1, signer2, signer3] }
  }

  async createSafeWallet(signer) {
    console.log('\n🏗️  Creating new Safe wallet...')
    console.log('\n🏗️  signer: ', signer.address)
    console.log('\n🏗️  this.owners: ', this.owners)
    
    // Safe configuration (updated API)
    const safeAccountConfig = {
      owners: this.owners,
      threshold: 2, // 2 out of 3 signatures required
    }

    const saltNonce = Date.now().toString();
    const predictSafe = {
        safeAccountConfig,
        safeDeploymentConfig: {
          saltNonce, // optional parameter
          safeVersion: '1.6.0',
          
        }
    }
    console.log('\n🔍 predictSafe:', JSON.stringify(predictSafe, null, 2));

    this.safeSdk = await Safe.init({ provider: config.rpcUrl, signer: signer.privateKey, predictSafe })

    const safeAddress = await this.safeSdk.getAddress();
    console.log('✅ Predict Safe Address is:', safeAddress)
    console.log('🔗 View on Etherscan:', `https://sepolia.etherscan.io/address/${safeAddress}`)
    return safeAddress
  }

  async connectToExistingSafe(signer, safeAddress) {
    console.log('\n🔌 Connecting to existing Safe wallet...')
    
    // Connect to existing Safe (updated API)
    this.safeSdk = await Safe.init({
      provider: this.provider.connection.url,
      signer: signer.privateKey,
      safeAddress
    })
    
    const owners = await this.safeSdk.getOwners()
    const threshold = await this.safeSdk.getThreshold()
    const balance = await this.safeSdk.getBalance()
    
    console.log('👥 Owners:', owners)
    console.log('🎯 Threshold:', threshold)
    console.log('💰 Balance:', ethers.utils.formatEther(balance), 'ETH')
    
    return { owners, threshold, balance }
  }

  async createTransaction(to, value, data = '0x') {
    console.log('\n📤 Creating transaction...')
    
    const safeTransactionData = {
      to,
      value,
      data
    }
    
    const safeTransaction = await this.safeSdk.createTransaction({ transactions: [safeTransactionData] })
    console.log('✅ Transaction created')
    console.log('📋 Transaction details:', {
      to: safeTransaction.data.to,
      value: safeTransaction.data.value,
      data: safeTransaction.data.data,
      nonce: safeTransaction.data.nonce
    })
    
    return safeTransaction
  }

  async signAndExecuteTransaction(safeTransaction, signers) {
    console.log('\n✍️  Signing transaction...')
    
    // Sign with first owner
    let signedTransaction = await this.safeSdk.signTransaction(safeTransaction)
    console.log('✅ Signed by owner 1')
    
    // Get transaction hash
    const safeTxHash = await this.safeSdk.getTransactionHash(signedTransaction)
    console.log('🔗 Transaction hash:', safeTxHash)
    
    // Sign with second owner (we need 2 signatures for threshold 2)
    const safeSdk2 = await Safe.init({
      provider: this.provider.connection.url,
      signer: signers[1].privateKey,
      safeAddress: await this.safeSdk.getAddress()
    })
    
    const signature2 = await safeSdk2.signHash(safeTxHash)
    signedTransaction.addSignature(signature2)
    console.log('✅ Signed by owner 2')
    
    // Execute transaction
    console.log('\n🚀 Executing transaction...')
    const executeTxResponse = await this.safeSdk.executeTransaction(signedTransaction)
    await executeTxResponse.transactionResponse?.wait()
    
    console.log('✅ Transaction executed!')
    console.log('🔗 Tx hash:', executeTxResponse.hash)
    
    return executeTxResponse
  }

  async getTransactionHistory() {
    console.log('\n📜 Getting transaction history...')
    
    const safeAddress = await this.safeSdk.getAddress()
    const transactions = await this.safeService.getMultisigTransactions(safeAddress)
    
    console.log(`📊 Found ${transactions.results.length} transactions`)
    
    transactions.results.forEach((tx, index) => {
      console.log(`\n📝 Transaction ${index + 1}:`)
      console.log('  To:', tx.to)
      console.log('  Value:', ethers.utils.formatEther(tx.value || '0'), 'ETH')
      console.log('  Status:', tx.isExecuted ? '✅ Executed' : '⏳ Pending')
      console.log('  Confirmations:', tx.confirmations?.length || 0)
    })
    
    return transactions
  }
}

export default BasicSafeWallet