import { BskyAgent } from "@atproto/api";

const agent = new BskyAgent({
  service: "https://public.api.bsky.app",
});

export interface PostWithImage {
  uri: string;
  cid: string;
  author: {
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  text: string;
  images: {
    thumb: string;
    fullsize: string;
    alt?: string;
  }[];
  createdAt: string;
  replyCount: number;
  repostCount: number;
  likeCount: number;
}

export interface Reply {
  uri: string;
  cid: string;
  author: {
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
}

export async function getImagePostsFromUser(
  handle: string
): Promise<PostWithImage[]> {
  const response = await agent.getAuthorFeed({
    actor: handle,
    limit: 50,
  });

  const postsWithImages: PostWithImage[] = [];

  for (const item of response.data.feed) {
    const post = item.post;

    // Check if post has images in embed
    if (
      post.embed?.$type === "app.bsky.embed.images#view" &&
      post.embed.images
    ) {
      postsWithImages.push({
        uri: post.uri,
        cid: post.cid,
        author: {
          handle: post.author.handle,
          displayName: post.author.displayName,
          avatar: post.author.avatar,
        },
        text: post.record?.text || "",
        images: post.embed.images.map((img: any) => ({
          thumb: img.thumb,
          fullsize: img.fullsize,
          alt: img.alt,
        })),
        createdAt: post.indexedAt,
        replyCount: post.replyCount || 0,
        repostCount: post.repostCount || 0,
        likeCount: post.likeCount || 0,
      });
    }
  }

  return postsWithImages;
}

export async function getPostReplies(uri: string): Promise<Reply[]> {
  const response = await agent.getPostThread({
    uri,
    depth: 1,
  });

  const replies: Reply[] = [];

  if (response.data.thread.replies) {
    for (const reply of response.data.thread.replies) {
      if (reply.$type === "app.bsky.feed.defs#threadViewPost") {
        replies.push({
          uri: reply.post.uri,
          cid: reply.post.cid,
          author: {
            handle: reply.post.author.handle,
            displayName: reply.post.author.displayName,
            avatar: reply.post.author.avatar,
          },
          text: reply.post.record?.text || "",
          createdAt: reply.post.indexedAt,
        });
      }
    }
  }

  return replies;
}
