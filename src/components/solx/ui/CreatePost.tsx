'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSolxProgram } from '../data-access'
import { useWallet } from '@solana/wallet-adapter-react'
import { Loader2, Send } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
export function CreatePost() {
  const { publicKey } = useWallet()
  const { createPost } = useSolxProgram()
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)

    if (!content.trim()) {
      setError('Post content cannot be empty')
      return
    }

    if (content.length > 256) {
      setError('Post content must be 256 characters or less')
      return
    }

    try {
      const timestamp = Date.now()
      await createPost.mutateAsync({ content: content.trim(), timestamp })
      setContent('')
    } catch (error) {
      console.error('Error creating post:', error)
      setError('Failed to create post. Please try again.')
    }
  }

  if (!publicKey) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create a new post</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={256}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">{content.length}/256 characters</p>
            <Button onClick={handleSubmit} disabled={createPost.isPending || !content.trim()} className="gap-2">
              {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {createPost.isPending ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
