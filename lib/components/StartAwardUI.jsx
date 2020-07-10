import React, { useContext, useState } from 'react'

import CompoundPeriodicPrizePoolAbi from '@pooltogether/pooltogether-contracts/abis/CompoundPeriodicPrizePool'

import { Button } from 'lib/components/Button'
import { TxMessage } from 'lib/components/TxMessage'
import { WalletContext } from 'lib/components/WalletContextProvider'
import { sendTx } from 'lib/utils/sendTx'

const handleStartAwardSubmit = async (
  setTx,
  provider,
  contractAddress,
) => {
  const params = [
    {
      gasLimit: 200000
    }
  ]

  await sendTx(
    setTx,
    provider,
    contractAddress,
    CompoundPeriodicPrizePoolAbi,
    'startAward',
    params,
    'Start Award',
  )
}

export const StartAwardUI = (props) => {
  const {
    genericChainValues
  } = props

  const walletContext = useContext(WalletContext)
  const provider = walletContext.state.provider

  const [tx, setTx] = useState({})

  const txInFlight = tx.inWallet || tx.sent && !tx.completed

  const resetState = (e) => {
    e.preventDefault()
    setTx({})
  }

  const handleClick = (e) => {
    e.preventDefault()

    handleStartAwardSubmit(
      setTx,
      provider,
      props.poolAddresses.prizePool,
    )
  }

  return <>
    {!txInFlight ? <>
      {genericChainValues.canStartAward && <>
        <Button
          onClick={handleClick}
          color='blue'
          size='sm'
        >
          Start Award
        </Button>
      </>}
    </> : <>
      <TxMessage
        txType='Start Award'
        tx={tx}
        handleReset={resetState}
        resetButtonText='Hide this'
      />
    </>}
    
  </>
}

