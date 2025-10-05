import { h, render } from "preact";
import { useState, useEffect } from "preact/hooks";

async function getImagePostsFromUser(handle) {
  const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(
    handle
  )}&limit=50`;
  const response = await fetch(url);
  const data = await response.json();

  const postsWithImages = [];

  for (const item of data.feed) {
    const post = item.post;

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
        images: post.embed.images.map((img) => ({
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

function ImageFeed({ handle }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filterHashtag, setFilterHashtag] = useState(null);

  useEffect(() => {
    if (handle) {
      setLoading(true);
      getImagePostsFromUser(handle)
        .then(setPosts)
        .finally(() => setLoading(false));
    }
  }, [handle]);

  const parseTextAndHashtags = (text) => {
    const hashtagRegex = /#\w+/g;
    const hashtags = text.match(hashtagRegex) || [];
    const filteredHashtags = hashtags
      .filter(
        (tag) =>
          tag.toLowerCase() !== "#photography" && tag.toLowerCase() !== "#noai"
      )
      .map((tag) => tag.substring(1));
    const textWithoutHashtags = text.replace(hashtagRegex, "").trim();
    return { text: textWithoutHashtags, hashtags: filteredHashtags };
  };

  const allImages = posts.flatMap((post) =>
    post.images.map((image) => ({
      ...image,
      post,
    }))
  );

  const filteredImages = filterHashtag
    ? allImages.filter((item) => {
        if (!item.post.text) return false;
        const { hashtags } = parseTextAndHashtags(item.post.text);
        return hashtags.includes(filterHashtag);
      })
    : allImages;

  const handleKeyDown = (idx, e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedIndex(selectedIndex === idx ? null : idx);
    } else if (e.key === "Escape" && selectedIndex !== null) {
      setSelectedIndex(null);
    }
  };

  const handleFocus = (idx) => {
    if (selectedIndex !== null && selectedIndex !== idx) {
      setSelectedIndex(null);
    }
  };

  if (loading) {
    return h(
      "div",
      null,
      h(
        "style",
        null,
        `
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `
      ),
      h(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 400px), 1fr))",
          },
        },
        // Show 12 skeleton boxes
        Array.from({ length: 12 }).map((_, idx) =>
          h("div", {
            key: idx,
            className: "skeleton",
            style: {
              width: "100%",
              paddingBottom: "100%", // 1:1 aspect ratio
              position: "relative",
            },
          })
        )
      )
    );
  }

  return h(
    "div",
    { style: { containerType: "inline-size", position: "relative" } },
    h(
      "style",
      null,
      `
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
      .filter-banner {
        animation: slideDown 0.3s ease-out;
      }
      .overlay-content {
        animation: slideUp 0.3s ease-out;
      }
    `
    ),
    filterHashtag &&
      h(
        "div",
        {
          className: "filter-banner",
          style: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            zIndex: 100,
          },
        },
        h(
          "button",
          {
            onClick: () => setFilterHashtag(null),
            style: {
              backgroundColor: "#0085ff",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              fontSize: "18px",
              fontWeight: "500",
            },
          },
          `${filterHashtag} ×`
        )
      ),
    h(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(min(100%, 400px), 1fr))",
        },
        role: "grid",
        "aria-label": `Image feed from @${handle}`,
      },
      filteredImages.map((item, idx) => {
        const parsed = item.post.text
          ? parseTextAndHashtags(item.post.text)
          : { text: "", hashtags: [] };

        return h(
          "div",
          {
            key: idx,
            role: "gridcell",
            style: {
              position: "relative",
              cursor: "pointer",
              opacity:
                selectedIndex !== null && selectedIndex !== idx ? 0.6 : 1,
              transition: "opacity 0.3s ease",
            },
            onClick: () => setSelectedIndex(selectedIndex === idx ? null : idx),
            onKeyDown: (e) => handleKeyDown(idx, e),
            onFocus: () => handleFocus(idx),
            tabIndex: 0,
            "aria-pressed": selectedIndex === idx,
            "aria-label":
              item.alt ||
              `Image ${idx + 1} from post: ${
                item.post.text || "No description"
              }`,
          },
          h("img", {
            src: item.fullsize,
            alt: item.alt || "",
            style: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            },
            loading: "lazy",
          }),
          selectedIndex === idx &&
            h(
              "div",
              null,
              h(
                "div",
                {
                  style: {
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    pointerEvents: "none",
                  },
                  "aria-label": `${item.post.likeCount} likes`,
                },
                `❤️ ${item.post.likeCount}`
              ),
              h(
                "div",
                {
                  className: "overlay-content",
                  style: {
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
                    color: "#fff",
                    padding: "48px 16px 16px 16px",
                    pointerEvents: "none",
                  },
                  "aria-live": "polite",
                },
                parsed.text &&
                  h(
                    "p",
                    {
                      style: {
                        margin: "0 0 12px 0",
                        fontSize: "16px",
                        lineHeight: "1.4",
                      },
                    },
                    parsed.text
                  ),
                parsed.hashtags.length > 0 &&
                  h(
                    "div",
                    {
                      style: {
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "12px",
                      },
                    },
                    parsed.hashtags.map((tag, tagIdx) =>
                      h(
                        "button",
                        {
                          key: tagIdx,
                          onClick: (e) => {
                            e.stopPropagation();
                            setFilterHashtag(tag);
                            setSelectedIndex(null);
                          },
                          onKeyDown: (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              e.preventDefault();
                              setFilterHashtag(tag);
                              setSelectedIndex(null);
                            }
                          },
                          style: {
                            backgroundColor: "rgba(255,255,255,0.2)",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "16px",
                            fontWeight: "500",
                            border: "none",
                            color: "#fff",
                            cursor: "pointer",
                            pointerEvents: "auto",
                          },
                        },
                        tag
                      )
                    )
                  )
              )
            )
        );
      })
    )
  );
}

class BlueskyImageFeed extends HTMLElement {
  connectedCallback() {
    const handle = this.getAttribute("user-profile");
    render(h(ImageFeed, { handle }), this);
  }

  disconnectedCallback() {
    render(null, this);
  }

  static get observedAttributes() {
    return ["user-profile"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "user-profile" && oldValue !== newValue) {
      const handle = this.getAttribute("user-profile");
      render(h(ImageFeed, { handle }), this);
    }
  }
}

customElements.define("bluesky-image-feed", BlueskyImageFeed);
