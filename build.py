#!/usr/bin/env python3
"""Build index.html from src/app.html (the page body) plus a proper document head for the installable app."""
import pathlib, re
root = pathlib.Path(__file__).parent
src = (root / "src" / "app.html").read_text()
# the page's own <title>, font links and claude-specific meta go into <head>
head_part, body_part = src.split("<style>", 1)
head_part = re.sub(r'<meta name="claude:[^>]*>\n?', "", head_part)
html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1f5bd8">
<meta name="description" content="Workouts that adapt to where you are and what you have, a daily training log, and healthy meals for your location.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
{head_part.strip()}
<style>
:root {{ color-scheme: light; padding: env(safe-area-inset-top, 0px) 0 env(safe-area-inset-bottom, 0px) }}
body {{ margin: 0; font: 14px system-ui, sans-serif }}
img {{ max-width: 100% }}
[hidden] {{ display: none !important }}
</style>
</head>
<body>
<style>{body_part}
<script src="standalone.js"></script>
</body>
</html>
"""
(root / "index.html").write_text(html)
print("wrote index.html", len(html), "bytes")
