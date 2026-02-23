# Specification

## Summary
**Goal:** Fix the bug where completed songs are not appearing in the user's library after cover mode or generation mode processing finishes.

**Planned changes:**
- Debug and fix the library saving mechanism in App.tsx to ensure songs are saved to the backend after processing completes
- Verify backend createCover and submitLyricsRequest functions correctly store song records with complete metadata
- Add error handling and logging to capture and display library save failures

**User-visible outcome:** After generating or covering a song, users will see their completed songs appear in the Library view, and songs will persist across page reloads.
