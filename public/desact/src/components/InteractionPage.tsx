import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Home, ChevronRight, Menu, Search, Layers, Package, Users, Building2, UserCheck, FileText, Settings, Calendar, Briefcase, Award, Shield, Clock, MapPin, Target, TrendingUp, Navigation, ArrowRight, ChevronDown, MoreHorizontal, User, Mail, Phone, Database, Monitor, FileBarChart, Clipboard, MessageSquare, UserPlus, Activity, DollarSign, BookOpen, CheckCircle, AlertCircle, HelpCircle, Coffee, Plane, GraduationCap, Heart, Gift, Workflow, Timer, Info, Code2, Eye, Paintbrush, Type, PanelLeftOpen, Megaphone, XCircle, Command, Edit, PaletteIcon, Hash, AlertTriangle, Upload, Gauge, ArrowUpDown, RefreshCw, Smartphone, Filter, Download, Plus, Bell, LogOut, Grid3X3, List, PieChart, ChevronLeft, ChevronsLeft, ChevronsRight, MousePointer, Zap, Play, Pause, Loader2, Sparkles, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { DesactLogo } from './shared/DesactLogo';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';

interface InteractionPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const InteractionPage: React.FC<InteractionPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const simulateProgress = () => {
    setIsLoading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'hover-effects', 'click-interactions', 'loading-states', 'tooltips-popovers', 'modals-sheets', 'media-controls', 'hr-examples', 'accessibility', 'best-practices'];
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
    { id: 'overview', label: 'Overview', icon: ArrowRight },
    { id: 'hover-effects', label: 'Hover Effects', icon: MousePointer },
    { id: 'click-interactions', label: 'Click Interactions', icon: Zap },
    { id: 'loading-states', label: 'Loading States', icon: Loader2 },
    { id: 'tooltips-popovers', label: 'Tooltips & Popovers', icon: MessageSquare },
    { id: 'modals-sheets', label: 'Modals & Sheets', icon: PanelLeftOpen },
    { id: 'media-controls', label: 'Media Controls', icon: Play },
    { id: 'hr-examples', label: 'HR Examples', icon: Users },
    { id: 'accessibility', label: 'Accessibility', icon: Shield },
    { id: 'best-practices', label: 'Best Practices', icon: CheckCircle },
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

  const InteractiveCard: React.FC<{ children: React.ReactNode; title: string; description: string }> = ({ 
    children, 
    title, 
    description 
  }) => (
    <Card className="p-6 border-brown-200 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center group-hover:bg-brown-200 transition-colors">
          <Sparkles className="w-6 h-6 text-brown-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-2 group-hover:text-brown-700 transition-colors">{title}</h4>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <TooltipProvider>
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
                    <h1 className="text-xl font-semibold">Interactions</h1>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                      Interactive
                    </Badge>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    Create engaging and responsive user interactions for HR applications
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
                        Interactive Components
                      </h1>
                      <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                        Build engaging and responsive user interfaces with interactive components that provide 
                        immediate feedback and enhance user experience in HR applications. From subtle hover 
                        effects to complex modal interactions.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <PreviewCard>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                          <MousePointer className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold mb-2">User Feedback</h3>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Provide immediate visual feedback for user actions through hover, focus, and click states.</p>
                      </PreviewCard>
                      
                      <PreviewCard>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                          <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Performance</h3>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Smooth animations and transitions that don't compromise application performance.</p>
                      </PreviewCard>
                      
                      <PreviewCard>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                          <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold mb-2">Accessible</h3>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>All interactions work with keyboard navigation and screen readers.</p>
                      </PreviewCard>
                    </div>

                    <PreviewCard title="Interaction Principles">
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Immediate Feedback</span>
                            <p className="text-sm text-gray-600">Users should see immediate response to their actions</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Consistent Timing</span>
                            <p className="text-sm text-gray-600">Use consistent animation durations across similar interactions</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Purposeful Motion</span>
                            <p className="text-sm text-gray-600">Every animation should have a clear purpose and enhance usability</p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </section>

                {/* Hover Effects */}
                <section id="hover-effects" className="scroll-mt-28">
                  <div className="space-y-8">
                    <div>
                      <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Hover Effects</h2>
                      <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Subtle hover effects that provide visual feedback without being distracting</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <InteractiveCard 
                        title="Button Hover States" 
                        description="Different button variants with consistent hover behavior"
                      >
                        <div className="flex flex-wrap gap-3">
                          <Button variant="default">Primary Button</Button>
                          <Button variant="outline">Secondary</Button>
                          <Button variant="ghost">Ghost</Button>
                          <Button variant="destructive">Danger</Button>
                        </div>
                      </InteractiveCard>

                      <InteractiveCard 
                        title="Card Hover Effects" 
                        description="Cards with elevation and border changes on hover"
                      >
                        <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group border-brown-200 hover:border-brown-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brown-100 rounded-lg flex items-center justify-center group-hover:bg-brown-200 transition-colors">
                              <Users className="w-5 h-5 text-brown-600" />
                            </div>
                            <div>
                              <h4 className="font-medium group-hover:text-brown-700 transition-colors">Employee Profile</h4>
                              <p className="text-sm text-gray-600">View employee details</p>
                            </div>
                          </div>
                        </Card>
                      </InteractiveCard>
                    </div>

                    <PreviewCard title="Code Example - Hover Effects">
                      <CodeBlock
                        code={`// Button with hover effects
<Button 
  className="hover:bg-brown-600 hover:scale-105 transition-all duration-200"
  variant="default"
>
  Hover Me
</Button>

// Card with hover effects
<Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
  <div className="p-4">
    <h3 className="group-hover:text-brown-700 transition-colors">
      Employee Card
    </h3>
    <div className="w-10 h-10 bg-brown-100 group-hover:bg-brown-200 transition-colors">
      <Users className="w-5 h-5" />
    </div>
  </div>
</Card>

// CSS for custom hover effects
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}`}
                        language="tsx"
                        id="hover-effects"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </section>

                {/* Click Interactions */}
                <section id="click-interactions" className="scroll-mt-28">
                  <div className="space-y-8">
                    <div>
                      <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Click Interactions</h2>
                      <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Immediate feedback for click and tap interactions</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <InteractiveCard 
                        title="Button Press Effects" 
                        description="Visual feedback when buttons are pressed"
                      >
                        <div className="space-y-3">
                          <Button 
                            className="active:scale-95 transition-transform duration-100"
                            onClick={() => console.log('Button clicked!')}
                          >
                            Press Effect
                          </Button>
                          <Button 
                            variant="outline"
                            className="active:bg-brown-100 transition-colors duration-100"
                            onClick={() => console.log('Outline clicked!')}
                          >
                            Color Change
                          </Button>
                        </div>
                      </InteractiveCard>

                      <InteractiveCard 
                        title="Ripple Effects" 
                        description="Material Design inspired ripple animations"
                      >
                        <Button 
                          className="relative overflow-hidden active:scale-95 transition-transform duration-100"
                          onClick={(e) => {
                            const button = e.currentTarget;
                            const rect = button.getBoundingClientRect();
                            const ripple = document.createElement('span');
                            const size = Math.max(rect.width, rect.height);
                            const x = e.clientX - rect.left - size / 2;
                            const y = e.clientY - rect.top - size / 2;
                            
                            ripple.style.width = ripple.style.height = size + 'px';
                            ripple.style.left = x + 'px';
                            ripple.style.top = y + 'px';
                            ripple.classList.add('ripple');
                            
                            button.appendChild(ripple);
                            setTimeout(() => ripple.remove(), 600);
                          }}
                        >
                          Ripple Button
                        </Button>
                      </InteractiveCard>
                    </div>

                    <PreviewCard title="Code Example - Click Interactions">
                      <CodeBlock
                        code={`// Button with press effect
<Button 
  className="active:scale-95 transition-transform duration-100"
  onClick={handleClick}
>
  Press Me
</Button>

// Ripple effect implementation
const handleRippleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  
  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
};

// CSS for ripple effect
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}`}
                        language="tsx"
                        id="click-interactions"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </section>

                {/* Loading States */}
                <section id="loading-states" className="scroll-mt-28">
                  <div className="space-y-8">
                    <div>
                      <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Loading States</h2>
                      <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Visual indicators for ongoing processes and data loading</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <InteractiveCard 
                        title="Progress Indicators" 
                        description="Show progress for long-running operations"
                      >
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Processing Applications</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          <Button 
                            onClick={simulateProgress}
                            disabled={isLoading}
                            className="w-full"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              'Start Process'
                            )}
                          </Button>
                        </div>
                      </InteractiveCard>

                      <InteractiveCard 
                        title="Loading Buttons" 
                        description="Buttons that show loading state during actions"
                      >
                        <div className="space-y-3">
                          <Button 
                            disabled={isLoading}
                            onClick={() => {
                              setIsLoading(true);
                              setTimeout(() => setIsLoading(false), 3000);
                            }}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              'Save Employee'
                            )}
                          </Button>
                          <Button variant="outline" disabled>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading Data...
                          </Button>
                        </div>
                      </InteractiveCard>
                    </div>

                    <PreviewCard title="Code Example - Loading States">
                      <CodeBlock
                        code={`import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

const LoadingExample = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />
      
      {/* Loading Button */}
      <Button 
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Submit Application'
        )}
      </Button>
    </div>
  );
};`}
                        language="tsx"
                        id="loading-states"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </section>

                {/* Tooltips & Popovers */}
                <section id="tooltips-popovers" className="scroll-mt-28">
                  <div className="space-y-8">
                    <div>
                      <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Tooltips & Popovers</h2>
                      <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Contextual information and secondary actions</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <InteractiveCard 
                        title="Helpful Tooltips" 
                        description="Provide additional context without cluttering the interface"
                      >
                        <div className="flex flex-wrap gap-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline">
                                <Info className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>This button provides additional information</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button>
                                <Users className="w-4 h-4 mr-2" />
                                Employees
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Manage employee records and profiles</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </InteractiveCard>

                      <InteractiveCard 
                        title="Rich Popovers" 
                        description="More detailed information and interactive content"
                      >
                        <div className="flex gap-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline">
                                <User className="w-4 h-4 mr-2" />
                                Profile
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-brown-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Sarah Johnson</h4>
                                    <p className="text-sm text-gray-600">HR Manager</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-600">Department:</span>
                                    <p className="font-medium">Human Resources</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Start Date:</span>
                                    <p className="font-medium">Jan 15, 2022</p>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </InteractiveCard>
                    </div>

                    <PreviewCard title="Code Example - Tooltips & Popovers">
                      <CodeBlock
                        code={`import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

// Simple Tooltip
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">
        <Info className="w-4 h-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Additional information about this action</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

// Rich Popover
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Employee Details</Button>
  </PopoverTrigger>
  <PopoverContent className="w-80">
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src="/employee.jpg" />
          <AvatarFallback>SJ</AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium">Sarah Johnson</h4>
          <p className="text-sm text-gray-600">HR Manager</p>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-600">Department:</span>
          <p className="font-medium">Human Resources</p>
        </div>
        <div>
          <span className="text-gray-600">Start Date:</span>
          <p className="font-medium">Jan 15, 2022</p>
        </div>
      </div>
    </div>
  </PopoverContent>
</Popover>`}
                        language="tsx"
                        id="tooltips-popovers"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </section>

                {/* Modals & Sheets */}
                <section id="modals-sheets" className="scroll-mt-28">
                  <div className="space-y-8">
                    <div>
                      <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Modals & Sheets</h2>
                      <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Overlay components for complex interactions and forms</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <InteractiveCard 
                        title="Modal Dialogs" 
                        description="Centered overlays for important actions and confirmations"
                      >
                        <div className="flex gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button>Open Modal</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add New Employee</DialogTitle>
                                <DialogDescription>
                                  Enter the employee details to create a new profile.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                                  <Input id="name" placeholder="Enter full name" />
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                                  <Input id="email" type="email" placeholder="Enter email address" />
                                </div>
                                <div className="space-y-2">
                                  <label htmlFor="department" className="text-sm font-medium">Department</label>
                                  <Input id="department" placeholder="Enter department" />
                                </div>
                              </div>
                              <div className="flex justify-end gap-3">
                                <DialogTrigger asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogTrigger>
                                <Button>Create Employee</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </InteractiveCard>

                      <InteractiveCard 
                        title="Side Sheets" 
                        description="Slide-in panels for detailed content and forms"
                      >
                        <div className="flex gap-3">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline">Open Sheet</Button>
                            </SheetTrigger>
                            <SheetContent className="w-[480px] sm:max-w-[480px]">
                              <SheetHeader className="px-6 pt-6">
                                <SheetTitle>Employee Details</SheetTitle>
                                <SheetDescription>
                                  View and edit employee information.
                                </SheetDescription>
                              </SheetHeader>
                              <div className="px-6 py-6 space-y-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-brown-100 rounded-full flex items-center justify-center">
                                    <User className="w-8 h-8 text-brown-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">Sarah Johnson</h3>
                                    <p className="text-sm text-gray-600">HR Manager</p>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Email</label>
                                    <p className="font-medium">sarah.johnson@company.com</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Department</label>
                                    <p className="font-medium">Human Resources</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                                    <p className="font-medium">January 15, 2022</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-600">Employee ID</label>
                                    <p className="font-medium">HR001</p>
                                  </div>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </div>
                      </InteractiveCard>
                    </div>

                    <PreviewCard title="Code Example - Modals & Sheets">
                      <CodeBlock
                        code={`import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

// Modal Dialog
<Dialog>
  <DialogTrigger asChild>
    <Button>Add Employee</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add New Employee</DialogTitle>
      <DialogDescription>
        Enter the employee details to create a new profile.
      </DialogDescription>
    </DialogHeader>
    <form className="space-y-4 py-4">
      <div>
        <label htmlFor="name">Full Name</label>
        <Input id="name" placeholder="Enter full name" />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" type="email" placeholder="Enter email" />
      </div>
    </form>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button type="submit">Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Side Sheet
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">View Details</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Employee Details</SheetTitle>
      <SheetDescription>
        View and edit employee information.
      </SheetDescription>
    </SheetHeader>
    <div className="py-6">
      {/* Sheet content */}
    </div>
  </SheetContent>
</Sheet>`}
                        language="tsx"
                        id="modals-sheets"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </section>

                {/* Media Controls */}
                <section id="media-controls" className="scroll-mt-28">
                  <div className="space-y-8">
                    <div>
                      <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Media Controls</h2>
                      <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Interactive controls for video, audio, and presentation content</p>
                    </div>

                    <PreviewCard title="Media Player Controls">
                      <div className="bg-gray-900 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Training Video: Workplace Safety</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="text-white hover:bg-gray-800"
                          >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                          </Button>
                        </div>
                        
                        <div className="bg-gray-800 rounded aspect-video flex items-center justify-center mb-4">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                            </div>
                            <p className="text-gray-400">Video Player</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsPlaying(!isPlaying)}
                              className="text-white hover:bg-gray-800"
                            >
                              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            </Button>
                            
                            <div className="flex-1">
                              <Progress value={33} className="h-1 bg-gray-700" />
                            </div>
                            
                            <span className="text-sm text-gray-400">2:15 / 6:42</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVolume(volume === 0 ? 50 : 0)}
                                className="text-white hover:bg-gray-800"
                              >
                                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              </Button>
                              <div className="w-20">
                                <Progress value={volume} className="h-1 bg-gray-700" />
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                                Settings
                              </Button>
                              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                                CC
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Code Example - Media Controls">
                      <CodeBlock
                        code={`import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

const MediaPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [progress, setProgress] = useState(33);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      {/* Video Display Area */}
      <div className="bg-gray-800 rounded aspect-video flex items-center justify-center mb-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-20 h-20 rounded-full bg-gray-700 hover:bg-gray-600"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </Button>
      </div>
      
      {/* Controls */}
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          
          <div className="flex-1">
            <Progress value={progress} className="h-1" />
          </div>
          
          <span className="text-sm">2:15 / 6:42</span>
        </div>
        
        {/* Volume and Settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setVolume(volume === 0 ? 50 : 0)}
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <div className="w-20">
              <Progress value={volume} className="h-1" />
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};`}
                        language="tsx"
                        id="media-controls"
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
                      <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Real-world interaction patterns for HR management systems</p>
                    </div>

                    <div className="grid gap-6">
                      <PreviewCard title="Employee Directory with Interactive Cards">
                        <div className="grid md:grid-cols-3 gap-4">
                          {[
                            { name: 'Sarah Johnson', role: 'HR Manager', dept: 'Human Resources', status: 'active' },
                            { name: 'Mike Chen', role: 'Developer', dept: 'Engineering', status: 'active' },
                            { name: 'Emily Davis', role: 'Designer', dept: 'Design', status: 'away' }
                          ].map((employee, index) => (
                            <Card key={index} className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group border-brown-200 hover:border-brown-300">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-brown-100 rounded-full flex items-center justify-center group-hover:bg-brown-200 transition-colors">
                                  <User className="w-5 h-5 text-brown-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium group-hover:text-brown-700 transition-colors">{employee.name}</h4>
                                  <p className="text-sm text-gray-600">{employee.role}</p>
                                </div>
                                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                  {employee.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>{employee.dept}</p>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button size="sm" variant="ghost" className="flex-1">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Email
                                </Button>
                                <Button size="sm" variant="ghost" className="flex-1">
                                  <Phone className="w-3 h-3 mr-1" />
                                  Call
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </PreviewCard>

                      <PreviewCard title="Interactive Application Review">
                        <Card className="p-6 border-brown-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">Senior Developer Application</h4>
                                <p className="text-sm text-gray-600">Alex Rodriguez • Applied 2 days ago</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Under Review
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="font-semibold text-lg">8</div>
                              <div className="text-sm text-gray-600">Years Experience</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="font-semibold text-lg">React, Node.js</div>
                              <div className="text-sm text-gray-600">Key Skills</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <div className="font-semibold text-lg">$85K</div>
                              <div className="text-sm text-gray-600">Expected Salary</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                              <Eye className="w-4 h-4 mr-2" />
                              View Resume
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Interview
                            </Button>
                            <Button className="flex-1">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </Card>
                      </PreviewCard>
                    </div>

                    <PreviewCard title="Code Example - HR Interactive Components">
                      <CodeBlock
                        code={`// Employee Card with Interactions
const EmployeeCard = ({ employee }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openEmployeeDetails(employee.id)}
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar className="w-10 h-10 group-hover:scale-110 transition-transform">
          <AvatarImage src={employee.avatar} />
          <AvatarFallback>{employee.initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className="font-medium group-hover:text-brown-700 transition-colors">
            {employee.name}
          </h4>
          <p className="text-sm text-gray-600">{employee.role}</p>
        </div>
        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
          {employee.status}
        </Badge>
      </div>
      
      {/* Quick Actions - Only show on hover */}
      <div className={cn(
        "mt-3 flex gap-2 transition-all duration-200",
        isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={(e) => {
            e.stopPropagation();
            sendEmail(employee.email);
          }}
        >
          <Mail className="w-3 h-3 mr-1" />
          Email
        </Button>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            scheduleCall(employee.phone);
          }}
        >
          <Phone className="w-3 h-3 mr-1" />
          Call
        </Button>
      </div>
    </Card>
  );
};

// Application Review with Interactive Actions
const ApplicationReview = ({ application }) => {
  const [status, setStatus] = useState(application.status);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleStatusChange = async (newStatus) => {
    setIsProcessing(true);
    try {
      await updateApplicationStatus(application.id, newStatus);
      setStatus(newStatus);
    } catch (error) {
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className="p-6">
      {/* Application Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold">{application.position}</h4>
            <p className="text-sm text-gray-600">
              {application.candidateName} • Applied {application.appliedDate}
            </p>
          </div>
        </div>
        <Badge variant="outline">{status}</Badge>
      </div>
      
      {/* Interactive Actions */}
      <div className="flex gap-3 mt-6">
        <Button 
          variant="outline" 
          onClick={() => viewResume(application.resumeUrl)}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Resume
        </Button>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent>
            {/* Interview scheduling form */}
          </DialogContent>
        </Dialog>
        
        <Button 
          onClick={() => handleStatusChange('approved')}
          disabled={isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Approve
        </Button>
      </div>
    </Card>
  );
};`}
                        language="tsx"
                        id="hr-examples"
                        copiedCode={copiedCode}
                        onCopy={copyToClipboard}
                      />
                    </PreviewCard>
                  </div>
                </section>

                {/* Accessibility */}
                <section id="accessibility" className="scroll-mt-28">
                  <div className="space-y-8">
                    <div>
                      <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Accessibility</h2>
                      <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Ensuring interactions work for all users</p>
                    </div>

                    <PreviewCard title="Accessibility Guidelines">
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Keyboard Navigation</span>
                            <p className="text-sm text-gray-600 mt-1">All interactive elements should be accessible via keyboard. Use Tab, Enter, Space, and arrow keys appropriately.</p>
                            <div className="mt-2 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                              <code className="text-sm">tabIndex, onKeyDown, aria-label</code>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Screen Reader Support</span>
                            <p className="text-sm text-gray-600 mt-1">Use ARIA labels and descriptions to communicate interactive states and purposes.</p>
                            <div className="mt-2 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                              <code className="text-sm">aria-label, aria-describedby, role</code>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Focus Management</span>
                            <p className="text-sm text-gray-600 mt-1">Manage focus appropriately when opening/closing modals, menus, and other interactive elements.</p>
                            <div className="mt-2 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                              <code className="text-sm">focus(), focusTrap, returnFocus</code>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Reduced Motion</span>
                            <p className="text-sm text-gray-600 mt-1">Respect user preferences for reduced motion and provide alternative feedback.</p>
                            <div className="mt-2 p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                              <code className="text-sm">prefers-reduced-motion, instant transitions</code>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Code Example - Accessible Interactions">
                      <CodeBlock
                        code={`// Accessible Button with Keyboard Support
const AccessibleButton = ({ children, onClick, ...props }) => {
  const handleKeyDown = (e) => {
    // Activate on Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
  };

  return (
    <button
      className="px-4 py-2 bg-brown-600 text-white rounded hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-brown-500 focus:ring-offset-2"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label="Submit employee application"
      {...props}
    >
      {children}
    </button>
  );
};

// Accessible Modal with Focus Management
const AccessibleModal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement;
      
      // Focus modal
      modalRef.current?.focus();
      
      // Trap focus within modal
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        if (e.key === 'Tab') {
          // Focus trap logic
          const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements?.length) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    } else {
      // Return focus to previous element
      previousFocusRef.current?.focus();
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  );
};

// Accessible Tooltip
const AccessibleTooltip = ({ children, content, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-describedby={isVisible ? tooltipId : undefined}
        {...props}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50"
        >
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// Reduced Motion Support
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Component that respects motion preferences
const AnimatedButton = ({ children, ...props }) => {
  const prefersReducedMotion = useReducedMotion();
  
  const animationClasses = prefersReducedMotion 
    ? "transition-colors duration-150" 
    : "transition-all duration-200 hover:scale-105";

  return (
    <button 
      className={cn("px-4 py-2 bg-brown-600 text-white rounded", animationClasses)}
      {...props}
    >
      {children}
    </button>
  );
};`}
                        language="tsx"
                        id="accessibility"
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
                      <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Guidelines for creating effective and user-friendly interactions</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <PreviewCard title="Performance Guidelines">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-sm">Use CSS transforms for animations</span>
                              <p className="text-xs text-gray-600">Transforms are GPU-accelerated and more performant</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-sm">Debounce expensive operations</span>
                              <p className="text-xs text-gray-600">Prevent excessive API calls during user input</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-sm">Keep animations under 300ms</span>
                              <p className="text-xs text-gray-600">Longer animations feel sluggish to users</p>
                            </div>
                          </div>
                        </div>
                      </PreviewCard>

                      <PreviewCard title="User Experience Guidelines">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-sm">Provide immediate feedback</span>
                              <p className="text-xs text-gray-600">Users should see response within 100ms</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-sm">Use consistent interaction patterns</span>
                              <p className="text-xs text-gray-600">Similar actions should behave similarly</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <span className="font-medium text-sm">Show loading states for slow operations</span>
                              <p className="text-xs text-gray-600">Anything over 1 second needs a loading indicator</p>
                            </div>
                          </div>
                        </div>
                      </PreviewCard>
                    </div>

                    <PreviewCard title="Common Patterns for HR Applications">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <h4 className="font-medium text-blue-900 mb-2">Employee Search & Filter</h4>
                          <p className="text-sm text-blue-800">Implement instant search with debouncing, filter animations, and clear loading states for large employee databases.</p>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <h4 className="font-medium text-green-900 mb-2">Application Review Workflow</h4>
                          <p className="text-sm text-green-800">Use progressive disclosure, clear action states, and confirmation dialogs for irreversible actions like approving/rejecting applications.</p>
                        </div>
                        
                        <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                          <h4 className="font-medium text-purple-900 mb-2">Performance Review Interface</h4>
                          <p className="text-sm text-purple-800">Implement auto-save functionality, progress indicators for multi-step forms, and contextual tooltips for evaluation criteria.</p>
                        </div>
                        
                        <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                          <h4 className="font-medium text-orange-900 mb-2">Onboarding Checklists</h4>
                          <p className="text-sm text-orange-800">Use animated progress bars, collapsible sections, and celebration micro-interactions when tasks are completed.</p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Code Example - Best Practices">
                      <CodeBlock
                        code={`// Debounced search with loading states
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const EmployeeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsLoading(true);
      searchEmployees(debouncedSearchTerm)
        .then(setResults)
        .finally(() => setIsLoading(false));
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search employees..."
          className="pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
      </div>
      
      {/* Results with smooth animations */}
      <div className="space-y-2">
        {results.map((employee, index) => (
          <div
            key={employee.id}
            className="p-3 bg-white rounded border hover:shadow-md transition-all duration-200"
            style={{
              animationDelay: \`\${index * 50}ms\`,
              animation: 'fadeInUp 0.3s ease-out forwards'
            }}
          >
            {employee.name} - {employee.department}
          </div>
        ))}
      </div>
    </div>
  );
};

// Progressive form with auto-save
const PerformanceReviewForm = () => {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(formData).length > 0) {
        saveFormData(formData);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData]);

  const saveFormData = async (data) => {
    setIsSaving(true);
    try {
      await api.saveReview(data);
      setLastSaved(new Date());
    } catch (error) {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-6">
      {/* Auto-save indicator */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Performance Review</span>
        <div className="flex items-center gap-2">
          {isSaving ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <span>Saved {formatTimeAgo(lastSaved)}</span>
          ) : null}
        </div>
      </div>
      
      {/* Form fields with smooth focus transitions */}
      <div className="space-y-4">
        <div className="group">
          <label className="block text-sm font-medium mb-1">
            Overall Performance
          </label>
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-brown-500 transition-all duration-200"
            rows={4}
            value={formData.performance || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              performance: e.target.value
            }))}
          />
        </div>
      </div>
    </form>
  );
};

// Celebration micro-interaction
const ChecklistItem = ({ item, onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(item.completed);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    setShowCelebration(true);
    onComplete(item.id);
    
    // Hide celebration after animation
    setTimeout(() => setShowCelebration(false), 1000);
  };

  return (
    <div className="relative flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
      <button
        onClick={handleComplete}
        disabled={isCompleted}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          isCompleted 
            ? "bg-green-500 border-green-500 text-white" 
            : "border-gray-300 hover:border-green-500"
        )}
      >
        {isCompleted && <Check className="w-3 h-3" />}
      </button>
      
      <span className={cn(
        "flex-1 transition-all duration-200",
        isCompleted && "text-gray-500 line-through"
      )}>
        {item.title}
      </span>
      
      {/* Celebration animation */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-ping">
            <Sparkles className="w-8 h-8 text-green-500" />
          </div>
        </div>
      )}
    </div>
  );
};`}
                        language="tsx"
                        id="best-practices"
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
    </TooltipProvider>
  );
};