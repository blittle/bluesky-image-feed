import type { Route } from "./+types/home";
import { useState } from "react";
import { redirect } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Bluesky Image Feed" },
    { name: "description", content: "View image feeds from Bluesky users" },
  ];
}

export default function Home() {
  const [handle, setHandle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      window.location.href = `/users/${handle.trim().replace('@', '')}`;
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Bluesky Image Feed</h1>
      <p>Enter a Bluesky handle to view their image posts:</p>

      <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="username.bsky.social"
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              backgroundColor: '#0085ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View Feed
          </button>
        </div>
      </form>

      <div style={{ marginTop: '2rem', color: '#666', fontSize: '0.875rem' }}>
        <p>Example handles to try:</p>
        <ul>
          <li>
            <a href="/users/jay.bsky.team" style={{ color: '#0085ff' }}>
              jay.bsky.team
            </a>
          </li>
          <li>
            <a href="/users/bsky.app" style={{ color: '#0085ff' }}>
              bsky.app
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
