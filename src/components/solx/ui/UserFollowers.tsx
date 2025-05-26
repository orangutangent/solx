'use client'

import { useEffect, useState } from 'react'
import { useSolxProgram } from '../data-access'
import { Author, followRelation } from '../model'
import { AuthorCard } from './AuthorCard'
import { PublicKey } from '@solana/web3.js'
import { Loader2, Users } from 'lucide-react'

interface UserFollowersProps {
  userPublicKey: PublicKey
}

export function UserFollowers({ userPublicKey }: UserFollowersProps) {
  const { useUserFollowers } = useSolxProgram()

  const followersQuery = useUserFollowers(userPublicKey)

  if (followersQuery.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading followers...</span>
        </div>
      </div>
    )
  }

  if (followersQuery.isError) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Failed to load followers</p>
            <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    )
  }

  const followers = followersQuery.data || []

  if (followers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No followers yet</h3>
            <p className="text-sm text-muted-foreground">When people follow this user, they&apos;ll appear here.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Followers</h3>
        <span className="text-sm text-muted-foreground">
          {followers.length} {followers.length === 1 ? 'follower' : 'followers'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {followers.map((follower: { publicKey: PublicKey; account: followRelation }) => (
          <FollowerCard key={follower.publicKey.toString()} followerRelation={follower.account} />
        ))}
      </div>
    </div>
  )
}
function FollowerCard({ followerRelation }: { followerRelation: followRelation }) {
  const { useAuthorByPublicKey, program } = useSolxProgram()

  const [followerPDA, setFollowerPDA] = useState<Author | null>(null)

  useEffect(() => {
    program.account.author.fetch(followerRelation.follower).then((followerPDA) => {
      setFollowerPDA({
        publicKey: followerRelation.follower,
        owner: followerPDA.owner,
        name: followerPDA.name,
        bio: followerPDA.bio,
        followers: followerPDA.followers.toNumber(),
        following: followerPDA.following.toNumber(),
        postCount: followerPDA.postCount.toNumber(),
      })
    })
  }, [followerRelation.follower, program.account.author])

  const authorQuery = useAuthorByPublicKey(followerPDA?.owner)

  if (authorQuery.isLoading) {
    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  if (!authorQuery.data) {
    return null
  }

  const author = {
    publicKey: followerRelation.follower,
    name: authorQuery.data.name,
    owner: authorQuery.data.owner,
    bio: authorQuery.data.bio,
    followers: authorQuery.data.followers.toNumber(),
    following: authorQuery.data.following.toNumber(),
    postCount: authorQuery.data.postCount.toNumber(),
  }

  return (
    <AuthorCard
      author={{
        ...author,
      }}
      compact
    />
  )
}
