<script>
  import { onMount } from 'svelte';
  import FileBrowser from './components/FileBrowser.svelte';
  import Editor from './components/Editor.svelte';
  
  let selectedFile = $state(null);
  let fileContent = $state('');
  let currentPath = $state('/');
  let singleFileMode = $state(false);
  let singleFilePath = $state('');
  
  onMount(() => {
    // Check if single file mode is enabled via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const filePath = urlParams.get('file');
    
    if (filePath) {
      singleFileMode = true;
      singleFilePath = filePath;
      loadSingleFile(filePath);
    }
  });
  
  async function loadSingleFile(filePath) {
    const fileName = filePath.split('/').pop();
    selectedFile = {
      name: fileName,
      path: filePath,
      isDirectory: false
    };
    
    try {
      const response = await fetch(`/api/files/read?path=${encodeURIComponent(filePath)}`);
      if (response.ok) {
        const data = await response.json();
        fileContent = data.content;
      } else {
        alert('Failed to load file');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error loading file');
    }
  }
  
  async function handleFileSelect(event) {
    const file = event.detail;
    if (file.isDirectory) {
      return;
    }
    
    selectedFile = file;
    
    try {
      const response = await fetch(`/api/files/read?path=${encodeURIComponent(file.path)}`);
      if (response.ok) {
        const data = await response.json();
        fileContent = data.content;
      } else {
        alert('Failed to load file');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Error loading file');
    }
  }
  
  async function handleSave(event) {
    const content = event.detail;
    
    if (!selectedFile) return;
    
    try {
      const response = await fetch('/api/files/write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: selectedFile.path,
          content: content
        })
      });
      
      if (response.ok) {
        alert('File saved successfully!');
      } else {
        alert('Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file');
    }
  }
</script>

<main>
  <div class="container">
    <header>
      <h1>🎨 MocaEditor</h1>
      <p class="subtitle">Web-based File Editor{singleFileMode ? ' - Single File Mode' : ''}</p>
    </header>
    
    <div class="content">
      {#if !singleFileMode}
        <div class="sidebar">
          <FileBrowser on:fileSelect={handleFileSelect} bind:currentPath />
        </div>
      {/if}
      
      <div class="editor-panel" class:full-width={singleFileMode}>
        {#if selectedFile}
          <div class="editor-header">
            <span class="file-name">{selectedFile.name}</span>
            <span class="file-path">{selectedFile.path}</span>
          </div>
          <Editor 
            content={fileContent} 
            filename={selectedFile.name}
            on:save={handleSave}
          />
        {:else}
          <div class="empty-state">
            <h2>Welcome to MocaEditor</h2>
            <p>Select a file from the browser to start editing</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #1e1e1e;
    color: #d4d4d4;
  }
  
  main {
    height: 100vh;
    overflow: hidden;
  }
  
  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  header {
    background: #252526;
    padding: 1rem 2rem;
    border-bottom: 1px solid #3e3e42;
  }
  
  h1 {
    margin: 0;
    font-size: 1.8rem;
    color: #569cd6;
  }
  
  .subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: #858585;
  }
  
  .content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .sidebar {
    width: 300px;
    background: #252526;
    border-right: 1px solid #3e3e42;
    overflow-y: auto;
  }
  
  .editor-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  .editor-panel.full-width {
    width: 100%;
  }
  
  .editor-header {
    background: #2d2d30;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #3e3e42;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .file-name {
    font-weight: 600;
    color: #d4d4d4;
  }
  
  .file-path {
    color: #858585;
    font-size: 0.875rem;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #858585;
  }
  
  .empty-state h2 {
    margin: 0;
    color: #d4d4d4;
  }
  
  .empty-state p {
    margin: 0.5rem 0 0 0;
  }
</style>
