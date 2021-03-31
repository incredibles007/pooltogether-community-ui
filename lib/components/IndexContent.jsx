import React, { useContext, useMemo, useState } from 'react'
import Link from 'next/link'
import { find, findKey, upperFirst } from 'lodash'
import FeatherIcon from 'feather-icons-react'
import classnames from 'classnames'

import { NETWORKS, CONTRACT_ADDRESSES, POOL_ALIASES, SUPPORTED_NETWORKS } from 'lib/constants'
import { ButtonLink } from 'lib/components/ButtonLink'
import { Card, CardTitle } from 'lib/components/Card'
import { Collapse } from 'lib/components/Collapse'
import { DropdownInputGroup } from 'lib/components/DropdownInputGroup'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { WalletContext } from 'lib/components/WalletContextProvider'
import { useCoingeckoTokenData } from 'lib/hooks/useCoingeckoTokenData'
import { useAllCreatedPrizePoolsWithTokens } from 'lib/hooks/useAllCreatedPrizePoolsWithTokens'
import { useAllUserTokenBalances } from 'lib/hooks/useAllUserTokenBalances'
import { getPrecision, numberWithCommas } from 'lib/utils/numberWithCommas'
import { useNetwork } from 'lib/hooks/useNetwork'
import { CheckboxInputGroup } from 'lib/components/CheckboxInputGroup'
import { Tooltip } from 'lib/components/Tooltip'
import { PoolTogetherLoading } from 'lib/components/PoolTogetherLoading'
import { BlockExplorerLink, LinkIcon } from 'lib/components/BlockExplorerLink'
import { NETWORK, NETWORK_DATA } from 'lib/utils/networks'
import { UnsupportedNetwork } from 'lib/components/UnsupportedNetwork'

import { useIsOwnerPoolTogether } from 'lib/hooks/useIsOwnerPoolTogether'

export const IndexContent = () => {
  const { chainId, name: networkName } = useNetwork()

  if (!SUPPORTED_NETWORKS.includes(chainId)) {
    return <UnsupportedNetwork chainId={chainId} networkName={networkName} />
  }

  return <PoolsLists />
}

const PoolsLists = () => {
  const {
    data: createdPrizePools,
    isFetched: createdPrizePoolsIsFetched,
    isFetching: createdPrizePoolsIsFetching
  } = useAllCreatedPrizePoolsWithTokens()
  const {
    data: tokenBalances,
    isFetched: tokenBalancesIsFetched,
    isFetching: tokenBalancedIsFetching
  } = useAllUserTokenBalances()

  if (
    !createdPrizePoolsIsFetched ||
    !tokenBalancesIsFetched ||
    tokenBalancedIsFetching ||
    createdPrizePoolsIsFetching
  ) {
    return <PoolTogetherLoading />
  }

  return (
    <>
      <UsersPoolsCard createdPrizePools={createdPrizePools} tokenBalances={tokenBalances} />
      <GovernancePoolsCard createdPrizePools={createdPrizePools} tokenBalances={tokenBalances} />
      <AllPoolsCard createdPrizePools={createdPrizePools} tokenBalances={tokenBalances} />
      <ReferencePoolCard />
      <BuilderCard />
    </>
  )
}

const ReferencePoolCard = () => {
  const [network, setNetwork] = useState('mainnet')
  const [contractAddress, setContractAddress] = useState('')

  const formatValue = (key) => NETWORKS[key].view

  const onValueSet = (network) => {
    setNetwork(network)
  }

  return (
    <Card>
      <Collapse title='🔍 Lookup pool by contract address'>
        <DropdownInputGroup
          id='network-dropdown'
          label={'Network the Pool is on:'}
          formatValue={formatValue}
          onValueSet={onValueSet}
          current={network}
          values={NETWORKS}
        />

        <TextInputGroup
          id='contractAddress'
          label={<>Prize Pool contract address:</>}
          required
          onChange={(e) => setContractAddress(e.target.value)}
          value={contractAddress}
        />

        <div className='mt-4 ml-auto'>
          <ViewButton
            as={`/pools/${network}/${contractAddress}/home`}
            href='/pools/[networkName]/[prizePoolAddress]/home'
            disabled={!contractAddress}
          />
        </div>
      </Collapse>
    </Card>
  )
}

const BuilderCard = () => {
  return (
    <Card>
      <div className='w-full flex flex-row'>
        <CardTitle noMargin>🔨 Pool Builder</CardTitle>
        <ViewButton text='Start Building' href={'https://builder.pooltogether.com/'} />
      </div>
    </Card>
  )
}

const GovernancePoolsCard = (props) => {
  const { createdPrizePools, tokenBalances } = props
  const walletContext = useContext(WalletContext)
  const { chainId } = useNetwork()
  const [hideNoDeposits, setHideNoDeposits] = useState(false)

  const isWalletConnected = Boolean(walletContext._onboard.getState().address)

  const pools = useMemo(() => {
    if (!createdPrizePools || !tokenBalances) return []

    const pools = []

    for (const prizePool of createdPrizePools) {
      const token = tokenBalances[prizePool.token]
      const ticket = tokenBalances[prizePool.ticket]

      if (hideNoDeposits && Number(ticket.totalSupply) === 0) continue

      // Add to governance pools if owned by the timelock address
      if (prizePool.prizePoolOwner === CONTRACT_ADDRESSES[chainId].GovernanceTimelock) {
        const row = (
          <PoolRow key={prizePool.prizePool} prizePool={prizePool} token={token} ticket={ticket} />
        )
        pools.push(row)
      }
    }

    pools.sort(sortByTvl)

    return pools
  }, [createdPrizePools, tokenBalances, isWalletConnected, hideNoDeposits, chainId])

  if (pools.length === 0) return null

  return (
    <Card>
      <Collapse
        title={
          <>
            🏆 Governance Pools
            <Tooltip
              id='governance-pools'
              className='ml-2 my-auto'
              tip='These pools are owned and maintained by PoolTogether governance'
            />
          </>
        }
        containerClassName='mb-4 xs:mb-8'
        headerMarginClassName='mb-4'
        renderCustomIcon={({ showContent, setShowContent }) => (
          <FeatherIcon
            icon='settings'
            className={classnames(
              'ml-3 sm:ml-4 w-4 h-4 my-auto stroke-current text-accent-1 trans cursor-pointer',
              {
                'rotate-90': showContent
              }
            )}
            onClick={() => setShowContent(!showContent)}
          />
        )}
      >
        <div className='flex'>
          <span className='ml-auto my-auto text-xs leading-snug'>Hide pools with no deposits</span>
          <CheckboxInputGroup
            checked={hideNoDeposits}
            handleClick={() => setHideNoDeposits(!hideNoDeposits)}
            marginClasses='ml-2'
          />
        </div>
      </Collapse>
      <ListHeaders />
      <ul>{pools}</ul>
    </Card>
  )
}

const UsersPoolsCard = (props) => {
  const { createdPrizePools, tokenBalances } = props

  const walletContext = useContext(WalletContext)

  const isWalletConnected = Boolean(walletContext._onboard.getState().address)

  const pools = useMemo(() => {
    if (!createdPrizePools || !tokenBalances || !isWalletConnected) return []

    const pools = []

    for (const prizePool of createdPrizePools) {
      const token = tokenBalances[prizePool.token]
      const ticket = tokenBalances[prizePool.ticket]

      // Add to user pools if user has a balance
      if (Number(ticket.balance) !== 0) {
        const row = (
          <PoolRow key={prizePool.prizePool} prizePool={prizePool} token={token} ticket={ticket} />
        )
        pools.push(row)
      }
    }

    pools.sort(sortByTvl)

    return pools
  }, [createdPrizePools, tokenBalances, isWalletConnected])

  if (pools.length === 0) return null

  return (
    <Card>
      <CardTitle>🎟 My Pools</CardTitle>
      <ListHeaders />
      <ul>{pools}</ul>
    </Card>
  )
}

const AllPoolsCard = (props) => {
  const { createdPrizePools, tokenBalances } = props

  const walletContext = useContext(WalletContext)
  const { chainId, view: networkView } = useNetwork()
  const [hideNoDeposits, setHideNoDeposits] = useState(createdPrizePools.length > 10)
  const [showFirstTen, setShowFirstTen] = useState(createdPrizePools.length > 10)

  const isWalletConnected = Boolean(walletContext._onboard.getState().address)

  const pools = useMemo(() => {
    if (!createdPrizePools || !tokenBalances) return []

    const pools = []

    for (const prizePool of createdPrizePools) {
      const token = tokenBalances[prizePool.token]
      const ticket = tokenBalances[prizePool.ticket]

      if (hideNoDeposits && Number(ticket.totalSupply) === 0) continue

      const row = (
        <PoolRow key={prizePool.prizePool} prizePool={prizePool} token={token} ticket={ticket} />
      )
      pools.push(row)
    }

    pools.sort(sortByTvl)

    if (showFirstTen) return pools.slice(0, 10)

    return pools
  }, [createdPrizePools, tokenBalances, hideNoDeposits, showFirstTen, isWalletConnected])

  if (createdPrizePools?.length === 0) return null

  let tip = 'These pools created permissionlessly by anyone using the PoolTogether Builder'
  if ([NETWORK.matic, NETWORK.mumbai].includes(chainId)) {
    tip = `Unfortunately due to limitations of ${networkView} we can't dynamically compile a list of
    created prize pools.`
  }

  return (
    <Card>
      <Collapse
        title={
          <>
            🤿 All Pools
            <Tooltip id='all-pools' className='ml-2 my-auto' tip={tip} />
          </>
        }
        containerClassName='mb-4 xs:mb-8'
        headerMarginClassName='mb-4'
        renderCustomIcon={({ showContent, setShowContent }) => (
          <FeatherIcon
            icon='settings'
            className={classnames(
              'ml-3 sm:ml-4 my-auto w-4 h-4 stroke-current text-accent-1 trans cursor-pointer',
              {
                'rotate-90': showContent
              }
            )}
            onClick={() => setShowContent(!showContent)}
          />
        )}
      >
        <div className='flex'>
          <span className='ml-auto my-auto text-xs leading-snug'>Hide pools with no deposits</span>
          <CheckboxInputGroup
            checked={hideNoDeposits}
            handleClick={() => setHideNoDeposits(!hideNoDeposits)}
            marginClasses='ml-2'
          />
        </div>
      </Collapse>
      <ListHeaders />
      <ul>{pools}</ul>
      {showFirstTen && createdPrizePools?.length > 10 && (
        <div className='flex'>
          <button
            className='mx-auto trans hover:text-accent-1'
            onClick={(e) => {
              e.preventDefault()
              setShowFirstTen(false)
            }}
          >
            Show all
          </button>
        </div>
      )}
    </Card>
  )
}

const sortByTvl = (a, b) => Number(b.props.ticket.totalSupply) - Number(a.props.ticket.totalSupply)

const ListHeaders = (props) => {
  const walletContext = useContext(WalletContext)
  const isWalletConnected = Boolean(walletContext._onboard.getState().address)

  return (
    <div className='w-full flex text-accent-1 text-xs mb-2'>
      <span className='w-2/3 xs:w-1/3 mr-2 sm:mr-0'>Title</span>
      <span className='w-1/6 hidden sm:block'>Type</span>
      {isWalletConnected && <span className='w-1/6 hidden sm:block'>My balance</span>}
      <span className='w-1/6 hidden xs:block'>Total deposits</span>
    </div>
  )
}

const PoolRow = (props) => {
  const walletContext = useContext(WalletContext)
  const isWalletConnected = Boolean(walletContext._onboard.getState().address)

  return (
    <li className='flex flex-row mb-4 last:mb-0 w-full'>
      <PoolTitleCell {...props} />
      <TypeCell {...props} />
      {isWalletConnected && <UsersBalanceCell {...props} />}
      <TvlCell {...props} />
      <Actions {...props} />
    </li>
  )
}

const PoolTitleCell = (props) => {
  const { prizePool, token } = props
  const name = token?.name
  const { token: tokenAddress, prizePoolOwner } = prizePool
  const { data: tokenData } = useCoingeckoTokenData(tokenAddress)
  const imageUrl = tokenData?.image?.large

  return (
    <div className='flex w-2/3 xs:w-1/3 mr-2 sm:mr-0'>
      <div className='w-6 h-6 mr-2'>
        {imageUrl && <img src={imageUrl} className='my-auto rounded-full' />}
      </div>
      <div className='flex flex-col'>
        {name}
        <span className='text-accent-1 text-xxs'>
          Owned by: <OwnerAddress ownerAddress={prizePoolOwner} />
        </span>
      </div>
    </div>
  )
}

const TypeCell = (props) => {
  const { prizePool } = props
  const { type } = prizePool
  return <span className='w-1/6 hidden sm:block my-auto'>{type}</span>
}

const TvlCell = (props) => {
  const { ticket, token } = props
  const amount = ticket.totalSupply.toString()
  return (
    <span className='w-1/6 hidden xs:block my-auto'>
      {numberWithCommas(amount, { precision: getPrecision(Number(amount)) })}
      <span className='ml-1 text-xs text-accent-1'>{token.symbol}</span>
    </span>
  )
}

const UsersBalanceCell = (props) => {
  const { ticket } = props
  const balance = ticket.balance.toString()

  return (
    <span className='w-1/6 hidden sm:block my-auto'>
      {numberWithCommas(balance, { precision: getPrecision(Number(balance)) })}
      <span className='ml-1 text-xs text-accent-1'>{ticket.symbol}</span>
    </span>
  )
}

export const OwnerAddress = (props) => {
  const { ownerAddress, copyable } = props

  const ownerIsPoolTogether = useIsOwnerPoolTogether(ownerAddress)

  if (ownerIsPoolTogether) {
    return (
      <div className='inline-flex bg-purple-1 rounded-full px-2 width-fit-content'>
        <BlockExplorerLink copyable={copyable} shorten address={ownerAddress}>
          PoolTogether
          <LinkIcon />
        </BlockExplorerLink>
      </div>
    )
  }

  return <BlockExplorerLink shorten address={ownerAddress} />
}

const Actions = (props) => {
  const { chainId, name: networkName } = useNetwork()
  const { prizePool, ticket } = props
  const { prizePool: prizePoolAddress } = prizePool

  const [as, href] = useMemo(() => {
    const poolAlias = Object.values(POOL_ALIASES).find(
      (poolAlias) => poolAlias.poolAddress === prizePoolAddress.toLowerCase()
    )
    if (poolAlias) {
      const as = `/${poolAlias.alias}`
      const href = '/[poolAlias]'
      return [as, href]
    }
    const as = `/pools/${networkName}/${prizePoolAddress}/home`
    const href = '/pools/[networkName]/[prizePoolAddress]/home'
    return [as, href]
  }, [prizePoolAddress, networkName])

  return (
    <div className='ml-auto'>
      <ViewButton as={as} href={href} />
    </div>
  )
}

const ViewButton = (props) => (
  <ButtonLink
    size='base'
    color='tertiary'
    as={props.as}
    href={props.href}
    paddingClasses='px-4 xs:px-10 py-1 sm:py-2'
    className='ml-auto'
    disabled={props.disabled}
  >
    {props.text}
  </ButtonLink>
)

ViewButton.defaultProps = {
  text: 'View'
}
