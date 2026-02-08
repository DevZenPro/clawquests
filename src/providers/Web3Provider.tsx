import { WagmiProvider, createConfig, http, fallback } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

const config = createConfig(
  getDefaultConfig({
    chains: [base, baseSepolia],
    transports: {
      [base.id]: fallback([
        http('https://base-rpc.publicnode.com'),
        http('https://1rpc.io/base'),
        http('https://mainnet.base.org'),
      ]),
      [baseSepolia.id]: fallback([
        http('https://base-sepolia-rpc.publicnode.com'),
        http('https://sepolia.base.org'),
      ]),
    },
    walletConnectProjectId: import.meta.env.VITE_WC_PROJECT_ID || '',
    appName: 'ClawQuests',
  })
)

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
