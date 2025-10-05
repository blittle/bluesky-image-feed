import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { useState } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filterHashtag, setFilterHashtag] = useState<string | null>(null);

  const parseTextAndHashtags = (text: string) => {
    const hashtagRegex = /#\w+/g;
    const hashtags = text.match(hashtagRegex) || [];
    const filteredHashtags = hashtags
      .filter(
        (tag) =>
          tag.toLowerCase() !== "#photography" && tag.toLowerCase() !== "#noai"
      )
      .map((tag) => tag.substring(1)); // Remove the # symbol
    const textWithoutHashtags = text.replace(hashtagRegex, "").trim();
    return { text: textWithoutHashtags, hashtags: filteredHashtags };
  };

  const allImages = posts.flatMap((post, postIdx) =>
    post.images.map((image, imgIdx) => ({
      ...image,
      post,
      imageIndex: imgIdx,
    }))
  );

  const filteredImages = filterHashtag
    ? allImages.filter((item) => {
        if (!item.post.text) return false;
        const { hashtags } = parseTextAndHashtags(item.post.text);
        return hashtags.includes(filterHashtag);
      })
    : allImages;

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedIndex(selectedIndex === idx ? null : idx);
    } else if (e.key === "Escape" && selectedIndex !== null) {
      setSelectedIndex(null);
    }
  };

  const handleFocus = (idx: number) => {
    if (selectedIndex !== null && selectedIndex !== idx) {
      setSelectedIndex(null);
    }
  };

  return (
    <div>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .grid-item-animate {
          animation: fadeInScale 0.6s ease-out;
        }
        .filter-banner {
          animation: slideDown 0.3s ease-out;
        }
        .overlay-content {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
      {filterHashtag && (
        <div
          className="filter-banner"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>Filtering by:</span>
          <button
            onClick={() => setFilterHashtag(null)}
            style={{
              backgroundColor: "#0085ff",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            {filterHashtag} ×
          </button>
        </div>
      )}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 400px), 1fr))",
        }}
        role="grid"
        aria-label={`Image feed from @${handle}`}
      >
        {filteredImages.map((item, idx) => (
          <div
            key={idx}
            role="gridcell"
            className="grid-item-animate"
            style={{
              position: "relative",
              cursor: "pointer",
              opacity:
                selectedIndex !== null && selectedIndex !== idx ? 0.3 : 1,
              transition: "opacity 0.3s ease",
              animationDelay: `${idx * 0.05}s`,
            }}
            onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onFocus={() => handleFocus(idx)}
            tabIndex={0}
            aria-pressed={selectedIndex === idx}
            aria-label={
              item.alt
                ? item.alt
                : `Image ${idx + 1} from post: ${item.post.text || "No description"}`
            }
          >
            <img
              src={item.fullsize}
              alt={item.alt || ""}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              loading="lazy"
            />
            {selectedIndex === idx &&
              (() => {
                const parsed = item.post.text
                  ? parseTextAndHashtags(item.post.text)
                  : { text: "", hashtags: [] };
                return (
                  <div
                    className="overlay-content"
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
                      color: "#fff",
                      padding: "3rem 1rem 1rem 1rem",
                      pointerEvents: "none",
                    }}
                    aria-live="polite"
                  >
                    {parsed.text && (
                      <p
                        style={{
                          margin: "0 0 0.75rem 0",
                          fontSize: "1rem",
                          lineHeight: "1.4",
                        }}
                      >
                        {parsed.text}
                      </p>
                    )}
                    {parsed.hashtags.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                          marginBottom: "0.75rem",
                        }}
                      >
                        {parsed.hashtags.map((tag, tagIdx) => (
                          <button
                            key={tagIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFilterHashtag(tag);
                              setSelectedIndex(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                e.preventDefault();
                                setFilterHashtag(tag);
                                setSelectedIndex(null);
                              }
                            }}
                            style={{
                              backgroundColor: "rgba(255,255,255,0.2)",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "500",
                              border: "none",
                              color: "#fff",
                              cursor: "pointer",
                              pointerEvents: "auto",
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <span aria-label={`${item.post.replyCount} replies`}>
                        💬 {item.post.replyCount}
                      </span>
                      <span aria-label={`${item.post.repostCount} reposts`}>
                        🔁 {item.post.repostCount}
                      </span>
                      <span aria-label={`${item.post.likeCount} likes`}>
                        ❤️ {item.post.likeCount}
                      </span>
                    </div>
                  </div>
                );
              })()}
          </div>
        ))}
      </div>
    </div>
  );
}
