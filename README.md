# MocaEditor

A modern web-based file editor built with **Svelte 5** and **Monaco Editor**. Browse and edit server-side files through an intuitive web interface.

## Features

- 🎨 **Modern UI**: Built with Svelte 5 using the latest runes API
- 📝 **Monaco Editor**: Full-featured code editor with syntax highlighting
- 📁 **File Browser**: Navigate through directories and files
- 💾 **Save Files**: Edit and save files directly to the server
- 🎯 **Multi-language Support**: Syntax highlighting for JavaScript, TypeScript, Python, Java, and more
- ⌨️ **Keyboard Shortcuts**: Ctrl+S (Cmd+S on Mac) to save files
- 📄 **Single File Mode**: Direct file editing via URL parameter (no file browser)

## Tech Stack

- **Frontend**: Svelte 5, Monaco Editor, Vite
- **Backend**: Node.js, Express
- **Styling**: CSS with VS Code dark theme

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/whatever-sw/MocaEditor.git
   cd MocaEditor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

You need to run both the frontend and backend servers:

1. **Start the backend server** (in one terminal):
   ```bash
   npm run server
   ```
   The server will start on port 3001.

2. **Start the frontend dev server** (in another terminal):
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3000

### Production Build

To create a production build:

```bash
npm run build
npm run preview
```

### Single File Mode

You can open MocaEditor directly to a specific file using the `file` URL parameter:

```
http://localhost:3000/?file=/path/to/file.js
```

In single file mode:
- The file browser is hidden
- Only the specified file can be edited
- Perfect for quick edits or embedding in other applications

**Example:**
```
http://localhost:3000/?file=/src/App.svelte
http://localhost:3000/?file=/README.md
http://localhost:3000/?file=/package.json
```

## Project Structure

```
MocaEditor/
├── src/
│   ├── components/
│   │   ├── FileBrowser.svelte    # File/directory browser
│   │   └── Editor.svelte          # Monaco editor wrapper
│   ├── App.svelte                 # Main application
│   └── main.js                    # Entry point
├── server/
│   └── index.js                   # Express backend server
├── public/                        # Static assets
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
└── package.json                   # Project dependencies
```

## API Endpoints

The backend server provides these API endpoints:

- `GET /api/files/list?path=/path/to/dir` - List files in a directory
- `GET /api/files/read?path=/path/to/file` - Read file contents
- `POST /api/files/write` - Write file contents
- `GET /api/health` - Health check

## Security

- The server restricts file access to the workspace root directory
- Paths are validated to prevent directory traversal attacks
- Hidden files and `node_modules` are excluded from browsing

## Development

This project uses:
- **Svelte 5** with runes (`$state`, `$effect`, `$bindable`)
- **Vite** for fast development and building
- **Monaco Editor** for rich code editing experience

## License

ISC
