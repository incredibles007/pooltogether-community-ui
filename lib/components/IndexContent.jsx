import React, { useState } from 'react'
import Link from 'next/link'

import { Button } from 'lib/components/Button'
import { Input } from 'lib/components/Input'
import { getDemoPoolContractAddress } from 'lib/utils/getDemoPoolContractAddress'

export const IndexContent = (
  props,
) => {
  const [network, setNetwork] = useState('kovan')
  const [contractAddress, setContractAddress] = useState('')

  const kovanDaiPoolManagerContractAddress = getDemoPoolContractAddress('kovan', 'dai')
  const kovanUsdcPoolManagerContractAddress = getDemoPoolContractAddress('kovan', 'usdc')
  const kovanUsdtPoolManagerContractAddress = getDemoPoolContractAddress('kovan', 'usdt')

  const handleNetworkChange = (e) => {
    setNetwork(e.target.value)
  }

  return <>
{/*

<div
      className='text-lg sm:text-xl lg:text-2xl mb-4'
    >
      1. View one of the demo pools:
    </div>

    <div
      className='text-xs sm:text-lg lg:text-xl'
    >
      <Link
        href='/pools/[networkName]/[poolManagerAddress]'
        as={`/pools/kovan/${kovanDaiPoolManagerContractAddress}`}
      >
        <a
          className='-mx-6 sm:mx-0 lg:-mx-2 w-10/12 sm:w-full lg:w-1/2 px-6 sm:px-4 lg:mr-4 mb-2 pt-2 pb-3 inline-block bg-purple-1100 hover:bg-purple-1000 trans border-2 border-purple-700 rounded-lg hover:border-purple-500'
        >
          <span className='text-blue-200 text-base'>Demo Kovan DAI Pool</span>
          <br/>
          {kovanDaiPoolManagerContractAddress}
        </a>
      </Link>

      <Link
        href='/pools/[networkName]/[poolManagerAddress]'
        as={`/pools/kovan/${kovanUsdcPoolManagerContractAddress}`}
      >
        <a
          className='-ml-6 sm:mx-0 lg:-mx-2 w-10/12 sm:w-full lg:w-1/2 px-6 sm:px-4 mb-2 mr-2 pt-2 pb-3 inline-block bg-purple-1100 hover:bg-purple-1000 trans border-2 border-purple-700 rounded-lg hover:border-purple-500'
        >
          <span className='text-blue-200 text-base'>Demo Kovan USDC Pool</span>
          <br />
          {kovanUsdcPoolManagerContractAddress}
        </a>
      </Link>

      <Link
        href='/pools/[networkName]/[poolManagerAddress]'
        as={`/pools/kovan/${kovanUsdtPoolManagerContractAddress}`}
      >
        <a
          className='-ml-6 sm:mx-0 lg:-mx-2 w-10/12 sm:w-full lg:w-1/2 px-6 sm:px-4 mb-2 mr-2 pt-2 pb-3 inline-block bg-purple-1100 hover:bg-purple-1000 trans border-2 border-purple-700 rounded-lg hover:border-purple-500'
        >
          <span className='text-blue-200 text-base'>Demo Kovan Tether Pool</span>
          <br />
          {kovanUsdtPoolManagerContractAddress}
        </a>
      </Link>
    </div>

    <hr/>

    <div
      className='text-lg sm:text-xl lg:text-2xl mb-4'
    >
      2. Or enter a pool to view it's details:
    </div>
*/}

    <div
      className='bg-purple-1000 -mx-8 sm:-mx-0 py-4 px-8 sm:p-10 pb-16 rounded-xl lg:w-3/4 text-base sm:text-lg mb-20'
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()

          window.location.href = `/pools/${network}/${contractAddress}`
        }}
      >
        <label
          htmlFor='kovan-radio'
          className='text-purple-300 hover:text-white trans mt-0'
        >Pool the network is on:</label>
        <div
          className='inputGroup w-full sm:w-10/12 text-base sm:text-xl lg:text-2xl'
        >
          <input
            id='kovan-radio'
            name='radio'
            type='radio'
            onChange={handleNetworkChange}
            value='kovan'
            checked={network === 'kovan'}
          />
          <label
            htmlFor='kovan-radio'
            className='text-purple-300 relative pl-6 py-3'
          >kovan</label>
        </div>

        <div
          className='inputGroup w-full sm:w-10/12 text-base sm:text-xl lg:text-2xl'
        >
          <input
            id='mainnet-radio'
            name='radio'
            type='radio'
            onChange={handleNetworkChange}
            value='mainnet'
            checked={network === 'mainnet'}
          />
          <label
            htmlFor='mainnet-radio'
            className='text-purple-300 relative pl-6 py-3'
          >mainnet</label>
        </div>
        

        <label
          htmlFor='contractAddress'
          className='text-purple-300 hover:text-white trans mt-0'
        >Pool's manager contract address:</label>
        <Input
          required
          id='contractAddress'
          onChange={(e) => setContractAddress(e.target.value)}
          value={contractAddress}
        />

        <div
          className='my-5'
        >
          <Button
            color='green'
          >
            View Pool
          </Button>
        </div>
      </form>
    </div>
  
  </>
}
