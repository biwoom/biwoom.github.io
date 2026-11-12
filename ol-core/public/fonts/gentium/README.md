# Gentium italic for romanized Pali

- Upstream: SIL Global, Gentium 7.000 (2025-06-02).
- Project: https://software.sil.org/gentium/
- Source archive: https://software.sil.org/downloads/r/gentium/Gentium-7.000.zip
- License: SIL Open Font License 1.1; see the accompanying unmodified OFL.txt.
- Bundled files are unmodified upstream WOFF2 webfonts: Gentium-Italic (400) and Gentium-BoldItalic (700). Do not relabel them as CC0 content.
- Reader CSS selects these faces only for Latin/combining-mark characters in TEXT/STORY body and footnote emphasis (`em`/`i`). Korean, other scripts, upright text, code and original fences retain their existing fonts. The browser loads a face when it is needed; no font preload is added to other pages.
- The source TTFs in the same official release were checked for real italic selection, weights 400/700, Pali Latin glyphs in the reported chapter, upper/lowercase Pali letters, decomposed combining macron/dot marks, and OpenType `mark`/`mkmk` positioning tables. Browser visual verification is performed by the user unless explicitly requested.

## SHA-256

- Gentium-Italic.woff2: `afe837c18f4ecd739bdfed4cad616c3ea1ee900db8c159ce3d0fa2ee3a828d91`
- Gentium-BoldItalic.woff2: `62ee8d53d5d0d78edb016feb4475a87923463a018bbac42f20be64ec7181a7c8`

Keep OFL.txt and update the pinned version, checksums and verification notes together when replacing assets.
