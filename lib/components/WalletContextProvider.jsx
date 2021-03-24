import React, { useState } from 'react'
import { ethers } from 'ethers'
import Onboard from '@pooltogether/bnc-onboard'
import Cookies from 'js-cookie'

import { SELECTED_WALLET_COOKIE_KEY } from 'lib/constants'
import { nameToChainId } from 'lib/utils/networks'

const debug = require('debug')('WalletContextProvider')

const INFURA_KEY = process.env.NEXT_JS_INFURA_KEY
const FORTMATIC_KEY = process.env.NEXT_JS_FORTMATIC_API_KEY
const PORTIS_KEY = process.env.NEXT_JS_PORTIS_API_KEY

// let networkName = 'mainnet'
let networkName = 'rinkeby'
const RPC_URL =
  networkName && INFURA_KEY
    ? `https://${networkName}.infura.io/v3/${INFURA_KEY}`
    : 'http://localhost:8545'

let cookieOptions = { sameSite: 'strict' }
if (process.env.NEXT_JS_DOMAIN_NAME) {
  cookieOptions = {
    ...cookieOptions,
    domain: `.${process.env.NEXT_JS_DOMAIN_NAME}`
  }
}

const APP_NAME = 'PoolTogether'

const walletConnectOptions = {
  infuraKey: INFURA_KEY,
  preferred: true
}

const WALLETS_CONFIG = [
  { walletName: 'metamask', preferred: true },
  { walletName: 'coinbase', preferred: true },
  { walletName: 'rainbow', preferred: true, ...walletConnectOptions },
  { walletName: 'argent', preferred: true, ...walletConnectOptions },
  { walletName: 'trustWallet', preferred: true, ...walletConnectOptions },
  { walletName: 'gnosisSafe', preferred: true, ...walletConnectOptions },
  { walletName: 'trust', preferred: true, rpcUrl: RPC_URL },
  {
    walletName: 'trezor',
    preferred: true,
    appUrl: 'https://app.pooltogether.com',
    email: 'hello@pooltogether.com',
    rpcUrl: RPC_URL
  },
  {
    walletName: 'ledger',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'fortmatic',
    preferred: true,
    apiKey: FORTMATIC_KEY
  },
  {
    walletName: 'walletConnect',
    ...walletConnectOptions
  },
  {
    walletName: 'walletLink',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'imToken',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'dcent',
    preferred: true
  },
  {
    walletName: 'huobiwallet',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'portis',
    preferred: true,
    apiKey: PORTIS_KEY
  },
  {
    walletName: 'authereum',
    preferred: true
  },
  {
    walletName: 'status',
    preferred: true
  },
  {
    walletName: 'torus',
    preferred: true
  },
  {
    walletName: 'lattice',
    preferred: true,
    rpcUrl: RPC_URL,
    appName: APP_NAME
  },
  {
    walletName: 'mykey',
    preferred: true,
    rpcUrl: RPC_URL
  },
  {
    walletName: 'opera',
    preferred: true
  },
  {
    walletName: 'operaTouch',
    preferred: true
  },
  {
    walletName: 'web3Wallet',
    preferred: true
  }
]

export const WalletContext = React.createContext()

let _onboard

const initializeOnboard = (setOnboardState) => {
  _onboard = Onboard({
    hideBranding: true,
    networkId: nameToChainId(networkName),
    darkMode: true,
    walletSelect: {
      wallets: WALLETS_CONFIG
    },
    subscriptions: {
      address: async (a) => {
        debug('address change')
        debug(a)
        setAddress(setOnboardState)
      },
      balance: async (balance) => {
        setOnboardState((previousState) => ({
          ...previousState,
          onboard: _onboard,
          timestamp: Date.now()
        }))
      },
      network: async (n) => {
        debug('network change')
        debug('new network id', n)
        await _onboard.config({ networkId: n })
        setOnboardState((previousState) => ({
          ...previousState,
          network: n
        }))
      },
      wallet: (w) => {
        debug({ w })
        if (!w.name) {
          disconnectWallet(setOnboardState)
        } else {
          connectWallet(w, setOnboardState)

          setAddress(setOnboardState)
        }
      }
    }
  })
}

// walletType is optional here:
const doConnectWallet = async (walletType, setOnboardState) => {
  await _onboard.walletSelect(walletType)
  const currentState = _onboard.getState()
  debug({ currentState })

  if (currentState.wallet.type) {
    debug('run walletCheck')
    await _onboard.walletCheck()
    debug('walletCheck done')
    debug({ currentState: _onboard.getState() })

    // trigger re-render
    setOnboardState((previousState) => ({
      ...previousState,
      timestamp: Date.now()
    }))
  }
}

const connectWallet = (w, setOnboardState) => {
  Cookies.set(SELECTED_WALLET_COOKIE_KEY, w.name, cookieOptions)

  const provider = new ethers.providers.Web3Provider(w.provider, 'any')

  setOnboardState((previousState) => ({
    ...previousState,
    address: undefined,
    wallet: w,
    provider
  }))
}

const disconnectWallet = (setOnboardState) => {
  Cookies.remove(SELECTED_WALLET_COOKIE_KEY, cookieOptions)

  setOnboardState((previousState) => ({
    ...previousState,
    address: undefined,
    wallet: undefined,
    provider: undefined
  }))
}

const onPageLoad = async (setOnboardState) => {
  const previouslySelectedWallet = Cookies.get(SELECTED_WALLET_COOKIE_KEY)

  if (previouslySelectedWallet !== undefined) {
    debug('using cookie')
    doConnectWallet(previouslySelectedWallet, setOnboardState)
  }
}

const setAddress = (setOnboardState) => {
  debug('running setAddress')
  const currentState = _onboard.getState()

  try {
    const provider = currentState.wallet.provider
    let address = null

    if (provider) {
      address = provider.selectedAddress
      debug('setting address to: ', address)
    } else {
      debug('no provider, setting address: to null')
    }

    // trigger re-render
    setOnboardState((previousState) => ({
      ...previousState,
      address,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.error(e)
  }
}

export const WalletContextProvider = (props) => {
  const [onboardState, setOnboardState] = useState()

  if (!onboardState) {
    initializeOnboard(setOnboardState)

    onPageLoad(setOnboardState)

    setOnboardState((previousState) => ({
      ...previousState,
      onboard: _onboard
    }))
  }

  const handleConnectWallet = () => {
    if (onboardState) {
      doConnectWallet(null, setOnboardState)
    }
  }

  return (
    <WalletContext.Provider
      value={{
        handleConnectWallet,
        state: onboardState,
        _onboard
      }}
    >
      {props.children}
    </WalletContext.Provider>
  )
}
