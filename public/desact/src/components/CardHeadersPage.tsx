import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Layout, Navigation, Settings, Code2, Eye, Mouse, Plus, Download, Bell, Home, Users, Building, Briefcase, Filter, MoreHorizontal, Edit, Mail, Share, CheckCircle, Info, Calendar, Clock, TrendingUp, BarChart3, FileBarChart, UserCheck, Shield, HelpCircle, LogOut, Globe, Bookmark, Heart, MessageSquare, Camera, Printer, Save, Archive, Trash2, AlertTriangle, Gauge, User, CreditCard, Activity, DollarSign, Target, Award, Briefcase as BriefcaseIcon, MapPin, Phone, ExternalLink, Copy, Check, AlertCircle, XCircle, Star as StarIcon, ThumbsUp, ThumbsDown, Flag, PlayCircle, PauseCircle, SkipForward, Volume2, Maximize2, ImageIcon, VideoIcon, FileIcon, FolderIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';

interface CardHeadersPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const CardHeadersPage: React.FC<CardHeadersPageProps> = ({ 
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

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

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedPosts(newLiked);
  };

  const toggleSave = (id: string) => {
    const newSaved = new Set(savedItems);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedItems(newSaved);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'basic-headers', 'user-headers', 'action-headers', 'status-headers', 'media-headers', 'interactive-headers', 'implementation'];
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
    { id: 'basic-headers', label: 'Basic Headers', icon: Layout },
    { id: 'user-headers', label: 'User Headers', icon: User },
    { id: 'action-headers', label: 'Action Headers', icon: Settings },
    { id: 'status-headers', label: 'Status Headers', icon: Activity },
    { id: 'media-headers', label: 'Media Headers', icon: ImageIcon },
    { id: 'interactive-headers', label: 'Interactive Headers', icon: MessageSquare },
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
                  <h1 className="text-xl font-semibold">Card Headers</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Header patterns for cards with semantic structure and interactive elements
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
                      Card Headers Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Card headers provide structure and context for card content using semantic HTML elements. 
                      These examples demonstrate proper use of header, section, main, and other semantic elements within cards.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Semantic Structure</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Using proper HTML5 semantic elements within card structures for better accessibility.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Interactive Elements</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Headers with buttons, dropdowns, and other interactive components.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">User Context</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Headers that display user information, avatars, and profile data.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Basic Headers Section */}
              <section id="basic-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Basic Card Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Simple card headers with proper semantic structure and basic information.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Simple Title Header">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <h3 className="text-lg font-semibold text-brown-900">Employee Report</h3>
                          <p className="text-sm text-brown-600 mt-1">Monthly performance summary</p>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">Report content goes here...</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Header with Badge">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-brown-900">Project Status</h3>
                              <p className="text-sm text-brown-600 mt-1">Development phase</p>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              Active
                            </Badge>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">Project details and timeline...</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Header with Timestamp">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-brown-900">Meeting Notes</h3>
                            <div className="flex items-center gap-2 text-sm text-brown-600">
                              <Clock className="h-4 w-4" />
                              <time dateTime="2024-01-15">Jan 15, 2024</time>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">Meeting summary and action items...</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Header with Category">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <BriefcaseIcon className="h-4 w-4 text-brown-600" />
                              <span className="text-xs font-medium text-brown-600 uppercase tracking-wide">HR Document</span>
                            </div>
                            <h3 className="text-lg font-semibold text-brown-900">Employee Handbook</h3>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">Company policies and procedures...</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<Card className="border-brown-200">
  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
    <h3 className="text-lg font-semibold text-brown-900">Employee Report</h3>
    <p className="text-sm text-brown-600 mt-1">Monthly performance summary</p>
  </header>
  <main className="p-6">
    <section>
      <p className="text-sm text-brown-600">Report content goes here...</p>
    </section>
  </main>
</Card>`}
                      language="tsx"
                      id="basic-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* User Headers Section */}
              <section id="user-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      User Profile Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers designed for user profiles, employee cards, and personal information display.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Employee Profile Header">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12 bg-brown-200">
                              <AvatarFallback className="bg-brown-200 text-brown-800 font-semibold">
                                JD
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-brown-900">John Doe</h3>
                              <p className="text-sm text-brown-600">Senior Software Engineer</p>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPin className="h-3 w-3 text-brown-500" />
                                <span className="text-xs text-brown-500">San Francisco, CA</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                              <Mail className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">Employee details and performance metrics...</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Team Member Card">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 bg-brown-200">
                                <AvatarFallback className="bg-brown-200 text-brown-800">
                                  SM
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-brown-900">Sarah Miller</h3>
                                <p className="text-sm text-brown-600">Product Manager</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-brown-600">Online</span>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-brown-600">Department:</span>
                              <span className="text-brown-900">Product</span>
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Contact Card Header">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 bg-brown-200">
                                <AvatarFallback className="bg-brown-200 text-brown-800">
                                  AR
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-brown-900">Alice Rodriguez</h3>
                                <p className="text-sm text-brown-600">HR Director</p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-brown-600 hover:bg-brown-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-brown-500" />
                                <span className="text-brown-600">alice.rodriguez@company.com</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-brown-500" />
                                <span className="text-brown-600">+1 (555) 123-4567</span>
                              </div>
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Performance Card">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 bg-brown-200">
                                <AvatarFallback className="bg-brown-200 text-brown-800">
                                  MT
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-brown-900">Mike Thompson</h3>
                                <p className="text-sm text-brown-600">Sales Representative</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-brown-700">94%</div>
                              <div className="text-xs text-brown-500">Goal Achievement</div>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-brown-600">Progress</span>
                                <span className="text-brown-900">94/100</span>
                              </div>
                              <Progress value={94} className="h-2" />
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<Card className="border-brown-200">
  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
    <div className="flex items-center gap-4">
      <Avatar className="h-12 w-12 bg-brown-200">
        <AvatarFallback className="bg-brown-200 text-brown-800 font-semibold">
          JD
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-brown-900">John Doe</h3>
        <p className="text-sm text-brown-600">Senior Software Engineer</p>
        <div className="flex items-center gap-2 mt-1">
          <MapPin className="h-3 w-3 text-brown-500" />
          <span className="text-xs text-brown-500">San Francisco, CA</span>
        </div>
      </div>
      <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
        <Mail className="h-4 w-4 mr-2" />
        Contact
      </Button>
    </div>
  </header>
  <main className="p-6">
    <section>
      <p className="text-sm text-brown-600">Employee details and performance metrics...</p>
    </section>
  </main>
</Card>`}
                      language="tsx"
                      id="user-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Action Headers Section */}
              <section id="action-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Action Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers with prominent action buttons, controls, and interactive elements.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Task Card Header">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-3 w-3 rounded-full ${taskCompleted ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                              <div>
                                <h3 className="font-semibold text-brown-900">Complete Onboarding</h3>
                                <p className="text-sm text-brown-600">Due: Today</p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => setTaskCompleted(!taskCompleted)}
                              className={taskCompleted ? "bg-green-600 hover:bg-green-700 text-white" : "bg-brown-600 hover:bg-brown-700 text-white"}
                            >
                              {taskCompleted ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Done
                                </>
                              )}
                            </Button>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">Complete all required onboarding tasks and documentation...</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Document Header">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileIcon className="h-5 w-5 text-brown-600" />
                              <div>
                                <h3 className="font-semibold text-brown-900">Q4 Report.pdf</h3>
                                <p className="text-sm text-brown-600">2.4 MB • Modified 2 hours ago</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">Quarterly financial report and analysis...</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Settings Card">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-brown-900">Notifications</h3>
                              <p className="text-sm text-brown-600">Manage your notification preferences</p>
                            </div>
                            <Switch 
                              checked={notificationsEnabled}
                              onCheckedChange={setNotificationsEnabled}
                            />
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">
                              {notificationsEnabled ? 'Notifications are enabled' : 'Notifications are disabled'}
                            </p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Approval Header">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-brown-900">Leave Request</h3>
                              <p className="text-sm text-brown-600">Pending approval • Submitted Jan 15</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">Annual leave request for vacation...</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<Card className="border-brown-200">
  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-orange-500"></div>
        <div>
          <h3 className="font-semibold text-brown-900">Complete Onboarding</h3>
          <p className="text-sm text-brown-600">Due: Today</p>
        </div>
      </div>
      <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
        <CheckCircle className="h-4 w-4 mr-2" />
        Mark Done
      </Button>
    </div>
  </header>
  <main className="p-6">
    <section>
      <p className="text-sm text-brown-600">Complete all required onboarding tasks...</p>
    </section>
  </main>
</Card>`}
                      language="tsx"
                      id="action-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Status Headers Section */}
              <section id="status-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Status Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers that display status information, progress indicators, and state changes.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Project Status">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-brown-900">Website Redesign</h3>
                              <p className="text-sm text-brown-600">Phase 2 of 4</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <select 
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="text-sm border border-brown-300 rounded px-2 py-1 bg-white text-brown-700"
                              >
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-brown-600">Progress</span>
                              <span className="text-brown-900">65%</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">Status: {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Health Status">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-brown-900">System Health</h3>
                              <p className="text-sm text-brown-600">All systems operational</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-green-700 font-medium">Healthy</span>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-brown-600">Uptime</span>
                                <span className="text-brown-900">99.9%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-brown-600">Response Time</span>
                                <span className="text-brown-900">142ms</span>
                              </div>
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Alert Status">
                      <Card className="border-brown-200">
                        <header className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <div>
                              <h3 className="font-semibold text-red-900">Security Alert</h3>
                              <p className="text-sm text-red-700">Suspicious login detected</p>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">Multiple failed login attempts from unusual location...</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Success Status">
                      <Card className="border-brown-200">
                        <header className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <h3 className="font-semibold text-green-900">Backup Completed</h3>
                              <p className="text-sm text-green-700">Daily backup successful</p>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-600">All data has been successfully backed up...</p>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<Card className="border-brown-200">
  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-brown-900">Website Redesign</h3>
        <p className="text-sm text-brown-600">Phase 2 of 4</p>
      </div>
      <div className="flex items-center gap-2">
        <select className="text-sm border border-brown-300 rounded px-2 py-1 bg-white text-brown-700">
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
    <div className="mt-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-brown-600">Progress</span>
        <span className="text-brown-900">65%</span>
      </div>
      <Progress value={65} className="h-2" />
    </div>
  </header>
  <main className="p-6">
    <section>
      <p className="text-sm text-brown-600">Project details and milestones...</p>
    </section>
  </main>
</Card>`}
                      language="tsx"
                      id="status-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Media Headers Section */}
              <section id="media-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Media Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers for media content including videos, images, and multimedia presentations.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Video Player Header">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <VideoIcon className="h-5 w-5 text-brown-600" />
                              <div>
                                <h3 className="font-semibold text-brown-900">Training Video</h3>
                                <p className="text-sm text-brown-600">New Employee Orientation</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                                className="border-brown-300 text-brown-700 hover:bg-brown-100"
                              >
                                {isVideoPlaying ? (
                                  <>
                                    <PauseCircle className="h-4 w-4 mr-2" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Play
                                  </>
                                )}
                              </Button>
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                              {isVideoPlaying ? (
                                <div className="text-brown-600">Video playing...</div>
                              ) : (
                                <div className="text-brown-600">Video paused</div>
                              )}
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Image Gallery Header">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ImageIcon className="h-5 w-5 text-brown-600" />
                              <div>
                                <h3 className="font-semibold text-brown-900">Company Event Photos</h3>
                                <p className="text-sm text-brown-600">24 photos • Updated today</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Download className="h-4 w-4 mr-2" />
                                Download All
                              </Button>
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Share className="h-4 w-4 mr-2" />
                                Share Album
                              </Button>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="grid grid-cols-3 gap-2">
                              {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-gray-100 rounded aspect-square"></div>
                              ))}
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Audio Player Header">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Volume2 className="h-5 w-5 text-brown-600" />
                              <div>
                                <h3 className="font-semibold text-brown-900">Podcast Episode</h3>
                                <p className="text-sm text-brown-600">Leadership in Remote Work</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <SkipForward className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-brown-600">Duration</span>
                                <span className="text-brown-900">45:32</span>
                              </div>
                              <Progress value={35} className="h-1" />
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Document Viewer">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileIcon className="h-5 w-5 text-brown-600" />
                              <div>
                                <h3 className="font-semibold text-brown-900">Policy Document</h3>
                                <p className="text-sm text-brown-600">12 pages • PDF format</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                              </Button>
                              <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center">
                              <div className="text-brown-600">Document preview...</div>
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<Card className="border-brown-200">
  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <VideoIcon className="h-5 w-5 text-brown-600" />
        <div>
          <h3 className="font-semibold text-brown-900">Training Video</h3>
          <p className="text-sm text-brown-600">New Employee Orientation</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
          <PlayCircle className="h-4 w-4 mr-2" />
          Play
        </Button>
        <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </header>
  <main className="p-6">
    <section>
      <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
        <div className="text-brown-600">Video content...</div>
      </div>
    </section>
  </main>
</Card>`}
                      language="tsx"
                      id="media-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Interactive Headers Section */}
              <section id="interactive-headers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Interactive Headers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Headers with interactive elements like likes, saves, comments, and social features.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Social Post Header">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 bg-brown-200">
                                <AvatarFallback className="bg-brown-200 text-brown-800">
                                  HT
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-brown-900">HR Team</h3>
                                <p className="text-sm text-brown-600">2 hours ago</p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleSave('post1')}
                              className={`border-brown-300 hover:bg-brown-100 ${
                                savedItems.has('post1') ? 'text-brown-700 bg-brown-50' : 'text-brown-600'
                              }`}
                            >
                              <Bookmark className={`h-4 w-4 ${savedItems.has('post1') ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <p className="text-sm text-brown-900 mb-4">
                              Excited to announce our new employee wellness program! 🎉
                            </p>
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleLike('post1')}
                                className={`p-2 ${
                                  likedPosts.has('post1') ? 'text-red-600' : 'text-brown-600 hover:text-red-600'
                                }`}
                              >
                                <Heart className={`h-4 w-4 ${likedPosts.has('post1') ? 'fill-current' : ''}`} />
                                <span className="ml-1">{likedPosts.has('post1') ? '13' : '12'}</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="p-2 text-brown-600 hover:text-brown-800">
                                <MessageSquare className="h-4 w-4" />
                                <span className="ml-1">5</span>
                              </Button>
                              <Button variant="ghost" size="sm" className="p-2 text-brown-600 hover:text-brown-800">
                                <Share className="h-4 w-4" />
                                <span className="ml-1">Share</span>
                              </Button>
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Feedback Card">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-brown-900">Training Feedback</h3>
                              <p className="text-sm text-brown-600">Rate your experience</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon 
                                  key={star} 
                                  className="h-4 w-4 text-yellow-400 fill-current cursor-pointer hover:scale-110 transition-transform" 
                                />
                              ))}
                            </div>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="flex items-center gap-4">
                              <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50">
                                <ThumbsUp className="h-4 w-4 mr-2" />
                                Helpful
                              </Button>
                              <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                                <ThumbsDown className="h-4 w-4 mr-2" />
                                Not Helpful
                              </Button>
                              <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                                <Flag className="h-4 w-4 mr-2" />
                                Report
                              </Button>
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Comment Thread">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <MessageSquare className="h-5 w-5 text-brown-600" />
                              <div>
                                <h3 className="font-semibold text-brown-900">Discussion</h3>
                                <p className="text-sm text-brown-600">3 comments • Active conversation</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Comment
                            </Button>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-6 w-6 bg-brown-200">
                                  <AvatarFallback className="bg-brown-200 text-brown-800 text-xs">
                                    JD
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-sm">
                                  <span className="font-medium text-brown-900">John:</span>
                                  <span className="text-brown-600 ml-1">Great initiative!</span>
                                </div>
                              </div>
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>

                    <PreviewCard title="Poll Card">
                      <Card className="border-brown-200">
                        <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-brown-900">Team Poll</h3>
                              <p className="text-sm text-brown-600">What's your preferred meeting time?</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              12 votes
                            </Badge>
                          </div>
                        </header>
                        <main className="p-6">
                          <section>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-brown-900">Morning (9-11 AM)</span>
                                <span className="text-sm text-brown-600">67%</span>
                              </div>
                              <Progress value={67} className="h-2" />
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-brown-900">Afternoon (1-3 PM)</span>
                                <span className="text-sm text-brown-600">33%</span>
                              </div>
                              <Progress value={33} className="h-2" />
                            </div>
                          </section>
                        </main>
                      </Card>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`<Card className="border-brown-200">
  <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-brown-200">
          <AvatarFallback className="bg-brown-200 text-brown-800">
            HT
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-brown-900">HR Team</h3>
          <p className="text-sm text-brown-600">2 hours ago</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="border-brown-300 text-brown-600 hover:bg-brown-100">
        <Bookmark className="h-4 w-4" />
      </Button>
    </div>
  </header>
  <main className="p-6">
    <section>
      <p className="text-sm text-brown-900 mb-4">
        Excited to announce our new employee wellness program! 🎉
      </p>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="p-2 text-brown-600 hover:text-red-600">
          <Heart className="h-4 w-4" />
          <span className="ml-1">12</span>
        </Button>
        <Button variant="ghost" size="sm" className="p-2 text-brown-600 hover:text-brown-800">
          <MessageSquare className="h-4 w-4" />
          <span className="ml-1">5</span>
        </Button>
      </div>
    </section>
  </main>
</Card>`}
                      language="tsx"
                      id="interactive-headers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
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
                      Best practices for implementing semantic card headers with proper structure and accessibility.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-1 gap-6">
                    <PreviewCard title="Semantic Structure">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Use Header Element</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Always wrap card headers in header elements for proper semantics
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Main Content Area</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Use main element for the primary content of the card
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Section Elements</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Use section elements to group related content within cards
                            </p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Accessibility Notes">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">ARIA Labels</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Add aria-label for interactive elements in headers
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Keyboard Navigation</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Ensure all buttons and controls are keyboard accessible
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Screen Readers</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Provide descriptive text for icons and visual elements
                            </p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Basic Template">
                    <CodeBlock
                      code={`import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { MoreHorizontal, Edit, Share } from 'lucide-react';

function EmployeeCard() {
  return (
    <Card className="border-brown-200">
      <header className="bg-brown-50 border-b border-brown-200 px-6 py-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-brown-200">
              <AvatarFallback className="bg-brown-200 text-brown-800">
                JD
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-brown-900">John Doe</h3>
              <p className="text-sm text-brown-600">Software Engineer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="border-brown-300 text-brown-700 hover:bg-brown-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        <section aria-labelledby="employee-details">
          <h4 id="employee-details" className="sr-only">Employee Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-brown-600">Department:</span>
              <span className="text-brown-900">Engineering</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brown-600">Start Date:</span>
              <span className="text-brown-900">Jan 15, 2023</span>
            </div>
          </div>
        </section>
      </main>
    </Card>
  );
}`}
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