import React, { useMemo } from 'react';

interface WalletBalance {
    blockchain: string;
    currency: string;
    amount: number;
}

interface Props extends BoxProps { }

const WalletPage: React.FC<Props> = (props) => {
    const { children, ...rest } = props;
    const balances: [WalletBalance] = useWalletBalances();
    const prices = usePrices();

    // Precompute blockchain priorities
    // Improved Type Safety => Define a blockchain type instead of any
    const blockchainPriorities: Record<string, number> = {
        Osmosis: 100,
        Ethereum: 50,
        Arbitrum: 30,
        Zilliqa: 20,
        Neo: 20,
    };

    // Precomputed priorities eliminate repeated calls to getPriority
    const getPriority = (blockchain: string): number =>
        blockchainPriorities[blockchain] ?? -99;


    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance) => getPriority(balance.blockchain) > -99 && balance.amount > 0)
            .sort((lhs, rhs) => {
                const leftPriority = getPriority(lhs.blockchain);
                const rightPriority = getPriority(rhs.blockchain);
                return rightPriority - leftPriority; // Descending order
            });
    }, [balances]); // Removed unnecessary dependencies and ensured computations are efficient

    // Generate rows directly
    const rows = sortedBalances.map((balance) => {
        const usdValue = prices[balance.currency] * balance.amount;
        return (
            <WalletRow
        className= { classes.row }
        key = { balance.currency } // Use a unique key
        amount = { balance.amount }
        usdValue = { usdValue }
        formattedAmount = { balance.amount.toFixed() } // Combine the logic for formatting balances and generating rows in a single pass
            />
    );
});

return <div { ...rest } > { rows } </div>;
};
