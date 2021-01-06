import { ethers } from 'ethers'

export const calculateOdds = (
  usersTicketBalance,
  totalSupply,
  ticketDecimals,
  numberOfWinners = 1
) => {
  if (!usersTicketBalance || usersTicketBalance.eq(ethers.utils.bigNumberify(0))) {
    return 0
  }

  const numOfWinners =
    typeof numberOfWinners === 'object' ? numberOfWinners.toNumber() : parseInt(numberOfWinners, 10)

  const usersBalanceFloat = Number(
    ethers.utils.formatUnits(usersTicketBalance, Number(ticketDecimals))
  )

  const totalSupplyFloat = Number(ethers.utils.formatUnits(totalSupply, Number(ticketDecimals)))

  // Calculate odds of winning at least 1 of the possible scenarios.
  // 1/N, 2/N ... N-1/N, N/N
  // Then we always display "1 in ____" so 1 / X.
  return 1 / (1 - Math.pow((totalSupplyFloat - usersBalanceFloat) / totalSupplyFloat, numOfWinners))
}
