'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Users, UserPlus, UserMinus, MessageSquare, ExternalLink, Edit2, Save, X } from 'lucide-react'

import { useWallet } from '@solana/wallet-adapter-react'
import { useSolxProgram, useSolxProgramAccount } from '../data-access'
import Link from 'next/link'
import { Author } from '../model'
import { useState, useEffect } from 'react'

interface AuthorCardProps {
  author: Author
  isCurrentUser?: boolean
  compact?: boolean
  showActions?: boolean
}

export function AuthorCard({ author, isCurrentUser = false, compact = false, showActions = true }: AuthorCardProps) {
  const { publicKey } = useWallet()
  const { editName, editBio } = useSolxProgram()
  const { isFollowing, followAuthor, unfollowAuthor } = useSolxProgramAccount({
    account: publicKey!,
  })

  const [isFollowingState, setIsFollowingState] = useState<boolean>(false)
  const [isLoadingFollowState, setIsLoadingFollowState] = useState<boolean>(true)

  // Edit states
  const [isEditingName, setIsEditingName] = useState<boolean>(false)
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false)
  const [editedName, setEditedName] = useState<string>(author.name)
  const [editedBio, setEditedBio] = useState<string>(author.bio || '')

  const canFollow = publicKey && !isCurrentUser && showActions
  const profileUrl = `/profile/${author.owner.toBase58()}`

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (canFollow) {
        try {
          setIsLoadingFollowState(true)
          const followingStatus = await isFollowing(author.owner)
          setIsFollowingState(followingStatus)
        } catch (error) {
          console.error('Error checking following status:', error)
          setIsFollowingState(false)
        } finally {
          setIsLoadingFollowState(false)
        }
      } else {
        setIsLoadingFollowState(false)
      }
    }

    checkFollowingStatus()
  }, [author.owner, canFollow, isFollowing])

  const handleFollowClick = async () => {
    if (!canFollow) return

    try {
      if (isFollowingState) {
        await unfollowAuthor.mutateAsync({ authorKey: author.owner })
        setIsFollowingState(false)
      } else {
        await followAuthor.mutateAsync({ authorKey: author.owner })
        setIsFollowingState(true)
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error)
    }
  }

  const handleSaveName = async () => {
    if (!isCurrentUser || !publicKey) return

    try {
      await editName.mutateAsync({ name: editedName })
      setIsEditingName(false)
    } catch (error) {
      console.error('Error updating name:', error)
      // Reset to original name on error
      setEditedName(author.name)
    }
  }

  const handleSaveBio = async () => {
    if (!isCurrentUser || !publicKey) return

    try {
      await editBio.mutateAsync({ bio: editedBio })
      setIsEditingBio(false)
    } catch (error) {
      console.error('Error updating bio:', error)
      // Reset to original bio on error
      setEditedBio(author.bio || '')
    }
  }

  const handleCancelNameEdit = () => {
    setEditedName(author.name)
    setIsEditingName(false)
  }

  const handleCancelBioEdit = () => {
    setEditedBio(author.bio || '')
    setIsEditingBio(false)
  }

  return (
    <Card className="w-full">
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-lg font-semibold"
                    maxLength={32}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveName}
                    disabled={editName.isPending || editedName.trim().length === 0}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancelNameEdit} disabled={editName.isPending}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold truncate">{author.name}</h3>
                  {isCurrentUser && (
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingName(true)} className="p-1 h-6 w-6">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
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
        {isEditingBio ? (
          <div className="space-y-2">
            <Textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              placeholder="Write your bio..."
              className="text-sm resize-none"
              rows={3}
              maxLength={100}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{editedBio.length}/100 characters</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSaveBio} disabled={editBio.isPending}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelBioEdit} disabled={editBio.isPending}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            {author.bio ? (
              <p className={`text-sm text-muted-foreground flex-1 ${compact ? 'line-clamp-2' : ''}`}>{author.bio}</p>
            ) : isCurrentUser ? (
              <p className="text-sm text-muted-foreground italic flex-1">No bio yet. Click to add one.</p>
            ) : (
              <p className="text-sm text-muted-foreground italic flex-1">No bio available.</p>
            )}
            {isCurrentUser && (
              <Button size="sm" variant="ghost" onClick={() => setIsEditingBio(true)} className="p-1 h-6 w-6 ml-2">
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

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
              variant={isFollowingState ? 'outline' : 'default'}
              size="sm"
              onClick={handleFollowClick}
              disabled={followAuthor.isPending || unfollowAuthor.isPending || isLoadingFollowState}
              className="flex-1"
            >
              {isFollowingState ? (
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
