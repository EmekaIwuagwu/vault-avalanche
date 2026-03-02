import { http, createConfig } from 'wagmi'
import { avalanche, avalancheFuji } from 'wagmi/chains'
import { injected, coinbaseWallet, metaMask } from 'wagmi/connectors'

export const config = createConfig({
    chains: [avalancheFuji, avalanche],
    multiInjectedProviderDiscovery: true,
    connectors: [
        injected({
            shimDisconnect: true,
        }),
        metaMask(),
        coinbaseWallet({
            appName: 'VAULT',
            preference: 'smartWalletOnly'
        }),
    ],
    ssr: true,
    transports: {
        [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
        [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
    },
})
