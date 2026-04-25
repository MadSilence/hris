const fs = require('fs');

// Read the App.tsx file
let content = fs.readFileSync('./App.tsx', 'utf8');

// Find the end of activity-feeds section
const endPattern = `    );
  }

  return (`;

// The messaging section to add
const messagingSection = `    );
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

  return (`;

// Replace
content = content.replace(endPattern, messagingSection);

// Write back
fs.writeFileSync('./App.tsx', content, 'utf8');

console.log('Added MessagingPage component routing to App.tsx');