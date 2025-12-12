<script>
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let currentPath = $bindable('/');
  
  let files = $state([]);
  let loading = $state(false);
  let error = $state(null);
  
  async function loadFiles(path) {
    loading = true;
    error = null;
    
    try {
      const response = await fetch(`/api/files/list?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        const data = await response.json();
        files = data.files;
      } else {
        error = 'Failed to load files';
      }
    } catch (err) {
      console.error('Error loading files:', err);
      error = 'Error loading files';
    } finally {
      loading = false;
    }
  }
  
  function handleFileClick(file) {
    if (file.isDirectory) {
      currentPath = file.path;
      loadFiles(currentPath);
    } else {
      dispatch('fileSelect', file);
    }
  }
  
  function navigateUp() {
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    currentPath = '/' + parts.join('/');
    loadFiles(currentPath);
  }
  
  onMount(() => {
    loadFiles(currentPath);
  });
  
  $effect(() => {
    if (currentPath) {
      loadFiles(currentPath);
    }
  });
</script>

<div class="file-browser">
  <div class="browser-header">
    <h3>Files</h3>
    {#if currentPath !== '/'}
      <button class="up-button" on:click={navigateUp}>↑ Up</button>
    {/if}
  </div>
  
  <div class="current-path">{currentPath}</div>
  
  {#if loading}
    <div class="loading">Loading...</div>
  {:else if error}
    <div class="error">{error}</div>
  {:else}
    <ul class="file-list">
      {#each files as file}
        <li 
          class="file-item {file.isDirectory ? 'directory' : 'file'}"
          on:click={() => handleFileClick(file)}
        >
          <span class="icon">{file.isDirectory ? '📁' : '📄'}</span>
          <span class="name">{file.name}</span>
        </li>
      {/each}
      
      {#if files.length === 0}
        <li class="empty">No files found</li>
      {/if}
    </ul>
  {/if}
</div>

<style>
  .file-browser {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .browser-header {
    padding: 1rem;
    border-bottom: 1px solid #3e3e42;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  h3 {
    margin: 0;
    font-size: 1rem;
    color: #d4d4d4;
  }
  
  .up-button {
    background: #0e639c;
    border: none;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .up-button:hover {
    background: #1177bb;
  }
  
  .current-path {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    color: #858585;
    border-bottom: 1px solid #3e3e42;
    word-break: break-all;
  }
  
  .loading, .error {
    padding: 1rem;
    text-align: center;
    color: #858585;
  }
  
  .error {
    color: #f48771;
  }
  
  .file-list {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto;
  }
  
  .file-item {
    padding: 0.5rem 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: background 0.1s;
  }
  
  .file-item:hover {
    background: #2a2d2e;
  }
  
  .file-item.directory {
    font-weight: 500;
  }
  
  .icon {
    font-size: 1rem;
  }
  
  .name {
    font-size: 0.875rem;
    color: #d4d4d4;
  }
  
  .empty {
    padding: 1rem;
    text-align: center;
    color: #858585;
    font-size: 0.875rem;
  }
</style>
