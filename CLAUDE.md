# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Development**: `npm run dev` - Starts Vite dev server with hot reload
- **Build**: `npm run build` - Creates production build in dist/ folder
- **Lint**: `npm run lint` - Runs ESLint on all JavaScript/JSX files  
- **Preview**: `npm run preview` - Serves production build locally

## Project Architecture

This is a React + Vite application that generates captioned wave images for print-on-demand sales. The architecture is:

**Core Application (src/App.jsx)**:
- Single-page React component handling the entire workflow
- Fetches ocean wave images from Pexels API (requires `VITE_PEXELS_API_KEY` in .env)
- Uses HTML5 Canvas to overlay captions on images
- Generates SEO-optimized filenames for downloads

**Key Features**:
- **Image Processing Pipeline**: Fetches multiple pages of wave images → adds random captions → processes with Canvas API → provides downloads
- **SEO Optimization**: Pre-defined array of 20 SEO-optimized titles mixing therapeutic/workplace themes with wave imagery
- **Caption System**: 8 different wave-crash caption variations applied randomly
- **Batch Processing**: Processes up to 20 images at once with individual and bulk download options

**Environment Setup**:
- Requires Pexels API key in `.env`: `VITE_PEXELS_API_KEY=your_key_here`
- Uses Vite environment variables (import.meta.env.VITE_*)

**Dependencies**:
- **lucide-react**: Icons for UI (Download, Loader, etc.)
- **Canvas API**: Core image processing (overlaying text on images)
- **Pexels API**: Image source via REST API

**File Structure**:
- Main component exports `WaveCaptionGenerator` as default
- CSS uses Tailwind classes (built-in with the setup)
- Images processed client-side with Canvas, no backend required

## Important Implementation Details

- Images are processed with Canvas using `crossOrigin: 'anonymous'` for CORS
- Caption styling: Bold Arial font, yellow text (#FFFF00) on black background (rgba(0,0,0,0.85))
- Font size calculated dynamically based on image width (minimum 28px)
- Downloads use programmatic anchor tag clicks with 100ms delays for bulk downloads
- Error handling includes specific messages for 401 (auth), 429 (rate limit), and network errors