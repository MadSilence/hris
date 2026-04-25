import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Menu, Calendar, Clock, Users, ChevronLeft, ChevronRight, Plus, Filter, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CodeBlock } from './shared/CodeBlock';
import { MainSidebar } from './shared/MainSidebar';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { motion } from 'motion/react';

interface ComponentPageProps {
  onBack: () => void;
  components: Array<{ name: string; blockCount: number; thumbnail: React.ReactNode; category: string }>;
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export function CalendarsPage({ onBack, components, onComponentClick, currentComponent }: ComponentPageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(undefined);
  const [calendarView, setCalendarView] = useState('month');
  const [showWeekends, setShowWeekends] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [openEventPopover, setOpenEventPopover] = useState<number | null>(null);

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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'date-picker', 'event-calendar', 'scheduling', 'time-off', 'meeting-planner', 'calendar-settings'];
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
    { id: 'overview', label: 'Overview', icon: Calendar },
    { id: 'date-picker', label: 'Date Pickers', icon: Calendar },
    { id: 'event-calendar', label: 'Event Calendar', icon: Calendar },
    { id: 'scheduling', label: 'Scheduling Interface', icon: Clock },
    { id: 'time-off', label: 'Time-off Calendar', icon: Calendar },
    { id: 'meeting-planner', label: 'Meeting Planner', icon: Users },
    { id: 'calendar-settings', label: 'Calendar Settings', icon: Settings }
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

  // Mock events data - organized by day for calendar display
  const calendarEvents = {
    15: [
      {
        id: 1,
        title: 'Team Standup',
        time: '9:00 AM - 9:30 AM',
        type: 'meeting',
        attendees: 8,
        department: 'Engineering',
        description: 'Daily team standup to review progress and blockers',
        location: 'Conference Room A',
        color: 'bg-blue-200'
      },
      {
        id: 2,
        title: 'Product Review',
        time: '2:00 PM - 3:30 PM',
        type: 'review',
        attendees: 12,
        department: 'Product Team',
        description: 'Quarterly product roadmap review and planning session',
        location: 'Main Conference Room',
        color: 'bg-purple-200'
      }
    ],
    20: [
      {
        id: 3,
        title: 'All Hands Meeting',
        time: '10:00 AM - 11:00 AM',
        type: 'meeting',
        attendees: 45,
        department: 'Company-wide',
        description: 'Monthly company all-hands meeting with updates from leadership',
        location: 'Main Auditorium',
        color: 'bg-blue-200'
      },
      {
        id: 4,
        title: 'Training: React Best Practices',
        time: '1:00 PM - 4:00 PM',
        type: 'training',
        attendees: 15,
        department: 'Engineering',
        description: 'Advanced React patterns and best practices workshop',
        location: 'Training Room B',
        color: 'bg-green-200'
      },
      {
        id: 5,
        title: 'Performance Reviews',
        time: '4:30 PM - 5:30 PM',
        type: 'review',
        attendees: 6,
        department: 'HR',
        description: 'Q4 performance review sessions',
        location: 'HR Office',
        color: 'bg-orange-200'
      }
    ],
    25: [
      {
        id: 6,
        title: 'Holiday Party Planning',
        time: '11:00 AM - 12:00 PM',
        type: 'meeting',
        attendees: 8,
        department: 'Operations',
        description: 'Final planning for the company holiday party',
        location: 'Operations Office',
        color: 'bg-blue-200'
      },
      {
        id: 7,
        title: 'Year-End Review',
        time: '3:00 PM - 4:00 PM',
        type: 'review',
        attendees: 12,
        department: 'Leadership',
        description: 'Annual company performance and goal setting review',
        location: 'Executive Boardroom',
        color: 'bg-purple-200'
      }
    ]
  };

  // Legacy events data for other parts of the component
  const events = [
    {
      id: 1,
      title: 'Team Meeting',
      date: new Date(2024, 11, 15),
      time: '10:00 AM',
      type: 'meeting',
      attendees: 8,
      department: 'Engineering'
    },
    {
      id: 2,
      title: 'Performance Review',
      date: new Date(2024, 11, 16),
      time: '2:00 PM',
      type: 'review',
      attendees: 2,
      department: 'HR'
    },
    {
      id: 3,
      title: 'Training Session',
      date: new Date(2024, 11, 18),
      time: '9:00 AM',
      type: 'training',
      attendees: 15,
      department: 'All Departments'
    },
    {
      id: 4,
      title: 'Holiday - Christmas',
      date: new Date(2024, 11, 25),
      time: 'All Day',
      type: 'holiday',
      attendees: 0,
      department: 'Company-wide'
    }
  ];

  const timeOffRequests = [
    {
      id: 1,
      employee: 'Sarah Johnson',
      type: 'Vacation',
      startDate: new Date(2024, 11, 20),
      endDate: new Date(2024, 11, 22),
      status: 'approved',
      days: 3
    },
    {
      id: 2,
      employee: 'Mike Chen',
      type: 'Sick Leave',
      startDate: new Date(2024, 11, 17),
      endDate: new Date(2024, 11, 17),
      status: 'pending',
      days: 1
    },
    {
      id: 3,
      employee: 'Emily Davis',
      type: 'Personal',
      startDate: new Date(2024, 11, 23),
      endDate: new Date(2024, 11, 24),
      status: 'approved',
      days: 2
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'review': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'training': return 'bg-green-100 text-green-700 border-green-200';
      case 'holiday': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-brown-100 text-brown-700 border-brown-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-brown-100 text-brown-700';
    }
  };

  // Month navigation handlers
  const navigateToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const navigateToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Get month name
  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  };

  // Generate calendar days based on view
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Get week days for week view
  const getWeekDays = () => {
    const today = new Date(currentYear, currentMonth, 9 + new Date().getDay()); // Sample week
    const week = [];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day.getDate());
    }
    return week;
  };

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    return calendarEvents[day] || [];
  };

  // Check if day has events
  const dayHasEvents = (day: number) => {
    return calendarEvents[day] && calendarEvents[day].length > 0;
  };

  // Event Details Popover Component
  const EventDetailsPopover = ({ day, events }: { day: number; events: any[] }) => (
    <div className="w-80 p-4">
      <div className="mb-3">
        <h4 className="font-semibold text-brown-800">
          {getMonthName(currentMonth)} {day}, {currentYear}
        </h4>
        <p className="text-sm text-muted-foreground">
          {events.length} event{events.length > 1 ? 's' : ''} scheduled
        </p>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {events.map((event, index) => (
          <div key={event.id} className="border border-brown-200 rounded-lg p-3 bg-brown-50/30">
            <div className="flex items-start justify-between mb-2">
              <h5 className="font-medium text-sm text-brown-800">{event.title}</h5>
              <Badge variant="outline" className={`text-xs ${getEventTypeColor(event.type)}`}>
                {event.type}
              </Badge>
            </div>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{event.time}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 flex items-center justify-center">📍</span>
                  <span>{event.location}</span>
                </div>
              )}
              
              {event.attendees > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{event.attendees} attendees</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 flex items-center justify-center">🏢</span>
                <span>{event.department}</span>
              </div>
            </div>
            
            {event.description && (
              <p className="text-xs text-brown-600 mt-2 pt-2 border-t border-brown-200">
                {event.description}
              </p>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-brown-200">
        <Button 
          size="sm" 
          className="w-full bg-brown-600 hover:bg-brown-700 text-white"
          onClick={() => setOpenEventPopover(null)}
        >
          Close
        </Button>
      </div>
    </div>
  );

  const basicDatePickerCode = `import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';

const DatePicker = () => {
  const [date, setDate] = useState();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[240px] justify-start text-left"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? date.toLocaleDateString() : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className="themed-calendar"
        />
      </PopoverContent>
    </Popover>
  );
};

const DateRangePicker = () => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Start Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left mt-1"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? startDate.toLocaleDateString() : "Start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
              className="themed-calendar"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">End Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left mt-1"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? endDate.toLocaleDateString() : "End date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
              className="themed-calendar"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};`;

  const eventCalendarCode = `const EventCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  
  const getDayEvents = (date) => {
    return events.filter(event => 
      isSameDay(event.date, date)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Company Calendar</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasEvents: (date) => getDayEvents(date).length > 0
            }}
            modifiersStyles={{
              hasEvents: { fontWeight: 'bold', backgroundColor: '#f3f1ee' }
            }}
          />
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          {getDayEvents(selectedDate).map(event => (
            <Card key={event.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {event.time} • {event.department}
                  </p>
                </div>
                <Badge variant="outline">
                  {event.attendees} attendees
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};`;

  const timeOffCalendarCode = `const TimeOffCalendar = () => {
  const [requests, setRequests] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const getRequestsForDate = (date) => {
    return requests.filter(request =>
      isWithinInterval(date, {
        start: request.startDate,
        end: request.endDate
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Time-off Calendar</h2>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="vacation">Vacation</SelectItem>
            <SelectItem value="sick">Sick Leave</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar
            mode="single"
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
            modifiers={{
              timeOff: (date) => getRequestsForDate(date).length > 0
            }}
            modifiersClassNames={{
              timeOff: 'bg-blue-100 text-blue-900'
            }}
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Upcoming Time-off Requests</h3>
          {requests.map(request => (
            <Card key={request.id} className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{request.employee}</h4>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {request.type} • {request.days} day{request.days > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(request.startDate, 'MMM d')} - {format(request.endDate, 'MMM d')}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};`;

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
                  <h1 className="text-xl font-semibold">Calendars</h1>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                    Components
                  </Badge>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  Calendar components, date pickers, scheduling interfaces, and time management tools for HR applications
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
                      Calendar Components Overview
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--color-text-tertiary)' }}>
                      Comprehensive calendar system components for HR applications including date pickers, event calendars, 
                      scheduling interfaces, time-off management, and meeting planning tools.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <PreviewCard>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Date Pickers</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Interactive date selection components for forms and scheduling interfaces.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Event Calendars</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Full-featured calendar views for managing company events and schedules.</p>
                    </PreviewCard>
                    
                    <PreviewCard>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Meeting Planner</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Collaborative scheduling tools for meetings and team coordination.</p>
                    </PreviewCard>
                  </div>
                </div>
              </section>

              {/* Date Pickers */}
              <section id="date-picker" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Date Pickers
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Various date picker components for different use cases in HR workflows.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <PreviewCard title="Single Date Picker">
                      <div className="space-y-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full justify-start text-left"
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {selectedDate ? selectedDate.toLocaleDateString() : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                              className="themed-calendar"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </PreviewCard>

                    <PreviewCard title="Date Range Picker">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-start text-left mt-1"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {startDate ? startDate.toLocaleDateString() : "Start date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={startDate}
                                  onSelect={setStartDate}
                                  initialFocus
                                  className="themed-calendar"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground">End Date</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-start text-left mt-1"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {endDate ? endDate.toLocaleDateString() : "End date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={endDate}
                                  onSelect={setEndDate}
                                  initialFocus
                                  className="themed-calendar"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Select a date range for vacation requests</p>
                      </div>
                    </PreviewCard>
                  </div>

                  <CodeBlock
                    code={basicDatePickerCode}
                    language="tsx"
                    title="Basic Date Picker Component"
                    id="basic-date-picker"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </section>

              {/* Event Calendar */}
              <section id="event-calendar" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Event Calendar
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Full-featured calendar interface for managing company events, meetings, and important dates.
                    </p>
                  </div>

                  <PreviewCard>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Company Events Calendar</h3>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                          </Button>
                          <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Event
                          </Button>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="themed-calendar w-full"
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium">
                            Events for {selectedDate?.toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h4>
                          
                          {events
                            .filter(event => event.date.toDateString() === selectedDate?.toDateString())
                            .map(event => (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Card className="p-4">
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                      <h5 className="font-medium">{event.title}</h5>
                                      <Badge variant="outline" className={getEventTypeColor(event.type)}>
                                        {event.type}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {event.time} • {event.department}
                                    </p>
                                    {event.attendees > 0 && (
                                      <p className="text-xs text-muted-foreground">
                                        {event.attendees} attendees
                                      </p>
                                    )}
                                  </div>
                                </Card>
                              </motion.div>
                            ))}
                          
                          {events.filter(event => event.date.toDateString() === selectedDate?.toDateString()).length === 0 && (
                            <div className="text-center py-6 text-muted-foreground">
                              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No events scheduled</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <CodeBlock
                    code={eventCalendarCode}
                    language="tsx"
                    title="Event Calendar Component"
                    id="event-calendar-code"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </section>

              {/* Scheduling Interface */}
              <section id="scheduling" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Scheduling Interface
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Advanced scheduling tools for coordinating meetings, interviews, and team activities.
                    </p>
                  </div>

                  <PreviewCard title="Interactive Schedule View">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={navigateToPreviousMonth}
                            className="hover:bg-brown-50 hover:border-brown-300"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <h4 className="font-medium">{getMonthName(currentMonth)} {currentYear}</h4>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={navigateToNextMonth}
                            className="hover:bg-brown-50 hover:border-brown-300"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <Select value={calendarView} onValueChange={setCalendarView}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="day">Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Month View */}
                      {calendarView === 'month' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-7 gap-2 mb-2">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                                {day}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-2">
                            {generateCalendarDays().map((day, index) => {
                              const hasEvents = day && dayHasEvents(day);
                              const dayEvents = day ? getEventsForDay(day) : [];
                              
                              return (
                                <div key={index}>
                                  {hasEvents ? (
                                    <Popover 
                                      open={openEventPopover === day} 
                                      onOpenChange={(open) => setOpenEventPopover(open ? day : null)}
                                    >
                                      <PopoverTrigger asChild>
                                        <div className={`p-2 text-center border rounded-lg min-h-[60px] cursor-pointer transition-all ${
                                          !showWeekends && (index % 7 === 5 || index % 7 === 6) 
                                            ? 'bg-gray-50 text-gray-400' 
                                            : 'bg-white hover:bg-brown-50 hover:border-brown-300 hover:shadow-sm'
                                        }`}>
                                          <div className="text-sm font-medium mb-1">{day}</div>
                                          <div className="space-y-1">
                                            {dayEvents.slice(0, 3).map((event, eventIndex) => (
                                              <div 
                                                key={eventIndex} 
                                                className={`h-1.5 rounded-full ${event.color}`} 
                                                style={{ width: `${100 - (eventIndex * 15)}%` }}
                                              />
                                            ))}
                                            {dayEvents.length > 3 && (
                                              <div className="text-xs text-brown-600 font-medium">
                                                +{dayEvents.length - 3} more
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent 
                                        className="w-auto p-0 border-brown-200" 
                                        align="center"
                                        side="top"
                                      >
                                        <EventDetailsPopover day={day} events={dayEvents} />
                                      </PopoverContent>
                                    </Popover>
                                  ) : (
                                    <div className={`p-2 text-center border rounded-lg min-h-[60px] ${
                                      !showWeekends && (index % 7 === 5 || index % 7 === 6) 
                                        ? 'bg-gray-50 text-gray-400' 
                                        : 'bg-white hover:bg-brown-50'
                                    } ${day ? 'cursor-pointer' : ''}`}>
                                      {day && (
                                        <div className="text-sm font-medium mb-1">{day}</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Week View */}
                      {calendarView === 'week' && (
                        <div className="grid grid-cols-7 gap-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                            const weekDays = getWeekDays();
                            return (
                              <div key={day} className={`p-3 text-center border rounded-lg ${
                                !showWeekends && (index === 5 || index === 6) 
                                  ? 'bg-gray-50 text-gray-400' 
                                  : 'bg-white hover:bg-brown-50'
                              }`}>
                                <div className="text-xs font-medium text-muted-foreground mb-1">{day}</div>
                                <div className="text-sm font-medium mb-2">{weekDays[index]}</div>
                                {index < 5 && (
                                  <div className="space-y-1">
                                    <div className="w-full h-2 bg-blue-200 rounded-full" />
                                    {index === 1 && <div className="w-3/4 h-2 bg-green-200 rounded-full" />}
                                    {index === 3 && <div className="w-1/2 h-2 bg-purple-200 rounded-full" />}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Day View */}
                      {calendarView === 'day' && (
                        <div className="space-y-4">
                          <div className="text-center p-4 border rounded-lg bg-white">
                            <h5 className="font-medium mb-2">Today - {getMonthName(currentMonth)} {new Date().getDate()}, {currentYear}</h5>
                            <div className="space-y-3">
                              {/* Time slots for day view */}
                              {[
                                { time: '9:00 AM', event: 'Team Standup', type: 'bg-blue-100 text-blue-700' },
                                { time: '11:00 AM', event: 'Project Review', type: 'bg-purple-100 text-purple-700' },
                                { time: '2:00 PM', event: 'Client Meeting', type: 'bg-green-100 text-green-700' },
                                { time: '4:00 PM', event: 'Training Session', type: 'bg-orange-100 text-orange-700' },
                              ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-brown-50">
                                  <div className="text-left">
                                    <div className="font-medium text-sm">{item.event}</div>
                                    <div className="text-xs text-muted-foreground">{item.time}</div>
                                  </div>
                                  <Badge variant="outline" className={item.type}>
                                    Schedule
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Time-off Calendar */}
              <section id="time-off" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Time-off Calendar
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Dedicated calendar interface for managing employee time-off requests, vacation tracking, and PTO planning.
                    </p>
                  </div>

                  <PreviewCard>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Time-off Calendar</h3>
                        <div className="flex items-center gap-2">
                          <Select defaultValue="all">
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Types</SelectItem>
                              <SelectItem value="vacation">Vacation</SelectItem>
                              <SelectItem value="sick">Sick Leave</SelectItem>
                              <SelectItem value="personal">Personal</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="bg-brown-600 hover:bg-brown-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Request Time-off
                          </Button>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="themed-calendar w-full"
                          />
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium">Upcoming Requests</h4>
                          {timeOffRequests.map(request => (
                            <Card key={request.id} className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-sm">{request.employee}</h5>
                                  <Badge variant="outline" className={getStatusColor(request.status)}>
                                    {request.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {request.type} • {request.days} day{request.days > 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {request.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {request.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PreviewCard>

                  <CodeBlock
                    code={timeOffCalendarCode}
                    language="tsx"
                    title="Time-off Calendar Component"
                    id="time-off-calendar"
                    copiedCode={copiedCode}
                    onCopy={copyToClipboard}
                  />
                </div>
              </section>

              {/* Meeting Planner */}
              <section id="meeting-planner" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Meeting Planner
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Collaborative meeting scheduling interface with availability checking and room booking capabilities.
                    </p>
                  </div>

                  <PreviewCard title="Meeting Scheduler">
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Meeting Title</label>
                            <Input placeholder="Enter meeting title" className="mt-1" />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Date</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full justify-start text-left mt-1"
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {meetingDate ? meetingDate.toLocaleDateString() : "Select date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={meetingDate}
                                  onSelect={setMeetingDate}
                                  initialFocus
                                  className="themed-calendar"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Start Time</label>
                              <Input type="time" className="mt-1" />
                            </div>
                            <div>
                              <label className="text-sm font-medium">End Time</label>
                              <Input type="time" className="mt-1" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Attendees</label>
                            <div className="mt-1 space-y-2">
                              <Input placeholder="Add attendees..." />
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">Sarah Johnson</Badge>
                                <Badge variant="secondary">Mike Chen</Badge>
                                <Badge variant="secondary">Emily Davis</Badge>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Meeting Room</label>
                            <Select>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select a room" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="conference-a">Conference Room A</SelectItem>
                                <SelectItem value="conference-b">Conference Room B</SelectItem>
                                <SelectItem value="huddle-1">Huddle Room 1</SelectItem>
                                <SelectItem value="virtual">Virtual Meeting</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-brown-200">
                        <div className="text-sm text-muted-foreground">
                          3 of 3 attendees available
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline">Check Availability</Button>
                          <Button className="bg-brown-600 hover:bg-brown-700 text-white">
                            Schedule Meeting
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PreviewCard>
                </div>
              </section>

              {/* Calendar Settings */}
              <section id="calendar-settings" className="scroll-mt-28">
                <div className="space-y-8">
                  <div>
                    <h1 style={{ fontSize: 'var(--text-display-md)', fontWeight: 'var(--font-weight-medium)', lineHeight: 1.1 }}>
                      Calendar Settings
                    </h1>
                    <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>
                      Customizable calendar preferences and configuration options for personalized scheduling experiences.
                    </p>
                  </div>

                  <PreviewCard title="Calendar Preferences">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Show Weekends</h4>
                          <p className="text-sm text-muted-foreground">Display Saturday and Sunday in calendar views</p>
                        </div>
                        <Switch
                          checked={showWeekends}
                          onCheckedChange={setShowWeekends}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">24-Hour Format</h4>
                          <p className="text-sm text-muted-foreground">Use 24-hour time format instead of AM/PM</p>
                        </div>
                        <Switch />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-muted-foreground">Receive email reminders for upcoming events</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-medium">Default View</h4>
                        <Select defaultValue="month">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="month">Month View</SelectItem>
                            <SelectItem value="week">Week View</SelectItem>
                            <SelectItem value="day">Day View</SelectItem>
                            <SelectItem value="agenda">Agenda View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-medium">Start of Week</h4>
                        <Select defaultValue="monday">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sunday">Sunday</SelectItem>
                            <SelectItem value="monday">Monday</SelectItem>
                          </SelectContent>
                        </Select>
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
}