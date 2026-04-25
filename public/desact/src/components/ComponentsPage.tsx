import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Package, Layers, Zap, Star, Grid3X3, Search, ChevronRight, ChevronDown, Menu, FileText, Code2, Eye, Paintbrush, Type, Layout, Navigation, Settings, User, Heart, Target, TrendingUp, Building2, Users, Briefcase, Award, Shield, Calendar, Bell, Database, Monitor, Smartphone, Filter, Download, Plus, MoreHorizontal, Activity, Command, Edit, PaletteIcon, Hash, AlertTriangle, Upload, Gauge, ArrowUpDown, Coffee, Plane, GraduationCap, DollarSign, Clock, BookOpen, CheckCircle, AlertCircle, HelpCircle, MapPin, Mail, Phone, Megaphone, Timer, XCircle, Info, Home, RefreshCw, UserPlus, FileBarChart, Clipboard, MessageSquare, UserCheck, Workflow, Gift, BarChart3 } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';
import { ComponentCard } from './ComponentCard';

interface ComponentsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const ComponentsPage: React.FC<ComponentsPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      const sections = ['overview', 'all-components', 'base-components', 'application-ui', 'marketing', 'documentation', 'usage-examples'];
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
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'all-components', label: 'All Components', icon: Grid3X3 },
    { id: 'base-components', label: 'Base Components', icon: Layers },
    { id: 'application-ui', label: 'Application UI', icon: Monitor },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'usage-examples', label: 'Usage Examples', icon: Code2 },
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

  // Filter components for main content based on category and search
  const getFilteredComponents = () => {
    let filtered = components;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(component => component.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(component =>
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const categories = ['all', ...Object.keys(componentsByCategory)];
  const totalComponents = components.length;
  const filteredComponents = getFilteredComponents();

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
                    {!collapsedCategories.has(category) ? (
                      <ChevronDown className="w-4 h-4 transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 transition-transform" />
                    )}
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
                  <h1 className="text-xl font-semibold">Component Library</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    {totalComponents} Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Complete collection of HR-focused UI components and patterns
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
                      Complete Component Library
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-4xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Explore our comprehensive collection of {totalComponents} carefully crafted components designed specifically 
                      for HR applications. From basic UI elements to complex application patterns, 
                      each component follows design system principles and accessibility standards.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Package className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">56+ Components</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Base components, application UI patterns, marketing elements, and documentation helpers.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">HR Focused</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Every component includes HR-specific examples and use cases for employee management workflows.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Code2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Ready to Use</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Copy-paste ready code with TypeScript support, accessibility features, and responsive design.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Library Statistics">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {Object.entries(componentsByCategory).map(([category, categoryComponents]) => {
                        const IconComponent = categoryIcons[category] || Package;
                        return (
                          <div key={category} className="text-center">
                            <div className="w-10 h-10 bg-brown-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <IconComponent className="w-5 h-5 text-brown-600" />
                            </div>
                            <div className="text-2xl font-bold text-brown-700">{categoryComponents.length}</div>
                            <div className="text-sm text-gray-600">{category}</div>
                          </div>
                        );
                      })}
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* All Components Section */}
              <section id="all-components" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>All Components</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Browse and filter through our complete component collection</p>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search components..."
                        className="pl-10 bg-brown-50 border-brown-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className={selectedCategory === category ? "bg-brown-600 hover:bg-brown-700" : ""}
                        >
                          {category === 'all' ? 'All' : category}
                          {category !== 'all' && (
                            <Badge variant="secondary" className="ml-2 bg-brown-100 text-brown-700 text-xs">
                              {componentsByCategory[category]?.length || 0}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Component Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredComponents.map((component) => (
                      <ComponentCard
                        key={component.name}
                        name={component.name}
                        blockCount={component.blockCount}
                        thumbnail={component.thumbnail}
                        onClick={() => onComponentClick(component.name)}
                      />
                    ))}
                  </div>

                  {filteredComponents.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No components found</h3>
                      <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Base Components Section */}
              <section id="base-components" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Base Components</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Fundamental building blocks for your HR applications</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {componentsByCategory['Base components']?.map((component) => (
                      <ComponentCard
                        key={component.name}
                        name={component.name}
                        blockCount={component.blockCount}
                        thumbnail={component.thumbnail}
                        onClick={() => onComponentClick(component.name)}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Application UI Section */}
              <section id="application-ui" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Application UI</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Complex patterns and layouts for enterprise HR applications</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {componentsByCategory['Application UI']?.map((component) => (
                      <ComponentCard
                        key={component.name}
                        name={component.name}
                        blockCount={component.blockCount}
                        thumbnail={component.thumbnail}
                        onClick={() => onComponentClick(component.name)}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Marketing Section */}
              <section id="marketing" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Marketing Components</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Landing pages, hero sections, and promotional elements</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {componentsByCategory['Marketing']?.map((component) => (
                      <ComponentCard
                        key={component.name}
                        name={component.name}
                        blockCount={component.blockCount}
                        thumbnail={component.thumbnail}
                        onClick={() => onComponentClick(component.name)}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Documentation Section */}
              <section id="documentation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Documentation Components</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Components for creating documentation and help systems</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {componentsByCategory['Documentation']?.map((component) => (
                      <ComponentCard
                        key={component.name}
                        name={component.name}
                        blockCount={component.blockCount}
                        thumbnail={component.thumbnail}
                        onClick={() => onComponentClick(component.name)}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Usage Examples Section */}
              <section id="usage-examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Usage Examples</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Learn how to implement and customize components</p>
                  </div>

                  <PreviewCard title="Quick Start Guide">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center text-brown-600 font-medium text-sm">1</div>
                        <div>
                          <h4 className="font-medium mb-1">Browse Components</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Use the search and filter tools to find the component you need.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center text-brown-600 font-medium text-sm">2</div>
                        <div>
                          <h4 className="font-medium mb-1">View Examples</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Click on any component to see detailed examples and implementation guides.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-brown-100 rounded-full flex items-center justify-center text-brown-600 font-medium text-sm">3</div>
                        <div>
                          <h4 className="font-medium mb-1">Copy & Customize</h4>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Use the copy buttons to get the code and customize it for your needs.</p>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Implementation Example">
                    <CodeBlock
                      code={`import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';

function HRDashboard() {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Employee Management</h2>
        <div className="flex gap-4">
          <Input placeholder="Search employees..." className="flex-1" />
          <Button>Search</Button>
          <Button variant="outline">Add Employee</Button>
        </div>
      </div>
    </Card>
  );
}`}
                      language="tsx"
                      id="implementation-example"
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