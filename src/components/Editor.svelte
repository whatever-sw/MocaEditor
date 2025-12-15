<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import * as monaco from 'monaco-editor';
  import { configureMonacoYaml } from 'monaco-yaml';
  
  const dispatch = createEventDispatcher();
  
  let { content = $bindable(''), filename = $bindable('untitled.txt') } = $props();
  
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
      'svelte': 'html',
      'toml': 'ini',
      'dockerfile': 'dockerfile'
    };
    
    // Special case for Dockerfile
    if (filename.toLowerCase() === 'dockerfile' || filename.toLowerCase().startsWith('dockerfile.')) {
      return 'dockerfile';
    }
    
    return languageMap[ext] || 'plaintext';
  }
  
  function configureJsonSchemas() {
    // Configure JSON validation with schemas for common files
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [
        {
          uri: 'http://json-schema.org/draft-07/schema#',
          fileMatch: ['package.json'],
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Package name' },
              version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+', description: 'Package version (semver)' },
              description: { type: 'string', description: 'Package description' },
              main: { type: 'string', description: 'Entry point file' },
              type: { type: 'string', enum: ['module', 'commonjs'], description: 'Module type' },
              scripts: { 
                type: 'object', 
                description: 'Scripts to run',
                additionalProperties: { type: 'string' }
              },
              dependencies: { 
                type: 'object',
                description: 'Production dependencies',
                additionalProperties: { type: 'string' }
              },
              devDependencies: { 
                type: 'object',
                description: 'Development dependencies',
                additionalProperties: { type: 'string' }
              },
              keywords: { 
                type: 'array',
                items: { type: 'string' },
                description: 'Package keywords'
              },
              author: { type: 'string', description: 'Package author' },
              license: { type: 'string', description: 'Package license' }
            },
            required: ['name', 'version']
          }
        },
        {
          uri: 'http://json-schema.org/tsconfig',
          fileMatch: ['tsconfig.json', 'tsconfig.*.json'],
          schema: {
            type: 'object',
            properties: {
              compilerOptions: {
                type: 'object',
                description: 'TypeScript compiler options',
                properties: {
                  target: { type: 'string', enum: ['ES3', 'ES5', 'ES6', 'ES2015', 'ES2016', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ESNext'] },
                  module: { type: 'string', enum: ['commonjs', 'amd', 'umd', 'system', 'es6', 'es2015', 'esnext', 'none'] },
                  lib: { type: 'array', items: { type: 'string' } },
                  strict: { type: 'boolean' },
                  esModuleInterop: { type: 'boolean' }
                }
              },
              include: { type: 'array', items: { type: 'string' } },
              exclude: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      ]
    });
  }
  
  function configureYamlSchemas() {
    // Configure YAML validation
    configureMonacoYaml(monaco, {
      enableSchemaRequest: true,
      hover: true,
      completion: true,
      validate: true,
      format: true,
      schemas: [
        {
          uri: 'https://json.schemastore.org/github-workflow.json',
          fileMatch: ['.github/workflows/*.yml', '.github/workflows/*.yaml'],
        },
        {
          uri: 'https://json.schemastore.org/docker-compose.json',
          fileMatch: ['docker-compose.yml', 'docker-compose.yaml'],
        }
      ]
    });
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
    
    // Configure schema validation and autocomplete
    configureJsonSchemas();
    configureYamlSchemas();
    
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
      scrollBeyondLastLine: false,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'matchingDocuments'
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
    }
  });
  
  // Update language when filename changes
  $effect(() => {
    if (editor && filename) {
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
