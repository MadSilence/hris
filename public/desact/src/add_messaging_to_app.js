const fs = require('fs');

// Read the App.tsx file
const filePath = './App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find the activity-feeds section and add messaging after it
const activityFeedsEndPattern = `  if (currentView === 'activity-feeds') {
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
  }`;

const messagingSection = `  if (currentView === 'messaging') {
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

  if (currentView === 'home') {`;

// Replace to add messaging section
content = content.replace(
  activityFeedsEndPattern + '\n\n  if (currentView === \'home\') {',
  activityFeedsEndPattern + '\n\n' + messagingSection
);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Added MessagingPage component to App.tsx');