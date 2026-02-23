# Specification

## Summary
**Goal:** Fix the library save mechanism so that songs and covers are properly saved and displayed after processing completes.

**Planned changes:**
- Add comprehensive console logging throughout the library save workflow in App.tsx to track processing completion, data passed to save functions, backend responses, and navigation
- Debug and fix the library save mechanism for both cover mode and generation mode by examining handleProcessingComplete and handleGenerationComplete callbacks
- Verify backend actor functions (createCover and submitLyricsRequest) are receiving correct parameters and properly persisting songs to storage
- Ensure automatic navigation to Library view after processing completes with immediate display of newly created songs
- Add error toast notifications when library save operations fail with user-friendly messages

**User-visible outcome:** After generating a cover or creating a song from lyrics, users will automatically be taken to their Library where the new song appears immediately without requiring a page refresh. If saving fails, users will see a clear error message explaining what went wrong.
