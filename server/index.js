import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Define the workspace root (current directory for this example)
// In production, you might want to configure this
const WORKSPACE_ROOT = path.resolve(__dirname, '..');

// Helper function to resolve and validate paths
function resolvePath(requestedPath) {
  const resolved = path.resolve(WORKSPACE_ROOT, requestedPath.startsWith('/') ? requestedPath.slice(1) : requestedPath);
  
  // Security check: ensure the path is within workspace
  if (!resolved.startsWith(WORKSPACE_ROOT)) {
    throw new Error('Access denied: Path is outside workspace');
  }
  
  return resolved;
}

// API endpoint to list files in a directory
app.get('/api/files/list', async (req, res) => {
  try {
    const requestedPath = req.query.path || '/';
    const fullPath = resolvePath(requestedPath);
    
    const stats = await fs.stat(fullPath);
    
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }
    
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    
    const files = await Promise.all(
      entries
        .filter(entry => !entry.name.startsWith('.') && entry.name !== 'node_modules')
        .map(async entry => {
          const entryPath = path.join(fullPath, entry.name);
          const relativePath = path.relative(WORKSPACE_ROOT, entryPath);
          
          return {
            name: entry.name,
            path: '/' + relativePath.replace(/\\/g, '/'),
            isDirectory: entry.isDirectory()
          };
        })
    );
    
    // Sort: directories first, then files, both alphabetically
    files.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
    
    res.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to read a file
app.get('/api/files/read', async (req, res) => {
  try {
    const requestedPath = req.query.path;
    
    if (!requestedPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }
    
    const fullPath = resolvePath(requestedPath);
    
    const stats = await fs.stat(fullPath);
    
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Cannot read a directory' });
    }
    
    const content = await fs.readFile(fullPath, 'utf-8');
    
    res.json({ 
      content,
      path: requestedPath
    });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to write a file
app.post('/api/files/write', async (req, res) => {
  try {
    const { path: requestedPath, content } = req.body;
    
    if (!requestedPath) {
      return res.status(400).json({ error: 'Path is required' });
    }
    
    if (content === undefined) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const fullPath = resolvePath(requestedPath);
    
    // Ensure parent directory exists
    const dirPath = path.dirname(fullPath);
    await fs.mkdir(dirPath, { recursive: true });
    
    await fs.writeFile(fullPath, content, 'utf-8');
    
    res.json({ 
      success: true,
      path: requestedPath
    });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`File server running on port ${PORT}`);
  console.log(`Workspace root: ${WORKSPACE_ROOT}`);
});
