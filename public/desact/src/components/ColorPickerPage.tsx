import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, Palette, Pipette, Sliders, Zap, Eye, Settings, Hash, Square, Circle, MousePointer, Layers, Star, FileText, Edit, Layout, CreditCard, List, Navigation, ArrowRight, ArrowUpDown, Award, AlertTriangle, Grid3X3, PieChart, Package, PanelLeftOpen, User, Upload, Gauge, TrendingUp, Command, Activity, Type } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
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
  'Color Picker': Palette,
  'Command Menu': Command,
  'Text Editor': Edit,
  'Status': Activity,
  'Typography': Type,
  'System Colors': Palette,
  'Icons': Hash,
  'Miscellaneous': Settings,
  'Default': Package
};
import { DesactLogo } from './shared/DesactLogo';

interface ColorPickerPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const ColorPickerPage: React.FC<ColorPickerPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Color states for different pickers
  const [nativeColor, setNativeColor] = useState('#ff6b6b');
  const [paletteColor, setPaletteColor] = useState('#4ecdc4');
  const [swatchColor, setSwatchColor] = useState('#45b7d1');
  const [gradientColor, setGradientColor] = useState('#96ceb4');
  const [customColor, setCustomColor] = useState('#ff9ff3');

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
      const sections = ['overview', 'native-picker', 'palette-picker', 'swatch-picker', 'gradient-picker', 'custom-picker', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: Palette },
    { id: 'native-picker', label: 'Native Picker', icon: Pipette },
    { id: 'palette-picker', label: 'Palette Picker', icon: Circle },
    { id: 'swatch-picker', label: 'Swatch Picker', icon: Square },
    { id: 'gradient-picker', label: 'Gradient Picker', icon: MousePointer },
    { id: 'custom-picker', label: 'Custom Picker', icon: Settings },
    { id: 'implementation', label: 'Implementation', icon: Hash },
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

  const ColorTriggerButton = React.forwardRef<
    HTMLButtonElement,
    { 
      color: string; 
      label: string; 
      icon?: React.ReactNode;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>
  >(({ color, label, icon, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      className="h-12 gap-3 justify-start bg-white hover:bg-brown-50 border-brown-200"
      {...props}
    >
      <div 
        className="w-6 h-6 rounded border-2 border-brown-200 shadow-inner flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium">{label}</span>
      {icon && <div className="ml-auto">{icon}</div>}
    </Button>
  ));
  
  ColorTriggerButton.displayName = "ColorTriggerButton";

  // Predefined color palettes
  const basicColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#FF8A80', '#82B1FF', '#B9F6CA', '#FFE57F', '#F8BBD9', '#D1C4E9', '#FFCCBC', '#C8E6C9'
  ];

  const materialColors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
  ];

  const gradientColors = [
    'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
    'linear-gradient(45deg, #667eea, #764ba2)',
    'linear-gradient(45deg, #f093fb, #f5576c)',
    'linear-gradient(45deg, #4facfe, #00f2fe)',
    'linear-gradient(45deg, #43e97b, #38f9d7)',
    'linear-gradient(45deg, #fa709a, #fee140)',
    'linear-gradient(45deg, #a8edea, #fed6e3)',
    'linear-gradient(45deg, #d299c2, #fef9d7)'
  ];

  // Custom Color Components
  const NativeColorPicker: React.FC<{ 
    color: string; 
    onChange: (color: string) => void; 
    label: string;
  }> = ({ color, onChange, label }) => (
    <Popover>
      <PopoverTrigger asChild>
        <ColorTriggerButton 
          color={color}
          label={label}
          icon={<Pipette className="w-4 h-4" />}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-32 rounded-lg border-2 border-brown-200 cursor-pointer"
          />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded border-2 border-brown-200"
                style={{ backgroundColor: color }}
              />
              <span className="font-mono text-sm">{color}</span>
            </div>
            <p className="text-xs text-gray-500">Click to change color</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const PalettePicker: React.FC<{ 
    color: string; 
    onChange: (color: string) => void; 
    colors: string[];
    label: string;
  }> = ({ color, onChange, colors, label }) => (
    <Popover>
      <PopoverTrigger asChild>
        <ColorTriggerButton 
          color={color}
          label={label}
          icon={<Circle className="w-4 h-4" />}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="grid grid-cols-8 gap-2">
            {colors.map((paletteColor, index) => (
              <button
                key={index}
                onClick={() => onChange(paletteColor)}
                className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                  color === paletteColor ? 'border-brown-500 ring-2 ring-brown-300' : 'border-brown-200'
                }`}
                style={{ backgroundColor: paletteColor }}
                title={paletteColor}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded border-2 border-brown-200"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-sm">{color}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const GradientPicker: React.FC<{ 
    gradient: string; 
    onChange: (gradient: string) => void; 
    gradients: string[];
    label: string;
  }> = ({ gradient, onChange, gradients, label }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-12 gap-3 justify-start bg-white hover:bg-brown-50 border-brown-200"
        >
          <div 
            className="w-6 h-6 rounded border-2 border-brown-200 shadow-inner flex-shrink-0"
            style={{ background: gradient }}
          />
          <span className="font-medium">{label}</span>
          <MousePointer className="w-4 h-4 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {gradients.map((grad, index) => (
              <button
                key={index}
                onClick={() => onChange(grad)}
                className={`w-12 h-12 rounded border-2 hover:scale-105 transition-transform ${
                  gradient === grad ? 'border-brown-500 ring-2 ring-brown-300' : 'border-brown-200'
                }`}
                style={{ background: grad }}
                title={`Gradient ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded border-2 border-brown-200"
              style={{ background: gradient }}
            />
            <span className="font-mono text-xs">{gradient.slice(0, 30)}...</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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
                  <h1 className="text-xl font-semibold">Color Picker</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Interactive color picker components with trigger actions
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
                      Color Picker Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      A comprehensive collection of custom color picker components built with HTML5 and React. 
                      Each picker is triggered by a button action, providing clean interfaces and excellent user experience 
                      for any color selection workflow.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                        <Palette className="w-6 h-6 text-red-600" />
                      </div>
                      <h3 className="font-semibold mb-2">5 Picker Types</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Native, palette, swatch, gradient, and custom color pickers.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <MousePointer className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Trigger Actions</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Button-triggered color pickers using popovers for clean, space-efficient interfaces.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Eye className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">No Dependencies</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Built with native HTML5 and React - no external color picker libraries required.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Installation">
                    <CodeBlock
                      code={`# No additional packages needed!
# Uses native HTML5 color input and React`}
                      language="bash"
                      id="installation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Native Picker */}
              <section id="native-picker" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Native Color Picker</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>HTML5 native color input with trigger button interface</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <NativeColorPicker
                          color={nativeColor}
                          onChange={setNativeColor}
                          label="Open Native Picker"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-brown-200 shadow-inner"
                            style={{ backgroundColor: nativeColor }}
                          />
                          <div>
                            <p className="font-semibold">{nativeColor}</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Current color</p>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Features:</strong></p>
                          <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            <li>Native browser color picker</li>
                            <li>Cross-platform compatibility</li>
                            <li>No external dependencies</li>
                            <li>Accessible by default</li>
                            <li>System-level color selection</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

function NativeColorPicker() {
  const [color, setColor] = useState('#ff6b6b');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-3">
          <div 
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: color }}
          />
          Open Color Picker
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-32 rounded-lg border cursor-pointer"
          />
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-sm">{color}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}`}
                      language="tsx"
                      id="native-picker-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Palette Picker */}
              <section id="palette-picker" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Palette Picker</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Predefined color palette with quick selection</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <PalettePicker
                          color={paletteColor}
                          onChange={setPaletteColor}
                          colors={basicColors}
                          label="Open Palette Picker"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-brown-200 shadow-inner"
                            style={{ backgroundColor: paletteColor }}
                          />
                          <div>
                            <p className="font-semibold">{paletteColor}</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Current color</p>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Use Cases:</strong></p>
                          <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            <li>Brand color selection</li>
                            <li>Quick theme changes</li>
                            <li>Predefined color schemes</li>
                            <li>UI design tools</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

function PalettePicker() {
  const [color, setColor] = useState('#4ecdc4');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-3">
          <div 
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: color }}
          />
          Open Palette Picker
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-8 gap-2">
            {colors.map((paletteColor, index) => (
              <button
                key={index}
                onClick={() => setColor(paletteColor)}
                className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                style={{ backgroundColor: paletteColor }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-sm">{color}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}`}
                      language="tsx"
                      id="palette-picker-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Swatch Picker */}
              <section id="swatch-picker" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Material Swatch Picker</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Material Design color swatches for consistent color selection</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <PalettePicker
                          color={swatchColor}
                          onChange={setSwatchColor}
                          colors={materialColors}
                          label="Open Material Picker"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-brown-200 shadow-inner"
                            style={{ backgroundColor: swatchColor }}
                          />
                          <div>
                            <p className="font-semibold">{swatchColor}</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Current color</p>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Perfect For:</strong></p>
                          <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            <li>Material Design consistency</li>
                            <li>Android app development</li>
                            <li>Google-style interfaces</li>
                            <li>Accessible color choices</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

const materialColors = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
];

function MaterialSwatchPicker() {
  const [color, setColor] = useState('#45b7d1');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-3">
          <div 
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: color }}
          />
          Material Colors
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-8 gap-2">
            {materialColors.map((swatchColor, index) => (
              <button
                key={index}
                onClick={() => setColor(swatchColor)}
                className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                style={{ backgroundColor: swatchColor }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}`}
                      language="tsx"
                      id="swatch-picker-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Gradient Picker */}
              <section id="gradient-picker" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Gradient Picker</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Predefined gradient selection for modern design elements</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <GradientPicker
                          gradient={gradientColor}
                          onChange={setGradientColor}
                          gradients={gradientColors}
                          label="Open Gradient Picker"
                        />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-brown-200 shadow-inner"
                            style={{ background: gradientColor }}
                          />
                          <div>
                            <p className="font-mono text-xs">{gradientColor.slice(0, 30)}...</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Current gradient</p>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Perfect For:</strong></p>
                          <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            <li>Modern design elements</li>
                            <li>Background gradients</li>
                            <li>Button effects</li>
                            <li>Hero sections</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

const gradients = [
  'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
  'linear-gradient(45deg, #667eea, #764ba2)',
  'linear-gradient(45deg, #f093fb, #f5576c)',
  'linear-gradient(45deg, #4facfe, #00f2fe)'
];

function GradientPicker() {
  const [gradient, setGradient] = useState(gradients[0]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-3">
          <div 
            className="w-6 h-6 rounded border"
            style={{ background: gradient }}
          />
          Gradient Picker
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {gradients.map((grad, index) => (
              <button
                key={index}
                onClick={() => setGradient(grad)}
                className="w-12 h-12 rounded border-2 hover:scale-105 transition-transform"
                style={{ background: grad }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}`}
                      language="tsx"
                      id="gradient-picker-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Custom Picker */}
              <section id="custom-picker" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Custom Color Picker</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Combine native input with custom palette for flexible color selection</p>
                  </div>
                  
                  <PreviewCard title="Interactive Example">
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                      <div className="flex-shrink-0">
                        <Popover>
                          <PopoverTrigger asChild>
                            <ColorTriggerButton 
                              color={customColor}
                              label="Open Custom Picker"
                              icon={<Settings className="w-4 h-4" />}
                            />
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4" align="start">
                            <div className="space-y-4">
                              <input
                                type="color"
                                value={customColor}
                                onChange={(e) => setCustomColor(e.target.value)}
                                className="w-full h-24 rounded-lg border-2 border-brown-200 cursor-pointer"
                              />
                              <div className="grid grid-cols-8 gap-2">
                                {basicColors.map((color, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCustomColor(color)}
                                    className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded border-2 border-brown-200"
                                  style={{ backgroundColor: customColor }}
                                />
                                <span className="font-mono text-sm">{customColor}</span>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-brown-200 shadow-inner"
                            style={{ backgroundColor: customColor }}
                          />
                          <div>
                            <p className="font-semibold">{customColor}</p>
                            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Current color</p>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Features:</strong></p>
                          <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                            <li>Native color picker + palette</li>
                            <li>Best of both worlds</li>
                            <li>Quick preset + custom selection</li>
                            <li>Professional color workflow</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

const presetColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

function CustomColorPicker() {
  const [color, setColor] = useState('#ff9ff3');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-3">
          <div 
            className="w-6 h-6 rounded border"
            style={{ backgroundColor: color }}
          />
          Custom Picker
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          {/* Native Color Input */}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-24 rounded-lg border cursor-pointer"
          />
          
          {/* Preset Colors */}
          <div className="grid grid-cols-8 gap-2">
            {presetColors.map((presetColor, index) => (
              <button
                key={index}
                onClick={() => setColor(presetColor)}
                className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                style={{ backgroundColor: presetColor }}
              />
            ))}
          </div>
          
          {/* Current Color Display */}
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-sm">{color}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}`}
                      language="tsx"
                      id="custom-picker-code"
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
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Best practices for implementing triggered color pickers in your application</p>
                  </div>
                  
                  <PreviewCard title="Complete Implementation">
                    <CodeBlock
                      code={`import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

// Reusable Color Trigger Button
const ColorTriggerButton = React.forwardRef<
  HTMLButtonElement,
  { 
    color: string; 
    label: string; 
    icon?: React.ReactNode;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ color, label, icon, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outline"
    className="h-12 gap-3 justify-start"
    {...props}
  >
    <div 
      className="w-6 h-6 rounded border-2 flex-shrink-0"
      style={{ backgroundColor: color }}
    />
    <span className="font-medium">{label}</span>
    {icon && <div className="ml-auto">{icon}</div>}
  </Button>
));

// Complete Color Picker with Multiple Options
export function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState('#ff6b6b');
  
  const presetColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ColorTriggerButton 
          color={selectedColor}
          label="Choose Color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          {/* Native Color Picker */}
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full h-32 rounded-lg border-2 cursor-pointer"
          />
          
          {/* Preset Color Grid */}
          <div className="grid grid-cols-8 gap-2">
            {presetColors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(color)}
                className={\`w-8 h-8 rounded border-2 hover:scale-110 transition-transform \${
                  selectedColor === color ? 'ring-2 ring-blue-300' : ''
                }\`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          {/* Color Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded border-2"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="font-mono text-sm">{selectedColor}</span>
            </div>
            <Button
              size="sm"
              onClick={() => navigator.clipboard.writeText(selectedColor)}
            >
              Copy
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}`}
                      language="tsx"
                      id="implementation-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <PreviewCard title="Accessibility Features">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Keyboard Navigation</h4>
                        <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li><kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Tab</kbd> to navigate between elements</li>
                          <li><kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Enter</kbd> or <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Space</kbd> to open picker</li>
                          <li><kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded">Esc</kbd> to close picker</li>
                          <li>Native color input supports system accessibility</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Best Practices</h4>
                        <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                          <li>Always provide color preview in trigger button</li>
                          <li>Include color value text for screen readers</li>
                          <li>Use semantic HTML and proper ARIA labels</li>
                          <li>Provide keyboard shortcuts for common actions</li>
                          <li>Consider color contrast for accessibility</li>
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