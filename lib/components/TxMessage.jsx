import React, { useContext } from 'react'

import { EtherscanTxLink } from 'lib/components/EtherscanTxLink'
import { LoadingDots } from 'lib/components/LoadingDots'
import { shortenAddress } from 'lib/utils/shortenAddress'
import { WalletContext } from 'lib/components/WalletContextProvider'

export const TxMessage = (props) => {
  const walletContext = useContext(WalletContext)
  const { _onboard } = walletContext || {}
  const chainId = _onboard.getState().appNetworkId

  const {
    tx,
    txType,
    resetButtonText,
    handleReset,
  } = props

  const txInWallet = tx.inWallet && !tx.sent
  const txSent = tx.sent && !tx.completed
  const txCompleted = tx.completed
  const txError = tx.error
  const txInFlight = (txInWallet || txSent || txCompleted)

  if (!tx) {
    return null
  }

  return <>
    {txInFlight && <>
      <div
        className='pt-10 sm:pt-3 pb-3 px-2 sm:px-4  text-center text-white text-xs sm:text-sm lg:text-base'
      >
        <div
          className='font-bold rounded-full mb-4 text-white text-sm sm:text-base uppercase px-2 py-1 bg-purple-900'
        >
          Transaction status
        </div>

        <div
          className='mb-4 text-white text-base sm:text-xl lg:text-2xl'
        >
          {txType}
        </div>

        {txInWallet && <>
          <div
            className='mb-2 text-yellow-400 text-base sm:text-lg lg:text-xl'
          >
            Please confirm the transaction in your wallet ...
          </div>
        </>}

        {txSent && <>
          <div
            className='mb-2 text-yellow-400 text-base sm:text-lg lg:text-xl'
          >
            Waiting for confirmations ...
          </div>

          <div className='my-3'>
            <LoadingDots />
          </div>
        </>}

        {txCompleted && !txError && <>
          <div
            className='mb-2 text-green-300 text-base sm:text-lg lg:text-xl'
          >
            Transaction successful!
          </div>
        </>}

        {txError && <>
          <div
            className='mb-2 text-red-500 text-base sm:text-lg lg:text-xl'
          >
            There was an error with the transaction
          </div>

          <div className='my-3 text-purple-400'>
            {tx && tx.hash ? <>
              {<EtherscanTxLink
                chainId={chainId}
                hash={tx.hash}
              >
                See the result on Etherscan
              </EtherscanTxLink>} or check the JS console.
            </> : <>
              Transaction Signature Denied
            </>}
          </div>
        </>}



        <div
          className='mt-6 font-bold uppercase text-lightPurple-600 text-xs sm:text-sm lg:text-base'
        >
          {tx.hash && <>
            Tx Hash
          </>}
        </div>

        <div
          className='uppercase text-lightPurple-600 text-sm sm:text-base'
        >
          {tx.hash && <>
            {<EtherscanTxLink
              chainId={chainId}
              hash={tx.hash}
            >
              {shortenAddress(tx.hash)}
            </EtherscanTxLink>}
          </>}
        </div>


        {handleReset && txCompleted && <>
          <div className='mt-10 text-center'>
            <button
              className='font-bold rounded-full text-green-300 border-2 sm:border-4 border-green-300 hover:text-white hover:bg-lightPurple-1000 text-xxs sm:text-base pt-2 pb-2 px-3 sm:px-6 trans'
              onClick={handleReset}
            >
              {resetButtonText || 'Reset form'}
            </button>
          </div>
        </>}

        

      </div>
    </>}

  </>

}