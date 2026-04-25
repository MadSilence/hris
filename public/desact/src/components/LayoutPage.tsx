import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Layout as LayoutIcon, Grid3X3, Columns, Rows, Menu, Search, ChevronRight, Layers, Zap, Star, FileText, Mouse, Square, AlignLeft, CheckSquare, CreditCard, Settings, List, PieChart, Hash, AlertTriangle, Award, Upload, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Calendar, Megaphone, Timer, Shield, CheckCircle, XCircle, AlertCircle, Info, Code2, Eye, Paintbrush, Type, MessageSquare, StarIcon, Sidebar, Monitor, Smartphone, Tablet, Maximize2, Split, Users, UserPlus, DollarSign, BarChart3, Briefcase, Clock, HelpCircle, Bell, LogOut, Home, Building2, BookOpen, TrendingUp, Workflow, MapPin, Heart, Gift } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';

interface LayoutPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const LayoutPage: React.FC<LayoutPageProps> = ({
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
    onFocus: () => {
      console.log('Sidebar search focused');
    },
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
      const sections = ['overview', 'grid', 'flexbox', 'cards', 'sidebars', 'headers', 'content', 'responsive', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: LayoutIcon },
    { id: 'grid', label: 'Grid System', icon: Grid3X3 },
    { id: 'flexbox', label: 'Flexbox Layouts', icon: Columns },
    { id: 'cards', label: 'Card Layouts', icon: CreditCard },
    { id: 'sidebars', label: 'Sidebar Layouts', icon: Sidebar },
    { id: 'headers', label: 'Header Layouts', icon: Monitor },
    { id: 'content', label: 'Content Sections', icon: Square },
    { id: 'responsive', label: 'Responsive Design', icon: Smartphone },
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

  const LayoutDemo: React.FC<{ children: React.ReactNode; title: string; description: string }> = ({ 
    children, 
    title,
    description 
  }) => (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>{description}</p>
      </div>
      <PreviewCard>
        {children}
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
              className="transition-transform duration-200 hover:scale-105"
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
                  <h1 className="text-xl font-semibold">Layout System</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    Responsive
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Flexible layout components for building responsive interfaces
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
                      Layout System Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      A comprehensive set of layout components and utilities for building responsive, 
                      flexible interfaces. From grid systems to complex application layouts, our layout 
                      system provides the building blocks for any design.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Grid3X3 className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Grid Systems</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Flexible CSS Grid and Flexbox layouts for organizing content in rows and columns.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Smartphone className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Responsive Design</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Mobile-first approach with breakpoint-based responsive utilities.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Sidebar className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Application Layouts</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Pre-built patterns for sidebars, headers, and complex application structures.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Grid System */}
              <section id="grid" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Grid System
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      CSS Grid-based layout system with responsive breakpoints and flexible column configurations.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <LayoutDemo
                      title="Basic Grid Layout"
                      description="Simple grid with auto-fitting columns"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-brown-100 rounded-lg p-4 text-center">
                          <div className="h-20 flex items-center justify-center">Item 1</div>
                        </div>
                        <div className="bg-brown-100 rounded-lg p-4 text-center">
                          <div className="h-20 flex items-center justify-center">Item 2</div>
                        </div>
                        <div className="bg-brown-100 rounded-lg p-4 text-center">
                          <div className="h-20 flex items-center justify-center">Item 3</div>
                        </div>
                      </div>
                    </LayoutDemo>

                    <LayoutDemo
                      title="Complex Grid Layout"
                      description="Grid with spanning elements and different sizes"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 bg-brown-100 rounded-lg p-4">
                          <div className="h-32 flex items-center justify-center">Main Content</div>
                        </div>
                        <div className="bg-brown-100 rounded-lg p-4">
                          <div className="h-32 flex items-center justify-center">Sidebar</div>
                        </div>
                        <div className="bg-brown-100 rounded-lg p-4">
                          <div className="h-32 flex items-center justify-center">Widget</div>
                        </div>
                        <div className="md:col-span-4 bg-brown-100 rounded-lg p-4">
                          <div className="h-20 flex items-center justify-center">Footer Content</div>
                        </div>
                      </div>
                    </LayoutDemo>

                    <CodeBlock
                      code={`<!-- Basic Grid Layout -->
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="bg-brown-100 rounded-lg p-4">Item 1</div>
  <div className="bg-brown-100 rounded-lg p-4">Item 2</div>
  <div className="bg-brown-100 rounded-lg p-4">Item 3</div>
</div>

<!-- Complex Grid with Spanning -->
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="md:col-span-2 bg-brown-100 rounded-lg p-4">
    Main Content
  </div>
  <div className="bg-brown-100 rounded-lg p-4">Sidebar</div>
  <div className="bg-brown-100 rounded-lg p-4">Widget</div>
  <div className="md:col-span-4 bg-brown-100 rounded-lg p-4">
    Footer Content
  </div>
</div>`}
                      language="html"
                      id="grid-layout"
                    />
                  </div>
                </div>
              </section>

              {/* Flexbox Layouts */}
              <section id="flexbox" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Flexbox Layouts
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Flexible box layouts for one-dimensional arrangements with powerful alignment and spacing options.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <LayoutDemo
                      title="Horizontal Layout"
                      description="Items arranged horizontally with space between"
                    >
                      <div className="flex flex-wrap gap-4 justify-between">
                        <div className="bg-brown-100 rounded-lg p-4 flex-1 min-w-0">
                          <div className="h-16 flex items-center justify-center">Flexible Item</div>
                        </div>
                        <div className="bg-brown-100 rounded-lg p-4 flex-shrink-0">
                          <div className="h-16 flex items-center justify-center">Fixed Item</div>
                        </div>
                      </div>
                    </LayoutDemo>

                    <LayoutDemo
                      title="Vertical Stack"
                      description="Items stacked vertically with consistent spacing"
                    >
                      <div className="flex flex-col space-y-4">
                        <div className="bg-brown-100 rounded-lg p-4">
                          <div className="h-12 flex items-center justify-center">Header</div>
                        </div>
                        <div className="bg-brown-100 rounded-lg p-4 flex-1">
                          <div className="h-24 flex items-center justify-center">Main Content</div>
                        </div>
                        <div className="bg-brown-100 rounded-lg p-4">
                          <div className="h-12 flex items-center justify-center">Footer</div>
                        </div>
                      </div>
                    </LayoutDemo>

                    <LayoutDemo
                      title="Center Alignment"
                      description="Perfect centering using flexbox"
                    >
                      <div className="bg-brown-50 rounded-lg h-48 flex items-center justify-center">
                        <div className="bg-brown-100 rounded-lg p-6">
                          <div className="text-center">Perfectly Centered</div>
                        </div>
                      </div>
                    </LayoutDemo>
                  </div>
                </div>
              </section>

              {/* Card Layouts */}
              <section id="cards" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Card Layouts
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Card-based layouts for organizing content in digestible, visually separated sections.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <LayoutDemo
                      title="Product Cards"
                      description="Grid of cards with consistent sizing"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((item) => (
                          <Card key={item} className="border-brown-200 overflow-hidden">
                            <div className="bg-brown-100 h-32"></div>
                            <div className="p-4">
                              <h3 className="font-semibold mb-2">Product {item}</h3>
                              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                Product description goes here with details about the item.
                              </p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </LayoutDemo>

                    <LayoutDemo
                      title="Feature Cards"
                      description="Horizontal cards with icon and content"
                    >
                      <div className="space-y-4">
                        {[
                          { icon: Grid3X3, title: "Flexible Grid", desc: "Responsive grid system" },
                          { icon: Smartphone, title: "Mobile First", desc: "Optimized for mobile devices" },
                          { icon: Code2, title: "Developer Friendly", desc: "Easy to implement and customize" }
                        ].map((feature, index) => (
                          <Card key={index} className="border-brown-200">
                            <div className="p-6 flex items-start gap-4">
                              <div className="bg-brown-100 rounded-lg p-3 flex-shrink-0">
                                <feature.icon className="w-6 h-6 text-brown-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                                  {feature.desc}
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </LayoutDemo>
                  </div>
                </div>
              </section>

              {/* Sidebar Layouts */}
              <section id="sidebars" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Sidebar Layouts
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Real-world HR dashboard sidebar navigation examples with nested menus, proper icons, and professional structure.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <LayoutDemo
                      title="HR Dashboard - Main Navigation"
                      description="Complete HR dashboard sidebar with all essential modules"
                    >
                      <div className="flex h-96 bg-brown-50 rounded-lg overflow-hidden">
                        <div className="w-64 bg-white border-r border-brown-200 flex flex-col">
                          {/* Header */}
                          <div className="p-4 border-b border-brown-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-brown-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm">HR Portal</h3>
                                <p className="text-xs text-brown-500">Acme Corp</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Navigation */}
                          <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                            {/* Dashboard */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brown-50 text-brown-700">
                              <Home className="w-4 h-4" />
                              <span className="text-sm font-medium">Dashboard</span>
                            </div>
                            
                            {/* Employee Management */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                                <Users className="w-4 h-4 text-brown-600" />
                                <span className="text-sm">Employee Management</span>
                                <ChevronRight className="w-3 h-3 ml-auto text-brown-400" />
                              </div>
                              <div className="ml-7 space-y-1">
                                <div className="flex items-center gap-2 px-3 py-1 text-xs text-brown-600 hover:text-brown-700 cursor-pointer">
                                  <div className="w-1 h-1 bg-brown-400 rounded-full"></div>
                                  All Employees
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 text-xs text-brown-600 hover:text-brown-700 cursor-pointer">
                                  <div className="w-1 h-1 bg-brown-400 rounded-full"></div>
                                  Add Employee
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 text-xs text-brown-600 hover:text-brown-700 cursor-pointer">
                                  <div className="w-1 h-1 bg-brown-400 rounded-full"></div>
                                  Departments
                                </div>
                              </div>
                            </div>

                            {/* Recruitment */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <UserPlus className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Recruitment</span>
                              <Badge className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5">12</Badge>
                            </div>

                            {/* Payroll */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <DollarSign className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Payroll</span>
                            </div>

                            {/* Attendance */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <Clock className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Attendance</span>
                            </div>

                            {/* Performance */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <TrendingUp className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Performance</span>
                            </div>

                            {/* Leave Management */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <Calendar className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Leave Management</span>
                              <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                            </div>

                            {/* Training */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <BookOpen className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Training</span>
                            </div>

                            {/* Reports */}
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <BarChart3 className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Reports</span>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="p-4 border-t border-brown-100">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <Settings className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Settings</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 p-6 flex items-center justify-center">
                          <div className="text-center">
                            <h3 className="font-semibold mb-2">Dashboard Content</h3>
                            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                              Main dashboard area with widgets, charts, and employee data
                            </p>
                          </div>
                        </div>
                      </div>
                    </LayoutDemo>

                    <LayoutDemo
                      title="HR Dashboard - Employee Profile Sidebar"
                      description="Employee-focused navigation with quick actions"
                    >
                      <div className="flex h-80 bg-brown-50 rounded-lg overflow-hidden">
                        <div className="w-56 bg-white border-r border-brown-200 flex flex-col">
                          {/* Profile Header */}
                          <div className="p-4 border-b border-brown-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-brown-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-brown-700">JD</span>
                              </div>
                              <div>
                                <h3 className="font-medium text-sm">John Doe</h3>
                                <p className="text-xs text-brown-500">Software Engineer</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="p-4 space-y-1">
                            <h4 className="text-xs font-medium text-brown-500 uppercase tracking-wide mb-2">Quick Actions</h4>
                            
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <Clock className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Clock In/Out</span>
                            </div>
                            
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <Calendar className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Request Leave</span>
                            </div>
                            
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <Briefcase className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">My Tasks</span>
                              <Badge className="ml-auto bg-orange-100 text-orange-700 text-xs px-2 py-0.5">5</Badge>
                            </div>
                            
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <DollarSign className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Payslips</span>
                            </div>
                            
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <Heart className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Benefits</span>
                            </div>
                          </div>

                          {/* Support */}
                          <div className="mt-auto p-4 border-t border-brown-100">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <HelpCircle className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">Help & Support</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 p-6 flex items-center justify-center">
                          <div className="text-center">
                            <h3 className="font-semibold mb-2">Employee Dashboard</h3>
                            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                              Personal employee dashboard with quick stats and recent activities
                            </p>
                          </div>
                        </div>
                      </div>
                    </LayoutDemo>

                    <LayoutDemo
                      title="HR Dashboard - Admin Panel"
                      description="Administrative sidebar with system management options"
                    >
                      <div className="flex h-80 bg-brown-50 rounded-lg overflow-hidden">
                        <div className="w-60 bg-white border-r border-brown-200 flex flex-col">
                          {/* Admin Header */}
                          <div className="p-4 border-b border-brown-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <Shield className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm">Admin Panel</h3>
                                <p className="text-xs text-brown-500">System Management</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Admin Navigation */}
                          <div className="flex-1 p-4 space-y-1">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-brown-50 text-brown-700">
                              <Gauge className="w-4 h-4" />
                              <span className="text-sm font-medium">Overview</span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                                <Users className="w-4 h-4 text-brown-600" />
                                <span className="text-sm">User Management</span>
                              </div>
                              
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                                <Building2 className="w-4 h-4 text-brown-600" />
                                <span className="text-sm">Organization</span>
                              </div>
                              
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                                <Workflow className="w-4 h-4 text-brown-600" />
                                <span className="text-sm">Workflows</span>
                              </div>
                              
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                                <MapPin className="w-4 h-4 text-brown-600" />
                                <span className="text-sm">Locations</span>
                              </div>
                              
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                                <Gift className="w-4 h-4 text-brown-600" />
                                <span className="text-sm">Benefits Config</span>
                              </div>
                              
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                                <BarChart3 className="w-4 h-4 text-brown-600" />
                                <span className="text-sm">Analytics</span>
                              </div>
                              
                              <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                                <Bell className="w-4 h-4 text-brown-600" />
                                <span className="text-sm">Notifications</span>
                                <div className="w-2 h-2 bg-orange-500 rounded-full ml-auto"></div>
                              </div>
                            </div>
                          </div>

                          {/* Admin Footer */}
                          <div className="p-4 border-t border-brown-100 space-y-1">
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brown-50 cursor-pointer">
                              <Settings className="w-4 h-4 text-brown-600" />
                              <span className="text-sm">System Settings</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer">
                              <LogOut className="w-4 h-4" />
                              <span className="text-sm">Sign Out</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1 p-6 flex items-center justify-center">
                          <div className="text-center">
                            <h3 className="font-semibold mb-2">Admin Dashboard</h3>
                            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                              System administration interface with management tools and settings
                            </p>
                          </div>
                        </div>
                      </div>
                    </LayoutDemo>

                    <CodeBlock
                      code={`{/* HR Dashboard Sidebar Component */}
const HRSidebar = () => {
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  return (
    <div className="w-64 bg-white border-r border-brown-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-brown-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brown-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">HR Portal</h3>
            <p className="text-xs text-brown-500">Acme Corp</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <NavItem 
          icon={Home} 
          label="Dashboard" 
          isActive={true} 
        />
        
        {/* Employee Management */}
        <NavItem 
          icon={Users} 
          label="Employee Management"
          hasSubmenu={true}
          isExpanded={expandedMenus.includes('employees')}
          onClick={() => toggleMenu('employees')}
        />
        {expandedMenus.includes('employees') && (
          <div className="ml-7 space-y-1">
            <SubNavItem label="All Employees" />
            <SubNavItem label="Add Employee" />
            <SubNavItem label="Departments" />
          </div>
        )}
        
        {/* Other menu items */}
        <NavItem icon={UserPlus} label="Recruitment" badge="12" />
        <NavItem icon={DollarSign} label="Payroll" />
        <NavItem icon={Clock} label="Attendance" />
        <NavItem icon={TrendingUp} label="Performance" />
        <NavItem icon={Calendar} label="Leave Management" hasNotification={true} />
        <NavItem icon={BookOpen} label="Training" />
        <NavItem icon={BarChart3} label="Reports" />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-brown-100">
        <NavItem icon={Settings} label="Settings" />
      </div>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, isActive, badge, hasNotification, hasSubmenu, isExpanded, onClick }) => (
  <div 
    className={\`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer \${
      isActive ? 'bg-brown-50 text-brown-700' : 'hover:bg-brown-50'
    }\`}
    onClick={onClick}
  >
    <Icon className="w-4 h-4 text-brown-600" />
    <span className="text-sm">{label}</span>
    {badge && (
      <Badge className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
        {badge}
      </Badge>
    )}
    {hasNotification && (
      <div className="w-2 h-2 bg-red-500 rounded-full ml-auto" />
    )}
    {hasSubmenu && (
      <ChevronRight className={\`w-3 h-3 ml-auto text-brown-400 transition-transform \${
        isExpanded ? 'rotate-90' : ''
      }\`} />
    )}
  </div>
);`}
                      language="tsx"
                      id="hr-sidebar"
                    />
                  </div>
                </div>
              </section>

              {/* Implementation */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                      Implementation Guide
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Best practices and implementation details for using our layout system effectively.
                    </p>
                  </div>

                  <PreviewCard title="Layout Component Structure">
                    <CodeBlock
                      code={`import React from 'react';

// Application Layout Component
export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-brown-50/30 flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-brown-200 flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-brown-100">
          <h2 className="font-semibold">Navigation</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Navigation content */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-brown-200 sticky top-0">
          <div className="px-6 py-4">
            <h1 className="text-xl font-semibold">Page Title</h1>
          </div>
        </header>
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// Grid Layout Component
export const GridLayout: React.FC<{ 
  children: React.ReactNode;
  columns?: string;
  gap?: string;
}> = ({ 
  children, 
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  gap = "gap-6"
}) => {
  return (
    <div className={\`grid \${columns} \${gap}\`}>
      {children}
    </div>
  );
};`}
                      language="tsx"
                      id="layout-implementation"
                    />
                  </PreviewCard>

                  <PreviewCard title="Responsive Breakpoints">
                    <CodeBlock
                      code={`/* Tailwind CSS Breakpoints */

/* Mobile First Approach */
.container {
  /* Mobile (default) - 0px and up */
  padding: 1rem;
}

/* Tablet - 768px and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* Desktop - 1024px and up */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
  }
}

/* Large Desktop - 1280px and up */
@media (min-width: 1280px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Utility Classes */
.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
  @apply gap-4 md:gap-6 lg:gap-8;
}

.sidebar-layout {
  @apply flex flex-col lg:flex-row;
}

.sidebar-layout .sidebar {
  @apply w-full lg:w-72 lg:sticky lg:top-0 lg:h-screen;
}

.sidebar-layout .main {
  @apply flex-1 min-w-0;
}`}
                      language="css"
                      id="responsive-breakpoints"
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