import { Solx } from './../target/types/solx'
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'

describe('solx', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.Solx as Program<Solx>
  const payer = provider.wallet as anchor.Wallet

  const getTimestamp = async () => {
    const slot = await provider.connection.getSlot()
    return (await provider.connection.getBlockTime(slot)) ?? Math.floor(Date.now() / 1000)
  }

  it('creates author and post', async () => {
    const authorSeeds = [payer.publicKey.toBuffer()]
    const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync(authorSeeds, program.programId)

    // 1. Create Author
    await program.methods
      .createAuthor('Denis', 'Blockchain dev')
      .accounts({
        owner: payer.publicKey,
      })
      .rpc()

    const author = await program.account.author.fetch(authorPda)
    console.log('Author: ', author)

    expect(author.name).toEqual('Denis')
    expect(author.bio).toEqual('Blockchain dev')
    expect(author.owner.toBase58()).toEqual(payer.publicKey.toBase58())
    expect(author.postCount.toNumber()).toEqual(0)

    // 2. Create Post
    const timestamp = await getTimestamp()
    const postSeeds = [Buffer.from('post'), authorPda.toBuffer(), new anchor.BN(timestamp).toArrayLike(Buffer, 'le', 8)]
    const [postPda] = anchor.web3.PublicKey.findProgramAddressSync(postSeeds, program.programId)

    await program.methods
      .createPost(new anchor.BN(timestamp), 'This is my first post')
      .accounts({
        author: authorPda,
        post: postPda,
        owner: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    const post = await program.account.post.fetch(postPda)
    console.log('Post: ', post)

    expect(post.author.toBase58()).toEqual(authorPda.toBase58())
    expect(post.timestamp.toNumber()).toEqual(timestamp)
    expect(post.content).toEqual('This is my first post')
  })

  it('follows author', async () => {
    try {
      const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync([payer.publicKey.toBuffer()], program.programId)

      const follower = new anchor.Wallet(Keypair.generate())
      const followerProvider = new anchor.AnchorProvider(
        provider.connection,
        follower,
        anchor.AnchorProvider.defaultOptions(),
      )

      anchor.setProvider(followerProvider)

      // ⚠️ важно: этот airdrop работает на `follower.publicKey`, не на payer
      await followerProvider.connection.requestAirdrop(follower.publicKey, 1e9)
      // await followerProvider.connection.confirmTransaction(sig)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const [followerPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [follower.publicKey.toBuffer()],
        program.programId,
      )

      await program.methods
        .createAuthor('Follower', 'Another dev')
        .accounts({
          owner: follower.publicKey,
        })
        .signers([follower.payer])
        .rpc()

      const folloerAuthor = await program.account.author.fetch(followerPda)
      console.log('Follower Author:', folloerAuthor)
      console.log('follower', follower.publicKey)
      console.log('payer', payer.publicKey)

      await program.methods
        .follow(follower.publicKey)
        .accounts({
          follower: authorPda,
        })
        .rpc()

      const updatedAuthor = await program.account.author.fetch(authorPda)
      const updatedFollower = await program.account.author.fetch(followerPda)

      console.log('Author (followed):', updatedAuthor)
      console.log('Follower:', updatedFollower)

      expect(updatedAuthor.following.toNumber()).toBe(1)
      expect(updatedFollower.followers.toNumber()).toBe(1)
    } finally {
      anchor.setProvider(provider)
    }
  })
})
