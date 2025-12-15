# Quick Start Guide

## Prerequisites
- Node.js v18 or higher
- npm or yarn

## Installation

```bash
npm install
```

## Running the Application

### Method 1: Run Both Servers Separately (Recommended for Development)

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

### Method 2: Production Build

```bash
npm run build
npm run preview
```

## Features

- **File Browser**: Navigate through directories on the left sidebar
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **Save Files**: Click the save button or press Ctrl+S (Cmd+S on Mac)
- **Multi-language Support**: Automatic syntax highlighting for JavaScript, TypeScript, JSON, Python, Java, and many more
- **Single File Mode**: Direct file access via URL parameter

## Single File Mode

Access a specific file directly without the file browser:

```
http://localhost:3000/?file=/path/to/file.js
```

**Examples:**
- `http://localhost:3000/?file=/src/App.svelte` - Edit the main App component
- `http://localhost:3000/?file=/README.md` - Edit the README
- `http://localhost:3000/?file=/package.json` - Edit package.json

In single file mode:
- File browser is hidden (full-screen editor)
- Only the specified file is accessible
- Great for focused editing or embedding in other tools

## Security Features

- Rate limiting on API endpoints (100 requests per 15 minutes per IP)
- Path validation to prevent directory traversal attacks
- Hidden files and node_modules excluded from browsing

## API Endpoints

- `GET /api/files/list?path=/path/to/dir` - List files in a directory
- `GET /api/files/read?path=/path/to/file` - Read file contents
- `POST /api/files/write` - Write file contents (body: `{path, content}`)
- `GET /api/health` - Health check

## Project Structure

```
MocaEditor/
├── src/
│   ├── components/
│   │   ├── FileBrowser.svelte  # Directory/file browser
│   │   └── Editor.svelte        # Monaco editor wrapper
│   ├── App.svelte               # Main app component
│   └── main.js                  # Entry point
├── server/
│   └── index.js                 # Express backend
├── public/                      # Static assets
├── index.html                   # HTML template
└── vite.config.js              # Vite config
```

## Notes

- The workspace is restricted to the project root directory for security
- Files are served from the server where the backend is running
- The frontend uses Vite's proxy to forward API requests to the backend
