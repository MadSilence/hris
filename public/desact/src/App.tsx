import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Linkedin, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
import { ComponentCard } from './components/ComponentCard';
import { TypographySystemPage } from './components/TypographySystemPage';
import { SystemColorsPage } from './components/SystemColorsPage';
import { IconsPage } from './components/IconsPage';
import { ButtonsPage } from './components/ButtonsPage';
import { FormsPage } from './components/FormsPage';
import { InputPage } from './components/InputPage';
import { LayoutPage } from './components/LayoutPage';
import { HRCardsPage } from './components/HRCardsPage';
import { AccordionPage } from './components/AccordionPage';
import { NavigationPage } from './components/NavigationPage';
import { BreadcrumbsPage } from './components/BreadcrumbsPage';
import { PaginationPage } from './components/PaginationPage';
import { InteractionPage } from './components/InteractionPage';
import { BadgesPage } from './components/BadgesPage';
import { DataDisplayPage } from './components/DataDisplayPage';
import { ChartsPage } from './components/ChartsPage';
import { ListsPage } from './components/ListsPage';
import { SkeletonsPage } from './components/SkeletonsPage';
import { AlertsPage } from './components/AlertsPage';
import { ModalsPage } from './components/ModalsPage';
import { DrawerPage } from './components/DrawerPage';
import { AvatarsPage } from './components/AvatarsPage';
import { FileUploadPage } from './components/FileUploadPage';
import { DashboardPage } from './components/DashboardPage';
import { SimpleInsightPage } from './components/SimpleInsightPage';
import { ColorPickerPage } from './components/ColorPickerPage';
import { CommandMenuPage } from './components/CommandMenuPage';
import { TextEditorPage } from './components/TextEditorPage';
import { StatusPage } from './components/StatusPage';
import { ReadMePage } from './components/ReadMePage';
import { MiscellaneousPage } from './components/MiscellaneousPage';
import { PageHeadersPage } from './components/PageHeadersPage';
import { CardHeadersPage } from './components/CardHeadersPage';
import { SectionFootersPage } from './components/SectionFootersPage';
import { HeaderNavigationsPage } from './components/HeaderNavigationsPage';
import { ActivityGaugesPage } from './components/ActivityGaugesPage';
import { SlideoutMenusPage } from './components/SlideoutMenusPage';
import { InlineCTAsPage } from './components/InlineCTAsPage';
import { CarouselsPage } from './components/CarouselsPage';
import { ProgressStepsPage } from './components/ProgressStepsPage';
import { ActivityFeedsPage } from './components/ActivityFeedsPage';
import { MessagingPage } from './components/MessagingPage';
import { NotificationsPage } from './components/NotificationsPage';
import { CalendarsPage } from './components/CalendarsPage';
import { TabsPage } from './components/TabsPage';
import { TablesPage } from './components/TablesPage';
import { CodeSnippetsPage } from './components/CodeSnippetsPage';
import { useInputKeyboardShortcuts } from './components/hooks/useInputKeyboardShortcuts';
import { COMPONENTS_DATA } from './components/constants/componentsData';
import { DesactLogo } from './components/shared/DesactLogo';
import { 
  PAGE_VARIANTS, 
  HEADER_VARIANTS, 
  CONTAINER_VARIANTS, 
  CARD_VARIANTS,
  TRANSITION_DELAY 
} from './components/constants/animations';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'home' | 'readme' | 'typography' | 'system-colors' | 'icons' | 'buttons' | 'forms' | 'input' | 'layout' | 'hr-cards' | 'accordion' | 'navigation' | 'breadcrumbs' | 'pagination' | 'interaction' | 'badges' | 'alerts' | 'data-display' | 'charts' | 'lists' | 'skeletons' | 'modals' | 'drawer' | 'avatars' | 'file-upload' | 'miscellaneous' | 'dashboard' | 'simple-insight' | 'color-picker' | 'command-menu' | 'text-editor' | 'status' | 'page-headers' | 'card-headers' | 'section-footers' | 'header-navigations' | 'activity-gauges' | 'slideout-menus' | 'inline-ctas' | 'carousels' | 'progress-steps' | 'activity-feeds' | 'messaging' | 'notifications' | 'calendars' | 'tabs' | 'tables' | 'code-snippets' | 'toast-test'>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { inputRef, handleKeyDown } = useInputKeyboardShortcuts({
    value: searchTerm,
    onChange: setSearchTerm,
    enableGlobalShortcuts: currentView === 'home',
  });

  // Chrome compatibility keyboard handler
  useEffect(() => {
    const forceKeyboardHandler = (e: KeyboardEvent) => {
      const isHome = currentView === 'home';
      
      if (!isHome) return;

      // Cmd+K detection
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 0);
        
        return false;
      }

      // "/" detection
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }, 0);
        
        return false;
      }
    };

    // Attach keyboard listeners
    document.addEventListener('keydown', forceKeyboardHandler, true);
    document.addEventListener('keydown', forceKeyboardHandler, false);
    window.addEventListener('keydown', forceKeyboardHandler, true);
    document.body.addEventListener('keydown', forceKeyboardHandler, true);
    document.addEventListener('keypress', forceKeyboardHandler, true);
    document.addEventListener('keyup', forceKeyboardHandler, true);

    return () => {
      document.removeEventListener('keydown', forceKeyboardHandler, true);
      document.removeEventListener('keydown', forceKeyboardHandler, false);
      window.removeEventListener('keydown', forceKeyboardHandler, true);
      document.body.removeEventListener('keydown', forceKeyboardHandler, true);
      document.removeEventListener('keypress', forceKeyboardHandler, true);
      document.removeEventListener('keyup', forceKeyboardHandler, true);
    };
  }, [currentView, inputRef]);

  // Focus enforcement when returning to home
  useEffect(() => {
    if (currentView === 'home') {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setAttribute('tabindex', '0');
        }
      }, 100);
    }
  }, [currentView, inputRef]);

  const handleComponentClick = async (componentName: string) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (componentName === 'Read Me') {
        setCurrentView('readme');
      } else if (componentName === 'Typography') {
        setCurrentView('typography');
      } else if (componentName === 'System Colors') {
        setCurrentView('system-colors');
      } else if (componentName === 'Icons') {
        setCurrentView('icons');
      } else if (componentName === 'Buttons') {
        setCurrentView('buttons');
      } else if (componentName === 'Forms') {
        setCurrentView('forms');
      } else if (componentName === 'Input') {
        setCurrentView('input');
      } else if (componentName === 'Layout') {
        setCurrentView('layout');
      } else if (componentName === 'HR Cards') {
        setCurrentView('hr-cards');
      } else if (componentName === 'Accordion') {
        setCurrentView('accordion');
      } else if (componentName === 'Navigation') {
        setCurrentView('navigation');
      } else if (componentName === 'Breadcrumbs') {
        setCurrentView('breadcrumbs');
      } else if (componentName === 'Pagination') {
        setCurrentView('pagination');
      } else if (componentName === 'Interaction') {
        setCurrentView('interaction');
      } else if (componentName === 'Badges') {
        setCurrentView('badges');
      } else if (componentName === 'Alerts') {
        setCurrentView('alerts');
      } else if (componentName === 'Data Display') {
        setCurrentView('data-display');
      } else if (componentName === 'Charts') {
        setCurrentView('charts');
      } else if (componentName === 'Lists') {
        setCurrentView('lists');
      } else if (componentName === 'Skeletons') {
        setCurrentView('skeletons');
      } else if (componentName === 'Modals') {
        setCurrentView('modals');
      } else if (componentName === 'Drawer') {
        setCurrentView('drawer');
      } else if (componentName === 'Avatars') {
        setCurrentView('avatars');
      } else if (componentName === 'File Upload') {
        setCurrentView('file-upload');
      } else if (componentName === 'Miscellaneous') {
        setCurrentView('miscellaneous');
      } else if (componentName === 'Dashboard') {
        setCurrentView('dashboard');
      } else if (componentName === 'Simple Insight') {
        setCurrentView('simple-insight');
      } else if (componentName === 'Color Picker') {
        setCurrentView('color-picker');
      } else if (componentName === 'Command Menu') {
        setCurrentView('command-menu');
      } else if (componentName === 'Text Editor') {
        setCurrentView('text-editor');
      } else if (componentName === 'Status') {
        setCurrentView('status');
      } else if (componentName === 'Page Headers') {
        setCurrentView('page-headers');
      } else if (componentName === 'Card Headers') {
        setCurrentView('card-headers');
      } else if (componentName === 'Section footers') {
        setCurrentView('section-footers');
      } else if (componentName === 'Header navigations') {
        setCurrentView('header-navigations');
      } else if (componentName === 'Activity gauges') {
        setCurrentView('activity-gauges');
      } else if (componentName === 'Slideout menus') {
        setCurrentView('slideout-menus');
      } else if (componentName === 'Inline CTAs') {
        setCurrentView('inline-ctas');
      } else if (componentName === 'Carousels') {
        setCurrentView('carousels');
      } else if (componentName === 'Progress steps') {
        setCurrentView('progress-steps');
      } else if (componentName === 'Activity feeds') {
        setCurrentView('activity-feeds');
      } else if (componentName === 'Messaging') {
        setCurrentView('messaging');
      } else if (componentName === 'Notifications') {
        setCurrentView('notifications');
      } else if (componentName === 'Calendars') {
        setCurrentView('calendars');
      } else if (componentName === 'Tabs') {
        setCurrentView('tabs');
      } else if (componentName === 'Tables') {
        setCurrentView('tables');
      } else if (componentName === 'Code snippets') {
        setCurrentView('code-snippets');
      }
      setIsTransitioning(false);
    }, TRANSITION_DELAY);
  };

  const handleBackToHome = async () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentView('home');
      setIsTransitioning(false);
    }, TRANSITION_DELAY);
  };

  const filteredComponents = COMPONENTS_DATA.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentView === 'readme') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="readme"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ReadMePage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Read Me"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'typography') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="typography"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <TypographySystemPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Typography"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'system-colors') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="system-colors"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SystemColorsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="System Colors"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'icons') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="icons"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <IconsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Icons"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'buttons') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="buttons"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ButtonsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Buttons"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'forms') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="forms"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FormsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Forms"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'input') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="input"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <InputPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Input"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'layout') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="layout"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <LayoutPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Layout"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'hr-cards') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="hr-cards"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <HRCardsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="HR Cards"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'accordion') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="accordion"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <AccordionPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Accordion"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'navigation') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="navigation"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <NavigationPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Navigation"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'breadcrumbs') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="breadcrumbs"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <BreadcrumbsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Breadcrumbs"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'pagination') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="pagination"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PaginationPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Pagination"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'interaction') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="interaction"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <InteractionPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Interaction"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'badges') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="badges"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <BadgesPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Badges"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'alerts') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="alerts"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <AlertsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Alerts"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'data-display') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="data-display"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <DataDisplayPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Data Display"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'charts') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="charts"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ChartsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Charts"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'lists') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="lists"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ListsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Lists"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'skeletons') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="skeletons"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SkeletonsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Skeletons"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'modals') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="modals"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ModalsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Modals"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'drawer') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="drawer"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <DrawerPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Drawer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'avatars') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="avatars"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <AvatarsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Avatars"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'file-upload') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="file-upload"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FileUploadPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="File Upload"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'miscellaneous') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="miscellaneous"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <MiscellaneousPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Miscellaneous"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="dashboard"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <DashboardPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Dashboard"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'simple-insight') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="simple-insight"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SimpleInsightPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Simple Insight"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'color-picker') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="color-picker"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ColorPickerPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Color Picker"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'command-menu') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="command-menu"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CommandMenuPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Command Menu"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'text-editor') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="text-editor"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <TextEditorPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Text Editor"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'status') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="status"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <StatusPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Status"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'page-headers') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="page-headers"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <PageHeadersPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Page Headers"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'card-headers') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="card-headers"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CardHeadersPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Card Headers"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'section-footers') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="section-footers"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SectionFootersPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Section footers"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'header-navigations') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="header-navigations"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <HeaderNavigationsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Header navigations"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'activity-gauges') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="activity-gauges"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ActivityGaugesPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Activity gauges"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'slideout-menus') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="slideout-menus"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SlideoutMenusPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Slideout menus"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'inline-ctas') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="inline-ctas"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <InlineCTAsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Inline CTAs"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'carousels') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="carousels"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CarouselsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Carousels"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'progress-steps') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="progress-steps"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ProgressStepsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Progress steps"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'activity-feeds') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="activity-feeds"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ActivityFeedsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Activity feeds"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'messaging') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="messaging"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <MessagingPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Messaging"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'notifications') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="notifications"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <NotificationsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Notifications"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'calendars') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="calendars"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CalendarsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Calendars"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'tabs') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="tabs"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <TabsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Tabs"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'tables') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="tables"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <TablesPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Tables"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (currentView === 'code-snippets') {
    return (
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key="code-snippets"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CodeSnippetsPage 
              onBack={handleBackToHome} 
              components={COMPONENTS_DATA}
              onComponentClick={handleComponentClick}
              currentComponent="Code snippets"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isTransitioning && (
        <motion.div
          key="home"
          variants={PAGE_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen bg-brown-50/30"
        >
          <div className="max-w-6xl mx-auto px-8 py-12">
            {/* Header */}
            <motion.div 
              variants={HEADER_VARIANTS}
              initial="initial"
              animate="animate"
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <DesactLogo animated={true} />
              </div>
              
              <h1 className="mb-4">Empowering Human Resources Teams with Thoughtful Design, Intuitive Components, and Scalable Solutions</h1>
              <p className="text-xl mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                A comprehensive UI component library with 50+ components across multiple categories.
              </p>
              
              {/* Search */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 w-5 h-5" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search components..."
                  className="pl-10 pr-16 bg-white border-brown-200 text-base py-3"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>
            </motion.div>

            {/* Results count */}
            {searchTerm && (
              <motion.div
                variants={HEADER_VARIANTS}
                initial="initial"
                animate="animate"
                className="text-center mb-8"
              >
                <p style={{ color: 'var(--color-text-tertiary)' }}>
                  {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''} found
                </p>
              </motion.div>
            )}

            {/* Categories */}
            <motion.div 
              variants={CONTAINER_VARIANTS}
              initial="initial"
              animate="animate"
              className="space-y-12"
            >
              {/* Documentation Components */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <h2>Documentation</h2>
                  <Badge variant="secondary" className="bg-brown-100 text-brown-700">
                    {filteredComponents.filter(c => c.category === 'Documentation').length}
                  </Badge>
                </div>
                <motion.div 
                  variants={CONTAINER_VARIANTS}
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {filteredComponents
                    .filter(component => component.category === 'Documentation')
                    .map((component, index) => (
                      <motion.div
                        key={component.name}
                        variants={CARD_VARIANTS}
                        custom={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ComponentCard
                          {...component}
                          onClick={() => handleComponentClick(component.name)}
                        />
                      </motion.div>
                    ))}
                </motion.div>
              </div>

              {/* Base Components */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <h2>Base components</h2>
                  <Badge variant="secondary" className="bg-brown-100 text-brown-700">
                    {filteredComponents.filter(c => c.category === 'Base components').length}
                  </Badge>
                </div>
                <motion.div 
                  variants={CONTAINER_VARIANTS}
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {filteredComponents
                    .filter(component => component.category === 'Base components')
                    .map((component, index) => (
                      <motion.div
                        key={component.name}
                        variants={CARD_VARIANTS}
                        custom={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ComponentCard
                          {...component}
                          onClick={() => handleComponentClick(component.name)}
                        />
                      </motion.div>
                    ))}
                </motion.div>
              </div>

              {/* Application UI */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <h2>Application UI</h2>
                  <Badge variant="secondary" className="bg-brown-100 text-brown-700">
                    {filteredComponents.filter(c => c.category === 'Application UI').length}
                  </Badge>
                </div>
                <motion.div 
                  variants={CONTAINER_VARIANTS}
                  className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  {filteredComponents
                    .filter(component => component.category === 'Application UI')
                    .map((component, index) => (
                      <motion.div
                        key={component.name}
                        variants={CARD_VARIANTS}
                        custom={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ComponentCard
                          {...component}
                          onClick={() => handleComponentClick(component.name)}
                        />
                      </motion.div>
                    ))}
                </motion.div>
              </div>

              {/* Empty state when no results */}
              {filteredComponents.length === 0 && (
                <motion.div
                  variants={HEADER_VARIANTS}
                  initial="initial"
                  animate="animate"
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="mb-2">No components found</h3>
                  <p style={{ color: 'var(--color-text-tertiary)' }}>
                    Try adjusting your search terms or browse all components above.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Quick access hint */}
            <motion.div
              variants={HEADER_VARIANTS}
              initial="initial"
              animate="animate"
              className="text-center mt-16 pt-8 border-t border-brown-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                    Created with Love by Alhasan
                  </p>
                  <div className="flex items-center gap-2 ml-2">
                    <a 
                      href="https://www.linkedin.com/in/alhasanux/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-brown-100 rounded-lg transition-colors duration-200"
                      aria-label="Visit Alhasan's LinkedIn profile"
                    >
                      <Linkedin className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                    </a>
                    <a 
                      href="https://x.com/sir_hsn" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-brown-100 rounded-lg transition-colors duration-200"
                      aria-label="Visit Alhasan's X profile"
                    >
                      <Twitter className="w-4 h-4" style={{ color: 'var(--color-text-tertiary)' }} />
                    </a>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  All Rights Reserved 2025
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
      <Toaster />
    </AnimatePresence>
  );
}