'use client'

import { useSolxProgram } from '../data-access'
import { PostCard } from './PostCard'
import { CreatePost } from './CreatePost'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { Loader2, FileText } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface UserPostsProps {
  userPublicKey: PublicKey
  showCreatePost?: boolean
}

export function UserPosts({ userPublicKey, showCreatePost = true }: UserPostsProps) {
  const { publicKey } = useWallet()
  const { getUserPosts } = useSolxProgram()

  // Используем универсальную функцию для получения постов
  const userPostsQuery = getUserPosts(userPublicKey)

  const isOwnProfile = publicKey && publicKey.equals(userPublicKey)

  if (userPostsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading posts...</span>
        </div>
      </div>
    )
  }

  if (userPostsQuery.isError) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Failed to load posts</p>
            <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    )
  }

  const posts = userPostsQuery.data || []

  return (
    <div className="space-y-6">
      {/* Create Post Section - только для собственного профиля */}
      {showCreatePost && isOwnProfile && (
        <div className="space-y-4">
          <CreatePost />
          {posts.length > 0 && <Separator className="my-6" />}
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{isOwnProfile ? 'No posts yet' : 'No posts to show'}</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {isOwnProfile
                  ? 'Share your thoughts with the community by creating your first post.'
                  : "This user hasn't shared any posts yet."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{isOwnProfile ? 'Your Posts' : 'Posts'}</h3>
            <span className="text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          <div className="space-y-4">
            {posts.map((post, index) => (
              <div key={post.publicKey.toString()}>
                <PostCard
                  post={{
                    ...post.account,
                    publicKey: post.publicKey,
                    timestamp: post.account.timestamp.toNumber(),
                  }}
                  showAuthor={false} // На странице профиля не показываем автора
                />
                {/* Добавляем разделитель между постами, кроме последнего */}
                {index < posts.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
