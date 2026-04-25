import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
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
  const [selectedChat, setSelectedChat] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // MainSidebar required state
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Message actions state
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
  const [starredMessages, setStarredMessages] = useState<Set<number>>(new Set());
  const [inboxFilters, setInboxFilters] = useState({
    selectAll: false,
    showUnread: false,
    showStarred: false
  });

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    desktop: true,
    sound: true,
    email: false
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    readReceipts: true,
    onlineStatus: true,
    typingIndicators: true
  });

  const { inputRef: sidebarInputRef, handleKeyDown: handleSidebarKeyDown } = useInputKeyboardShortcuts({
    value: sidebarSearchTerm,
    onChange: setSidebarSearchTerm,
    enableGlobalShortcuts: false,
  });

  // Enhanced keyboard shortcuts for search input
  const searchInputRef = useRef<HTMLInputElement>(null);
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl/Cmd + A: Select all
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault();
      if (searchInputRef.current) {
        searchInputRef.current.select();
      }
      return;
    }

    // Ctrl/Cmd + C: Copy selected text
    if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
      // Let browser handle default copy behavior
      return;
    }

    // Ctrl/Cmd + V: Paste from clipboard
    if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
      // Let browser handle default paste behavior
      return;
    }

    // Ctrl/Cmd + X: Cut selected text
    if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
      // Let browser handle default cut behavior
      return;
    }

    // Escape: Clear search and blur
    if (e.key === 'Escape') {
      setSearchTerm('');
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
      return;
    }

    // Enter: Focus first conversation result (if any)
    if (e.key === 'Enter') {
      e.preventDefault();
      // Could add logic to focus first filtered conversation
      return;
    }
  };

  // Enhanced keyboard shortcuts for message input
  const messageInputRef = useRef<HTMLInputElement>(null);
  const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Ctrl/Cmd + A: Select all
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault();
      if (messageInputRef.current) {
        messageInputRef.current.select();
      }
      return;
    }

    // Ctrl/Cmd + C: Copy selected text
    if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
      // Let browser handle default copy behavior
      return;
    }

    // Ctrl/Cmd + V: Paste from clipboard
    if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
      // Let browser handle default paste behavior
      return;
    }

    // Ctrl/Cmd + X: Cut selected text
    if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
      // Let browser handle default cut behavior
      return;
    }

    // Enter: Send message (if not empty)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        // Add logic to send message
        console.log('Sending message:', newMessage);
        setNewMessage('');
      }
      return;
    }

    // Shift + Enter: Add new line (default behavior)
    if (e.key === 'Enter' && e.shiftKey) {
      // Let browser handle default behavior for multiline
      return;
    }

    // Escape: Clear message
    if (e.key === 'Escape') {
      setNewMessage('');
      return;
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

  // Message action handlers
  const handleReply = (messageId: number) => {
    console.log(`Replying to message ${messageId}`);
    // Add reply functionality
  };

  const handleForward = (messageId: number) => {
    console.log(`Forwarding message ${messageId}`);
    // Add forward functionality
  };

  const handleToggleStar = (messageId: number) => {
    setStarredMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleSelectMessage = (messageId: number) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (inboxFilters.selectAll) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(conversations.map(c => c.id)));
    }
    setInboxFilters(prev => ({ ...prev, selectAll: !prev.selectAll }));
  };

  const handleArchiveSelected = () => {
    console.log(`Archiving messages: ${Array.from(selectedMessages)}`);
    setSelectedMessages(new Set());
    setInboxFilters(prev => ({ ...prev, selectAll: false }));
  };

  const handleDeleteSelected = () => {
    console.log(`Deleting messages: ${Array.from(selectedMessages)}`);
    setSelectedMessages(new Set());
    setInboxFilters(prev => ({ ...prev, selectAll: false }));
  };

  // Filter conversations based on search term
  const filteredConversations = React.useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    
    return conversations.filter(conversation =>
      conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
                    <div className="w-80 border-r border-brown-200 bg-brown-50/50">
                      <div className="p-4 border-b border-brown-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
                          <Input
                            ref={searchInputRef}
                            placeholder="Search conversations..."
                            className="pl-10 bg-white border-brown-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                          />
                        </div>
                      </div>
                      <div className="overflow-y-auto h-full">
                        {filteredConversations.map((conversation) => (
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

                    <div className="flex-1 flex flex-col">
                      <div className="p-4 border-b border-brown-200 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={conversations.find(c => c.id === selectedChat)?.avatar} />
                              <AvatarFallback>{conversations.find(c => c.id === selectedChat)?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-sm">{conversations.find(c => c.id === selectedChat)?.name}</h3>
                              <p className="text-xs text-muted-foreground">{conversations.find(c => c.id === selectedChat)?.role}</p>
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

                      <div className="p-4 border-t border-brown-200 bg-white">
                        <div className="flex items-end gap-3">
                          <Button variant="ghost" size="sm">
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <div className="flex-1">
                            <Input
                              ref={messageInputRef}
                              placeholder="Type a message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={handleMessageKeyDown}
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
                  code={`// Chat interface with enhanced keyboard shortcuts
const [searchTerm, setSearchTerm] = useState('');
const [newMessage, setNewMessage] = useState('');
const searchInputRef = useRef<HTMLInputElement>(null);
const messageInputRef = useRef<HTMLInputElement>(null);

// Enhanced keyboard shortcuts for search input
const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Ctrl/Cmd + A: Select all text
  if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
    e.preventDefault();
    if (searchInputRef.current) {
      searchInputRef.current.select();
    }
    return;
  }
  
  // Escape: Clear search and blur
  if (e.key === 'Escape') {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    return;
  }
  
  // Enter: Focus first conversation result
  if (e.key === 'Enter') {
    e.preventDefault();
    // Focus first filtered conversation
    return;
  }
};

// Enhanced keyboard shortcuts for message input
const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Ctrl/Cmd + A: Select all text
  if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
    e.preventDefault();
    if (messageInputRef.current) {
      messageInputRef.current.select();
    }
    return;
  }
  
  // Enter: Send message (if not empty)
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
    return;
  }
  
  // Escape: Clear message
  if (e.key === 'Escape') {
    setNewMessage('');
    return;
  }
};

<Card className="h-96 overflow-hidden">
  <div className="flex h-full">
    <div className="w-80 border-r bg-brown-50/50">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
          <Input 
            ref={searchInputRef}
            placeholder="Search conversations..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
      </div>
      <div className="overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <div key={conversation.id} className="p-4 border-b cursor-pointer">
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
          <Input 
            ref={messageInputRef}
            placeholder="Type a message..." 
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleMessageKeyDown}
          />
          <Button size="sm"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  </div>
</Card>

// Keyboard shortcuts supported:
// - Ctrl/Cmd + A: Select all text in input
// - Ctrl/Cmd + C: Copy selected text (native browser)
// - Ctrl/Cmd + V: Paste from clipboard (native browser)  
// - Ctrl/Cmd + X: Cut selected text (native browser)
// - Enter: Send message (message input) or focus first result (search)
// - Escape: Clear input and blur focus`}
                />
              </div>
            </section>

            {/* Conversation List */}
            <section id="conversation-list" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Conversation List</h2>
                <p className="text-muted-foreground mb-6">
                  Standalone conversation list component for managing and navigating through multiple conversations.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Recent Conversations</h3>
                      <Button variant="ghost" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {conversations.slice(0, 3).map((conversation) => (
                      <div key={conversation.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-brown-50 cursor-pointer">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.avatar} />
                            <AvatarFallback>{conversation.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {conversation.online && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{conversation.name}</h4>
                            <span className="text-xs text-muted-foreground">{conversation.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                          <p className="text-xs text-muted-foreground">{conversation.role}</p>
                        </div>
                        {conversation.unread > 0 && (
                          <Badge className="bg-brown-600 hover:bg-brown-700 text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <CodeBlock
                  title="Conversation List"
                  language="tsx"
                  id="conversation-list-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Card className="p-6">
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-medium">Recent Conversations</h3>
      <Button variant="ghost" size="sm">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
    
    {conversations.map((conversation) => (
      <div key={conversation.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-brown-50 cursor-pointer">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <AvatarImage src={conversation.avatar} />
            <AvatarFallback>{conversation.initials}</AvatarFallback>
          </Avatar>
          {conversation.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-sm">{conversation.name}</h4>
            <span className="text-xs text-muted-foreground">{conversation.time}</span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
          <p className="text-xs text-muted-foreground">{conversation.role}</p>
        </div>
        {conversation.unread > 0 && (
          <Badge className="bg-brown-600 text-xs">{conversation.unread}</Badge>
        )}
      </div>
    ))}
  </div>
</Card>`}
                />
              </div>
            </section>

            {/* Message Thread */}
            <section id="message-thread" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Message Thread</h2>
                <p className="text-muted-foreground mb-6">
                  Focused message thread display with timestamp grouping and message status indicators.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-brown-200">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">Sarah Chen</h3>
                        <p className="text-sm text-muted-foreground">HR Director • Active 5m ago</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground bg-brown-50 px-3 py-1 rounded-full">Today</span>
                      </div>
                      
                      {messages.map((message, index) => (
                        <div key={message.id} className={`flex gap-3 ${message.isOwn ? 'justify-end' : 'justify-start'}`}>
                          {!message.isOwn && (
                            <Avatar className="w-8 h-8 mt-1">
                              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" />
                              <AvatarFallback>SC</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-sm ${message.isOwn ? '' : 'flex-1'}`}>
                            <div className={`p-3 rounded-lg ${message.isOwn 
                              ? 'bg-brown-600 text-white rounded-br-sm' 
                              : 'bg-white border border-brown-200 rounded-bl-sm'}`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                              message.isOwn ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{message.time}</span>
                              {message.isOwn && (
                                <div className="flex items-center ml-2">
                                  {message.status === 'delivered' ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <CodeBlock
                  title="Message Thread"
                  language="tsx"
                  id="message-thread-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Card className="p-6">
  <div className="space-y-6">
    <div className="flex items-center gap-3 pb-4 border-b">
      <Avatar className="w-10 h-10">
        <AvatarImage src={conversation.avatar} />
        <AvatarFallback>{conversation.initials}</AvatarFallback>
      </Avatar>
      <div>
        <h3 className="font-medium">{conversation.name}</h3>
        <p className="text-sm text-muted-foreground">{conversation.role} • Active {conversation.lastSeen}</p>
      </div>
    </div>

    <div className="space-y-4">
      <div className="text-center">
        <span className="text-xs text-muted-foreground bg-brown-50 px-3 py-1 rounded-full">Today</span>
      </div>
      
      {messages.map((message) => (
        <div key={message.id} className={\`flex gap-3 \${message.isOwn ? 'justify-end' : 'justify-start'}\`}>
          {!message.isOwn && (
            <Avatar className="w-8 h-8 mt-1">
              <AvatarImage src={message.avatar} />
              <AvatarFallback>{message.initials}</AvatarFallback>
            </Avatar>
          )}
          <div className={\`max-w-sm \${message.isOwn ? '' : 'flex-1'}\`}>
            <div className={\`p-3 rounded-lg \${message.isOwn 
              ? 'bg-brown-600 text-white rounded-br-sm' 
              : 'bg-white border border-brown-200 rounded-bl-sm'}\`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
            <div className={\`flex items-center gap-1 mt-1 text-xs text-muted-foreground \${
              message.isOwn ? 'justify-end' : 'justify-start'
            }\`}>
              <span>{message.time}</span>
              {message.isOwn && (
                <div className="flex items-center ml-2">
                  {message.status === 'delivered' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</Card>`}
                />
              </div>
            </section>

            {/* Notification Center */}
            <section id="notification-center" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Notification Center</h2>
                <p className="text-muted-foreground mb-6">
                  Centralized notification system for messages, mentions, and system updates.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Notifications</h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Mark all read</Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`flex items-start gap-3 p-3 rounded-lg ${
                        notification.read ? 'bg-transparent' : 'bg-brown-50'
                      }`}>
                        <div className="mt-1">
                          {notification.type === 'message' && <MessageCircle className="w-5 h-5 text-blue-600" />}
                          {notification.type === 'mention' && <Bell className="w-5 h-5 text-orange-600" />}
                          {notification.type === 'system' && <Circle className="w-5 h-5 text-brown-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">{notification.description}</p>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-brown-600 rounded-full mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                <CodeBlock
                  title="Notification Center"
                  language="tsx"
                  id="notification-center-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Card className="p-6">
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-medium">Notifications</h3>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">Mark all read</Button>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
    
    {notifications.map((notification) => (
      <div key={notification.id} className={\`flex items-start gap-3 p-3 rounded-lg \${
        notification.read ? 'bg-transparent' : 'bg-brown-50'
      }\`}>
        <div className="mt-1">
          {notification.type === 'message' && <MessageCircle className="w-5 h-5 text-blue-600" />}
          {notification.type === 'mention' && <Bell className="w-5 h-5 text-orange-600" />}
          {notification.type === 'system' && <Circle className="w-5 h-5 text-brown-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <p className="text-sm text-muted-foreground">{notification.description}</p>
          <span className="text-xs text-muted-foreground">{notification.time}</span>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-brown-600 rounded-full mt-2" />
        )}
      </div>
    ))}
  </div>
</Card>`}
                />
              </div>
            </section>

            {/* Inbox View */}
            <section id="inbox-view" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Inbox View</h2>
                <p className="text-muted-foreground mb-6">
                  Email-style inbox interface for managing messages with filters, search, and bulk actions.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="border-brown-200">
                  <div className="p-4 border-b border-brown-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={inboxFilters.selectAll}
                          onCheckedChange={handleSelectAll}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleArchiveSelected}
                          disabled={selectedMessages.size === 0}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleDeleteSelected}
                          disabled={selectedMessages.size === 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <div className="relative max-w-md">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
                          <Input placeholder="Search inbox..." className="pl-10" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge 
                          variant={!inboxFilters.showUnread && !inboxFilters.showStarred ? "secondary" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInboxFilters(prev => ({ ...prev, showUnread: false, showStarred: false }))}
                        >
                          All
                        </Badge>
                        <Badge 
                          variant={inboxFilters.showUnread ? "secondary" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInboxFilters(prev => ({ ...prev, showUnread: !prev.showUnread, showStarred: false }))}
                        >
                          Unread
                        </Badge>
                        <Badge 
                          variant={inboxFilters.showStarred ? "secondary" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setInboxFilters(prev => ({ ...prev, showStarred: !prev.showStarred, showUnread: false }))}
                        >
                          Starred
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-brown-200">
                    {conversations.map((conversation) => (
                      <div key={conversation.id} className="p-4 hover:bg-brown-50 cursor-pointer">
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            className="mt-1"
                            checked={selectedMessages.has(conversation.id)}
                            onCheckedChange={() => handleSelectMessage(conversation.id)}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 mt-0.5"
                            onClick={() => handleToggleStar(conversation.id)}
                          >
                            <Star 
                              className={`w-4 h-4 ${starredMessages.has(conversation.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} 
                            />
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium text-sm ${conversation.unread > 0 ? 'font-bold' : ''}`}>
                                {conversation.name}
                              </span>
                              <span className="text-xs text-muted-foreground">{conversation.time}</span>
                            </div>
                            <p className={`text-sm ${conversation.unread > 0 ? 'font-medium' : 'text-muted-foreground'}`}>
                              {conversation.lastMessage}
                            </p>
                          </div>
                          {conversation.unread > 0 && (
                            <div className="w-2 h-2 bg-brown-600 rounded-full mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <CodeBlock
                  title="Inbox View"
                  language="tsx"
                  id="inbox-view-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Card>
  <div className="p-4 border-b">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Checkbox />
        <Button variant="ghost" size="sm">
          <Archive className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-4 h-4" />
          <Input placeholder="Search inbox..." className="pl-10" />
        </div>
      </div>
      <div className="flex gap-2">
        <Badge variant="secondary">All</Badge>
        <Badge variant="outline">Unread</Badge>
        <Badge variant="outline">Starred</Badge>
      </div>
    </div>
  </div>
  
  <div className="divide-y">
    {messages.map((message) => (
      <div key={message.id} className="p-4 hover:bg-brown-50 cursor-pointer">
        <div className="flex items-start gap-3">
          <Checkbox className="mt-1" />
          <Button variant="ghost" size="sm" className="p-1 mt-0.5">
            <Star className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={\`font-medium text-sm \${message.unread ? 'font-bold' : ''}\`}>
                {message.sender}
              </span>
              <span className="text-xs text-muted-foreground">{message.time}</span>
            </div>
            <p className={\`text-sm \${message.unread ? 'font-medium' : 'text-muted-foreground'}\`}>
              {message.content}
            </p>
          </div>
          {message.unread && (
            <div className="w-2 h-2 bg-brown-600 rounded-full mt-2" />
          )}
        </div>
      </div>
    ))}
  </div>
</Card>`}
                />
              </div>
            </section>

            {/* Team Chat */}
            <section id="team-chat" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Team Chat</h2>
                <p className="text-muted-foreground mb-6">
                  Group messaging interface with member management, channels, and collaborative features.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brown-600 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">HR Team</h3>
                          <p className="text-sm text-muted-foreground">8 members</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" />
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Sarah Chen</span>
                        <span className="text-xs text-muted-foreground">2:30 PM</span>
                      </div>
                      <div className="bg-white border border-brown-200 rounded-lg p-3 ml-8">
                        <p className="text-sm">Team, let's discuss the new onboarding process changes for next quarter.</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" />
                          <AvatarFallback>MR</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Marcus Rodriguez</span>
                        <span className="text-xs text-muted-foreground">2:35 PM</span>
                      </div>
                      <div className="bg-white border border-brown-200 rounded-lg p-3 ml-8">
                        <p className="text-sm">Great idea! I've been working on some improvements to the candidate experience.</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" />
                          <AvatarFallback>JA</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">Jennifer Adams</span>
                        <span className="text-xs text-muted-foreground">2:40 PM</span>
                      </div>
                      <div className="bg-white border border-brown-200 rounded-lg p-3 ml-8">
                        <p className="text-sm">Let's schedule a meeting to align on this. I'll send out calendar invites.</p>
                      </div>
                    </div>

                    <div className="border-t border-brown-200 pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" />
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input placeholder="Message #hr-team..." className="border-brown-200" />
                        </div>
                        <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                <CodeBlock
                  title="Team Chat"
                  language="tsx"
                  id="team-chat-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Card className="p-6">
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-brown-600 rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-medium">{channel.name}</h3>
          <p className="text-sm text-muted-foreground">{channel.memberCount} members</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          <Users className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>

    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id}>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={message.avatar} />
              <AvatarFallback>{message.initials}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{message.sender}</span>
            <span className="text-xs text-muted-foreground">{message.time}</span>
          </div>
          <div className="bg-white border border-brown-200 rounded-lg p-3 ml-8">
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="border-t pt-4">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={currentUser.avatar} />
          <AvatarFallback>{currentUser.initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Input placeholder={\`Message #\${channel.name}...\`} />
        </div>
        <Button size="sm">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</Card>`}
                />
              </div>
            </section>

            {/* Message Composer */}
            <section id="message-composer" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Message Composer</h2>
                <p className="text-muted-foreground mb-6">
                  Rich message composition interface with attachments, formatting, and recipient selection.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-16">To:</span>
                        <div className="flex-1">
                          <Input placeholder="Enter recipient..." className="border-brown-200" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-16">Subject:</span>
                        <div className="flex-1">
                          <Input placeholder="Message subject..." className="border-brown-200" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-brown-200">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Smile className="w-4 h-4" />
                        </Button>
                        <div className="ml-auto">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Textarea 
                        placeholder="Type your message..." 
                        className="min-h-32 border-brown-200" 
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Paperclip className="w-4 h-4" />
                            <span className="ml-1">Attach files</span>
                          </Button>
                          <span className="text-xs text-muted-foreground">or drag and drop</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Save Draft</Button>
                          <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <CodeBlock
                  title="Message Composer"
                  language="tsx"
                  id="message-composer-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Card className="p-6">
  <div className="space-y-4">
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-16">To:</span>
        <div className="flex-1">
          <Input placeholder="Enter recipient..." />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-16">Subject:</span>
        <div className="flex-1">
          <Input placeholder="Message subject..." />
        </div>
      </div>
    </div>

    <Separator />

    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Paperclip className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Smile className="w-4 h-4" />
        </Button>
        <div className="ml-auto">
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <Textarea 
        placeholder="Type your message..." 
        className="min-h-32" 
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="w-4 h-4" />
            <span className="ml-1">Attach files</span>
          </Button>
          <span className="text-xs text-muted-foreground">or drag and drop</span>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Save Draft</Button>
          <Button size="sm">
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>
    </div>
  </div>
</Card>`}
                />
              </div>
            </section>

            {/* Chat Settings */}
            <section id="chat-settings" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Chat Settings</h2>
                <p className="text-muted-foreground mb-6">
                  Configuration panel for chat preferences, notifications, and privacy settings.
                </p>
              </div>

              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="p-6 border-brown-200">
                    <h3 className="font-medium mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Desktop notifications</p>
                          <p className="text-xs text-muted-foreground">Show notifications on desktop</p>
                        </div>
                        <Checkbox 
                          checked={notificationSettings.desktop}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, desktop: checked as boolean }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Sound alerts</p>
                          <p className="text-xs text-muted-foreground">Play sound for new messages</p>
                        </div>
                        <Checkbox 
                          checked={notificationSettings.sound}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, sound: checked as boolean }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Email notifications</p>
                          <p className="text-xs text-muted-foreground">Send email for missed messages</p>
                        </div>
                        <Checkbox 
                          checked={notificationSettings.email}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, email: checked as boolean }))
                          }
                        />
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-brown-200">
                    <h3 className="font-medium mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Read receipts</p>
                          <p className="text-xs text-muted-foreground">Let others see when you've read messages</p>
                        </div>
                        <Checkbox 
                          checked={privacySettings.readReceipts}
                          onCheckedChange={(checked) => 
                            setPrivacySettings(prev => ({ ...prev, readReceipts: checked as boolean }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Online status</p>
                          <p className="text-xs text-muted-foreground">Show when you're active</p>
                        </div>
                        <Checkbox 
                          checked={privacySettings.onlineStatus}
                          onCheckedChange={(checked) => 
                            setPrivacySettings(prev => ({ ...prev, onlineStatus: checked as boolean }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Typing indicators</p>
                          <p className="text-xs text-muted-foreground">Show when you're typing</p>
                        </div>
                        <Checkbox 
                          checked={privacySettings.typingIndicators}
                          onCheckedChange={(checked) => 
                            setPrivacySettings(prev => ({ ...prev, typingIndicators: checked as boolean }))
                          }
                        />
                      </div>
                    </div>
                  </Card>
                </div>

                <CodeBlock
                  title="Chat Settings"
                  language="tsx"
                  id="chat-settings-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<div className="grid gap-6 md:grid-cols-2">
  <Card className="p-6">
    <h3 className="font-medium mb-4">Notification Settings</h3>
    <div className="space-y-4">
      {notificationSettings.map((setting) => (
        <div key={setting.id} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{setting.title}</p>
            <p className="text-xs text-muted-foreground">{setting.description}</p>
          </div>
          <Checkbox 
            checked={setting.enabled}
            onCheckedChange={(checked) => updateSetting(setting.id, checked)}
          />
        </div>
      ))}
    </div>
  </Card>

  <Card className="p-6">
    <h3 className="font-medium mb-4">Privacy Settings</h3>
    <div className="space-y-4">
      {privacySettings.map((setting) => (
        <div key={setting.id} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{setting.title}</p>
            <p className="text-xs text-muted-foreground">{setting.description}</p>
          </div>
          <Checkbox 
            checked={setting.enabled}
            onCheckedChange={(checked) => updateSetting(setting.id, checked)}
          />
        </div>
      ))}
    </div>
  </Card>
</div>`}
                />
              </div>
            </section>

            {/* Message Actions */}
            <section id="message-actions" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Message Actions</h2>
                <p className="text-muted-foreground mb-6">
                  Contextual message actions including reply, forward, edit, and delete functionality.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" />
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="group relative">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">Sarah Chen</span>
                            <span className="text-xs text-muted-foreground">2:30 PM</span>
                          </div>
                          <div className="bg-white border border-brown-200 rounded-lg p-3 rounded-bl-none">
                            <p className="text-sm">Can we schedule a meeting to discuss the Q4 performance reviews?</p>
                          </div>
                          
                          <div className="absolute right-2 top-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1 bg-white border border-brown-200 rounded-lg shadow-lg p-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleReply(1)}
                              >
                                <Reply className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleForward(1)}
                              >
                                <Forward className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleToggleStar(1)}
                              >
                                <Star className={`w-3 h-3 ${starredMessages.has(1) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <CodeBlock
                  title="Message Actions"
                  language="tsx"
                  id="message-actions-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Card className="p-6">
  <div className="space-y-6">
    {messages.map((message) => (
      <div key={message.id} className={\`flex gap-3 \${message.isOwn ? 'justify-end' : ''}\`}>
        {!message.isOwn && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={message.avatar} />
            <AvatarFallback>{message.initials}</AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1">
          <div className="group relative">
            <div className={\`flex items-center gap-2 mb-1 \${message.isOwn ? 'justify-end' : ''}\`}>
              {!message.isOwn && <span className="font-medium text-sm">{message.sender}</span>}
              <span className="text-xs text-muted-foreground">{message.time}</span>
              {message.isOwn && <span className="font-medium text-sm">You</span>}
            </div>
            <div className={\`p-3 rounded-lg max-w-sm \${
              message.isOwn 
                ? 'bg-brown-600 text-white rounded-br-none'
                : 'bg-white border border-brown-200 rounded-bl-none'
            }\`}>
              <p className="text-sm">{message.content}</p>
            </div>
            
            <div className={\`absolute top-8 opacity-0 group-hover:opacity-100 transition-opacity \${
              message.isOwn ? 'left-2' : 'right-2'
            }\`}>
              <div className="flex items-center gap-1 bg-white border rounded-lg shadow-lg p-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Reply className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Forward className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Star className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</Card>`}
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};