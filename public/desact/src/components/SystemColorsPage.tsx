import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Palette, Paintbrush, Code2, Eye, ChevronDown, Menu, Search, ChevronRight, ChevronUp, Layers, Zap, Star, FileText, Mouse, Square, AlignLeft, CheckSquare, Layout, CreditCard, Grid3X3, Settings, List, PieChart, Hash, AlertTriangle, Award, Upload, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Calendar, Megaphone, Timer, Shield, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';
import { DesactLogo } from './shared/DesactLogo';

interface SystemColorsPageProps {
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

export const SystemColorsPage: React.FC<SystemColorsPageProps> = ({ 
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
      const sections = ['overview', 'palette', 'success', 'danger', 'warning', 'info', 'semantic', 'implementation', 'usage'];
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



  const ColorSwatch: React.FC<{ name: string; variable: string; hex: string; usage: string }> = ({ 
    name, 
    variable, 
    hex, 
    usage 
  }) => {
    const handleCopyHex = () => {
      copyToClipboard(hex, `hex-${name}`);
    };

    const handleCopyVar = () => {
      copyToClipboard(`var(${variable})`, `var-${name}`);
    };

    return (
      <div className="bg-white border border-brown-200 rounded-lg p-4 space-y-3">
        <div 
          className="w-full h-16 rounded-lg border border-brown-200" 
          style={{ backgroundColor: hex }}
        ></div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{name}</h4>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyHex}
                className="h-6 px-2 text-xs hover:bg-brown-50"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                {copiedCode === `hex-${name}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <code className="text-xs bg-brown-100 px-2 py-1 rounded font-mono block">{hex}</code>
            <button
              onClick={handleCopyVar}
              className="text-xs bg-brown-100 px-2 py-1 rounded font-mono block w-full text-left hover:bg-brown-200 transition-colors"
            >
              {variable}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>{usage}</p>
        </div>
      </div>
    );
  };

  const PreviewBox: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`bg-white border border-brown-200 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );

  const sidebarSections = [
    { id: 'overview', label: 'Overview', icon: Palette },
    { id: 'palette', label: 'Brown Palette', icon: Paintbrush },
    { id: 'success', label: 'Success Colors', icon: CheckCircle },
    { id: 'danger', label: 'Danger Colors', icon: XCircle },
    { id: 'warning', label: 'Warning Colors', icon: AlertCircle },
    { id: 'info', label: 'Info Colors', icon: Info },
    { id: 'semantic', label: 'Semantic Colors', icon: Eye },
    { id: 'implementation', label: 'Implementation', icon: Code2 },
    { id: 'usage', label: 'Usage Examples', icon: Eye },
  ];

  const brownColors = [
    { name: 'brown-50', variable: '--color-brown-50', hex: '#f6f2f0', usage: 'Card backgrounds, subtle surfaces' },
    { name: 'brown-100', variable: '--color-brown-100', hex: '#f0ece9', usage: 'Hover states, light backgrounds' },
    { name: 'brown-200', variable: '--color-brown-200', hex: '#e2d6d0', usage: 'Borders, dividers, placeholders' },
    { name: 'brown-300', variable: '--color-brown-300', hex: '#d1bfb6', usage: 'Disabled states, secondary text' },
    { name: 'brown-400', variable: '--color-brown-400', hex: '#b5978c', usage: 'Muted text, icons' },
    { name: 'brown-500', variable: '--color-brown-500', hex: '#947068', usage: 'Primary brand color, buttons' },
    { name: 'brown-600', variable: '--color-brown-600', hex: '#7a5a54', usage: 'Button hover states, emphasis' },
    { name: 'brown-700', variable: '--color-brown-700', hex: '#664242', usage: 'Text, focus rings, strong emphasis' },
    { name: 'brown-800', variable: '--color-brown-800', hex: '#4d3232', usage: 'Headings, high contrast text' },
    { name: 'brown-900', variable: '--color-brown-900', hex: '#3d2626', usage: 'Highest contrast text, logos' },
  ];

  const successColors = [
    { name: 'success-50', variable: '--color-success-50', hex: '#f0fdf4', usage: 'Success backgrounds, light states' },
    { name: 'success-100', variable: '--color-success-100', hex: '#dcfce7', usage: 'Success card backgrounds' },
    { name: 'success-200', variable: '--color-success-200', hex: '#bbf7d0', usage: 'Success borders, hover states' },
    { name: 'success-300', variable: '--color-success-300', hex: '#86efac', usage: 'Success accents, highlights' },
    { name: 'success-400', variable: '--color-success-400', hex: '#4ade80', usage: 'Success icons, secondary buttons' },
    { name: 'success-500', variable: '--color-success-500', hex: '#22c55e', usage: 'Primary success color, buttons' },
    { name: 'success-600', variable: '--color-success-600', hex: '#16a34a', usage: 'Success button hover states' },
    { name: 'success-700', variable: '--color-success-700', hex: '#15803d', usage: 'Success text, strong emphasis' },
    { name: 'success-800', variable: '--color-success-800', hex: '#166534', usage: 'Success dark text' },
    { name: 'success-900', variable: '--color-success-900', hex: '#14532d', usage: 'Success darkest shade' },
  ];

  const dangerColors = [
    { name: 'danger-50', variable: '--color-danger-50', hex: '#fef2f2', usage: 'Error backgrounds, light states' },
    { name: 'danger-100', variable: '--color-danger-100', hex: '#fee2e2', usage: 'Error card backgrounds' },
    { name: 'danger-200', variable: '--color-danger-200', hex: '#fecaca', usage: 'Error borders, hover states' },
    { name: 'danger-300', variable: '--color-danger-300', hex: '#fca5a5', usage: 'Error accents, highlights' },
    { name: 'danger-400', variable: '--color-danger-400', hex: '#f87171', usage: 'Error icons, secondary buttons' },
    { name: 'danger-500', variable: '--color-danger-500', hex: '#ef4444', usage: 'Primary error color, buttons' },
    { name: 'danger-600', variable: '--color-danger-600', hex: '#dc2626', usage: 'Error button hover states' },
    { name: 'danger-700', variable: '--color-danger-700', hex: '#b91c1c', usage: 'Error text, strong emphasis' },
    { name: 'danger-800', variable: '--color-danger-800', hex: '#991b1b', usage: 'Error dark text' },
    { name: 'danger-900', variable: '--color-danger-900', hex: '#7f1d1d', usage: 'Error darkest shade' },
  ];

  const warningColors = [
    { name: 'warning-50', variable: '--color-warning-50', hex: '#fffbeb', usage: 'Warning backgrounds, light states' },
    { name: 'warning-100', variable: '--color-warning-100', hex: '#fef3c7', usage: 'Warning card backgrounds' },
    { name: 'warning-200', variable: '--color-warning-200', hex: '#fde68a', usage: 'Warning borders, hover states' },
    { name: 'warning-300', variable: '--color-warning-300', hex: '#fcd34d', usage: 'Warning accents, highlights' },
    { name: 'warning-400', variable: '--color-warning-400', hex: '#fbbf24', usage: 'Warning icons, secondary buttons' },
    { name: 'warning-500', variable: '--color-warning-500', hex: '#f59e0b', usage: 'Primary warning color, buttons' },
    { name: 'warning-600', variable: '--color-warning-600', hex: '#d97706', usage: 'Warning button hover states' },
    { name: 'warning-700', variable: '--color-warning-700', hex: '#b45309', usage: 'Warning text, strong emphasis' },
    { name: 'warning-800', variable: '--color-warning-800', hex: '#92400e', usage: 'Warning dark text' },
    { name: 'warning-900', variable: '--color-warning-900', hex: '#78350f', usage: 'Warning darkest shade' },
  ];

  const infoColors = [
    { name: 'info-50', variable: '--color-info-50', hex: '#eff6ff', usage: 'Info backgrounds, light states' },
    { name: 'info-100', variable: '--color-info-100', hex: '#dbeafe', usage: 'Info card backgrounds' },
    { name: 'info-200', variable: '--color-info-200', hex: '#bfdbfe', usage: 'Info borders, hover states' },
    { name: 'info-300', variable: '--color-info-300', hex: '#93c5fd', usage: 'Info accents, highlights' },
    { name: 'info-400', variable: '--color-info-400', hex: '#60a5fa', usage: 'Info icons, secondary buttons' },
    { name: 'info-500', variable: '--color-info-500', hex: '#3b82f6', usage: 'Primary info color, buttons' },
    { name: 'info-600', variable: '--color-info-600', hex: '#2563eb', usage: 'Info button hover states' },
    { name: 'info-700', variable: '--color-info-700', hex: '#1d4ed8', usage: 'Info text, strong emphasis' },
    { name: 'info-800', variable: '--color-info-800', hex: '#1e40af', usage: 'Info dark text' },
    { name: 'info-900', variable: '--color-info-900', hex: '#1e3a8a', usage: 'Info darkest shade' },
  ];

  const semanticColors = [
    { name: 'Text Primary', variable: '--color-text-primary', hex: '#2c2420', usage: 'Main text content, headings' },
    { name: 'Text Secondary', variable: '--color-text-secondary', hex: '#544d47', usage: 'Secondary text, subheadings' },
    { name: 'Text Tertiary', variable: '--color-text-tertiary', hex: '#6b6058', usage: 'Helper text, captions' },
    { name: 'Text Quaternary', variable: '--color-text-quaternary', hex: '#8a7f73', usage: 'Placeholder text, timestamps' },
    { name: 'Border Primary', variable: '--color-border-primary', hex: '#f0ede8', usage: 'Main borders, card outlines' },
    { name: 'Border Secondary', variable: '--color-border-secondary', hex: '#e8e4df', usage: 'Subtle dividers, section separators' },
    { name: 'Background Primary', variable: '--color-bg-primary', hex: '#ffffff', usage: 'Main background color' },
    { name: 'Background Secondary', variable: '--color-bg-secondary', hex: '#faf9f7', usage: 'Sidebar, secondary surfaces' },
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
                  <h1 className="text-xl font-semibold">System Colors</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Design System
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Comprehensive color system with semantic tokens
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
                      Color System Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Our color system is built on a warm brown palette complemented by comprehensive status colors. 
                      This system includes semantic color tokens for consistent theming and accessibility compliance.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Palette className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Semantic Tokens</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>CSS custom properties that adapt to themes and maintain consistent meaning across contexts.</p>
                    </Card>
                    
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Paintbrush className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Complete Color Scales</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>10-step color scales for brown, success, danger, warning, and info colors providing comprehensive options.</p>
                    </Card>
                    
                    <Card className="p-6 border-brown-200">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Eye className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Accessibility First</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>All color combinations meet WCAG guidelines for contrast and readability.</p>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Brown Color Palette Section */}
              <section id="palette" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Brown Color Palette
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Our primary brown color scale provides warm, earthy tones that form the foundation of our visual identity.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {brownColors.map((color) => (
                      <ColorSwatch
                        key={color.name}
                        name={color.name}
                        variable={color.variable}
                        hex={color.hex}
                        usage={color.usage}
                      />
                    ))}
                  </div>

                  <PreviewBox>
                    <CodeBlock
                      code={`/* Brown Color Scale */
:root {
  --color-brown-50: #f6f2f0;
  --color-brown-100: #f0ece9;
  --color-brown-200: #e2d6d0;
  --color-brown-300: #d1bfb6;
  --color-brown-400: #b5978c;
  --color-brown-500: #947068; /* Primary brand color */
  --color-brown-600: #7a5a54;
  --color-brown-700: #664242;
  --color-brown-800: #4d3232;
  --color-brown-900: #3d2626;
}`}
                      language="css"
                      id="brown-colors"
                      title="CSS Variables"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewBox>
                </div>
              </section>

              {/* Success Colors Section */}
              <section id="success" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Success Colors
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Green color scale for success states, confirmations, positive actions, and completed tasks.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {successColors.map((color) => (
                      <ColorSwatch
                        key={color.name}
                        name={color.name}
                        variable={color.variable}
                        hex={color.hex}
                        usage={color.usage}
                      />
                    ))}
                  </div>

                  <PreviewBox title="Usage Examples">
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">Success message</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">Your changes have been saved successfully.</p>
                      </div>
                      
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        Success Button
                      </Button>
                    </div>
                  </PreviewBox>

                  <PreviewBox>
                    <CodeBlock
                      code={`/* Success Colors */
:root {
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e; /* Primary success */
  --color-success-700: #15803d;
}

/* Usage */
.success-alert {
  background-color: var(--color-success-50);
  border-color: var(--color-success-200);
  color: var(--color-success-700);
}`}
                      language="css"
                      id="success-colors"
                      title="CSS Implementation"
                    />
                  </PreviewBox>
                </div>
              </section>

              {/* Danger Colors Section */}
              <section id="danger" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Danger Colors
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Red color scale for error states, warnings, destructive actions, and critical alerts.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {dangerColors.map((color) => (
                      <ColorSwatch
                        key={color.name}
                        name={color.name}
                        variable={color.variable}
                        hex={color.hex}
                        usage={color.usage}
                      />
                    ))}
                  </div>

                  <PreviewBox title="Usage Examples">
                    <div className="space-y-4">
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-800">Error message</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">Something went wrong. Please try again.</p>
                      </div>
                      
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        Delete Item
                      </Button>
                    </div>
                  </PreviewBox>

                  <PreviewBox>
                    <CodeBlock
                      code={`/* Danger Colors */
:root {
  --color-danger-50: #fef2f2;
  --color-danger-500: #ef4444; /* Primary danger */
  --color-danger-700: #b91c1c;
}

/* Usage */
.error-alert {
  background-color: var(--color-danger-50);
  border-color: var(--color-danger-200);
  color: var(--color-danger-700);
}`}
                      language="css"
                      id="danger-colors"
                      title="CSS Implementation"
                    />
                  </PreviewBox>
                </div>
              </section>

              {/* Warning Colors Section */}
              <section id="warning" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Warning Colors
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Yellow-amber color scale for warnings, caution states, and informational alerts that require attention.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {warningColors.map((color) => (
                      <ColorSwatch
                        key={color.name}
                        name={color.name}
                        variable={color.variable}
                        hex={color.hex}
                        usage={color.usage}
                      />
                    ))}
                  </div>

                  <PreviewBox title="Usage Examples">
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Warning message</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">This action cannot be undone. Proceed with caution.</p>
                      </div>
                      
                      <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        Warning Button
                      </Button>
                    </div>
                  </PreviewBox>

                  <PreviewBox>
                    <CodeBlock
                      code={`/* Warning Colors */
:root {
  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b; /* Primary warning */
  --color-warning-700: #b45309;
}

/* Usage */
.warning-alert {
  background-color: var(--color-warning-50);
  border-color: var(--color-warning-200);
  color: var(--color-warning-700);
}`}
                      language="css"
                      id="warning-colors"
                      title="CSS Implementation"
                    />
                  </PreviewBox>
                </div>
              </section>

              {/* Info Colors Section */}
              <section id="info" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Information Colors
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Blue color scale for informational messages, neutral states, and general purpose communication.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {infoColors.map((color) => (
                      <ColorSwatch
                        key={color.name}
                        name={color.name}
                        variable={color.variable}
                        hex={color.hex}
                        usage={color.usage}
                      />
                    ))}
                  </div>

                  <PreviewBox title="Usage Examples">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-800">Information</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">This feature is currently in beta. Learn more about it.</p>
                      </div>
                      
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Learn More
                      </Button>
                    </div>
                  </PreviewBox>

                  <PreviewBox>
                    <CodeBlock
                      code={`/* Info Colors */
:root {
  --color-info-50: #eff6ff;
  --color-info-500: #3b82f6; /* Primary info */
  --color-info-700: #1d4ed8;
}

/* Usage */
.info-alert {
  background-color: var(--color-info-50);
  border-color: var(--color-info-200);
  color: var(--color-info-700);
}`}
                      language="css"
                      id="info-colors"
                      title="CSS Implementation"
                    />
                  </PreviewBox>
                </div>
              </section>

              {/* Semantic Colors Section */}
              <section id="semantic" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Semantic Colors
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Semantic color tokens provide consistent meaning across the interface and adapt to different themes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {semanticColors.map((color) => (
                      <ColorSwatch
                        key={color.name}
                        name={color.name}
                        variable={color.variable}
                        hex={color.hex}
                        usage={color.usage}
                      />
                    ))}
                  </div>

                  <PreviewBox>
                    <CodeBlock
                      code={`/* Semantic Color Tokens */
:root {
  /* Text Colors */
  --color-text-primary: #2c2420;    /* Main content */
  --color-text-secondary: #544d47;  /* Subheadings */
  --color-text-tertiary: #6b6058;   /* Helper text */
  --color-text-quaternary: #8a7f73; /* Placeholders */

  /* Background Colors */
  --color-bg-primary: #ffffff;      /* Main background */
  --color-bg-secondary: #faf9f7;    /* Secondary surfaces */

  /* Border Colors */
  --color-border-primary: #f0ede8;  /* Main borders */
  --color-border-secondary: #e8e4df; /* Dividers */
}

/* Usage Examples */
.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
}`}
                      language="css"
                      id="semantic-colors"
                      title="Semantic Color System"
                    />
                  </PreviewBox>
                </div>
              </section>

              {/* Implementation Section */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Implementation Guide
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      How to implement and use colors effectively in your applications with best practices and accessibility guidelines.
                    </p>
                  </div>

                  <PreviewBox title="CSS Custom Properties">
                    <CodeBlock
                      code={`/* Define colors in your CSS */
:root {
  --color-primary: var(--color-brown-500);
  --color-success: var(--color-success-500);
  --color-danger: var(--color-danger-500);
  --color-warning: var(--color-warning-500);
  --color-info: var(--color-info-500);
}

/* Use colors in components */
.button-primary {
  background-color: var(--color-primary);
  color: white;
}

.button-primary:hover {
  background-color: var(--color-brown-600);
}

.alert-success {
  background-color: var(--color-success-50);
  border-color: var(--color-success-200);
  color: var(--color-success-700);
}`}
                      language="css"
                      id="css-implementation"
                    />
                  </PreviewBox>

                  <PreviewBox title="Tailwind CSS Classes">
                    <CodeBlock
                      code={`<!-- Use Tailwind classes with our color system -->
<div class="bg-brown-500 text-white p-4 rounded-lg">
  Primary button style
</div>

<div class="bg-success-50 border border-success-200 text-success-700 p-4 rounded-lg">
  Success alert message
</div>

<div class="bg-danger-50 border border-danger-200 text-danger-700 p-4 rounded-lg">
  Error alert message
</div>

<!-- Hover and focus states -->
<button class="bg-brown-500 hover:bg-brown-600 focus:ring-2 focus:ring-brown-500 focus:ring-offset-2">
  Interactive button
</button>`}
                      language="html"
                      id="tailwind-implementation"
                    />
                  </PreviewBox>

                  <PreviewBox title="Accessibility Guidelines">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">✅ Do</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Use semantic color tokens for consistent meaning</li>
                          <li>• Test color combinations for WCAG AA compliance</li>
                          <li>• Provide text alternatives for color-only information</li>
                          <li>• Use sufficient contrast ratios (4.5:1 for normal text)</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">❌ Don't</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Rely solely on color to convey information</li>
                          <li>• Use colors with insufficient contrast</li>
                          <li>• Override semantic meanings arbitrarily</li>
                          <li>• Use too many colors in a single interface</li>
                        </ul>
                      </div>
                    </div>
                  </PreviewBox>
                </div>
              </section>

              {/* Usage Examples Section */}
              <section id="usage" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Usage Examples
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Real-world examples of how to apply our color system effectively in different interface components.
                    </p>
                  </div>

                  <PreviewBox title="Alert Components">
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-green-800">Success!</h4>
                            <p className="text-sm text-green-700">Your profile has been updated successfully.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-red-800">Error</h4>
                            <p className="text-sm text-red-700">Unable to save changes. Please check your connection.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Warning</h4>
                            <p className="text-sm text-yellow-700">This action will permanently delete your data.</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-blue-800">Information</h4>
                            <p className="text-sm text-blue-700">New features are available in this version.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PreviewBox>

                  <PreviewBox title="Button Variations">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <Button className="bg-brown-500 hover:bg-brown-600 text-white">
                          Primary
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          Success
                        </Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                          Danger
                        </Button>
                        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                          Warning
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Info
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="border-brown-500 text-brown-700 hover:bg-brown-50">
                          Primary Outline
                        </Button>
                        <Button variant="outline" className="border-green-500 text-green-700 hover:bg-green-50">
                          Success Outline
                        </Button>
                        <Button variant="outline" className="border-red-500 text-red-700 hover:bg-red-50">
                          Danger Outline
                        </Button>
                      </div>
                    </div>
                  </PreviewBox>

                  <PreviewBox title="Form States">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Default Input</label>
                        <Input placeholder="Enter your email" className="border-brown-200 focus:border-brown-500 focus:ring-brown-500" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Success State</label>
                        <Input placeholder="Valid email entered" className="border-green-500 focus:border-green-500 focus:ring-green-500" />
                        <p className="text-xs text-green-600 mt-1">Email format is valid</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Error State</label>
                        <Input placeholder="Invalid email" className="border-red-500 focus:border-red-500 focus:ring-red-500" />
                        <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
                      </div>
                    </div>
                  </PreviewBox>

                  <PreviewBox>
                    <CodeBlock
                      code={`/* Complete Implementation Example */

/* Alert Component */
.alert {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
}

.alert-success {
  background-color: var(--color-success-50);
  border-color: var(--color-success-200);
  color: var(--color-success-700);
}

.alert-error {
  background-color: var(--color-danger-50);
  border-color: var(--color-danger-200);
  color: var(--color-danger-700);
}

/* Button Component */
.button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.button-primary {
  background-color: var(--color-brown-500);
  color: white;
  border: 1px solid var(--color-brown-500);
}

.button-primary:hover {
  background-color: var(--color-brown-600);
  border-color: var(--color-brown-600);
}

/* Form Input */
.input {
  padding: 0.75rem;
  border: 1px solid var(--color-border-primary);
  border-radius: 0.375rem;
  background: var(--color-bg-primary);
}

.input:focus {
  outline: 2px solid var(--color-brown-500);
  outline-offset: 2px;
  border-color: var(--color-brown-500);
}

.input-error {
  border-color: var(--color-danger-500);
}

.input-error:focus {
  outline-color: var(--color-danger-500);
}`}
                      language="css"
                      id="complete-implementation"
                      title="Complete Implementation"
                    />
                  </PreviewBox>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};