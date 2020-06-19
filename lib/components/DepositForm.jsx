import React from 'react'
import { ethers } from 'ethers'

import { Button } from 'lib/components/Button'
import { FormLockedOverlay } from 'lib/components/FormLockedOverlay'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { displayAmountInEther } from 'lib/utils/displayAmountInEther'

export const DepositForm = (props) => {
  const {
    genericChainValues,
    handleSubmit,
    vars,
    stateSetters,
    disabled,
    usersChainValues,
  } = props

  const {
    usersTokenBalance,
  } = usersChainValues || {}

  const {
    tokenDecimals,
  } = genericChainValues || {}

  const poolIsLocked = genericChainValues.isRngRequested
  const tokenSymbol = genericChainValues.tokenSymbol || 'TOKEN'

  let depositAmount, setDepositAmount
  if (vars && stateSetters) {
    depositAmount = vars.depositAmount
    setDepositAmount = stateSetters.setDepositAmount
  }

  const overBalance = depositAmount && usersTokenBalance && usersTokenBalance.lt(
    ethers.utils.parseUnits(depositAmount, tokenDecimals)
  )

  return <>
    <form
      onSubmit={handleSubmit}
    >
      {poolIsLocked && <FormLockedOverlay
        title='Deposit'
      >
        <div>
          The Pool is currently being awarded and until awarding is complete can not accept withdrawals.
        </div>
      </FormLockedOverlay>}

      {disabled && <FormLockedOverlay
        title='Deposit'
      >
        <>
          <div
          >
            Unlock deposits by first approving the pool's ticket contract to have a DAI allowance.
          </div>

          <div
            className='mt-3 sm:mt-5 mb-5'
          >
            <Button
              color='green'
            >
              Unlock Deposits
            </Button>
          </div>
        </>
      </FormLockedOverlay>}
      
      <div
        className='font-bold mb-2 py-2 text-lg sm:text-xl lg:text-2xl'
      >
        Deposit:
      </div>

      <TextInputGroup
        id='depositAmount'
        label={<>
          Deposit amount <span className='text-purple-600 italic'> (in {genericChainValues.tokenSymbol || 'TOKEN'})</span>
        </>}
        required
        disabled={disabled}
        type='number'
        pattern='\d+'
        onChange={(e) => setDepositAmount(e.target.value)}
        value={depositAmount}
      />

      {overBalance && <>
        <div className='text-yellow-400'>
          You only have {displayAmountInEther(usersTokenBalance, { decimals: tokenDecimals })} {tokenSymbol}.
          <br />The maximum you can deposit is {displayAmountInEther(usersTokenBalance, { precision: 2, decimals: tokenDecimals })}.
        </div>
      </>}

      <div
        className='my-5'
      >
        <Button
          disabled={overBalance}
          color='green'
        >
          Deposit
        </Button>
      </div>
    </form>
  </>
}
