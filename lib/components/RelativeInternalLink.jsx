import React from 'react'
import { useRouter } from 'next/router'
import { omit } from 'lodash'

import { InternalLink } from 'lib/components/InternalLink'
import { useNetwork } from 'lib/hooks/useNetwork'
import { usePrizePoolContracts } from 'lib/hooks/usePrizePoolContracts'
import { getNetworkNameAliasByChainId } from 'lib/utils/networks'

export const RelativeInternalLink = (props) => {
  const router = useRouter()
  const poolAlias = router.query.poolAlias

  const { chainId } = useNetwork()
  const { data: prizePoolContracts } = usePrizePoolContracts()

  const networkName = getNetworkNameAliasByChainId(chainId)

  let href = `/pools/[networkName]/[prizePoolAddress]${props.link}`
  let as = `/pools/${networkName}/${prizePoolContracts.prizePool.address}${props.link}`

  if (poolAlias) {
    href = `/[poolAlias]${props.link}`
    as = `/${poolAlias}${props.link}`
  }

  const newProps = omit(props, ['link'])

  return (
    <InternalLink {...newProps} href={href} as={as}>
      {props.children}
    </InternalLink>
  )
}
