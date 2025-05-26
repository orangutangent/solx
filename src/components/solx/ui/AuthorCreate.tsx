'use client'

import { useState, useEffect } from 'react'
import { useSolxProgram, useSolxProgramAccount } from '../data-access'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useWallet } from '@solana/wallet-adapter-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2, UserPlus } from 'lucide-react'
import { AuthorCard } from './AuthorCard'
import { PublicKey } from '@solana/web3.js'
import { Author } from '../model'

export function AuthorCreate({ account }: { account: PublicKey }) {
  const { createAuthor } = useSolxProgram()
  const { publicKey } = useWallet()

  const { getAuthor } = useSolxProgramAccount({ account })

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [open, setOpen] = useState(false)
  const [author, setAuthor] = useState<Author | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!publicKey) {
      setAuthor(null)
      return
    }

    if (getAuthor.data && !getAuthor.isLoading) {
      setAuthor({
        publicKey: publicKey,
        owner: getAuthor.data.owner,
        name: getAuthor.data.name,
        bio: getAuthor.data.bio,
        followers: getAuthor.data.followers.toNumber(),
        following: getAuthor.data.following.toNumber(),
        postCount: getAuthor.data.postCount.toNumber() || 0,
      })
    } else if (!getAuthor.isLoading && getAuthor.isError) {
      setAuthor(null)
    }
  }, [publicKey, getAuthor.data, getAuthor.isLoading, getAuthor.isError])

  const handleSubmit = async () => {
    setFormError(null)

    if (!name.trim()) {
      setFormError('Name cannot be empty')
      return
    }

    if (name.length > 50) {
      setFormError('Name must be 50 characters or less')
      return
    }

    if (bio.length > 160) {
      setFormError('Bio must be 160 characters or less')
      return
    }

    try {
      await createAuthor.mutateAsync({ name, bio })
      setOpen(false)
      setName('')
      setBio('')
    } catch (error) {
      console.error('Error creating author:', error)
      setFormError('Failed to create profile. Please try again.')
    }
  }

  if (!publicKey) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">Please connect your wallet to create or view your profile.</p>
      </div>
    )
  }

  if (getAuthor.isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (author) {
    return (
      <div className="flex justify-center">
        <AuthorCard author={author} isCurrentUser={true} />
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Welcome to SolX</h3>
        <p className="text-muted-foreground">
          Create your author profile to start sharing content and connecting with the community.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Create Profile
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Author Profile</DialogTitle>
            <DialogDescription>
              Create your author profile on SolX to publish content and interact with the community.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-left">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground text-right">{name.length}/50</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio" className="text-left">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="col-span-3 resize-none"
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground text-right">{bio.length}/160</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createAuthor.isPending || !publicKey} className="gap-2">
              {createAuthor.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {createAuthor.isPending ? 'Creating...' : 'Create Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
