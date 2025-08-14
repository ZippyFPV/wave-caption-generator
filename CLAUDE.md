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
- Okay so now I want you to summarize EVERYTHING WE HAVE DONE ON THIS PROJECT and tell me how this has evolved over its development. I need you honest opinion on whether or not this can realistically make money. I told you I want to determine the most realistic growth and profit I could be getting monthly. This only makes sense to develop if it makes money. So we are working on creating the images but also how to list the images as different products for zero cost to little cost only if needed. I think we are done when I have tested the flow for an item and I approve of the listings. What I need from you is to be my eyes on the ground and tell me if everything is as optimized and profitable while not just being cringe product. I want it to be a fun brand but just be completely automated. You should always help me get that goal. I want to make a bunch of money once I hit the final launch of all the images being created. That automation needs to run flawlessly and in the background as long as I want and be generating and listing all of the products that are created. But before I get that going I want to test a few at a time. That is what we are testing. Build it to test the core mechanics of the tool but able to be quickly adapted at revising it to the final max volume setting.