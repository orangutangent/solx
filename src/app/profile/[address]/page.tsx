'use client'

import { useParams } from 'next/navigation'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSolxProgram } from '@/components/solx/data-access'
import { AuthorCard } from '@/components/solx/ui/AuthorCard'
import { UserPosts } from '@/components/solx/ui/UserPosts'
import { UserFollowers } from '@/components/solx/ui/UserFollowers'
import { UserFollowing } from '@/components/solx/ui/UserFollowing'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, UserCheck, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function UserProfilePage() {
  const params = useParams()
  const { publicKey } = useWallet()
  const { useAuthorByPublicKey } = useSolxProgram()
  const [userPublicKey, setUserPublicKey] = useState<PublicKey | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (params.address && typeof params.address === 'string') {
        const pubkey = new PublicKey(params.address)
        setUserPublicKey(pubkey)
        setError(null)
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Invalid wallet address')
      setUserPublicKey(undefined)
    }
  }, [params.address])

  const authorQuery = useAuthorByPublicKey(userPublicKey)
  const isOwnProfile = publicKey && userPublicKey && publicKey.equals(userPublicKey)

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-destructive">Invalid Profile</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Your Profile
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!userPublicKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (authorQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  if (authorQuery.isError || !authorQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="rounded-full bg-muted p-6 w-fit mx-auto">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Profile Not Found</h1>
            <p className="text-muted-foreground">This user hasn&apos;t created a profile yet.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Your Profile
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  // Если это собственный профиль, перенаправляем на основную страницу профиля
  if (isOwnProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground">This is your own profile. Use the main profile page to manage it.</p>
          </div>
          <Button asChild>
            <Link href="/profile">Go to Your Profile</Link>
          </Button>
        </div>
      </div>
    )
  }

  const author = {
    publicKey: userPublicKey,
    owner: authorQuery.data.owner,
    name: authorQuery.data.name,
    bio: authorQuery.data.bio,
    followers: authorQuery.data.followers.toNumber(),
    following: authorQuery.data.following.toNumber(),
    postCount: authorQuery.data.postCount.toNumber(),
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/profile">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">User Profile</h1>
        </div>

        {/* Author Profile Section */}
        <div className="flex justify-center">
          <AuthorCard
            author={{
              ...author,
            }}
          />
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Posts</span>
            </TabsTrigger>
            <TabsTrigger value="followers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Followers</span>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Following</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <UserPosts userPublicKey={userPublicKey} showCreatePost={false} />
          </TabsContent>

          <TabsContent value="followers" className="mt-6">
            <UserFollowers userPublicKey={userPublicKey} />
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            <UserFollowing userPublicKey={userPublicKey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
