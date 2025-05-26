'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRouter } from 'next/navigation'
import { PostCard } from '@/components/solx/ui/PostCard'
import { useSolxProgram } from '@/components/solx/data-access'
import { Loader2, Users, RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Author, Post } from '@/components/solx/model'

const Feed = () => {
  const { publicKey } = useWallet()
  const router = useRouter()
  const { checkAuthorExists, useUserFeed, useLoadMoreFeed } = useSolxProgram()
  const [hasAuthorProfile, setHasAuthorProfile] = useState<boolean | null>(null)
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [loadingMore, setLoadingMore] = useState(false)

  const feedQuery = useUserFeed(publicKey ?? undefined, {
    limit: 20,
    maxAuthors: 50,
  })

  const loadMoreMutation = useLoadMoreFeed(publicKey ?? undefined)

  useEffect(() => {
    const checkProfile = async () => {
      if (publicKey) {
        const exists = await checkAuthorExists(publicKey)
        setHasAuthorProfile(exists)
      } else {
        setHasAuthorProfile(null)
      }
    }

    checkProfile()
  }, [publicKey, checkAuthorExists])

  useEffect(() => {
    if (feedQuery.data) {
      setFeedPosts(
        feedQuery.data.map((post) => ({
          publicKey: post.publicKey,
          author: post.account.author,
          content: post.account.content,
          timestamp: post.account.timestamp.toNumber(),
        })),
      )
    }
  }, [feedQuery.data])

  const handleLoadMore = async () => {
    if (loadingMore || !publicKey) return

    setLoadingMore(true)
    try {
      const morePosts = await loadMoreMutation.mutateAsync({
        offset: feedPosts.length,
      })

      if (morePosts && morePosts.length > 0) {
        // Фильтруем дубликаты по publicKey
        const existingKeys = new Set(feedPosts.map((post) => post.publicKey.toString()))
        const newPosts = morePosts
          .filter((post) => !existingKeys.has(post.publicKey.toString()))
          .map((post) => ({
            publicKey: post.publicKey,
            author: post.account.author,
            content: post.account.content,
            timestamp: post.account.timestamp.toNumber(),
          }))

        setFeedPosts((prev) => [...prev, ...newPosts])
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleRefresh = () => {
    feedQuery.refetch()
  }

  // Если кошелек не подключен
  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="rounded-full bg-muted p-6 w-fit mx-auto">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Welcome to SolX Feed</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect your wallet to see posts from authors you follow and join the conversation.
            </p>
          </div>
          <Button onClick={() => router.push('/')}>Connect Wallet</Button>
        </div>
      </div>
    )
  }

  if (hasAuthorProfile === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="rounded-full bg-muted p-6 w-fit mx-auto">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Create Your Profile</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              You need to create an author profile to follow other users and see their posts in your feed.
            </p>
          </div>
          <Button asChild>
            <Link href="/profile">Create Profile</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Загрузка
  if (feedQuery.isLoading || hasAuthorProfile === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading your feed...</span>
          </div>
        </div>
      </div>
    )
  }

  // Ошибка загрузки
  if (feedQuery.isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <div className="rounded-full bg-muted p-6 w-fit mx-auto">
            <RefreshCw className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Failed to Load Feed</h1>
            <p className="text-muted-foreground">Something went wrong while loading your feed. Please try again.</p>
          </div>
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Your Feed</h1>
            <p className="text-sm text-muted-foreground">Posts from authors you follow ({feedPosts.length} posts)</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={feedQuery.isFetching}>
            {feedQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        {/* Posts */}
        {feedPosts.length === 0 ? (
          <EmptyFeed />
        ) : (
          <div className="space-y-6">
            {/* Posts List */}
            <div className="space-y-4">
              {feedPosts.map((post) => (
                <FeedPostCard key={post.publicKey.toString()} post={post} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore || loadMoreMutation.isPending}
                className="flex items-center gap-2"
              >
                {loadingMore || loadMoreMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Load more posts
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FeedPostCard({ post }: { post: Post }) {
  const { useAuthorByPublicKey, program } = useSolxProgram()

  const [authorPDA, setAuthorPDA] = useState<Author | undefined>(undefined)

  useEffect(() => {
    program.account.author.fetch(post.author).then((author) => {
      return setAuthorPDA({
        publicKey: post.author,
        owner: author.owner,
        name: author.name,
        bio: author.bio,
        followers: author.followers.toNumber(),
        following: author.following.toNumber(),
        postCount: author.postCount.toNumber(),
      })
    })
  }, [post.author, program.account.author])

  const authorQuery = useAuthorByPublicKey(authorPDA?.owner)

  if (authorQuery.isLoading) {
    return (
      <div className="border rounded-lg p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="space-y-1">
            <div className="w-24 h-4 bg-muted rounded" />
            <div className="w-16 h-3 bg-muted rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-muted rounded" />
          <div className="w-3/4 h-4 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!authorQuery.data) {
    return null
  }

  //   const author = {
  //     publicKey: post.account.author,
  //     name: authorQuery.data.name,
  //     bio: authorQuery.data.bio,
  //     followers: authorQuery.data.followers.toNumber(),
  //     following: authorQuery.data.following.toNumber(),
  //     postCount: authorQuery.data.postCount.toNumber(),
  //   }

  return (
    <PostCard
      post={{
        ...post,
      }}
      authorName={authorPDA?.name}
      showAuthor={true}
    />
  )
}
function EmptyFeed() {
  return (
    <div className="text-center py-12 space-y-6">
      <div className="rounded-full bg-muted p-6 w-fit mx-auto">
        <Users className="h-12 w-12 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Your feed is empty</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start following authors to see their posts in your feed. Discover new voices and join conversations that
          interest you.
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <Button asChild variant="outline">
          <Link href="/explore">Explore Authors</Link>
        </Button>
        <Button asChild>
          <Link href="/profile">Manage Following</Link>
        </Button>
      </div>
    </div>
  )
}

export default Feed
