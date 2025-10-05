import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { getImagePostsFromUser, getPostReplies } from "~/lib/bluesky.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const handle = params.handle;

  if (!handle) {
    throw new Response("Not Found", { status: 404 });
  }

  const posts = await getImagePostsFromUser(handle);

  // Fetch replies for each post
  const postsWithReplies = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      replies: await getPostReplies(post.uri),
    }))
  );

  return { handle, posts: postsWithReplies };
}

export default function UserImageFeed() {
  const { handle, posts } = useLoaderData<typeof loader>();

  const allImages = posts.flatMap((post) => post.images);

  return (
    <div>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 400px), 1fr))",
        }}
      >
        {allImages.map((image, idx) => (
          <img
            key={idx}
            src={image.fullsize}
            alt={image.alt || ""}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ))}
      </div>
    </div>
  );
}
