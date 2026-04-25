import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Type, Menu, Search, ChevronRight, ChevronDown, Layers, Zap, Star, FileText, Mouse, Square, AlignLeft, CheckSquare, Layout, CreditCard, Grid3X3, Settings, List, PieChart, Hash, AlertTriangle, Award, Upload, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Calendar, Megaphone, Timer, Shield, Eye, Code2, Paintbrush } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { categoryIcons, componentIcons } from './constants/iconMappings';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { DesactLogo } from './shared/DesactLogo';

interface TypographySystemPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const TypographySystemPage: React.FC<TypographySystemPageProps> = ({ 
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
      const sections = ['overview', 'scale', 'headings', 'body-text', 'utilities', 'examples', 'implementation'];
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
    { id: 'scale', label: 'Typography Scale', icon: Code2 },
    { id: 'headings', label: 'Headings', icon: Type },
    { id: 'body-text', label: 'Body Text', icon: AlignLeft },
    { id: 'utilities', label: 'Utility Classes', icon: Settings },
    { id: 'examples', label: 'Usage Examples', icon: Eye },
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
                  <h1 className="text-xl font-semibold">Typography System</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Design System
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Inter font family with semantic sizing and spacing tokens
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
                      Typography System Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Our typography system is built with the Inter font family, providing a comprehensive scale of sizes 
                      and semantic tokens for consistent text styling across all interfaces.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Type className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Inter Font Family</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Modern, readable typeface optimized for user interfaces and digital screens.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Semantic Tokens</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>CSS custom properties that maintain consistent meaning across contexts and themes.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Accessibility First</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Optimal line heights and contrast ratios for enhanced readability.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Typography Scale */}
              <section id="scale" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Typography Scale
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Carefully crafted type scale with consistent spacing and hierarchy for digital interfaces.
                    </p>
                  </div>

                  <PreviewCard>
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <div className="display-2xl">Display 2XL</div>
                        <code className="text-xs text-gray-500">72px / Line height 1.1 / Medium weight</code>
                      </div>
                      <div className="space-y-2">
                        <div className="display-xl">Display XL</div>
                        <code className="text-xs text-gray-500">60px / Line height 1.1 / Medium weight</code>
                      </div>
                      <div className="space-y-2">
                        <div className="display-lg">Display Large</div>
                        <code className="text-xs text-gray-500">48px / Line height 1.2 / Medium weight</code>
                      </div>
                      <div className="space-y-2">
                        <div className="display-md">Display Medium</div>
                        <code className="text-xs text-gray-500">36px / Line height 1.2 / Medium weight</code>
                      </div>
                      <div className="space-y-2">
                        <div className="display-sm">Display Small</div>
                        <code className="text-xs text-gray-500">30px / Line height 1.3 / Medium weight</code>
                      </div>
                      <div className="space-y-2">
                        <div className="display-xs">Display XS</div>
                        <code className="text-xs text-gray-500">24px / Line height 1.3 / Medium weight</code>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Headings */}
              <section id="headings" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Heading Elements
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      HTML heading elements with semantic meaning and consistent styling.
                    </p>
                  </div>

                  <PreviewCard>
                    <div className="space-y-6">
                      <div>
                        <h1>Heading 1 - Display Large</h1>
                        <code className="text-xs text-gray-500 mt-1 block">48px / Line height 1.2 / Medium weight</code>
                      </div>
                      <div>
                        <h2>Heading 2 - Display Small</h2>
                        <code className="text-xs text-gray-500 mt-1 block">30px / Line height 1.3 / Medium weight</code>
                      </div>
                      <div>
                        <h3>Heading 3 - Text Large</h3>
                        <code className="text-xs text-gray-500 mt-1 block">18px / Line height 1.4 / Medium weight</code>
                      </div>
                      <div>
                        <h4>Heading 4 - Text Medium</h4>
                        <code className="text-xs text-gray-500 mt-1 block">16px / Line height 1.6 / Medium weight</code>
                      </div>
                      <div>
                        <h5>Heading 5 - Text Small</h5>
                        <code className="text-xs text-gray-500 mt-1 block">14px / Line height 1.5 / Medium weight</code>
                      </div>
                      <div>
                        <h6>Heading 6 - Text XS</h6>
                        <code className="text-xs text-gray-500 mt-1 block">12px / Line height 1.4 / Medium weight</code>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Body Text */}
              <section id="body-text" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Body Text
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Body text styles for content, descriptions, and general reading material.
                    </p>
                  </div>

                  <PreviewCard>
                    <div className="space-y-6">
                      <div>
                        <p className="text-xl">Text XL - 20px</p>
                        <p className="text-xs text-gray-500 mt-1">Perfect for introductory paragraphs and prominent descriptions.</p>
                      </div>
                      <div>
                        <p className="text-lg">Text Large - 18px</p>
                        <p className="text-xs text-gray-500 mt-1">Great for subheadings and secondary content that needs emphasis.</p>
                      </div>
                      <div>
                        <p>Text Medium - 16px (Default)</p>
                        <p className="text-xs text-gray-500 mt-1">The standard body text size for most content and paragraphs.</p>
                      </div>
                      <div>
                        <p className="text-sm">Text Small - 14px</p>
                        <p className="text-xs text-gray-500 mt-1">Ideal for secondary information, captions, and helper text.</p>
                      </div>
                      <div>
                        <p className="text-xs">Text XS - 12px</p>
                        <p className="text-xs text-gray-500 mt-1">Used for labels, timestamps, and fine print.</p>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Utility Classes */}
              <section id="utilities" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Utility Classes
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      CSS utility classes for quick typography adjustments and overrides.
                    </p>
                  </div>

                  <PreviewCard title="Display Classes">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.display-2xl</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>72px display text</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.display-xl</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>60px display text</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.display-lg</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>48px display text</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.display-md</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>36px display text</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.display-sm</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>30px display text</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.display-xs</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>24px display text</span>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Text Size Classes">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.text-xl</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>20px body text</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.text-lg</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>18px body text</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.text-md</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>16px body text (default)</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.text-sm</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>14px body text</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.text-xs</code>
                        <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>12px body text</span>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Font Weight Classes">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.font-normal</code>
                        <span className="text-sm font-normal" style={{ color: 'var(--color-text-tertiary)' }}>400 weight - Normal text</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <code className="text-sm bg-brown-100 px-2 py-1 rounded font-mono">.font-medium</code>
                        <span className="text-sm font-medium" style={{ color: 'var(--color-text-tertiary)' }}>500 weight - Medium text</span>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Usage Examples */}
              <section id="examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Usage Examples
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Real-world examples of how to use our typography system in components and layouts.
                    </p>
                  </div>

                  <PreviewCard title="Article Layout">
                    <div className="max-w-2xl">
                      <h1 className="mb-4">The Future of Design Systems</h1>
                      <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                        How modern design systems are evolving to meet the challenges of today's digital landscape.
                      </p>
                      <h2 className="mb-3">Introduction</h2>
                      <p className="mb-4">
                        Design systems have become the backbone of modern digital product development. They provide a shared language between designers and developers, ensuring consistency and efficiency across teams and products.
                      </p>
                      <h3 className="mb-3">Key Benefits</h3>
                      <p className="mb-4">
                        By implementing a comprehensive design system, organizations can reduce development time, improve user experience, and maintain brand consistency across all touchpoints.
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        Published on December 2024 • 5 min read
                      </p>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Card Component">
                    <div className="max-w-sm bg-brown-50 rounded-lg p-6">
                      <h4 className="mb-2">Typography System</h4>
                      <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                        Comprehensive type scale with Inter font family for digital interfaces.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--color-text-quaternary)' }}>
                          Updated today
                        </span>
                        <Button size="sm" className="bg-brown-500 hover:bg-brown-600">
                          View Docs
                        </Button>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Form Layout">
                    <div className="max-w-md space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          className="w-full px-3 py-2 border border-brown-200 rounded-lg focus:border-brown-500 focus:ring-1 focus:ring-brown-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          className="w-full px-3 py-2 border border-brown-200 rounded-lg focus:border-brown-500 focus:ring-1 focus:ring-brown-500 outline-none"
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          We'll never share your email with anyone else.
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
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Implementation Guide
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Learn how to implement our typography system in your projects.
                    </p>
                  </div>

                  <PreviewCard>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Using CSS Custom Properties</h4>
                        <CodeBlock
                          code={`/* Typography with CSS Custom Properties */
.my-heading {
  font-size: var(--text-display-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--text-display-md--line-height);
}

.my-body-text {
  font-size: var(--text-md);
  font-weight: var(--font-weight-normal);
  line-height: var(--text-md--line-height);
}`}
                          language="css"
                          id="css-properties"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Using Utility Classes</h4>
                        <CodeBlock
                          code={`<!-- Display headings -->
<h1 class="display-lg">Large Display Heading</h1>
<h2 class="display-md">Medium Display Heading</h2>

<!-- Body text sizes -->
<p class="text-lg">Large body text for introductions</p>
<p class="text-md">Default body text size</p>
<p class="text-sm">Small text for captions</p>

<!-- Font weights -->
<span class="font-normal">Normal weight text</span>
<span class="font-medium">Medium weight text</span>`}
                          language="html"
                          id="utility-classes"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">React Component Example</h4>
                        <CodeBlock
                          code={`function ArticleHeader({ title, subtitle, publishDate }) {
  return (
    <header className="mb-8">
      <h1 className="display-lg mb-4">{title}</h1>
      <p className="text-lg mb-2" style={{ color: 'var(--color-text-secondary)' }}>
        {subtitle}
      </p>
      <time className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
        {publishDate}
      </time>
    </header>
  );
}`}
                          language="tsx"
                          id="react-example"
                          copiedCode={copiedCode}
                          onCopy={copyToClipboard}
                        />
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