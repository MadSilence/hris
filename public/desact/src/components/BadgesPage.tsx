import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, Layers, Package, Award, AlertTriangle, CheckCircle, XCircle, AlertCircle, Info, Clock, Star, Users, Building2, UserCheck, FileText, Settings, Calendar, Briefcase, Shield, Target, TrendingUp, Code2, Eye, Hash, Zap, Activity, DollarSign, BookOpen, HelpCircle, Coffee, Plane, GraduationCap, Heart, Gift, Timer, PanelLeftOpen, Megaphone, Command, Edit, Palette as PaletteIcon, Upload, Gauge, ArrowUpDown, RefreshCw, Smartphone, Filter, Download, Plus, Bell, LogOut, Grid3X3, List, PieChart, Type, CreditCard, Layout, Navigation, ArrowRight, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
// Static icon mappings
const categoryIcons: Record<string, React.ElementType> = {
  'Base components': Layers,
  'Application UI': Zap,
  'Marketing': Star,
  'Documentation': FileText
};

const componentIcons: Record<string, React.ElementType> = {
  'Buttons': Award,
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
  'Modals': Award,
  'Drawer': PanelLeftOpen,
  'Avatars': User,
  'File Upload': Upload,
  'Dashboard': Gauge,
  'Simple Insight': TrendingUp,
  'Color Picker': PaletteIcon,
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

interface BadgesPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const BadgesPage: React.FC<BadgesPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'default', 'secondary', 'destructive', 'outline', 'sizes', 'colors', 'icons', 'status', 'hr-examples', 'best-practices', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: Award },
    { id: 'default', label: 'Default Badge', icon: Award },
    { id: 'secondary', label: 'Secondary Badge', icon: Award },
    { id: 'destructive', label: 'Destructive Badge', icon: XCircle },
    { id: 'outline', label: 'Outline Badge', icon: Award },
    { id: 'sizes', label: 'Badge Sizes', icon: Hash },
    { id: 'colors', label: 'Color Variants', icon: PaletteIcon },
    { id: 'icons', label: 'Badges with Icons', icon: Star },
    { id: 'status', label: 'Status Indicators', icon: Activity },
    { id: 'hr-examples', label: 'HR Examples', icon: Users },
    { id: 'best-practices', label: 'Best Practices', icon: CheckCircle },
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

  const BadgeShowcase: React.FC<{ 
    title: string; 
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    description: string;
    examples: string[];
  }> = ({ title, variant, description, examples }) => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>{description}</p>
      </div>
      
      <PreviewCard title="Examples">
        <div className="flex flex-wrap gap-3">
          {examples.map((example, index) => (
            <Badge key={index} variant={variant}>
              {example}
            </Badge>
          ))}
        </div>
      </PreviewCard>
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
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform ${
                        !collapsedCategories.has(category) ? 'rotate-90' : ''
                      }`} 
                    />
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
                  <h1 className="text-xl font-semibold">Badges</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    UI Elements
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Small labels and indicators for status, categories, and metadata
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
                      Badge Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Badges are small labels that communicate status, categories, notifications, or other metadata. 
                      They help users quickly identify and categorize information in HR systems.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Multiple Variants</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Default, secondary, destructive, and outline styles for different contexts.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Hash className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Flexible Sizing</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Automatically adapts to content with optional icon support.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Status Ready</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Perfect for employee status, application states, and notifications.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Badge Variants Overview">
                    <div className="flex flex-wrap items-center gap-4">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge variant="outline">Outline</Badge>
                    </div>
                    <p className="text-sm mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
                      Use default badges for primary status, secondary for neutral information, destructive for 
                      warnings or errors, and outline for subtle labeling.
                    </p>
                  </PreviewCard>
                </div>
              </section>

              {/* Default Badges */}
              <section id="default" className="scroll-mt-28">
                <BadgeShowcase
                  title="Default Badges"
                  description="Primary badges with high contrast for important status indicators and primary categories."
                  variant="default"
                  examples={['Active', 'Approved', 'Hired', 'Complete', 'Published']}
                />
                
                <PreviewCard title="Code Example">
                  <CodeBlock
                    code={`import { Badge } from './components/ui/badge';

// Basic default badges
<Badge>Active</Badge>
<Badge>Approved</Badge>
<Badge>Complete</Badge>

// Default badges in context
<div className="flex items-center gap-2">
  <span>Employee Status:</span>
  <Badge>Active</Badge>
</div>`}
                    language="tsx"
                    id="default-badges"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </PreviewCard>
              </section>

              {/* Secondary Badges */}
              <section id="secondary" className="scroll-mt-28">
                <BadgeShowcase
                  title="Secondary Badges"
                  description="Neutral badges for general information, departments, or non-critical status indicators."
                  variant="secondary"
                  examples={['HR', 'Engineering', 'Marketing', 'Sales', 'Support']}
                />
                
                <PreviewCard title="Code Example">
                  <CodeBlock
                    code={`import { Badge } from './components/ui/badge';

// Secondary badges
<Badge variant="secondary">HR</Badge>
<Badge variant="secondary">Engineering</Badge>
<Badge variant="secondary">Marketing</Badge>

// Department labeling example
<div className="flex items-center gap-2">
  <span>Department:</span>
  <Badge variant="secondary">Human Resources</Badge>
</div>`}
                    language="tsx"
                    id="secondary-badges"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </PreviewCard>
              </section>

              {/* Destructive Badges */}
              <section id="destructive" className="scroll-mt-28">
                <BadgeShowcase
                  title="Destructive Badges"
                  description="Warning and error badges for critical status that requires attention or action."
                  variant="destructive"
                  examples={['Rejected', 'Suspended', 'Expired', 'Overdue', 'Critical']}
                />
                
                <PreviewCard title="Code Example">
                  <CodeBlock
                    code={`import { Badge } from './components/ui/badge';

// Destructive badges
<Badge variant="destructive">Rejected</Badge>
<Badge variant="destructive">Suspended</Badge>
<Badge variant="destructive">Expired</Badge>

// Error state example
<div className="flex items-center gap-2">
  <span>Application Status:</span>
  <Badge variant="destructive">Rejected</Badge>
</div>`}
                    language="tsx"
                    id="destructive-badges"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </PreviewCard>
              </section>

              {/* Outline Badges */}
              <section id="outline" className="scroll-mt-28">
                <BadgeShowcase
                  title="Outline Badges"
                  description="Subtle badges for secondary information or when you need lower visual weight."
                  variant="outline"
                  examples={['Optional', 'Draft', 'Preview', 'Temporary', 'Guest']}
                />
                
                <PreviewCard title="Code Example">
                  <CodeBlock
                    code={`import { Badge } from './components/ui/badge';

// Outline badges
<Badge variant="outline">Optional</Badge>
<Badge variant="outline">Draft</Badge>
<Badge variant="outline">Preview</Badge>

// Subtle labeling example
<div className="flex items-center gap-2">
  <span>Document Type:</span>
  <Badge variant="outline">Draft</Badge>
</div>`}
                    language="tsx"
                    id="outline-badges"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </PreviewCard>
              </section>

              {/* Badge Sizes */}
              <section id="sizes" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Badge Sizing</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Badges automatically adjust to their content while maintaining consistent padding and typography.</p>
                  </div>

                  <PreviewCard title="Size Examples">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Short Labels</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge>New</Badge>
                          <Badge variant="secondary">HR</Badge>
                          <Badge variant="destructive">No</Badge>
                          <Badge variant="outline">OK</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Medium Labels</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge>Active Employee</Badge>
                          <Badge variant="secondary">Human Resources</Badge>
                          <Badge variant="destructive">Application Rejected</Badge>
                          <Badge variant="outline">Pending Review</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Longer Labels</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge>Senior Software Engineer</Badge>
                          <Badge variant="secondary">Customer Success Manager</Badge>
                          <Badge variant="destructive">Performance Improvement Plan</Badge>
                          <Badge variant="outline">Awaiting Manager Approval</Badge>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Badge } from './components/ui/badge';

// Badges automatically size to content
<Badge>Short</Badge>
<Badge>Medium Length Label</Badge>
<Badge>Very Long Label That Spans Multiple Words</Badge>

// Custom styling if needed
<Badge className="text-xs">Small Text</Badge>
<Badge className="px-3 py-1">Custom Padding</Badge>`}
                      language="tsx"
                      id="badge-sizes"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Color Variants */}
              <section id="colors" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Custom Color Variants</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Create custom colored badges for specific use cases and categories.</p>
                  </div>

                  <PreviewCard title="Status Color Examples">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Success States</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
                          <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
                          <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Warning States</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Under Review</Badge>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Expiring Soon</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Info States</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">New</Badge>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">Updated</Badge>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">Priority</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Neutral States</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">Draft</Badge>
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
                          <Badge className="bg-gray-100 text-gray-800 border-gray-200">Archive</Badge>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Badge } from './components/ui/badge';

// Custom colored badges using Tailwind classes
<Badge className="bg-green-100 text-green-800 border-green-200">
  Approved
</Badge>

<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
  Pending
</Badge>

<Badge className="bg-blue-100 text-blue-800 border-blue-200">
  New
</Badge>

<Badge className="bg-gray-100 text-gray-800 border-gray-200">
  Draft
</Badge>

// Purple variant for special categories
<Badge className="bg-purple-100 text-purple-800 border-purple-200">
  Premium
</Badge>`}
                      language="tsx"
                      id="colored-badges"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Badges with Icons */}
              <section id="icons" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Badges with Icons</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Enhance badges with icons for better recognition and visual hierarchy.</p>
                  </div>

                  <PreviewCard title="Icon Badge Examples">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Status with Icons</h4>
                        <div className="flex flex-wrap gap-3">
                          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </Badge>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Pending
                          </Badge>
                          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1.5">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1.5">
                            <Info className="w-3 h-3" />
                            New
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Role Badges</h4>
                        <div className="flex flex-wrap gap-3">
                          <Badge className="flex items-center gap-1.5">
                            <Users className="w-3 h-3" />
                            HR Manager
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3" />
                            Admin
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1.5">
                            <Star className="w-3 h-3" />
                            Lead
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Department Badges</h4>
                        <div className="flex flex-wrap gap-3">
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1.5">
                            <Code2 className="w-3 h-3" />
                            Engineering
                          </Badge>
                          <Badge className="bg-pink-100 text-pink-800 border-pink-200 flex items-center gap-1.5">
                            <Heart className="w-3 h-3" />
                            HR
                          </Badge>
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3" />
                            Sales
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Badge } from './components/ui/badge';
import { CheckCircle, Clock, XCircle, Users, Shield, Star } from 'lucide-react';

// Badges with leading icons
<Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1.5">
  <CheckCircle className="w-3 h-3" />
  Approved
</Badge>

<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1.5">
  <Clock className="w-3 h-3" />
  Pending
</Badge>

// Role badges with icons
<Badge className="flex items-center gap-1.5">
  <Users className="w-3 h-3" />
  HR Manager
</Badge>

<Badge variant="secondary" className="flex items-center gap-1.5">
  <Shield className="w-3 h-3" />
  Admin
</Badge>

// Icon-only badges
<Badge variant="outline" className="px-2">
  <Star className="w-3 h-3" />
</Badge>`}
                      language="tsx"
                      id="icon-badges"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Status Indicators */}
              <section id="status" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Status Indicators</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Specific badge patterns for common status indicators in HR systems.</p>
                  </div>

                  <PreviewCard title="Employee Status">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-brown-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Sarah Johnson</h4>
                            <p className="text-sm text-gray-600">HR Manager</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-brown-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Mike Chen</h4>
                            <p className="text-sm text-gray-600">Software Engineer</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          On Leave
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-brown-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Emily Davis</h4>
                            <p className="text-sm text-gray-600">Designer</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1.5">
                          <Star className="w-3 h-3" />
                          New Hire
                        </Badge>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Application Status">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-brown-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Alex Rodriguez</h4>
                            <p className="text-sm text-gray-600">Senior Developer</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Under Review
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-brown-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Lisa Park</h4>
                            <p className="text-sm text-gray-600">Product Manager</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          Interview Scheduled
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-brown-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">David Kim</h4>
                            <p className="text-sm text-gray-600">Data Analyst</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3" />
                          Offer Extended
                        </Badge>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Badge } from './components/ui/badge';
import { CheckCircle, Clock, Calendar, XCircle } from 'lucide-react';

// Employee status pattern
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
      <Users className="w-5 h-5 text-brown-600" />
    </div>
    <div>
      <h4 className="font-medium">Sarah Johnson</h4>
      <p className="text-sm text-gray-600">HR Manager</p>
    </div>
  </div>
  <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1.5">
    <CheckCircle className="w-3 h-3" />
    Active
  </Badge>
</div>

// Application status pattern
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
      <FileText className="w-5 h-5 text-gray-600" />
    </div>
    <div>
      <h4 className="font-medium">Alex Rodriguez</h4>
      <p className="text-sm text-gray-600">Senior Developer</p>
    </div>
  </div>
  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center gap-1.5">
    <Clock className="w-3 h-3" />
    Under Review
  </Badge>
</div>`}
                      language="tsx"
                      id="status-indicators"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* HR Examples */}
              <section id="hr-examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>HR Application Examples</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Real-world examples of badges in HR management systems.</p>
                  </div>

                  <PreviewCard title="Employee Directory with Badges">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="p-4 border-brown-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-brown-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Sarah Johnson</h4>
                            <p className="text-sm text-gray-600">HR Manager</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                          <Badge variant="secondary">Human Resources</Badge>
                          <Badge variant="outline">Senior</Badge>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">Remote</Badge>
                        </div>
                      </Card>
                      
                      <Card className="p-4 border-brown-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-brown-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">Mike Chen</h4>
                            <p className="text-sm text-gray-600">Software Engineer</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                          <Badge variant="secondary">Engineering</Badge>
                          <Badge variant="outline">Mid</Badge>
                        </div>
                      </Card>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Performance Review Dashboard">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-semibold text-green-800">23</div>
                        <div className="text-sm text-green-600 mb-2">Completed Reviews</div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">On Track</Badge>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-semibold text-yellow-800">12</div>
                        <div className="text-sm text-yellow-600 mb-2">Pending Reviews</div>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In Progress</Badge>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-semibold text-red-800">3</div>
                        <div className="text-sm text-red-600 mb-2">Overdue Reviews</div>
                        <Badge className="bg-red-100 text-red-800 border-red-200">Urgent</Badge>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example - HR Use Cases">
                    <CodeBlock
                      code={`import { Badge } from './components/ui/badge';
import { Users, Briefcase, CheckCircle, Clock } from 'lucide-react';

// Employee card with multiple badges
const EmployeeCard = ({ employee }) => (
  <Card className="p-4">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
        <Users className="w-5 h-5 text-brown-600" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{employee.name}</h4>
        <p className="text-sm text-gray-600">{employee.title}</p>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      <Badge className={getStatusColor(employee.status)}>
        {employee.status}
      </Badge>
      <Badge variant="secondary">{employee.department}</Badge>
      <Badge variant="outline">{employee.level}</Badge>
      {employee.isRemote && (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          Remote
        </Badge>
      )}
    </div>
  </Card>
);

// Utility function for dynamic styling
const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800 border-green-200';
    case 'On Leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};`}
                      language="tsx"
                      id="hr-examples"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Best Practices */}
              <section id="best-practices" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Best Practices</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for effective badge usage in HR applications.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Do's">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Use consistent colors</span>
                            <p className="text-sm text-gray-600">Establish color meanings (green=active, red=error) and stick to them.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Keep text concise</span>
                            <p className="text-sm text-gray-600">Use 1-2 words when possible. "Active" not "Currently Active Employee".</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Prioritize information</span>
                            <p className="text-sm text-gray-600">Show the most important status first, less critical info last.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Group related badges</span>
                            <p className="text-sm text-gray-600">Keep status, department, and role badges together logically.</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Don'ts">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Overuse badges</span>
                            <p className="text-sm text-gray-600">Too many badges create visual clutter. Limit to 3-4 per item.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Use decorative colors</span>
                            <p className="text-sm text-gray-600">Avoid random colors. Each color should have semantic meaning.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Mix badge types randomly</span>
                            <p className="text-sm text-gray-600">Don't mix outlined and filled badges without purpose.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Ignore accessibility</span>
                            <p className="text-sm text-gray-600">Ensure sufficient color contrast and don't rely only on color.</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Usage Guidelines">
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-900 mb-2">Status Hierarchy</h4>
                        <p className="text-sm text-blue-800">Use high-contrast colors (green, red) for critical status, neutral colors for informational badges.</p>
                        <div className="flex gap-2 mt-3">
                          <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>
                          <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>
                          <Badge variant="secondary">Info</Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-medium text-green-900 mb-2">Contextual Grouping</h4>
                        <p className="text-sm text-green-800">Group badges by purpose: status first, then department, then additional attributes.</p>
                        <div className="flex gap-2 mt-3">
                          <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                          <Badge variant="secondary">Engineering</Badge>
                          <Badge variant="outline">Senior</Badge>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">Remote</Badge>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                        <h4 className="font-medium text-purple-900 mb-2">Responsive Design</h4>
                        <p className="text-sm text-purple-800">Consider how badges wrap on smaller screens. Most important badges should appear first.</p>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Implementation */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation Guide</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Technical implementation details and customization options.</p>
                  </div>

                  <PreviewCard title="Badge Component API">
                    <CodeBlock
                      code={`import { Badge } from './components/ui/badge';

// Basic props
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children: React.ReactNode;
}

// Usage examples
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>

// Custom styling
<Badge className="bg-purple-100 text-purple-800 border-purple-200">
  Custom Color
</Badge>

// With icons
<Badge className="flex items-center gap-1.5">
  <CheckCircle className="w-3 h-3" />
  With Icon
</Badge>`}
                      language="tsx"
                      id="badge-api"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="TypeScript Utilities">
                    <CodeBlock
                      code={`// Type definitions for common HR badge use cases
type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
type ApplicationStatus = 'Under Review' | 'Interview Scheduled' | 'Offer Extended' | 'Rejected' | 'Hired';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
type Department = 'HR' | 'Engineering' | 'Marketing' | 'Sales' | 'Design' | 'Product';

// Utility functions for consistent badge styling
export const getEmployeeStatusBadge = (status: EmployeeStatus) => {
  const statusConfig = {
    'Active': { variant: 'default', className: 'bg-green-100 text-green-800 border-green-200' },
    'On Leave': { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'Inactive': { variant: 'outline', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    'Terminated': { variant: 'destructive', className: '' }
  };
  
  return statusConfig[status];
};

export const getPriorityBadge = (priority: Priority) => {
  const priorityConfig = {
    'Low': { variant: 'outline', className: 'border-gray-300 text-gray-700' },
    'Medium': { variant: 'outline', className: 'border-yellow-300 text-yellow-700' },
    'High': { variant: 'outline', className: 'border-orange-300 text-orange-700' },
    'Critical': { variant: 'destructive', className: '' }
  };
  
  return priorityConfig[priority];
};

// React component with type safety
interface StatusBadgeProps {
  status: EmployeeStatus;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  const config = getEmployeeStatusBadge(status);
  
  return (
    <Badge variant={config.variant as any} className={config.className}>
      {showIcon && <CheckCircle className="w-3 h-3 mr-1" />}
      {status}
    </Badge>
  );
};

// Usage in components
<StatusBadge status="Active" />
<StatusBadge status="On Leave" showIcon={false} />`}
                      language="tsx"
                      id="badge-typescript"
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