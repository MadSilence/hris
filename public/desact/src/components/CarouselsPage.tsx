import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Separator } from './ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Quote,
  Heart,
  ShoppingCart,
  Eye,
  User,
  Calendar,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Briefcase,
  Menu
} from 'lucide-react';
import { MainSidebar } from './shared/MainSidebar';
import { PageHeader } from './shared/PageHeader';
import { CodeBlock } from './shared/CodeBlock';
import { createCopyHandler } from './shared/copyUtils';
import { useInputKeyboardShortcuts } from './hooks/useInputKeyboardShortcuts';
import { ComponentData } from './constants/componentsData';

interface CarouselsPageProps {
  onBack: () => void;
  components: ComponentData[];
  onComponentClick: (componentName: string) => void;
  currentComponent: string;
}

export const CarouselsPage: React.FC<CarouselsPageProps> = ({
  onBack,
  components,
  onComponentClick,
  currentComponent
}) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [activeSection, setActiveSection] = useState('testimonials');
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
      const sections = ['testimonials', 'image-gallery', 'product-showcase', 'team-members', 'achievement-timeline', 'course-catalog'];
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

  const testimonials = [
    {
      quote: "The HR tools have completely transformed how we manage our workforce. The insights are invaluable.",
      author: "Sarah Chen",
      role: "Head of People Operations",
      company: "TechFlow Inc.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face"
    },
    {
      quote: "Streamlined processes and excellent analytics. Our team productivity has increased by 40%.",
      author: "Marcus Rodriguez",
      role: "HR Director",
      company: "InnovateCorp",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
    },
    {
      quote: "Best investment we've made in HR technology. The support team is outstanding.",
      author: "Jennifer Adams",
      role: "Chief People Officer",
      company: "GrowthLabs",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
    }
  ];

  const products = [
    {
      title: "Performance Analytics Suite",
      description: "Comprehensive performance tracking and analytics for your entire organization.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop",
      price: "$299/month",
      features: ["Real-time dashboards", "Custom reports", "Goal tracking"],
      badge: "Popular"
    },
    {
      title: "Recruitment Management Pro",
      description: "End-to-end recruitment solution with AI-powered candidate matching.",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop",
      price: "$199/month",
      features: ["AI matching", "Interview scheduling", "Candidate portal"],
      badge: "New"
    },
    {
      title: "Employee Engagement Platform",
      description: "Boost team morale and productivity with our engagement tools.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop",
      price: "$149/month",
      features: ["Pulse surveys", "Recognition system", "Feedback tools"],
      badge: "Trending"
    }
  ];

  const teamMembers = [
    {
      name: "Alex Thompson",
      role: "Senior HR Manager",
      department: "People Operations",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      experience: "8 years",
      location: "San Francisco"
    },
    {
      name: "Maria Garcia",
      role: "Talent Acquisition Lead",
      department: "Recruitment",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
      experience: "6 years",
      location: "Austin"
    },
    {
      name: "David Kim",
      role: "Learning & Development Specialist",
      department: "Training",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      experience: "5 years",
      location: "Seattle"
    },
    {
      name: "Lisa Chen",
      role: "Compensation Analyst",
      department: "Total Rewards",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
      experience: "4 years",
      location: "New York"
    }
  ];

  const achievements = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "HR Excellence Award 2024",
      organization: "HR Innovation Council",
      date: "March 2024"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Top Performing Team Q1",
      organization: "Company Recognition",
      date: "April 2024"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Best Employee Engagement",
      organization: "Workplace Excellence Awards",
      date: "February 2024"
    }
  ];

  const courses = [
    {
      title: "Advanced Performance Management",
      instructor: "Dr. Patricia Williams",
      duration: "6 weeks",
      students: 234,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop",
      progress: 75
    },
    {
      title: "Strategic HR Leadership",
      instructor: "Michael Roberts",
      duration: "8 weeks",
      students: 189,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
      progress: 45
    },
    {
      title: "Digital Transformation in HR",
      instructor: "Sarah Johnson",
      duration: "4 weeks",
      students: 156,
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=200&fit=crop",
      progress: 90
    }
  ];

  const handleCopyCode = createCopyHandler(setCopiedCode);

  const sections = [
    { id: 'testimonials', label: 'Testimonials Carousel', icon: Quote },
    { id: 'image-gallery', label: 'Image Gallery Carousel', icon: Eye },
    { id: 'product-showcase', label: 'Product Showcase', icon: ShoppingCart },
    { id: 'team-members', label: 'Team Members Carousel', icon: Users },
    { id: 'achievement-timeline', label: 'Achievement Timeline', icon: Award },
    { id: 'course-catalog', label: 'Course Catalog Carousel', icon: BookOpen }
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
          title="Carousels"
          description="Interactive carousel components for showcasing content, testimonials, and media in HR applications"
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
            {/* Testimonials Carousel */}
            <section id="testimonials" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Testimonials Carousel</h2>
                <p className="text-muted-foreground mb-6">
                  Professional testimonials carousel with ratings and author information for social proof.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-8 border-brown-200">
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-brown-300" />
                    <div className="pl-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      
                      <blockquote className="text-lg mb-6 leading-relaxed">
                        "{testimonials[currentTestimonial].quote}"
                      </blockquote>
                      
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={testimonials[currentTestimonial].avatar} />
                          <AvatarFallback>{testimonials[currentTestimonial].author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{testimonials[currentTestimonial].author}</div>
                          <div className="text-sm text-muted-foreground">{testimonials[currentTestimonial].role}</div>
                          <div className="text-sm text-brown-600">{testimonials[currentTestimonial].company}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTestimonial(currentTestimonial === 0 ? testimonials.length - 1 : currentTestimonial - 1)}
                      className="border-brown-300 hover:bg-brown-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex gap-2">
                      {testimonials.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentTestimonial(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentTestimonial ? 'bg-brown-600' : 'bg-brown-200'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTestimonial(currentTestimonial === testimonials.length - 1 ? 0 : currentTestimonial + 1)}
                      className="border-brown-300 hover:bg-brown-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                <CodeBlock
                  title="Testimonials Carousel"
                  language="tsx"
                  id="testimonials-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Card className="p-8">
  <div className="relative">
    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-brown-300" />
    <div className="pl-6">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      
      <blockquote className="text-lg mb-6">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatar} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{author}</div>
          <div className="text-sm text-muted-foreground">{role}</div>
          <div className="text-sm text-brown-600">{company}</div>
        </div>
      </div>
    </div>
  </div>

  <div className="flex items-center justify-between mt-8">
    <Button variant="outline" size="sm" onClick={prevSlide}>
      <ChevronLeft className="w-4 h-4" />
    </Button>
    
    <div className="flex gap-2">
      {slides.map((_, index) => (
        <button
          key={index}
          onClick={() => goToSlide(index)}
          className={\`w-2 h-2 rounded-full \${
            index === current ? 'bg-brown-600' : 'bg-brown-200'
          }\`}
        />
      ))}
    </div>
    
    <Button variant="outline" size="sm" onClick={nextSlide}>
      <ChevronRight className="w-4 h-4" />
    </Button>
  </div>
</Card>`}
                />
              </div>
            </section>

            {/* Image Gallery Carousel */}
            <section id="image-gallery" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Image Gallery Carousel</h2>
                <p className="text-muted-foreground mb-6">
                  Visual image carousel with thumbnails for showcasing team photos, office spaces, or event galleries.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {[
                        { src: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&h=400&fit=crop", title: "Team Meeting" },
                        { src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop", title: "Office Space" },
                        { src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=400&fit=crop", title: "Conference Room" },
                        { src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop", title: "Workspace" }
                      ].map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="aspect-video relative rounded-lg overflow-hidden">
                            <img
                              src={image.src}
                              alt={image.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                              <p className="text-white font-medium">{image.title}</p>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="border-brown-300 hover:bg-brown-50" />
                    <CarouselNext className="border-brown-300 hover:bg-brown-50" />
                  </Carousel>
                </Card>

                <CodeBlock
                  title="Image Gallery Carousel"
                  language="tsx"
                  id="image-gallery-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Carousel className="w-full">
  <CarouselContent>
    {images.map((image, index) => (
      <CarouselItem key={index}>
        <div className="aspect-video relative rounded-lg overflow-hidden">
          <img
            src={image.src}
            alt={image.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white font-medium">{image.title}</p>
          </div>
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
                />
              </div>
            </section>

            {/* Product Showcase */}
            <section id="product-showcase" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Product Showcase</h2>
                <p className="text-muted-foreground mb-6">
                  Feature-rich product carousel with pricing, badges, and action buttons for HR software showcases.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {products.map((product, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                          <Card className="h-full border-brown-200">
                            <div className="relative">
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-48 object-cover rounded-t-lg"
                              />
                              {product.badge && (
                                <Badge 
                                  className="absolute top-3 left-3 bg-brown-600 hover:bg-brown-700"
                                >
                                  {product.badge}
                                </Badge>
                              )}
                            </div>
                            <div className="p-6">
                              <h3 className="font-semibold mb-2">{product.title}</h3>
                              <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                              
                              <div className="space-y-2 mb-4">
                                {product.features.map((feature, featureIndex) => (
                                  <div key={featureIndex} className="flex items-center gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-brown-500 rounded-full" />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                              
                              <Separator className="my-4" />
                              
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-brown-900">{product.price}</span>
                                <Button size="sm" className="bg-brown-600 hover:bg-brown-700">
                                  Learn More
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="border-brown-300 hover:bg-brown-50" />
                    <CarouselNext className="border-brown-300 hover:bg-brown-50" />
                  </Carousel>
                </Card>

                <CodeBlock
                  title="Product Showcase Carousel"
                  language="tsx"
                  id="product-showcase-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Carousel className="w-full">
  <CarouselContent className="-ml-2 md:-ml-4">
    {products.map((product, index) => (
      <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
        <Card className="h-full">
          <div className="relative">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            {product.badge && (
              <Badge className="absolute top-3 left-3">
                {product.badge}
              </Badge>
            )}
          </div>
          <div className="p-6">
            <h3 className="font-semibold mb-2">{product.title}</h3>
            <p className="text-muted-foreground mb-4">{product.description}</p>
            
            <div className="space-y-2 mb-4">
              {product.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-brown-500 rounded-full" />
                  {feature}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-semibold">{product.price}</span>
              <Button size="sm">Learn More</Button>
            </div>
          </div>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
                />
              </div>
            </section>

            {/* Team Members Carousel */}
            <section id="team-members" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Team Members Carousel</h2>
                <p className="text-muted-foreground mb-6">
                  Professional team member showcase with detailed profiles, roles, and contact information.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {teamMembers.map((member, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                          <Card className="h-full border-brown-200 text-center">
                            <div className="p-6">
                              <Avatar className="w-20 h-20 mx-auto mb-4">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              
                              <h3 className="font-semibold mb-1">{member.name}</h3>
                              <p className="text-sm text-brown-600 mb-2">{member.role}</p>
                              <p className="text-sm text-muted-foreground mb-4">{member.department}</p>
                              
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-center gap-2">
                                  <Briefcase className="w-4 h-4" />
                                  {member.experience}
                                </div>
                                <div className="flex items-center justify-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {member.location}
                                </div>
                              </div>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="mt-4 border-brown-300 hover:bg-brown-50"
                              >
                                View Profile
                              </Button>
                            </div>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="border-brown-300 hover:bg-brown-50" />
                    <CarouselNext className="border-brown-300 hover:bg-brown-50" />
                  </Carousel>
                </Card>

                <CodeBlock
                  title="Team Members Carousel"
                  language="tsx"
                  id="team-members-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Carousel className="w-full">
  <CarouselContent className="-ml-2 md:-ml-4">
    {teamMembers.map((member, index) => (
      <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
        <Card className="h-full text-center">
          <div className="p-6">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
            
            <h3 className="font-semibold mb-1">{member.name}</h3>
            <p className="text-sm text-brown-600 mb-2">{member.role}</p>
            <p className="text-sm text-muted-foreground mb-4">{member.department}</p>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Briefcase className="w-4 h-4" />
                {member.experience}
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                {member.location}
              </div>
            </div>
            
            <Button size="sm" variant="outline" className="mt-4">
              View Profile
            </Button>
          </div>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
                />
              </div>
            </section>

            {/* Achievement Timeline */}
            <section id="achievement-timeline" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Achievement Timeline</h2>
                <p className="text-muted-foreground mb-6">
                  Timeline carousel showcasing team achievements, milestones, and recognition awards.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {achievements.map((achievement, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                          <Card className="h-full border-brown-200">
                            <div className="p-6">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-brown-100 rounded-full flex items-center justify-center text-brown-600">
                                  {achievement.icon}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  {achievement.date}
                                </div>
                              </div>
                              
                              <h3 className="font-semibold mb-2">{achievement.title}</h3>
                              <p className="text-sm text-brown-600 mb-4">{achievement.organization}</p>
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-brown-300 hover:bg-brown-50"
                              >
                                View Details
                              </Button>
                            </div>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="border-brown-300 hover:bg-brown-50" />
                    <CarouselNext className="border-brown-300 hover:bg-brown-50" />
                  </Carousel>
                </Card>

                <CodeBlock
                  title="Achievement Timeline Carousel"
                  language="tsx"
                  id="achievement-timeline-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Carousel className="w-full">
  <CarouselContent className="-ml-2 md:-ml-4">
    {achievements.map((achievement, index) => (
      <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
        <Card className="h-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-brown-100 rounded-full flex items-center justify-center text-brown-600">
                {achievement.icon}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {achievement.date}
              </div>
            </div>
            
            <h3 className="font-semibold mb-2">{achievement.title}</h3>
            <p className="text-sm text-brown-600 mb-4">{achievement.organization}</p>
            
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </div>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
                />
              </div>
            </section>

            {/* Course Catalog Carousel */}
            <section id="course-catalog" className="scroll-mt-28">
              <div className="mb-8">
                <h2 className="mb-4">Course Catalog Carousel</h2>
                <p className="text-muted-foreground mb-6">
                  Learning and development course showcase with progress tracking and enrollment information.
                </p>
              </div>

              <div className="space-y-8">
                <Card className="p-6 border-brown-200">
                  <Carousel className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {courses.map((course, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                          <Card className="h-full border-brown-200">
                            <div className="relative">
                              <img
                                src={course.image}
                                alt={course.title}
                                className="w-full h-40 object-cover rounded-t-lg"
                              />
                              <div className="absolute top-3 right-3">
                                <Badge 
                                  variant="secondary" 
                                  className="bg-white/90 text-brown-700"
                                >
                                  {course.progress}% Complete
                                </Badge>
                              </div>
                            </div>
                            <div className="p-6">
                              <h3 className="font-semibold mb-2">{course.title}</h3>
                              
                              <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  {course.instructor}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {course.duration}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  {course.students} students
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{course.progress}%</span>
                                </div>
                                <div className="w-full bg-brown-100 rounded-full h-2">
                                  <div 
                                    className="bg-brown-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${course.progress}%` }}
                                  />
                                </div>
                              </div>
                              
                              <Button 
                                size="sm" 
                                className="w-full bg-brown-600 hover:bg-brown-700"
                              >
                                Continue Learning
                              </Button>
                            </div>
                          </Card>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="border-brown-300 hover:bg-brown-50" />
                    <CarouselNext className="border-brown-300 hover:bg-brown-50" />
                  </Carousel>
                </Card>

                <CodeBlock
                  title="Course Catalog Carousel"
                  language="tsx"
                  id="course-catalog-code"
                  copiedCode={copiedCode}
                  onCopy={handleCopyCode}
                  code={`<Carousel className="w-full">
  <CarouselContent className="-ml-2 md:-ml-4">
    {courses.map((course, index) => (
      <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
        <Card className="h-full">
          <div className="relative">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-40 object-cover rounded-t-lg"
            />
            <Badge className="absolute top-3 right-3 bg-white/90">
              {course.progress}% Complete
            </Badge>
          </div>
          <div className="p-6">
            <h3 className="font-semibold mb-2">{course.title}</h3>
            
            <div className="space-y-2 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {course.instructor}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {course.duration}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {course.students} students
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="w-full bg-brown-100 rounded-full h-2">
                <div 
                  className="bg-brown-600 h-2 rounded-full"
                  style={{ width: \`\${course.progress}%\` }}
                />
              </div>
            </div>
            
            <Button size="sm" className="w-full">
              Continue Learning
            </Button>
          </div>
        </Card>
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`}
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};