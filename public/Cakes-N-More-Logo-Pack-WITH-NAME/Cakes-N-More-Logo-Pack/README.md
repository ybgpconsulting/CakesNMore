# Cakes N More — Logo Pack WITH FULL NAME

This version explicitly includes the words **Cakes N More** in the horizontal website wordmark, Google/Search logo candidates, Google Business Profile assets, and square mobile/PWA icons.

## Use these files

- **Website header (transparent, includes name):** `01-Website/logo-horizontal-1200w.png` or `logo-horizontal-800w.png`. Keep its aspect ratio.
- **Google Search / Organization structured data (square, includes name):** `02-Google-Search-Indexing/organization-logo-with-name-512.png` or `1024.png`. Copy the chosen asset to `public/logo-schema-512.png` (or another filename) and reference that exact absolute URL in your existing canonical business JSON-LD. Do not create a second LocalBusiness entity.
- **Google Business Profile (square, includes name):** upload `03-Google-Business-Profile/profile-logo-with-name-720.png` or `profile-logo-with-name-720.jpg`. Check Google’s circular crops before publishing.
- **Mobile / Android PWA icons (square, includes name):** `05-Ready-to-Copy-Public-Folder/android-chrome-192x192.png` and `android-chrome-512x512.png`. Maskable versions are also provided. These wordmark icons prioritize showing the business name; test legibility on the target launcher.
- **iPhone/iPad home screen:** `apple-touch-icon.png` contains the named square lockup.
- **Social sharing image:** `01-Website/open-graph-1200x630.png` or `.jpg`, with the full horizontal logo.
- **Tiny browser favicons:** `favicon.ico` and `favicon-16x16.png` etc. use the emblem only because the full business name cannot be legible at 16–32 pixels. This is the only intentionally symbol-only use.

## Ready-to-copy public folder

Copy the contents of `05-Ready-to-Copy-Public-Folder/` into the project `public/` directory. Then verify in `index.html`:

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#173D32">
```

Update the existing organization/business schema’s `logo` URL to the uploaded square full-name image. Do not add a duplicate JSON-LD business record. After copying files, rebuild and deploy the site. Google may take time to refresh its cached icons/logo.

## Note

The full-name square logo uses the original cake/chef emblem and a high-contrast serif wordmark. The original transparent horizontal wordmark is retained for website headers. This is raster PNG artwork, not a vector SVG/CDR/AI source.
