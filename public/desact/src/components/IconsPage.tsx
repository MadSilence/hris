import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Hash, Search as SearchIcon, ChevronRight, Menu, Layers, Zap, Star, FileText, Mouse, Square, AlignLeft, CheckSquare, Layout, CreditCard, Grid3X3, Settings, List, PieChart, AlertTriangle, Award, Upload, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Calendar, Megaphone, Timer, Shield, CheckCircle, XCircle, AlertCircle, Info, Code2, Eye, Paintbrush, Type, User, TrendingUp } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
// Static icon mappings
const categoryIcons: Record<string, React.ElementType> = {
  'Base components': Layers,
  'Application UI': Zap,
  'Marketing': Star,
  'Documentation': FileText
};

const componentIcons: Record<string, React.ElementType> = {
  'Buttons': Square,
  'Forms': Edit,
  'Input': Layout,
  'Layout': Layout,
  'HR Cards': CreditCard,
  'Accordion': List,
  'Navigation': Navigation,
  'Breadcrumbs': ArrowRight,
  'Pagination': ArrowUpDown,
  'Interaction': Award,
  'Badges': Award,
  'Alerts': AlertTriangle,
  'Data Display': Grid3X3,
  'Charts': PieChart,
  'Lists': List,
  'Skeletons': Package,
  'Modals': Square,
  'Drawer': PanelLeftOpen,
  'Avatars': User,
  'File Upload': Upload,
  'Dashboard': Gauge,
  'Simple Insight': TrendingUp,
  'Color Picker': Paintbrush,
  'Command Menu': Command,
  'Text Editor': Edit,
  'Status': Activity,
  'Typography': Type,
  'System Colors': PaletteIcon,
  'Icons': Hash,
  'Miscellaneous': Settings,
  'Default': Package
};
import { CodeBlock } from './shared/CodeBlock';

// Import all Lucide React icons we want to showcase
import * as LucideIcons from 'lucide-react';

interface IconsPageProps {
  onBack: () => void;
  components: Array<{
    name: string;
    blockCount: number;
    thumbnail: React.ReactNode;
    category: string;
  }>;
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const IconsPage: React.FC<IconsPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [iconSearchTerm, setIconSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
  });

  const { inputRef: iconSearchInputRef, handleKeyDown: handleIconSearchKeyDown } = useInputKeyboardShortcuts({
    value: iconSearchTerm,
    onChange: setIconSearchTerm,
    enableGlobalShortcuts: true,
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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'interface', 'navigation', 'communication', 'media', 'editing', 'finance', 'development', 'system'];
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



  const IconCard: React.FC<{ 
    iconName: string; 
    IconComponent: React.ComponentType<{ className?: string }>; 
  }> = ({ iconName, IconComponent }) => {
    
    const handleCopyImport = () => {
      copyToClipboard(`import { ${iconName} } from 'lucide-react';`, `import-${iconName}`);
    };

    const handleCopyUsage = () => {
      copyToClipboard(`<${iconName} className="h-4 w-4" />`, `usage-${iconName}`);
    };

    return (
      <div className="bg-white border border-brown-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 bg-brown-50 rounded-lg flex items-center justify-center group-hover:bg-brown-100 transition-colors">
            <IconComponent className="h-6 w-6 text-brown-600" />
          </div>
          <div className="text-center">
            <h4 className="font-medium text-sm mb-1">{iconName}</h4>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyImport}
                className="h-6 px-2 text-xs hover:bg-brown-50"
                style={{ color: 'var(--color-text-tertiary)' }}
                title="Copy import"
              >
                {copiedCode === `import-${iconName}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyUsage}
                className="h-6 px-2 text-xs hover:bg-brown-50"
                style={{ color: 'var(--color-text-tertiary)' }}
                title="Copy usage"
              >
                {copiedCode === `usage-${iconName}` ? <Check className="h-3 w-3" /> : <Code2 className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const sidebarSections = [
    { id: 'overview', label: 'Overview', icon: Hash },
    { id: 'interface', label: 'Interface', icon: Mouse },
    { id: 'navigation', label: 'Navigation', icon: ArrowRight },
    { id: 'communication', label: 'Communication', icon: Megaphone },
    { id: 'media', label: 'Media & Files', icon: Upload },
    { id: 'editing', label: 'Editing', icon: Edit },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'development', label: 'Development', icon: Code2 },
    { id: 'system', label: 'System', icon: Settings },
  ];

  // Comprehensive icon categories
  const iconCategories = {
    interface: [
      'Home', 'Search', 'Menu', 'MoreHorizontal', 'MoreVertical', 'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight',
      'Plus', 'Minus', 'X', 'Check', 'Star', 'Heart', 'Bookmark', 'Filter', 'SortAsc', 'SortDesc',
      'Grid3X3', 'List', 'Columns', 'Rows', 'Square', 'Circle', 'Triangle', 'Diamond'
    ],
    navigation: [
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'ArrowUturnLeft', 'ArrowUturnRight', 'Move', 'Navigation',
      'Compass', 'MapPin', 'Map', 'Route', 'ExternalLink', 'Link', 'Unlink', 'Forward', 'Rewind',
      'CornerUpLeft', 'CornerUpRight', 'CornerDownLeft', 'CornerDownRight', 'TrendingUp', 'TrendingDown'
    ],
    communication: [
      'Mail', 'MailOpen', 'Send', 'MessageCircle', 'MessageSquare', 'Phone', 'PhoneCall', 'PhoneIncoming', 'PhoneOutgoing',
      'Video', 'VideoOff', 'Mic', 'MicOff', 'Volume2', 'VolumeX', 'Bell', 'BellOff', 'Share', 'Share2',
      'Users', 'User', 'UserPlus', 'UserMinus', 'UserCheck', 'UserX', 'UserCircle', 'Users2'
    ],
    media: [
      'Image', 'Camera', 'Video', 'Film', 'Music', 'Headphones', 'Volume2', 'VolumeX', 'Play', 'Pause',
      'Square', 'SkipBack', 'SkipForward', 'Repeat', 'Shuffle', 'Upload', 'Download', 'File', 'FileText',
      'Folder', 'FolderOpen', 'Archive', 'Paperclip', 'Link2'
    ],
    editing: [
      'Edit', 'Edit2', 'Edit3', 'Pen', 'PenTool', 'Brush', 'Palette', 'Type', 'Bold', 'Italic',
      'Underline', 'Strikethrough', 'AlignLeft', 'AlignCenter', 'AlignRight', 'AlignJustify', 'Indent', 'Outdent',
      'Scissors', 'Copy', 'Clipboard', 'ClipboardCopy', 'ClipboardPaste', 'RotateCcw', 'RotateCw'
    ],
    finance: [
      'DollarSign', 'CreditCard', 'Wallet', 'Coins', 'Banknote', 'Receipt', 'Calculator', 'TrendingUp', 'TrendingDown',
      'PieChart', 'BarChart', 'BarChart2', 'BarChart3', 'LineChart', 'Activity', 'Target', 'Percent'
    ],
    development: [
      'Code', 'Code2', 'Terminal', 'Command', 'Brackets', 'Braces', 'Bug', 'Zap', 'Database', 'Server',
      'Cloud', 'Globe', 'Wifi', 'WifiOff', 'Bluetooth', 'Usb', 'HardDrive', 'Cpu', 'MemoryStick',
      'GitBranch', 'GitCommit', 'GitMerge', 'GitPullRequest', 'Package', 'Box'
    ],
    system: [
      'Settings', 'Cog', 'Wrench', 'Tool', 'Power', 'PowerOff', 'Plug', 'Battery', 'BatteryLow', 'Wifi',
      'Shield', 'ShieldCheck', 'ShieldAlert', 'Lock', 'Unlock', 'Key', 'Eye', 'EyeOff', 'Gauge',
      'Timer', 'Clock', 'Calendar', 'CalendarDays', 'Trash', 'Trash2', 'RefreshCw', 'RotateCcw'
    ]
  };

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



  // Filter icons based on search
  const getFilteredIcons = (categoryIcons: string[]) => {
    if (!iconSearchTerm) return categoryIcons;
    return categoryIcons.filter(iconName =>
      iconName.toLowerCase().includes(iconSearchTerm.toLowerCase())
    );
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
              animated={false}
              className="transition-transform duration-200 hover:scale-105"
            />
          </div>
          
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
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
              const IconComponent = categoryIcons[category] || Layers;
              
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
                        const ComponentIcon = componentIcons[component.name] || Package;
                        
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
                  <h1 className="text-xl font-semibold">Icons</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Lucide React
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Beautiful & consistent icon toolkit for React
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
            <div className="max-w-6xl mx-auto space-y-16">
              {/* Overview Section */}
              <section id="overview" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Icon Library Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Beautiful, customizable icons for React applications. Built with Lucide React, our icon library provides 
                      consistent, accessible SVG icons that scale perfectly and integrate seamlessly with your components.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Hash className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">200+ Icons</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Comprehensive collection of carefully crafted icons for all your interface needs.</p>
                    </Card>
                    
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Code2 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Easy Integration</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Simple import statements and React components that work out of the box.</p>
                    </Card>
                    
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Consistent Design</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>All icons follow the same design principles for perfect visual harmony.</p>
                    </Card>
                  </div>

                  {/* Search Bar */}
                  <Card className="p-6 border-brown-200">
                    <h3 className="font-semibold mb-4">Search Icons</h3>
                    <div className="relative max-w-md">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
                      <Input
                        ref={iconSearchInputRef}
                        type="text"
                        placeholder="Search icons..."
                        className="pl-10 pr-16 bg-white border-brown-200"
                        value={iconSearchTerm}
                        onChange={(e) => setIconSearchTerm(e.target.value)}
                        onKeyDown={handleIconSearchKeyDown}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-50">
                          <span className="text-xs">⌘</span>K
                        </kbd>
                      </div>
                    </div>
                    <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                      Search through our icon library to find the perfect icon for your needs.
                    </p>
                  </Card>

                  {/* Installation Guide */}
                  <Card className="p-6 border-brown-200">
                    <h3 className="font-semibold mb-4">Installation & Usage</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">1. Install Lucide React</h4>
                        <CodeBlock
                          code="npm install lucide-react"
                          language="bash"
                          id="install-lucide"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">2. Import and Use Icons</h4>
                        <CodeBlock
                          code={`import { Search, User, Heart } from 'lucide-react';

function MyComponent() {
  return (
    <div>
      <Search className="h-4 w-4" />
      <User className="h-6 w-6 text-blue-500" />
      <Heart className="h-8 w-8 text-red-500 fill-current" />
    </div>
  );
}`}
                          language="react"
                          id="usage-example"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Interface Icons */}
              <section id="interface" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Interface Icons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Essential interface elements for buttons, menus, controls, and general UI interactions.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {getFilteredIcons(iconCategories.interface).map((iconName) => {
                      const IconComponent = (LucideIcons as any)[iconName];
                      return IconComponent ? (
                        <IconCard key={iconName} iconName={iconName} IconComponent={IconComponent} />
                      ) : null;
                    })}
                  </div>

                  <Card className="p-6 border-brown-200">
                    <h3 className="font-semibold mb-4">Usage Examples</h3>
                    <CodeBlock
                      code={`import { Search, Menu, Plus, X, Check } from 'lucide-react';

// Button with icon
<button className="flex items-center gap-2">
  <Plus className="h-4 w-4" />
  Add Item
</button>

// Menu trigger
<button>
  <Menu className="h-5 w-5" />
</button>

// Status indicators
<Check className="h-4 w-4 text-green-500" />
<X className="h-4 w-4 text-red-500" />`}
                      language="react"
                      id="interface-usage"
                    />
                  </Card>
                </div>
              </section>

              {/* Navigation Icons */}
              <section id="navigation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Navigation Icons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Directional and navigation icons for movement, routing, and user flow indicators.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {getFilteredIcons(iconCategories.navigation).map((iconName) => {
                      const IconComponent = (LucideIcons as any)[iconName];
                      return IconComponent ? (
                        <IconCard key={iconName} iconName={iconName} IconComponent={IconComponent} />
                      ) : null;
                    })}
                  </div>

                  <Card className="p-6 border-brown-200">
                    <h3 className="font-semibold mb-4">Usage Examples</h3>
                    <CodeBlock
                      code={`import { ArrowLeft, ArrowRight, ExternalLink, Navigation } from 'lucide-react';

// Back button
<button className="flex items-center gap-2">
  <ArrowLeft className="h-4 w-4" />
  Back
</button>

// External link indicator
<a href="#" className="flex items-center gap-1">
  View Details
  <ExternalLink className="h-3 w-3" />
</a>

// Navigation indicator
<Navigation className="h-5 w-5 text-blue-500" />`}
                      language="react"
                      id="navigation-usage"
                    />
                  </Card>
                </div>
              </section>

              {/* Communication Icons */}
              <section id="communication" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Communication Icons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Icons for messaging, calls, notifications, and user interactions.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {getFilteredIcons(iconCategories.communication).map((iconName) => {
                      const IconComponent = (LucideIcons as any)[iconName];
                      return IconComponent ? (
                        <IconCard key={iconName} iconName={iconName} IconComponent={IconComponent} />
                      ) : null;
                    })}
                  </div>

                  <Card className="p-6 border-brown-200">
                    <h3 className="font-semibold mb-4">Usage Examples</h3>
                    <CodeBlock
                      code={`import { Mail, MessageCircle, Phone, Bell, Users } from 'lucide-react';

// Email button
<button className="flex items-center gap-2">
  <Mail className="h-4 w-4" />
  Send Email
</button>

// Chat indicator
<MessageCircle className="h-5 w-5 text-blue-500" />

// Notification badge
<div className="relative">
  <Bell className="h-5 w-5" />
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
    3
  </span>
</div>`}
                      language="react"
                      id="communication-usage"
                    />
                  </Card>
                </div>
              </section>

              {/* Media & Files Icons */}
              <section id="media" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Media & Files Icons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Icons for media controls, file management, uploads, and content organization.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {getFilteredIcons(iconCategories.media).map((iconName) => {
                      const IconComponent = (LucideIcons as any)[iconName];
                      return IconComponent ? (
                        <IconCard key={iconName} iconName={iconName} IconComponent={IconComponent} />
                      ) : null;
                    })}
                  </div>

                  <Card className="p-6 border-brown-200">
                    <h3 className="font-semibold mb-4">Usage Examples</h3>
                    <CodeBlock
                      code={`import { Upload, Download, Play, Pause, Volume2 } from 'lucide-react';

// File upload
<div className="border-2 border-dashed p-6 text-center">
  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
  <p>Drop files here or click to upload</p>
</div>

// Media player controls
<div className="flex items-center gap-2">
  <Play className="h-6 w-6" />
  <Volume2 className="h-5 w-5" />
</div>`}
                      language="react"
                      id="media-usage"
                    />
                  </Card>
                </div>
              </section>

              {/* Editing Icons */}
              <section id="editing" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Editing Icons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Icons for text editing, formatting, design tools, and content manipulation.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {getFilteredIcons(iconCategories.editing).map((iconName) => {
                      const IconComponent = (LucideIcons as any)[iconName];
                      return IconComponent ? (
                        <IconCard key={iconName} iconName={iconName} IconComponent={IconComponent} />
                      ) : null;
                    })}
                  </div>

                  <Card className="p-6 border-brown-200">
                    <h3 className="font-semibold mb-4">Usage Examples</h3>
                    <CodeBlock
                      code={`import { Edit, Bold, Italic, AlignLeft, Copy } from 'lucide-react';

// Text formatting toolbar
<div className="flex items-center gap-2 p-2 border rounded">
  <button><Bold className="h-4 w-4" /></button>
  <button><Italic className="h-4 w-4" /></button>
  <button><AlignLeft className="h-4 w-4" /></button>
</div>

// Edit action
<button className="flex items-center gap-2">
  <Edit className="h-4 w-4" />
  Edit Post
</button>`}
                      language="react"
                      id="editing-usage"
                    />
                  </Card>
                </div>
              </section>

              {/* Finance Icons */}
              <section id="finance" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Finance Icons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Icons for financial applications, payments, analytics, and monetary transactions.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {getFilteredIcons(iconCategories.finance).map((iconName) => {
                      const IconComponent = (LucideIcons as any)[iconName];
                      return IconComponent ? (
                        <IconCard key={iconName} iconName={iconName} IconComponent={IconComponent} />
                      ) : null;
                    })}
                  </div>

                  <Card className="p-6 border-brown-200">
                    <h3 className="font-semibold mb-4">Usage Examples</h3>
                    <CodeBlock
                      code={`import { CreditCard, DollarSign, TrendingUp, PieChart } from 'lucide-react';

// Payment method
<div className="flex items-center gap-2">
  <CreditCard className="h-5 w-5" />
  <span>Credit Card</span>
</div>

// Revenue indicator
<div className="text-green-600 flex items-center gap-1">
  <TrendingUp className="h-4 w-4" />
  <span>+12.5%</span>
</div>

// Analytics dashboard
<PieChart className="h-8 w-8 text-blue-500" />`}
                      language="react"
                      id="finance-usage"
                    />
                  </Card>
                </div>
              </section>

              {/* Development Icons */}
              <section id="development" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Development Icons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Icons for development tools, coding, version control, and technical interfaces.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {getFilteredIcons(iconCategories.development).map((iconName) => {
                      const IconComponent = (LucideIcons as any)[iconName];
                      return IconComponent ? (
                        <IconCard key={iconName} iconName={iconName} IconComponent={IconComponent} />
                      ) : null;
                    })}
                  </div>

                  <Card className="p-6 border-brown-200">
                    <h3 className="font-semibold mb-4">Usage Examples</h3>
                    <CodeBlock
                      code={`import { Code, Terminal, GitBranch, Database, Cloud } from 'lucide-react';

// Development sections
<div className="space-y-4">
  <div className="flex items-center gap-2">
    <Code className="h-5 w-5" />
    <span>Source Code</span>
  </div>
  
  <div className="flex items-center gap-2">
    <Terminal className="h-5 w-5" />
    <span>Terminal</span>
  </div>
  
  <div className="flex items-center gap-2">
    <Database className="h-5 w-5" />
    <span>Database</span>
  </div>
</div>`}
                      language="react"
                      id="development-usage"
                    />
                  </Card>
                </div>
              </section>

              {/* System Icons */}
              <section id="system" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      System Icons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Icons for system functions, settings, security, and administrative controls.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {getFilteredIcons(iconCategories.system).map((iconName) => {
                      const IconComponent = (LucideIcons as any)[iconName];
                      return IconComponent ? (
                        <IconCard key={iconName} iconName={iconName} IconComponent={IconComponent} />
                      ) : null;
                    })}
                  </div>

                  <Card className="p-6 border-brown-200">
                    <h3 className="font-semibold mb-4">Usage Examples</h3>
                    <CodeBlock
                      code={`import { Settings, Shield, Lock, Power, Timer } from 'lucide-react';

// Settings menu
<button className="flex items-center gap-2">
  <Settings className="h-4 w-4" />
  Settings
</button>

// Security indicator
<div className="flex items-center gap-2 text-green-600">
  <Shield className="h-4 w-4" />
  <span>Secure Connection</span>
</div>

// Status indicators
<div className="flex items-center gap-4">
  <Lock className="h-4 w-4 text-green-500" />
  <Timer className="h-4 w-4 text-yellow-500" />
  <Power className="h-4 w-4 text-red-500" />
</div>`}
                      language="react"
                      id="system-usage"
                    />
                  </Card>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};