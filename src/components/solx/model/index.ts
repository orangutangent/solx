import { PublicKey } from '@solana/web3.js'

export interface Author {
  publicKey: PublicKey
  owner: PublicKey
  name: string
  bio: string
  followers: number
  following: number
  postCount?: number
}

export interface Post {
  publicKey: PublicKey
  author: PublicKey
  content: string
  timestamp: number
}

export interface followRelation {
  follower: PublicKey
  followed: PublicKey
}
