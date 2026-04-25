import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, Grid3X3, Package, Award, Code2, Users, Building2, Clock, Calendar, BarChart3, FileText, Settings, Activity, Briefcase, UserCheck, Eye, Loader2, Sparkles, RefreshCw, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';

import { DesactLogo } from './shared/DesactLogo';

interface SkeletonsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const SkeletonsPage: React.FC<SkeletonsPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

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

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'basic-skeletons', 'card-skeletons', 'list-skeletons', 'form-skeletons', 'table-skeletons', 'hr-examples', 'interactive-states', 'best-practices', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: Grid3X3 },
    { id: 'basic-skeletons', label: 'Basic Skeletons', icon: Package },
    { id: 'card-skeletons', label: 'Card Skeletons', icon: Award },
    { id: 'list-skeletons', label: 'List Skeletons', icon: FileText },
    { id: 'form-skeletons', label: 'Form Skeletons', icon: Settings },
    { id: 'table-skeletons', label: 'Table Skeletons', icon: BarChart3 },
    { id: 'hr-examples', label: 'HR Examples', icon: Building2 },
    { id: 'interactive-states', label: 'Interactive States', icon: Activity },
    { id: 'best-practices', label: 'Best Practices', icon: Eye },
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
                  <h1 className="text-xl font-semibold">Skeletons</h1>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                    Loading States
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Skeleton loading states for better user experience during data fetching
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
                      Skeletons Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Skeleton components provide visual placeholders while content is loading, improving perceived performance 
                      and user experience in HR applications and dashboards.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Basic Elements</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Simple skeleton shapes for text, avatars, and basic content blocks.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Complex Layouts</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Card layouts, lists, and forms with structured skeleton patterns.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Building2 className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">HR Specific</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Employee profiles, dashboards, and HR workflow loading states.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Benefits & Use Cases">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Performance Benefits</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Improved perceived loading speed</li>
                          <li>• Reduced bounce rates during data fetching</li>
                          <li>• Better user experience with visual feedback</li>
                          <li>• Maintains layout structure while loading</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">HR Applications</h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Employee directory and profile loading</li>
                          <li>• Performance dashboard data visualization</li>
                          <li>• Form submissions and data processing</li>
                          <li>• Payroll and benefits information display</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Basic Skeletons */}
              <section id="basic-skeletons" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Basic Skeletons</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Fundamental skeleton components for text, images, and basic UI elements.</p>
                  </div>

                  <PreviewCard title="Text Skeletons">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Single Line Text</p>
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Multiple Lines</p>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                          <Skeleton className="h-4 w-4/6" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Paragraph</p>
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-11/12" />
                          <Skeleton className="h-3 w-4/5" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Avatar & Image Skeletons">
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium mb-3">Avatar Sizes</p>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <Skeleton className="h-16 w-16 rounded-full" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-3">Image Placeholders</p>
                        <div className="grid grid-cols-3 gap-4">
                          <Skeleton className="h-24 w-full rounded-md" />
                          <Skeleton className="h-32 w-full rounded-md" />
                          <Skeleton className="h-20 w-full rounded-md" />
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Button & Input Skeletons">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Buttons</p>
                        <div className="flex gap-3">
                          <Skeleton className="h-9 w-20 rounded-md" />
                          <Skeleton className="h-9 w-24 rounded-md" />
                          <Skeleton className="h-10 w-32 rounded-md" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Form Inputs</p>
                        <div className="space-y-3">
                          <Skeleton className="h-10 w-full rounded-md" />
                          <Skeleton className="h-20 w-full rounded-md" />
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Basic skeleton usage
import { Skeleton } from "./ui/skeleton";

// Text skeleton
<Skeleton className="h-4 w-3/4" />

// Avatar skeleton
<Skeleton className="h-12 w-12 rounded-full" />

// Multiple lines
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-5/6" />
  <Skeleton className="h-4 w-4/6" />
</div>`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'basic-skeleton-code')}
                      copied={copiedCode === 'basic-skeleton-code'}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Card Skeletons */}
              <section id="card-skeletons" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Card Skeletons</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Skeleton layouts for cards, widgets, and content blocks.</p>
                  </div>

                  <PreviewCard title="Employee Profile Card">
                    <Card className="p-4 border-gray-200">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-40" />
                          <div className="flex gap-2 pt-2">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </PreviewCard>

                  <PreviewCard title="Dashboard Widget">
                    <Card className="p-6 border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-4 rounded" />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-3 w-full" />
                        <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    </Card>
                  </PreviewCard>

                  <PreviewCard title="News/Announcement Card">
                    <Card className="p-4 border-gray-200">
                      <div className="space-y-3">
                        <Skeleton className="h-32 w-full rounded-md" />
                        <Skeleton className="h-5 w-3/4" />
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-5/6" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </Card>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Employee profile card skeleton
<Card className="p-4">
  <div className="flex items-start gap-4">
    <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-40" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  </div>
</Card>`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'card-skeleton-code')}
                      copied={copiedCode === 'card-skeleton-code'}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* List Skeletons */}
              <section id="list-skeletons" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>List Skeletons</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Loading states for employee lists, task lists, and data collections.</p>
                  </div>

                  <PreviewCard title="Employee Directory List">
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Task List">
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Skeleton className="h-4 w-4 rounded-sm flex-shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex items-center gap-4">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-5 w-12 rounded-full" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Notification List">
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                          <Skeleton className="h-4 w-4 rounded flex-shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-2 w-2 rounded-full flex-shrink-0 mt-2" />
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Employee list skeleton
<div className="space-y-4">
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  ))}
</div>`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'list-skeleton-code')}
                      copied={copiedCode === 'list-skeleton-code'}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Form Skeletons */}
              <section id="form-skeletons" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Form Skeletons</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Loading states for forms, inputs, and data entry interfaces.</p>
                  </div>

                  <PreviewCard title="Employee Registration Form">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-20 w-full rounded-md" />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Skeleton className="h-10 w-20 rounded-md" />
                        <Skeleton className="h-10 w-24 rounded-md" />
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Performance Review Form">
                    <div className="space-y-6">
                      <div>
                        <Skeleton className="h-5 w-48 mb-4" />
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-16 w-full rounded-md" />
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <div className="flex gap-4">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-8 w-8 rounded" />
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-20 w-full rounded-md" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Form skeleton with fields
<div className="space-y-6">
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  </div>
  <div className="space-y-2">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-20 w-full rounded-md" />
  </div>
  <div className="flex gap-3">
    <Skeleton className="h-10 w-20 rounded-md" />
    <Skeleton className="h-10 w-24 rounded-md" />
  </div>
</div>`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'form-skeleton-code')}
                      copied={copiedCode === 'form-skeleton-code'}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Table Skeletons */}
              <section id="table-skeletons" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Table Skeletons</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Loading states for data tables, employee rosters, and tabular data.</p>
                  </div>

                  <PreviewCard title="Employee Data Table">
                    <div className="space-y-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-5 gap-4 pb-3 border-b border-gray-200">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-18" />
                        <Skeleton className="h-4 w-14" />
                      </div>
                      
                      {/* Table Rows */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <div className="flex gap-1">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-6 w-6 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Payroll Summary Table">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="grid grid-cols-6 gap-3 p-3 bg-gray-50 rounded-t-lg">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-18" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-18" />
                        <Skeleton className="h-4 w-14" />
                      </div>
                      
                      {/* Rows */}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-6 gap-3 p-3 border-b border-gray-100">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-14" />
                          <Skeleton className="h-4 w-18" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Table skeleton structure
<div className="space-y-4">
  {/* Table Header */}
  <div className="grid grid-cols-5 gap-4 pb-3 border-b">
    <Skeleton className="h-4 w-16" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-4 w-18" />
    <Skeleton className="h-4 w-14" />
  </div>
  
  {/* Table Rows */}
  {Array.from({ length: 8 }).map((_, i) => (
    <div key={i} className="grid grid-cols-5 gap-4 py-3 border-b">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-6 w-6 rounded" />
    </div>
  ))}
</div>`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'table-skeleton-code')}
                      copied={copiedCode === 'table-skeleton-code'}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* HR Examples */}
              <section id="hr-examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>HR Examples</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Specialized skeleton patterns for HR dashboards and workflows.</p>
                  </div>

                  <PreviewCard title="HR Dashboard Skeleton">
                    <div className="space-y-6">
                      {/* Header Stats */}
                      <div className="grid grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Card key={i} className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-4 rounded" />
                              </div>
                              <Skeleton className="h-8 w-20" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      {/* Chart Section */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <Card className="p-6">
                          <div className="space-y-4">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-48 w-full rounded" />
                          </div>
                        </Card>
                        <Card className="p-6">
                          <div className="space-y-4">
                            <Skeleton className="h-5 w-28" />
                            <div className="space-y-3">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-4 w-12" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Employee Timeline">
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <Skeleton className="h-3 w-3 rounded-full" />
                            {i < 3 && <Skeleton className="h-12 w-0.5 mt-2" />}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-3 w-full mb-1" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Org Chart Skeleton">
                    <div className="space-y-6">
                      {/* CEO Level */}
                      <div className="flex justify-center">
                        <Card className="p-4 w-48">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </Card>
                      </div>
                      
                      {/* Department Level */}
                      <div className="grid grid-cols-3 gap-4 px-8">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="p-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-3 w-18" />
                                <Skeleton className="h-3 w-14" />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      
                      {/* Team Level */}
                      <div className="grid grid-cols-6 gap-2 px-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="flex flex-col items-center space-y-1">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Interactive States */}
              <section id="interactive-states" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Interactive States</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Animated and interactive skeleton states for better user feedback.</p>
                  </div>

                  <PreviewCard title="Loading States Demo">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Button 
                          onClick={simulateLoading}
                          disabled={isLoading}
                          className="flex items-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4" />
                              Simulate Loading
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <Card className="p-4">
                          <div className="flex items-start gap-4">
                            {isLoading ? (
                              <>
                                <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-5 w-32" />
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-3 w-40" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="h-16 w-16 rounded-full bg-brown-100 flex items-center justify-center flex-shrink-0">
                                  <Users className="h-8 w-8 text-brown-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold">Sarah Johnson</h3>
                                  <p className="text-sm text-gray-600">Senior Developer</p>
                                  <p className="text-xs text-gray-500">Engineering Department</p>
                                </div>
                              </>
                            )}
                          </div>
                        </Card>
                        
                        <Card className="p-4">
                          <div className="space-y-3">
                            {isLoading ? (
                              <>
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-32 w-full rounded" />
                              </>
                            ) : (
                              <>
                                <h3 className="font-semibold">Performance Chart</h3>
                                <div className="h-32 bg-gradient-to-r from-brown-100 to-brown-200 rounded flex items-center justify-center">
                                  <BarChart3 className="h-12 w-12 text-brown-600" />
                                </div>
                              </>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Shimmer Effect Skeleton">
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-lg bg-gray-200 h-4 w-3/4">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                      </div>
                      <div className="relative overflow-hidden rounded-lg bg-gray-200 h-4 w-1/2">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                      </div>
                      <div className="relative overflow-hidden rounded-lg bg-gray-200 h-4 w-5/6">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Pulse Animation">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Interactive loading state
const [isLoading, setIsLoading] = useState(true);

// Simulate loading
const simulateLoading = () => {
  setIsLoading(true);
  setTimeout(() => setIsLoading(false), 2000);
};

// Conditional rendering
{isLoading ? (
  <div className="flex items-start gap-4">
    <Skeleton className="h-16 w-16 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
) : (
  <div className="flex items-start gap-4">
    <img src="avatar.jpg" className="h-16 w-16 rounded-full" />
    <div>
      <h3>John Doe</h3>
      <p>Software Engineer</p>
    </div>
  </div>
)}`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'interactive-skeleton-code')}
                      copied={copiedCode === 'interactive-skeleton-code'}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Best Practices */}
              <section id="best-practices" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Best Practices</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines and recommendations for effective skeleton implementation.</p>
                  </div>

                  <PreviewCard title="Design Principles">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-brown-600" />
                          Visual Guidelines
                        </h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Match the dimensions of actual content</li>
                          <li>• Use consistent border radius and spacing</li>
                          <li>• Maintain proper contrast for visibility</li>
                          <li>• Keep skeleton shapes simple and recognizable</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-brown-600" />
                          Timing & Animation
                        </h4>
                        <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>• Show skeletons immediately on load</li>
                          <li>• Use subtle animations (pulse, shimmer)</li>
                          <li>• Transition smoothly to real content</li>
                          <li>• Keep animation duration between 1-2 seconds</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Do's and Don'ts">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-medium mb-4 text-green-700 flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Do's
                        </h4>
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span>Match skeleton structure to actual content layout</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span>Use progressive loading for complex interfaces</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span>Test with different screen sizes and data loads</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <span>Provide skeleton variants for different content types</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-4 text-red-700 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Don'ts
                        </h4>
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <span>Don't make skeletons too detailed or distracting</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <span>Don't show skeletons for very fast loading content</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <span>Don't use overly bright colors or high contrast</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                            <span>Don't forget to handle error states alongside loading</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="HR-Specific Considerations">
                    <div className="space-y-4">
                      <div className="p-4 bg-brown-50 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-brown-600" />
                          Employee Data Privacy
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          When creating skeletons for employee profiles and sensitive HR data, ensure the loading 
                          states don't inadvertently reveal information structure that could be considered private.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          Performance Considerations
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          For large employee directories or complex org charts, implement progressive loading 
                          with skeleton states to maintain good performance and user experience.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-green-600" />
                          Real-time Updates
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                          For HR dashboards with real-time data (attendance, performance metrics), use skeleton 
                          states during data refresh to indicate system activity.
                        </p>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Implementation */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Technical implementation details and code examples for skeleton components.</p>
                  </div>

                  <PreviewCard title="Basic Setup">
                    <CodeBlock
                      code={`// Install or ensure skeleton component is available
import { Skeleton } from "./ui/skeleton";

// Basic skeleton component usage
const SkeletonCard = () => (
  <div className="p-4 border rounded-lg">
    <div className="flex items-start gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  </div>
);`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'implementation-setup')}
                      copied={copiedCode === 'implementation-setup'}
                    />
                  </PreviewCard>

                  <PreviewCard title="Custom Skeleton Hook">
                    <CodeBlock
                      code={`// Custom hook for skeleton management
import { useState, useEffect } from 'react';

interface UseSkeletonOptions {
  delay?: number;
  minDuration?: number;
}

export const useSkeleton = (
  isLoading: boolean, 
  options: UseSkeletonOptions = {}
) => {
  const { delay = 0, minDuration = 500 } = options;
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      if (delay > 0) {
        timeoutId = setTimeout(() => {
          setShowSkeleton(true);
          setStartTime(Date.now());
        }, delay);
      } else {
        setShowSkeleton(true);
        setStartTime(Date.now());
      }
    } else {
      const elapsed = startTime ? Date.now() - startTime : 0;
      const remaining = Math.max(0, minDuration - elapsed);
      
      timeoutId = setTimeout(() => {
        setShowSkeleton(false);
        setStartTime(null);
      }, remaining);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, delay, minDuration, startTime]);

  return showSkeleton;
};

// Usage example
const EmployeeCard = ({ employeeId }: { employeeId: string }) => {
  const { data: employee, isLoading } = useEmployee(employeeId);
  const showSkeleton = useSkeleton(isLoading, { delay: 200, minDuration: 500 });

  if (showSkeleton) {
    return <EmployeeCardSkeleton />;
  }

  return <EmployeeCardContent employee={employee} />;
};`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'implementation-hook')}
                      copied={copiedCode === 'implementation-hook'}
                    />
                  </PreviewCard>

                  <PreviewCard title="Responsive Skeleton Component">
                    <CodeBlock
                      code={`// Responsive skeleton component
interface ResponsiveSkeletonProps {
  lines?: number;
  className?: string;
  avatar?: boolean;
}

const ResponsiveSkeleton: React.FC<ResponsiveSkeletonProps> = ({
  lines = 3,
  className = "",
  avatar = false
}) => {
  return (
    <div className={className}>
      <div className="flex items-start gap-4">
        {avatar && (
          <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, index) => {
            // Vary line widths for more natural look
            const widths = ['w-3/4', 'w-1/2', 'w-5/6', 'w-2/3'];
            const width = widths[index % widths.length];
            
            return (
              <Skeleton 
                key={index}
                className={\`h-3 md:h-4 \${width}\`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Usage
<ResponsiveSkeleton lines={4} avatar className="p-4 border rounded-lg" />`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'implementation-responsive')}
                      copied={copiedCode === 'implementation-responsive'}
                    />
                  </PreviewCard>

                  <PreviewCard title="Skeleton Variants">
                    <CodeBlock
                      code={`// Predefined skeleton variants for common HR components
export const SkeletonVariants = {
  EmployeeCard: () => (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  ),

  TaskItem: () => (
    <div className="flex items-start gap-3 p-3 border rounded-lg">
      <Skeleton className="h-4 w-4 rounded-sm mt-0.5" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  ),

  MetricCard: () => (
    <div className="p-6 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  ),

  FormField: () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
};

// Usage
<SkeletonVariants.EmployeeCard />
<SkeletonVariants.TaskItem />
<SkeletonVariants.MetricCard />`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'implementation-variants')}
                      copied={copiedCode === 'implementation-variants'}
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