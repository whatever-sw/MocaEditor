<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import * as monaco from 'monaco-editor';
  import { configureMonacoYaml } from 'monaco-yaml';
  
  const dispatch = createEventDispatcher();
  
  let { content = $bindable(''), filename = $bindable('untitled.txt') } = $props();
  
  let editorContainer = $state();
  let editor = $state();
  let currentContent = $state(content);
  let currentFilename = $state(filename);
  
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
          fileMatch: ['**/workflows/*.yml', '**/workflows/*.yaml', '**/.github/workflows/*.yml', '**/.github/workflows/*.yaml'],
        },
        {
          uri: 'https://json.schemastore.org/docker-compose.json',
          fileMatch: ['**/docker-compose.yml', '**/docker-compose.yaml', 'docker-compose*.yml', 'docker-compose*.yaml'],
        }
      ]
    });
  }
  
  function handleSave() {
    const content = editor.getValue();
    dispatch('save', content);
  }
  
  onMount(() => {
    // Configure Monaco Environment for workers
    self.MonacoEnvironment = {
      getWorker(moduleId, label) {
        switch (label) {
          case 'editorWorkerService':
            return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' });
          case 'json':
            return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), { type: 'module' });
          case 'css':
          case 'scss':
          case 'less':
            return new Worker(new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url), { type: 'module' });
          case 'html':
          case 'handlebars':
          case 'razor':
            return new Worker(new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url), { type: 'module' });
          case 'typescript':
          case 'javascript':
            return new Worker(new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url), { type: 'module' });
          case 'yaml':
            // monaco-yaml worker
            return new Worker(new URL('monaco-yaml/yaml.worker.js', import.meta.url), { type: 'module' });
          default:
            return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' });
        }
      }
    };
    
    // Configure schema validation and autocomplete before setting up editor
    configureJsonSchemas();
    configureYamlSchemas();
    
    // Create model with proper URI for schema matching
    const language = getLanguageFromFilename(filename);
    const modelUri = monaco.Uri.parse(`file:///${filename}`);
    const model = monaco.editor.createModel(content, language, modelUri);
    
    editor = monaco.editor.create(editorContainer, {
      model: model,
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
      model.dispose();
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
  
  // Update language and model URI when filename changes
  $effect(() => {
    if (editor && filename && filename !== currentFilename) {
      currentFilename = filename;
      const language = getLanguageFromFilename(filename);
      const currentModel = editor.getModel();
      
      // Create a new model with the updated URI and language
      const newModelUri = monaco.Uri.parse(`file:///${filename}`);
      const newModel = monaco.editor.createModel(currentModel.getValue(), language, newModelUri);
      
      // Set the new model and dispose the old one
      editor.setModel(newModel);
      currentModel.dispose();
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
