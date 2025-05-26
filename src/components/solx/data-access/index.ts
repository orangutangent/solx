'use client'

import { getSolxProgram, getSolxProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../../cluster/cluster-data-access'
import { useAnchorProvider } from '../../solana/solana-provider'
import { useTransactionToast } from '../../use-transaction-toast'
import { toast } from 'sonner'

import * as anchor from '@coral-xyz/anchor'

interface createAuthor {
  name: string
  bio: string
}

interface CreatePost {
  content: string
  timestamp: number
}

interface DeletePost {
  postId: number
  postPublicKey: PublicKey
}

interface FeedOptions {
  limit?: number
  offset?: number
  maxAuthors?: number
}

export function useSolxProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSolxProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getSolxProgram(provider, programId), [provider, programId])

  const getAuthors = useQuery({
    queryKey: ['authors', 'all', { cluster }],
    queryFn: () => program.account.author.all(),
  })

  const checkAuthorExists = async (publicKey: PublicKey): Promise<boolean> => {
    try {
      const [authorPda] = PublicKey.findProgramAddressSync([publicKey.toBuffer()], program.programId)
      const authorAccount = await program.account.author.fetch(authorPda)
      return !!authorAccount
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false
    }
  }

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createAuthor = useMutation<string, unknown, createAuthor>({
    mutationKey: ['counter', 'initialize', { cluster }],
    mutationFn: ({ name, bio }) =>
      program.methods.createAuthor(name, bio).accounts({ owner: provider.wallet.publicKey }).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return getAuthors.refetch()
    },
    onError: (error) => {
      toast.error('Failed to create author')
      console.error(error)
    },
  })

  const useUserPosts = (userPublicKey?: PublicKey) => {
    return useQuery({
      queryKey: ['user-posts', { cluster, userPublicKey: userPublicKey?.toBase58() }],
      enabled: !!userPublicKey,
      queryFn: async () => {
        if (!userPublicKey) return []

        const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync([userPublicKey.toBuffer()], program.programId)

        return program.account.post.all([
          {
            memcmp: {
              offset: 8,
              bytes: authorPda.toBase58(),
            },
          },
        ])
      },
    })
  }

  const useUserFollowings = (userPublicKey?: PublicKey) => {
    return useQuery({
      queryKey: ['user-followings', { cluster, userPublicKey: userPublicKey?.toBase58() }],
      enabled: !!userPublicKey,
      queryFn: async () => {
        if (!userPublicKey) return []

        const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync([userPublicKey.toBuffer()], program.programId)

        return program.account.followRelation.all([
          {
            memcmp: {
              offset: 8, // follower field offset
              bytes: authorPda.toBase58(),
            },
          },
        ])
      },
    })
  }

  const useUserFollowers = (userPublicKey?: PublicKey) => {
    return useQuery({
      queryKey: ['user-followers', { cluster, userPublicKey: userPublicKey?.toBase58() }],
      enabled: !!userPublicKey,
      queryFn: async () => {
        if (!userPublicKey) return []

        const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync([userPublicKey.toBuffer()], program.programId)

        return program.account.followRelation.all([
          {
            memcmp: {
              offset: 40, // followed field offset (8 + 32)
              bytes: authorPda.toBase58(),
            },
          },
        ])
      },
    })
  }

  const useAuthorByPublicKey = (userPublicKey?: PublicKey) => {
    return useQuery({
      queryKey: ['author', { cluster, userPublicKey: userPublicKey?.toBase58() }],
      enabled: !!userPublicKey,
      queryFn: async () => {
        if (!userPublicKey) return null

        try {
          const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [userPublicKey.toBuffer()],
            program.programId,
          )
          return await program.account.author.fetch(authorPda)
        } catch (error) {
          console.error('Author not found:', error)
          return null
        }
      },
    })
  }

  const checkFollowRelation = async (followerKey: PublicKey, followedKey: PublicKey): Promise<boolean> => {
    try {
      if (followerKey.equals(followedKey)) return false

      const [followRelationPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [followedKey.toBuffer(), followerKey.toBuffer()],
        program.programId,
      )

      const accountInfo = await connection.getAccountInfo(followRelationPda)
      return accountInfo !== null
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false
    }
  }

  const createPost = useMutation<string, unknown, CreatePost>({
    mutationKey: ['create-post', { cluster }],
    mutationFn: ({ content, timestamp }) => {
      const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [provider.wallet.publicKey.toBuffer()],
        program.programId,
      )

      return program.methods
        .createPost(new anchor.BN(timestamp), content)
        .accounts({
          author: authorPda,
          owner: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      // Обновляем посты текущего пользователя
      // getUserPosts будет обновлен автоматически благодаря React Query
    },
    onError: (error) => {
      toast.error('Failed to create post')
      console.error(error)
    },
  })

  const deletePost = useMutation<string, unknown, DeletePost>({
    mutationKey: ['delete-post', { cluster }],
    mutationFn: ({ postId, postPublicKey }) => {
      const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [provider.wallet.publicKey.toBuffer()],
        program.programId,
      )

      return program.methods
        .deletePost(new anchor.BN(postId))
        .accounts({
          author: authorPda,
          post: postPublicKey,
          owner: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
    },
    onError: (error) => {
      toast.error('Failed to delete post')
      console.error(error)
    },
  })

  const useUserFeed = (userPublicKey?: PublicKey, options: FeedOptions = {}) => {
    const { limit = 20, maxAuthors = 50 } = options

    return useQuery({
      queryKey: [
        'user-feed',
        {
          cluster,
          userPublicKey: userPublicKey?.toBase58(),
          limit,
          maxAuthors,
        },
      ],
      enabled: !!userPublicKey,
      queryFn: async () => {
        if (!userPublicKey) return []

        try {
          console.log('Fetching feed for user:', userPublicKey.toBase58())

          // 1. Получаем подписки пользователя
          const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [userPublicKey.toBuffer()],
            program.programId,
          )

          const followings = await program.account.followRelation.all([
            {
              memcmp: {
                offset: 8, // follower field offset
                bytes: authorPda.toBase58(),
              },
            },
          ])

          console.log(`Found ${followings.length} followings`)

          if (followings.length === 0) {
            return []
          }

          // 2. Ограничиваем количество авторов для обработки (берем последних подписанных)
          const limitedFollowings = followings.slice(0, maxAuthors)

          // 3. Получаем посты от каждого автора (с ограничением)
          const allPosts = []

          // Обрабатываем авторов батчами для лучшей производительности
          const batchSize = 10
          for (let i = 0; i < limitedFollowings.length; i += batchSize) {
            const batch = limitedFollowings.slice(i, i + batchSize)

            const batchPromises = batch.map(async (following) => {
              try {
                // Получаем только последние посты от каждого автора
                const posts = await program.account.post.all([
                  {
                    memcmp: {
                      offset: 8, // author field offset
                      bytes: following.account.followed.toBase58(),
                    },
                  },
                ])

                // Сортируем посты автора по времени и берем только последние
                const sortedPosts = posts
                  .sort((a, b) => b.account.timestamp.toNumber() - a.account.timestamp.toNumber())
                  .slice(0, 5) // Берем только 5 последних постов от каждого автора

                return sortedPosts
              } catch (error) {
                console.error('Error fetching posts for author:', following.account.followed.toBase58(), error)
                return []
              }
            })

            const batchResults = await Promise.all(batchPromises)
            allPosts.push(...batchResults.flat())
          }

          // 4. Сортируем все посты по времени и применяем лимит
          const sortedPosts = allPosts
            .sort((a, b) => b.account.timestamp.toNumber() - a.account.timestamp.toNumber())
            .slice(0, limit)

          console.log(`Returning ${sortedPosts.length} posts from ${limitedFollowings.length} authors`)

          return sortedPosts
        } catch (error) {
          console.error('Error fetching user feed:', error)
          return []
        }
      },
      // Кешируем на 5 минут
      staleTime: 5 * 60 * 1000,
      // Рефетчим в фоне каждые 10 минут
      refetchInterval: 10 * 60 * 1000,
    })
  }

  const useLoadMoreFeed = (userPublicKey?: PublicKey) => {
    return useMutation({
      mutationFn: async ({ offset = 0 }: { offset?: number } = {}) => {
        if (!userPublicKey) return []

        try {
          const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [userPublicKey.toBuffer()],
            program.programId,
          )

          const followings = await program.account.followRelation.all([
            {
              memcmp: {
                offset: 8,
                bytes: authorPda.toBase58(),
              },
            },
          ])

          if (followings.length === 0) return []

          // Получаем посты с учетом offset
          const allPosts = []

          for (const following of followings.slice(0, 50)) {
            // Ограничиваем 50 авторами
            try {
              const posts = await program.account.post.all([
                {
                  memcmp: {
                    offset: 8,
                    bytes: following.account.followed.toBase58(),
                  },
                },
              ])

              allPosts.push(...posts)
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              console.error('Error fetching posts for author:', following.account.followed.toBase58())
            }
          }

          // Сортируем и применяем пагинацию
          const sortedPosts = allPosts
            .sort((a, b) => b.account.timestamp.toNumber() - a.account.timestamp.toNumber())
            .slice(offset, offset + 20)

          return sortedPosts
        } catch (error) {
          console.error('Error loading more feed posts:', error)
          return []
        }
      },
    })
  }

  return {
    program,
    programId,
    getAuthors,
    getProgramAccount,
    createAuthor,
    checkAuthorExists,
    getUserPosts: useUserPosts,
    getUserFollowings: useUserFollowings,
    useUserFollowers,
    useAuthorByPublicKey,
    checkFollowRelation,
    createPost,
    deletePost,

    useLoadMoreFeed,
    useUserFeed,
  }
}

interface followAuthor {
  authorKey: PublicKey
}

export function useSolxProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, checkFollowRelation } = useSolxProgram()
  const provider = useAnchorProvider()

  const { getUserPosts, useAuthorByPublicKey, useUserFollowers, getUserFollowings } = useSolxProgram()

  const getAuthor = useAuthorByPublicKey(account)
  const getUserPostsQuery = getUserPosts(account)
  const getUserFollowersQuery = useUserFollowers(account)
  const getUserFollowingsQuery = getUserFollowings(account)

  const isFollowing = (authorKey: PublicKey) => {
    if (!account) return false
    return checkFollowRelation(account, authorKey)
  }

  const followAuthor = useMutation<string, unknown, followAuthor>({
    mutationKey: ['follow-author', { cluster, account }],
    mutationFn: ({ authorKey }: followAuthor) => {
      const [followerPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [provider.wallet.publicKey.toBuffer()],
        program.programId,
      )

      return program.methods
        .follow(authorKey)
        .accounts({
          follower: followerPda,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)

      getUserFollowersQuery.refetch()
      getAuthor.refetch()
    },
    onError: (error) => {
      toast.error('Failed to follow author')
      console.error('Follow error:', error)
    },
  })

  const unfollowAuthor = useMutation<string, unknown, followAuthor>({
    mutationKey: ['unfollow-author', { cluster, account }],
    mutationFn: ({ authorKey }: followAuthor) => {
      const [followerPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [provider.wallet.publicKey.toBuffer()],
        program.programId,
      )

      return program.methods
        .unfollow(authorKey)
        .accounts({
          follower: followerPda,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)

      getUserFollowersQuery.refetch()
      getAuthor.refetch()
    },
    onError: (error) => {
      toast.error('Failed to unfollow author')
      console.error('Unfollow error:', error)
    },
  })

  const createPost = useMutation<string, unknown, CreatePost>({
    mutationKey: ['create-post', { cluster }],
    mutationFn: ({ content, timestamp }) => {
      const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [provider.wallet.publicKey.toBuffer()],
        program.programId,
      )

      return program.methods
        .createPost(new anchor.BN(timestamp), content)
        .accounts({
          author: authorPda,
          owner: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc()
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      // Обновляем посты текущего пользователя
    },
    onError: (error) => {
      toast.error('Failed to create post')
      console.error(error)
    },
  })
  return {
    getAuthor,
    getUserPosts: getUserPostsQuery,
    getUserFollowers: getUserFollowersQuery,
    getUserFollowings: getUserFollowingsQuery,
    isFollowing,
    followAuthor,
    unfollowAuthor,
    createPost,
  }
}

export function useCurrentUser() {
  const provider = useAnchorProvider()
  const publicKey = provider.wallet?.publicKey

  return useSolxProgramAccount({ account: publicKey || new PublicKey('11111111111111111111111111111111') })
}
