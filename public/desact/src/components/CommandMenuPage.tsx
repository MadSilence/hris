import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Menu, Terminal, Command as CommandIcon, Users, Settings, FileText, Calendar, Mail, Home, Folder, Star, BookOpen, Hash, Zap, User, Shield, Bell, Palette, Database, Code, Plus, Edit, Trash2, Eye, Download, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './ui/command';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';

interface CommandMenuPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const CommandMenuPage: React.FC<CommandMenuPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Command menu states
  const [basicOpen, setBasicOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [usersOpen, setUsersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [sidebarPage, setSidebarPage] = useState('home');

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



  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'basic-command', 'sidebar-command', 'actions-command', 'users-command', 'settings-command', 'files-command', 'recent-command', 'projects-command', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: CommandIcon },
    { id: 'basic-command', label: 'Basic Command', icon: Terminal },
    { id: 'sidebar-command', label: 'Sidebar Command', icon: Menu },
    { id: 'actions-command', label: 'Actions Command', icon: Zap },
    { id: 'users-command', label: 'Users Command', icon: Users },
    { id: 'settings-command', label: 'Settings Command', icon: Settings },
    { id: 'files-command', label: 'Files Command', icon: FileText },
    { id: 'recent-command', label: 'Recent Command', icon: Star },
    { id: 'projects-command', label: 'Projects Command', icon: Folder },
    { id: 'implementation', label: 'Implementation', icon: Hash },
  ];



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

  // Sample data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: '👤' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', avatar: '👩' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', avatar: '👨' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Editor', avatar: '👩‍💼' },
    { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'Admin', avatar: '👨‍💻' },
  ];

  const projects = [
    { id: 1, name: 'Marketing Website', status: 'Active', icon: '🌐' },
    { id: 2, name: 'Mobile App', status: 'In Progress', icon: '📱' },
    { id: 3, name: 'API Documentation', status: 'Completed', icon: '📚' },
    { id: 4, name: 'Design System', status: 'Active', icon: '🎨' },
  ];

  const files = [
    { id: 1, name: 'Project Proposal.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago', icon: '📄' },
    { id: 2, name: 'Design Mockups.figma', type: 'Figma', size: '15.2 MB', modified: '1 day ago', icon: '🎨' },
    { id: 3, name: 'Meeting Notes.md', type: 'Markdown', size: '1.2 KB', modified: '3 hours ago', icon: '📝' },
    { id: 4, name: 'Budget Analysis.xlsx', type: 'Excel', size: '856 KB', modified: '1 week ago', icon: '📊' },
    { id: 5, name: 'Team Photo.jpg', type: 'Image', size: '3.8 MB', modified: '2 days ago', icon: '📸' },
  ];

  const recentItems = [
    { id: 1, name: 'Dashboard Analytics', type: 'View', action: 'Opened', time: '5 minutes ago', icon: '📊' },
    { id: 2, name: 'User Settings', type: 'Edit', action: 'Modified', time: '15 minutes ago', icon: '⚙️' },
    { id: 3, name: 'Team Meeting', type: 'Event', action: 'Attended', time: '1 hour ago', icon: '👥' },
    { id: 4, name: 'Project Alpha', type: 'Project', action: 'Created', time: '2 hours ago', icon: '🚀' },
    { id: 5, name: 'Design Review', type: 'Document', action: 'Reviewed', time: '3 hours ago', icon: '✅' },
  ];

  const projectsList = [
    { id: 1, name: 'E-commerce Platform', members: 8, progress: 75, status: 'On Track', icon: '🛒' },
    { id: 2, name: 'Mobile Banking App', members: 12, progress: 60, status: 'In Progress', icon: '💳' },
    { id: 3, name: 'AI Analytics Tool', members: 6, progress: 90, status: 'Nearly Done', icon: '🤖' },
    { id: 4, name: 'Customer Portal', members: 4, progress: 30, status: 'Starting', icon: '🏢' },
    { id: 5, name: 'Integration API', members: 3, progress: 85, status: 'Testing', icon: '🔗' },
  ];

  return (
    <div className="min-h-screen bg-brown-50/30 flex">
      {/* Main Sidebar */}
      <MainSidebar
        onBack={onBack}
        components={components}
        onComponentClick={onComponentClick}
        currentComponent={currentComponent}
        sidebarSearchTerm={sidebarSearchTerm}
        setSidebarSearchTerm={setSidebarSearchTerm}
        collapsedCategories={collapsedCategories}
        setCollapsedCategories={setCollapsedCategories}
        sidebarInputRef={sidebarInputRef}
        handleSidebarKeyDown={handleSidebarKeyDown}
      />

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
                  <h1 className="text-xl font-semibold">Command Menu</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Interactive command menu components with search and navigation
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
                      Command Menu Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      A comprehensive collection of command menu components for keyboard-first navigation and quick actions. 
                      Built with shadcn/ui Command component, featuring search, keyboard shortcuts, contextual navigation, 
                      and advanced data management patterns.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <CommandIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">8 Command Types</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Navigation, actions, users, settings, files, recent activity, and project management.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Terminal className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Keyboard First</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Full keyboard navigation with shortcuts, arrow keys, and instant search.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Quick Actions</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Contextual actions, user management, and settings access with shortcuts.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Installation">
                    <CodeBlock
                      code={`# Command component is already included in shadcn/ui
# Import from your ui components directory
import { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from './ui/command'`}
                      language="bash"
                      id="installation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Basic Command */}
              <section id="basic-command" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Basic Command Menu</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Simple command menu with search and navigation items</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col gap-6">
                      <div className="flex-shrink-0">
                        <Button 
                          variant="outline" 
                          onClick={() => setBasicOpen(true)}
                          className="gap-3"
                        >
                          <CommandIcon className="w-4 h-4" />
                          Open Command Menu
                          <CommandShortcut>⌘K</CommandShortcut>
                        </Button>
                      </div>
                      
                      <Dialog open={basicOpen} onOpenChange={setBasicOpen}>
                        <DialogContent className="overflow-hidden p-0 shadow-lg">
                          <DialogTitle className="sr-only">Basic Command Menu</DialogTitle>
                          <DialogDescription className="sr-only">Search and navigate through basic commands</DialogDescription>
                          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                            <CommandInput placeholder="Type a command or search..." />
                            <CommandList>
                              <CommandEmpty>No results found.</CommandEmpty>
                              <CommandGroup heading="Navigation">
                                <CommandItem>
                                  <Home className="mr-2 h-4 w-4" />
                                  <span>Dashboard</span>
                                  <CommandShortcut>⌘D</CommandShortcut>
                                </CommandItem>
                                <CommandItem>
                                  <Users className="mr-2 h-4 w-4" />
                                  <span>Team</span>
                                  <CommandShortcut>⌘T</CommandShortcut>
                                </CommandItem>
                                <CommandItem>
                                  <Folder className="mr-2 h-4 w-4" />
                                  <span>Projects</span>
                                  <CommandShortcut>⌘P</CommandShortcut>
                                </CommandItem>
                                <CommandItem>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  <span>Calendar</span>
                                  <CommandShortcut>⌘C</CommandShortcut>
                                </CommandItem>
                              </CommandGroup>
                              <CommandSeparator />
                              <CommandGroup heading="Actions">
                                <CommandItem>
                                  <Plus className="mr-2 h-4 w-4" />
                                  <span>Create New</span>
                                  <CommandShortcut>⌘N</CommandShortcut>
                                </CommandItem>
                                <CommandItem>
                                  <Search className="mr-2 h-4 w-4" />
                                  <span>Search Everything</span>
                                  <CommandShortcut>⌘/</CommandShortcut>
                                </CommandItem>
                                <CommandItem>
                                  <Settings className="mr-2 h-4 w-4" />
                                  <span>Settings</span>
                                  <CommandShortcut>⌘,</CommandShortcut>
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </DialogContent>
                      </Dialog>

                      <div className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        <p><strong>Features:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Instant search with fuzzy matching</li>
                          <li>Keyboard navigation with arrow keys</li>
                          <li>Grouped items with separators</li>
                          <li>Keyboard shortcuts display</li>
                          <li>Empty state handling</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './ui/command';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { Home, Users, Folder, Calendar, Plus, Search, Settings } from 'lucide-react';

function BasicCommandMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Open Command Menu
        <CommandShortcut>⌘K</CommandShortcut>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              
              <CommandGroup heading="Navigation">
                <CommandItem>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                  <CommandShortcut>⌘D</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Team</span>
                  <CommandShortcut>⌘T</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Folder className="mr-2 h-4 w-4" />
                  <span>Projects</span>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Actions">
                <CommandItem>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Create New</span>
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <CommandShortcut>⌘,</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}`}
                      language="tsx"
                      id="basic-command-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Sidebar Command */}
              <section id="sidebar-command" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Sidebar Command Menu</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Command menu with sidebar navigation and contextual content</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col gap-6">
                      <div className="flex-shrink-0">
                        <Button 
                          variant="outline" 
                          onClick={() => setSidebarOpen(true)}
                          className="gap-3"
                        >
                          <Menu className="w-4 h-4" />
                          Open Sidebar Command
                          <CommandShortcut>⌘⇧P</CommandShortcut>
                        </Button>
                      </div>
                      
                      <Dialog open={sidebarOpen} onOpenChange={setSidebarOpen}>
                        <DialogContent className="overflow-hidden p-0 shadow-lg max-w-4xl h-[600px]">
                          <DialogTitle className="sr-only">Sidebar Command Menu</DialogTitle>
                          <DialogDescription className="sr-only">Navigate through different sections and search contextually</DialogDescription>
                          <div className="flex h-full">
                            {/* Sidebar */}
                            <div className="w-48 border-r bg-muted/20 p-2">
                              <div className="space-y-1">
                                <button
                                  onClick={() => setSidebarPage('home')}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                    sidebarPage === 'home' ? 'bg-accent' : 'hover:bg-accent/50'
                                  }`}
                                >
                                  <Home className="w-4 h-4 inline mr-2" />
                                  Home
                                </button>
                                <button
                                  onClick={() => setSidebarPage('projects')}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                    sidebarPage === 'projects' ? 'bg-accent' : 'hover:bg-accent/50'
                                  }`}
                                >
                                  <Folder className="w-4 h-4 inline mr-2" />
                                  Projects
                                </button>
                                <button
                                  onClick={() => setSidebarPage('team')}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                    sidebarPage === 'team' ? 'bg-accent' : 'hover:bg-accent/50'
                                  }`}
                                >
                                  <Users className="w-4 h-4 inline mr-2" />
                                  Team
                                </button>
                                <button
                                  onClick={() => setSidebarPage('settings')}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                    sidebarPage === 'settings' ? 'bg-accent' : 'hover:bg-accent/50'
                                  }`}
                                >
                                  <Settings className="w-4 h-4 inline mr-2" />
                                  Settings
                                </button>
                              </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1">
                              <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                                <CommandInput placeholder={`Search ${sidebarPage}...`} />
                                <CommandList>
                                  <CommandEmpty>No results found.</CommandEmpty>
                                  
                                  {sidebarPage === 'home' && (
                                    <>
                                      <CommandGroup heading="Recent">
                                        <CommandItem>
                                          <FileText className="mr-2 h-4 w-4" />
                                          <span>Last opened document</span>
                                        </CommandItem>
                                        <CommandItem>
                                          <Folder className="mr-2 h-4 w-4" />
                                          <span>Marketing Project</span>
                                        </CommandItem>
                                      </CommandGroup>
                                      <CommandGroup heading="Quick Actions">
                                        <CommandItem>
                                          <Plus className="mr-2 h-4 w-4" />
                                          <span>New Document</span>
                                        </CommandItem>
                                        <CommandItem>
                                          <Star className="mr-2 h-4 w-4" />
                                          <span>View Favorites</span>
                                        </CommandItem>
                                      </CommandGroup>
                                    </>
                                  )}
                                  
                                  {sidebarPage === 'projects' && (
                                    <CommandGroup heading="Projects">
                                      {projects.map((project) => (
                                        <CommandItem key={project.id}>
                                          <span className="mr-2">{project.icon}</span>
                                          <span>{project.name}</span>
                                          <span className="ml-auto text-xs text-muted-foreground">
                                            {project.status}
                                          </span>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  )}
                                  
                                  {sidebarPage === 'team' && (
                                    <CommandGroup heading="Team Members">
                                      {users.slice(0, 3).map((user) => (
                                        <CommandItem key={user.id}>
                                          <span className="mr-2">{user.avatar}</span>
                                          <span>{user.name}</span>
                                          <span className="ml-auto text-xs text-muted-foreground">
                                            {user.role}
                                          </span>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  )}
                                  
                                  {sidebarPage === 'settings' && (
                                    <>
                                      <CommandGroup heading="Preferences">
                                        <CommandItem>
                                          <User className="mr-2 h-4 w-4" />
                                          <span>Account Settings</span>
                                        </CommandItem>
                                        <CommandItem>
                                          <Bell className="mr-2 h-4 w-4" />
                                          <span>Notifications</span>
                                        </CommandItem>
                                        <CommandItem>
                                          <Palette className="mr-2 h-4 w-4" />
                                          <span>Appearance</span>
                                        </CommandItem>
                                      </CommandGroup>
                                      <CommandGroup heading="Advanced">
                                        <CommandItem>
                                          <Shield className="mr-2 h-4 w-4" />
                                          <span>Privacy & Security</span>
                                        </CommandItem>
                                        <CommandItem>
                                          <Database className="mr-2 h-4 w-4" />
                                          <span>Data Management</span>
                                        </CommandItem>
                                      </CommandGroup>
                                    </>
                                  )}
                                </CommandList>
                              </Command>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <div className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        <p><strong>Perfect For:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Complex applications with multiple sections</li>
                          <li>Contextual search based on current area</li>
                          <li>Navigation and content in one interface</li>
                          <li>Professional productivity tools</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { Home, Users, Folder, Settings, FileText, Plus, Star } from 'lucide-react';

function SidebarCommandMenu() {
  const [open, setOpen] = useState(false);
  const [sidebarPage, setSidebarPage] = useState('home');

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Open Sidebar Command
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 max-w-4xl h-[600px]">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-48 border-r bg-muted/20 p-2">
              <div className="space-y-1">
                <button
                  onClick={() => setSidebarPage('home')}
                  className={\`w-full text-left px-3 py-2 text-sm rounded-md \${
                    sidebarPage === 'home' ? 'bg-accent' : 'hover:bg-accent/50'
                  }\`}
                >
                  <Home className="w-4 h-4 inline mr-2" />
                  Home
                </button>
                <button
                  onClick={() => setSidebarPage('projects')}
                  className={\`w-full text-left px-3 py-2 text-sm rounded-md \${
                    sidebarPage === 'projects' ? 'bg-accent' : 'hover:bg-accent/50'
                  }\`}
                >
                  <Folder className="w-4 h-4 inline mr-2" />
                  Projects
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <Command>
                <CommandInput placeholder={\`Search \${sidebarPage}...\`} />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  
                  {sidebarPage === 'home' && (
                    <CommandGroup heading="Recent">
                      <CommandItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Last opened document</span>
                      </CommandItem>
                      <CommandItem>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>New Document</span>
                      </CommandItem>
                    </CommandGroup>
                  )}
                  
                  {sidebarPage === 'projects' && (
                    <CommandGroup heading="Projects">
                      <CommandItem>
                        <span className="mr-2">🌐</span>
                        <span>Marketing Website</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          Active
                        </span>
                      </CommandItem>
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}`}
                      language="tsx"
                      id="sidebar-command-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Actions Command */}
              <section id="actions-command" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Actions Command Menu</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Quick actions and commands with keyboard shortcuts</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col gap-6">
                      <div className="flex-shrink-0">
                        <Button 
                          variant="outline" 
                          onClick={() => setActionsOpen(true)}
                          className="gap-3"
                        >
                          <Zap className="w-4 h-4" />
                          Quick Actions
                          <CommandShortcut>⌘⇧A</CommandShortcut>
                        </Button>
                      </div>
                      
                      <Dialog open={actionsOpen} onOpenChange={setActionsOpen}>
                        <DialogContent className="overflow-hidden p-0 shadow-lg">
                          <DialogTitle className="sr-only">Actions Command Menu</DialogTitle>
                          <DialogDescription className="sr-only">Execute quick actions and commands</DialogDescription>
                          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                            <CommandInput placeholder="Type an action..." />
                            <CommandList>
                              <CommandEmpty>No actions found.</CommandEmpty>
                              
                              <CommandGroup heading="Create">
                                <CommandItem onSelect={() => alert('Creating new document...')}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  <span>New Document</span>
                                  <CommandShortcut>⌘N</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Creating new project...')}>
                                  <Folder className="mr-2 h-4 w-4" />
                                  <span>New Project</span>
                                  <CommandShortcut>⌘⇧N</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Creating new team...')}>
                                  <Users className="mr-2 h-4 w-4" />
                                  <span>New Team</span>
                                  <CommandShortcut>⌘⇧T</CommandShortcut>
                                </CommandItem>
                              </CommandGroup>
                              
                              <CommandSeparator />
                              
                              <CommandGroup heading="File Actions">
                                <CommandItem onSelect={() => alert('Opening file...')}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Open File</span>
                                  <CommandShortcut>⌘O</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Saving file...')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Save As...</span>
                                  <CommandShortcut>⌘⇧S</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Exporting...')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Export</span>
                                  <CommandShortcut>⌘E</CommandShortcut>
                                </CommandItem>
                              </CommandGroup>
                              
                              <CommandSeparator />
                              
                              <CommandGroup heading="Edit">
                                <CommandItem onSelect={() => alert('Copying...')}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  <span>Copy</span>
                                  <CommandShortcut>⌘C</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Editing...')}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                  <CommandShortcut>⌘⇧E</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Deleting...')}>
                                  <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                  <span className="text-red-500">Delete</span>
                                  <CommandShortcut>⌘⇧⌫</CommandShortcut>
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </DialogContent>
                      </Dialog>

                      <div className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        <p><strong>Features:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Executable actions with onSelect handlers</li>
                          <li>Color-coded destructive actions</li>
                          <li>Comprehensive keyboard shortcuts</li>
                          <li>Organized action categories</li>
                          <li>Visual feedback on execution</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './ui/command';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { Plus, Folder, Users, FileText, Download, Copy, Edit, Trash2 } from 'lucide-react';

function ActionsCommandMenu() {
  const [open, setOpen] = useState(false);

  const handleAction = (action: string) => {
    alert(\`Executing: \${action}\`);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Quick Actions
        <CommandShortcut>⌘⇧A</CommandShortcut>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <Command>
            <CommandInput placeholder="Type an action..." />
            <CommandList>
              <CommandEmpty>No actions found.</CommandEmpty>
              
              <CommandGroup heading="Create">
                <CommandItem onSelect={() => handleAction('New Document')}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New Document</span>
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleAction('New Project')}>
                  <Folder className="mr-2 h-4 w-4" />
                  <span>New Project</span>
                  <CommandShortcut>⌘⇧N</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="File Actions">
                <CommandItem onSelect={() => handleAction('Open File')}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Open File</span>
                  <CommandShortcut>⌘O</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleAction('Export')}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export</span>
                  <CommandShortcut>⌘E</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Edit">
                <CommandItem onSelect={() => handleAction('Copy')}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy</span>
                  <CommandShortcut>⌘C</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleAction('Delete')}>
                  <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-500">Delete</span>
                  <CommandShortcut>⌘⇧⌫</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}`}
                      language="tsx"
                      id="actions-command-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Users Command */}
              <section id="users-command" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Users Command Menu</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Search and manage users with detailed information</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col gap-6">
                      <div className="flex-shrink-0">
                        <Button 
                          variant="outline" 
                          onClick={() => setUsersOpen(true)}
                          className="gap-3"
                        >
                          <Users className="w-4 h-4" />
                          Search Users
                          <CommandShortcut>⌘U</CommandShortcut>
                        </Button>
                      </div>
                      
                      <Dialog open={usersOpen} onOpenChange={setUsersOpen}>
                        <DialogContent className="overflow-hidden p-0 shadow-lg">
                          <DialogTitle className="sr-only">Users Command Menu</DialogTitle>
                          <DialogDescription className="sr-only">Search and manage users by name, email, or role</DialogDescription>
                          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                            <CommandInput placeholder="Search users by name, email, or role..." />
                            <CommandList>
                              <CommandEmpty>No users found.</CommandEmpty>
                              
                              <CommandGroup heading="Administrators">
                                {users.filter(user => user.role === 'Admin').map((user) => (
                                  <CommandItem key={user.id} onSelect={() => alert(`Selected user: ${user.name}`)}>
                                    <span className="mr-3 text-lg">{user.avatar}</span>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{user.name}</span>
                                      <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                      <Badge variant="destructive" className="text-xs">
                                        {user.role}
                                      </Badge>
                                      <CommandShortcut>↵</CommandShortcut>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              
                              <CommandGroup heading="Editors">
                                {users.filter(user => user.role === 'Editor').map((user) => (
                                  <CommandItem key={user.id} onSelect={() => alert(`Selected user: ${user.name}`)}>
                                    <span className="mr-3 text-lg">{user.avatar}</span>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{user.name}</span>
                                      <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {user.role}
                                      </Badge>
                                      <CommandShortcut>↵</CommandShortcut>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              
                              <CommandGroup heading="Viewers">
                                {users.filter(user => user.role === 'Viewer').map((user) => (
                                  <CommandItem key={user.id} onSelect={() => alert(`Selected user: ${user.name}`)}>
                                    <span className="mr-3 text-lg">{user.avatar}</span>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{user.name}</span>
                                      <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {user.role}
                                      </Badge>
                                      <CommandShortcut>↵</CommandShortcut>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              
                              <CommandSeparator />
                              
                              <CommandGroup heading="Actions">
                                <CommandItem onSelect={() => alert('Inviting new user...')}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  <span>Invite New User</span>
                                  <CommandShortcut>⌘I</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Managing team...')}>
                                  <Settings className="mr-2 h-4 w-4" />
                                  <span>Manage Team</span>
                                  <CommandShortcut>⌘M</CommandShortcut>
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </DialogContent>
                      </Dialog>

                      <div className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        <p><strong>Features:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Search by name, email, or role</li>
                          <li>Grouped by user permissions</li>
                          <li>Rich user information display</li>
                          <li>Role-based badge styling</li>
                          <li>Team management actions</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './ui/command';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent } from './ui/dialog';
import { Users, Plus, Settings } from 'lucide-react';

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: '👤' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', avatar: '👩' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', avatar: '👨' },
];

function UsersCommandMenu() {
  const [open, setOpen] = useState(false);

  const handleUserSelect = (user: typeof users[0]) => {
    alert(\`Selected user: \${user.name}\`);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Search Users
        <CommandShortcut>⌘U</CommandShortcut>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <Command>
            <CommandInput placeholder="Search users by name, email, or role..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              
              <CommandGroup heading="Administrators">
                {users.filter(user => user.role === 'Admin').map((user) => (
                  <CommandItem key={user.id} onSelect={() => handleUserSelect(user)}>
                    <span className="mr-3 text-lg">{user.avatar}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        {user.role}
                      </Badge>
                      <CommandShortcut>↵</CommandShortcut>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Actions">
                <CommandItem onSelect={() => alert('Inviting new user...')}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Invite New User</span>
                  <CommandShortcut>⌘I</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}`}
                      language="tsx"
                      id="users-command-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Settings Command */}
              <section id="settings-command" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Settings Command Menu</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Quick access to application settings and preferences</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col gap-6">
                      <div className="flex-shrink-0">
                        <Button 
                          variant="outline" 
                          onClick={() => setSettingsOpen(true)}
                          className="gap-3"
                        >
                          <Settings className="w-4 h-4" />
                          Settings & Preferences
                          <CommandShortcut>⌘,</CommandShortcut>
                        </Button>
                      </div>
                      
                      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                        <DialogContent className="overflow-hidden p-0 shadow-lg">
                          <DialogTitle className="sr-only">Settings Command Menu</DialogTitle>
                          <DialogDescription className="sr-only">Access application settings and preferences</DialogDescription>
                          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                            <CommandInput placeholder="Search settings..." />
                            <CommandList>
                              <CommandEmpty>No settings found.</CommandEmpty>
                              
                              <CommandGroup heading="Account">
                                <CommandItem onSelect={() => alert('Opening profile settings...')}>
                                  <User className="mr-2 h-4 w-4" />
                                  <span>Profile Settings</span>
                                  <CommandShortcut>⌘⇧P</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Opening account security...')}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  <span>Account Security</span>
                                  <CommandShortcut>⌘⇧S</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Managing billing...')}>
                                  <Database className="mr-2 h-4 w-4" />
                                  <span>Billing & Usage</span>
                                </CommandItem>
                              </CommandGroup>
                              
                              <CommandSeparator />
                              
                              <CommandGroup heading="Preferences">
                                <CommandItem onSelect={() => alert('Changing theme...')}>
                                  <Palette className="mr-2 h-4 w-4" />
                                  <span>Theme & Appearance</span>
                                  <CommandShortcut>⌘⇧T</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Setting notifications...')}>
                                  <Bell className="mr-2 h-4 w-4" />
                                  <span>Notifications</span>
                                  <CommandShortcut>⌘⇧N</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Opening language settings...')}>
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  <span>Language & Region</span>
                                </CommandItem>
                              </CommandGroup>
                              
                              <CommandSeparator />
                              
                              <CommandGroup heading="Advanced">
                                <CommandItem onSelect={() => alert('Opening API settings...')}>
                                  <Code className="mr-2 h-4 w-4" />
                                  <span>API Keys</span>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Managing integrations...')}>
                                  <Zap className="mr-2 h-4 w-4" />
                                  <span>Integrations</span>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Exporting data...')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Export Data</span>
                                </CommandItem>
                              </CommandGroup>
                              
                              <CommandSeparator />
                              
                              <CommandGroup heading="Support">
                                <CommandItem onSelect={() => alert('Opening help...')}>
                                  <BookOpen className="mr-2 h-4 w-4" />
                                  <span>Help & Documentation</span>
                                  <CommandShortcut>F1</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Contacting support...')}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  <span>Contact Support</span>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Providing feedback...')}>
                                  <Star className="mr-2 h-4 w-4" />
                                  <span>Send Feedback</span>
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </DialogContent>
                      </Dialog>

                      <div className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        <p><strong>Use Cases:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Quick access to all app settings</li>
                          <li>Organized by functional categories</li>
                          <li>Support and help integration</li>
                          <li>Advanced configuration options</li>
                          <li>User preference management</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './ui/command';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { Settings, User, Shield, Palette, Bell, Code, Download, BookOpen, Mail, Star } from 'lucide-react';

function SettingsCommandMenu() {
  const [open, setOpen] = useState(false);

  const handleSettingSelect = (setting: string) => {
    alert(\`Opening: \${setting}\`);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Settings & Preferences
        <CommandShortcut>⌘,</CommandShortcut>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <Command>
            <CommandInput placeholder="Search settings..." />
            <CommandList>
              <CommandEmpty>No settings found.</CommandEmpty>
              
              <CommandGroup heading="Account">
                <CommandItem onSelect={() => handleSettingSelect('Profile Settings')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                  <CommandShortcut>⌘⇧P</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleSettingSelect('Account Security')}>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Account Security</span>
                  <CommandShortcut>⌘⇧S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Preferences">
                <CommandItem onSelect={() => handleSettingSelect('Theme & Appearance')}>
                  <Palette className="mr-2 h-4 w-4" />
                  <span>Theme & Appearance</span>
                  <CommandShortcut>⌘⇧T</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleSettingSelect('Notifications')}>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                  <CommandShortcut>⌘⇧N</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Support">
                <CommandItem onSelect={() => handleSettingSelect('Help & Documentation')}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Help & Documentation</span>
                  <CommandShortcut>F1</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleSettingSelect('Contact Support')}>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Contact Support</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}`}
                      language="tsx"
                      id="settings-command-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Files Command */}
              <section id="files-command" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Files Command Menu</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Search and manage files with metadata and quick actions</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col gap-6">
                      <div className="flex-shrink-0">
                        <Button 
                          variant="outline" 
                          onClick={() => setFilesOpen(true)}
                          className="gap-3"
                        >
                          <FileText className="w-4 h-4" />
                          Search Files
                          <CommandShortcut>⌘⇧F</CommandShortcut>
                        </Button>
                      </div>
                      
                      <Dialog open={filesOpen} onOpenChange={setFilesOpen}>
                        <DialogContent className="overflow-hidden p-0 shadow-lg">
                          <DialogTitle className="sr-only">Files Command Menu</DialogTitle>
                          <DialogDescription className="sr-only">Search and manage files with metadata</DialogDescription>
                          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                            <CommandInput placeholder="Search files by name, type, or content..." />
                            <CommandList>
                              <CommandEmpty>No files found.</CommandEmpty>
                              
                              <CommandGroup heading="Recent Files">
                                {files.slice(0, 3).map((file) => (
                                  <CommandItem key={file.id} onSelect={() => alert(`Opening file: ${file.name}`)}>
                                    <span className="mr-3 text-lg">{file.icon}</span>
                                    <div className="flex flex-col flex-1">
                                      <span className="font-medium">{file.name}</span>
                                      <span className="text-xs text-muted-foreground">{file.type} • {file.size} • {file.modified}</span>
                                    </div>
                                    <CommandShortcut>↵</CommandShortcut>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              
                              <CommandGroup heading="All Files">
                                {files.slice(3).map((file) => (
                                  <CommandItem key={file.id} onSelect={() => alert(`Opening file: ${file.name}`)}>
                                    <span className="mr-3 text-lg">{file.icon}</span>
                                    <div className="flex flex-col flex-1">
                                      <span className="font-medium">{file.name}</span>
                                      <span className="text-xs text-muted-foreground">{file.type} • {file.size} • {file.modified}</span>
                                    </div>
                                    <CommandShortcut>↵</CommandShortcut>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              
                              <CommandSeparator />
                              
                              <CommandGroup heading="File Actions">
                                <CommandItem onSelect={() => alert('Creating new file...')}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  <span>New File</span>
                                  <CommandShortcut>⌘N</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Uploading files...')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Upload Files</span>
                                  <CommandShortcut>⌘U</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Opening file manager...')}>
                                  <Folder className="mr-2 h-4 w-4" />
                                  <span>File Manager</span>
                                  <CommandShortcut>⌘⇧M</CommandShortcut>
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </DialogContent>
                      </Dialog>

                      <div className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        <p><strong>Features:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Rich file metadata display (type, size, modified date)</li>
                          <li>Search by name, type, or content</li>
                          <li>Recent files prioritization</li>
                          <li>File type icons and visual organization</li>
                          <li>Quick file management actions</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './ui/command';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { FileText, Plus, Download, Folder } from 'lucide-react';

const files = [
  { id: 1, name: 'Project Proposal.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago', icon: '📄' },
  { id: 2, name: 'Design Mockups.figma', type: 'Figma', size: '15.2 MB', modified: '1 day ago', icon: '🎨' },
  { id: 3, name: 'Meeting Notes.md', type: 'Markdown', size: '1.2 KB', modified: '3 hours ago', icon: '📝' },
];

function FilesCommandMenu() {
  const [open, setOpen] = useState(false);

  const handleFileSelect = (file: typeof files[0]) => {
    alert(\`Opening file: \${file.name}\`);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Search Files
        <CommandShortcut>⌘⇧F</CommandShortcut>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <Command>
            <CommandInput placeholder="Search files by name, type, or content..." />
            <CommandList>
              <CommandEmpty>No files found.</CommandEmpty>
              
              <CommandGroup heading="Recent Files">
                {files.map((file) => (
                  <CommandItem key={file.id} onSelect={() => handleFileSelect(file)}>
                    <span className="mr-3 text-lg">{file.icon}</span>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {file.type} • {file.size} • {file.modified}
                      </span>
                    </div>
                    <CommandShortcut>↵</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="File Actions">
                <CommandItem onSelect={() => alert('Creating new file...')}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New File</span>
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}`}
                      language="tsx"
                      id="files-command-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Recent Command */}
              <section id="recent-command" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Recent Activity Command</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Browse recent activities and jump back to previous work</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col gap-6">
                      <div className="flex-shrink-0">
                        <Button 
                          variant="outline" 
                          onClick={() => setRecentOpen(true)}
                          className="gap-3"
                        >
                          <Star className="w-4 h-4" />
                          Recent Activity
                          <CommandShortcut>⌘R</CommandShortcut>
                        </Button>
                      </div>
                      
                      <Dialog open={recentOpen} onOpenChange={setRecentOpen}>
                        <DialogContent className="overflow-hidden p-0 shadow-lg">
                          <DialogTitle className="sr-only">Recent Activity Command Menu</DialogTitle>
                          <DialogDescription className="sr-only">Browse and access recent activities</DialogDescription>
                          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                            <CommandInput placeholder="Search recent activity..." />
                            <CommandList>
                              <CommandEmpty>No recent activity found.</CommandEmpty>
                              
                              <CommandGroup heading="Today">
                                {recentItems.slice(0, 3).map((item) => (
                                  <CommandItem key={item.id} onSelect={() => alert(`Navigating to: ${item.name}`)}>
                                    <span className="mr-3 text-lg">{item.icon}</span>
                                    <div className="flex flex-col flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {item.action}
                                        </Badge>
                                      </div>
                                      <span className="text-xs text-muted-foreground">{item.type} • {item.time}</span>
                                    </div>
                                    <CommandShortcut>↵</CommandShortcut>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              
                              <CommandGroup heading="Earlier">
                                {recentItems.slice(3).map((item) => (
                                  <CommandItem key={item.id} onSelect={() => alert(`Navigating to: ${item.name}`)}>
                                    <span className="mr-3 text-lg">{item.icon}</span>
                                    <div className="flex flex-col flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.name}</span>
                                        <Badge variant="secondary" className="text-xs">
                                          {item.action}
                                        </Badge>
                                      </div>
                                      <span className="text-xs text-muted-foreground">{item.type} • {item.time}</span>
                                    </div>
                                    <CommandShortcut>↵</CommandShortcut>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              
                              <CommandSeparator />
                              
                              <CommandGroup heading="Activity Actions">
                                <CommandItem onSelect={() => alert('Clearing activity history...')}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Clear History</span>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Exporting activity...')}>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Export Activity</span>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Opening activity settings...')}>
                                  <Settings className="mr-2 h-4 w-4" />
                                  <span>Activity Settings</span>
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </DialogContent>
                      </Dialog>

                      <div className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        <p><strong>Use Cases:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Quick navigation to recent work</li>
                          <li>Activity timeline with timestamps</li>
                          <li>Action-based categorization</li>
                          <li>Time-based grouping (Today, Earlier)</li>
                          <li>Activity management and export</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './ui/command';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent } from './ui/dialog';
import { Star, Trash2, Download, Settings } from 'lucide-react';

const recentItems = [
  { id: 1, name: 'Dashboard Analytics', type: 'View', action: 'Opened', time: '5 minutes ago', icon: '📊' },
  { id: 2, name: 'User Settings', type: 'Edit', action: 'Modified', time: '15 minutes ago', icon: '⚙️' },
  { id: 3, name: 'Team Meeting', type: 'Event', action: 'Attended', time: '1 hour ago', icon: '👥' },
];

function RecentActivityCommand() {
  const [open, setOpen] = useState(false);

  const handleItemSelect = (item: typeof recentItems[0]) => {
    alert(\`Navigating to: \${item.name}\`);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Recent Activity
        <CommandShortcut>⌘R</CommandShortcut>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <Command>
            <CommandInput placeholder="Search recent activity..." />
            <CommandList>
              <CommandEmpty>No recent activity found.</CommandEmpty>
              
              <CommandGroup heading="Today">
                {recentItems.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleItemSelect(item)}>
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.action}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.type} • {item.time}
                      </span>
                    </div>
                    <CommandShortcut>↵</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Activity Actions">
                <CommandItem onSelect={() => alert('Clearing activity history...')}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Clear History</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}`}
                      language="tsx"
                      id="recent-command-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Projects Command */}
              <section id="projects-command" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Projects Command Menu</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Manage and navigate projects with progress tracking</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col gap-6">
                      <div className="flex-shrink-0">
                        <Button 
                          variant="outline" 
                          onClick={() => setProjectsOpen(true)}
                          className="gap-3"
                        >
                          <Folder className="w-4 h-4" />
                          Manage Projects
                          <CommandShortcut>⌘⇧P</CommandShortcut>
                        </Button>
                      </div>
                      
                      <Dialog open={projectsOpen} onOpenChange={setProjectsOpen}>
                        <DialogContent className="overflow-hidden p-0 shadow-lg max-w-2xl">
                          <DialogTitle className="sr-only">Projects Command Menu</DialogTitle>
                          <DialogDescription className="sr-only">Manage and navigate projects with progress tracking</DialogDescription>
                          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                            <CommandInput placeholder="Search projects by name, status, or team..." />
                            <CommandList>
                              <CommandEmpty>No projects found.</CommandEmpty>
                              
                              <CommandGroup heading="Active Projects">
                                {projectsList.filter(p => p.status === 'On Track' || p.status === 'In Progress').map((project) => (
                                  <CommandItem key={project.id} onSelect={() => alert(`Opening project: ${project.name}`)}>
                                    <span className="mr-3 text-xl">{project.icon}</span>
                                    <div className="flex flex-col flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{project.name}</span>
                                        <Badge variant={project.status === 'On Track' ? 'default' : 'secondary'} className="text-xs">
                                          {project.status}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-muted-foreground">{project.members} members</span>
                                        <div className="flex items-center gap-1">
                                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-primary rounded-full transition-all" 
                                              style={{ width: `${project.progress}%` }}
                                            />
                                          </div>
                                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                                        </div>
                                      </div>
                                    </div>
                                    <CommandShortcut>↵</CommandShortcut>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              
                              <CommandGroup heading="Other Projects">
                                {projectsList.filter(p => p.status !== 'On Track' && p.status !== 'In Progress').map((project) => (
                                  <CommandItem key={project.id} onSelect={() => alert(`Opening project: ${project.name}`)}>
                                    <span className="mr-3 text-xl">{project.icon}</span>
                                    <div className="flex flex-col flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{project.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {project.status}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-muted-foreground">{project.members} members</span>
                                        <div className="flex items-center gap-1">
                                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div 
                                              className="h-full bg-primary rounded-full transition-all" 
                                              style={{ width: `${project.progress}%` }}
                                            />
                                          </div>
                                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                                        </div>
                                      </div>
                                    </div>
                                    <CommandShortcut>↵</CommandShortcut>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                              
                              <CommandSeparator />
                              
                              <CommandGroup heading="Project Actions">
                                <CommandItem onSelect={() => alert('Creating new project...')}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  <span>New Project</span>
                                  <CommandShortcut>⌘N</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Opening project templates...')}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  <span>Project Templates</span>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Viewing project analytics...')}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Project Analytics</span>
                                </CommandItem>
                                <CommandItem onSelect={() => alert('Managing project settings...')}>
                                  <Settings className="mr-2 h-4 w-4" />
                                  <span>Project Settings</span>
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </DialogContent>
                      </Dialog>

                      <div className="text-sm space-y-2" style={{ color: 'var(--color-text-tertiary)' }}>
                        <p><strong>Features:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Progress bars and completion percentages</li>
                          <li>Team member counts and status badges</li>
                          <li>Status-based project organization</li>
                          <li>Visual project icons and metadata</li>
                          <li>Comprehensive project management actions</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from './ui/command';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent } from './ui/dialog';
import { Folder, Plus, Copy, Eye, Settings } from 'lucide-react';

const projectsList = [
  { id: 1, name: 'E-commerce Platform', members: 8, progress: 75, status: 'On Track', icon: '🛒' },
  { id: 2, name: 'Mobile Banking App', members: 12, progress: 60, status: 'In Progress', icon: '💳' },
  { id: 3, name: 'AI Analytics Tool', members: 6, progress: 90, status: 'Nearly Done', icon: '🤖' },
];

function ProjectsCommandMenu() {
  const [open, setOpen] = useState(false);

  const handleProjectSelect = (project: typeof projectsList[0]) => {
    alert(\`Opening project: \${project.name}\`);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        Manage Projects
        <CommandShortcut>⌘⇧P</CommandShortcut>
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 max-w-2xl">
          <Command>
            <CommandInput placeholder="Search projects by name, status, or team..." />
            <CommandList>
              <CommandEmpty>No projects found.</CommandEmpty>
              
              <CommandGroup heading="Active Projects">
                {projectsList.map((project) => (
                  <CommandItem key={project.id} onSelect={() => handleProjectSelect(project)}>
                    <span className="mr-3 text-xl">{project.icon}</span>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{project.name}</span>
                        <Badge variant="default" className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{project.members} members</span>
                        <div className="flex items-center gap-1">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: \`\${project.progress}%\` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                    <CommandShortcut>↵</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup heading="Project Actions">
                <CommandItem onSelect={() => alert('Creating new project...')}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New Project</span>
                  <CommandShortcut>⌘N</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}`}
                      language="tsx"
                      id="projects-command-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Implementation */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation Guide</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Best practices for implementing command menus in your application</p>
                  </div>
                  
                  <PreviewCard title="Global Command Menu Hook">
                    <CodeBlock
                      code={`import { useState, useEffect } from 'react';

export function useCommandMenu() {
  const [open, setOpen] = useState(false);

  // Listen for keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}

// Usage in your app
function App() {
  const { open, setOpen } = useCommandMenu();

  return (
    <div>
      {/* Your app content */}
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {/* Your command items */}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}`}
                      language="tsx"
                      id="implementation-hook-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Command Menu with Router Integration">
                    <CodeBlock
                      code={`import { useRouter } from 'next/router'; // or your router
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/projects', icon: Folder },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function NavigationCommandMenu({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Navigate to..." />
        <CommandList>
          <CommandEmpty>No pages found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleNavigation(item.href)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}`}
                      language="tsx"
                      id="router-integration-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Accessibility Features">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Keyboard Navigation</h4>
                        <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li><kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">⌘K</kbd> / <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Ctrl+K</kbd> to open command menu</li>
                          <li><kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">↑</kbd> / <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">↓</kbd> to navigate between items</li>
                          <li><kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Enter</kbd> to select an item</li>
                          <li><kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Esc</kbd> to close menu</li>
                          <li>Type to search instantly</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Best Practices</h4>
                        <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>Provide clear, descriptive labels for all commands</li>
                          <li>Group related commands for better organization</li>
                          <li>Include keyboard shortcuts where appropriate</li>
                          <li>Use consistent icons across similar actions</li>
                          <li>Implement proper focus management</li>
                          <li>Provide helpful empty states</li>
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