import React, { useContext, useEffect, useState } from 'react'

import { useNetwork } from 'lib/hooks/useNetwork'
import { useAddNetworkToMetamask } from 'lib/hooks/useAddNetworkToMetamask'
import { Button } from 'lib/components/Button'
import { WalletContext } from 'lib/components/WalletContextProvider'
import { WALLETS } from 'lib/constants'
import { CloseBannerButton, NotificationBanner } from 'lib/components/NotificationBanners'
import { NETWORK } from 'lib/utils/networks'
import { ButtonLink } from 'lib/components/ButtonLink'

export const ChangeWalletNetworkNotificationBanner = (props) => {
  const { walletConnected, walletMatchesNetwork, walletNetwork, view, chainId } = useNetwork()

  if (!walletConnected || walletMatchesNetwork) return null

  return (
    <NotificationBanner className='bg-teal'>
      <ChangeWalletNetworkNotification
        chainId={chainId}
        walletNetwork={walletNetwork}
        poolChainName={view}
      />
    </NotificationBanner>
  )
}

// TODO: Blocked on a guide for network changing
const ChangeWalletNetworkNotification = (props) => {
  const { chainId, walletNetwork, poolChainName } = props

  const wallet = useContext(WalletContext)
  const addNetwork = useAddNetworkToMetamask(chainId)

  const walletName = wallet?.state?.wallet?.name
  const { view: walletChainName, chainId: walletChainId } = walletNetwork

  const connectableNetwork = [NETWORK.matic, NETWORK.mumbai, NETWORK.xdai]

  const showConnectButton =
    [WALLETS.metamask].includes(walletName) && connectableNetwork.includes(chainId)

  return (
    <div className='flex flex-col sm:flex-row justify-between'>
      <span>
        👋 Your wallet is currently set to <b>{walletChainName}</b>. Please connect to{' '}
        <b>{poolChainName}</b> to participate in this pool.
      </span>
      {showConnectButton ? (
        <Button
          size='xs'
          color='primary'
          onClick={() => addNetwork()}
          paddingClasses='py-1 px-4'
          className='mt-2 mx-auto sm:mx-0 sm:mt-0 mx'
        >
          Connect to {poolChainName}
        </Button>
      ) : null}
    </div>
  )
}

// TODO: Render this in the false case once we have a link to an article
// (
//   <ButtonLink
//     size='xs'
//     color='primary'
//     paddingClasses='py-1 px-4'
//     className='mt-2 mx-auto sm:mx-0 sm:mt-0 mx'
//     href='https://www.google.com'
//     target='_blank'
//     rel='noopener noreferrer'
//   >
//     More info
//   </ButtonLink>
// )
