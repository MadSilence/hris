import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, User, Mail, Phone, Globe, Calendar, Building2, Award, Briefcase, Plus, Edit, Trash2, Eye, Download, Upload, Clock, Target, TrendingUp, Package, Layers, Grid3X3, List, Code2, Users, MessageSquare, Bell, Settings, Crown, Shield, Zap, Star, Heart, CheckCircle2, XCircle, AlertCircle, Minus, FileText, CreditCard, Layout, Navigation, ArrowRight, ArrowUpDown, AlertTriangle, PieChart, PanelLeftOpen, Gauge, Command, Activity, Type, Hash, Palette as PaletteIcon } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
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

interface AvatarsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const AvatarsPage: React.FC<AvatarsPageProps> = ({ 
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
      const sections = ['overview', 'basic', 'sizes', 'variants', 'groups', 'status', 'employees', 'best-practices', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'basic', label: 'Basic Avatars', icon: User },
    { id: 'sizes', label: 'Sizes', icon: Grid3X3 },
    { id: 'variants', label: 'Variants', icon: Layers },
    { id: 'groups', label: 'Avatar Groups', icon: Users },
    { id: 'status', label: 'Status Indicators', icon: CheckCircle2 },
    { id: 'employees', label: 'Employee Profiles', icon: Briefcase },
    { id: 'best-practices', label: 'Best Practices', icon: CheckCircle2 },
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
                  <h1 className="text-xl font-semibold">Avatars</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  User profile images, initials, and status indicators
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
                      Avatar Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Flexible avatar components for displaying user profile images, initials, and status indicators. 
                      Perfect for employee directories, team member displays, and user identification across your HR applications.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Multiple Variants</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Various sizes, colors, and status indicators for different use cases and contexts.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Accessible Design</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Built with proper fallbacks and semantic structure for screen readers.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Briefcase className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">HR Focused</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Perfect for employee directories, team displays, and organizational charts.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Avatar Variations Overview">
                    <div className="flex items-center space-x-6">
                      <Avatar>
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="John Doe" />
                        <AvatarFallback className="bg-brown-100 text-brown-700">JD</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-700">SM</AvatarFallback>
                      </Avatar>
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b739?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Sarah Miller" />
                          <AvatarFallback className="bg-green-100 text-green-700">SM</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <Avatar>
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          <Building2 className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <p className="text-sm mt-4" style={{ color: 'var(--color-text-tertiary)' }}>
                      Images, initials, status indicators, and icon fallbacks.
                    </p>
                  </PreviewCard>
                </div>
              </section>

              {/* Basic Avatars */}
              <section id="basic" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Basic Avatars</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Simple avatar components with images and fallback initials.</p>
                  </div>

                  <PreviewCard title="Basic Avatar Examples">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="John Doe" />
                        <AvatarFallback className="bg-brown-100 text-brown-700">JD</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-700">SM</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b739?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Sarah Miller" />
                        <AvatarFallback className="bg-green-100 text-green-700">SM</AvatarFallback>
                      </Avatar>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';

export function BasicAvatar() {
  return (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarImage src="/images/john-doe.jpg" alt="John Doe" />
        <AvatarFallback className="bg-brown-100 text-brown-700">JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-blue-100 text-blue-700">SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/images/sarah-miller.jpg" alt="Sarah Miller" />
        <AvatarFallback className="bg-green-100 text-green-700">SM</AvatarFallback>
      </Avatar>
    </div>
  )
}`}
                      language="tsx"
                      id="basic-avatars"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Sizes Section */}
              <section id="sizes" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Avatar Sizes</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Multiple predefined sizes to fit different layout requirements.</p>
                  </div>

                  <PreviewCard title="Size Variations">
                    <div className="flex items-center space-x-6">
                      <div className="text-center space-y-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="XS Avatar" />
                          <AvatarFallback className="bg-brown-100 text-brown-700 text-xs">XS</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-stone-500">XS (24px)</p>
                      </div>
                      <div className="text-center space-y-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b739?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="SM Avatar" />
                          <AvatarFallback className="bg-brown-100 text-brown-700 text-sm">SM</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-stone-500">SM (32px)</p>
                      </div>
                      <div className="text-center space-y-2">
                        <Avatar>
                          <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="MD Avatar" />
                          <AvatarFallback className="bg-brown-100 text-brown-700">MD</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-stone-500">MD (40px)</p>
                      </div>
                      <div className="text-center space-y-2">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="LG Avatar" />
                          <AvatarFallback className="bg-brown-100 text-brown-700">LG</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-stone-500">LG (48px)</p>
                      </div>
                      <div className="text-center space-y-2">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="XL Avatar" />
                          <AvatarFallback className="bg-brown-100 text-brown-700 text-lg">XL</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-stone-500">XL (64px)</p>
                      </div>
                      <div className="text-center space-y-2">
                        <Avatar className="w-20 h-20">
                          <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="XXL Avatar" />
                          <AvatarFallback className="bg-brown-100 text-brown-700 text-xl">XXL</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-stone-500">XXL (80px)</p>
                      </div>
                      <div className="text-center space-y-2">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="XXXL Avatar" />
                          <AvatarFallback className="bg-brown-100 text-brown-700 text-2xl">XXXL</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-stone-500">XXXL (96px)</p>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';

export function AvatarSizes() {
  return (
    <div className="flex items-center space-x-6">
      {/* XS - 24px */}
      <Avatar className="w-6 h-6">
        <AvatarImage src="/avatar-xs.jpg" alt="XS Avatar" />
        <AvatarFallback className="bg-brown-100 text-brown-700 text-xs">XS</AvatarFallback>
      </Avatar>
      
      {/* SM - 32px */}
      <Avatar className="w-8 h-8">
        <AvatarImage src="/avatar-sm.jpg" alt="SM Avatar" />
        <AvatarFallback className="bg-brown-100 text-brown-700 text-sm">SM</AvatarFallback>
      </Avatar>
      
      {/* MD - 40px (default) */}
      <Avatar>
        <AvatarImage src="/avatar-md.jpg" alt="MD Avatar" />
        <AvatarFallback className="bg-brown-100 text-brown-700">MD</AvatarFallback>
      </Avatar>
      
      {/* LG - 48px */}
      <Avatar className="w-12 h-12">
        <AvatarImage src="/avatar-lg.jpg" alt="LG Avatar" />
        <AvatarFallback className="bg-brown-100 text-brown-700">LG</AvatarFallback>
      </Avatar>
      
      {/* XL - 64px */}
      <Avatar className="w-16 h-16">
        <AvatarImage src="/avatar-xl.jpg" alt="XL Avatar" />
        <AvatarFallback className="bg-brown-100 text-brown-700 text-lg">XL</AvatarFallback>
      </Avatar>
      
      {/* XXL - 80px */}
      <Avatar className="w-20 h-20">
        <AvatarImage src="/avatar-xxl.jpg" alt="XXL Avatar" />
        <AvatarFallback className="bg-brown-100 text-brown-700 text-xl">XXL</AvatarFallback>
      </Avatar>
      
      {/* XXXL - 96px */}
      <Avatar className="w-24 h-24">
        <AvatarImage src="/avatar-xxxl.jpg" alt="XXXL Avatar" />
        <AvatarFallback className="bg-brown-100 text-brown-700 text-2xl">XXXL</AvatarFallback>
      </Avatar>
    </div>
  )
}`}
                      language="tsx"
                      id="avatar-sizes"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Variants Section */}
              <section id="variants" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Avatar Variants</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Different styling options for various use cases and contexts.</p>
                  </div>

                  <div className="space-y-8">
                    <PreviewCard title="Colored Fallbacks">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback className="bg-brown-100 text-brown-700">AB</AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-700">CD</AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarFallback className="bg-green-100 text-green-700">EF</AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarFallback className="bg-purple-100 text-purple-700">GH</AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarFallback className="bg-orange-100 text-orange-700">IJ</AvatarFallback>
                        </Avatar>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="With Icons">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback className="bg-stone-100 text-stone-600">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarFallback className="bg-brown-100 text-brown-600">
                            <Briefcase className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            <Building2 className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <Avatar>
                          <AvatarFallback className="bg-green-100 text-green-600">
                            <Crown className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Code Example">
                      <CodeBlock
                        code={`import { Avatar, AvatarFallback } from './components/ui/avatar';
import { User, Briefcase, Building2, Crown } from 'lucide-react';

// Colored fallbacks
<Avatar>
  <AvatarFallback className="bg-brown-100 text-brown-700">AB</AvatarFallback>
</Avatar>

// Icon fallbacks
<Avatar>
  <AvatarFallback className="bg-brown-100 text-brown-600">
    <Briefcase className="w-4 h-4" />
  </AvatarFallback>
</Avatar>`}
                        language="tsx"
                        id="avatar-variants"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Avatar Groups Section */}
              <section id="groups" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Avatar Groups</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Stack multiple avatars to show team members, project participants, or group membership.</p>
                  </div>

                  <div className="space-y-8">
                    <PreviewCard title="Stacked Avatars">
                      <div className="flex -space-x-2">
                        <Avatar className="border-2 border-white">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Team Member 1" />
                          <AvatarFallback className="bg-brown-100 text-brown-700">JD</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-white">
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b739?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Team Member 2" />
                          <AvatarFallback className="bg-blue-100 text-blue-700">SM</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-white">
                          <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Team Member 3" />
                          <AvatarFallback className="bg-green-100 text-green-700">AL</AvatarFallback>
                        </Avatar>
                        <Avatar className="border-2 border-white">
                          <AvatarFallback className="bg-stone-100 text-stone-600">+5</AvatarFallback>
                        </Avatar>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Team Roster">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex -space-x-2">
                              <Avatar className="w-8 h-8 border-2 border-white">
                                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="John Doe" />
                                <AvatarFallback className="bg-brown-100 text-brown-700 text-sm">JD</AvatarFallback>
                              </Avatar>
                              <Avatar className="w-8 h-8 border-2 border-white">
                                <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b739?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Sarah Miller" />
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">SM</AvatarFallback>
                              </Avatar>
                              <Avatar className="w-8 h-8 border-2 border-white">
                                <AvatarFallback className="bg-stone-100 text-stone-600 text-sm">+3</AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <p className="font-medium text-stone-900">Engineering Team</p>
                              <p className="text-sm text-stone-500">5 members</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-brown-50 text-brown-700">Active</Badge>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Code Example">
                      <CodeBlock
                        code={`import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';

// Stacked avatars
<div className="flex -space-x-2">
  <Avatar className="border-2 border-white">
    <AvatarImage src="/team-member-1.jpg" alt="Team Member 1" />
    <AvatarFallback className="bg-brown-100 text-brown-700">JD</AvatarFallback>
  </Avatar>
  <Avatar className="border-2 border-white">
    <AvatarImage src="/team-member-2.jpg" alt="Team Member 2" />
    <AvatarFallback className="bg-blue-100 text-blue-700">SM</AvatarFallback>
  </Avatar>
  <Avatar className="border-2 border-white">
    <AvatarFallback className="bg-stone-100 text-stone-600">+5</AvatarFallback>
  </Avatar>
</div>`}
                        language="tsx"
                        id="avatar-groups"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Status Indicators Section */}
              <section id="status" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Status Indicators</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Add status indicators to show online presence, availability, or other contextual information.</p>
                  </div>

                  <div className="space-y-8">
                    <PreviewCard title="Online Status">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Online User" />
                            <AvatarFallback className="bg-brown-100 text-brown-700">JD</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b739?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Away User" />
                            <AvatarFallback className="bg-blue-100 text-blue-700">SM</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-yellow-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Busy User" />
                            <AvatarFallback className="bg-green-100 text-green-700">AL</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback className="bg-stone-100 text-stone-600">RP</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-stone-400 border-2 border-white rounded-full"></div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="With Badges">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Manager" />
                            <AvatarFallback className="bg-brown-100 text-brown-700">JD</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <Crown className="w-3 h-3" />
                          </div>
                        </div>
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b739?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Admin" />
                            <AvatarFallback className="bg-blue-100 text-blue-700">SM</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <Shield className="w-3 h-3" />
                          </div>
                        </div>
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Star Performer" />
                            <AvatarFallback className="bg-green-100 text-green-700">AL</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <Star className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Code Example">
                      <CodeBlock
                        code={`import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Button } from './components/ui/button';
import { Edit, Upload, Trash2, CheckCircle2 } from 'lucide-react';

// Change profile picture interface
<div className="flex items-start space-x-6">
  <div className="relative">
    <Avatar className="w-20 h-20">
      <AvatarImage src="/current-profile.jpg" alt="Current Profile" />
      <AvatarFallback className="bg-brown-100 text-brown-700 text-xl">JD</AvatarFallback>
    </Avatar>
    <div className="absolute -bottom-1 -right-1">
      <Button size="sm" className="w-8 h-8 rounded-full p-0 bg-brown-600 hover:bg-brown-700">
        <Edit className="w-3 h-3" />
      </Button>
    </div>
  </div>
  <div className="flex-1">
    <h4 className="font-medium text-stone-900 mb-2">Profile Picture</h4>
    <p className="text-sm text-stone-600 mb-4">
      Update your profile picture to help colleagues recognize you.
    </p>
    <div className="flex items-center space-x-3">
      <Button size="sm" variant="outline">
        <Upload className="w-4 h-4 mr-2" />
        Upload New
      </Button>
      <Button size="sm" variant="ghost" className="text-red-600">
        <Trash2 className="w-4 h-4 mr-2" />
        Remove
      </Button>
    </div>
  </div>
</div>`}
                        language="tsx"
                        id="change-profile-picture"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Employee Profiles Section */}
              <section id="employees" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Employee Profile Examples</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Real-world examples of avatar usage in HR contexts and employee management systems.</p>
                  </div>

                  <div className="space-y-8">
                    <PreviewCard title="Employee Directory Card">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="John Doe" />
                            <AvatarFallback className="bg-brown-100 text-brown-700 text-lg">JD</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-stone-900">John Doe</h4>
                              <p className="text-stone-600">Senior Software Engineer</p>
                              <p className="text-sm text-stone-500">Engineering Department</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-brown-50 text-brown-700 hover:bg-brown-100">Full-time</Badge>
                              <Badge variant="secondary" className="bg-green-50 text-green-700">Available</Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center space-x-1 text-stone-500">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">john.doe@company.com</span>
                            </div>
                            <div className="flex items-center space-x-1 text-stone-500">
                              <Phone className="w-4 h-4" />
                              <span className="text-sm">+1 (555) 123-4567</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Change Profile Picture">
                      <div className="space-y-6">
                        <div className="flex items-start space-x-6">
                          <div className="relative">
                            <Avatar className="w-20 h-20">
                              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Current Profile" />
                              <AvatarFallback className="bg-brown-100 text-brown-700 text-xl">JD</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1">
                              <Button size="sm" className="w-8 h-8 rounded-full p-0 bg-brown-600 hover:bg-brown-700">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-stone-900 mb-2">Profile Picture</h4>
                            <p className="text-sm text-stone-600 mb-4">
                              Update your profile picture to help colleagues recognize you.
                            </p>
                            <div className="flex items-center space-x-3">
                              <Button size="sm" variant="outline" className="bg-white">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload New
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                            <p className="text-xs text-stone-500 mt-2">
                              Recommended: Square image, at least 400x400px. Max file size: 5MB.
                            </p>
                          </div>
                        </div>
                        
                        <div className="border-t border-stone-200 pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-stone-900">Recent uploads</span>
                            <span className="text-xs text-stone-500">Select to use</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-3">
                            <button className="relative group">
                              <Avatar className="w-12 h-12 ring-2 ring-brown-200 group-hover:ring-brown-400 transition-colors">
                                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Option 1" />
                                <AvatarFallback className="bg-brown-100 text-brown-700">JD</AvatarFallback>
                              </Avatar>
                              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            </button>
                            <button className="relative group">
                              <Avatar className="w-12 h-12 ring-2 ring-stone-200 group-hover:ring-brown-400 transition-colors">
                                <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Option 2" />
                                <AvatarFallback className="bg-blue-100 text-blue-700">JD</AvatarFallback>
                              </Avatar>
                              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            </button>
                            <button className="relative group">
                              <Avatar className="w-12 h-12 ring-2 ring-stone-200 group-hover:ring-brown-400 transition-colors">
                                <AvatarImage src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Option 3" />
                                <AvatarFallback className="bg-green-100 text-green-700">JD</AvatarFallback>
                              </Avatar>
                              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Team Performance Dashboard">
                      <div className="space-y-4">
                        <h4 className="font-medium text-stone-900">Top Performers This Quarter</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar>
                                  <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b739?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Sarah Miller" />
                                  <AvatarFallback className="bg-blue-100 text-blue-700">SM</AvatarFallback>
                                </Avatar>
                                <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                  <Crown className="w-3 h-3" />
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-stone-900">Sarah Miller</p>
                                <p className="text-sm text-stone-500">Product Manager</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">95% Goal Achievement</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar>
                                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alex Lee" />
                                  <AvatarFallback className="bg-green-100 text-green-700">AL</AvatarFallback>
                                </Avatar>
                                <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                  <Star className="w-3 h-3" />
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-stone-900">Alex Lee</p>
                                <p className="text-sm text-stone-500">UX Designer</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">88% Goal Achievement</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Best Practices Section */}
              <section id="best-practices" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Best Practices</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for effective avatar implementation in HR applications.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Always Provide Fallbacks</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            Use meaningful fallback content like initials or icons when images fail to load.
                          </p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Eye className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Consistent Sizing</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            Use consistent avatar sizes within the same context to maintain visual hierarchy.
                          </p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Meaningful Colors</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            Use color coding to represent departments, roles, or status in organizational contexts.
                          </p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Shield className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Privacy Considerations</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                            Respect employee privacy preferences and provide options to use initials instead of photos.
                          </p>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Implementation Section */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation Guide</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Complete guide for implementing avatars in your HR application.</p>
                  </div>

                  <PreviewCard title="Installation">
                    <CodeBlock
                      code={`# Install the component
npm install @radix-ui/react-avatar

# Import in your component
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';`}
                      language="bash"
                      id="installation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Complete Example">
                    <CodeBlock
                      code={`import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Crown, Mail, Phone } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  isManager: boolean;
  avatarUrl?: string;
}

export function EmployeeCard({ employee }: { employee: Employee }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-start space-x-4 p-4 border rounded-lg">
      <div className="relative">
        <Avatar className="w-16 h-16">
          <AvatarImage src={employee.avatarUrl} alt={employee.name} />
          <AvatarFallback className="bg-brown-100 text-brown-700 text-lg">
            {getInitials(employee.name)}
          </AvatarFallback>
        </Avatar>
        
        {/* Status indicator */}
        <div className={\`absolute -bottom-1 -right-1 w-5 h-5 \${getStatusColor(employee.status)} border-2 border-white rounded-full\`} />
        
        {/* Manager badge */}
        {employee.isManager && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
            <Crown className="w-3 h-3" />
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{employee.name}</h4>
            <p className="text-gray-600">{employee.role}</p>
            <p className="text-sm text-gray-500">{employee.department}</p>
          </div>
          <Badge variant={employee.status === 'online' ? 'default' : 'secondary'}>
            {employee.status}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4 mt-3">
          <div className="flex items-center space-x-1 text-gray-500">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{employee.email}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Phone className="w-4 h-4" />
            <span className="text-sm">{employee.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}`}
                      language="tsx"
                      id="complete-example"
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