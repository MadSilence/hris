const fs = require('fs');

// Read the current App.tsx file
let content = fs.readFileSync('./App.tsx', 'utf8');

// Find where to insert the messaging component rendering
// It should go after activity-feeds and before the final return statement

// Look for the end of activity-feeds section
const activityFeedsEnd = `  if (currentView === 'activity-feeds') {
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

// The messaging section to add
const messagingSection = `
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
  }`;

// Insert the messaging section after activity-feeds
content = content.replace(activityFeedsEnd, activityFeedsEnd + messagingSection);

// Write the updated content back
fs.writeFileSync('./App.tsx', content, 'utf8');

console.log('Successfully added MessagingPage component rendering to App.tsx');