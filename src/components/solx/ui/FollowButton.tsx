'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { useSolxProgramAccount } from '../data-access'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'

interface FollowButtonProps {
  authorPublicKey: PublicKey
  onFollowChange?: (isFollowing: boolean) => void
  className?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export function FollowButton({ authorPublicKey, onFollowChange, className, size = 'sm', variant }: FollowButtonProps) {
  const { publicKey } = useWallet()
  const { followAuthor, unfollowAuthor, isFollowing } = useSolxProgramAccount({
    account: authorPublicKey,
  })

  const [isLoading, setIsLoading] = useState(false)

  if (!publicKey || publicKey.equals(authorPublicKey)) {
    return null
  }

  const handleFollowClick = async () => {
    setIsLoading(true)

    try {
      if (isFollowing(authorPublicKey)) {
        await unfollowAuthor.mutateAsync({
          authorKey: authorPublicKey,
        })
        onFollowChange?.(false)
      } else {
        await followAuthor.mutateAsync({
          authorKey: authorPublicKey,
        })
        onFollowChange?.(true)
      }
    } catch (error) {
      console.error('Error following/unfollowing author:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const buttonVariant = variant || (isFollowing(authorPublicKey) ? 'outline' : 'default')
  const isPending = followAuthor.isPending || unfollowAuthor.isPending || isLoading

  return (
    <Button variant={buttonVariant} size={size} onClick={handleFollowClick} disabled={isPending} className={className}>
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : isFollowing(authorPublicKey) ? (
        <UserMinus className="h-4 w-4 mr-1" />
      ) : (
        <UserPlus className="h-4 w-4 mr-1" />
      )}
      {isPending ? 'Loading...' : isFollowing(authorPublicKey) ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
