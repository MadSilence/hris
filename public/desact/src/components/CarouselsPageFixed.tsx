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
                Visual image carousel for showcasing office spaces, team events, or product images.
              </p>
            </div>

            <div className="space-y-8">
              <Card className="p-6 border-brown-200">
                <Carousel className="w-full">
                  <CarouselContent>
                    {[
                      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=300&fit=crop",
                      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&h=300&fit=crop",
                      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop",
                      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=500&h=300&fit=crop"
                    ].map((src, index) => (
                      <CarouselItem key={index}>
                        <div className="relative">
                          <img 
                            src={src} 
                            alt={`Office space ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                            {index + 1} / 4
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-white/90 border-brown-300 hover:bg-white" />
                  <CarouselNext className="right-4 bg-white/90 border-brown-300 hover:bg-white" />
                </Carousel>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Modern Office Spaces</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore our contemporary work environments designed for collaboration and productivity.
                  </p>
                </div>
              </Card>

              <CodeBlock
                title="Image Gallery Carousel"
                language="tsx"
                id="image-gallery-code"
                copiedCode={copiedCode}
                onCopy={handleCopyCode}
                code={`<Card className="p-6">
  <Carousel className="w-full">
    <CarouselContent>
      {images.map((src, index) => (
        <CarouselItem key={index}>
          <div className="relative">
            <img 
              src={src} 
              alt={\`Image \${index + 1}\`}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {index + 1} / {images.length}
            </div>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious className="left-4 bg-white/90" />
    <CarouselNext className="right-4 bg-white/90" />
  </Carousel>

  <div className="mt-4">
    <h3 className="font-medium mb-2">Gallery Title</h3>
    <p className="text-sm text-muted-foreground">
      Gallery description text here.
    </p>
  </div>
</Card>`}
              />
            </div>
          </section>

          {/* Product Showcase */}
          <section id="product-showcase" className="scroll-mt-28">
            <div className="mb-8">
              <h2 className="mb-4">Product Showcase</h2>
              <p className="text-muted-foreground mb-6">
                Feature-rich product carousel with pricing, features, and action buttons for HR solutions.
              </p>
            </div>

            <div className="space-y-8">
              <Card className="p-6 border-brown-200">
                <div className="relative mb-4">
                  {products[currentProduct].badge && (
                    <Badge className="absolute top-2 right-2 z-10 bg-brown-700 hover:bg-brown-800">
                      {products[currentProduct].badge}
                    </Badge>
                  )}
                  <img 
                    src={products[currentProduct].image}
                    alt={products[currentProduct].title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{products[currentProduct].title}</h3>
                    <p className="text-muted-foreground">{products[currentProduct].description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-brown-700">{products[currentProduct].price}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-brown-300 hover:bg-brown-50">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" className="bg-brown-700 hover:bg-brown-800">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Subscribe
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Key Features:</h4>
                    <ul className="space-y-1">
                      {products[currentProduct].features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-brown-600 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProduct(currentProduct === 0 ? products.length - 1 : currentProduct - 1)}
                    className="border-brown-300 hover:bg-brown-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex gap-2">
                    {products.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentProduct(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentProduct ? 'bg-brown-600' : 'bg-brown-200'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentProduct(currentProduct === products.length - 1 ? 0 : currentProduct + 1)}
                    className="border-brown-300 hover:bg-brown-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>

              <CodeBlock
                title="Product Showcase"
                language="tsx"
                id="product-showcase-code"
                copiedCode={copiedCode}
                onCopy={handleCopyCode}
                code={`<Card className="p-6">
  <div className="relative mb-4">
    {badge && (
      <Badge className="absolute top-2 right-2 z-10">
        {badge}
      </Badge>
    )}
    <img 
      src={image}
      alt={title}
      className="w-full h-48 object-cover rounded-lg"
    />
  </div>

  <div className="space-y-4">
    <div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>

    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold text-brown-700">{price}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button size="sm" className="bg-brown-700 hover:bg-brown-800">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Subscribe
        </Button>
      </div>
    </div>

    <Separator />

    <div>
      <h4 className="font-medium mb-2">Key Features:</h4>
      <ul className="space-y-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 bg-brown-600 rounded-full" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  </div>
</Card>`}
              />
            </div>
          </section>

          {/* Team Members Carousel */}
          <section id="team-members" className="scroll-mt-28">
            <div className="mb-8">
              <h2 className="mb-4">Team Members Carousel</h2>
              <p className="text-muted-foreground mb-6">
                Showcase team members with profile information and role details in a carousel format.
              </p>
            </div>

            <div className="space-y-8">
              <Card className="p-6 border-brown-200">
                <Carousel className="w-full">
                  <CarouselContent>
                    {teamMembers.map((member, index) => (
                      <CarouselItem key={index}>
                        <div className="text-center space-y-4">
                          <Avatar className="w-24 h-24 mx-auto">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-lg">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <h3 className="font-semibold text-lg">{member.name}</h3>
                            <p className="text-brown-600 font-medium">{member.role}</p>
                            <p className="text-sm text-muted-foreground">{member.department}</p>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-center gap-2">
                              <Briefcase className="w-4 h-4 text-brown-500" />
                              <span>{member.experience} experience</span>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <MapPin className="w-4 h-4 text-brown-500" />
                              <span>{member.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" variant="outline" className="border-brown-300 hover:bg-brown-50">
                              <User className="w-4 h-4 mr-2" />
                              View Profile
                            </Button>
                            <Button size="sm" className="bg-brown-700 hover:bg-brown-800">
                              Contact
                            </Button>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-white border-brown-300 hover:bg-brown-50" />
                  <CarouselNext className="right-4 bg-white border-brown-300 hover:bg-brown-50" />
                </Carousel>
              </Card>

              <CodeBlock
                title="Team Members Carousel"
                language="tsx"
                id="team-members-code"
                copiedCode={copiedCode}
                onCopy={handleCopyCode}
                code={`<Card className="p-6">
  <Carousel className="w-full">
    <CarouselContent>
      {teamMembers.map((member, index) => (
        <CarouselItem key={index}>
          <div className="text-center space-y-4">
            <Avatar className="w-24 h-24 mx-auto">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-brown-600 font-medium">{member.role}</p>
              <p className="text-sm text-muted-foreground">{member.department}</p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Briefcase className="w-4 h-4 text-brown-500" />
                <span>{member.experience} experience</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-brown-500" />
                <span>{member.location}</span>
              </div>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="outline">
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
              <Button size="sm">Contact</Button>
            </div>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
</Card>`}
              />
            </div>
          </section>

          {/* Achievement Timeline */}
          <section id="achievement-timeline" className="scroll-mt-28">
            <div className="mb-8">
              <h2 className="mb-4">Achievement Timeline</h2>
              <p className="text-muted-foreground mb-6">
                Horizontal timeline carousel for displaying achievements, milestones, and recognition.
              </p>
            </div>

            <div className="space-y-8">
              <Card className="p-6 border-brown-200">
                <div className="space-y-6">
                  {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-brown-50 rounded-lg">
                      <div className="flex-shrink-0 w-12 h-12 bg-brown-700 rounded-full flex items-center justify-center text-white">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.organization}</p>
                        <div className="flex items-center gap-2 text-sm text-brown-600">
                          <Calendar className="w-4 h-4" />
                          {achievement.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <CodeBlock
                title="Achievement Timeline"
                language="tsx"
                id="achievement-timeline-code"
                copiedCode={copiedCode}
                onCopy={handleCopyCode}
                code={`<Card className="p-6">
  <div className="space-y-6">
    {achievements.map((achievement, index) => (
      <div key={index} className="flex items-start gap-4 p-4 bg-brown-50 rounded-lg">
        <div className="flex-shrink-0 w-12 h-12 bg-brown-700 rounded-full flex items-center justify-center text-white">
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{achievement.title}</h4>
          <p className="text-sm text-muted-foreground mb-2">
            {achievement.organization}
          </p>
          <div className="flex items-center gap-2 text-sm text-brown-600">
            <Calendar className="w-4 h-4" />
            {achievement.date}
          </div>
        </div>
      </div>
    ))}
  </div>
</Card>`}
              />
            </div>
          </section>

          {/* Course Catalog Carousel */}
          <section id="course-catalog" className="scroll-mt-28">
            <div className="mb-8">
              <h2 className="mb-4">Course Catalog Carousel</h2>
              <p className="text-muted-foreground mb-6">
                Learning and development course carousel with progress tracking and enrollment options.
              </p>
            </div>

            <div className="space-y-8">
              <Card className="p-6 border-brown-200">
                <Carousel className="w-full">
                  <CarouselContent>
                    {courses.map((course, index) => (
                      <CarouselItem key={index}>
                        <div className="space-y-4">
                          <div className="relative">
                            <img 
                              src={course.image}
                              alt={course.title}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <div className="absolute top-2 right-2 bg-brown-700 text-white px-2 py-1 rounded text-sm">
                              {course.duration}
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-2">{course.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <User className="w-4 h-4" />
                              {course.instructor}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              {course.students} students enrolled
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-brown-200 rounded-full h-2">
                              <div 
                                className="bg-brown-700 h-2 rounded-full transition-all"
                                style={{ width: `${course.progress}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 border-brown-300 hover:bg-brown-50">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Continue
                            </Button>
                            <Button size="sm" className="flex-1 bg-brown-700 hover:bg-brown-800">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4 bg-white border-brown-300 hover:bg-brown-50" />
                  <CarouselNext className="right-4 bg-white border-brown-300 hover:bg-brown-50" />
                </Carousel>
              </Card>

              <CodeBlock
                title="Course Catalog Carousel"
                language="tsx"
                id="course-catalog-code"
                copiedCode={copiedCode}
                onCopy={handleCopyCode}
                code={`<Card className="p-6">
  <Carousel className="w-full">
    <CarouselContent>
      {courses.map((course, index) => (
        <CarouselItem key={index}>
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 bg-brown-700 text-white px-2 py-1 rounded text-sm">
                {course.duration}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">{course.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <User className="w-4 h-4" />
                {course.instructor}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {course.students} students enrolled
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <div className="w-full bg-brown-200 rounded-full h-2">
                <div 
                  className="bg-brown-700 h-2 rounded-full"
                  style={{ width: \`\${course.progress}%\` }}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <BookOpen className="w-4 h-4 mr-2" />
                Continue
              </Button>
              <Button size="sm" className="flex-1">
                View Details
              </Button>
            </div>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
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