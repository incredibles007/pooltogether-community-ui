import { atom, useAtom } from 'jotai'
import { useContext, useEffect } from 'react'
import { useRouter } from 'next/router'

import { nameToChainId } from 'lib/utils/nameToChainId'
import { EMPTY_ERROR_STATE, errorStateAtom } from 'lib/components/PoolData'
import { WalletContext } from 'lib/components/WalletContextProvider'

export const networkAtom = atom({})

export const useNetwork = () => {
  const [network, setNetwork] = useAtom(networkAtom)
  const [errorState, setErrorState] = useAtom(errorStateAtom)
  const router = useRouter()
  const networkName = router.query.networkName
  const walletContext = useContext(WalletContext)
  const walletNetwork = walletContext._onboard.getState().network

  useEffect(() => {
    setErrorState(EMPTY_ERROR_STATE)
    setNetwork({
      name: networkName,
      id: nameToChainId(networkName),
      walletNetwork
    })
  }, [networkName, walletNetwork])

  return network
}
