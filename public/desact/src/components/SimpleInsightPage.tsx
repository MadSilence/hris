import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, BarChart3, TrendingUp, Activity, Target, Users, DollarSign, Award, Briefcase, Clock, CheckCircle, CreditCard, Globe, Star, UserCheck, FileText, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';

import { DesactLogo } from './shared/DesactLogo';
import { PinterestLayout } from './shared/PinterestLayout';
import { DASHBOARD_WIDGETS, CODE_EXAMPLE } from './constants/dashboardExamplesData';

interface SimpleInsightPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const SimpleInsightPage: React.FC<SimpleInsightPageProps> = ({ 
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
      const sections = ['overview', 'widget-examples', 'simple-metrics', 'dual-metrics', 'progress-widgets', 'list-widgets', 'range-widgets', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'widget-examples', label: 'Widget Examples', icon: Activity },
    { id: 'simple-metrics', label: 'Simple Metrics', icon: Target },
    { id: 'dual-metrics', label: 'Dual Metrics', icon: TrendingUp },
    { id: 'progress-widgets', label: 'Progress Widgets', icon: CheckCircle },
    { id: 'list-widgets', label: 'List Widgets', icon: Briefcase },
    { id: 'range-widgets', label: 'Range Widgets', icon: BarChart3 },
    { id: 'implementation', label: 'Implementation', icon: FileText },
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
                  <h1 className="text-xl font-semibold">Simple Insight</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Widgets
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Simple dashboard widgets in Pinterest timeline layout
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
                      Simple Insight Widgets
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      A collection of simple, reusable dashboard widgets with different patterns: single metrics, dual metrics, 
                      progress indicators, lists, and ranges. All widgets use consistent styling and are optimized for 
                      the Pinterest timeline layout.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <BarChart3 className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">18 Widget Types</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Simple metrics, dual metrics, progress bars, lists, and ranges for comprehensive data display.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Pinterest Layout</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Masonry grid layout with 3 columns on desktop, adapting to variable heights and content density.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">HR Focused</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>All widgets feature realistic HR data including hiring, payroll, performance, and employee metrics.</p>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Widget Patterns Overview">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-lg font-bold text-brown-700">10</div>
                        <div className="text-sm text-gray-600">Simple Metrics</div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-lg font-bold text-brown-700">4</div>
                        <div className="text-sm text-gray-600">Dual Metrics</div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="text-lg font-bold text-brown-700">2</div>
                        <div className="text-sm text-gray-600">Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Briefcase className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-lg font-bold text-brown-700">2</div>
                        <div className="text-sm text-gray-600">Lists</div>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <BarChart3 className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="text-lg font-bold text-brown-700">1</div>
                        <div className="text-sm text-gray-600">Ranges</div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Widget Examples Section */}
              <section id="widget-examples" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Interactive Widget Examples</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Browse through all widget patterns in the Pinterest timeline layout</p>
                  </div>
                  
                  <PinterestLayout>
                    {DASHBOARD_WIDGETS}
                  </PinterestLayout>
                </div>
              </section>

              {/* Simple Metrics Section */}
              <section id="simple-metrics" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Simple Metric Widgets</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Single value displays with trend indicators and contextual backgrounds</p>
                  </div>
                  
                  <PreviewCard title="Features">
                    <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                      <li>• <strong>Single Value Focus:</strong> Clear display of the main metric</li>
                      <li>• <strong>Trend Indicators:</strong> Green arrows show positive/negative trends</li>
                      <li>• <strong>Contextual Icons:</strong> Relevant icons for each metric type</li>
                      <li>• <strong>Gradient Backgrounds:</strong> Subtle color coding by category</li>
                      <li>• <strong>Consistent Typography:</strong> 2xl bold for values, small for labels</li>
                    </ul>
                  </PreviewCard>
                </div>
              </section>

              {/* Dual Metrics Section */}
              <section id="dual-metrics" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Dual Metric Widgets</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Two related values displayed side by side for comparison</p>
                  </div>
                  
                  <PreviewCard title="Use Cases">
                    <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                      <li>• <strong>Total vs Count:</strong> $320K total bonuses, 89 recipients</li>
                      <li>• <strong>Aggregate vs Average:</strong> $890K total benefits, $2.8K per employee</li>
                      <li>• <strong>Current vs Qualified:</strong> 456 applications this month, 89 qualified</li>
                      <li>• <strong>Completion vs Rating:</strong> 92% reviews completed, 4.2 average score</li>
                    </ul>
                  </PreviewCard>
                </div>
              </section>

              {/* Progress Widgets Section */}
              <section id="progress-widgets" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Progress Widgets</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Percentage-based metrics with visual progress bars</p>
                  </div>
                  
                  <PreviewCard title="Design Elements">
                    <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                      <li>• <strong>Centered Layout:</strong> Percentage and label prominently displayed</li>
                      <li>• <strong>Visual Progress Bar:</strong> Brown-themed progress indication</li>
                      <li>• <strong>Trend Text:</strong> Optional positive trend indicators</li>
                      <li>• <strong>Smooth Animations:</strong> 500ms transition for progress fills</li>
                    </ul>
                  </PreviewCard>
                </div>
              </section>

              {/* List Widgets Section */}
              <section id="list-widgets" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>List Widgets</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Key-value pairs in organized, scannable format</p>
                  </div>
                  
                  <PreviewCard title="Layout Structure">
                    <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                      <li>• <strong>Header with Icon:</strong> Title and contextual icon</li>
                      <li>• <strong>Rounded Items:</strong> Each item in brown-50 background</li>
                      <li>• <strong>Justified Content:</strong> Labels left-aligned, values right-aligned</li>
                      <li>• <strong>Consistent Spacing:</strong> 3-unit spacing between items</li>
                    </ul>
                  </PreviewCard>
                </div>
              </section>

              {/* Range Widgets Section */}
              <section id="range-widgets" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Range Widgets</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Data distribution with visual bar representations</p>
                  </div>
                  
                  <PreviewCard title="Visualization Elements">
                    <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                      <li>• <strong>Range Labels:</strong> Clear category definitions (e.g., $50K-70K)</li>
                      <li>• <strong>Count Display:</strong> Numeric values prominently shown</li>
                      <li>• <strong>Proportional Bars:</strong> Visual representation of relative sizes</li>
                      <li>• <strong>Smooth Animations:</strong> 500ms transitions for bar fills</li>
                    </ul>
                  </PreviewCard>
                </div>
              </section>

              {/* Implementation Section */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation Guide</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Code examples and usage patterns for the Simple Insight widgets</p>
                  </div>

                  <PreviewCard title="Widget Components">
                    <CodeBlock
                      code={CODE_EXAMPLE}
                      language="tsx"
                      id="simple-insight-implementation"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PreviewCard title="Design Features">
                      <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                        <li>• <strong>Consistent Icons:</strong> Lucide React icons throughout</li>
                        <li>• <strong>Color Coding:</strong> Green for positive trends, contextual colors</li>
                        <li>• <strong>Typography:</strong> Clear hierarchy with proper contrast</li>
                        <li>• <strong>Responsive:</strong> Adapts to Pinterest timeline layout</li>
                        <li>• <strong>Interactive:</strong> Hover states and smooth transitions</li>
                      </ul>
                    </PreviewCard>
                    
                    <PreviewCard title="Usage Guidelines">
                      <ul className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
                        <li>• <strong>Simple Metrics:</strong> Single KPIs with trend context</li>
                        <li>• <strong>Dual Metrics:</strong> Related values for comparison</li>
                        <li>• <strong>Progress:</strong> Completion percentages and goals</li>
                        <li>• <strong>Lists:</strong> Categorical breakdowns and rankings</li>
                        <li>• <strong>Ranges:</strong> Distribution analysis and segmentation</li>
                      </ul>
                    </PreviewCard>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};