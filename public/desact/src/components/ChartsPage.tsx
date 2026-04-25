import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Search, ChevronRight, Menu, BarChart3, LineChart, PieChart, Activity, TrendingUp, TrendingDown, Users, Building2, DollarSign, Calendar, Target, Award, Clock, Briefcase, Code2, Eye, Hash, Zap, Grid3X3, List, Package, CheckCircle, AlertTriangle, Info, Layers, Star, FileText, Square, Edit, Layout, CreditCard, Navigation, ArrowRight, ArrowUpDown, Upload, Gauge, Command, Type, Palette, Settings, User, Paintbrush } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Cell, 
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';
import { CodeBlock } from './shared/CodeBlock';
import { categoryIcons, componentIcons } from './constants/iconMappings';
import { DesactLogo } from './shared/DesactLogo';

interface ChartsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const ChartsPage: React.FC<ChartsPageProps> = ({ 
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
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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
      const sections = ['overview', 'bar-charts', 'line-charts', 'pie-charts', 'area-charts', 'scatter-plots', 'radial-charts', 'composed-charts', 'implementation'];
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
    { id: 'overview', label: 'Overview', icon: Grid3X3 },
    { id: 'bar-charts', label: 'Bar Charts', icon: BarChart3 },
    { id: 'line-charts', label: 'Line Charts', icon: LineChart },
    { id: 'pie-charts', label: 'Pie Charts', icon: PieChart },
    { id: 'area-charts', label: 'Area Charts', icon: Activity },
    { id: 'scatter-plots', label: 'Scatter Plots', icon: Target },
    { id: 'radial-charts', label: 'Radial Charts', icon: Award },
    { id: 'composed-charts', label: 'Composed Charts', icon: TrendingUp },
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

  // HR Data Sets
  const departmentEmployeeData = [
    { department: 'Engineering', employees: 85, budget: 2400000, avgSalary: 95000 },
    { department: 'Product', employees: 32, budget: 960000, avgSalary: 78000 },
    { department: 'Design', employees: 18, budget: 540000, avgSalary: 72000 },
    { department: 'Marketing', employees: 24, budget: 720000, avgSalary: 65000 },
    { department: 'Sales', employees: 45, budget: 1350000, avgSalary: 68000 },
    { department: 'HR', employees: 12, budget: 360000, avgSalary: 60000 },
    { department: 'Finance', employees: 15, budget: 450000, avgSalary: 75000 },
    { department: 'Legal', employees: 8, budget: 240000, avgSalary: 85000 }
  ];

  const trainingCompletionData = [
    { program: 'Cybersecurity Awareness', completed: 215, total: 239, completionRate: 90, mandatory: true },
    { program: 'Diversity & Inclusion', completed: 198, total: 239, completionRate: 83, mandatory: true },
    { program: 'Leadership Development', completed: 42, total: 65, completionRate: 65, mandatory: false },
    { program: 'Technical Certification', completed: 38, total: 85, completionRate: 45, mandatory: false },
    { program: 'Communication Skills', completed: 156, total: 180, completionRate: 87, mandatory: false },
    { program: 'Project Management', completed: 29, total: 45, completionRate: 64, mandatory: false },
    { program: 'Data Privacy & GDPR', completed: 225, total: 239, completionRate: 94, mandatory: true }
  ];

  const employeeGrowthTrendData = [
    { quarter: 'Q1 2023', employees: 205, newHires: 15, turnover: 8, retention: 96.1 },
    { quarter: 'Q2 2023', employees: 218, newHires: 18, turnover: 5, retention: 97.7 },
    { quarter: 'Q3 2023', employees: 225, newHires: 12, turnover: 5, retention: 97.8 },
    { quarter: 'Q4 2023', employees: 231, newHires: 9, turnover: 3, retention: 98.7 },
    { quarter: 'Q1 2024', employees: 239, newHires: 12, turnover: 4, retention: 98.3 },
    { quarter: 'Q2 2024', employees: 245, newHires: 8, turnover: 2, retention: 99.2 }
  ];

  const performanceDistributionData = [
    { rating: 'Exceeds Expectations', count: 42, percentage: 17.6 },
    { rating: 'Meets Expectations', count: 156, percentage: 65.3 },
    { rating: 'Partially Meets', count: 32, percentage: 13.4 },
    { rating: 'Needs Improvement', count: 9, percentage: 3.8 }
  ];

  const skillsDistributionData = [
    { skill: 'Frontend Development', count: 45, fill: '#3b82f6' },
    { skill: 'Backend Development', count: 38, fill: '#10b981' },
    { skill: 'Data Analysis', count: 25, fill: '#f59e0b' },
    { skill: 'UI/UX Design', count: 18, fill: '#ef4444' },
    { skill: 'DevOps', count: 15, fill: '#8b5cf6' },
    { skill: 'Project Management', count: 32, fill: '#06b6d4' },
    { skill: 'QA Testing', count: 12, fill: '#84cc16' },
    { skill: 'Machine Learning', count: 8, fill: '#f97316' }
  ];

  const salaryBenchmarkData = [
    { experience: 0, salary: 55000, satisfaction: 7.2, department: 'Engineering' },
    { experience: 1, salary: 62000, satisfaction: 7.8, department: 'Engineering' },
    { experience: 2, salary: 68000, satisfaction: 8.1, department: 'Product' },
    { experience: 3, salary: 75000, satisfaction: 8.3, department: 'Engineering' },
    { experience: 4, salary: 82000, satisfaction: 8.2, department: 'Design' },
    { experience: 5, salary: 89000, satisfaction: 8.5, department: 'Engineering' },
    { experience: 6, salary: 95000, satisfaction: 8.4, department: 'Marketing' },
    { experience: 7, salary: 102000, satisfaction: 8.7, department: 'Engineering' },
    { experience: 8, salary: 108000, satisfaction: 8.6, department: 'Product' },
    { experience: 9, salary: 115000, satisfaction: 8.8, department: 'Engineering' },
    { experience: 10, salary: 125000, satisfaction: 8.9, department: 'Engineering' }
  ];

  const goalCompletionData = [
    { name: 'Individual Goals', value: 78, fill: '#3b82f6' },
    { name: 'Team Goals', value: 85, fill: '#10b981' },
    { name: 'Department Goals', value: 92, fill: '#f59e0b' },
    { name: 'Company Goals', value: 88, fill: '#ef4444' }
  ];

  const hiringTrendsData = [
    { month: 'Jan', hires: 8, applications: 145, interviews: 32 },
    { month: 'Feb', hires: 12, applications: 189, interviews: 45 },
    { month: 'Mar', hires: 15, applications: 234, interviews: 56 },
    { month: 'Apr', hires: 9, applications: 167, interviews: 38 },
    { month: 'May', hires: 11, applications: 198, interviews: 42 },
    { month: 'Jun', hires: 14, applications: 212, interviews: 48 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${entry.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
              const IconComponent = categoryIcons[category] || componentIcons['Default'];
              
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
                  <h1 className="text-xl font-semibold">Charts & Graphs</h1>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    Analytics
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Interactive data visualization components for HR analytics and insights
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
                      HR Analytics & Data Visualization
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Comprehensive chart components built with Recharts for HR analytics, workforce insights, and data-driven decision making.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Workforce Analytics</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Track employee counts, department distribution, and organizational growth.</p>
                    </Card>
                    
                    <Card className="p-6">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Performance Metrics</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Monitor performance ratings, goal completion, and productivity trends.</p>
                    </Card>
                    
                    <Card className="p-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Award className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Training & Development</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Analyze training completion, skill development, and learning progress.</p>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Bar Charts */}
              <section id="bar-charts" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Bar Charts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Compare categorical data with horizontal and vertical bar charts.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Department Employee Count</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={departmentEmployeeData.slice(0, 5)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="department" 
                              tick={{ fontSize: 10 }}
                              axisLine={{ stroke: '#d1d5db' }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="employees" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">239</div>
                        <div className="text-sm text-brown-600">Total Employees</div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Training Completion Rates</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={trainingCompletionData.slice(0, 4)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="program" 
                              tick={{ fontSize: 9 }}
                              axisLine={{ stroke: '#d1d5db' }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="completionRate" fill="#10b981" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">88%</div>
                        <div className="text-sm text-brown-600">Avg Completion</div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Monthly Hiring Trends</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={hiringTrendsData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 10 }}
                              axisLine={{ stroke: '#d1d5db' }}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="hires" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">69</div>
                        <div className="text-sm text-brown-600">Total Hires</div>
                      </div>
                    </Card>
                  </div>

                  {/* Additional Bar Chart Examples - Row 2 */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Performance Distribution</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={performanceDistributionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="rating" 
                              tick={{ fontSize: 9 }}
                              axisLine={{ stroke: '#d1d5db' }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">239</div>
                        <div className="text-sm text-brown-600">Total Reviewed</div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Skills by Team Size</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={skillsDistributionData.slice(0, 5)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="skill" 
                              tick={{ fontSize: 8 }}
                              axisLine={{ stroke: '#d1d5db' }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#ec4899" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">193</div>
                        <div className="text-sm text-brown-600">Skilled Employees</div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Goal Achievement</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={goalCompletionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 9 }}
                              axisLine={{ stroke: '#d1d5db' }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">86%</div>
                        <div className="text-sm text-brown-600">Avg Achievement</div>
                      </div>
                    </Card>
                  </div>


                </div>
              </section>

              {/* Line Charts */}
              <section id="line-charts" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Line Charts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Track trends and changes over time periods.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Employee Growth Trends</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={employeeGrowthTrendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="quarter" 
                              tick={{ fontSize: 10 }}
                              axisLine={{ stroke: '#d1d5db' }}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                              type="monotone" 
                              dataKey="employees" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                              activeDot={{ r: 4 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">245</div>
                        <div className="text-sm text-brown-600">Current Employees</div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Retention Rate Trends</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={employeeGrowthTrendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="quarter" 
                              tick={{ fontSize: 10 }}
                              axisLine={{ stroke: '#d1d5db' }}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                              type="monotone" 
                              dataKey="retention" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                              activeDot={{ r: 4 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">99.2%</div>
                        <div className="text-sm text-brown-600">Current Retention</div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">New Hires vs Turnover</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLineChart data={employeeGrowthTrendData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                              dataKey="quarter" 
                              tick={{ fontSize: 10 }}
                              axisLine={{ stroke: '#d1d5db' }}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                              type="monotone" 
                              dataKey="newHires" 
                              stroke="#f59e0b" 
                              strokeWidth={2}
                              dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                              activeDot={{ r: 4 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="turnover" 
                              stroke="#ef4444" 
                              strokeWidth={2}
                              dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }}
                              activeDot={{ r: 4 }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">8:2</div>
                        <div className="text-sm text-brown-600">Hires to Turnover</div>
                      </div>
                    </Card>
                  </div>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Comprehensive Employee Growth & Retention Analysis</h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart data={employeeGrowthTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="quarter" 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                          />
                          <YAxis 
                            yAxisId="employees"
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: 'Total Employees', angle: -90, position: 'insideLeft' }}
                          />
                          <YAxis 
                            yAxisId="retention"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: 'Retention %', angle: 90, position: 'insideRight' }}
                            domain={[94, 100]}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line 
                            yAxisId="employees"
                            type="monotone" 
                            dataKey="employees" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Total Employees"
                          />
                          <Line 
                            yAxisId="retention"
                            type="monotone" 
                            dataKey="retention" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Retention Rate %"
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-brown-50 rounded-lg">
                        <div className="text-2xl font-bold text-brown-700">245</div>
                        <div className="text-sm text-brown-600">Current Employees</div>
                      </div>
                      <div className="text-center p-3 bg-brown-50 rounded-lg">
                        <div className="text-2xl font-bold text-brown-700">99.2%</div>
                        <div className="text-sm text-brown-600">Retention Rate</div>
                      </div>
                      <div className="text-center p-3 bg-brown-50 rounded-lg">
                        <div className="text-2xl font-bold text-brown-700">8</div>
                        <div className="text-sm text-brown-600">New Hires (Q2)</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Pie Charts */}
              <section id="pie-charts" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Pie Charts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Display proportional data and categorical breakdowns.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Performance Ratings</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={performanceDistributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ percentage }) => `${percentage}%`}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {performanceDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const chartData = payload[0].payload;
                                  return (
                                    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                                      <p className="text-sm font-medium text-gray-900">{chartData.rating}</p>
                                      <p className="text-xs text-gray-600">{chartData.count} employees ({chartData.percentage}%)</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">239</div>
                        <div className="text-sm text-brown-600">Total Reviews</div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Skills Distribution</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={skillsDistributionData.slice(0, 6)}
                              cx="50%"
                              cy="50%"
                              innerRadius={20}
                              outerRadius={60}
                              paddingAngle={2}
                              dataKey="count"
                            >
                              {skillsDistributionData.slice(0, 6).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const chartData = payload[0].payload;
                                  return (
                                    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                                      <p className="text-sm font-medium text-gray-900">{chartData.skill}</p>
                                      <p className="text-xs text-gray-600">{chartData.count} employees</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">193</div>
                        <div className="text-sm text-brown-600">Skilled Staff</div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Goal Completion</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={goalCompletionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${value}%`}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {goalCompletionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const chartData = payload[0].payload;
                                  return (
                                    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                                      <p className="text-sm font-medium text-gray-900">{chartData.name}</p>
                                      <p className="text-xs text-gray-600">Completion: {chartData.value}%</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">86%</div>
                        <div className="text-sm text-brown-600">Avg Completion</div>
                      </div>
                    </Card>
                  </div>

                  {/* Additional Pie Chart Row */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Department Budget Distribution</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={departmentEmployeeData.slice(0, 6)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ department, budget }) => `${(budget/1000000).toFixed(1)}M`}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="budget"
                            >
                              {departmentEmployeeData.slice(0, 6).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const chartData = payload[0].payload;
                                  return (
                                    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                                      <p className="text-sm font-medium text-gray-900">{chartData.department}</p>
                                      <p className="text-xs text-gray-600">Budget: ${(chartData.budget/1000000).toFixed(1)}M</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">$7.1M</div>
                        <div className="text-sm text-brown-600">Total Budget</div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Training Program Types</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={trainingCompletionData.slice(0, 5)}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={60}
                              paddingAngle={1}
                              dataKey="completed"
                            >
                              {trainingCompletionData.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const chartData = payload[0].payload;
                                  return (
                                    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                                      <p className="text-sm font-medium text-gray-900">{chartData.program}</p>
                                      <p className="text-xs text-gray-600">{chartData.completed} completed</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">1,103</div>
                        <div className="text-sm text-brown-600">Total Completions</div>
                      </div>
                    </Card>

                    <Card className="p-6">
                      <h4 className="font-semibold mb-4">Hiring Applications</h4>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={hiringTrendsData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ month, applications }) => `${month}`}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="applications"
                            >
                              {hiringTrendsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const chartData = payload[0].payload;
                                  return (
                                    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                                      <p className="text-sm font-medium text-gray-900">{chartData.month}</p>
                                      <p className="text-xs text-gray-600">{chartData.applications} applications</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-2xl font-bold text-brown-700">1,145</div>
                        <div className="text-sm text-brown-600">Total Applications</div>
                      </div>
                    </Card>
                  </div>
                </div>
              </section>

              {/* Area Charts */}
              <section id="area-charts" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Area Charts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Show cumulative data and trends with filled areas.</p>
                  </div>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Hiring Pipeline Trends</h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hiringTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="applications" 
                            stroke="#e5e7eb" 
                            fill="#e5e7eb"
                            name="Applications"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="interviews" 
                            stroke="#3b82f6" 
                            fill="#3b82f6"
                            name="Interviews"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="hires" 
                            stroke="#10b981" 
                            fill="#10b981"
                            name="Hires"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-brown-50 rounded-lg">
                        <div className="text-xl font-bold text-brown-700">1,145</div>
                        <div className="text-sm text-brown-600">Total Applications</div>
                      </div>
                      <div className="text-center p-3 bg-brown-50 rounded-lg">
                        <div className="text-xl font-bold text-brown-700">261</div>
                        <div className="text-sm text-brown-600">Total Interviews</div>
                      </div>
                      <div className="text-center p-3 bg-brown-50 rounded-lg">
                        <div className="text-xl font-bold text-brown-700">69</div>
                        <div className="text-sm text-brown-600">Total Hires</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Scatter Plots */}
              <section id="scatter-plots" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Scatter Plots</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Explore correlations between different metrics.</p>
                  </div>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Experience vs Salary & Satisfaction Analysis</h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart data={salaryBenchmarkData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="experience" 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: 'Years of Experience', position: 'insideBottom', offset: -10 }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: 'Salary ($)', angle: -90, position: 'insideLeft' }}
                            tickFormatter={(value) => `$${(value / 1000)}K`}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const chartData = payload[0].payload;
                                return (
                                  <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                                    <p className="text-sm font-medium text-gray-900">{chartData.department}</p>
                                    <p className="text-xs text-gray-600">Experience: {chartData.experience} years</p>
                                    <p className="text-xs text-gray-600">Salary: ${chartData.salary.toLocaleString()}</p>
                                    <p className="text-xs text-gray-600">Satisfaction: {chartData.satisfaction}/10</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Scatter dataKey="salary" fill="#3b82f6" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 bg-brown-50 rounded-lg">
                      <h5 className="font-medium text-brown-900 mb-2">Key Insights</h5>
                      <ul className="text-sm text-brown-800 space-y-1">
                        <li>• Strong positive correlation between experience and salary</li>
                        <li>• Average satisfaction score: 8.4/10 across all experience levels</li>
                        <li>• Engineering roles show highest salary progression</li>
                        <li>• Peak satisfaction at 8-10 years of experience</li>
                      </ul>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Radial Charts */}
              <section id="radial-charts" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Radial Charts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Display progress and completion metrics in circular format.</p>
                  </div>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Goal Completion Progress by Category</h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={goalCompletionData}>
                          <RadialBar 
                            minAngle={15}
                            label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
                            background 
                            clockWise 
                            dataKey="value"
                          />
                          <Legend 
                            iconSize={10} 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center"
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const chartData = payload[0].payload;
                                return (
                                  <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                                    <p className="text-sm font-medium text-gray-900">{chartData.name}</p>
                                    <p className="text-xs text-gray-600">Completion: {chartData.value}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {goalCompletionData.map((goal, index) => (
                        <div key={index} className="text-center p-3 rounded-lg" style={{ backgroundColor: `${goal.fill}15` }}>
                          <div className="text-xl font-bold" style={{ color: goal.fill }}>{goal.value}%</div>
                          <div className="text-xs text-gray-600">{goal.name.replace(' Goals', '')}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </section>

              {/* Composed Charts */}
              <section id="composed-charts" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Composed Charts</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Combine multiple chart types for comprehensive data analysis.</p>
                  </div>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Department Performance Dashboard</h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={departmentEmployeeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="department" 
                            tick={{ fontSize: 11 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            yAxisId="left"
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: 'Employees', angle: -90, position: 'insideLeft' }}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                            axisLine={{ stroke: '#d1d5db' }}
                            label={{ value: 'Avg Salary ($K)', angle: 90, position: 'insideRight' }}
                            tickFormatter={(value) => `${value / 1000}K`}
                          />
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const chartData = payload[0].payload;
                                return (
                                  <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                                    <p className="text-sm font-medium text-gray-900">{label}</p>
                                    <p className="text-xs text-blue-600">Employees: {chartData.employees}</p>
                                    <p className="text-xs text-green-600">Budget: ${(chartData.budget / 1000000).toFixed(1)}M</p>
                                    <p className="text-xs text-orange-600">Avg Salary: ${chartData.avgSalary.toLocaleString()}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Bar yAxisId="left" dataKey="employees" fill="#3b82f6" name="Employee Count" />
                          <Line 
                            yAxisId="right" 
                            type="monotone" 
                            dataKey="avgSalary" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            name="Average Salary"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-brown-50 rounded-lg">
                        <div className="text-xl font-bold text-brown-700">239</div>
                        <div className="text-sm text-brown-600">Total Employees</div>
                      </div>
                      <div className="text-center p-3 bg-brown-50 rounded-lg">
                        <div className="text-xl font-bold text-brown-700">$7.06M</div>
                        <div className="text-sm text-brown-600">Total Budget</div>
                      </div>
                      <div className="text-center p-3 bg-brown-50 rounded-lg">
                        <div className="text-xl font-bold text-brown-700">$74K</div>
                        <div className="text-sm text-brown-600">Company Avg Salary</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Implementation */}
              <section id="implementation" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h2 style={{ fontSize: 'var(--text-display-sm)', fontWeight: 'var(--font-weight-medium)' }}>Implementation</h2>
                    <p className="mt-2" style={{ color: 'var(--color-text-tertiary)' }}>Code examples and implementation details for HR chart components.</p>
                  </div>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Basic HR Bar Chart Implementation</h4>
                    <CodeBlock
                      code={`import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const departmentData = [
  { department: 'Engineering', employees: 85, avgSalary: 95000 },
  { department: 'Product', employees: 32, avgSalary: 78000 },
  { department: 'Design', employees: 18, avgSalary: 72000 },
  { department: 'Marketing', employees: 24, avgSalary: 65000 }
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const chartData = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-blue-600">Employees: {chartData.employees}</p>
        <p className="text-xs text-green-600">Avg Salary: $&{chartData.avgSalary.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function DepartmentChart() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={departmentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="department" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="employees" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}`}
                      onCopy={(code) => copyToClipboard(code, 'hr-bar-chart')}
                      copied={copiedCode === 'hr-bar-chart'}
                    />
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">HR Performance Line Chart</h4>
                    <CodeBlock
                      code={`import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const performanceData = [
  { quarter: 'Q1 2024', employees: 231, retention: 98.7 },
  { quarter: 'Q2 2024', employees: 239, retention: 98.3 },
  { quarter: 'Q3 2024', employees: 245, retention: 99.2 }
];

export function PerformanceTrends() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="quarter" 
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            yAxisId="employees"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          <YAxis 
            yAxisId="retention"
            orientation="right"
            tick={{ fontSize: 12 }}
            domain={[95, 100]}
          />
          <Tooltip />
          <Line 
            yAxisId="employees"
            type="monotone" 
            dataKey="employees" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          />
          <Line 
            yAxisId="retention"
            type="monotone" 
            dataKey="retention" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}`}
                      onCopy={(code) => copyToClipboard(code, 'hr-line-chart')}
                      copied={copiedCode === 'hr-line-chart'}
                    />
                  </Card>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};