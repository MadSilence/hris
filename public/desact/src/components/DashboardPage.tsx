import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Gauge, Users, UserPlus, TrendingUp, MessageSquare, Clock, DollarSign, BookOpen, Shield, BarChart3, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { DASHBOARD_EXAMPLES } from './constants/dashboardData';
import { DashboardDetailView } from './shared/DashboardDetailView';
import { DashboardCard } from './shared/DashboardCard';
import { MainSidebar } from './shared/MainSidebar';

interface DashboardPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
  });

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
      const sections = ['overview', 'recruitment', 'demographics', 'performance', 'engagement', 'attendance', 'compensation', 'learning', 'compliance'];
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
    { id: 'overview', label: 'Overview', icon: Gauge },
    { id: 'recruitment', label: 'Recruitment & Hiring', icon: UserPlus },
    { id: 'demographics', label: 'Employee Directory', icon: Users },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'engagement', label: 'Engagement & Feedback', icon: MessageSquare },
    { id: 'attendance', label: 'Time & Attendance', icon: Clock },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
    { id: 'learning', label: 'Learning & Development', icon: BookOpen },
    { id: 'compliance', label: 'Compliance', icon: Shield },
  ];





  const handleDashboardClick = (dashboardTitle: string) => {
    setSelectedDashboard(dashboardTitle);
  };

  const handleBackToDashboards = () => {
    setSelectedDashboard(null);
  };

  // If a specific dashboard is selected, show its detailed view
  if (selectedDashboard) {
    const dashboard = DASHBOARD_EXAMPLES.find(d => d.title === selectedDashboard);
    if (!dashboard) return null;

    return (
      <DashboardDetailView 
        dashboard={dashboard} 
        onBack={handleBackToDashboards} 
      />
    );
  }

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
                  <h1 className="text-xl font-semibold">Dashboard</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    HR Analytics
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Comprehensive dashboard examples for HR analytics and workforce management
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
                      Dashboard Examples
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Comprehensive dashboard examples specifically designed for HR analytics and workforce management. 
                      Each dashboard provides detailed insights with interactive widgets and real-time data visualization.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Analytics Focused</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Advanced metrics and KPI tracking for data-driven HR decisions.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Employee Centric</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Comprehensive views of employee lifecycle and engagement.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Goal Oriented</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Track performance, objectives, and organizational outcomes.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Dashboard Examples */}
              {sidebarSections.slice(1).map((section) => {
                const examples = DASHBOARD_EXAMPLES.filter(d => d.category === section.id);
                
                return (
                  <section key={section.id} id={section.id} className="scroll-mt-28">
                    <div className="space-y-8">
                      <div>
                        <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.2 }}>
                          {section.label}
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                          Detailed dashboard examples for {section.label.toLowerCase()} with comprehensive widgets and analytics.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {examples.map((dashboard, index) => (
                          <DashboardCard
                            key={index}
                            dashboard={dashboard}
                            onClick={() => handleDashboardClick(dashboard.title)}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};