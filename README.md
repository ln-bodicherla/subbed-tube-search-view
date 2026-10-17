# SubStream

A minimal YouTube front end for searching videos, keeping a local list of channels, and watching videos in an embedded player, backed by Supabase Edge Functions that call the YouTube Data API. (The repository is named `subbed-tube-search-view`; the app calls itself SubStream.)

## Features

- **Search**: search YouTube videos and open results in a modal player that uses the YouTube embed.
- **Subscriptions**: search for channels (with subscriber and video counts) and add or remove them from a channel list stored in the browser's `localStorage`. No account is needed.
- **Feed**: latest regular videos from channels, sorted by publish date.
- **Shorts**: recent Shorts from channels, sorted by publish date.
- A bottom navigation bar for switching tabs, and an animated header that shrinks when you leave the search tab.

The Feed and Shorts tabs currently use a hard-coded sample channel instead of the channels saved in the Subscriptions tab.

## Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS, shadcn/ui (Radix UI), lucide-react icons
- Supabase Edge Functions (Deno) calling the YouTube Data API v3

The project was scaffolded with Lovable.

## Getting started

### Prerequisites

- Node.js and npm (a `bun.lockb` is also present if you prefer Bun)
- A Supabase project and the Supabase CLI to deploy the functions
- A YouTube Data API v3 key

### Missing frontend files

The components import `searchYouTubeVideos`, `searchYouTubeChannels` and `getChannelVideos` from `src/utils/youtubeApi.ts`, but that file is not in the repository, so the frontend will not build until it is added. It is expected to call the Edge Functions below. There is also no `src/integrations/supabase/client.ts`, which you would need to create if `youtubeApi.ts` uses the Supabase client.

`src/utils/invidiousApi.ts` is an earlier approach that used public Invidious and other third-party endpoints. Nothing imports it now.

### Edge Functions

Deploy the functions in `supabase/functions` and set one secret:

- `YOUTUBE_API_KEY`

Functions:

- `youtube-search`: video or channel search (`searchQuery`, `type`, `maxResults`)
- `youtube-channel`: latest videos for a channel, with an option for Shorts only (`channelId`, `maxResults`, `videoType`)
- `youtube-channel-details`: details for a channel

`supabase/config.toml` turns off JWT verification for `youtube-search` and `youtube-channel`.

### Run the frontend

```sh
npm install
npm run dev        # Vite dev server
npm run build      # production build
npm run build:dev  # development-mode build
npm run preview    # preview the production build
npm run lint
```

## Project structure

```
src/
├── pages/           Index (tabbed app shell) and NotFound
├── components/      SearchTab, FeedTab, ShortsTab, SubscriptionsTab, ChannelSearch,
│                    VideoCard, VideoPlayer, and shadcn/ui primitives in ui/
├── utils/           invidiousApi.ts (unused earlier client)
├── hooks/           Toast and mobile-detection hooks
└── integrations/    Generated Supabase types
supabase/
└── functions/       youtube-search, youtube-channel, youtube-channel-details
```

## Status

Personal project, in progress. See the notes above about the missing `youtubeApi.ts` module and the sample channel used by the Feed and Shorts tabs.
