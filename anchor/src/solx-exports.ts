// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SolxIDL from '../target/idl/solx.json'
import type { Solx } from '../target/types/solx'

export { Solx, SolxIDL }

export const SOLX_PROGRAM_ID = new PublicKey(SolxIDL.address)

export function getSolxProgram(provider: AnchorProvider, address?: PublicKey): Program<Solx> {
  return new Program({ ...SolxIDL, address: address ? address.toBase58() : SolxIDL.address } as Solx, provider)
}

export function getSolxProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
      return new PublicKey('9J4UHWXz5UrGZtr9KZBF6W4TD1JxcnLNCdN2rS7ANTCJ')
    case 'testnet':
      return new PublicKey('9J4UHWXz5UrGZtr9KZBF6W4TD1JxcnLNCdN2rS7ANTCJ')
    case 'mainnet-beta':
    default:
      return SOLX_PROGRAM_ID
  }
}
