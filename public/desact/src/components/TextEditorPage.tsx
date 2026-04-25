import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Type, Code, FileText, Bold, Italic, Underline, List, ListOrdered, Link, Image, Save, Download, Upload, Users, Eye, EyeOff, Undo, Redo, AlignLeft, AlignCenter, AlignRight, Hash, Menu, Plus, Trash2, ChevronRight, ChevronDown, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';

import { DesactLogo } from './shared/DesactLogo';
import { categoryIcons, componentIcons } from './constants/iconMappings';

interface TextEditorPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const TextEditorPage: React.FC<TextEditorPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Text editor states
  const [basicText, setBasicText] = useState('This is a basic text editor with syntax highlighting and line numbers.');
  const [richText, setRichText] = useState('<p>This is a <strong>rich text editor</strong> with <em>formatting options</em>. You can add <u>underlined text</u>, create lists, and more.</p>');
  const [markdownText, setMarkdownText] = useState('# Markdown Editor\n\nThis is a **markdown editor** with live preview.\n\n- Feature 1\n- Feature 2\n- Feature 3\n\n```javascript\nconst editor = new MarkdownEditor();\n```');
  const [codeText, setCodeText] = useState('function calculateSum(a, b) {\n  return a + b;\n}\n\nconst result = calculateSum(5, 3);\nconsole.log(result); // 8');
  const [collaborativeText, setCollaborativeText] = useState('This is a collaborative document. Multiple users can edit simultaneously with real-time updates and conflict resolution.');
  
  // Editor options
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [fontSize, setFontSize] = useState('14');
  const [lineNumbers, setLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);

  const sidebarInputRef = useRef<HTMLInputElement>(null);
  
  const handleSidebarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSidebarSearchTerm('');
      if (sidebarInputRef.current) {
        sidebarInputRef.current.blur();
      }
    }
  };

  const copyToClipboard = async (code: string, id: string) => {
    const textToCopy = code.trim();
    let copySuccess = false;

    const canUseClipboard = navigator.clipboard && 
                           window.isSecureContext && 
                           typeof navigator.permissions !== 'undefined';

    if (canUseClipboard) {
      try {
        const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
        if (permission.state === 'granted' || permission.state === 'prompt') {
          await navigator.clipboard.writeText(textToCopy);
          copySuccess = true;
        }
      } catch (err) {
        copySuccess = false;
      }
    }

    if (!copySuccess) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.style.fontSize = '16px';
        textArea.setAttribute('readonly', '');
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, textArea.value.length);
        
        copySuccess = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (fallbackErr) {
        copySuccess = false;
      }
    }

    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 73;
      const elementTop = element.offsetTop - headerHeight - 24;
      
      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
      
      setActiveSection(sectionId);
    }
  };

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'basic-editor', 'rich-text-editor', 'markdown-editor', 'code-editor', 'collaborative-editor', 'advanced-features', 'implementation'];
      const scrollPosition = window.scrollY + 150;

      let currentSection = sections[0];
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const { offsetTop } = element;
          if (scrollPosition >= offsetTop) {
            currentSection = sections[i];
            break;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sidebarSections = [
    { id: 'overview', label: 'Overview', icon: Type },
    { id: 'basic-editor', label: 'Basic Editor', icon: FileText },
    { id: 'rich-text-editor', label: 'Rich Text Editor', icon: Bold },
    { id: 'markdown-editor', label: 'Markdown Editor', icon: Hash },
    { id: 'code-editor', label: 'Code Editor', icon: Code },
    { id: 'collaborative-editor', label: 'Collaborative Editor', icon: Users },
    { id: 'advanced-features', label: 'Advanced Features', icon: Plus },
    { id: 'implementation', label: 'Implementation', icon: Menu },
  ];

  // Group components by category
  const componentsByCategory = components.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, typeof components>);

  // Filter components based on search
  const filteredComponentsByCategory = Object.entries(componentsByCategory).reduce((acc, [category, categoryComponents]) => {
    const filtered = categoryComponents.filter(component =>
      component.name.toLowerCase().includes(sidebarSearchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof components>);

  const PreviewCard: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ 
    children, 
    title, 
    className = "" 
  }) => (
    <Card className={`p-6 border-brown-200 ${className}`}>
      {title && <h4 className="font-semibold mb-4">{title}</h4>}
      {children}
    </Card>
  );

  const EditorToolbar: React.FC<{ 
    onAction: (action: string) => void;
    showRichTextTools?: boolean;
    showCodeTools?: boolean;
  }> = ({ onAction, showRichTextTools = false, showCodeTools = false }) => (
    <div className="border-b border-brown-200 p-3 bg-brown-50/50">
      <div className="flex items-center gap-2 flex-wrap">
        {showRichTextTools && (
          <>
            <ToggleGroup type="multiple" className="gap-1">
              <ToggleGroupItem value="bold" size="sm" onClick={() => onAction('bold')}>
                <Bold className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" size="sm" onClick={() => onAction('italic')}>
                <Italic className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" size="sm" onClick={() => onAction('underline')}>
                <Underline className="h-3 w-3" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Separator orientation="vertical" className="h-6" />
            <ToggleGroup type="single" className="gap-1">
              <ToggleGroupItem value="left" size="sm" onClick={() => onAction('align-left')}>
                <AlignLeft className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" size="sm" onClick={() => onAction('align-center')}>
                <AlignCenter className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" size="sm" onClick={() => onAction('align-right')}>
                <AlignRight className="h-3 w-3" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" onClick={() => onAction('list')}>
              <List className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onAction('ordered-list')}>
              <ListOrdered className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onAction('link')}>
              <Link className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onAction('image')}>
              <Image className="h-3 w-3" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}
        
        {showCodeTools && (
          <>
            <Select defaultValue="javascript">
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}
        
        <Button variant="ghost" size="sm" onClick={() => onAction('undo')}>
          <Undo className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction('redo')}>
          <Redo className="h-3 w-3" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="ghost" size="sm" onClick={() => onAction('save')}>
          <Save className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction('download')}>
          <Download className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction('upload')}>
          <Upload className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  const renderMarkdownPreview = (markdown: string) => {
    // Simple markdown rendering for demo purposes
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-gray-100 p-3 rounded-lg mt-2 mb-2 overflow-x-auto"><code>$2</code></pre>')
      .replace(/\n/gim, '<br>');
  };

  return (
    <div className="min-h-screen bg-brown-50/30 flex">
      {/* Main Sidebar */}
      <div className="w-72 bg-white border-r border-brown-200 flex flex-col h-screen sticky top-0">
        {/* Header */}
        <div className="p-6 border-b border-brown-100">
          <div 
            className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-brown-50 rounded-lg p-2 -m-2 transition-colors"
            onClick={onBack}
          >
            <DesactLogo 
              onClick={onBack}
              animated={false}
            />
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
            <Input
              ref={sidebarInputRef}
              type="text"
              placeholder="Search..."
              className="pl-10 pr-16 bg-brown-50 border-brown-200 text-sm"
              value={sidebarSearchTerm}
              onChange={(e) => setSidebarSearchTerm(e.target.value)}
              onKeyDown={handleSidebarKeyDown}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <kbd className="pointer-events-none hidden md:inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono text-[9px] font-medium text-muted-foreground opacity-50">
                <span className="text-[9px]">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {Object.entries(filteredComponentsByCategory).map(([category, categoryComponents]) => {
              const IconComponent = categoryIcons[category] || componentIcons['Default'];
              
              return (
                <div key={category}>
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between text-sm font-medium hover:text-brown-700 py-2"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                      <span>{category}</span>
                    </div>
                    {!collapsedCategories.has(category) ? (
                      <ChevronDown className="w-4 h-4 transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform" />
                    )}
                  </button>
                  {!collapsedCategories.has(category) && (
                    <div className="ml-6 space-y-1">
                      {categoryComponents.map((component) => {
                        const ComponentIcon = componentIcons[component.name] || componentIcons['Default'];
                        
                        return (
                          <button
                            key={component.name}
                            onClick={() => onComponentClick(component.name)}
                            className={`w-full text-left text-sm py-2 px-3 rounded-md transition-colors flex items-center gap-2 ${
                              component.name === currentComponent
                                ? 'bg-brown-50 font-medium'
                                : 'hover:bg-brown-50'
                            }`}
                            style={{ 
                              color: component.name === currentComponent 
                                ? 'var(--color-fg-brand-primary)'
                                : 'var(--color-text-tertiary)' 
                            }}
                          >
                            <ComponentIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{component.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-brown-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-brown-50">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold">Text Editor</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Rich text editing components with formatting, syntax highlighting, and collaboration
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content with Floating Navigation */}
        <div className="flex-1 relative">
          {/* Floating Navigation */}
          <div className="fixed right-8 top-40 z-30 hidden xl:block">
            <div className="bg-white rounded-lg border border-brown-200 shadow-lg p-4 w-56">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brown-100">
                <Menu className="h-4 w-4" style={{ color: 'var(--color-text-quaternary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>On this page</span>
              </div>
              <nav className="space-y-1">
                {sidebarSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded transition-all duration-200 ${
                      activeSection === section.id
                        ? 'font-medium bg-brown-50 border-l-2 border-brown-500 pl-3'
                        : 'hover:bg-brown-50'
                    }`}
                    style={{ 
                      color: activeSection === section.id 
                        ? 'var(--color-fg-brand-primary)'
                        : 'var(--color-text-tertiary)' 
                    }}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8 xl:pr-72">
            <div className="max-w-4xl mx-auto space-y-16">
              {/* Overview Section */}
              <section id="overview" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Text Editor Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      A comprehensive collection of text editing components from basic textareas to advanced rich text editors 
                      with syntax highlighting, markdown support, and real-time collaboration features.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Type className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">5 Editor Types</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Basic, rich text, markdown, code, and collaborative editors with full feature sets.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Code className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Syntax Highlighting</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Built-in syntax highlighting for multiple languages with customizable themes.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Collaboration Ready</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Real-time collaboration features with conflict resolution and user awareness.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Installation">
                    <CodeBlock
                      code={`# Install required dependencies
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install @monaco-editor/react # For code editor
npm install react-markdown # For markdown support

# Import components
import { TextEditor } from './components/TextEditor'
import { RichTextEditor } from './components/RichTextEditor'
import { MarkdownEditor } from './components/MarkdownEditor'`}
                      language="bash"
                      id="installation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Basic Editor */}
              <section id="basic-editor" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Basic Text Editor</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Simple textarea with enhanced features and validation</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="space-y-4">
                      <EditorToolbar 
                        onAction={(action) => alert(`Action: ${action}`)}
                      />
                      <div className="border border-brown-200 rounded-lg">
                        <Textarea
                          value={basicText}
                          onChange={(e) => setBasicText(e.target.value)}
                          placeholder="Start typing..."
                          className="min-h-32 border-0 resize-none focus:ring-0 rounded-lg"
                          style={{ fontFamily: 'ui-monospace, monospace' }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{basicText.length} characters</span>
                        <span>{basicText.split('\n').length} lines</span>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Save, Download, Upload } from 'lucide-react';

function BasicTextEditor() {
  const [text, setText] = useState('');

  const handleSave = () => {
    // Save functionality
    console.log('Saving:', text);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave}>
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
          <Button variant="ghost" size="sm">
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
        </div>
      </div>
      
      {/* Editor */}
      <div className="border border-gray-200 rounded-lg">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing..."
          className="min-h-32 border-0 resize-none focus:ring-0"
        />
      </div>
      
      {/* Status Bar */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{text.length} characters</span>
        <span>{text.split('\\n').length} lines</span>
      </div>
    </div>
  );
}`}
                      language="tsx"
                      id="basic-editor-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Rich Text Editor */}
              <section id="rich-text-editor" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Rich Text Editor</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>WYSIWYG editor with formatting controls and media support</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="space-y-4">
                      <EditorToolbar 
                        onAction={(action) => alert(`Rich text action: ${action}`)}
                        showRichTextTools={true}
                      />
                      <div className="border border-brown-200 rounded-lg min-h-40 p-4">
                        <div 
                          contentEditable
                          className="outline-none"
                          dangerouslySetInnerHTML={{ __html: richText }}
                          onBlur={(e) => setRichText(e.target.innerHTML)}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Rich text formatting enabled</span>
                        <Badge variant="secondary">WYSIWYG Mode</Badge>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from './ui/button';
import { Bold, Italic, List, Link } from 'lucide-react';

function RichTextEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start writing...</p>',
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center gap-2">
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-40 prose prose-sm max-w-none"
      />
    </div>
  );
}`}
                      language="tsx"
                      id="rich-text-editor-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Markdown Editor */}
              <section id="markdown-editor" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Markdown Editor</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Split-view markdown editor with live preview</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <EditorToolbar 
                          onAction={(action) => alert(`Markdown action: ${action}`)}
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            variant={isPreviewMode ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                          >
                            {isPreviewMode ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                            {isPreviewMode ? 'Edit' : 'Preview'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 min-h-60">
                          {/* Editor Pane */}
                          <div className={`${isPreviewMode ? 'hidden md:block' : ''}`}>
                            <div className="bg-brown-50 px-3 py-2 border-b border-brown-200 md:border-r">
                              <span className="text-sm font-medium text-brown-700">Markdown</span>
                            </div>
                            <Textarea
                              value={markdownText}
                              onChange={(e) => setMarkdownText(e.target.value)}
                              placeholder="# Start writing markdown..."
                              className="border-0 rounded-none resize-none focus:ring-0 min-h-52"
                              style={{ fontFamily: 'ui-monospace, monospace' }}
                            />
                          </div>
                          
                          {/* Preview Pane */}
                          <div className={`${!isPreviewMode ? 'hidden md:block' : ''}`}>
                            <div className="bg-brown-50 px-3 py-2 border-b border-brown-200">
                              <span className="text-sm font-medium text-brown-700">Preview</span>
                            </div>
                            <div 
                              className="p-4 prose prose-sm max-w-none min-h-52 overflow-y-auto"
                              dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(markdownText) }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Markdown syntax supported</span>
                        <Badge variant="secondary">Live Preview</Badge>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Eye, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function MarkdownEditor() {
  const [markdown, setMarkdown] = useState('# Hello World\\n\\nThis is **markdown**!');
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Save</Button>
          <Button variant="ghost" size="sm">Export</Button>
        </div>
        <Button
          variant={showPreview ? "default" : "ghost"}
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>
      
      {/* Editor */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className={\`grid \${showPreview ? 'grid-cols-2' : 'grid-cols-1'} min-h-60\`}>
          {/* Markdown Input */}
          <div>
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
              <span className="text-sm font-medium">Markdown</span>
            </div>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="# Start writing markdown..."
              className="border-0 rounded-none resize-none focus:ring-0 min-h-52"
              style={{ fontFamily: 'ui-monospace, monospace' }}
            />
          </div>
          
          {/* Preview */}
          {showPreview && (
            <div className="border-l border-gray-200">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <span className="text-sm font-medium">Preview</span>
              </div>
              <div className="p-4 prose prose-sm max-w-none min-h-52 overflow-y-auto">
                <ReactMarkdown>{markdown}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`}
                      language="tsx"
                      id="markdown-editor-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Code Editor */}
              <section id="code-editor" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Code Editor</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Advanced code editor with syntax highlighting and IntelliSense</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="space-y-4">
                      <EditorToolbar 
                        onAction={(action) => alert(`Code editor action: ${action}`)}
                        showCodeTools={true}
                      />
                      <div className="border border-brown-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-900 text-green-400 font-mono text-sm">
                          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
                            <span className="text-gray-300">main.js</span>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>JavaScript</span>
                              <span>•</span>
                              <span>UTF-8</span>
                              <span>•</span>
                              <span>LF</span>
                            </div>
                          </div>
                          <div className="relative">
                            {lineNumbers && (
                              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-800 border-r border-gray-700 flex flex-col text-gray-500 text-xs pt-4">
                                {codeText.split('\n').map((_, index) => (
                                  <div key={index} className="px-2 h-6 flex items-center justify-end">
                                    {index + 1}
                                  </div>
                                ))}
                              </div>
                            )}
                            <Textarea
                              value={codeText}
                              onChange={(e) => setCodeText(e.target.value)}
                              placeholder="// Start coding..."
                              className={`bg-transparent border-0 text-green-400 resize-none focus:ring-0 min-h-40 ${lineNumbers ? 'pl-16' : 'pl-4'} pt-4 pb-4 pr-4`}
                              style={{ fontFamily: 'ui-monospace, monospace', fontSize: `${fontSize}px` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm">Font Size:</label>
                            <Select value={fontSize} onValueChange={setFontSize}>
                              <SelectTrigger className="w-20 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12">12px</SelectItem>
                                <SelectItem value="14">14px</SelectItem>
                                <SelectItem value="16">16px</SelectItem>
                                <SelectItem value="18">18px</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant={lineNumbers ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setLineNumbers(!lineNumbers)}
                          >
                            Line Numbers
                          </Button>
                          <Button
                            variant={wordWrap ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setWordWrap(!wordWrap)}
                          >
                            Word Wrap
                          </Button>
                        </div>
                        <Badge variant="secondary">JavaScript</Badge>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function CodeEditor() {
  const [code, setCode] = useState('function hello() {\\n  console.log("Hello, World!");\\n}');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vs-light">Light</SelectItem>
              <SelectItem value="vs-dark">Dark</SelectItem>
              <SelectItem value="hc-black">High Contrast</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Format</Button>
          <Button variant="ghost" size="sm">Run</Button>
        </div>
      </div>
      
      {/* Editor */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Editor
          height="400px"
          language={language}
          theme={theme}
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}`}
                      language="tsx"
                      id="code-editor-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Collaborative Editor */}
              <section id="collaborative-editor" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Collaborative Editor</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Real-time collaborative editing with user presence and conflict resolution</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <EditorToolbar 
                          onAction={(action) => alert(`Collaborative action: ${action}`)}
                          showRichTextTools={true}
                        />
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                              JD
                            </div>
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                              AS
                            </div>
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white">
                              MK
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            3 Active Users
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="border border-brown-200 rounded-lg">
                        <Textarea
                          value={collaborativeText}
                          onChange={(e) => setCollaborativeText(e.target.value)}
                          placeholder="Start collaborating..."
                          className="min-h-40 border-0 resize-none focus:ring-0 rounded-lg"
                        />
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                          <span className="text-blue-700">
                            <strong>John Doe</strong> is typing...
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>Auto-save: ON</span>
                          <span>Last saved: 2 minutes ago</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Version 1.2.3</Badge>
                          <Button variant="ghost" size="sm">History</Button>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState, useEffect } from 'react';
import { useCollaboration } from './hooks/useCollaboration';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';

function CollaborativeEditor({ documentId }) {
  const [content, setContent] = useState('');
  const { 
    users, 
    isTyping, 
    connect, 
    disconnect, 
    sendUpdate,
    onUpdate 
  } = useCollaboration(documentId);

  useEffect(() => {
    connect();
    
    onUpdate((newContent) => {
      setContent(newContent);
    });

    return () => disconnect();
  }, []);

  const handleContentChange = (value) => {
    setContent(value);
    sendUpdate(value);
  };

  return (
    <div className="space-y-4">
      {/* User Presence */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Collaborators:</span>
          <div className="flex -space-x-2">
            {users.map((user) => (
              <Avatar key={user.id} className="w-8 h-8 border-2 border-white">
                <span className="text-xs font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </Avatar>
            ))}
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {users.length} Active
          </Badge>
        </div>
      </div>
      
      {/* Editor */}
      <div className="border border-gray-200 rounded-lg">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start collaborating..."
          className="min-h-40 border-0 resize-none focus:ring-0"
        />
      </div>
      
      {/* Typing Indicators */}
      {isTyping.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-blue-700">
              <strong>{isTyping.join(', ')}</strong> 
              {isTyping.length === 1 ? ' is' : ' are'} typing...
            </span>
          </div>
        </div>
      )}
      
      {/* Status */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Auto-save enabled</span>
        <span>Last saved: {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}`}
                      language="tsx"
                      id="collaborative-editor-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Advanced Features */}
              <section id="advanced-features" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Advanced Features</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Additional editor capabilities and integrations</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Auto-save & Version Control">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Auto-save</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">Enabled</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Version 1.2.3</span>
                            <span className="text-muted-foreground">2 minutes ago</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Version 1.2.2</span>
                            <span className="text-muted-foreground">1 hour ago</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Version 1.2.1</span>
                            <span className="text-muted-foreground">Yesterday</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          View Full History
                        </Button>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="AI Writing Assistant">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span className="text-sm font-medium">AI Suggestions</span>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
                            <div className="font-medium mb-1">Grammar Suggestion</div>
                            <div className="text-muted-foreground">
                              Consider changing "it's" to "its" for possessive form.
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                            <div className="font-medium mb-1">Style Improvement</div>
                            <div className="text-muted-foreground">
                              Try using more active voice in this sentence.
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Configure AI Settings
                        </Button>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Plugin Ecosystem">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Code className="w-4 h-4" />
                              <span className="text-sm">Code Snippets</span>
                            </div>
                            <Badge variant="secondary">Installed</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <span className="text-sm">Table Editor</span>
                            </div>
                            <Badge variant="secondary">Installed</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Image className="w-4 h-4" />
                              <span className="text-sm">Image Optimization</span>
                            </div>
                            <Button variant="ghost" size="sm">Install</Button>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          Browse Plugin Store
                        </Button>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Export Options">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <FileText className="w-4 h-4 mr-2" />
                            Export as PDF
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Code className="w-4 h-4 mr-2" />
                            Export as HTML
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Hash className="w-4 h-4 mr-2" />
                            Export as Markdown
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Type className="w-4 h-4 mr-2" />
                            Export as Plain Text
                          </Button>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Implementation */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation Guide</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Best practices for implementing text editors in your application</p>
                  </div>
                  
                  <PreviewCard title="Editor Selection Guide">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">Basic Text Editor</h4>
                          <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                            <li>• Simple text input and editing</li>
                            <li>• Comments and feedback forms</li>
                            <li>• Note-taking applications</li>
                            <li>• Basic configuration files</li>
                            <li>• Quick text capture</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-3">Rich Text Editor</h4>
                          <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                            <li>• Blog posts and articles</li>
                            <li>• Email composition</li>
                            <li>• Documentation with formatting</li>
                            <li>• Marketing content creation</li>
                            <li>• Content management systems</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-3">Markdown Editor</h4>
                          <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                            <li>• Technical documentation</li>
                            <li>• README files</li>
                            <li>• Wiki pages</li>
                            <li>• Developer blogs</li>
                            <li>• Issue tracking systems</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-3">Code Editor</h4>
                          <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                            <li>• Online code playgrounds</li>
                            <li>• Configuration editors</li>
                            <li>• SQL query builders</li>
                            <li>• Template editors</li>
                            <li>• Developer tools</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Performance Optimization">
                    <CodeBlock
                      code={`// Debounce updates for better performance
import { useDebouncedCallback } from 'use-debounce';

function OptimizedEditor() {
  const [content, setContent] = useState('');
  
  // Debounce auto-save to prevent excessive API calls
  const debouncedSave = useDebouncedCallback(
    (value) => {
      saveDocument(value);
    },
    1000 // Save after 1 second of inactivity
  );

  const handleChange = (value) => {
    setContent(value);
    debouncedSave(value);
  };

  return (
    <Editor
      value={content}
      onChange={handleChange}
      // Virtual scrolling for large documents
      options={{
        scrollBeyondLastLine: false,
        automaticLayout: true,
        minimap: { enabled: false }, // Disable for better performance
      }}
    />
  );
}

// Lazy load editor for better initial page load
const LazyEditor = lazy(() => import('./components/RichTextEditor'));

function App() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <LazyEditor />
    </Suspense>
  );
}`}
                      language="tsx"
                      id="performance-optimization-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Accessibility Best Practices">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Keyboard Navigation</h4>
                        <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>Support standard keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic)</li>
                          <li>Ensure all toolbar buttons are keyboard accessible</li>
                          <li>Provide Tab navigation through editor controls</li>
                          <li>Support Escape key to exit editing modes</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Screen Reader Support</h4>
                        <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>Use proper ARIA labels for all interactive elements</li>
                          <li>Announce formatting changes to screen readers</li>
                          <li>Provide alternative text for toolbar icons</li>
                          <li>Ensure content structure is readable without visual formatting</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Visual Accessibility</h4>
                        <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>Maintain sufficient color contrast for text and backgrounds</li>
                          <li>Support high contrast mode and custom themes</li>
                          <li>Provide visual focus indicators for keyboard navigation</li>
                          <li>Allow font size adjustment for better readability</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};