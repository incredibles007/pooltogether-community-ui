import React, { useContext, useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import PrizeStrategyAbi from '@pooltogether/pooltogether-contracts/abis/MultipleWinners'

import { Button } from 'lib/components/Button'
import { Card } from 'lib/components/Card'
import { Collapse } from 'lib/components/Collapse'
import { DropdownInputGroup } from 'lib/components/DropdownInputGroup'
import { CONTRACT_ADDRESSES } from 'lib/constants'
import { networkAtom } from 'lib/hooks/useNetwork'
import { poolAddressesAtom } from 'lib/hooks/usePoolAddresses'
import { sendTx } from 'lib/utils/sendTx'
import { errorStateAtom } from 'lib/components/PoolData'
import { WalletContext } from 'lib/components/WalletContextProvider'
import { TxMessage } from 'lib/components/TxMessage'
import { poolChainValuesAtom } from 'lib/hooks/usePoolChainValues'
import { TextInputGroup } from 'lib/components/TextInputGroup'

const handleSetNumberOfWinners = async (
  txName,
  setTx,
  provider,
  prizeStrategyAddress,
  numOfWinners
) => {
  const params = [
    numOfWinners,
    {
      gasLimit: 200000
    }
  ]

  await sendTx(
    setTx,
    provider,
    prizeStrategyAddress,
    PrizeStrategyAbi,
    'setNumberOfWinners',
    params,
    txName
  )
}

export const NumOfWinnersControlCard = (props) => {
  return (
    <Card>
      <Collapse title='Number of winners'>
        <NumOfWinnersForm />
      </Collapse>
    </Card>
  )
}

const NumOfWinnersForm = (props) => {
  const [poolAddresses, setPoolAddresses] = useAtom(poolAddressesAtom)
  const [poolChainValues, setPoolChainValues] = useAtom(poolChainValuesAtom)
  const [network] = useAtom(networkAtom)
  const [tx, setTx] = useState({})
  const [errorState, setErrorState] = useAtom(errorStateAtom)
  const walletContext = useContext(WalletContext)
  const provider = walletContext.state.provider

  const currentNumOfWinners = poolChainValues.numberOfWinners

  const [newNumOfWinners, setNewNumOfWinners] = useState(currentNumOfWinners)

  // Listen for external updates
  useEffect(() => {
    setNewNumOfWinners(currentNumOfWinners)
  }, [currentNumOfWinners])

  const txName = 'Set Number of winners'

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSetNumberOfWinners(txName, setTx, provider, poolAddresses.prizeStrategy, newNumOfWinners)
  }

  // Update local data upon completion
  useEffect(() => {
    if (tx.completed && !tx.error) {
      setPoolChainValues({
        ...poolChainValues,
        numberOfWinners: newNumOfWinners
      })
    }
  }, [tx.completed, tx.error])

  const resetState = (e) => {
    e.preventDefault()

    setNewNumOfWinners(currentNumOfWinners)
    setTx({})
  }

  if (tx.inWallet || tx.sent || tx.completed) {
    return <TxMessage txType={txName} tx={tx} handleReset={resetState} />
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextInputGroup
        id='newNumOfWinners'
        name='newNumOfWinners'
        label='Number of winners'
        containerClassName='mb-8'
        placeholder='(eg. 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984)'
        onChange={(e) => {
          setNewNumOfWinners(e.target.value)
        }}
        value={newNumOfWinners}
      />
      <Button>Update winners</Button>
    </form>
  )
}
