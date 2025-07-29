import { ethers } from 'ethers'
import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import { config } from './config.js'

class AdvancedSafeWorkflow {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl)
    this.safeSdk = null
    this.safeService = null
    this.signers = []
  }

  async setup() {
    // Setup signers
    this.signers = [
      new ethers.Wallet(config.owners.owner1.privateKey, this.provider),
      new ethers.Wallet(config.owners.owner2.privateKey, this.provider),
      new ethers.Wallet(config.owners.owner3.privateKey, this.provider)
    ]

    // Setup Safe service
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signers[0]
    })

    this.safeService = new SafeApiKit({
      txServiceUrl: config.safeServiceUrl,
      ethAdapter
    })

    return ethAdapter
  }

  async proposeTransaction(safeAddress, to, value, data = '0x') {
    console.log('\n📝 Proposing transaction...')
    
    // Connect as first owner
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signers[0]
    })
    
    this.safeSdk = await Safe.create({
      ethAdapter,
      safeAddress
    })
    
    // Create transaction
    const safeTransactionData = { to, value, data }
    const safeTransaction = await this.safeSdk.createTransaction({ safeTransactionData })
    
    // Sign transaction
    const signedTransaction = await this.safeSdk.signTransaction(safeTransaction)
    const safeTxHash = await this.safeSdk.getTransactionHash(signedTransaction)
    
    // Propose to Safe service
    await this.safeService.proposeTransaction({
      safeAddress,
      safeTransactionData: signedTransaction.data,
      safeTxHash,
      senderAddress: this.signers[0].address,
      senderSignature: signedTransaction.signatures.get(this.signers[0].address.toLowerCase()).data
    })
    
    console.log('✅ Transaction proposed')
    console.log('🔗 Safe transaction hash:', safeTxHash)
    
    return safeTxHash
  }

  async confirmTransaction(safeAddress, safeTxHash, signerIndex) {
    console.log(`\n✍️  Owner ${signerIndex + 1} confirming transaction...`)
    
    // Connect as specific owner
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signers[signerIndex]
    })
    
    const safeSdk = await Safe.create({
      ethAdapter,
      safeAddress
    })
    
    // Sign transaction hash
    const signature = await safeSdk.signTransactionHash(safeTxHash)
    
    // Submit confirmation
    await this.safeService.confirmTransaction(safeTxHash, signature.data)
    
    console.log(`✅ Transaction confirmed by owner ${signerIndex + 1}`)
    
    return signature
  }

  async executeTransaction(safeAddress, safeTxHash) {
    console.log('\n🚀 Executing confirmed transaction...')
    
    // Get transaction details
    const transaction = await this.safeService.getTransaction(safeTxHash)
    
    // Connect as first owner (executor)
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signers[0]
    })
    
    this.safeSdk = await Safe.create({
      ethAdapter,
      safeAddress
    })
    
    // Execute transaction
    const executeTxResponse = await this.safeSdk.executeTransaction(transaction)
    await executeTxResponse.transactionResponse?.wait()
    
    console.log('✅ Transaction executed!')
    console.log('🔗 Execution hash:', executeTxResponse.hash)
    
    return executeTxResponse
  }

  async getPendingTransactions(safeAddress) {
    console.log('\n⏳ Getting pending transactions...')
    
    const pendingTxs = await this.safeService.getPendingTransactions(safeAddress)
    
    console.log(`📊 Found ${pendingTxs.results.length} pending transactions`)
    
    pendingTxs.results.forEach((tx, index) => {
      console.log(`\n📝 Pending Transaction ${index + 1}:`)
      console.log('  To:', tx.to)
      console.log('  Value:', ethers.utils.formatEther(tx.value || '0'), 'ETH')
      console.log('  Confirmations:', tx.confirmations.length)
      console.log('  Required:', tx.confirmationsRequired)
      console.log('  Safe Tx Hash:', tx.safeTxHash)
    })
    
    return pendingTxs
  }

  async addOwner(safeAddress, newOwnerAddress, newThreshold) {
    console.log('\n👤 Adding new owner...')
    
    // Connect as first owner
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signers[0]
    })
    
    this.safeSdk = await Safe.create({
      ethAdapter,
      safeAddress
    })
    
    // Create add owner transaction
    const safeTransaction = await this.safeSdk.createAddOwnerTx({
      ownerAddress: newOwnerAddress,
      threshold: newThreshold
    })
    
    console.log('✅ Add owner transaction created')
    console.log('📋 New owner:', newOwnerAddress)
    console.log('🎯 New threshold:', newThreshold)
    
    return safeTransaction
  }

  async removeOwner(safeAddress, ownerAddress, newThreshold) {
    console.log('\n❌ Removing owner...')
    
    // Connect as first owner
    const ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signers[0]
    })
    
    this.safeSdk = await Safe.create({
      ethAdapter,
      safeAddress
    })
    
    // Create remove owner transaction
    const safeTransaction = await this.safeSdk.createRemoveOwnerTx({
      ownerAddress,
      threshold: newThreshold
    })
    
    console.log('✅ Remove owner transaction created')
    console.log('📋 Removing owner:', ownerAddress)
    console.log('🎯 New threshold:', newThreshold)
    
    return safeTransaction
  }
}

export default AdvancedSafeWorkflow