# Crop Label Toolkit

Multi-marketplace label tools for Flipkart, Meesho, and Amazon:

- Auto-crop single-page PDFs to marketplace dimensions
- PDF merge utility
- Light/Dark themes with accent colors
- Crop guide page for quick steps

## Requirements

- Node.js 18+
- npm (or pnpm/yarn)

## Setup

```bash
npm install
```

## Run dev server

```bash
npm run dev
# then open the shown http://localhost:5173
```

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Type check

```bash
npm run typecheck
```

## Routes

- `/` Home
- `/flipkart` Flipkart crop
- `/meesho` Meesho crop
- `/amazon` Amazon crop
- `/merge` PDF merge
- `/guide` Crop guide

## Notes

- Only PDF uploads are supported for cropping; images are rejected.
- We read page 1 of the PDF for detection; export is PDF.
- Label sizes: Flipkart 100×148 mm, Meesho 100×150 mm, Amazon 102×152 mm.
