'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, UserMinus, MessageSquare, ExternalLink } from 'lucide-react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useSolxProgramAccount } from '../data-access'
import Link from 'next/link'
import { Author } from '../model'

interface AuthorCardProps {
  author: Author
  isCurrentUser?: boolean
  compact?: boolean
  showActions?: boolean
}

export function AuthorCard({ author, isCurrentUser = false, compact = false, showActions = true }: AuthorCardProps) {
  const { publicKey } = useWallet()
  const { isFollowing, followAuthor, unfollowAuthor } = useSolxProgramAccount({
    account: author.publicKey,
  })

  const canFollow = publicKey && !isCurrentUser && showActions
  const profileUrl = `/profile/${author.owner.toBase58()}`

  const handleFollowClick = async () => {
    if (!canFollow) return

    try {
      if (isFollowing(author.owner)) {
        await unfollowAuthor.mutateAsync({ authorKey: author.publicKey })
      } else {
        await followAuthor.mutateAsync({ authorKey: author.publicKey })
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold truncate">{author.name}</h3>
              {isCurrentUser && <Badge variant="secondary">You</Badge>}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {author.publicKey.toBase58().slice(0, 8)}...{author.publicKey.toBase58().slice(-8)}
            </p>
          </div>

          {!isCurrentUser && (
            <Button asChild variant="ghost" size="sm">
              <Link href={profileUrl}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {author.bio && <p className={`text-sm text-muted-foreground ${compact ? 'line-clamp-2' : ''}`}>{author.bio}</p>}

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{author.followers}</span>
            <span className="text-muted-foreground">followers</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{author.following}</span>
            <span className="text-muted-foreground">following</span>
          </div>
          {author.postCount !== undefined && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{author.postCount}</span>
              <span className="text-muted-foreground">posts</span>
            </div>
          )}
        </div>

        {canFollow && (
          <div className="flex gap-2 pt-2">
            <Button
              variant={isFollowing(author.owner) ? 'outline' : 'default'}
              size="sm"
              onClick={handleFollowClick}
              disabled={followAuthor.isPending || unfollowAuthor.isPending}
              className="flex-1"
            >
              {isFollowing(author.owner) ? (
                <>
                  <UserMinus className="h-4 w-4 mr-1" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
