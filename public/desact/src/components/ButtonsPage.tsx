import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Mouse, Search, ChevronRight, ChevronDown, Menu, Layers, Zap, Star, FileText, Square, AlignLeft, CheckSquare, Layout, CreditCard, Grid3X3, Settings, List, PieChart, Hash, AlertTriangle, Award, Upload, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Calendar, Megaphone, Timer, Shield, CheckCircle, XCircle, AlertCircle, Info, Code2, Eye, Paintbrush, Type, Plus, Download, Mail, Phone, Bold, Italic, Underline, MoreHorizontal, Play, Heart, User, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { SimpleDropdown, SimpleDropdownItem, SimpleDropdownSeparator } from './ui/simple-dropdown';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { createCopyHandler } from './shared/copyUtils';
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
  'Avatars': Type,
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
import { DesactLogo } from './shared/DesactLogo';

interface ButtonsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const ButtonsPage: React.FC<ButtonsPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [toggleValue, setToggleValue] = useState('');
  const [formatToggleValue, setFormatToggleValue] = useState<string[]>([]);

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
    onFocus: () => {
      console.log('Sidebar search focused');
    },
  });

  const copyToClipboard = createCopyHandler(setCopiedCode);

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
      const sections = ['overview', 'primary', 'secondary', 'outline', 'ghost', 'destructive', 'icons', 'groups', 'split', 'dropdown', 'toggle', 'icon-toggle', 'text-format', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: Mouse },
    { id: 'primary', label: 'Primary Button', icon: Mouse },
    { id: 'secondary', label: 'Secondary Button', icon: Mouse },
    { id: 'outline', label: 'Outline Button', icon: Mouse },
    { id: 'ghost', label: 'Ghost Button', icon: Mouse },
    { id: 'destructive', label: 'Destructive Button', icon: XCircle },
    { id: 'icons', label: 'Icon Buttons', icon: Plus },
    { id: 'groups', label: 'Button Groups', icon: Grid3X3 },
    { id: 'split', label: 'Split Buttons', icon: ChevronDown },
    { id: 'dropdown', label: 'Dropdown Actions', icon: MoreHorizontal },
    { id: 'toggle', label: 'Toggle Buttons', icon: CheckSquare },
    { id: 'icon-toggle', label: 'Icon Toggle', icon: Heart },
    { id: 'text-format', label: 'Text Formatting', icon: Bold },
    { id: 'implementation', label: 'Implementation', icon: Code2 },
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

  const ButtonShowcase: React.FC<{ 
    title: string; 
    sizes: { size: 'sm' | 'default' | 'lg'; label: string }[]; 
    variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    description: string;
  }> = ({ title, sizes, variant, description }) => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>{description}</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {sizes.map(({ size, label }) => (
          <PreviewCard key={size} title={label}>
            <div className="flex flex-col items-center space-y-4">
              <Button variant={variant} size={size}>
                {label} Button
              </Button>
              <div className="text-center">
                <p className="text-xs" style={{ color: 'var(--color-text-quaternary)' }}>
                  {size === 'sm' && 'Height: 32px, Padding: 8px 12px'}
                  {size === 'default' && 'Height: 40px, Padding: 10px 16px'}
                  {size === 'lg' && 'Height: 48px, Padding: 12px 24px'}
                </p>
              </div>
            </div>
          </PreviewCard>
        ))}
      </div>
    </div>
  );

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
              const IconComponent = categoryIcons[category] || categoryIcons['Base components'];
              
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
                  <h1 className="text-xl font-semibold">Buttons</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Interactive button components with multiple variants and sizes
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
                      Button Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Our button system provides a comprehensive set of interactive components designed for clarity, 
                      consistency, and accessibility. Each button type serves a specific purpose and follows our 
                      design system principles.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Mouse className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Multiple Variants</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Primary, secondary, outline, ghost, and destructive button styles for different use cases.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Three Sizes</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Small (32px), default (40px), and large (48px) sizes to fit different contexts and layouts.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Accessibility First</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Proper focus states, ARIA labels, and keyboard navigation support built-in.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Button Hierarchy Guide">
                    <div className="flex flex-wrap items-center gap-4">
                      <Button>Primary Action</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="destructive">Destructive</Button>
                    </div>
                    <p className="text-sm mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
                      Use primary buttons for main actions, secondary for supporting actions, outline for alternate choices, 
                      ghost for subtle actions, and destructive for delete/remove operations.
                    </p>
                  </PreviewCard>
                </div>
              </section>

              {/* Primary Buttons */}
              <section id="primary" className="scroll-mt-28">
                <ButtonShowcase
                  title="Primary Buttons"
                  description="Used for the most important actions on a page or section. These buttons should guide users toward their primary goal."
                  variant="default"
                  sizes={[
                    { size: 'sm', label: 'Small' },
                    { size: 'default', label: 'Default' },
                    { size: 'lg', label: 'Large' }
                  ]}
                />
                
                <PreviewCard title="Code Example">
                  <CodeBlock
                    code={`import { Button } from './components/ui/button';

// Basic primary buttons
<Button size="sm">Small Button</Button>
<Button size="default">Default Button</Button>
<Button size="lg">Large Button</Button>

// With disabled state
<Button disabled>Disabled Button</Button>`}
                    language="tsx"
                    id="primary-buttons"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </PreviewCard>

                <PreviewCard title="CSS Properties">
                  <CodeBlock
                    code={`/* Primary Button Styles */
.btn-primary {
  background-color: var(--brown-500); /* #947068 */
  color: var(--color-text-inverse);
  border: 1px solid var(--brown-500);
  border-radius: var(--radius);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--brown-600); /* #7a5a54 */
  border-color: var(--brown-600);
}

.btn-primary:focus {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* Size variants */
.btn-sm { height: 32px; padding: 0 12px; font-size: var(--text-sm); }
.btn-default { height: 40px; padding: 0 16px; font-size: var(--text-sm); }
.btn-lg { height: 48px; padding: 0 24px; font-size: var(--text-md); }`}
                    language="css"
                    id="primary-css"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </PreviewCard>
              </section>

              {/* Secondary Buttons */}
              <section id="secondary" className="scroll-mt-28">
                <ButtonShowcase
                  title="Secondary Buttons"
                  description="Used for secondary actions that complement the primary action. They have less visual weight than primary buttons."
                  variant="secondary"
                  sizes={[
                    { size: 'sm', label: 'Small' },
                    { size: 'default', label: 'Default' },
                    { size: 'lg', label: 'Large' }
                  ]}
                />
                
                <PreviewCard title="Code Example">
                  <CodeBlock
                    code={`import { Button } from './components/ui/button';

// Secondary buttons
<Button variant="secondary" size="sm">Small Secondary</Button>
<Button variant="secondary" size="default">Default Secondary</Button>
<Button variant="secondary" size="lg">Large Secondary</Button>`}
                    language="tsx"
                    id="secondary-buttons"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </PreviewCard>
              </section>

              {/* Outline Buttons */}
              <section id="outline" className="scroll-mt-28">
                <ButtonShowcase
                  title="Outline Buttons"
                  description="Used for alternative actions or when you need a button with less visual prominence than secondary."
                  variant="outline"
                  sizes={[
                    { size: 'sm', label: 'Small' },
                    { size: 'default', label: 'Default' },
                    { size: 'lg', label: 'Large' }
                  ]}
                />
                
                <PreviewCard title="Code Example">
                  <CodeBlock
                    code={`import { Button } from './components/ui/button';

// Outline buttons
<Button variant="outline" size="sm">Small Outline</Button>
<Button variant="outline" size="default">Default Outline</Button>
<Button variant="outline" size="lg">Large Outline</Button>`}
                    language="tsx"
                    id="outline-buttons"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </PreviewCard>
              </section>

              {/* Ghost Buttons */}
              <section id="ghost" className="scroll-mt-28">
                <ButtonShowcase
                  title="Ghost Buttons"
                  description="Used for subtle actions or navigation. These buttons have minimal visual weight and blend into the interface."
                  variant="ghost"
                  sizes={[
                    { size: 'sm', label: 'Small' },
                    { size: 'default', label: 'Default' },
                    { size: 'lg', label: 'Large' }
                  ]}
                />
                
                <PreviewCard title="Code Example">
                  <CodeBlock
                    code={`import { Button } from './components/ui/button';

// Ghost buttons
<Button variant="ghost" size="sm">Small Ghost</Button>
<Button variant="ghost" size="default">Default Ghost</Button>
<Button variant="ghost" size="lg">Large Ghost</Button>`}
                    language="tsx"
                    id="ghost-buttons"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </PreviewCard>
              </section>

              {/* Destructive Buttons */}
              <section id="destructive" className="scroll-mt-28">
                <ButtonShowcase
                  title="Destructive Buttons"
                  description="Used for dangerous actions like deleting data. These buttons use red colors to indicate caution."
                  variant="destructive"
                  sizes={[
                    { size: 'sm', label: 'Small' },
                    { size: 'default', label: 'Default' },
                    { size: 'lg', label: 'Large' }
                  ]}
                />
                
                <PreviewCard title="Code Example">
                  <CodeBlock
                    code={`import { Button } from './components/ui/button';

// Destructive buttons
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="destructive" size="default">Remove Item</Button>
<Button variant="destructive" size="lg">Permanently Delete</Button>`}
                    language="tsx"
                    id="destructive-buttons"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </PreviewCard>
              </section>

              {/* Icon Buttons */}
              <section id="icons" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Icon Buttons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Buttons enhanced with icons for better recognition and visual appeal.
                    </p>
                  </div>

                  <PreviewCard title="Buttons with Leading Icons">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex flex-col items-center space-y-4">
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                        <p className="text-xs text-center" style={{ color: 'var(--color-text-quaternary)' }}>Small with Icon</p>
                      </div>
                      <div className="flex flex-col items-center space-y-4">
                        <Button>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <p className="text-xs text-center" style={{ color: 'var(--color-text-quaternary)' }}>Default with Icon</p>
                      </div>
                      <div className="flex flex-col items-center space-y-4">
                        <Button size="lg">
                          <Mail className="h-5 w-5 mr-2" />
                          Send Email
                        </Button>
                        <p className="text-xs text-center" style={{ color: 'var(--color-text-quaternary)' }}>Large with Icon</p>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Icon-Only Buttons">
                    <div className="flex flex-wrap items-center gap-4">
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="lg" variant="outline">
                        <Mail className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Button } from './components/ui/button';
import { Plus, Download, Mail, MoreHorizontal } from 'lucide-react';

// Buttons with leading icons
<Button size="sm">
  <Plus className="h-4 w-4 mr-2" />
  Add Item
</Button>

<Button>
  <Download className="h-4 w-4 mr-2" />
  Download
</Button>

// Icon-only buttons
<Button size="sm" variant="outline">
  <Plus className="h-4 w-4" />
</Button>

<Button variant="ghost">
  <MoreHorizontal className="h-4 w-4" />
</Button>`}
                      language="tsx"
                      id="icon-buttons"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Button Groups */}
              <section id="groups" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Button Groups
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Group related buttons together to create cohesive action sets.
                    </p>
                  </div>

                  <PreviewCard title="Horizontal Button Group">
                    <div className="flex flex-col space-y-6">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button>Save Draft</Button>
                        <Button>Publish</Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>
                        <Button size="sm">
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Connected Button Group">
                    <div className="inline-flex rounded-lg shadow-sm" role="group">
                      <Button variant="outline" className="rounded-r-none border-r-0">
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="rounded-none border-r-0">
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="rounded-l-none">
                        <Underline className="h-4 w-4" />
                      </Button>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Button } from './components/ui/button';
import { ArrowLeft, ArrowRight, Bold, Italic, Underline } from 'lucide-react';

// Spaced button group
<div className="flex flex-wrap gap-2">
  <Button variant="outline">Cancel</Button>
  <Button>Save Draft</Button>
  <Button>Publish</Button>
</div>

// Connected button group
<div className="inline-flex rounded-lg shadow-sm" role="group">
  <Button variant="outline" className="rounded-r-none border-r-0">
    <Bold className="h-4 w-4" />
  </Button>
  <Button variant="outline" className="rounded-none border-r-0">
    <Italic className="h-4 w-4" />
  </Button>
  <Button variant="outline" className="rounded-l-none">
    <Underline className="h-4 w-4" />
  </Button>
</div>`}
                      language="tsx"
                      id="button-groups"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Split Buttons */}
              <section id="split" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Split Buttons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Combine a primary action with a dropdown menu for related secondary actions.
                    </p>
                  </div>

                  <PreviewCard title="Split Button Examples">
                    <div className="flex flex-col space-y-6">
                      <div className="flex items-center">
                        <Button className="rounded-r-none border-r-0">
                          Save
                        </Button>
                        <SimpleDropdown
                          align="end"
                          trigger={
                            <Button 
                              className="rounded-l-none px-3" 
                              aria-label="More save options"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <SimpleDropdownItem onClick={() => {
                            console.log('Save as Draft clicked');
                            alert('Save as Draft - Simple Dropdown Working! ✅');
                          }}>
                            Save as Draft
                          </SimpleDropdownItem>
                          <SimpleDropdownItem onClick={() => {
                            console.log('Save as Template clicked');
                            alert('Save as Template - Simple Dropdown Working! ✅');
                          }}>
                            Save as Template
                          </SimpleDropdownItem>
                          <SimpleDropdownSeparator />
                          <SimpleDropdownItem onClick={() => {
                            console.log('Save and Close clicked');
                            alert('Save and Close - Simple Dropdown Working! ✅');
                          }}>
                            Save and Close
                          </SimpleDropdownItem>
                        </SimpleDropdown>
                      </div>

                      <div className="flex items-center">
                        <Button variant="outline" className="rounded-r-none border-r-0">
                          <Plus className="h-4 w-4 mr-2" />
                          New Item
                        </Button>
                        <SimpleDropdown
                          align="end"
                          trigger={
                            <Button 
                              variant="outline" 
                              className="rounded-l-none px-3" 
                              aria-label="New item options"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <SimpleDropdownItem onClick={() => {
                            console.log('New Document clicked');
                            alert('New Document - Simple Dropdown Working! ✅');
                          }}>
                            New Document
                          </SimpleDropdownItem>
                          <SimpleDropdownItem onClick={() => {
                            console.log('New Folder clicked');
                            alert('New Folder - Simple Dropdown Working! ✅');
                          }}>
                            New Folder
                          </SimpleDropdownItem>
                          <SimpleDropdownItem onClick={() => {
                            console.log('New Project clicked');
                            alert('New Project - Simple Dropdown Working! ✅');
                          }}>
                            New Project
                          </SimpleDropdownItem>
                        </SimpleDropdown>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Button } from './components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './components/ui/dropdown-menu';
import { ChevronDown, Plus } from 'lucide-react';

// Split button
<div className="flex items-center">
  <Button className="rounded-r-none border-r-0">
    Save
  </Button>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button className="rounded-l-none px-3">
        <ChevronDown className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem>Save as Draft</DropdownMenuItem>
      <DropdownMenuItem>Save as Template</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Save and Close</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>`}
                      language="tsx"
                      id="split-buttons"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Dropdown Action Buttons */}
              <section id="dropdown" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Dropdown Action Buttons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Single buttons that reveal multiple actions through a dropdown menu.
                    </p>
                  </div>

                  <PreviewCard title="Dropdown Action Examples">
                    <div className="flex flex-wrap gap-4">
                      <SimpleDropdown
                        trigger={
                          <Button>
                            Actions
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        }
                      >
                        <SimpleDropdownItem onClick={() => {
                          console.log('Edit clicked');
                          alert('Edit action - Simple Dropdown Working! ✅');
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </SimpleDropdownItem>
                        <SimpleDropdownItem onClick={() => {
                          console.log('Duplicate clicked');
                          alert('Duplicate action - Simple Dropdown Working! ✅');
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </SimpleDropdownItem>
                        <SimpleDropdownSeparator />
                        <SimpleDropdownItem 
                          destructive
                          onClick={() => {
                            console.log('Delete clicked');
                            alert('Delete action - Simple Dropdown Working! ✅');
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Delete
                        </SimpleDropdownItem>
                      </SimpleDropdown>

                      <SimpleDropdown
                        trigger={
                          <Button 
                            variant="outline" 
                            aria-label="More options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <SimpleDropdownItem onClick={() => {
                          console.log('View Details');
                          alert('View Details - Simple Dropdown Working! ✅');
                        }}>
                          View Details
                        </SimpleDropdownItem>
                        <SimpleDropdownItem onClick={() => {
                          console.log('Share');
                          alert('Share - Simple Dropdown Working! ✅');
                        }}>
                          Share
                        </SimpleDropdownItem>
                        <SimpleDropdownItem onClick={() => {
                          console.log('Export');
                          alert('Export - Simple Dropdown Working! ✅');
                        }}>
                          Export
                        </SimpleDropdownItem>
                        <SimpleDropdownSeparator />
                        <SimpleDropdownItem onClick={() => {
                          console.log('Archive');
                          alert('Archive - Simple Dropdown Working! ✅');
                        }}>
                          Archive
                        </SimpleDropdownItem>
                      </SimpleDropdown>

                      <SimpleDropdown
                        trigger={
                          <Button 
                            variant="ghost" 
                            size="sm"
                          >
                            More
                            <ChevronDown className="h-4 w-4 ml-1" />
                          </Button>
                        }
                      >
                        <SimpleDropdownItem onClick={() => {
                          console.log('Settings');
                          alert('Settings - Simple Dropdown Working! ✅');
                        }}>
                          Settings
                        </SimpleDropdownItem>
                        <SimpleDropdownItem onClick={() => {
                          console.log('Help');
                          alert('Help - Simple Dropdown Working! ✅');
                        }}>
                          Help
                        </SimpleDropdownItem>
                        <SimpleDropdownItem onClick={() => {
                          console.log('Feedback');
                          alert('Feedback - Simple Dropdown Working! ✅');
                        }}>
                          Feedback
                        </SimpleDropdownItem>
                      </SimpleDropdown>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Button } from './components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './components/ui/dropdown-menu';
import { ChevronDown, Edit, Copy, XCircle, MoreHorizontal } from 'lucide-react';

// Dropdown action button
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>
      Actions
      <ChevronDown className="h-4 w-4 ml-2" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>
      <Edit className="h-4 w-4 mr-2" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Copy className="h-4 w-4 mr-2" />
      Duplicate
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-red-600">
      <XCircle className="h-4 w-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
                      language="tsx"
                      id="dropdown-buttons"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Toggle Buttons */}
              <section id="toggle" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Toggle Buttons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Buttons that can be toggled between active and inactive states.
                    </p>
                  </div>

                  <PreviewCard title="Single Toggle Buttons">
                    <div className="flex flex-wrap items-center gap-4">
                      <Button 
                        variant={toggleValue === 'notifications' ? 'default' : 'outline'}
                        onClick={() => setToggleValue(toggleValue === 'notifications' ? '' : 'notifications')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Notifications
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className={`${toggleValue === 'starred' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : ''}`}
                        onClick={() => setToggleValue(toggleValue === 'starred' ? '' : 'starred')}
                      >
                        <Star className={`h-4 w-4 mr-2 ${toggleValue === 'starred' ? 'fill-current' : ''}`} />
                        Starred
                      </Button>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Toggle Group">
                    <ToggleGroup type="single" value={toggleValue} onValueChange={setToggleValue}>
                      <ToggleGroupItem value="list" aria-label="List view">
                        <List className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="grid" aria-label="Grid view">
                        <Grid3X3 className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="card" aria-label="Card view">
                        <CreditCard className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Button } from './components/ui/button';
import { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';
import { CheckCircle, Star, List, Grid3X3, CreditCard } from 'lucide-react';
import { useState } from 'react';

const [toggleValue, setToggleValue] = useState('');

// Single toggle button
<Button 
  variant={toggleValue === 'notifications' ? 'default' : 'outline'}
  onClick={() => setToggleValue(toggleValue === 'notifications' ? '' : 'notifications')}
>
  <CheckCircle className="h-4 w-4 mr-2" />
  Notifications
</Button>

// Toggle group
<ToggleGroup type="single" value={toggleValue} onValueChange={setToggleValue}>
  <ToggleGroupItem value="list" aria-label="List view">
    <List className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="grid" aria-label="Grid view">
    <Grid3X3 className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="card" aria-label="Card view">
    <CreditCard className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>`}
                      language="tsx"
                      id="toggle-buttons"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Icon-Only Toggle Buttons */}
              <section id="icon-toggle" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Icon-Only Toggle Buttons
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Compact toggle buttons using only icons for space-efficient interfaces.
                    </p>
                  </div>

                  <PreviewCard title="Icon Toggle Examples">
                    <div className="flex flex-wrap items-center gap-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className={`${toggleValue === 'like' ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                        onClick={() => setToggleValue(toggleValue === 'like' ? '' : 'like')}
                      >
                        <Heart className={`h-4 w-4 ${toggleValue === 'like' ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className={`${toggleValue === 'bookmark' ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}`}
                        onClick={() => setToggleValue(toggleValue === 'bookmark' ? '' : 'bookmark')}
                      >
                        <Award className={`h-4 w-4 ${toggleValue === 'bookmark' ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className={`${toggleValue === 'play' ? 'bg-green-50 border-green-200 text-green-600' : ''}`}
                        onClick={() => setToggleValue(toggleValue === 'play' ? '' : 'play')}
                      >
                        <Play className={`h-4 w-4 ${toggleValue === 'play' ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Button } from './components/ui/button';
import { Heart, Award, Play } from 'lucide-react';
import { useState } from 'react';

const [toggleValue, setToggleValue] = useState('');

// Icon-only toggle buttons
<Button 
  variant="outline" 
  size="sm"
  className={\`\${toggleValue === 'like' ? 'bg-red-50 border-red-200 text-red-600' : ''}\`}
  onClick={() => setToggleValue(toggleValue === 'like' ? '' : 'like')}
>
  <Heart className={\`h-4 w-4 \${toggleValue === 'like' ? 'fill-current' : ''}\`} />
</Button>`}
                      language="tsx"
                      id="icon-toggle-buttons"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Text Formatting Toggle Group */}
              <section id="text-format" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Text Formatting Toggle Group
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Multiple selection toggle groups perfect for text formatting controls.
                    </p>
                  </div>

                  <PreviewCard title="Text Formatting Controls">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Basic Formatting</h4>
                        <ToggleGroup type="multiple" value={formatToggleValue} onValueChange={setFormatToggleValue}>
                          <ToggleGroupItem value="bold" aria-label="Bold">
                            <Bold className="h-4 w-4" />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="italic" aria-label="Italic">
                            <Italic className="h-4 w-4" />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="underline" aria-label="Underline">
                            <Underline className="h-4 w-4" />
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Text Alignment</h4>
                        <ToggleGroup type="single" value={toggleValue} onValueChange={setToggleValue}>
                          <ToggleGroupItem value="left" aria-label="Align left">
                            <AlignLeft className="h-4 w-4" />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="center" aria-label="Align center">
                            <Square className="h-4 w-4" />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="right" aria-label="Align right">
                            <ArrowRight className="h-4 w-4" />
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">View Options</h4>
                        <ToggleGroup type="single" value={toggleValue} onValueChange={setToggleValue}>
                          <ToggleGroupItem value="list" aria-label="List view">
                            <List className="h-4 w-4" />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="grid" aria-label="Grid view">
                            <Grid3X3 className="h-4 w-4" />
                          </ToggleGroupItem>
                          <ToggleGroupItem value="gallery" aria-label="Gallery view">
                            <Package className="h-4 w-4" />
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';
import { Bold, Italic, Underline, AlignLeft, Square, ArrowRight, List, Grid3X3, Package } from 'lucide-react';
import { useState } from 'react';

const [formatToggleValue, setFormatToggleValue] = useState<string[]>([]);
const [alignToggleValue, setAlignToggleValue] = useState('');

// Multiple selection for formatting
<ToggleGroup type="multiple" value={formatToggleValue} onValueChange={setFormatToggleValue}>
  <ToggleGroupItem value="bold" aria-label="Bold">
    <Bold className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Italic">
    <Italic className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="underline" aria-label="Underline">
    <Underline className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>

// Single selection for alignment
<ToggleGroup type="single" value={alignToggleValue} onValueChange={setAlignToggleValue}>
  <ToggleGroupItem value="left" aria-label="Align left">
    <AlignLeft className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="center" aria-label="Align center">
    <Square className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="right" aria-label="Align right">
    <ArrowRight className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>`}
                      language="tsx"
                      id="text-format-toggle"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Implementation Guide */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Implementation Guide
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Best practices and guidelines for implementing buttons in your applications.
                    </p>
                  </div>

                  <PreviewCard title="Button Hierarchy Guidelines">
                    <div className="space-y-4">
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <h4 className="font-medium mb-2">✅ Do</h4>
                        <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Use only one primary button per page section</li>
                          <li>• Group related actions together</li>
                          <li>• Use consistent sizing within button groups</li>
                          <li>• Provide clear, action-oriented labels</li>
                          <li>• Use icons to enhance recognition</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <h4 className="font-medium mb-2">❌ Don't</h4>
                        <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Use multiple primary buttons in close proximity</li>
                          <li>• Mix different button sizes randomly</li>
                          <li>• Use vague labels like "Click here" or "Submit"</li>
                          <li>• Overuse destructive buttons</li>
                          <li>• Neglect focus states and accessibility</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Accessibility Requirements">
                    <CodeBlock
                      code={`// Proper ARIA labels for icon-only buttons
<Button aria-label="Add new item">
  <Plus className="h-4 w-4" />
</Button>

// Keyboard navigation support
<Button 
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Action
</Button>

// Loading state
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>`}
                      language="tsx"
                      id="accessibility-examples"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Custom Button Styling">
                    <CodeBlock
                      code={`/* Custom button variant example */
.btn-custom {
  background: linear-gradient(135deg, var(--brown-500), var(--brown-600));
  color: var(--color-text-inverse);
  border: none;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-custom:hover {
  background: linear-gradient(135deg, var(--brown-600), var(--brown-700));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(148, 112, 104, 0.3);
}

.btn-custom:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(148, 112, 104, 0.2);
}

.btn-custom:focus {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}`}
                      language="css"
                      id="custom-button-css"
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