# Solx - Decentralized Social Platform on Solana

Solx is a decentralized social media platform built on the Solana blockchain that allows users to create profiles, share posts, and follow other users with real-time feed updates.

## Features

- **User Profiles**: Create and customize your author profile with name and bio
- **Posts**: Share your thoughts with the community (up to 256 characters)
- **Social Interactions**: Follow/unfollow other users to curate your feed
- **Personalized Feed**: View posts from authors you follow with optimized pagination
- **Real-time Updates**: Automatic feed refresh and live post updates
- **Decentralized**: All data is stored on the Solana blockchain
- **Fast & Low Cost**: Leverages Solana's high throughput and low transaction fees
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Blockchain**: Solana, Anchor Framework
- **Authentication**: Solana Wallet Adapters (Phantom, Solflare, etc.)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI, Lucide Icons
- **Styling**: Tailwind CSS with dark/light theme support

## Smart Contract Structure

The platform is built using Anchor framework with the following main components:

### Accounts

- **Author**: User profiles with customizable name, bio, and social metrics

  - `name`: String (max 32 chars)
  - `bio`: String (max 100 chars)
  - `owner`: PublicKey of the wallet owner
  - `post_count`: Number of posts created
  - `followers`: Number of followers
  - `following`: Number of users being followed

- **Post**: Content created by authors

  - `author`: PublicKey of the author
  - `content`: String (max 256 chars)
  - `timestamp`: Unix timestamp

- **FollowRelation**: Relationship between followers and followed authors
  - `follower`: PublicKey of the follower
  - `followed`: PublicKey of the followed author

### Instructions

- `create_author`: Create a new author profile
- `edit_name`: Update author name
- `edit_bio`: Update author bio
- `create_post`: Create a new post
- `delete_post`: Delete an existing post
- `follow`: Follow another author
- `unfollow`: Unfollow an author

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Rust and Solana CLI tools
- Anchor Framework (v0.28+)
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository

```bash
git clone https://github.com/0xDeKart/solx.git
cd solx
```

2. Install dependencies

```bash
npm install
```

3. Build the Anchor program

```bash
cd anchor
anchor build
```

4. Deploy to devnet (optional)

```bash
anchor deploy --provider.cluster devnet
```

5. Start the development server

```bash
npm run dev
```

## Usage

### Getting Started

1. **Connect Wallet**: Click "Connect Wallet" and choose your preferred Solana wallet
2. **Create Profile**: Navigate to Profile page and create your author profile
3. **Explore**: Visit the Explore page to discover other users
4. **Follow Users**: Follow interesting authors to see their posts in your feed
5. **Create Posts**: Share your thoughts and engage with the community

### Navigation

- **Feed**: View posts from authors you follow
- **Explore**: Discover new authors and their content
- **Profile**: Manage your profile, posts, and following list

### Features in Detail

#### Feed System

- **Optimized Loading**: Loads posts from up to 50 followed authors
- **Pagination**: "Load more" functionality for seamless browsing
- **Real-time Updates**: Automatic refresh every 10 minutes
- **Performance**: Batched requests and intelligent caching

#### Profile Management

- **Edit Profile**: Update name and bio anytime
- **Post Management**: Create and delete your posts
- **Social Stats**: Track followers, following, and post count

#### Social Features

- **Follow/Unfollow**: Build your network of interesting authors
- **Author Discovery**: Explore page shows all platform users
- **Post Interactions**: View author profiles from any post

## Development

### Local Development

```bash
# Start development server
npm run dev

# Run in specific network
npm run dev -- --network devnet
```

### Building for Production

```bash
npm run build
npm start
```

### Testing

```bash
# Run Anchor tests
cd anchor
anchor test

# Run frontend tests
npm test
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=your_program_id_here
```

## Project Structure

```
solx/
├── anchor/                 # Solana program
│   ├── programs/counter/   # Smart contract code
│   └── tests/             # Anchor tests
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── feed/          # Feed page
│   │   ├── explore/       # Explore page
│   │   └── profile/       # Profile page
│   ├── components/
│   │   ├── solx/          # Solx-specific components
│   │   │   ├── ui/        # UI components
│   │   │   └── data-access/ # Hooks and data fetching
│   │   ├── ui/            # Reusable UI components
│   │   └── solana/        # Solana wallet integration
│   └── lib/               # Utilities and helpers
└── public/                # Static assets
```

## Performance Optimizations

- **Batched Requests**: Process multiple authors simultaneously
- **Intelligent Caching**: 5-minute cache with background refresh
- **Pagination**: Load posts incrementally to reduce initial load time
- **Author Limiting**: Process maximum 50 authors for feed generation
- **Post Limiting**: Maximum 5 recent posts per author in feed

## Roadmap

- [ ] Direct messaging between users
- [ ] Post reactions (likes, comments)
- [ ] Media attachments (images, videos)
- [ ] User verification system
- [ ] Advanced search and filtering
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Content moderation tools

## Author

**0xDeKart**

- Twitter: [@0xDeKart](https://twitter.com/0xDeKart)

## License

[MIT](LICENSE)

## Support

If you have any questions or need help:

- Create an issue on GitHub
- Reach out on Twitter [@0xDeKart](https://twitter.com/0xDeKart)

---

Built with ❤️ on Solana by [@0xDeKart](https://twitter.com/0xDeKart)
