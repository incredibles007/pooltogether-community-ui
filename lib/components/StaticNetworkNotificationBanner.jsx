import React, { useContext } from 'react'
import classnames from 'classnames'

import { SUPPORTED_NETWORKS } from 'lib/constants'
import { WalletContext } from 'lib/components/WalletContextProvider'
import { chainIdToName } from 'lib/utils/chainIdToName'

export const StaticNetworkNotificationBanner = ({
}) => {
  let chainId
  const walletContext = useContext(WalletContext)
  const { _onboard } = walletContext || {}

  if (!_onboard.getState().wallet.name) {
    return null
  }

  chainId = _onboard.getState().appNetworkId
  const networkName = chainIdToName(chainId)

  const networkSupported = SUPPORTED_NETWORKS.includes(chainId)

  let networkWords = 'mainnet 🥵'
  if (networkSupported) {
    networkWords = `the ${networkName} testnet 👍`
  }

  return <div
    className={classnames(
      'text-sm sm:text-base lg:text-lg sm:px-6 py-2 sm:py-3',
      {
        'text-white bg-red-800': !networkSupported,
        'text-purple-400 bg-purple-1000': networkSupported,
      }
    )}
  >
    <div
      className='text-center'
    >
      This works on Ropsten, Kovan and localhost.
      Your wallet is currently set to <span className='font-bold'>{networkWords}</span>
    </div>
  </div>
}