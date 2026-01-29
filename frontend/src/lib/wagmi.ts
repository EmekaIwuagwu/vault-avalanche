import { http, createConfig } from 'wagmi'
import { avalanche, avalancheFuji } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
    chains: [avalanche, avalancheFuji],
    connectors: [
        injected(), // This will handle MetaMask, Core, and official Avalanche wallets
        coinbaseWallet({ appName: 'VAULT' }),
    ],
    ssr: true,
    transports: {
        [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
        [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
    },
})
