import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, Check, Mouse, Menu, Square, AlignLeft, CheckSquare, Layout, CreditCard, Grid3X3, Settings, List, PieChart, Hash, AlertTriangle, Award, Upload, Gauge, ArrowUpDown, Palette as PaletteIcon, Command, Edit, Activity, Package, ArrowRight, Navigation, PanelLeftOpen, Calendar, Megaphone, Timer, Shield, CheckCircle, XCircle, AlertCircle, Info, Code2, Eye, Paintbrush, Type, Plus, Download, Mail, Phone, Bold, Italic, Underline, MoreHorizontal, Play, Heart, User, TrendingUp, ToggleLeft, ToggleRight, Sliders, Bookmark, Share, Link, Printer, Save, Trash2, Maximize, Minimize, Volume2, VolumeX, Star as StarIcon, Clock, Calendar as CalendarIcon, Filter, SortAsc, SortDesc, Minus, Layers, Zap, Star, FileText, Loader2, Frown, Users, Clock as LoaderIcon, RotateCw, Search, Inbox, Database, CloudOff, WifiOff, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Skeleton } from './ui/skeleton';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';

interface MiscellaneousPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const MiscellaneousPage: React.FC<MiscellaneousPageProps> = ({ 
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
  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState([50]);
  const [toggleValue, setToggleValue] = useState('');
  const [interactiveRating, setInteractiveRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [activeTab, setActiveTab] = useState('account');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [favorited, setFavorited] = useState<Set<string>>(new Set());

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
    onFocus: () => {
      console.log('Sidebar search focused');
    },
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

  const toggleBookmark = (id: string) => {
    const newBookmarked = new Set(bookmarked);
    if (newBookmarked.has(id)) {
      newBookmarked.delete(id);
    } else {
      newBookmarked.add(id);
    }
    setBookmarked(newBookmarked);
  };

  const toggleFavorite = (id: string) => {
    const newFavorited = new Set(favorited);
    if (newFavorited.has(id)) {
      newFavorited.delete(id);
    } else {
      newFavorited.add(id);
    }
    setFavorited(newFavorited);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'content-dividers', 'loading-indicators', 'empty-states', 'switches', 'sliders', 'toggles', 'separators', 'tabs', 'bookmarks', 'actions', 'progress', 'tooltips', 'ratings', 'implementation'];
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
    { id: 'content-dividers', label: 'Content Dividers', icon: Minus },
    { id: 'loading-indicators', label: 'Loading Indicators', icon: LoaderIcon },
    { id: 'empty-states', label: 'Empty States', icon: Inbox },
    { id: 'switches', label: 'Switches', icon: ToggleLeft },
    { id: 'sliders', label: 'Sliders', icon: Sliders },
    { id: 'toggles', label: 'Toggle Groups', icon: ToggleRight },
    { id: 'separators', label: 'Separators', icon: Minus },
    { id: 'tabs', label: 'Tabs', icon: Layers },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'actions', label: 'Action Icons', icon: Share },
    { id: 'progress', label: 'Progress', icon: Activity },
    { id: 'tooltips', label: 'Tooltips', icon: Info },
    { id: 'ratings', label: 'Ratings', icon: StarIcon },
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
                  <h1 className="text-xl font-semibold">Miscellaneous</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Utility components including content dividers, loading indicators, empty states, and interactive controls
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
                      Miscellaneous Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      A comprehensive collection of utility components including content dividers, loading indicators, 
                      empty states, and various interactive elements to enhance user interfaces.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Minus className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Content Dividers</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Visual elements to separate and organize content sections.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <LoaderIcon className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Loading Indicators</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Spinners, progress bars, and skeleton loaders for async content.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <Inbox className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Empty States</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Placeholders and messages for empty or error states.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-brown-100 rounded-lg flex items-center justify-center mb-4">
                        <Settings className="w-6 h-6 text-brown-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Utility Controls</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Switches, sliders, toggles, and other interactive controls.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Content Dividers Section */}
              <section id="content-dividers" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Content Dividers
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Visual elements to separate and organize different sections of content for better readability and structure.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Basic Divider">
                      <div className="space-y-4">
                        <p className="text-sm">Content above divider</p>
                        <Separator />
                        <p className="text-sm">Content below divider</p>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Divider with Text">
                      <div className="space-y-4">
                        <p className="text-sm">Section 1</p>
                        <div className="relative">
                          <Separator />
                          <div className="absolute inset-0 flex justify-center">
                            <span className="bg-white px-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>OR</span>
                          </div>
                        </div>
                        <p className="text-sm">Section 2</p>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Dotted Divider">
                      <div className="space-y-4">
                        <p className="text-sm">First section</p>
                        <div className="border-t border-dotted border-brown-300"></div>
                        <p className="text-sm">Second section</p>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Gradient Divider">
                      <div className="space-y-4">
                        <p className="text-sm">Above gradient</p>
                        <div className="h-px bg-gradient-to-r from-transparent via-brown-300 to-transparent"></div>
                        <p className="text-sm">Below gradient</p>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Separator } from './components/ui/separator';

// Basic divider
<div>
  <p>Content above</p>
  <Separator />
  <p>Content below</p>
</div>

// Divider with text
<div className="relative">
  <Separator />
  <div className="absolute inset-0 flex justify-center">
    <span className="bg-white px-2 text-xs text-muted-foreground">OR</span>
  </div>
</div>

// Custom dividers
<div className="border-t border-dotted border-gray-300"></div>
<div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>`}
                      language="tsx"
                      id="content-dividers-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Loading Indicators Section */}
              <section id="loading-indicators" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Loading Indicators
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Various loading states and progress indicators to keep users informed during async operations.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Spinner">
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-brown-600" />
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Skeleton Loading">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Progress Bar">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Loading...</span>
                          <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>75%</span>
                        </div>
                        <Progress value={75} className="w-full" />
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Pulse Loading">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-brown-200 rounded-full animate-pulse"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-brown-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-brown-200 rounded w-2/3 animate-pulse"></div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Button Loading">
                      <Button disabled className="w-full">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </Button>
                    </PreviewCard>

                    <PreviewCard title="Dots Loading">
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-brown-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-brown-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-brown-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Loader2 } from 'lucide-react';
import { Skeleton } from './components/ui/skeleton';
import { Progress } from './components/ui/progress';
import { Button } from './components/ui/button';

// Spinner
<Loader2 className="h-8 w-8 animate-spin text-primary" />

// Skeleton loading
<div className="space-y-3">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-4/5" />
  <Skeleton className="h-4 w-3/5" />
</div>

// Progress bar
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">Loading...</span>
    <span className="text-sm text-muted-foreground">75%</span>
  </div>
  <Progress value={75} className="w-full" />
</div>

// Button loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>

// Dots animation
<div className="flex items-center justify-center space-x-1">
  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
</div>`}
                      language="tsx"
                      id="loading-indicators-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Empty States Section */}
              <section id="empty-states" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Empty States
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Helpful placeholders and messages for empty content areas, error states, and no-data scenarios.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="No Data">
                      <div className="text-center p-8">
                        <motion.div
                          animate={{ 
                            y: [0, -8, 0],
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="inline-block"
                        >
                          <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        </motion.div>
                        <h3 className="font-semibold mb-2">No items found</h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                          There are no items to display yet.
                        </p>
                        <Button size="sm">Add Item</Button>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Search Results">
                      <div className="text-center p-8">
                        <motion.div
                          animate={{ 
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="inline-block"
                        >
                          <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        </motion.div>
                        <h3 className="font-semibold mb-2">No results found</h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                          Try adjusting your search terms or filters.
                        </p>
                        <Button variant="outline" size="sm">Clear Search</Button>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Network Error">
                      <div className="text-center p-8">
                        <motion.div
                          animate={{ 
                            x: [-2, 2, -2, 2, 0],
                            opacity: [0.6, 1, 0.6, 1, 0.8]
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut"
                          }}
                          className="inline-block"
                        >
                          <WifiOff className="h-12 w-12 mx-auto mb-4 text-red-400" />
                        </motion.div>
                        <h3 className="font-semibold mb-2">Connection lost</h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                          Please check your internet connection and try again.
                        </p>
                        <Button variant="outline" size="sm">
                          <RotateCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Coming Soon">
                      <div className="text-center p-8">
                        <motion.div
                          animate={{ 
                            rotate: [0, 12, 0, -12, 0]
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="inline-block"
                        >
                          <Clock className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                        </motion.div>
                        <h3 className="font-semibold mb-2">Coming Soon</h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>
                          This feature is currently in development.
                        </p>
                        <Button variant="ghost" size="sm">Learn More</Button>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Inbox, Search, WifiOff, Clock, RotateCw } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';

// Empty data state with floating animation
<div className="text-center p-8">
  <motion.div
    animate={{ y: [0, -8, 0] }}
    transition={{ 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="inline-block"
  >
    <Inbox className="h-12 w-12 mx-auto mb-4 text-gray-400" />
  </motion.div>
  <h3 className="font-semibold mb-2">No items found</h3>
  <p className="text-sm mb-4 text-muted-foreground">
    There are no items to display yet.
  </p>
  <Button size="sm">Add Item</Button>
</div>

// Search empty state with search animation
<div className="text-center p-8">
  <motion.div
    animate={{ 
      rotate: [0, 15, -15, 0],
      scale: [1, 1.05, 1]
    }}
    transition={{ 
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="inline-block"
  >
    <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
  </motion.div>
  <h3 className="font-semibold mb-2">No results found</h3>
  <p className="text-sm mb-4 text-muted-foreground">
    Try adjusting your search terms or filters.
  </p>
  <Button variant="outline" size="sm">Clear Search</Button>
</div>

// Error state with shake animation
<div className="text-center p-8">
  <motion.div
    animate={{ 
      x: [-2, 2, -2, 2, 0],
      opacity: [0.6, 1, 0.6, 1, 0.8]
    }}
    transition={{ 
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 2,
      ease: "easeInOut"
    }}
    className="inline-block"
  >
    <WifiOff className="h-12 w-12 mx-auto mb-4 text-red-400" />
  </motion.div>
  <h3 className="font-semibold mb-2">Connection lost</h3>
  <p className="text-sm mb-4 text-muted-foreground">
    Please check your internet connection and try again.
  </p>
  <Button variant="outline" size="sm">
    <RotateCw className="h-4 w-4 mr-2" />
    Retry
  </Button>
</div>

// Coming soon with ticking clock animation
<div className="text-center p-8">
  <motion.div
    animate={{ rotate: [0, 12, 0, -12, 0] }}
    transition={{ 
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="inline-block"
  >
    <Clock className="h-12 w-12 mx-auto mb-4 text-blue-400" />
  </motion.div>
  <h3 className="font-semibold mb-2">Coming Soon</h3>
  <p className="text-sm mb-4 text-muted-foreground">
    This feature is currently in development.
  </p>
  <Button variant="ghost" size="sm">Learn More</Button>
</div>`}
                      language="tsx"
                      id="empty-states-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Switches Section */}
              <section id="switches" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Switches
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Toggle switches for binary settings and preferences.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Basic Switch">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="basic-switch" 
                          checked={switchValue}
                          onCheckedChange={setSwitchValue}
                        />
                        <label htmlFor="basic-switch" className="text-sm font-medium cursor-pointer">
                          Enable notifications
                        </label>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Switch with Description">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch id="desc-switch" />
                          <label htmlFor="desc-switch" className="text-sm font-medium cursor-pointer">
                            Auto-save drafts
                          </label>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          Automatically save your work every 30 seconds
                        </p>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Switch } from './components/ui/switch';

// Basic switch
<Switch 
  id="notifications" 
  checked={isEnabled}
  onCheckedChange={setIsEnabled}
/>

// Switch with label
<div className="flex items-center space-x-2">
  <Switch id="auto-save" />
  <label htmlFor="auto-save" className="text-sm font-medium cursor-pointer">
    Auto-save drafts
  </label>
</div>`}
                      language="tsx"
                      id="switches-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Sliders Section */}
              <section id="sliders" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Sliders
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Range sliders for selecting values within a specific range.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Basic Slider">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Volume</label>
                          <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{sliderValue[0]}%</span>
                        </div>
                        <Slider
                          value={sliderValue}
                          onValueChange={setSliderValue}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Range Slider">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Price Range</label>
                          <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>$25 - $75</span>
                        </div>
                        <Slider
                          defaultValue={[25, 75]}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Slider } from './components/ui/slider';

// Basic slider
<Slider
  value={value}
  onValueChange={setValue}
  max={100}
  step={1}
  className="w-full"
/>

// Range slider
<Slider
  defaultValue={[25, 75]}
  max={100}
  step={1}
  className="w-full"
/>`}
                      language="tsx"
                      id="sliders-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Toggle Groups Section */}
              <section id="toggles" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Toggle Groups
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Groups of toggle buttons for selecting options or modes.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Text Formatting">
                      <ToggleGroup type="multiple" value={toggleValue} onValueChange={setToggleValue}>
                        <ToggleGroupItem value="bold" aria-label="Bold">
                          <Bold className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="italic" aria-label="Italic">
                          <Italic className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="underline" aria-label="Underline">
                          <Underline className="h-4 w-4" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </PreviewCard>

                    <PreviewCard title="View Options">
                      <ToggleGroup type="single" defaultValue="grid">
                        <ToggleGroupItem value="list" aria-label="List view">
                          <List className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="grid" aria-label="Grid view">
                          <Grid3X3 className="h-4 w-4" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';

// Multiple selection
<ToggleGroup type="multiple" value={selectedOptions} onValueChange={setSelectedOptions}>
  <ToggleGroupItem value="bold" aria-label="Bold">
    <Bold className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="italic" aria-label="Italic">
    <Italic className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>

// Single selection
<ToggleGroup type="single" defaultValue="grid">
  <ToggleGroupItem value="list" aria-label="List view">
    <List className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="grid" aria-label="Grid view">
    <Grid3X3 className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>`}
                      language="tsx"
                      id="toggles-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Separators Section */}
              <section id="separators" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Separators
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Visual separators to divide content sections.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Horizontal Separators">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm mb-2">Section 1</p>
                          <Separator />
                          <p className="text-sm mt-2">Section 2</p>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Vertical Separators">
                      <div className="flex items-center space-x-4 h-16">
                        <p className="text-sm">Left content</p>
                        <Separator orientation="vertical" className="h-8" />
                        <p className="text-sm">Center content</p>
                        <Separator orientation="vertical" className="h-8" />
                        <p className="text-sm">Right content</p>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Separator } from './components/ui/separator';

// Horizontal separator
<div>
  <p>Section 1</p>
  <Separator />
  <p>Section 2</p>
</div>

// Vertical separator
<div className="flex items-center space-x-4">
  <p>Left content</p>
  <Separator orientation="vertical" className="h-8" />
  <p>Right content</p>
</div>`}
                      language="tsx"
                      id="separators-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Tabs Section */}
              <section id="tabs" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Tabs
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Tabbed navigation for organizing content into sections.
                    </p>
                  </div>

                  <PreviewCard title="Interactive Tabs">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                      </TabsList>
                      <TabsContent value="account" className="mt-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input placeholder="Enter your name" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input placeholder="Enter your email" />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="password" className="mt-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Current Password</label>
                            <Input type="password" placeholder="Enter current password" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input type="password" placeholder="Enter new password" />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </PreviewCard>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

<Tabs defaultValue="account" className="w-full">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input placeholder="Enter your name" />
      </div>
    </div>
  </TabsContent>
  <TabsContent value="password">
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Current Password</label>
        <Input type="password" placeholder="Enter current password" />
      </div>
    </div>
  </TabsContent>
</Tabs>`}
                      language="tsx"
                      id="tabs-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Bookmarks Section */}
              <section id="bookmarks" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Bookmarks
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Interactive bookmark buttons for saving and organizing content.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard title="Interactive Bookmark">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleBookmark('article1')}
                      >
                        <Bookmark className={`h-4 w-4 mr-2 ${bookmarked.has('article1') ? 'fill-current' : ''}`} />
                        {bookmarked.has('article1') ? 'Bookmarked' : 'Bookmark'}
                      </Button>
                    </PreviewCard>

                    <PreviewCard title="Interactive Favorite">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleFavorite('item1')}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${favorited.has('item1') ? 'fill-current text-red-500' : ''}`} />
                        {favorited.has('item1') ? 'Favorited' : 'Favorite'}
                      </Button>
                    </PreviewCard>

                    <PreviewCard title="Star Rating">
                      <Button variant="outline" size="sm">
                        <StarIcon className="h-4 w-4 mr-2 fill-current text-yellow-500" />
                        Starred
                      </Button>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Button } from './components/ui/button';
import { Bookmark, Heart, Star } from 'lucide-react';

// Interactive bookmark
const [bookmarked, setBookmarked] = useState(false);

<Button 
  variant="outline" 
  size="sm"
  onClick={() => setBookmarked(!bookmarked)}
>
  <Bookmark className={\`h-4 w-4 mr-2 \${bookmarked ? 'fill-current' : ''}\`} />
  {bookmarked ? 'Bookmarked' : 'Bookmark'}
</Button>

// Interactive favorite
const [favorited, setFavorited] = useState(false);

<Button 
  variant="outline" 
  size="sm"
  onClick={() => setFavorited(!favorited)}
>
  <Heart className={\`h-4 w-4 mr-2 \${favorited ? 'fill-current text-red-500' : ''}\`} />
  {favorited ? 'Favorited' : 'Favorite'}
</Button>`}
                      language="tsx"
                      id="bookmarks-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Action Icons Section */}
              <section id="actions" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Action Icons
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Common action buttons with icons for various operations.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-4 gap-6">
                    <PreviewCard title="Share">
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </PreviewCard>

                    <PreviewCard title="Print">
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </PreviewCard>

                    <PreviewCard title="Save">
                      <Button variant="outline" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </PreviewCard>

                    <PreviewCard title="Delete">
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Button } from './components/ui/button';
import { Share, Printer, Save, Trash2 } from 'lucide-react';

// Action buttons
<Button variant="outline" size="sm">
  <Share className="h-4 w-4 mr-2" />
  Share
</Button>

<Button variant="outline" size="sm">
  <Save className="h-4 w-4 mr-2" />
  Save
</Button>

<Button variant="destructive" size="sm">
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</Button>`}
                      language="tsx"
                      id="actions-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Progress Section */}
              <section id="progress" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Progress Indicators
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Progress bars and indicators to show completion status.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Basic Progress">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Upload Progress</label>
                          <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>65%</span>
                        </div>
                        <Progress value={65} className="w-full" />
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Complete State">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Installation</label>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <Progress value={100} className="w-full" />
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Progress } from './components/ui/progress';
import { CheckCircle } from 'lucide-react';

// Basic progress bar
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium">Upload Progress</label>
    <span className="text-sm text-muted-foreground">65%</span>
  </div>
  <Progress value={65} className="w-full" />
</div>

// Progress with status icon
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <label className="text-sm font-medium">Installation</label>
    <CheckCircle className="h-4 w-4 text-green-600" />
  </div>
  <Progress value={100} className="w-full" />
</div>`}
                      language="tsx"
                      id="progress-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Tooltips Section */}
              <section id="tooltips" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Tooltips
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Contextual information displayed on hover or focus.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Basic Tooltip">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline">Hover me</Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This is a tooltip</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </PreviewCard>

                    <PreviewCard title="Icon with Tooltip">
                      <TooltipProvider>
                        <div className="flex gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="px-3">
                                <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>More information</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="px-3">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Open settings</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { Button } from './components/ui/button';
import { Info } from 'lucide-react';

// Basic tooltip
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="outline">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>This is a tooltip</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

// Icon with tooltip
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="sm" className="px-3">
        <Info className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>More information</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`}
                      language="tsx"
                      id="tooltips-code"
                      copiedCode={copiedCode}
                      onCopy={copyToClipboard}
                    />
                  </PreviewCard>
                </div>
              </section>

              {/* Ratings Section */}
              <section id="ratings" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Ratings
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Interactive star ratings and feedback components.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Star Rating">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon 
                            key={star} 
                            className={`h-5 w-5 ${star <= 4 ? 'fill-current text-yellow-500' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="ml-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>4.0 out of 5</span>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Interactive Rating">
                      <div className="space-y-2">
                        <div 
                          className="flex items-center gap-1"
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          {[1, 2, 3, 4, 5].map((star) => {
                            const currentRating = hoverRating || interactiveRating;
                            return (
                              <Button
                                key={star}
                                variant="ghost"
                                size="sm"
                                className="p-1 hover:bg-yellow-50"
                                onClick={() => setInteractiveRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                              >
                                <StarIcon 
                                  className={`h-4 w-4 transition-colors ${
                                    star <= currentRating 
                                      ? 'fill-current text-yellow-500' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              </Button>
                            );
                          })}
                        </div>
                        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          {interactiveRating > 0 ? `You rated ${interactiveRating} star${interactiveRating > 1 ? 's' : ''}` : 'Click to rate'}
                        </p>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Code Example">
                    <CodeBlock
                      code={`// Interactive rating with hover
const [rating, setRating] = useState(0);
const [hoverRating, setHoverRating] = useState(0);

<div 
  className="flex items-center gap-1"
  onMouseLeave={() => setHoverRating(0)}
>
  {[1, 2, 3, 4, 5].map((star) => {
    const currentRating = hoverRating || rating;
    return (
      <Button
        key={star}
        variant="ghost"
        size="sm"
        className="p-1 hover:bg-yellow-50"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
      >
        <Star 
          className={\`h-4 w-4 transition-colors \${
            star <= currentRating 
              ? 'fill-current text-yellow-500' 
              : 'text-gray-300'
          }\`} 
        />
      </Button>
    );
  })}
</div>`}
                      language="tsx"
                      id="ratings-code"
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
                      Best practices for implementing miscellaneous components in your applications.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <PreviewCard title="Component Usage">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Consistent Styling</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Use consistent styling across all miscellaneous components
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Accessibility</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Ensure all components are accessible with proper ARIA labels
                            </p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Integration Notes">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">State Management</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Use proper state management for interactive components
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">Performance</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              Optimize re-renders for components with frequent updates
                            </p>
                          </div>
                        </div>
                      </div>
                    </PreviewCard>
                  </div>

                  <PreviewCard title="Installation & Setup">
                    <CodeBlock
                      code={`# Install required dependencies
npm install @radix-ui/react-switch @radix-ui/react-slider @radix-ui/react-toggle-group @radix-ui/react-tabs @radix-ui/react-separator

# Import components
import { Switch } from './components/ui/switch';
import { Slider } from './components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Separator } from './components/ui/separator';
import { Skeleton } from './components/ui/skeleton';
import { Progress } from './components/ui/progress';

# Basic usage
function MiscellaneousExample() {
  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState([50]);
  
  return (
    <div className="space-y-6">
      <Switch checked={switchValue} onCheckedChange={setSwitchValue} />
      <Slider value={sliderValue} onValueChange={setSliderValue} />
      <Skeleton className="h-4 w-full" />
      <Progress value={65} />
    </div>
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