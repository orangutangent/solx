'use client'

import { useEffect, useState } from 'react'
import { useSolxProgram } from '../data-access'
import { Author, followRelation } from '../model'
import { AuthorCard } from './AuthorCard'
import { PublicKey } from '@solana/web3.js'
import { Loader2, UserCheck } from 'lucide-react'

interface UserFollowingProps {
  userPublicKey: PublicKey
}

export function UserFollowing({ userPublicKey }: UserFollowingProps) {
  const { getUserFollowings } = useSolxProgram()

  const followingQuery = getUserFollowings(userPublicKey)

  if (followingQuery.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading following...</span>
        </div>
      </div>
    )
  }

  if (followingQuery.isError) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <UserCheck className="h-12 w-12 text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Failed to load following</p>
            <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    )
  }

  const following = followingQuery.data || []

  if (following.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <UserCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Not following anyone</h3>
            <p className="text-sm text-muted-foreground">When this user follows people, they&apos;ll appear here.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Following</h3>
        <span className="text-sm text-muted-foreground">
          {following.length} {following.length === 1 ? 'person' : 'people'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {following.map((follow) => (
          <FollowingCard key={follow.publicKey.toString()} followRelation={follow.account} />
        ))}
      </div>
    </div>
  )
}

function FollowingCard({ followRelation }: { followRelation: followRelation }) {
  const { useAuthorByPublicKey, program } = useSolxProgram()

  const [followedPDA, setFollowedPDA] = useState<Author | null>(null)

  useEffect(() => {
    program.account.author.fetch(followRelation.followed).then((followedPDA) => {
      setFollowedPDA({
        publicKey: followRelation.followed,
        owner: followedPDA.owner,
        name: followedPDA.name,
        bio: followedPDA.bio,
        followers: followedPDA.followers.toNumber(),
        following: followedPDA.following.toNumber(),
        postCount: followedPDA.postCount.toNumber(),
      })
    })
  }, [followRelation.followed, program.account.author])

  const authorQuery = useAuthorByPublicKey(followedPDA?.owner)

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
    publicKey: followRelation.followed,
    owner: authorQuery.data.owner,
    name: authorQuery.data.name,
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
