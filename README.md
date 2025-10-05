# Bluesky Image Feed

A web component for displaying image feeds from Bluesky profiles. See an example at https://photos.bretlittle.com/pages/feed.

## Features

- 📸 Displays all images from a Bluesky user's feed
- 🏷️ Interactive hashtag filtering
- ❤️ Shows like counts
- ♿ Fully accessible with keyboard navigation
- 📱 Responsive design using container queries
- ✨ Smooth animations and transitions
- 🎨 Full-width and customizable

## Installation

### Via NPM

```bash
npm install bluesky-image-feed
```

Then import in your JavaScript:

```javascript
import "bluesky-image-feed";
```

### Via CDN (unpkg)

Add this script tag to your HTML:

```html
<script
  type="module"
  src="https://unpkg.com/bluesky-image-feed@latest/dist/bluesky-image-feed.js"
></script>
```

## Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Bluesky Images</title>
  </head>
  <body>
    <!-- Add a container with max-width for best results -->
    <div style="max-width: 1200px; margin: 0 auto;">
      <bluesky-image-feed
        user-profile="username.bsky.social"
      ></bluesky-image-feed>
    </div>

    <script
      type="module"
      src="https://unpkg.com/bluesky-image-feed@latest/dist/bluesky-image-feed.js"
    ></script>
  </body>
</html>
```

## Attributes

- `user-profile` (required): The Bluesky handle to display images from (e.g., "username.bsky.social")

## Customization

The component is full-width and uses container queries to adapt to its container size. Wrap it in a container to control the width:

```html
<!-- Fixed width -->
<div style="max-width: 1200px; margin: 0 auto;">
  <bluesky-image-feed user-profile="username.bsky.social"></bluesky-image-feed>
</div>

<!-- Full width -->
<bluesky-image-feed user-profile="username.bsky.social"></bluesky-image-feed>

<!-- Sidebar (narrow) -->
<div style="width: 400px;">
  <bluesky-image-feed user-profile="username.bsky.social"></bluesky-image-feed>
</div>
```

## Interaction

- **Click an image** to view details, description, hashtags, and like count
- **Click a hashtag badge** to filter the grid by that hashtag
- **Keyboard navigation**: Tab to focus images, Enter/Space to select, Escape to deselect
