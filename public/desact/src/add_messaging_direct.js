const fs = require('fs');

// Read the App.tsx file
let content = fs.readFileSync('./App.tsx', 'utf8');

// The messaging section that needs to be added
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
  }
`;

// Find the final return statement and add messaging before it
const finalReturnPattern = /\n  return \(/;
const insertIndex = content.search(finalReturnPattern);

if (insertIndex !== -1) {
  // Insert the messaging section before the final return statement
  content = content.slice(0, insertIndex) + messagingSection + content.slice(insertIndex);
  
  // Write back to file
  fs.writeFileSync('./App.tsx', content, 'utf8');
  console.log('Successfully added MessagingPage component rendering to App.tsx');
} else {
  console.log('Could not find final return statement in App.tsx');
}