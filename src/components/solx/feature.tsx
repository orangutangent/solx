'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useSolxProgram } from './data-access'
import { AuthorCreate, AuthorList } from './ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'

export default function SolxFeature() {
  const { publicKey } = useWallet()
  const { programId } = useSolxProgram()

  return publicKey ? (
    <div className="space-y-8">
      <AppHero
        title="SolX - Decentralized Social Platform"
        subtitle={
          'Welcome to SolX, a decentralized social media platform built on Solana. Create your author profile, share posts, and connect with the community. All data is stored on-chain, ensuring true ownership of your content and social connections.'
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Program ID: <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
          </p>
          <AuthorCreate account={publicKey} />
        </div>
      </AppHero>

      <div className="max-w-7xl mx-auto px-4">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Community Authors</h2>
            <p className="text-muted-foreground">Discover and connect with other authors in the SolX community</p>
          </div>
          <AuthorList />
        </div>
      </div>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-16">
        <div className="hero-content text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 text-transparent bg-clip-text">
              Welcome to SolX
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              A decentralized social media platform built on Solana blockchain. Own your content, connect with others,
              and be part of the Web3 social revolution.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 my-8 text-left">
            <div className="space-y-2">
              <h3 className="font-semibold">🔐 True Ownership</h3>
              <p className="text-sm text-muted-foreground">
                Your profile and content are stored on-chain, giving you complete control and ownership.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">⚡ Fast & Cheap</h3>
              <p className="text-sm text-muted-foreground">
                Built on Solana for lightning-fast transactions with minimal fees.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">🌐 Decentralized</h3>
              <p className="text-sm text-muted-foreground">No central authority. Your social network, your rules.</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground">Connect your Solana wallet to get started</p>
            <WalletButton />
          </div>

          <div className="pt-8 border-t">
            <p className="text-xs text-muted-foreground">
              Program ID: <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
