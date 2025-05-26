'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { AuthorCreate } from '@/components/solx/ui/AuthorCreate'
import { UserPosts } from '@/components/solx/ui/UserPosts'
import { UserFollowers } from '@/components/solx/ui/UserFollowers'
import { UserFollowing } from '@/components/solx/ui/UserFollowing'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, UserCheck, FileText } from 'lucide-react'

export default function ProfilePage() {
  const { publicKey } = useWallet()

  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <div className="rounded-full bg-muted p-6 w-fit mx-auto">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Please connect your wallet to view your profile.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Author Profile Section */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <AuthorCreate account={publicKey} />
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
            <UserPosts userPublicKey={publicKey} />
          </TabsContent>

          <TabsContent value="followers" className="mt-6">
            <UserFollowers userPublicKey={publicKey} />
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            <UserFollowing userPublicKey={publicKey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
