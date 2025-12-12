<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import * as monaco from 'monaco-editor';
  
  const dispatch = createEventDispatcher();
  
  let content = $bindable('');
  let filename = $bindable('untitled.txt');
  
  let editorContainer = $state();
  let editor = $state();
  let currentContent = $state(content);
  
  function getLanguageFromFilename(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'sh': 'shell',
      'bash': 'shell',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'svelte': 'html'
    };
    
    return languageMap[ext] || 'plaintext';
  }
  
  function handleSave() {
    const content = editor.getValue();
    dispatch('save', content);
  }
  
  onMount(() => {
    // Configure Monaco Editor
    self.MonacoEnvironment = {
      getWorkerUrl: function (moduleId, label) {
        if (label === 'json') {
          return '/monaco-editor/esm/vs/language/json/json.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return '/monaco-editor/esm/vs/language/css/css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return '/monaco-editor/esm/vs/language/html/html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
          return '/monaco-editor/esm/vs/language/typescript/ts.worker.js';
        }
        return '/monaco-editor/esm/vs/editor/editor.worker.js';
      }
    };
    
    editor = monaco.editor.create(editorContainer, {
      value: content,
      language: getLanguageFromFilename(filename),
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: {
        enabled: true
      },
      fontSize: 14,
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      scrollBeyondLastLine: false
    });
    
    // Add save keyboard shortcut (Ctrl+S or Cmd+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });
    
    return () => {
      editor.dispose();
    };
  });
  
  // Update editor content when content prop changes
  $effect(() => {
    if (editor && content !== currentContent) {
      currentContent = content;
      editor.setValue(content);
      const language = getLanguageFromFilename(filename);
      monaco.editor.setModelLanguage(editor.getModel(), language);
    }
  });
</script>

<div class="editor-wrapper">
  <div class="toolbar">
    <button class="save-button" on:click={handleSave}>
      💾 Save (Ctrl+S)
    </button>
  </div>
  <div class="editor-container" bind:this={editorContainer}></div>
</div>

<style>
  .editor-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .toolbar {
    background: #2d2d30;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #3e3e42;
  }
  
  .save-button {
    background: #0e639c;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 3px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .save-button:hover {
    background: #1177bb;
  }
  
  .save-button:active {
    background: #0d5a8f;
  }
  
  .editor-container {
    flex: 1;
    overflow: hidden;
  }
</style>
