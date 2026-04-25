import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Separator } from './ui/separator';
import { 
  MoreHorizontal,
  MessageCircle,
  Heart,
  Share2,
  Clock,
  User,
  Building,
  FileText,
  CheckCircle2,
  AlertCircle,
  Menu,
  Calendar,
  Users,
  Settings,
  Bell,
  Activity,
  Briefcase,
  Award,
  UserPlus,
  TrendingUp,
  Shield,
  Mail
} from 'lucide-react';
import { MainSidebar } from './shared/MainSidebar';
import { PageHeader } from './shared/PageHeader';
import { CodeBlock } from './shared/CodeBlock';
import { createCopyHandler } from './shared/copyUtils';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';

interface ActivityFeedsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const ActivityFeedsPage: React.FC<ActivityFeedsPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [activeSection, setActiveSection] = useState('recent-activities');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // MainSidebar required state
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

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
      const sections = ['recent-activities', 'employee-updates', 'timeline-feed', 'notification-feed', 'system-events'];
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

  const recentActivities = [
    {
      user: { name: 'Sarah Chen', avatar: '', role: 'Senior Developer' },
      action: 'completed onboarding for',
      target: 'Marcus Johnson',
      time: '2 minutes ago',
      type: 'completion',
      details: 'All documentation submitted and approved'
    },
    {
      user: { name: 'David Rodriguez', avatar: '', role: 'HR Manager' },
      action: 'approved time-off request from',
      target: 'Emma Wilson',
      time: '15 minutes ago',
      type: 'approval',
      details: 'Vacation: Dec 20-30, 2024'
    },
    {
      user: { name: 'Lisa Park', avatar: '', role: 'Team Lead' },
      action: 'posted a new job opening:',
      target: 'Frontend Developer',
      time: '1 hour ago',
      type: 'announcement',
      details: 'Remote position, 3+ years experience required'
    }
  ];

  const employeeUpdates = [
    {
      user: { name: 'Alex Thompson', avatar: '', department: 'Engineering' },
      update: 'Successfully completed Q4 performance review with excellent ratings across all metrics.',
      time: '3 hours ago',
      metrics: ['Technical Skills: 4.8/5', 'Collaboration: 4.9/5', 'Leadership: 4.7/5'],
      reactions: { likes: 12, comments: 3 }
    },
    {
      user: { name: 'Jennifer Martinez', avatar: '', department: 'Marketing' },
      update: 'Achieved 150% of quarterly target for lead generation. Team celebration planned for Friday!',
      time: '5 hours ago',
      metrics: ['Q4 Target: 120%', 'Actual: 180%', 'Growth: +60%'],
      reactions: { likes: 24, comments: 8 }
    }
  ];

  const timelineEvents = [
    {
      date: 'Today',
      events: [
        {
          time: '10:30 AM',
          title: 'New Employee Orientation',
          description: '3 new hires joined the team',
          type: 'milestone',
          participants: ['John Doe', 'Jane Smith', 'Mike Brown']
        },
        {
          time: '2:15 PM',
          title: 'Performance Review Completed',
          description: 'Sarah Chen - Quarterly review',
          type: 'review',
          rating: 4.8
        }
      ]
    },
    {
      date: 'Yesterday',
      events: [
        {
          time: '11:00 AM',
          title: 'Team Building Event',
          description: 'Engineering team workshop completed',
          type: 'event',
          participants: ['15 team members']
        }
      ]
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'reminder',
      title: 'Annual Review Due',
      message: 'Your annual performance review is due in 3 days',
      time: '1 hour ago',
      priority: 'high',
      unread: true
    },
    {
      id: 2,
      type: 'approval',
      title: 'Time-off Approved',
      message: 'Your vacation request for next week has been approved',
      time: '2 hours ago',
      priority: 'medium',
      unread: true
    },
    {
      id: 3,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight from 2-4 AM EST',
      time: '4 hours ago',
      priority: 'low',
      unread: false
    }
  ];

  const systemEvents = [
    {
      timestamp: '2024-01-20 14:30:15',
      event: 'User Login',
      user: 'sarah.chen@company.com',
      details: 'Successful login from IP 192.168.1.100',
      status: 'success'
    },
    {
      timestamp: '2024-01-20 14:25:42',
      event: 'Policy Update',
      user: 'system',
      details: 'Employee handbook updated with new remote work guidelines',
      status: 'info'
    },
    {
      timestamp: '2024-01-20 14:20:18',
      event: 'Failed Login Attempt',
      user: 'unknown.user@company.com',
      details: 'Multiple failed login attempts detected',
      status: 'warning'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completion': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'approval': return <Shield className="w-5 h-5 text-blue-600" />;
      case 'announcement': return <Bell className="w-5 h-5 text-orange-600" />;
      case 'milestone': return <Award className="w-5 h-5 text-purple-600" />;
      case 'review': return <FileText className="w-5 h-5 text-brown-600" />;
      case 'event': return <Users className="w-5 h-5 text-indigo-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'approval': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'system': return <Settings className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleCopyCode = createCopyHandler(setCopiedCode);

  const sections = [
    { id: 'recent-activities', label: 'Recent Activities', icon: Activity },
    { id: 'employee-updates', label: 'Employee Updates', icon: Users },
    { id: 'timeline-feed', label: 'Timeline Feed', icon: Calendar },
    { id: 'notification-feed', label: 'Notification Feed', icon: Bell },
    { id: 'system-events', label: 'System Events', icon: Settings }
  ];

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
          title="Activity Feeds"
          description="Activity streams, employee updates, and notification feeds for HR dashboards and team collaboration"
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
            {/* Recent Activities */}
            <section id="recent-activities" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Recent Activities</h2>
                <p className="text-muted-foreground mb-6">
                  Live activity stream showing recent actions, completions, and updates across the HR system.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Activity Stream</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-brown-300 hover:bg-brown-50 text-brown-700 hover:text-brown-800"
                      onClick={() => alert('Filter functionality')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-brown-50/50 rounded-lg">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium text-brown-900">{activity.user.name}</span>
                                <span className="text-muted-foreground mx-1">{activity.action}</span>
                                <span className="font-medium text-brown-900">{activity.target}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-muted-foreground">{activity.time}</span>
                                <Badge variant="secondary" className="text-xs bg-brown-100 text-brown-700">
                                  {activity.user.role}
                                </Badge>
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-brown-500 hover:text-brown-700"
                              onClick={() => alert(`View details for: ${activity.user.name} - ${activity.action} ${activity.target}`)}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-brown-100">
                    <Button 
                      variant="outline" 
                      className="w-full border-brown-300 hover:bg-brown-50 text-brown-700 hover:text-brown-800"
                      onClick={() => alert('Load more activities')}
                    >
                      Load More Activities
                    </Button>
                  </div>
                </Card>

                <CodeBlock
                  title="Recent Activities Feed"
                  language="tsx"
                  id="recent-activities-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="space-y-4">
  {activities.map((activity, index) => (
    <div key={index} className="flex items-start gap-4 p-4 bg-brown-50/50 rounded-lg">
      <div className="flex-shrink-0">
        {getActivityIcon(activity.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium text-brown-900">{activity.user.name}</span>
              <span className="text-muted-foreground mx-1">{activity.action}</span>
              <span className="font-medium text-brown-900">{activity.target}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-muted-foreground">{activity.time}</span>
              <Badge variant="secondary" className="text-xs bg-brown-100 text-brown-700">
                {activity.user.role}
              </Badge>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(activity)}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  ))}
</div>`}
                />
              </div>
            </section>

            {/* Employee Updates */}
            <section id="employee-updates" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Employee Updates</h2>
                <p className="text-muted-foreground mb-6">
                  Social-style feed showcasing employee achievements, milestones, and team updates with engagement features.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="space-y-6">
                    {employeeUpdates.map((update, index) => (
                      <div key={index} className="space-y-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12 bg-brown-200 text-brown-600 flex items-center justify-center">
                            <User className="w-6 h-6" />
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{update.user.name}</h4>
                              <Badge variant="outline" className="text-xs border-brown-300 text-brown-600">
                                {update.user.department}
                              </Badge>
                              <span className="text-xs text-muted-foreground">• {update.time}</span>
                            </div>
                            
                            <p className="text-sm text-brown-900 mb-3">{update.update}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {update.metrics.map((metric, metricIndex) => (
                                <Badge key={metricIndex} className="bg-green-100 text-green-700 hover:bg-green-100">
                                  {metric}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-brown-600 hover:text-brown-800"
                                onClick={() => alert(`Liked ${update.user.name}'s update`)}
                              >
                                <Heart className="w-4 h-4 mr-2" />
                                {update.reactions.likes}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-brown-600 hover:text-brown-800"
                                onClick={() => alert(`View comments for ${update.user.name}'s update`)}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                {update.reactions.comments}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-brown-600 hover:text-brown-800"
                                onClick={() => alert(`Share ${update.user.name}'s update`)}
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {index < employeeUpdates.length - 1 && (
                          <Separator className="bg-brown-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <CodeBlock
                  title="Employee Updates Feed"
                  language="tsx"
                  id="employee-updates-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="space-y-6">
  {updates.map((update, index) => (
    <div key={index} className="space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 bg-brown-200 text-brown-600 flex items-center justify-center">
          <User className="w-6 h-6" />
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold">{update.user.name}</h4>
            <Badge variant="outline" className="text-xs border-brown-300 text-brown-600">
              {update.user.department}
            </Badge>
            <span className="text-xs text-muted-foreground">• {update.time}</span>
          </div>
          
          <p className="text-sm text-brown-900 mb-3">{update.update}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {update.metrics.map((metric, metricIndex) => (
              <Badge key={metricIndex} className="bg-green-100 text-green-700">
                {metric}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" onClick={() => handleLike(update.id)}>
              <Heart className="w-4 h-4 mr-2" />
              {update.reactions.likes}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleComment(update.id)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              {update.reactions.comments}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleShare(update.id)}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>`}
                />
              </div>
            </section>

            {/* Timeline Feed */}
            <section id="timeline-feed" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Timeline Feed</h2>
                <p className="text-muted-foreground mb-6">
                  Chronological timeline view for tracking daily events, milestones, and important activities.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="space-y-6">
                    {timelineEvents.map((day, dayIndex) => (
                      <div key={dayIndex}>
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="font-semibold text-brown-900">{day.date}</h3>
                          <div className="flex-1 h-px bg-brown-200"></div>
                        </div>
                        
                        <div className="space-y-4 ml-6">
                          {day.events.map((event, eventIndex) => (
                            <div key={eventIndex} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-2 h-2 bg-brown-600 rounded-full"></div>
                                {eventIndex < day.events.length - 1 && (
                                  <div className="w-px h-16 bg-brown-200 mt-2"></div>
                                )}
                              </div>
                              
                              <div className="flex-1 pb-6">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-sm font-medium text-brown-600">{event.time}</span>
                                  {getActivityIcon(event.type)}
                                </div>
                                
                                <h4 className="font-semibold mb-1">{event.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                
                                {event.participants && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-brown-500" />
                                    <span className="text-xs text-brown-600">
                                      {event.participants.join(', ')}
                                    </span>
                                  </div>
                                )}
                                
                                {event.rating && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <Award className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm font-medium text-orange-600">
                                      Rating: {event.rating}/5
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <CodeBlock
                  title="Timeline Feed"
                  language="tsx"
                  id="timeline-feed-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="space-y-6">
  {timelineEvents.map((day, dayIndex) => (
    <div key={dayIndex}>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-semibold text-brown-900">{day.date}</h3>
        <div className="flex-1 h-px bg-brown-200"></div>
      </div>
      
      <div className="space-y-4 ml-6">
        {day.events.map((event, eventIndex) => (
          <div key={eventIndex} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 bg-brown-600 rounded-full"></div>
              {eventIndex < day.events.length - 1 && (
                <div className="w-px h-16 bg-brown-200 mt-2"></div>
              )}
            </div>
            
            <div className="flex-1 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium text-brown-600">{event.time}</span>
                {getActivityIcon(event.type)}
              </div>
              
              <h4 className="font-semibold mb-1">{event.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
              
              {event.participants && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brown-500" />
                  <span className="text-xs text-brown-600">
                    {event.participants.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>`}
                />
              </div>
            </section>

            {/* Notification Feed */}
            <section id="notification-feed" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Notification Feed</h2>
                <p className="text-muted-foreground mb-6">
                  Structured notification center for important alerts, reminders, and system updates with priority indicators.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Notifications</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-brown-300 hover:bg-brown-50 text-brown-700 hover:text-brown-800"
                      onClick={() => alert('Marked all notifications as read')}
                    >
                      Mark All Read
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                          notification.unread
                            ? 'bg-brown-50 border-brown-200'
                            : 'bg-white border-brown-100'
                        }`}
                        onClick={() => alert(`Opened notification: ${notification.title}`)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-brown-600 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{notification.message}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                                  <Badge 
                                    className={`text-xs ${
                                      notification.priority === 'high' 
                                        ? 'bg-red-100 text-red-700'
                                        : notification.priority === 'medium'
                                          ? 'bg-orange-100 text-orange-700'
                                          : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {notification.priority}
                                  </Badge>
                                </div>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-brown-500 hover:text-brown-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Options for: ${notification.title}`);
                                }}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <CodeBlock
                  title="Notification Feed"
                  language="tsx"
                  id="notification-feed-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="space-y-3">
  {notifications.map((notification) => (
    <div
      key={notification.id}
      className={\`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm \${
        notification.unread
          ? 'bg-brown-50 border-brown-200'
          : 'bg-white border-brown-100'
      }\`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                {notification.unread && (
                  <div className="w-2 h-2 bg-brown-600 rounded-full"></div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground">{notification.time}</span>
                <Badge className={\`text-xs \${getPriorityClass(notification.priority)}\`}>
                  {notification.priority}
                </Badge>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={(e) => handleOptions(e, notification)}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>`}
                />
              </div>
            </section>

            {/* System Events */}
            <section id="system-events" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">System Events</h2>
                <p className="text-muted-foreground mb-6">
                  Audit log view displaying system activities, security events, and administrative actions for compliance and monitoring.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">System Activity Log</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-brown-300 hover:bg-brown-50 text-brown-700 hover:text-brown-800"
                        onClick={() => alert('Export functionality')}
                      >
                        Export
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-brown-300 hover:bg-brown-50 text-brown-700 hover:text-brown-800"
                        onClick={() => alert('Filter functionality')}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {systemEvents.map((event, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 items-center p-3 bg-brown-50/30 rounded-lg hover:bg-brown-50/50 transition-colors">
                        <div className="col-span-1">
                          <Badge 
                            className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(event.status)}`}
                          >
                            {event.status}
                          </Badge>
                        </div>
                        
                        <div className="col-span-2 text-xs text-muted-foreground font-mono">
                          {event.timestamp}
                        </div>
                        
                        <div className="col-span-2 font-medium text-sm">
                          {event.event}
                        </div>
                        
                        <div className="col-span-2 text-sm text-muted-foreground truncate">
                          {event.user}
                        </div>
                        
                        <div className="col-span-4 text-sm text-muted-foreground truncate">
                          {event.details}
                        </div>
                        
                        <div className="col-span-1 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-brown-500 hover:text-brown-700"
                            onClick={() => alert(`View details for: ${event.event}`)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-brown-100 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Showing 3 of 247 events</span>
                    <Button 
                      variant="outline" 
                      className="border-brown-300 hover:bg-brown-50 text-brown-700 hover:text-brown-800"
                      onClick={() => alert('Load more events')}
                    >
                      Load More
                    </Button>
                  </div>
                </Card>

                <CodeBlock
                  title="System Events Log"
                  language="tsx"
                  id="system-events-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="space-y-3">
  {systemEvents.map((event, index) => (
    <div key={index} className="grid grid-cols-12 gap-4 items-center p-3 bg-brown-50/30 rounded-lg hover:bg-brown-50/50 transition-colors">
      <div className="col-span-1">
        <Badge className={\`px-2 py-1 text-xs font-medium rounded \${getStatusColor(event.status)}\`}>
          {event.status}
        </Badge>
      </div>
      
      <div className="col-span-2 text-xs text-muted-foreground font-mono">
        {event.timestamp}
      </div>
      
      <div className="col-span-2 font-medium text-sm">
        {event.event}
      </div>
      
      <div className="col-span-2 text-sm text-muted-foreground truncate">
        {event.user}
      </div>
      
      <div className="col-span-4 text-sm text-muted-foreground truncate">
        {event.details}
      </div>
      
      <div className="col-span-1 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(event)}>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  ))}
</div>`}
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};