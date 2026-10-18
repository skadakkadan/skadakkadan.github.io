# Subaiba Shafi Kadakkadan – research website

A Jekyll site that GitHub Pages builds for free. You never run code: you add or edit text files on github.com and the site rebuilds itself in about a minute.

## One-time setup (about 15 minutes, easiest on a computer)

1. **Create a GitHub account** at github.com/signup. Choose your username carefully: your site address will be `USERNAME.github.io`. Something like `subaibask` or `skadakkadan` works well.
2. **Create a repository.** Click **+ → New repository**. Name it exactly `USERNAME.github.io` (with your real username). Set it to **Public**. Tick nothing else. Click **Create repository**.
3. **Upload the site.** On the new repository page click **uploading an existing file**. Unzip `subaiba-website.zip` on your computer, open the folder, select **everything inside it** (including the folders whose names start with `_`) and drag it into the browser. Click **Commit changes**.
4. **Turn on Pages.** Go to **Settings → Pages**. Under *Build and deployment*, set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
5. **Set your address.** Open `_config.yml`, click the pencil icon, change `https://USERNAME.github.io` to your real address, and commit.
6. **Check it.** Open the **Actions** tab. When the latest run shows a green tick, visit `https://USERNAME.github.io`. If it shows a red cross, open it and send the error message to Claude.

## Everyday editing (works from your phone's browser)

| To do this | Do this on github.com |
|---|---|
| Write a blog post | Open `templates/blog-post.md`, copy its text. Go to the `_posts` folder → **Add file → Create new file**. Name it `2026-10-15-my-title.md` (date first). Paste, edit, **Commit**. |
| Add a reading note | Copy `templates/paper-note.md`. In `_notes` → **Add file → Create new file**, name it e.g. `smith-2025-chitin.md`. Paste, fill in, **Commit**. |
| Add a photo | In `assets/gallery` → **Add file → Upload files**. Then edit `_data/gallery.yml` and add an entry (an example is in the file). |
| Update the CV | Edit `_data/cv.yml` and `_data/publications.yml`. |
| Update skills | Edit `_data/skills.yml`. |
| Add a CV PDF | Upload it to `assets/` named `cv.pdf`, then set `cv_pdf: true` in `_config.yml`. |
| Add ORCID, Scholar, GitHub, LinkedIn | Fill them in under `author:` in `_config.yml`. |
| Change the home page text | Edit `index.html` (the Research section) and `_data/projects.yml` (Current work). |

## Rules that prevent most errors

- In `.yml` and `.md` headers, indentation matters. Use spaces, never tabs, and copy the pattern of the lines above.
- Put text containing a colon inside quotes: `caption: "Day 3: clear zone"`.
- Blog post file names must start with a date: `YYYY-MM-DD-title.md`.
- Images: resize to about 1600 px wide and keep each under 500 KB.

## Optional: your own domain

Buy a domain (for example `subaibakadakkadan.com`, about £10 a year), then in **Settings → Pages → Custom domain** enter it and follow GitHub's DNS instructions.

## What's where

```
_config.yml          site name, address, profile links
_data/               CV, publications, skills, gallery, projects, menu
_posts/              blog posts
_notes/              reading notes on papers
templates/           copy-and-fill templates (not published)
assets/gallery/      photos
assets/css/main.css  design
_layouts/ _includes/ page structure (no need to touch)
```

## Voice-over for the MSc animation

1. Read `templates/narration-script.md` and record one clip per scene (a phone voice memo is fine).
2. Name them `scene-1.mp3` … `scene-8.mp3` (or `.m4a`) and upload them to `assets/audio/`.
3. In `_config.yml` set `film_audio: true` (and `film_audio_ext: m4a` for .m4a files).

Each scene stretches to the length of its clip. Viewers can switch the voice off with the Voice button.

## CV download

The CV page's download button serves `assets/cv.pdf`. To update it, upload a new file with the same name.
This public copy leaves out your phone number on purpose.
