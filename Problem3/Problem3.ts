interface WalletBalance {
    currency: string;
    amount: number;
}
interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    // I cant find where define these hooks
    const balances = useWalletBalances();
    const prices = usePrices();

    const getPriority = (blockchain: any): number => {
        switch (blockchain) {
            case 'Osmosis':
                return 100
            case 'Ethereum':
                return 50
            case 'Arbitrum':
                return 30
            case 'Zilliqa':
                return 20
            case 'Neo':
                return 20
            default:
                return -99
        }
    }
    // Improved Type Safety => Define a blockchain type instead of any
    //   const blockchainPriorities: Record<string, number> = {
    //     Osmosis: 100,
    //     Ethereum: 50,
    //     Arbitrum: 30,
    //     Zilliqa: 20,
    //     Neo: 20,
    //   };
    // Precomputed priorities eliminate repeated calls to getPriority
    // const getPriority = (blockchain: string): number =>
    //     blockchainPriorities[blockchain] ?? -99;


    const sortedBalances = useMemo(() => {
        return balances.filter((balance: WalletBalance) => {
            // This variable  didnt use anywhere and type of WalletBalance not include key "blockchain"
            const balancePriority = getPriority(balance.blockchain);

            // This variable has not been declared
            if (lhsPriority > -99) {
                if (balance.amount <= 0) {
                    return true;
                }
            }
            return false
        }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
            const leftPriority = getPriority(lhs.blockchain);
            const rightPriority = getPriority(rhs.blockchain);
            if (leftPriority > rightPriority) {
                return -1;
            } else if (rightPriority > leftPriority) {
                return 1;
            }
        });
    }, [balances, prices]); // Depends on both balances and prices, but only balances is used in its computation => Removed unnecessary dependencies and ensured computations are efficient.

    // Array is created but immediately discarded after the second mapping to generate rows below
    const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
        return {
            ...balance,
            formatted: balance.amount.toFixed()
        }
    })

    const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
        const usdValue = prices[balance.currency] * balance.amount;
        return (
            <WalletRow 
                className= { classes.row }
        key = { index } // Can cause rendering inefficiencies when the order of rows changes => Find another unique identifier
        amount = { balance.amount }
        usdValue = { usdValue }
        formattedAmount = { balance.formatted } // Combine the logic for formatting balances and generating rows in a single pass
            //formattedAmount={balance.amount.toFixed()}
            />
      )
})

return (
    <div { ...rest } >
    { rows }
    </div>
)
  }