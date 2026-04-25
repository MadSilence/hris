import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  MoreHorizontal,
  Search,
  Plus,
  Pin,
  Star,
  Clock,
  Check,
  CheckCheck,
  Smile,
  Paperclip,
  Users,
  Bell,
  Circle,
  Menu,
  Archive,
  Trash2,
  Reply,
  Forward,
  Edit,
  X
} from 'lucide-react';
import { MainSidebar } from './shared/MainSidebar';
import { PageHeader } from './shared/PageHeader';
import { CodeBlock } from './shared/CodeBlock';
import { createCopyHandler } from './shared/copyUtils';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';

interface MessagingPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const MessagingPage: React.FC<MessagingPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [activeSection, setActiveSection] = useState('chat-interface');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(0);
  
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
      const sections = ['chat-interface', 'conversation-list', 'message-thread', 'notification-center', 'inbox-view', 'team-chat', 'message-composer', 'chat-settings', 'message-actions'];
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

  const conversations = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "HR Director",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
      lastMessage: "Thanks for the performance review updates!",
      time: "2m ago",
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Talent Acquisition",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      lastMessage: "Can we schedule the interview for tomorrow?",
      time: "15m ago",
      unread: 0,
      online: true
    },
    {
      id: 3,
      name: "HR Team",
      role: "Team Chat",
      avatar: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=80&h=80&fit=crop&crop=face",
      lastMessage: "Team meeting notes are ready",
      time: "1h ago",
      unread: 5,
      online: false,
      isGroup: true
    },
    {
      id: 4,
      name: "Jennifer Adams",
      role: "Chief People Officer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      lastMessage: "Great work on the employee survey!",
      time: "3h ago",
      unread: 0,
      online: false
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "Sarah Chen",
      content: "Hi! I wanted to follow up on the performance review process for Q4.",
      time: "10:30 AM",
      isOwn: false,
      status: "read"
    },
    {
      id: 2,
      sender: "You",
      content: "Absolutely! I've compiled all the reviews and they're ready for your review.",
      time: "10:32 AM",
      isOwn: true,
      status: "read"
    },
    {
      id: 3,
      sender: "You",
      content: "Should we schedule a meeting to discuss the findings?",
      time: "10:32 AM",
      isOwn: true,
      status: "delivered"
    },
    {
      id: 4,
      sender: "Sarah Chen",
      content: "That would be perfect. How about tomorrow at 2 PM?",
      time: "10:35 AM",
      isOwn: false,
      status: "read"
    }
  ];

  const notifications = [
    {
      id: 1,
      type: "message",
      title: "New message from Sarah Chen",
      description: "Thanks for the performance review updates!",
      time: "2 minutes ago",
      read: false
    },
    {
      id: 2,
      type: "mention",
      title: "You were mentioned in HR Team",
      description: "@you Can you review the policy updates?",
      time: "15 minutes ago",
      read: false
    },
    {
      id: 3,
      type: "system",
      title: "System Update",
      description: "Messaging system will be updated tonight",
      time: "1 hour ago",
      read: true
    }
  ];

  const handleCopyCode = createCopyHandler(setCopiedCode);

  const sections = [
    { id: 'chat-interface', label: 'Chat Interface', icon: MessageCircle },
    { id: 'conversation-list', label: 'Conversation List', icon: Users },
    { id: 'message-thread', label: 'Message Thread', icon: MessageCircle },
    { id: 'notification-center', label: 'Notification Center', icon: Bell },
    { id: 'inbox-view', label: 'Inbox View', icon: Archive },
    { id: 'team-chat', label: 'Team Chat', icon: Users },
    { id: 'message-composer', label: 'Message Composer', icon: Edit },
    { id: 'chat-settings', label: 'Chat Settings', icon: MoreHorizontal },
    { id: 'message-actions', label: 'Message Actions', icon: Reply }
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
          title="Messaging"
          description="Comprehensive messaging components for HR communication, team collaboration, and internal notifications"
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
            {/* Chat Interface */}
            <section id="chat-interface" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Chat Interface</h2>
                <p className="text-muted-foreground mb-6">
                  Complete chat interface with conversation sidebar, message thread, and user interactions for HR communication.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="h-96 border-brown-200 overflow-hidden">
                  <div className="flex h-full">
                    {/* Conversation Sidebar */}
                    <div className="w-80 border-r border-brown-200 bg-brown-50/50">
                      <div className="p-4 border-b border-brown-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
                          <Input
                            placeholder="Search conversations..."
                            className="pl-10 bg-white border-brown-200"
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto h-full">
                        {conversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            onClick={() => setSelectedChat(conversation.id)}
                            className={`p-4 border-b border-brown-100 cursor-pointer hover:bg-brown-100/50 ${
                              selectedChat === conversation.id ? 'bg-brown-100' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={conversation.avatar} />
                                  <AvatarFallback>{conversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {conversation.online && (
                                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm truncate">{conversation.name}</h4>
                                  <span className="text-xs text-muted-foreground">{conversation.time}</span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                              </div>
                              {conversation.unread > 0 && (
                                <Badge className="bg-brown-600 hover:bg-brown-700 text-xs">
                                  {conversation.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message Thread */}
                    <div className="flex-1 flex flex-col">
                      {/* Chat Header */}
                      <div className="p-4 border-b border-brown-200 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={conversations[selectedChat - 1]?.avatar} />
                              <AvatarFallback>{conversations[selectedChat - 1]?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-sm">{conversations[selectedChat - 1]?.name}</h3>
                              <p className="text-xs text-muted-foreground">{conversations[selectedChat - 1]?.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Video className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 p-4 overflow-y-auto bg-brown-50/30">
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-xs ${message.isOwn ? 'order-2' : 'order-1'}`}>
                                <div
                                  className={`p-3 rounded-lg ${
                                    message.isOwn
                                      ? 'bg-brown-600 text-white'
                                      : 'bg-white border border-brown-200'
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                                  message.isOwn ? 'justify-end' : 'justify-start'
                                }`}>
                                  <span>{message.time}</span>
                                  {message.isOwn && (
                                    <div className="flex items-center">
                                      {message.status === 'delivered' ? (
                                        <Check className="w-3 h-3" />
                                      ) : (
                                        <CheckCheck className="w-3 h-3" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t border-brown-200 bg-white">
                        <div className="flex items-end gap-3">
                          <Button variant="ghost" size="sm">
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <div className="flex-1">
                            <Input
                              placeholder="Type a message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              className="border-brown-200"
                            />
                          </div>
                          <Button variant="ghost" size="sm">
                            <Smile className="w-4 h-4" />
                          </Button>
                          <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <CodeBlock
                  title="Chat Interface"
                  language="tsx"
                  id="chat-interface-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Card className="h-96 overflow-hidden">
  <div className="flex h-full">
    {/* Conversation Sidebar */}
    <div className="w-80 border-r bg-brown-50/50">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
          <Input placeholder="Search conversations..." className="pl-10" />
        </div>
      </div>
      <div className="overflow-y-auto">
        {conversations.map((conversation) => (
          <div key={conversation.id} className="p-4 border-b cursor-pointer hover:bg-brown-100/50">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={conversation.avatar} />
                <AvatarFallback>{conversation.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{conversation.name}</h4>
                <p className="text-sm text-muted-foreground">{conversation.lastMessage}</p>
              </div>
              {conversation.unread > 0 && (
                <Badge>{conversation.unread}</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Message Thread */}
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={activeChat.avatar} />
            </Avatar>
            <div>
              <h3 className="font-medium">{activeChat.name}</h3>
              <p className="text-xs text-muted-foreground">{activeChat.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm"><Phone className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm"><Video className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={\`flex \${message.isOwn ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`max-w-xs p-3 rounded-lg \${
              message.isOwn ? 'bg-brown-600 text-white' : 'bg-white border'
            }\`}>
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-end gap-3">
          <Button variant="ghost" size="sm"><Paperclip className="w-4 h-4" /></Button>
          <Input placeholder="Type a message..." className="flex-1" />
          <Button size="sm"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  </div>
</Card>`}
                />
              </div>
            </section>

            {/* Continue with remaining sections... */}
          </main>
        </div>
      </div>
    </div>
  );
};