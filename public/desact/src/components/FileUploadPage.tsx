import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, Upload, File, Image, Video, FileText, Download, Trash2, X, CheckCircle, AlertCircle, Clock, Plus, Eye, Folder, Archive, Music, Code, Database, FileSpreadsheet, FileImage, PlusCircle, CloudUpload, HardDrive, Link, Shield } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';


interface FileUploadPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const FileUploadPage: React.FC<FileUploadPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [selectedComponent, setSelectedComponent] = useState<string>(currentComponent);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; size: string; status: 'uploading' | 'complete' | 'error' }>>([]);
  const [fileIdCounter, setFileIdCounter] = useState<number>(0);

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
  });

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

  const simulateUpload = (fileName: string) => {
    setFileIdCounter(prev => prev + 1);
    const fileId = `file-${Date.now()}-${fileIdCounter}-${Math.random().toString(36).substr(2, 9)}`;
    const newFile = {
      id: fileId,
      name: fileName,
      size: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
      status: 'uploading' as const
    };
    
    setUploadedFiles(prev => [...prev, newFile]);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, status: 'complete' } : file
        ));
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      } else {
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'basic', 'drag-drop', 'multiple', 'progress', 'restrictions', 'hr-examples', 'best-practices', 'implementation'];
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

  useEffect(() => {
    setSelectedComponent(currentComponent);
  }, [currentComponent]);

  const sidebarSections = [
    { id: 'overview', label: 'Overview', icon: Upload },
    { id: 'basic', label: 'Basic Upload', icon: File },
    { id: 'drag-drop', label: 'Drag & Drop', icon: CloudUpload },
    { id: 'multiple', label: 'Multiple Files', icon: Folder },
    { id: 'progress', label: 'Progress Indicators', icon: Clock },
    { id: 'restrictions', label: 'File Restrictions', icon: Shield },
    { id: 'hr-examples', label: 'HR Examples', icon: FileText },
    { id: 'best-practices', label: 'Best Practices', icon: CheckCircle },
    { id: 'implementation', label: 'Implementation', icon: Code },
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

  const FileIcon = ({ fileName }: { fileName: string }) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <FileImage className="w-4 h-4" />;
    }
    if (['pdf'].includes(extension || '')) {
      return <FileText className="w-4 h-4" />;
    }
    if (['doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="w-4 h-4" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(extension || '')) {
      return <FileSpreadsheet className="w-4 h-4" />;
    }
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) {
      return <Video className="w-4 h-4" />;
    }
    if (['mp3', 'wav', 'flac'].includes(extension || '')) {
      return <Music className="w-4 h-4" />;
    }
    if (['zip', 'rar', '7z', 'tar'].includes(extension || '')) {
      return <Archive className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
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
              const IconComponent = categoryIcons[category] || Menu;
              
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
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform ${
                        !collapsedCategories.has(category) ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  {!collapsedCategories.has(category) && (
                    <div className="ml-6 space-y-1">
                      {categoryComponents.map((component) => {
                        const ComponentIcon = componentIcons[component.name] || Menu;
                        
                        return (
                          <button
                            key={component.name}
                            onClick={() => {
                              setSelectedComponent(component.name);
                              onComponentClick(component.name);
                            }}
                            className={`w-full text-left text-sm py-2 px-3 rounded-md transition-colors flex items-center gap-2 ${
                              component.name === selectedComponent
                                ? 'bg-brown-50 font-medium'
                                : 'hover:bg-brown-50'
                            }`}
                            style={{ 
                              color: component.name === selectedComponent 
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
                  <h1 className="text-xl font-semibold">File Upload</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Input Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Allow users to upload files with drag & drop, progress tracking, and validation
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
                      File Upload Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      File upload components enable users to select, drag and drop, and upload files with real-time progress tracking, 
                      validation, and comprehensive feedback for HR applications and document management.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <CloudUpload className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Drag & Drop</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Intuitive drag and drop interface with visual feedback for file uploads.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Progress Tracking</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Real-time upload progress with detailed status indicators and error handling.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">File Validation</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Built-in validation for file types, sizes, and security restrictions.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Upload Component Types Overview">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 border-2 border-dashed border-brown-200 rounded-lg text-center hover:border-brown-300 transition-colors cursor-pointer">
                          <CloudUpload className="w-8 h-8 text-brown-400 mx-auto mb-2" />
                          <p className="font-medium text-stone-900">Drag & Drop Zone</p>
                          <p className="text-sm text-stone-500 mt-1">Drop files here or click to browse</p>
                        </div>
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Files
                          </Button>
                          <p className="text-xs text-stone-500 text-center">
                            Supports PDF, DOC, JPG, PNG up to 10MB
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">employee-handbook.pdf</p>
                              <p className="text-xs text-stone-500">2.4 MB</p>
                            </div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileImage className="w-5 h-5 text-purple-600" />
                            <div>
                              <p className="font-medium text-sm">profile-photo.jpg</p>
                              <p className="text-xs text-stone-500">1.8 MB</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={75} className="w-16 h-2" />
                            <span className="text-xs text-stone-500">75%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Basic Upload Section */}
              <section id="basic" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Basic File Upload</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Simple file upload components with button-based selection.</p>
                  </div>

                  <PreviewCard title="Button-Based Upload">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Button className="bg-brown-600 hover:bg-brown-700">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload File
                        </Button>
                        <Button variant="outline">
                          <File className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                        <Button variant="secondary">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Add Document
                        </Button>
                      </div>
                      <p className="text-sm text-stone-500">
                        Click any button to open the file browser and select files from your device.
                      </p>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="File Input with Label">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Upload Resume
                        </label>
                        <div className="flex items-center space-x-3">
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>
                          <span className="text-sm text-stone-500">No file chosen</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Accepted formats: PDF, DOC, DOCX (Max: 5MB)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Profile Picture
                        </label>
                        <div className="flex items-center space-x-3">
                          <Button variant="outline" size="sm">
                            <Image className="w-4 h-4 mr-2" />
                            Select Image
                          </Button>
                          <span className="text-sm text-green-600">profile-photo.jpg selected</span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Accepted formats: JPG, PNG, WEBP (Max: 2MB)
                        </p>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Button } from './components/ui/button';
import { Upload, File, PlusCircle } from 'lucide-react';

// Basic upload button
<Button className="bg-brown-600 hover:bg-brown-700">
  <Upload className="w-4 h-4 mr-2" />
  Upload File
</Button>

// File input with label
<div>
  <label className="block text-sm font-medium text-stone-700 mb-2">
    Upload Resume
  </label>
  <div className="flex items-center space-x-3">
    <Button variant="outline" size="sm">
      <Upload className="w-4 h-4 mr-2" />
      Choose File
    </Button>
    <span className="text-sm text-stone-500">No file chosen</span>
  </div>
  <p className="text-xs text-stone-500 mt-1">
    Accepted formats: PDF, DOC, DOCX (Max: 5MB)
  </p>
</div>`}
                      language="tsx"
                      id="basic-upload"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Drag & Drop Section */}
              <section id="drag-drop" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Drag & Drop Upload</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Interactive drag and drop zones for intuitive file uploading.</p>
                  </div>

                  <PreviewCard title="Basic Drag & Drop Zone">
                    <div className="space-y-6">
                      <div className="p-8 border-2 border-dashed border-brown-200 rounded-lg text-center hover:border-brown-300 hover:bg-brown-50/50 transition-all cursor-pointer">
                        <CloudUpload className="w-12 h-12 text-brown-400 mx-auto mb-4" />
                        <p className="font-medium text-stone-900 mb-2">Drag files here to upload</p>
                        <p className="text-sm text-stone-500 mb-4">or click to browse files</p>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Files
                        </Button>
                        <p className="text-xs text-stone-500 mt-3">
                          Supports PDF, DOC, JPG, PNG files up to 10MB
                        </p>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Compact Drag Zone">
                    <div className="p-4 border-2 border-dashed border-stone-300 rounded-lg text-center hover:border-brown-300 hover:bg-stone-50 transition-all cursor-pointer">
                      <div className="flex items-center justify-center space-x-2">
                        <CloudUpload className="w-5 h-5 text-stone-400" />
                        <span className="text-sm text-stone-600">Drop files here or</span>
                        <button className="text-sm text-brown-600 underline hover:no-underline">
                          browse
                        </button>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Active Drop State">
                    <div className="p-8 border-2 border-dashed border-brown-400 bg-brown-50 rounded-lg text-center">
                      <CloudUpload className="w-12 h-12 text-brown-600 mx-auto mb-4" />
                      <p className="font-medium text-brown-800 mb-2">Drop files to upload</p>
                      <p className="text-sm text-brown-600">Release to start uploading</p>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { CloudUpload, Upload } from 'lucide-react';
import { Button } from './components/ui/button';

// Drag & drop zone
<div className="p-8 border-2 border-dashed border-brown-200 rounded-lg text-center hover:border-brown-300 hover:bg-brown-50/50 transition-all cursor-pointer">
  <CloudUpload className="w-12 h-12 text-brown-400 mx-auto mb-4" />
  <p className="font-medium text-stone-900 mb-2">Drag files here to upload</p>
  <p className="text-sm text-stone-500 mb-4">or click to browse files</p>
  <Button variant="outline" size="sm">
    <Upload className="w-4 h-4 mr-2" />
    Choose Files
  </Button>
  <p className="text-xs text-stone-500 mt-3">
    Supports PDF, DOC, JPG, PNG files up to 10MB
  </p>
</div>

// Active drop state
<div className="p-8 border-2 border-dashed border-brown-400 bg-brown-50 rounded-lg text-center">
  <CloudUpload className="w-12 h-12 text-brown-600 mx-auto mb-4" />
  <p className="font-medium text-brown-800 mb-2">Drop files to upload</p>
  <p className="text-sm text-brown-600">Release to start uploading</p>
</div>`}
                      language="tsx"
                      id="drag-drop-upload"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Multiple Files Section */}
              <section id="multiple" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Multiple File Upload</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Upload multiple files with individual management and batch operations.</p>
                  </div>

                  <PreviewCard title="File List with Actions">
                    <div className="space-y-4">
                      <div className="p-4 border-2 border-dashed border-stone-300 rounded-lg text-center">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setTimeout(() => simulateUpload('employee-contract.pdf'), 50);
                            setTimeout(() => simulateUpload('id-verification.jpg'), 100);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Files
                        </Button>
                      </div>
                      
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-stone-900">
                              Uploaded Files ({uploadedFiles.length})
                            </span>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Clear All
                            </Button>
                          </div>
                          {uploadedFiles.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileIcon fileName={file.name} />
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-stone-900">{file.name}</p>
                                  <p className="text-xs text-stone-500">{file.size}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {file.status === 'uploading' && uploadProgress[file.id] !== undefined && (
                                  <>
                                    <Progress value={uploadProgress[file.id]} className="w-20 h-2" />
                                    <span className="text-xs text-stone-500 w-8">{Math.round(uploadProgress[file.id])}%</span>
                                  </>
                                )}
                                {file.status === 'complete' && (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                                {file.status === 'error' && (
                                  <AlertCircle className="w-5 h-5 text-red-600" />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(file.id)}
                                  className="p-1 h-6 w-6 text-stone-400 hover:text-red-600"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Batch Upload Interface">
                    <div className="space-y-4">
                      <div className="p-6 border-2 border-dashed border-brown-200 rounded-lg text-center">
                        <Folder className="w-10 h-10 text-brown-400 mx-auto mb-3" />
                        <p className="font-medium text-stone-900 mb-2">Upload Multiple Files</p>
                        <p className="text-sm text-stone-500 mb-4">Drag & drop multiple files or folders here</p>
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Browse Files
                          </Button>
                          <Button variant="outline" size="sm">
                            <Folder className="w-4 h-4 mr-2" />
                            Browse Folder
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-stone-50 rounded-lg">
                          <p className="font-semibold text-lg text-stone-900">0</p>
                          <p className="text-sm text-stone-500">Files Selected</p>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-lg">
                          <p className="font-semibold text-lg text-stone-900">0 MB</p>
                          <p className="text-sm text-stone-500">Total Size</p>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Plus, X, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';

// File list with individual actions
<div className="space-y-2">
  {files.map((file) => (
    <div key={file.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <FileIcon fileName={file.name} />
        <div className="flex-1">
          <p className="font-medium text-sm text-stone-900">{file.name}</p>
          <p className="text-xs text-stone-500">{file.size}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {file.status === 'uploading' && (
          <>
            <Progress value={file.progress} className="w-20 h-2" />
            <span className="text-xs text-stone-500">{file.progress}%</span>
          </>
        )}
        {file.status === 'complete' && (
          <CheckCircle className="w-5 h-5 text-green-600" />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeFile(file.id)}
          className="p-1 h-6 w-6 text-stone-400 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  ))}
</div>`}
                      language="tsx"
                      id="multiple-upload"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Progress Indicators Section */}
              <section id="progress" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Progress Indicators</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Visual feedback for upload progress with different states and styles.</p>
                  </div>

                  <PreviewCard title="Progress Bar Variations">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-stone-700">Uploading resume.pdf</span>
                          <span className="text-sm text-stone-500">45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                        <p className="text-xs text-stone-500">2.3 MB of 5.1 MB • 30 seconds remaining</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-stone-700">Processing contract.pdf</span>
                          <span className="text-sm text-stone-500">100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <p className="text-xs text-green-600">Upload complete</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-stone-700">Failed: invalid-file.exe</span>
                          <span className="text-sm text-red-500">Error</span>
                        </div>
                        <Progress value={25} className="h-2 [&>div]:bg-red-500" />
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <p className="text-xs text-red-600">File type not supported</p>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Circular Progress">
                    <div className="flex items-center justify-center space-x-8">
                      <div className="text-center">
                        <div className="relative w-16 h-16 mb-2">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-stone-200" />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeDasharray="175.929"
                              strokeDashoffset="70.372"
                              className="text-brown-600"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-stone-900">60%</span>
                        </div>
                        <p className="text-xs text-stone-500">Uploading</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="relative w-16 h-16 mb-2">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-stone-200" />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeDasharray="175.929"
                              strokeDashoffset="0"
                              className="text-green-600"
                              strokeLinecap="round"
                            />
                          </svg>
                          <CheckCircle className="absolute inset-0 m-auto w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-xs text-stone-500">Complete</p>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Progress } from './components/ui/progress';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Progress bar with status
<div className="space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-stone-700">
      Uploading resume.pdf
    </span>
    <span className="text-sm text-stone-500">45%</span>
  </div>
  <Progress value={45} className="h-2" />
  <p className="text-xs text-stone-500">
    2.3 MB of 5.1 MB • 30 seconds remaining
  </p>
</div>

// Completed upload
<div className="space-y-3">
  <Progress value={100} className="h-2" />
  <div className="flex items-center space-x-1">
    <CheckCircle className="w-4 h-4 text-green-600" />
    <p className="text-xs text-green-600">Upload complete</p>
  </div>
</div>

// Error state
<div className="space-y-3">
  <Progress value={25} className="h-2 [&>div]:bg-red-500" />
  <div className="flex items-center space-x-1">
    <AlertCircle className="w-4 h-4 text-red-600" />
    <p className="text-xs text-red-600">File type not supported</p>
  </div>
</div>`}
                      language="tsx"
                      id="progress-indicators"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* File Restrictions Section */}
              <section id="restrictions" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>File Restrictions & Validation</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Implement file type, size, and security validation with clear user feedback.</p>
                  </div>

                  <PreviewCard title="File Type Restrictions">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Document Upload (PDF only)
                          </label>
                          <div className="p-4 border-2 border-dashed border-stone-300 rounded-lg text-center">
                            <FileText className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Choose PDF File
                            </Button>
                            <p className="text-xs text-stone-500 mt-2">
                              Only PDF files are accepted (Max: 10MB)
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Image Upload (Images only)
                          </label>
                          <div className="p-4 border-2 border-dashed border-stone-300 rounded-lg text-center">
                            <Image className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Choose Image
                            </Button>
                            <p className="text-xs text-stone-500 mt-2">
                              JPG, PNG, WEBP, SVG (Max: 5MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Validation Errors">
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-red-800">File Upload Failed</h4>
                            <ul className="mt-2 space-y-1 text-sm text-red-700">
                              <li>• malware.exe - File type not supported</li>
                              <li>• huge-file.pdf - File exceeds 10MB limit</li>
                              <li>• empty-file.txt - File is empty</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-yellow-800">File Size Warning</h4>
                            <p className="mt-1 text-sm text-yellow-700">
                              presentation.pptx (45MB) is larger than recommended. Consider compressing the file for faster upload.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Security Scanning">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm text-stone-900">contract.pdf</p>
                            <p className="text-xs text-stone-500">3.2 MB</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600">Scan complete</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <File className="w-5 h-5 text-stone-400" />
                          <div>
                            <p className="font-medium text-sm text-stone-900">suspicious.doc</p>
                            <p className="text-xs text-stone-500">1.8 MB</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-blue-600">Scanning...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { AlertCircle, Shield } from 'lucide-react';

// File type restriction
<div className="p-4 border-2 border-dashed border-stone-300 rounded-lg text-center">
  <FileText className="w-8 h-8 text-stone-400 mx-auto mb-2" />
  <Button variant="outline" size="sm">
    <Upload className="w-4 h-4 mr-2" />
    Choose PDF File
  </Button>
  <p className="text-xs text-stone-500 mt-2">
    Only PDF files are accepted (Max: 10MB)
  </p>
</div>

// Validation error display
<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
  <div className="flex items-start space-x-3">
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <h4 className="font-medium text-red-800">File Upload Failed</h4>
      <ul className="mt-2 space-y-1 text-sm text-red-700">
        <li>• malware.exe - File type not supported</li>
        <li>• huge-file.pdf - File exceeds 10MB limit</li>
      </ul>
    </div>
  </div>
</div>`}
                      language="tsx"
                      id="file-restrictions"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* HR Examples Section */}
              <section id="hr-examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>HR-Specific Examples</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>File upload components tailored for HR workflows and employee document management.</p>
                  </div>

                  <PreviewCard title="Employee Onboarding Documents">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-stone-900 mb-4">Required Documents Checklist</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium text-sm text-stone-900">Resume / CV</p>
                                <p className="text-xs text-stone-500">resume-john-doe.pdf uploaded</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium text-sm text-stone-900">Photo ID</p>
                                <p className="text-xs text-stone-500">drivers-license.jpg uploaded</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border-2 border-dashed border-orange-200 bg-orange-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5 text-orange-600" />
                              <div>
                                <p className="font-medium text-sm text-stone-900">Background Check</p>
                                <p className="text-xs text-orange-600">Pending upload</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border-2 border-dashed border-orange-200 bg-orange-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5 text-orange-600" />
                              <div>
                                <p className="font-medium text-sm text-stone-900">Tax Forms (W-4)</p>
                                <p className="text-xs text-orange-600">Required for payroll setup</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Performance Review Documents">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-stone-900">Q4 2024 Performance Review</h4>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">In Progress</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="p-4 border border-stone-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-medium text-sm">Self-Assessment Form</p>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download Template
                            </Button>
                          </div>
                          <div className="p-3 border-2 border-dashed border-stone-300 rounded text-center">
                            <Button variant="ghost" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Completed Form
                            </Button>
                            <p className="text-xs text-stone-500 mt-1">PDF or DOC format</p>
                          </div>
                        </div>
                        
                        <div className="p-4 border border-stone-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <p className="font-medium text-sm">Goal Achievement Evidence</p>
                            <span className="text-xs text-stone-500">Optional</span>
                          </div>
                          <div className="p-3 border-2 border-dashed border-stone-300 rounded text-center">
                            <Button variant="ghost" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Add Supporting Documents
                            </Button>
                            <p className="text-xs text-stone-500 mt-1">Screenshots, reports, certificates</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Expense Report Submission">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-stone-900">Business Trip - March 2024</h4>
                        <Badge variant="outline" className="border-orange-200 text-orange-700">
                          Draft
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-stone-50 rounded-lg text-center">
                          <p className="font-semibold text-lg text-stone-900">$1,247.83</p>
                          <p className="text-sm text-stone-500">Total Expenses</p>
                        </div>
                        <div className="p-4 bg-stone-50 rounded-lg text-center">
                          <p className="font-semibold text-lg text-stone-900">8</p>
                          <p className="text-sm text-stone-500">Receipts</p>
                        </div>
                      </div>
                      
                      <div className="p-6 border-2 border-dashed border-stone-300 rounded-lg text-center">
                        <Image className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                        <p className="font-medium text-stone-900 mb-2">Add Receipt</p>
                        <p className="text-sm text-stone-500 mb-4">Photo or scan of expense receipt</p>
                        <div className="flex items-center justify-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                          <Button variant="outline" size="sm">
                            <div className="w-4 h-4 mr-2 rounded bg-stone-300"></div>
                            Take Photo
                          </Button>
                        </div>
                        <p className="text-xs text-stone-500 mt-3">
                          JPG, PNG, PDF accepted (Max: 5MB per file)
                        </p>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { CheckCircle, Clock, Upload, Eye, Download } from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

// Document checklist for onboarding
<div className="space-y-3">
  <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <CheckCircle className="w-5 h-5 text-green-600" />
      <div>
        <p className="font-medium text-sm text-stone-900">Resume / CV</p>
        <p className="text-xs text-stone-500">resume-john-doe.pdf uploaded</p>
      </div>
    </div>
    <Button variant="ghost" size="sm">
      <Eye className="w-4 h-4 mr-1" />
      View
    </Button>
  </div>
  
  <div className="flex items-center justify-between p-4 border-2 border-dashed border-orange-200 bg-orange-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <Clock className="w-5 h-5 text-orange-600" />
      <div>
        <p className="font-medium text-sm text-stone-900">Background Check</p>
        <p className="text-xs text-orange-600">Pending upload</p>
      </div>
    </div>
    <Button variant="outline" size="sm">
      <Upload className="w-4 h-4 mr-2" />
      Upload
    </Button>
  </div>
</div>`}
                      language="tsx"
                      id="hr-examples"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Best Practices Section */}
              <section id="best-practices" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Best Practices</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for implementing effective and user-friendly file upload experiences.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900">Clear File Requirements</h4>
                            <p className="text-sm text-stone-600 mt-1">
                              Always specify supported file types, maximum file size, and any other restrictions upfront.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900">Progress Feedback</h4>
                            <p className="text-sm text-stone-600 mt-1">
                              Provide real-time upload progress with time remaining and clear success/error states.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900">Drag & Drop Support</h4>
                            <p className="text-sm text-stone-600 mt-1">
                              Implement drag and drop for better user experience while maintaining traditional file selection.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900">Error Recovery</h4>
                            <p className="text-sm text-stone-600 mt-1">
                              Allow users to retry failed uploads and provide actionable error messages.
                            </p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900">Hidden File Restrictions</h4>
                            <p className="text-sm text-stone-600 mt-1">
                              Don't hide file type or size limitations until after the user attempts to upload.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900">Blocking Interface</h4>
                            <p className="text-sm text-stone-600 mt-1">
                              Avoid blocking the entire interface during uploads. Allow users to continue working.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900">Generic Error Messages</h4>
                            <p className="text-sm text-stone-600 mt-1">
                              Avoid vague errors like "Upload failed". Provide specific, actionable feedback.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-3 h-3 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900">No Upload Cancellation</h4>
                            <p className="text-sm text-stone-600 mt-1">
                              Always provide a way to cancel ongoing uploads, especially for large files.
                            </p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Accessibility Considerations">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium text-stone-900">Screen Reader Support</h4>
                          <ul className="text-sm text-stone-600 space-y-1">
                            <li>• Use proper ARIA labels and descriptions</li>
                            <li>• Announce upload progress and status changes</li>
                            <li>• Provide alternative text for visual indicators</li>
                            <li>• Use semantic HTML elements</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-medium text-stone-900">Keyboard Navigation</h4>
                          <ul className="text-sm text-stone-600 space-y-1">
                            <li>• Ensure all upload controls are keyboard accessible</li>
                            <li>• Provide keyboard shortcuts for common actions</li>
                            <li>• Clear focus indicators for all interactive elements</li>
                            <li>• Logical tab order through upload interface</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Implementation Section */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation Guide</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Complete implementation examples and integration patterns for file upload components.</p>
                  </div>

                  <PreviewCard title="React Implementation">
                    <CodeBlock
                      code={`import { useState, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFilesUpload?: (files: File[]) => void;
}

export function FileUpload({ 
  accept = "image/*,application/pdf", 
  multiple = false, 
  maxSize = 10,
  onFilesUpload 
}: FileUploadProps) {
  const [files, setFiles] = useState<Array<{
    file: File;
    id: string;
    progress: number;
    status: 'uploading' | 'complete' | 'error';
    error?: string;
  }>>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const validateFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      return \`File size exceeds \${maxSize}MB limit\`;
    }
    return null;
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const validFiles = Array.from(fileList).map(file => {
      const error = validateFile(file);
      return {
        file,
        id: \`file-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
        progress: 0,
        status: error ? 'error' as const : 'uploading' as const,
        error
      };
    });

    setFiles(prev => [...prev, ...validFiles]);
    
    // Simulate upload for valid files
    validFiles.forEach(fileData => {
      if (fileData.status === 'uploading') {
        simulateUpload(fileData.id);
      }
    });

    if (onFilesUpload) {
      onFilesUpload(validFiles.map(f => f.file));
    }
  }, [maxSize, onFilesUpload]);

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === fileId && f.status === 'uploading') {
          const newProgress = f.progress + Math.random() * 15;
          if (newProgress >= 100) {
            clearInterval(interval);
            return { ...f, progress: 100, status: 'complete' };
          }
          return { ...f, progress: newProgress };
        }
        return f;
      }));
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  return (
    <div className="space-y-4">
      <div
        className={\`p-8 border-2 border-dashed rounded-lg text-center transition-all cursor-pointer \${
          isDragActive 
            ? 'border-brown-400 bg-brown-50' 
            : 'border-brown-200 hover:border-brown-300 hover:bg-brown-50/50'
        }\`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <Upload className={\`w-12 h-12 mx-auto mb-4 \${isDragActive ? 'text-brown-600' : 'text-brown-400'}\`} />
        <p className="font-medium text-stone-900 mb-2">
          {isDragActive ? 'Drop files to upload' : 'Drag files here to upload'}
        </p>
        <p className="text-sm text-stone-500 mb-4">or click to browse files</p>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </Button>
        <input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileData) => (
            <div key={fileData.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-1">
                  <p className="font-medium text-sm text-stone-900">{fileData.file.name}</p>
                  <p className="text-xs text-stone-500">
                    {(fileData.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  {fileData.error && (
                    <p className="text-xs text-red-600">{fileData.error}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {fileData.status === 'uploading' && (
                  <>
                    <Progress value={fileData.progress} className="w-20 h-2" />
                    <span className="text-xs text-stone-500 w-8">
                      {Math.round(fileData.progress)}%
                    </span>
                  </>
                )}
                {fileData.status === 'complete' && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {fileData.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileData.id)}
                  className="p-1 h-6 w-6 text-stone-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`}
                      language="tsx"
                      id="react-implementation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Usage Examples">
                    <CodeBlock
                      code={`import { FileUpload } from './components/FileUpload';

// Basic usage
<FileUpload 
  onFilesUpload={(files) => console.log('Files uploaded:', files)}
/>

// Image upload only
<FileUpload 
  accept="image/*"
  maxSize={5}
  onFilesUpload={handleImageUpload}
/>

// Multiple document upload
<FileUpload 
  accept=".pdf,.doc,.docx"
  multiple={true}
  maxSize={10}
  onFilesUpload={handleDocumentUpload}
/>

// Custom validation and handling
function DocumentUpload() {
  const handleUpload = useCallback(async (files: File[]) => {
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const result = await response.json();
        console.log('Upload successful:', result);
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  }, []);
  
  return (
    <FileUpload 
      accept=".pdf,.doc,.docx"
      multiple={true}
      maxSize={10}
      onFilesUpload={handleUpload}
    />
  );
}`}
                      language="tsx"
                      id="usage-examples"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
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