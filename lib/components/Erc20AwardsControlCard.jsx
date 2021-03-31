import React, { useMemo, useState } from 'react'
import PrizeStrategyAbi from '@pooltogether/pooltogether-contracts/abis/PeriodicPrizeStrategy'
import FeatherIcon from 'feather-icons-react'
import classnames from 'classnames'

import { SENTINEL_ADDRESS } from 'lib/constants'
import { RowDataCell, Table } from 'lib/components/Table'
import { LoadingDots } from 'lib/components/LoadingDots'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { Card, InnerCard } from 'lib/components/Card'
import { Collapse } from 'lib/components/Collapse'
import { Button } from 'lib/components/Button'
import { TxMessage } from 'lib/components/TxMessage'
import { ConnectWalletButton } from 'lib/components/ConnectWalletButton'
import { CopyableAddress } from 'lib/components/CopyableAddress'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useExternalErc20Awards } from 'lib/hooks/useExternalErc20Awards'
import { usePoolChainValues } from 'lib/hooks/usePoolChainValues'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'
import { useNetwork } from 'lib/hooks/useNetwork'
import { usePrizePoolContracts } from 'lib/hooks/usePrizePoolContracts'
import { useOnTransactionCompleted } from 'lib/hooks/useOnTransactionCompleted'

import PrizeIllustration from 'assets/images/prize-illustration-transparent@2x.png'

const handleAddExternalErc20 = async (
  sendTx,
  txName,
  setTx,
  prizeStrategyAddress,
  externalErc20
) => {
  const params = [externalErc20]

  await sendTx(
    setTx,
    prizeStrategyAddress,
    PrizeStrategyAbi,
    'addExternalErc20Award',
    txName,
    params
  )
}

const handleRemoveExternalErc20 = async (
  sendTx,
  txName,
  setTx,
  prizeStrategyAddress,
  externalErc20,
  prevExternalErc20
) => {
  const params = [externalErc20, prevExternalErc20]

  await sendTx(
    setTx,
    prizeStrategyAddress,
    PrizeStrategyAbi,
    'removeExternalErc20Award',
    txName,
    params
  )
}

export const Erc20AwardsControlCard = (props) => {
  return (
    <Card>
      <Collapse title='External ERC20 awards'>
        <AwardsTable />
        <AddErc20Form />
      </Collapse>
    </Card>
  )
}

const AwardsTable = () => {
  const { data: erc20Awards, isFetched: erc20AwardsIsFetched } = useExternalErc20Awards()

  const rows = useMemo(
    () =>
      erc20Awards.map((award, index) => {
        return (
          <Row
            key={index}
            award={award}
            prevAddress={index === 0 ? SENTINEL_ADDRESS : erc20Awards[index].address}
          />
        )
      }),
    [erc20Awards]
  )

  if (!erc20AwardsIsFetched) {
    return (
      <div className='p-10'>
        <LoadingDots />
      </div>
    )
  }

  if (erc20Awards.length === 0) {
    return (
      <InnerCard className='mb-8'>
        <img src={PrizeIllustration} className='w-32 sm:w-64 mx-auto mb-4' />
        <span className='text-accent-1 text-center text-base sm:text-xl'>
          Oh no, there are no external prizes yet!
        </span>
      </InnerCard>
    )
  }

  return (
    <Table headers={['Value', 'Token name', 'Ticker', '']} rows={rows} className='mb-8 w-full' />
  )
}

const AddErc20Form = () => {
  const [externalErc20Address, setExternalErc20Address] = useState('')
  const [tx, setTx] = useState({})
  const usersAddress = useUsersAddress()
  const { data: prizePoolContracts } = usePrizePoolContracts()
  const { refetch: refetchPoolChainValues } = usePoolChainValues()
  const { walletMatchesNetwork } = useNetwork()
  const sendTx = useSendTransaction()

  const txName = 'Add External ERC20 Token'

  const resetState = (e) => {
    e.preventDefault()

    setExternalErc20Address('')
    setTx({})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleAddExternalErc20(
      sendTx,
      txName,
      setTx,
      prizePoolContracts.prizeStrategy.address,
      externalErc20Address
    )
  }

  useOnTransactionCompleted(tx, refetchPoolChainValues)

  if (!usersAddress) {
    return <ConnectWalletButton className='w-full mt-4' />
  }

  if (tx.inWallet || tx.sent || tx.completed) {
    return <TxMessage txType={txName} tx={tx} handleReset={resetState} />
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className='mb-4 text-sm sm:text-base font-bold opacity-80'>
        Follow the steps below to add prizes to the pool:{' '}
      </div>
      <div className='my-4 text-sm sm:text-base text-accent-1'>
        1. Send the ERC20 tokens manually to the contract address below.
      </div>
      <CopyableAddress
        className='ml-4 my-4 text-lg sm:text-xl'
        address={prizePoolContracts.prizePool.address}
      />
      <div className='mb-6 text-sm sm:text-base text-accent-1'>
        2. Add the ERC20 token contract address to the external awards distribution list below.
      </div>

      <TextInputGroup
        id='newErc20Address'
        name='newErc20Address'
        label='ERC20 token address'
        containerClassName='mb-8'
        placeholder='(eg. 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984)'
        onChange={(e) => {
          setExternalErc20Address(e.target.value)
        }}
        value={externalErc20Address}
      />
      <Button color='secondary' size='lg' disabled={!externalErc20Address || !walletMatchesNetwork}>
        Add ERC20 awardable token
      </Button>
    </form>
  )
}

const Row = (props) => {
  const { prevAddress } = props
  const { formattedBalance, symbol, name, address } = props.award

  return (
    <tr>
      <RowDataCell first className='font-bold'>
        {formattedBalance}
      </RowDataCell>
      <RowDataCell>{name}</RowDataCell>
      <RowDataCell className='text-accent-1'>{symbol}</RowDataCell>
      <RemoveAddressButton address={address} prevAddress={prevAddress} />
    </tr>
  )
}

const RemoveAddressButton = (props) => {
  const { address, prevAddress } = props
  const [tx, setTx] = useState({})
  const { data: prizePoolContracts } = usePrizePoolContracts()
  const usersAddress = useUsersAddress()
  const { refetch: refetchPoolChainValues } = usePoolChainValues()
  const sendTx = useSendTransaction()

  const txName = 'Remove External ERC20 Token'

  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleRemoveExternalErc20(
      sendTx,
      txName,
      setTx,
      prizePoolContracts.prizeStrategy.address,
      address,
      prevAddress
    )
  }

  useOnTransactionCompleted(tx, refetchPoolChainValues)

  if (!usersAddress) {
    return null
  }

  if (tx.sent && !tx.completed) {
    return <td className='pl-8 text-right flex-grow text-accent-1'>Waiting for confirmations</td>
  }

  if (tx.inWallet && !tx.completed) {
    return (
      <td className='pl-8 text-right flex-grow text-accent-1'>
        Please confirm transaction in your wallet
      </td>
    )
  }

  return (
    <td className='pl-8 text-right flex-grow'>
      <button type='button' onClick={handleSubmit}>
        <FeatherIcon
          icon='x'
          strokeWidth='0.25rem'
          className={classnames(
            'ml-3 sm:ml-4 w-3 h-3 sm:w-4 sm:h-4 my-auto stroke-current text-red-1 trans hover:opacity-75 active:opacity-50'
          )}
        />
      </button>
    </td>
  )
}
