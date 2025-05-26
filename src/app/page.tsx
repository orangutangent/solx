'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, Zap, Shield, ArrowRight, Sparkles, Globe, Coins } from 'lucide-react'
import { WalletButton } from '@/components/solana/solana-provider'

export default function HomePage() {
  const { publicKey } = useWallet()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Если кошелек подключен, перенаправляем на фид
  useEffect(() => {
    if (mounted && publicKey) {
      router.push('/feed')
    }
  }, [publicKey, router, mounted])

  if (!mounted) {
    return null // Предотвращаем гидратацию
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-green-950/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 mr-2" />
            Built on Solana Blockchain
          </Badge>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 text-transparent bg-clip-text">
                SolX
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              The decentralized social platform where your voice matters and your data belongs to you
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <WalletButton />
            <Button variant="outline" size="lg" asChild>
              <Link href="/explore">
                <Globe className="h-5 w-5 mr-2" />
                Explore Platform
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Decentralized</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">~$0.01</div>
              <div className="text-sm text-muted-foreground">Transaction Cost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose SolX?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience social media the way it should be - fast, secure, and truly yours
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Truly Decentralized"
            description="Your data lives on the blockchain, not on corporate servers. You own your content and identity."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Lightning Fast"
            description="Built on Solana for instant transactions and real-time interactions with minimal fees."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Connect & Follow"
            description="Build meaningful connections by following authors and curating your personalized feed."
          />
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8" />}
            title="Share Your Voice"
            description="Create posts, share thoughts, and engage with a community that values authentic expression."
          />
          <FeatureCard
            icon={<Coins className="h-8 w-8" />}
            title="Low Cost"
            description="Enjoy social media without breaking the bank. Transactions cost fractions of a penny."
          />
          <FeatureCard
            icon={<Globe className="h-8 w-8" />}
            title="Global Access"
            description="Access your social network from anywhere in the world, 24/7, without restrictions."
          />
        </div>
      </section>

      {/* How it Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Get Started in 3 Steps</h2>
          <p className="text-lg text-muted-foreground">Join the decentralized social revolution in minutes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <StepCard
            step="1"
            title="Connect Wallet"
            description="Connect your Solana wallet (Phantom, Solflare, etc.) to get started"
          />
          <StepCard
            step="2"
            title="Create Profile"
            description="Set up your author profile with a name and bio to represent yourself"
          />
          <StepCard
            step="3"
            title="Start Socializing"
            description="Follow interesting authors, create posts, and build your network"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Ready to Own Your Social Experience?</CardTitle>
            <CardDescription className="text-lg">
              Join SolX today and be part of the decentralized social media revolution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WalletButton />
              <Button variant="outline" asChild>
                <Link href="/explore">
                  Explore First
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No email required • No personal data collection • Your keys, your content
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 text-transparent bg-clip-text font-bold text-xl">
                SolX
              </span>
              <span className="text-sm text-muted-foreground">Decentralized Social Platform</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Built with ❤️ on Solana</span>
              <span>•</span>
              <Link
                href="https://twitter.com/0xDeKart"
                target="_blank"
                className="hover:text-primary transition-colors"
              >
                @0xDeKart
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="mx-auto w-fit p-3 rounded-full bg-primary/10 text-primary mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
        {step}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
