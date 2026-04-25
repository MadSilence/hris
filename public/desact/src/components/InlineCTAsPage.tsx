import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, ArrowRight, Plus, ChevronRight, Download, ExternalLink, Share2, BookmarkPlus, Heart, MessageCircle, Star, UserPlus, Mail, Phone, Calendar, MapPin, Zap, Target, TrendingUp, Award, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Avatar } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';

interface InlineCTAsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const InlineCTAsPage: React.FC<InlineCTAsPageProps> = ({ 
  onBack, 
  components, 
  onComponentClick, 
  currentComponent 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Task completion states for interactive examples
  const [taskStates, setTaskStates] = useState({
    task1: false,
    task2: true,
    task3: false
  });

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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'primary-actions', 'secondary-actions', 'card-actions', 'list-actions', 'social-actions', 'interactive-elements'];
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
    { id: 'overview', label: 'Overview', icon: Menu },
    { id: 'primary-actions', label: 'Primary Actions', icon: Zap },
    { id: 'secondary-actions', label: 'Secondary Actions', icon: ChevronRight },
    { id: 'card-actions', label: 'Card Actions', icon: Target },
    { id: 'list-actions', label: 'List Actions', icon: ArrowRight },
    { id: 'social-actions', label: 'Social Actions', icon: Heart },
    { id: 'interactive-elements', label: 'Interactive Elements', icon: Award },
  ];

  const PreviewCard: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ 
    children, 
    title, 
    className = "" 
  }) => (
    <Card className={`p-6 border-brown-200 ${className} relative overflow-visible`}>
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
                  <h1 className="text-xl font-semibold">Inline CTAs</h1>
                  <Badge variant="secondary" className="bg-brown-100 text-brown-700 border-brown-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Call-to-action components embedded within content and interfaces
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
                      Inline CTAs Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Call-to-action components that seamlessly integrate within content blocks, cards, and list items to 
                      encourage user engagement and drive specific actions.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Primary Actions</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>High-impact CTAs for critical user actions and main conversion goals.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Contextual Actions</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Context-aware CTAs that appear within cards, lists, and content sections.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Heart className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Social Actions</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Interactive elements for social engagement, sharing, and collaboration.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Primary Actions Section */}
              <section id="primary-actions" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Primary Action CTAs
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Prominent call-to-action buttons for main conversion goals and critical user actions.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Hero Section CTA">
                      <div className="space-y-4">
                        <div className="text-center p-8 bg-gradient-to-br from-brown-50 to-brown-100 rounded-lg">
                          <h3 className="text-xl font-semibold text-brown-900 mb-2">Transform Your HR Operations</h3>
                          <p className="text-brown-600 mb-6">Streamline employee management with our comprehensive HR platform</p>
                          <Button className="bg-brown-700 hover:bg-brown-800 px-8 py-3">
                            <Zap className="w-4 h-4 mr-2" />
                            Get Started Free
                          </Button>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Feature Highlight CTA">
                      <div className="space-y-4">
                        <div className="p-6 border-2 border-brown-200 rounded-lg">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-brown-600 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-brown-900 mb-2">Performance Analytics</h4>
                              <p className="text-sm text-brown-600 mb-4">Get insights into team performance and productivity metrics</p>
                              <Button variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-50">
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Learn More
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Download CTA">
                      <div className="space-y-4">
                        <div className="p-6 bg-brown-50 rounded-lg border border-brown-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-brown-900">Employee Handbook</h4>
                              <p className="text-sm text-brown-600 mt-1">Complete guide for new employees</p>
                            </div>
                            <Button className="bg-brown-700 hover:bg-brown-800">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Contact CTA">
                      <div className="space-y-4">
                        <div className="p-6 bg-gradient-to-r from-brown-600 to-brown-700 rounded-lg text-white">
                          <h4 className="font-semibold mb-2">Need Help?</h4>
                          <p className="text-brown-100 text-sm mb-4">Our HR specialists are here to assist you</p>
                          <div className="flex gap-2">
                            <Button className="bg-brown-800 hover:bg-brown-900 text-white border-0">
                              <Phone className="w-4 h-4 mr-2" />
                              Call Now
                            </Button>
                            <Button className="bg-brown-800 hover:bg-brown-900 text-white border-0">
                              <Mail className="w-4 h-4 mr-2" />
                              Email Us
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Primary Action CTA Component
const PrimaryActionCTA = ({ title, description, buttonText, icon: Icon, onClick }) => {
  return (
    <div className="text-center p-8 bg-gradient-to-br from-brown-50 to-brown-100 rounded-lg">
      <h3 className="text-xl font-semibold text-brown-900 mb-2">{title}</h3>
      <p className="text-brown-600 mb-6">{description}</p>
      <Button 
        className="bg-brown-700 hover:bg-brown-800 px-8 py-3"
        onClick={onClick}
      >
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {buttonText}
      </Button>
    </div>
  );
};

// Usage
<PrimaryActionCTA 
  title="Transform Your HR Operations"
  description="Streamline employee management with our comprehensive HR platform"
  buttonText="Get Started Free"
  icon={Zap}
  onClick={() => console.log('CTA clicked')}
/>`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'primary-actions')}
                      copiedId={copiedCode}
                      id="primary-actions"
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Secondary Actions Section */}
              <section id="secondary-actions" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Secondary Action CTAs
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Supporting actions and alternative options that complement primary CTAs.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Link-style Actions">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <p className="text-sm text-brown-600 mb-3">Ready to upgrade your HR processes?</p>
                          <div className="flex items-center gap-4">
                            <button className="text-brown-700 hover:text-brown-800 font-medium text-sm flex items-center">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Demo
                            </button>
                            <button className="text-brown-700 hover:text-brown-800 font-medium text-sm flex items-center">
                              <ArrowRight className="w-4 h-4 mr-1" />
                              Learn More
                            </button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Subtle Call-to-Actions">
                      <div className="space-y-4">
                        <div className="p-4 bg-brown-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-brown-900">Join our newsletter</p>
                              <p className="text-xs text-brown-600">Get HR tips and updates</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-brown-700 hover:bg-brown-100">
                              <Plus className="w-4 h-4 mr-1" />
                              Subscribe
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Informational CTAs">
                      <div className="space-y-4">
                        <div className="p-4 border-l-4 border-brown-500 bg-brown-50">
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-brown-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-brown-900 mb-1">Security Update Available</p>
                              <p className="text-xs text-brown-600 mb-2">Keep your data secure with the latest updates</p>
                              <button className="text-xs text-brown-700 hover:text-brown-800 underline">
                                Update Now →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Progress-based CTAs">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-brown-900">Profile Completion</span>
                            <span className="text-xs text-brown-600">80%</span>
                          </div>
                          <div className="w-full bg-brown-100 rounded-full h-2 mb-3">
                            <div className="bg-brown-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full border-brown-300 text-brown-700 hover:bg-brown-50">
                            Complete Profile
                          </Button>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Card Actions Section */}
              <section id="card-actions" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Card Action CTAs
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Action buttons and links embedded within card components for specific contexts.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Employee Card Actions">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="flex items-start gap-3 mb-4">
                            <Avatar className="w-12 h-12 bg-brown-100">
                              <div className="w-full h-full bg-brown-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                MJ
                              </div>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-brown-900">Michael Johnson</h4>
                              <p className="text-sm text-brown-600">Software Engineer</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-50">
                              <Mail className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 border-brown-300 text-brown-700 hover:bg-brown-50">
                              <Calendar className="w-4 h-4 mr-1" />
                              Schedule
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Resource Card Actions">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="mb-4">
                            <h4 className="font-semibold text-brown-900 mb-2">HR Policy Document</h4>
                            <p className="text-sm text-brown-600">Updated company policies and procedures for 2024</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-brown-700 hover:bg-brown-800">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                              <Button size="sm" variant="ghost" className="text-brown-700 hover:bg-brown-50">
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
                              </Button>
                            </div>
                            <Button size="sm" variant="ghost" className="text-brown-700 hover:bg-brown-50">
                              <BookmarkPlus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Notification Card Actions">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900 mb-1">Performance Review Due</p>
                              <p className="text-xs text-blue-700 mb-3">Your quarterly review is scheduled for next week</p>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                                  View Details
                                </Button>
                                <Button size="sm" variant="ghost" className="text-blue-700 hover:bg-blue-100">
                                  Dismiss
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Status Card Actions">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-brown-900">Time Off Request</h4>
                              <Badge className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-brown-600">Dec 20-22, 2024</p>
                              <p className="text-xs text-brown-500">3 days</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                              Decline
                            </Button>
                            <Button size="sm" variant="ghost" className="text-brown-700 hover:bg-brown-50">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* List Actions Section */}
              <section id="list-actions" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      List Item Actions
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Quick action buttons and controls integrated within list items and table rows.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Employee Directory List">
                      <div className="space-y-2">
                        {[
                          { name: 'Sarah Wilson', role: 'HR Manager', status: 'active' },
                          { name: 'David Chen', role: 'Developer', status: 'active' },
                          { name: 'Emma Rodriguez', role: 'Designer', status: 'inactive' }
                        ].map((employee, index) => (
                          <div key={index} className="flex items-center justify-between p-3 hover:bg-brown-50 rounded-lg border border-brown-100">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 bg-brown-100">
                                <div className="w-full h-full bg-brown-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              </Avatar>
                              <div>
                                <p className="font-medium text-brown-900">{employee.name}</p>
                                <p className="text-sm text-brown-600">{employee.role}</p>
                              </div>
                              <Badge 
                                className={`${
                                  employee.status === 'active' 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}
                              >
                                {employee.status}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="p-2 text-brown-700 hover:bg-brown-100">
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-2 text-brown-700 hover:bg-brown-100">
                                <Phone className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-2 text-brown-700 hover:bg-brown-100">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Task List with Actions">
                      <div className="space-y-2">
                        {[
                          { id: 'task1', task: 'Review quarterly reports', priority: 'high', completed: false },
                          { id: 'task2', task: 'Update employee handbook', priority: 'medium', completed: true },
                          { id: 'task3', task: 'Schedule team meeting', priority: 'low', completed: false }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 hover:bg-brown-50 rounded-lg border border-brown-100">
                            <Checkbox 
                              checked={taskStates[item.id as keyof typeof taskStates]}
                              onCheckedChange={(checked) => setTaskStates(prev => ({ ...prev, [item.id]: checked as boolean }))}
                              className="data-[state=checked]:bg-brown-600 data-[state=checked]:border-brown-600 data-[state=checked]:text-white border-brown-300 focus-visible:border-brown-500 focus-visible:ring-brown-500/30"
                            />
                            <div className="flex-1">
                              <p className={`font-medium ${taskStates[item.id as keyof typeof taskStates] ? 'line-through text-brown-500' : 'text-brown-900'}`}>
                                {item.task}
                              </p>
                              <Badge 
                                className={`mt-1 ${
                                  item.priority === 'high' 
                                    ? 'bg-red-100 text-red-800 border-red-200'
                                    : item.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                    : 'bg-blue-100 text-blue-800 border-blue-200'
                                }`}
                              >
                                {item.priority}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="p-2 text-brown-700 hover:bg-brown-100">
                                <Calendar className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-2 text-brown-700 hover:bg-brown-100">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Social Actions Section */}
              <section id="social-actions" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Social Action CTAs
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Interactive elements for social engagement, sharing, and collaborative actions.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Social Engagement">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="mb-3">
                            <p className="text-sm text-brown-900 mb-2">Great team building event today! 🎉</p>
                            <p className="text-xs text-brown-600">Posted by Sarah Wilson • 2 hours ago</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <button className="flex items-center gap-1 text-sm text-brown-700 hover:text-brown-800">
                              <Heart className="w-4 h-4" />
                              <span>12</span>
                            </button>
                            <button className="flex items-center gap-1 text-sm text-brown-700 hover:text-brown-800">
                              <MessageCircle className="w-4 h-4" />
                              <span>5</span>
                            </button>
                            <button className="flex items-center gap-1 text-sm text-brown-700 hover:text-brown-800">
                              <Share2 className="w-4 h-4" />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Rating & Reviews">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="mb-3">
                            <h4 className="font-medium text-brown-900 mb-1">HR Training Module</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-sm text-brown-600">(24 reviews)</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-50">
                              <Star className="w-4 h-4 mr-1" />
                              Rate
                            </Button>
                            <Button size="sm" variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-50">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Team Collaboration">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-brown-900">Q4 Planning Session</h4>
                              <p className="text-sm text-brown-600">5 team members invited</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-brown-700 hover:bg-brown-800">
                              <UserPlus className="w-4 h-4 mr-1" />
                              Invite Others
                            </Button>
                            <Button size="sm" variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-50">
                              <Calendar className="w-4 h-4 mr-1" />
                              Reschedule
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Follow & Connect">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="w-10 h-10 bg-brown-100">
                              <div className="w-full h-full bg-brown-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                JD
                              </div>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium text-brown-900">John Davis</h4>
                              <p className="text-sm text-brown-600">Senior HR Director</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-brown-700 hover:bg-brown-800">
                              <UserPlus className="w-4 h-4 mr-1" />
                              Connect
                            </Button>
                            <Button size="sm" variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-50">
                              <Mail className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Interactive Elements Section */}
              <section id="interactive-elements" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Interactive Elements
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Dynamic and contextual interactive elements that respond to user behavior and context.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Hover Actions">
                      <div className="space-y-4">
                        <div className="group p-4 border border-brown-200 rounded-lg hover:shadow-md transition-all duration-200">
                          <div className="mb-3">
                            <h4 className="font-medium text-brown-900">Employee Benefits Guide</h4>
                            <p className="text-sm text-brown-600">Comprehensive overview of all employee benefits</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Separator className="mb-3" />
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-brown-700 hover:bg-brown-800">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                              <Button size="sm" variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-50">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Preview
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Contextual Actions">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-brown-900">Meeting Room A</h4>
                              <Badge className="mt-1 bg-red-100 text-red-800 border-red-200">Occupied</Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-brown-600">Until 3:00 PM</p>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-brown-50 rounded-lg">
                            <p className="text-sm text-brown-600 mb-2">Room will be available in 45 minutes</p>
                            <Button size="sm" variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                              <Calendar className="w-4 h-4 mr-1" />
                              Reserve Next Slot
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Multi-step Actions">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <div className="mb-4">
                            <h4 className="font-medium text-brown-900 mb-2">Onboarding Checklist</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-full bg-brown-100 rounded-full h-2">
                                <div className="bg-brown-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                              </div>
                              <span className="text-sm text-brown-600">3/5</span>
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="line-through text-brown-500">Complete profile</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="line-through text-brown-500">Review policies</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="line-through text-brown-500">Setup workspace</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <span className="text-brown-900">Schedule mentor meeting</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-brown-300 rounded-full"></div>
                              <span className="text-brown-500">Complete training</span>
                            </div>
                          </div>
                          <Button size="sm" className="w-full bg-brown-700 hover:bg-brown-800">
                            Continue Onboarding
                          </Button>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Quick Actions Panel">
                      <div className="space-y-4">
                        <div className="p-4 border border-brown-200 rounded-lg">
                          <h4 className="font-medium text-brown-900 mb-3">Quick Actions</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-50 justify-start">
                              <Plus className="w-4 h-4 mr-2" />
                              New Employee
                            </Button>
                            <Button size="sm" variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-50 justify-start">
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Review
                            </Button>
                            <Button size="sm" variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-50 justify-start">
                              <Download className="w-4 h-4 mr-2" />
                              Export Data
                            </Button>
                            <Button size="sm" variant="outline" className="border-brown-300 text-brown-700 hover:bg-brown-50 justify-start">
                              <Mail className="w-4 h-4 mr-2" />
                              Send Notice
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Interactive CTA with Hover Effects
const InteractiveCTA = ({ title, description, onAction }) => {
  return (
    <div className="group p-4 border border-brown-200 rounded-lg hover:shadow-md transition-all duration-200">
      <div className="mb-3">
        <h4 className="font-medium text-brown-900">{title}</h4>
        <p className="text-sm text-brown-600">{description}</p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Separator className="mb-3" />
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="bg-brown-700 hover:bg-brown-800"
            onClick={onAction}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-brown-300 text-brown-700 hover:bg-brown-50"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Preview
          </Button>
        </div>
      </div>
    </div>
  );
};`}
                      language="tsx"
                      onCopy={(code) => copyToClipboard(code, 'interactive-elements')}
                      copiedId={copiedCode}
                      id="interactive-elements"
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