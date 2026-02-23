# Specification

## Summary
**Goal:** Add a music style prompt input with suggested keywords to the lyrics generation workflow, allowing users to describe how they want their song to sound.

**Planned changes:**
- Add a text input field in the GenerationMode component for users to describe their desired music style (e.g., "808 beats with Auto-Tune and deep bass")
- Display clickable keyword suggestions (808, Auto-Tune, deep bass, male voice, female voice, reverb, distortion, trap, R&B, pop, rock) that insert into the style prompt when clicked
- Update the backend LyricsRequest data model to include an optional stylePrompt field
- Update the GenerationMode component to submit the style prompt value with lyrics
- Update the backend submitLyricsRequest function to accept and store the stylePrompt parameter

**User-visible outcome:** Users can now specify how they want their song to sound by typing a custom music style description or clicking suggested keywords that automatically insert into the prompt field.
