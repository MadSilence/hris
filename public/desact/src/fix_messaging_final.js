const fs = require('fs');

// Read the current App.tsx file
let content = fs.readFileSync('./App.tsx', 'utf8');

// Create the messaging section that needs to be added
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

// Find the final return statement pattern
const returnPattern = /return \(/;
const match = content.match(returnPattern);

if (match) {
  const insertIndex = match.index;
  
  // Insert the messaging section before the final return
  content = content.slice(0, insertIndex) + messagingSection + '\n\n  ' + content.slice(insertIndex);
  
  // Write the updated content back
  fs.writeFileSync('./App.tsx', content, 'utf8');
  
  console.log('Successfully added MessagingPage component rendering to App.tsx');
} else {
  console.log('Could not find insertion point in App.tsx');
}