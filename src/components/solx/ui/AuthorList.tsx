'use client'

import { useSolxProgram } from '../data-access'
import { AuthorCard } from './AuthorCard'
import { useWallet } from '@solana/wallet-adapter-react'
import { Users, Search, Sparkles } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Author } from '../model'

type SortOption = 'followers' | 'following' | 'name' | 'recent'

export function AuthorList() {
  const { getAuthors: accounts, getProgramAccount } = useSolxProgram()
  const { publicKey } = useWallet()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('followers')

  // Filter and sort authors
  const filteredAndSortedAuthors = useMemo(() => {
    if (!accounts.data) return []

    const filtered = accounts.data.filter((account) => {
      const author = account.account
      const matchesSearch =
        author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        author.bio.toLowerCase().includes(searchQuery.toLowerCase())

      // Don't show current user in the list
      const isNotCurrentUser = !publicKey || !account.account.owner.equals(publicKey)

      return matchesSearch && isNotCurrentUser
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.account.name.localeCompare(b.account.name)
        case 'followers':
          return b.account.followers.toNumber() - a.account.followers.toNumber()
        case 'following':
          return b.account.following.toNumber() - a.account.following.toNumber()
        case 'recent':
          return b.account.followers.toNumber() - a.account.followers.toNumber() // fallback to followers
        default:
          return 0
      }
    })

    return filtered
  }, [accounts.data, searchQuery, sortBy, publicKey])

  const sortOptions = [
    { value: 'followers', label: 'Most Followers' },
    { value: 'following', label: 'Most Following' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'recent', label: 'Recent' },
  ]

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground">Loading SolX community...</p>
      </div>
    )
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-full flex items-center justify-center">
            <Users className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Program Not Found</h3>
            <p className="text-muted-foreground">
              Program account not found. Make sure you have deployed the program and are on the correct cluster.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-500 to-green-400 text-transparent bg-clip-text">
            Community Authors
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover amazing creators in the SolX community. Follow your favorites and join the conversation.
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {filteredAndSortedAuthors.length} {filteredAndSortedAuthors.length === 1 ? 'Author' : 'Authors'}
            </Badge>
            {accounts.data && accounts.data.length > filteredAndSortedAuthors.length && (
              <Badge variant="outline" className="text-sm">
                {accounts.data.length - filteredAndSortedAuthors.length} more in total
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search authors by name or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-80 bg-background"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy(option.value as SortOption)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Authors Grid */}
      {accounts.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-64 w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedAuthors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6">
            {filteredAndSortedAuthors.map((account, index) => {
              const author: Author = {
                publicKey: account.publicKey,
                owner: account.account.owner,
                name: account.account.name,
                bio: account.account.bio,
                followers: account.account.followers.toNumber(),
                following: account.account.following.toNumber(),
                postCount: account.account.postCount.toNumber() || 0,
              }

              return (
                <div
                  key={account.publicKey.toString()}
                  className="animate-in fade-in-0 slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AuthorCard author={author} compact={true} />
                </div>
              )
            })}
          </div>

          {/* Load More Button (if needed) */}
          {filteredAndSortedAuthors.length >= 12 && (
            <div className="text-center pt-8">
              <Button variant="outline" size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Discover More Authors
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900/20 dark:to-purple-800/20 rounded-full flex items-center justify-center">
              {searchQuery ? (
                <Search className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              ) : (
                <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{searchQuery ? 'No authors found' : 'No authors yet'}</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No authors match "${searchQuery}". Try adjusting your search terms.`
                  : 'Be the first to create an author profile and start building the SolX community!'}
              </p>
            </div>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')} className="gap-2">
                <Search className="h-4 w-4" />
                Clear search
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
