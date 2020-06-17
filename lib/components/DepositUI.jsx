import React, { useContext, useState } from 'react'
import { ethers } from 'ethers'

import CompoundPeriodicPrizePoolAbi from '@pooltogether/pooltogether-contracts/abis/CompoundPeriodicPrizePool'

import { DepositForm } from 'lib/components/DepositForm'
import { TxMessage } from 'lib/components/TxMessage'
import { WalletContext } from 'lib/components/WalletContextProvider'
import { poolToast } from 'lib/utils/poolToast'
import { sendTx } from 'lib/utils/sendTx'

const handleDepositSubmit = async (
  setTx,
  provider,
  usersAddress,
  contractAddress,
  depositAmount,
  decimals
) => {
  if (
    !depositAmount
  ) {
    poolToast.error(`Deposit Amount needs to be filled in`)
    return
  }

  const params = [
    usersAddress,
    ethers.utils.parseUnits(depositAmount, decimals),
    [], // bytes calldata
    {
      gasLimit: 700000
    }
  ]

  await sendTx(
    setTx,
    provider,
    contractAddress,
    CompoundPeriodicPrizePoolAbi,
    'mintTickets',
    params,
    'Deposit',
  )
}

export const DepositUI = (props) => {
  const walletContext = useContext(WalletContext)
  const provider = walletContext.state.provider
  const usersAddress = walletContext._onboard.getState().address

  const [depositAmount, setDepositAmount] = useState('')

  const [tx, setTx] = useState({})

  const txInFlight = tx.inWallet || tx.sent

  const resetState = (e) => {
    e.preventDefault()
    setDepositAmount('')
    setTx({})
  }

  return <>
    {!txInFlight ? <>
      <DepositForm
        {...props}
        genericChainValues={props.genericChainValues}
        handleSubmit={(e) => {
          e.preventDefault()
          handleDepositSubmit(
            setTx,
            provider,
            usersAddress,
            props.poolAddresses.prizePool,
            depositAmount,
            props.genericChainValues.tokenDecimals
          )
        }}
        vars={{
          depositAmount,
        }}
        stateSetters={{
          setDepositAmount,
        }}
      />
    </> : <>
      <TxMessage
        txType='Deposit to Pool'
        tx={tx}
        handleReset={resetState}
      />
    </>}
    
  </>
}

