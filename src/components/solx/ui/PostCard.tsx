'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSolxProgram } from '../data-access'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export interface Post {
  publicKey: PublicKey
  author: PublicKey
  content: string
  timestamp: number
}

interface PostCardProps {
  post: Post
  showAuthor?: boolean
  authorName?: string
}

export function PostCard({ post, showAuthor = true, authorName }: PostCardProps) {
  const { publicKey } = useWallet()
  const { deletePost, useAuthorByPublicKey } = useSolxProgram()

  const author = useAuthorByPublicKey(publicKey || undefined)

  const isOwnPost = author?.data?.publicKey.equals(post.author)
  const postDate = new Date(post.timestamp).toLocaleDateString()
  const postTime = new Date(post.timestamp).toLocaleTimeString()

  const handleDelete = async () => {
    if (!isOwnPost) return

    try {
      await deletePost.mutateAsync({
        postId: post.timestamp,
        postPublicKey: post.publicKey,
      })
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {showAuthor && (
              <div className="flex items-center gap-2 mb-2">
                <p className="font-medium">
                  {authorName || `${post.author.toBase58().slice(0, 8)}...${post.author.toBase58().slice(-8)}`}
                </p>
                {isOwnPost && <Badge variant="secondary">You</Badge>}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {postDate} at {postTime}
            </p>
          </div>

          {isOwnPost && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                  disabled={deletePost.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
    </Card>
  )
}
