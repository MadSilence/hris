import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Menu
} from 'lucide-react';
import { MainSidebar } from './shared/MainSidebar';
import { PageHeader } from './shared/PageHeader';
import { CodeBlock } from './shared/CodeBlock';
import { createCopyHandler } from './shared/copyUtils';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';

interface TablesPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const TablesPage: React.FC<TablesPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [activeSection, setActiveSection] = useState('basic-tables');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // MainSidebar required state
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Table states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
      const sections = ['basic-tables', 'header-tables', 'action-tables', 'complex-tables', 'expandable-tables'];
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

  const handleCopyCode = createCopyHandler(setCopiedCode);

  const sections = [
    { id: 'basic-tables', label: 'Basic Tables', icon: Menu },
    { id: 'header-tables', label: 'Tables with Headers', icon: Calendar },
    { id: 'action-tables', label: 'Action Tables', icon: Edit },
    { id: 'complex-tables', label: 'Complex Tables', icon: TrendingUp },
    { id: 'expandable-tables', label: 'Expandable Tables', icon: ChevronDown }
  ];

  // Sample data
  const basicEmployees = [
    { id: '1', name: 'Sarah Chen', department: 'HR', role: 'Director' },
    { id: '2', name: 'John Davidson', department: 'Engineering', role: 'Senior Engineer' },
    { id: '3', name: 'Maria Rodriguez', department: 'Sales', role: 'Manager' },
    { id: '4', name: 'David Park', department: 'Marketing', role: 'Coordinator' }
  ];

  const detailedEmployees = [
    {
      id: '1',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      department: 'Human Resources',
      role: 'HR Director',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
      salary: '$120,000',
      performance: 92,
      joinDate: '2022-01-15',
      lastActive: '2024-01-28'
    },
    {
      id: '2',
      name: 'John Davidson',
      email: 'john.davidson@company.com',
      department: 'Engineering',
      role: 'Senior Software Engineer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      salary: '$135,000',
      performance: 88,
      joinDate: '2021-03-10',
      lastActive: '2024-01-28'
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@company.com',
      department: 'Sales',
      role: 'Sales Manager',
      status: 'on-leave',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
      salary: '$110,000',
      performance: 95,
      joinDate: '2020-11-22',
      lastActive: '2024-01-20'
    },
    {
      id: '4',
      name: 'David Park',
      email: 'david.park@company.com',
      department: 'Marketing',
      role: 'Marketing Coordinator',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      salary: '$75,000',
      performance: 78,
      joinDate: '2023-05-08',
      lastActive: '2024-01-27'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      email: 'lisa.thompson@company.com',
      department: 'Engineering',
      role: 'Product Manager',
      status: 'inactive',
      avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=80&h=80&fit=crop&crop=face',
      salary: '$125,000',
      performance: 85,
      joinDate: '2021-08-14',
      lastActive: '2023-12-15'
    }
  ];

  const filteredEmployees = detailedEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(emp => emp.id)));
    }
  };

  const toggleRowExpansion = (employeeId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
      case 'on-leave':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">On Leave</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-brown-50/30 flex">
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
      
      <div className="flex-1 flex flex-col">
        <PageHeader 
          title="Tables"
          description="Data table components for displaying, searching, and managing structured information with actions and complex cell types."
          onBack={onBack}
          sections={sections}
        />

        <div className="flex-1 relative">
          {/* Floating Navigation */}
          <div className="fixed right-8 top-40 z-30 hidden xl:block">
            <div className="bg-white rounded-lg border border-brown-200 shadow-lg p-4 w-56">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-brown-100">
                <Menu className="h-4 w-4" style={{ color: 'var(--color-text-quaternary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>On this page</span>
              </div>
              <nav className="space-y-1">
                {sections.map((section) => (
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

          <main className="p-8 xl:pr-72 max-w-6xl mx-auto space-y-16">
            {/* Basic Tables */}
            <section id="basic-tables" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Basic Tables</h2>
                <p className="text-muted-foreground mb-6">
                  Simple data tables for displaying structured information with clean styling and responsive design.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {basicEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell>{employee.role}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>

                <CodeBlock
                  title="Basic Table"
                  language="tsx"
                  id="basic-table-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Department</TableHead>
      <TableHead>Role</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {employees.map((employee) => (
      <TableRow key={employee.id}>
        <TableCell className="font-medium">{employee.name}</TableCell>
        <TableCell>{employee.department}</TableCell>
        <TableCell>{employee.role}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
                />
              </div>
            </section>

            {/* Tables with Headers */}
            <section id="header-tables" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Tables with Headers</h2>
                <p className="text-muted-foreground mb-6">
                  Enhanced tables with descriptive headers, captions, and additional metadata for better context.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="border-brown-200">
                  <div className="p-6 border-b border-brown-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Employee Directory</h3>
                        <p className="text-sm text-muted-foreground">
                          Complete list of all company employees with their roles and departments
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">{detailedEmployees.length} employees</Badge>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Join Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={employee.avatar} />
                                  <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{employee.name}</p>
                                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{employee.department}</TableCell>
                            <TableCell>{employee.role}</TableCell>
                            <TableCell>{getStatusBadge(employee.status)}</TableCell>
                            <TableCell>{employee.joinDate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                <CodeBlock
                  title="Table with Header"
                  language="tsx"
                  id="header-table-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Card className="border-brown-200">
  <div className="p-6 border-b border-brown-200">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium">Employee Directory</h3>
        <p className="text-sm text-muted-foreground">
          Complete list of all company employees with their roles and departments
        </p>
      </div>
      <Badge className="bg-blue-100 text-blue-700">{employees.length} employees</Badge>
    </div>
  </div>
  
  <div className="p-6">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Join Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={employee.avatar} />
                  <AvatarFallback>{employee.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>{employee.role}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(employee.status)}>
                {employee.status}
              </Badge>
            </TableCell>
            <TableCell>{employee.joinDate}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
</Card>`}
                />
              </div>
            </section>

            {/* Action Tables */}
            <section id="action-tables" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Tables with Actions and Search</h2>
                <p className="text-muted-foreground mb-6">
                  Interactive tables with search functionality, bulk selection, and row-level actions for data management.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="border-brown-200">
                  <div className="p-6 border-b border-brown-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Employee Management</h3>
                      <Button className="bg-brown-600 hover:bg-brown-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Employee
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
                        <Input
                          placeholder="Search employees..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>

                    {selectedEmployees.size > 0 && (
                      <div className="mt-4 p-3 bg-brown-50 rounded-lg border border-brown-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {selectedEmployees.size} employee{selectedEmployees.size > 1 ? 's' : ''} selected
                          </span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">Archive</Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                              onCheckedChange={toggleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Active</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedEmployees.has(employee.id)}
                                onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={employee.avatar} />
                                  <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{employee.name}</p>
                                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{employee.department}</TableCell>
                            <TableCell>{employee.role}</TableCell>
                            <TableCell>{getStatusBadge(employee.status)}</TableCell>
                            <TableCell>{employee.lastActive}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Employee
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                <CodeBlock
                  title="Action Table with Search"
                  language="tsx"
                  id="action-table-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`const [searchTerm, setSearchTerm] = useState('');
const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

const filteredEmployees = employees.filter(employee =>
  employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  employee.department.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
  <Card className="border-brown-200">
    <div className="p-6 border-b border-brown-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Employee Management</h3>
        <Button className="bg-brown-600 hover:bg-brown-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
    </div>
    
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedEmployees.size === filteredEmployees.length}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <Checkbox
                  checked={selectedEmployees.has(employee.id)}
                  onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback>{employee.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(employee.status)}>
                  {employee.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit Employee</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </Card>
);`}
                />
              </div>
            </section>

            {/* Complex Tables */}
            <section id="complex-tables" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Tables with Complex Cells</h2>
                <p className="text-muted-foreground mb-6">
                  Advanced tables featuring progress bars, status indicators, avatars, and rich content for comprehensive data visualization.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="border-brown-200">
                  <div className="p-6 border-b border-brown-200">
                    <h3 className="font-medium">Employee Performance Dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                      Detailed view of employee performance metrics, compensation, and status indicators
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Salary</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={employee.avatar} />
                                  <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{employee.name}</p>
                                  <p className="text-sm text-muted-foreground">{employee.role}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  employee.department === 'Human Resources' ? 'bg-purple-500' :
                                  employee.department === 'Engineering' ? 'bg-blue-500' :
                                  employee.department === 'Sales' ? 'bg-green-500' :
                                  'bg-orange-500'
                                }`} />
                                {employee.department}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-medium ${getPerformanceColor(employee.performance)}`}>
                                    {employee.performance}%
                                  </span>
                                </div>
                                <Progress value={employee.performance} className="h-2 w-20" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{employee.salary.replace('$', '').replace(',', 'K').replace('000', '')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {employee.status === 'active' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                {employee.status === 'on-leave' && <Clock className="w-4 h-4 text-yellow-600" />}
                                {employee.status === 'inactive' && <XCircle className="w-4 h-4 text-red-600" />}
                                {getStatusBadge(employee.status)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                <CodeBlock
                  title="Complex Table with Progress and Icons"
                  language="tsx"
                  id="complex-table-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Employee</TableHead>
      <TableHead>Department</TableHead>
      <TableHead>Performance</TableHead>
      <TableHead>Salary</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {employees.map((employee) => (
      <TableRow key={employee.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback>{employee.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{employee.name}</p>
              <p className="text-sm text-muted-foreground">{employee.role}</p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            {employee.department}
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">
                {employee.performance}%
              </span>
            </div>
            <Progress value={employee.performance} className="h-2 w-20" />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{employee.salary}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Badge className="bg-green-100 text-green-700">Active</Badge>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}
                />
              </div>
            </section>

            {/* Expandable Tables */}
            <section id="expandable-tables" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Expandable Tables</h2>
                <p className="text-muted-foreground mb-6">
                  Tables with collapsible rows to show additional details and nested information on demand.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="border-brown-200">
                  <div className="p-6 border-b border-brown-200">
                    <h3 className="font-medium">Employee Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on any row to expand and view additional employee information and metrics
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailedEmployees.map((employee) => (
                          <React.Fragment key={employee.id}>
                            <TableRow 
                              className="cursor-pointer hover:bg-brown-50"
                              onClick={() => toggleRowExpansion(employee.id)}
                            >
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  {expandedRows.has(employee.id) ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={employee.avatar} />
                                    <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{employee.name}</p>
                                    <p className="text-sm text-muted-foreground">{employee.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{employee.department}</TableCell>
                              <TableCell>{employee.role}</TableCell>
                              <TableCell>{getStatusBadge(employee.status)}</TableCell>
                            </TableRow>
                            
                            {expandedRows.has(employee.id) && (
                              <TableRow>
                                <TableCell colSpan={5} className="p-0">
                                  <div className="bg-brown-50/50 p-6 border-t border-brown-100">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div>
                                        <h4 className="font-medium mb-3">Contact Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Email:</span>
                                            <span>{employee.email}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Join Date:</span>
                                            <span>{employee.joinDate}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Active:</span>
                                            <span>{employee.lastActive}</span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-medium mb-3">Performance Metrics</h4>
                                        <div className="space-y-3">
                                          <div>
                                            <div className="flex justify-between mb-1">
                                              <span className="text-sm text-muted-foreground">Overall Performance</span>
                                              <span className={`text-sm font-medium ${getPerformanceColor(employee.performance)}`}>
                                                {employee.performance}%
                                              </span>
                                            </div>
                                            <Progress value={employee.performance} className="h-2" />
                                          </div>
                                          <div>
                                            <div className="flex justify-between mb-1">
                                              <span className="text-sm text-muted-foreground">Goals Completed</span>
                                              <span className="text-sm font-medium text-green-600">12/15</span>
                                            </div>
                                            <Progress value={80} className="h-2" />
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="font-medium mb-3">Recent Activity</h4>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center gap-2">
                                            <CheckCircle className="w-3 h-3 text-green-600" />
                                            <span>Completed Q4 review</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-yellow-600" />
                                            <span>Pending training completion</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3 text-blue-600" />
                                            <span>Updated profile information</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <Separator className="my-4" />
                                    
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" size="sm">
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Full Profile
                                      </Button>
                                      <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Employee
                                      </Button>
                                      <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Schedule Review
                                      </Button>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>

                <CodeBlock
                  title="Expandable Table"
                  language="tsx"
                  id="expandable-table-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

const toggleRowExpansion = (employeeId: string) => {
  const newExpanded = new Set(expandedRows);
  if (newExpanded.has(employeeId)) {
    newExpanded.delete(employeeId);
  } else {
    newExpanded.add(employeeId);
  }
  setExpandedRows(newExpanded);
};

return (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-12"></TableHead>
        <TableHead>Employee</TableHead>
        <TableHead>Department</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {employees.map((employee) => (
        <React.Fragment key={employee.id}>
          <TableRow 
            className="cursor-pointer hover:bg-brown-50"
            onClick={() => toggleRowExpansion(employee.id)}
          >
            <TableCell>
              <Button variant="ghost" size="sm">
                {expandedRows.has(employee.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={employee.avatar} />
                  <AvatarFallback>{employee.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>{employee.role}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(employee.status)}>
                {employee.status}
              </Badge>
            </TableCell>
          </TableRow>
          
          {expandedRows.has(employee.id) && (
            <TableRow>
              <TableCell colSpan={5} className="p-0">
                <div className="bg-brown-50/50 p-6 border-t border-brown-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Expanded content */}
                    <div>
                      <h4 className="font-medium mb-3">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{employee.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Join Date:</span>
                          <span>{employee.joinDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Performance</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Overall Performance</span>
                            <span className="text-sm font-medium">{employee.performance}%</span>
                          </div>
                          <Progress value={employee.performance} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Quick Actions</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Profile</Button>
                        <Button size="sm" className="bg-brown-600">Edit</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      ))}
    </TableBody>
  </Table>
);`}
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};