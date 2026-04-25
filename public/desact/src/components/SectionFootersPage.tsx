import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Layout, Navigation, Settings, Code2, Mouse, Plus, Download, Bell, Share, CheckCircle, Info, Calendar, Clock, TrendingUp, User, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Activity, RefreshCw, ArrowRight, FileText, Upload, AlignCenter, Save, Send, X, Bookmark, Printer, HelpCircle, MessageSquare, Mail, Heart, Users, ThumbsUp, Linkedin, Twitter, Facebook } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';

interface SectionFootersPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const SectionFootersPage: React.FC<SectionFootersPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Interactive states
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
    onFocus: () => {
      console.log('Sidebar search focused');
    },
  });

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
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

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAgreedToTerms(false);
    }, 1500);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'action-footers', 'navigation-footers', 'info-footers', 'form-footers', 'content-footers', 'social-footers', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: Mouse },
    { id: 'action-footers', label: 'Action Footers', icon: Settings },
    { id: 'navigation-footers', label: 'Navigation Footers', icon: Navigation },
    { id: 'info-footers', label: 'Info Footers', icon: Info },
    { id: 'form-footers', label: 'Form Footers', icon: FileText },
    { id: 'content-footers', label: 'Content Footers', icon: Layout },
    { id: 'social-footers', label: 'Social Footers', icon: MessageSquare },
    { id: 'implementation', label: 'Implementation', icon: Code2 },
  ];

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
      <MainSidebar
        onBack={onBack}
        components={components}
        onComponentClick={onComponentClick}
        currentComponent={currentComponent}
        sidebarSearchTerm={sidebarSearchTerm}
        setSidebarSearchTerm={setSidebarSearchTerm}
        collapsedCategories={collapsedCategories}
        setCollapsedCategories={setCollapsedCategories}
        sidebarInputRef={sidebarInputRef}
        handleSidebarKeyDown={handleSidebarKeyDown}
      />

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
                  <h1 className="text-xl font-semibold">Section Footers</h1>
                  <Badge variant="secondary" className="bg-brown-100 text-brown-700 border-brown-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Footer patterns for sections with proper semantic structure and interactive elements
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
                      Section Footers Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Section footers provide closure and additional actions for content sections using semantic HTML5 footer elements. 
                      These examples demonstrate proper use of footer, nav, and other semantic elements.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <AlignCenter className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Semantic Structure</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Using proper HTML5 footer elements within sections for better accessibility and SEO.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Action Elements</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Footers with buttons, links, and other interactive components for user actions.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Navigation className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Navigation Context</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Footers that provide navigation, pagination, and contextual links.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Action Footers Section */}
              <section id="action-footers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Action Footers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Footers designed for actions like saving, canceling, submitting, or navigating through content.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Primary Action Footer">
                      <Card className="border-brown-200">
                        <main className="p-6">
                          <section>
                            <h3 className="text-lg font-semibold text-brown-900 mb-4">Employee Information</h3>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-brown-700 mb-2">First Name</label>
                                  <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                                    placeholder="John"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-brown-700 mb-2">Last Name</label>
                                  <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                                    placeholder="Doe"
                                  />
                                </div>
                              </div>
                            </div>
                          </section>
                        </main>
                        <footer className="bg-brown-50 border-t border-brown-200 px-6 py-4 rounded-b-xl">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-brown-600">All changes are saved automatically</p>
                            <div className="flex items-center gap-3">
                              <Button variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                Cancel
                              </Button>
                              <Button className="bg-brown-700 text-white hover:bg-brown-800">
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </footer>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Destructive Action Footer">
                      <Card className="border-red-200">
                        <main className="p-6">
                          <section>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-red-900">Delete Employee Record</h3>
                                <p className="text-sm text-red-700">This action cannot be undone</p>
                              </div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <p className="text-sm text-red-800">
                                Are you sure you want to delete <strong>John Doe's</strong> employee record? 
                                This will permanently remove all associated data.
                              </p>
                            </div>
                          </section>
                        </main>
                        <footer className="bg-red-50 border-t border-red-200 px-6 py-4 rounded-b-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-700">This action is irreversible</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                                Cancel
                              </Button>
                              <Button className="bg-red-600 text-white hover:bg-red-700">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Record
                              </Button>
                            </div>
                          </div>
                        </footer>
                      </Card>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<Card className="border-brown-200">
  <main className="p-6">
    <section>
      <h3 className="text-lg font-semibold text-brown-900 mb-4">Employee Information</h3>
      <div className="space-y-4">
        {/* Form content */}
      </div>
    </section>
  </main>
  <footer className="bg-brown-50 border-t border-brown-200 px-6 py-4 rounded-b-xl">
    <div className="flex items-center justify-between">
      <p className="text-sm text-brown-600">All changes are saved automatically</p>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-100">
          Cancel
        </Button>
        <Button className="bg-brown-700 text-white hover:bg-brown-800">
          Save Changes
        </Button>
      </div>
    </div>
  </footer>
</Card>`}
                      language="tsx"
                      id="action-footers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Navigation Footers Section */}
              <section id="navigation-footers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Navigation Footers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Footers that provide navigation elements, pagination controls, and contextual links.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Section Footer Button Group">
                      <Card className="border-brown-200">
                        <main className="p-6">
                          <section>
                            <h3 className="text-lg font-semibold text-brown-900 mb-4">Time Period Selection</h3>
                            <div className="space-y-4">
                              <p className="text-sm text-brown-600">
                                Choose your preferred reporting period for analytics dashboard
                              </p>
                              <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
                                <p className="text-sm text-brown-800">
                                  Current selection will affect all charts and metrics displayed in your dashboard.
                                </p>
                              </div>
                            </div>
                          </section>
                        </main>
                        <footer className="bg-white border-t border-brown-200 px-6 py-4 rounded-b-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-brown-300 text-brown-700 hover:bg-brown-100"
                              >
                                12 months
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-brown-300 text-brown-700 hover:bg-brown-100"
                              >
                                30 days
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-brown-300 text-brown-700 hover:bg-brown-100"
                              >
                                7 days
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-brown-300 text-brown-700 hover:bg-brown-100"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Custom
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-brown-600 hover:text-brown-700 hover:bg-brown-50"
                              >
                                Learn more
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-brown-300 text-brown-700 hover:bg-brown-100"
                              >
                                Tertiary
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-brown-300 text-brown-700 hover:bg-brown-100"
                              >
                                Secondary
                              </Button>
                              <Button 
                                size="sm"
                                className="bg-brown-700 text-white hover:bg-brown-800"
                              >
                                Primary
                              </Button>
                            </div>
                          </div>
                        </footer>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Section Footer Card">
                      <Card className="border-brown-200">
                        <main className="p-6">
                          <section>
                            <h3 className="text-lg font-semibold text-brown-900 mb-4">Getting Started Guide</h3>
                            <div className="space-y-4">
                              <p className="text-sm text-brown-600">
                                Welcome to your HR dashboard. Follow these quick steps to set up your workspace.
                              </p>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-brown-600" />
                                    <span className="text-sm font-medium text-brown-900">Step 1 Complete</span>
                                  </div>
                                  <p className="text-xs text-brown-700">Account setup finished</p>
                                </div>
                                <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-brown-600" />
                                    <span className="text-sm font-medium text-brown-900">Step 2 Pending</span>
                                  </div>
                                  <p className="text-xs text-brown-700">Import employee data</p>
                                </div>
                              </div>
                            </div>
                          </section>
                        </main>
                        <footer className="bg-white border-t border-brown-200 px-6 py-4 rounded-b-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-brown-600 hover:text-brown-700 hover:bg-brown-50"
                              >
                                Learn more
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-brown-300 text-brown-700 hover:bg-brown-100"
                              >
                                Tertiary
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-brown-300 text-brown-700 hover:bg-brown-100"
                              >
                                Secondary
                              </Button>
                              <Button 
                                size="sm"
                                className="bg-brown-700 text-white hover:bg-brown-800"
                              >
                                Primary
                              </Button>
                            </div>
                          </div>
                        </footer>
                      </Card>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Navigation Footer Code Example">
                    <CodeBlock
                      code={`<Card className="border-brown-200">
  <main className="p-6">
    <section>
      <h3 className="text-lg font-semibold text-brown-900 mb-4">Time Period Selection</h3>
      <div className="space-y-4">
        <p className="text-sm text-brown-600">
          Choose your preferred reporting period for analytics dashboard
        </p>
      </div>
    </section>
  </main>
  <footer className="bg-white border-t border-brown-200 px-6 py-4 rounded-b-xl">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">12 months</Button>
        <Button variant="outline" size="sm">30 days</Button>
        <Button variant="outline" size="sm">7 days</Button>
        <Button variant="outline" size="sm">
          <Plus className="w-3 h-3 mr-1" />
          Custom
        </Button>
        <Button variant="ghost" size="sm">Learn more</Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">Tertiary</Button>
        <Button variant="outline" size="sm">Secondary</Button>
        <Button size="sm" className="bg-brown-700 text-white hover:bg-brown-800">
          Primary
        </Button>
      </div>
    </div>
  </footer>
</Card>`}
                      language="tsx"
                      id="navigation-footers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Info Footers Section */}
              <section id="info-footers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Info Footers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Footers that provide contextual information, status updates, and helpful hints.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Status Information Footer">
                      <Card className="border-brown-200">
                        <main className="p-6">
                          <section>
                            <h3 className="text-lg font-semibold text-brown-900 mb-4">System Status</h3>
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-brown-700 mb-1">99.9%</div>
                                  <div className="text-sm text-brown-600">Uptime</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-brown-700 mb-1">127ms</div>
                                  <div className="text-sm text-brown-600">Response Time</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-brown-700 mb-1">1,234</div>
                                  <div className="text-sm text-brown-600">Active Users</div>
                                </div>
                              </div>
                            </div>
                          </section>
                        </main>
                        <footer className="bg-brown-50 border-t border-brown-200 px-6 py-4 rounded-b-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-brown-600" />
                              <span className="text-sm text-brown-800">All systems operational</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-brown-700">
                              <RefreshCw className="w-4 h-4" />
                              <span>Last updated: 2 minutes ago</span>
                            </div>
                          </div>
                        </footer>
                      </Card>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Form Footers Section */}
              <section id="form-footers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Form Footers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Footers designed specifically for forms with validation, submission, and help text.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Form Submission Footer">
                      <form onSubmit={handleFormSubmit}>
                        <Card className="border-brown-200">
                          <main className="p-6">
                            <section>
                              <h3 className="text-lg font-semibold text-brown-900 mb-4">Contact Information</h3>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-brown-700 mb-2">Email</label>
                                    <input 
                                      type="email" 
                                      className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                                      placeholder="john@company.com"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-brown-700 mb-2">Phone</label>
                                    <input 
                                      type="tel" 
                                      className="w-full px-3 py-2 border border-brown-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                                      placeholder="+1 (555) 123-4567"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Checkbox 
                                    id="terms" 
                                    checked={agreedToTerms}
                                    onCheckedChange={setAgreedToTerms}
                                    className="border-brown-300 data-[state=checked]:bg-brown-700 data-[state=checked]:border-brown-700"
                                  />
                                  <label htmlFor="terms" className="text-sm text-brown-700">
                                    I agree to the terms and conditions
                                  </label>
                                </div>
                              </div>
                            </section>
                          </main>
                          <footer className="bg-brown-50 border-t border-brown-200 px-6 py-4 rounded-b-xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-brown-600">
                                <Info className="w-4 h-4" />
                                <span>Your information is secure and will not be shared</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <Button 
                                  type="button"
                                  variant="outline" 
                                  className="border-brown-300 text-brown-700 hover:bg-brown-100"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit"
                                  disabled={!agreedToTerms || isLoading}
                                  className="bg-brown-700 text-white hover:bg-brown-800 disabled:opacity-50"
                                >
                                  {isLoading ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4 mr-2" />
                                      Submit Form
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </footer>
                        </Card>
                      </form>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Content Footers Section */}
              <section id="content-footers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Content Footers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Footers that complement content with metadata, actions, and related information.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Article Content Footer">
                      <Card className="border-brown-200">
                        <main className="p-6">
                          <article>
                            <h3 className="text-lg font-semibold text-brown-900 mb-4">Employee Handbook Updates</h3>
                            <div className="space-y-4">
                              <p className="text-sm text-brown-700">
                                We've updated our employee handbook with new policies regarding remote work, 
                                flexible schedules, and professional development opportunities.
                              </p>
                              <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
                                <h4 className="font-medium text-brown-900 mb-2">Key Changes</h4>
                                <ul className="text-sm text-brown-800 space-y-1">
                                  <li>• Remote work eligibility expanded</li>
                                  <li>• New learning and development budget</li>
                                  <li>• Updated performance review process</li>
                                </ul>
                              </div>
                            </div>
                          </article>
                        </main>
                        <footer className="bg-brown-50 border-t border-brown-200 px-6 py-4 rounded-b-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">HR</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-brown-700">HR Team</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-brown-600">
                                <Calendar className="w-4 h-4" />
                                <span>Updated Dec 15, 2024</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:text-brown-700">
                                <Bookmark className="w-4 h-4 mr-1" />
                                Bookmark
                              </Button>
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:text-brown-700">
                                <Share className="w-4 h-4 mr-1" />
                                Share
                              </Button>
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:text-brown-700">
                                <Printer className="w-4 h-4 mr-1" />
                                Print
                              </Button>
                            </div>
                          </div>
                        </footer>
                      </Card>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Social Footers Section */}
              <section id="social-footers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Social Footers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Footers with social interactions, engagement elements, and community features.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Engagement Footer">
                      <Card className="border-brown-200">
                        <main className="p-6">
                          <section>
                            <h3 className="text-lg font-semibold text-brown-900 mb-4">Team Achievement</h3>
                            <div className="space-y-4">
                              <p className="text-sm text-brown-700">
                                Congratulations to the Engineering team for completing the Q4 product launch ahead of schedule! 
                                Their dedication and teamwork made this success possible.
                              </p>
                              <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                  <Avatar className="w-8 h-8 border-2 border-white">
                                    <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">JD</AvatarFallback>
                                  </Avatar>
                                  <Avatar className="w-8 h-8 border-2 border-white">
                                    <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">SM</AvatarFallback>
                                  </Avatar>
                                  <Avatar className="w-8 h-8 border-2 border-white">
                                    <AvatarFallback className="bg-brown-200 text-brown-700 text-xs">AL</AvatarFallback>
                                  </Avatar>
                                  <div className="w-8 h-8 border-2 border-white bg-brown-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-brown-700">+5</span>
                                  </div>
                                </div>
                                <span className="text-sm text-brown-600">and 5 others contributed</span>
                              </div>
                            </div>
                          </section>
                        </main>
                        <footer className="bg-brown-50 border-t border-brown-200 px-6 py-4 rounded-b-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:text-brown-700">
                                <Heart className="w-4 h-4 mr-1" />
                                24 likes
                              </Button>
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:text-brown-700">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                8 comments
                              </Button>
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:text-brown-700">
                                <Users className="w-4 h-4 mr-1" />
                                Share with team
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:text-brown-700">
                                <Linkedin className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:text-brown-700">
                                <Twitter className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-brown-600 hover:text-brown-700">
                                <Mail className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </footer>
                      </Card>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Implementation Section */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Implementation Guidelines
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Best practices and guidelines for implementing semantic section footers in your applications.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Semantic HTML">
                      <div className="space-y-4">
                        <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
                          <h4 className="font-medium text-brown-900 mb-2">Use Proper Elements</h4>
                          <ul className="text-sm text-brown-800 space-y-1">
                            <li>• Use &lt;footer&gt; for section footers</li>
                            <li>• Use &lt;nav&gt; for navigation elements</li>
                            <li>• Use &lt;section&gt; for grouped content</li>
                            <li>• Use &lt;main&gt; for primary content</li>
                          </ul>
                        </div>
                        <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
                          <h4 className="font-medium text-brown-900 mb-2">Accessibility</h4>
                          <ul className="text-sm text-brown-800 space-y-1">
                            <li>• Provide clear labels for actions</li>
                            <li>• Use proper ARIA attributes</li>
                            <li>• Ensure keyboard navigation</li>
                            <li>• Maintain logical tab order</li>
                          </ul>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Design Guidelines">
                      <div className="space-y-4">
                        <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
                          <h4 className="font-medium text-brown-900 mb-2">Visual Hierarchy</h4>
                          <ul className="text-sm text-brown-800 space-y-1">
                            <li>• Use consistent spacing patterns</li>
                            <li>• Maintain visual separation</li>
                            <li>• Group related actions together</li>
                            <li>• Use appropriate button styles</li>
                          </ul>
                        </div>
                        <div className="bg-brown-50 border border-brown-200 rounded-lg p-4">
                          <h4 className="font-medium text-brown-900 mb-2">Responsive Design</h4>
                          <ul className="text-sm text-brown-800 space-y-1">
                            <li>• Stack elements on mobile</li>
                            <li>• Prioritize important actions</li>
                            <li>• Use collapsible sections</li>
                            <li>• Ensure touch targets are large</li>
                          </ul>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Complete Footer Implementation">
                    <CodeBlock
                      code={`interface SectionFooterProps {
  children: React.ReactNode;
  className?: string;
}

const SectionFooter: React.FC<SectionFooterProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <footer className={\`bg-brown-50 border-t border-brown-200 px-6 py-4 rounded-b-xl \${className}\`}>
      {children}
    </footer>
  );
};

// Usage Examples
<Card className="border-brown-200">
  <main className="p-6">
    <section>
      <h3 className="text-lg font-semibold text-brown-900 mb-4">Content Title</h3>
      {/* Main content */}
    </section>
  </main>
  <SectionFooter>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-brown-600">
        <Info className="w-4 h-4" />
        <span>Additional information</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-100">
          Cancel
        </Button>
        <Button className="bg-brown-700 text-white hover:bg-brown-800">
          Save
        </Button>
      </div>
    </div>
  </SectionFooter>
</Card>`}
                      language="tsx"
                      id="implementation-code"
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