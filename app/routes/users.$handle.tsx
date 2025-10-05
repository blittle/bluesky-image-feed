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

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>Images from @{handle}</h1>

      {posts.length === 0 ? (
        <p>No posts with images found.</p>
      ) : (
        <div style={{ display: "grid", gap: "2rem" }}>
          {posts.map((post) => (
            <article
              key={post.uri}
              style={{
                border: "1px solid #ccc",
                padding: "1rem",
                borderRadius: "8px",
              }}
            >
              {/* Author info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                {post.author.avatar && (
                  <img
                    src={post.author.avatar}
                    alt={post.author.displayName || post.author.handle}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                    }}
                  />
                )}
                <div>
                  <strong>
                    {post.author.displayName || post.author.handle}
                  </strong>
                  <div style={{ fontSize: "0.875rem", color: "#666" }}>
                    @{post.author.handle}
                  </div>
                </div>
              </div>

              {/* Post text */}
              {post.text && <p style={{ marginBottom: "1rem" }}>{post.text}</p>}

              {/* Images */}
              <div
                style={{
                  display: "grid",
                  gap: "0.5rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
              >
                {post.images.map((image, idx) => (
                  <div key={idx}>
                    <img
                      src={image.thumb}
                      alt={image.alt || ""}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "4px",
                      }}
                    />
                    {image.alt && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#666",
                          marginTop: "0.25rem",
                        }}
                      >
                        {image.alt}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Post stats */}
              <div
                style={{
                  marginTop: "1rem",
                  fontSize: "0.875rem",
                  color: "#666",
                  display: "flex",
                  gap: "1rem",
                }}
              >
                <span>💬 {post.replyCount} replies</span>
                <span>🔁 {post.repostCount} reposts</span>
                <span>❤️ {post.likeCount} likes</span>
              </div>

              {/* Replies/Comments */}
              {post.replies && post.replies.length > 0 && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid #eee",
                  }}
                >
                  <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
                    Comments ({post.replies.length})
                  </h3>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {post.replies.map((reply) => (
                      <div
                        key={reply.uri}
                        style={{
                          paddingLeft: "1rem",
                          borderLeft: "2px solid #eee",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {reply.author.avatar && (
                            <img
                              src={reply.author.avatar}
                              alt={
                                reply.author.displayName || reply.author.handle
                              }
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                          <strong style={{ fontSize: "0.875rem" }}>
                            {reply.author.displayName || reply.author.handle}
                          </strong>
                          <span style={{ fontSize: "0.75rem", color: "#999" }}>
                            @{reply.author.handle}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.875rem", margin: "0" }}>
                          {reply.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
