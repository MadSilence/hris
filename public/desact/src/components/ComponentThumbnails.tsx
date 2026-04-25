import React from 'react';
import { motion } from 'motion/react';

interface ThumbnailProps {
  isHovered?: boolean;
}

// Animation variants
const containerVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.2,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const itemVariants = {
  rest: { scale: 1, opacity: 1 },
  hover: { scale: 1.05, opacity: 1 }
};

const buttonVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.1, y: -2 }
};

const fillVariants = {
  rest: { scaleX: 0.3 },
  hover: { scaleX: 1 }
};

const pulseVariants = {
  rest: { scale: 1 },
  hover: { scale: [1, 1.2, 1], transition: { duration: 0.6, repeat: Infinity } }
};

const floatVariants = {
  rest: { y: 0, rotate: 0 },
  hover: { y: [-2, 2, -2], rotate: [0, 5, -5, 0], transition: { duration: 2, repeat: Infinity } }
};

const chartBarVariants = {
  rest: { scaleY: 1 },
  hover: { scaleY: [1, 1.3, 1], transition: { duration: 0.4, repeat: Infinity, repeatType: "reverse" } }
};

const staggerChildren = {
  rest: {},
  hover: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const slideVariants = {
  rest: { x: 0 },
  hover: { x: 4 }
};

const slideOutVariants = {
  rest: { x: 20, opacity: 0 },
  hover: { x: 0, opacity: 1 }
};

// Enhanced animation variants for the 4 specific wireframes
const bounceVariants = {
  rest: { y: 0, scale: 1 },
  hover: { y: [-3, 0, -3], scale: [1, 1.1, 1], transition: { duration: 1.5, repeat: Infinity } }
};

const rotateVariants = {
  rest: { rotate: 0 },
  hover: { rotate: 360, transition: { duration: 2, repeat: Infinity, ease: "linear" } }
};

const fadeInVariants = {
  rest: { opacity: 0.3, scale: 1 },
  hover: { opacity: 1, scale: 1.05, transition: { duration: 0.4 } }
};

const slideInVariants = {
  rest: { x: -20, opacity: 0 },
  hover: { x: 0, opacity: 1, transition: { duration: 0.5 } }
};

const waveVariants = {
  rest: { scaleY: 1, y: 0 },
  hover: { 
    scaleY: [1, 1.2, 0.8, 1], 
    y: [0, -2, 2, 0],
    transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
  }
};

// =======================
// ENHANCED WIREFRAMES FOR THE 4 SPECIFIC COMPONENTS
// =======================

export const SectionFootersThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="w-full h-full bg-stone-50 rounded-lg border border-stone-200 relative" variants={staggerChildren}>
        <motion.div className="absolute top-2 left-2 right-2 bottom-6 bg-white rounded border border-stone-300" variants={itemVariants}>
          <motion.div className="p-1.5 space-y-1">
            <motion.div className="w-full h-0.5 bg-brown-600 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-3/4 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-full h-0.5 bg-brown-300 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-1/2 h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-5 bg-brown-700 rounded-b-lg"
          variants={slideInVariants}
        >
          <motion.div className="h-full flex items-center justify-between px-2" variants={staggerChildren}>
            <motion.div className="flex gap-1">
              <motion.div className="w-3 h-0.5 bg-brown-100 rounded" variants={bounceVariants}></motion.div>
              <motion.div className="w-4 h-0.5 bg-brown-200 rounded" variants={bounceVariants}></motion.div>
              <motion.div className="w-3 h-0.5 bg-brown-100 rounded" variants={bounceVariants}></motion.div>
            </motion.div>
            
            <motion.div className="flex gap-0.5">
              <motion.div className="w-1 h-1 bg-brown-200 rounded-full" variants={pulseVariants}></motion.div>
              <motion.div className="w-1 h-1 bg-brown-200 rounded-full" variants={pulseVariants}></motion.div>
              <motion.div className="w-1 h-1 bg-brown-200 rounded-full" variants={pulseVariants}></motion.div>
            </motion.div>
            
            <motion.div className="w-6 h-0.5 bg-brown-300 rounded" variants={fadeInVariants}></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const HeaderNavigationsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="w-full h-full bg-stone-50 rounded-lg border border-stone-200 relative" variants={staggerChildren}>
        <motion.div className="absolute top-0 left-0 right-0 h-3 bg-brown-600 rounded-t-lg" variants={itemVariants}>
          <motion.div className="flex items-center gap-0.5 p-0.5">
            <motion.div className="w-0.5 h-0.5 bg-red-400 rounded-full" variants={pulseVariants}></motion.div>
            <motion.div className="w-0.5 h-0.5 bg-yellow-400 rounded-full" variants={pulseVariants}></motion.div>
            <motion.div className="w-0.5 h-0.5 bg-green-400 rounded-full" variants={pulseVariants}></motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute top-3 left-0 right-0 h-4 bg-white border-b border-stone-300"
          variants={slideInVariants}
        >
          <motion.div className="h-full flex items-center justify-between px-1" variants={staggerChildren}>
            <motion.div className="w-4 h-2 bg-brown-700 rounded" variants={bounceVariants}></motion.div>
            
            <motion.div className="flex gap-1">
              <motion.div className="w-3 h-0.5 bg-brown-600 rounded" variants={waveVariants}></motion.div>
              <motion.div className="w-4 h-0.5 bg-brown-500 rounded" variants={waveVariants}></motion.div>
              <motion.div className="w-3 h-0.5 bg-brown-400 rounded" variants={waveVariants}></motion.div>
              <motion.div className="w-5 h-0.5 bg-brown-600 rounded" variants={waveVariants}></motion.div>
            </motion.div>
            
            <motion.div className="flex items-center gap-0.5">
              <motion.div className="w-1.5 h-1.5 bg-brown-300 rounded-full" variants={rotateVariants}></motion.div>
              <motion.div className="w-0.5 h-1 bg-brown-500 rounded" variants={slideVariants}></motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div className="absolute top-7 left-1 right-1 bottom-1 bg-stone-100 rounded border border-stone-200" variants={fadeInVariants}>
          <motion.div className="p-1 space-y-0.5">
            <motion.div className="w-full h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-2/3 h-0.5 bg-brown-300 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-full h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const ActivityGaugesThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="w-full h-full flex items-center justify-center relative" variants={staggerChildren}>
        {/* Main gauge */}
        <motion.div className="relative w-16 h-16">
          {/* Background ring */}
          <motion.div 
            className="absolute inset-0 w-16 h-16 border-4 border-brown-200 rounded-full"
            variants={itemVariants}
          ></motion.div>
          
          {/* Progress ring with glow effect */}
          <motion.div 
            className="absolute inset-0 w-16 h-16 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, 
                rgb(120 113 108) 0deg, 
                rgb(168 162 158) 120deg, 
                rgb(231 229 228) 120deg 360deg)`
            }}
            variants={{
              rest: { rotate: -90, scale: 1 },
              hover: { 
                rotate: [90, 180, 270, 360 - 90], 
                scale: [1, 1.05, 1],
                transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }
            }}
          >
            <motion.div className="absolute inset-1 bg-white rounded-full"></motion.div>
          </motion.div>
          
          {/* Glowing center */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-brown-700 rounded-full"
            variants={{
              rest: { scale: 1, boxShadow: "0 0 0 rgba(120, 113, 108, 0)" },
              hover: { 
                scale: [1, 1.3, 1], 
                boxShadow: [
                  "0 0 0 rgba(120, 113, 108, 0)",
                  "0 0 8px rgba(120, 113, 108, 0.6)",
                  "0 0 0 rgba(120, 113, 108, 0)"
                ],
                transition: { duration: 2, repeat: Infinity }
              }
            }}
          ></motion.div>
          
          {/* Animated needle */}
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-7 bg-brown-800 rounded-full"
            style={{ transformOrigin: "50% 85%" }}
            variants={{
              rest: { rotate: -30 },
              hover: { 
                rotate: [30, 60, 90, 120],
                transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
              }
            }}
          ></motion.div>
        </motion.div>
        
        {/* Status indicators with enhanced animations */}
        <motion.div className="absolute top-1 right-1 space-y-0.5">
          <motion.div 
            className="w-1.5 h-1.5 bg-green-500 rounded-full"
            variants={{
              rest: { scale: 1, opacity: 0.7 },
              hover: { 
                scale: [1, 1.4, 1], 
                opacity: [0.7, 1, 0.7],
                transition: { duration: 1, repeat: Infinity, delay: 0 }
              }
            }}
          ></motion.div>
          <motion.div 
            className="w-1.5 h-1.5 bg-orange-500 rounded-full"
            variants={{
              rest: { scale: 1, opacity: 0.7 },
              hover: { 
                scale: [1, 1.4, 1], 
                opacity: [0.7, 1, 0.7],
                transition: { duration: 1, repeat: Infinity, delay: 0.3 }
              }
            }}
          ></motion.div>
          <motion.div 
            className="w-1.5 h-1.5 bg-red-500 rounded-full"
            variants={{
              rest: { scale: 1, opacity: 0.7 },
              hover: { 
                scale: [1, 1.4, 1], 
                opacity: [0.7, 1, 0.7],
                transition: { duration: 1, repeat: Infinity, delay: 0.6 }
              }
            }}
          ></motion.div>
        </motion.div>
        
        {/* Value display */}
        <motion.div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <motion.div 
            className="w-8 h-1 bg-brown-600 rounded"
            variants={{
              rest: { scaleX: 0.6 },
              hover: { scaleX: [0.6, 1, 0.8, 1], transition: { duration: 2, repeat: Infinity } }
            }}
          ></motion.div>
        </motion.div>
        
        {/* Performance metrics */}
        <motion.div className="absolute top-0 left-0 w-4 h-3 bg-brown-50 rounded border border-brown-200 p-0.5">
          <motion.div className="space-y-0.5">
            <motion.div 
              className="w-2 h-0.5 bg-green-600 rounded"
              variants={{
                rest: { scaleX: 0.5 },
                hover: { scaleX: [0.5, 1, 0.7], transition: { duration: 1.5, repeat: Infinity } }
              }}
            ></motion.div>
            <motion.div 
              className="w-3 h-0.5 bg-blue-500 rounded"
              variants={{
                rest: { scaleX: 0.3 },
                hover: { scaleX: [0.3, 0.9, 0.6], transition: { duration: 1.5, repeat: Infinity, delay: 0.2 } }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const SlideoutMenusThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="w-full h-full bg-stone-50 rounded-lg relative overflow-hidden" variants={staggerChildren}>
        <motion.div className="absolute inset-0 bg-stone-100 rounded-lg" variants={itemVariants}>
          <motion.div className="p-2 space-y-1">
            <motion.div className="w-full h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-3/4 h-0.5 bg-brown-300 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-full h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-1/2 h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute top-1 left-1 w-3 h-2 bg-brown-700 rounded"
          variants={bounceVariants}
        >
          <motion.div className="w-full h-full flex flex-col justify-center items-center gap-0.5">
            <motion.div className="w-2 h-0.5 bg-white rounded" variants={waveVariants}></motion.div>
            <motion.div className="w-2 h-0.5 bg-white rounded" variants={waveVariants}></motion.div>
            <motion.div className="w-2 h-0.5 bg-white rounded" variants={waveVariants}></motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute top-0 bottom-0 bg-brown-600 rounded-l-lg shadow-lg"
          variants={{
            rest: { left: "-50%", width: "50%" },
            hover: { left: "0%", width: "50%", transition: { duration: 0.6, ease: "easeInOut" } }
          }}
        >
          <motion.div className="p-1 space-y-1" variants={staggerChildren}>
            <motion.div className="w-full h-1.5 bg-brown-200 rounded mb-1" variants={slideInVariants}></motion.div>
            
            <motion.div className="space-y-0.5">
              <motion.div className="w-full h-1 bg-brown-100 rounded" variants={slideInVariants}></motion.div>
              <motion.div className="w-4/5 h-1 bg-brown-200 rounded" variants={slideInVariants}></motion.div>
              <motion.div className="w-full h-1 bg-brown-100 rounded" variants={slideInVariants}></motion.div>
              <motion.div className="w-3/4 h-1 bg-brown-200 rounded" variants={slideInVariants}></motion.div>
              <motion.div className="w-full h-1 bg-brown-100 rounded" variants={slideInVariants}></motion.div>
            </motion.div>
            
            <motion.div className="absolute bottom-1 left-1 right-1">
              <motion.div className="w-full h-0.5 bg-brown-300 rounded" variants={fadeInVariants}></motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 bg-black rounded-lg"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 0.2, transition: { duration: 0.4 } }
          }}
        ></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

// =======================
// ALL OTHER UNIQUE THUMBNAILS
// =======================

export const ReadMeThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-1 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="relative w-full h-full overflow-hidden rounded-lg bg-white">
        
        {/* White Document Card Background */}
        <motion.div 
          className="absolute inset-0 bg-white rounded-lg border-2 border-brown-700 p-1"
          variants={{
            rest: { opacity: 1, scale: 1 },
            hover: { 
              opacity: 1,
              scale: [1, 1.02, 1],
              transition: { duration: 6, repeat: Infinity }
            }
          }}
        >
          {/* Document Header */}
          <motion.div 
            className="w-full h-2 bg-brown-700 rounded-t mb-1 flex items-center justify-between px-1"
            variants={{
              rest: { opacity: 0.9 },
              hover: { 
                opacity: 1,
                transition: { delay: 0.2 }
              }
            }}
          >
            <motion.div className="flex gap-0.5">
              <motion.div className="w-1 h-1 bg-red-400 rounded-full" variants={pulseVariants}></motion.div>
              <motion.div className="w-1 h-1 bg-yellow-400 rounded-full" variants={pulseVariants}></motion.div>
              <motion.div className="w-1 h-1 bg-green-400 rounded-full" variants={pulseVariants}></motion.div>
            </motion.div>
            <motion.div className="w-8 h-0.5 bg-brown-100 rounded" variants={fillVariants}></motion.div>
          </motion.div>

          {/* Inner Content Card */}
          <motion.div 
            className="w-full h-16 bg-stone-50 border border-brown-300 rounded relative overflow-hidden"
            variants={{
              rest: { scale: 0.95, opacity: 0.8 },
              hover: { 
                scale: 1,
                opacity: 1,
                transition: { delay: 0.5, duration: 0.4 }
              }
            }}
          >
            {/* Scrollable Content Container */}
            <motion.div 
              className="absolute inset-0 p-1"
              variants={{
                rest: { y: 0 },
                hover: { 
                  y: [0, 0, -40, -40, 0],
                  transition: { 
                    duration: 6, 
                    times: [0, 0.2, 0.7, 0.9, 1],
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }
              }}
            >
              {/* README Title */}
              <motion.div 
                className="w-full h-1.5 bg-brown-800 rounded mb-1"
                variants={{
                  rest: { scaleX: 0, opacity: 0 },
                  hover: { 
                    scaleX: 1,
                    opacity: 1,
                    transition: { delay: 0.8, duration: 0.4 }
                  }
                }}
              ></motion.div>

              {/* Section: Getting Started */}
              <motion.div className="mb-1">
                <motion.div 
                  className="w-12 h-1 bg-brown-700 rounded mb-0.5"
                  variants={{
                    rest: { scaleX: 0, opacity: 0 },
                    hover: { 
                      scaleX: 1,
                      opacity: 1,
                      transition: { delay: 1.2, duration: 0.3 }
                    }
                  }}
                ></motion.div>
                <motion.div className="space-y-0.5">
                  {[
                    { width: 'w-full', color: 'bg-brown-500' },
                    { width: 'w-3/4', color: 'bg-brown-400' },
                    { width: 'w-5/6', color: 'bg-brown-400' },
                    { width: 'w-2/3', color: 'bg-brown-300' },
                  ].map((line, index) => (
                    <motion.div 
                      key={index}
                      className={`${line.width} h-0.5 ${line.color} rounded`}
                      variants={{
                        rest: { scaleX: 0, opacity: 0 },
                        hover: { 
                          scaleX: 1,
                          opacity: 1,
                          transition: { delay: 1.4 + (index * 0.1), duration: 0.2 }
                        }
                      }}
                    ></motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Section: Installation */}
              <motion.div className="mb-1">
                <motion.div 
                  className="w-10 h-1 bg-brown-700 rounded mb-0.5"
                  variants={{
                    rest: { scaleX: 0, opacity: 0 },
                    hover: { 
                      scaleX: 1,
                      opacity: 1,
                      transition: { delay: 2.0, duration: 0.3 }
                    }
                  }}
                ></motion.div>
                <motion.div 
                  className="w-full h-2 bg-stone-900 rounded p-0.5 mb-0.5"
                  variants={{
                    rest: { scale: 0, opacity: 0 },
                    hover: { 
                      scale: 1,
                      opacity: 1,
                      transition: { delay: 2.3, duration: 0.3 }
                    }
                  }}
                >
                  <motion.div className="w-3/4 h-0.5 bg-green-400 rounded"></motion.div>
                </motion.div>
                <motion.div className="space-y-0.5">
                  {[
                    { width: 'w-4/5', color: 'bg-brown-400' },
                    { width: 'w-full', color: 'bg-brown-300' },
                  ].map((line, index) => (
                    <motion.div 
                      key={index}
                      className={`${line.width} h-0.5 ${line.color} rounded`}
                      variants={{
                        rest: { scaleX: 0, opacity: 0 },
                        hover: { 
                          scaleX: 1,
                          opacity: 1,
                          transition: { delay: 2.6 + (index * 0.1), duration: 0.2 }
                        }
                      }}
                    ></motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Section: Usage */}
              <motion.div className="mb-1">
                <motion.div 
                  className="w-8 h-1 bg-brown-700 rounded mb-0.5"
                  variants={{
                    rest: { scaleX: 0, opacity: 0 },
                    hover: { 
                      scaleX: 1,
                      opacity: 1,
                      transition: { delay: 2.9, duration: 0.3 }
                    }
                  }}
                ></motion.div>
                <motion.div className="space-y-0.5">
                  {[
                    { width: 'w-full', color: 'bg-brown-500' },
                    { width: 'w-2/3', color: 'bg-brown-400' },
                    { width: 'w-5/6', color: 'bg-brown-400' },
                    { width: 'w-3/4', color: 'bg-brown-300' },
                    { width: 'w-4/5', color: 'bg-brown-300' },
                  ].map((line, index) => (
                    <motion.div 
                      key={index}
                      className={`${line.width} h-0.5 ${line.color} rounded`}
                      variants={{
                        rest: { scaleX: 0, opacity: 0 },
                        hover: { 
                          scaleX: 1,
                          opacity: 1,
                          transition: { delay: 3.2 + (index * 0.1), duration: 0.2 }
                        }
                      }}
                    ></motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Section: Examples */}
              <motion.div className="mb-1">
                <motion.div 
                  className="w-9 h-1 bg-brown-700 rounded mb-0.5"
                  variants={{
                    rest: { scaleX: 0, opacity: 0 },
                    hover: { 
                      scaleX: 1,
                      opacity: 1,
                      transition: { delay: 3.8, duration: 0.3 }
                    }
                  }}
                ></motion.div>
                <motion.div 
                  className="w-full h-3 bg-stone-900 rounded p-0.5 mb-0.5"
                  variants={{
                    rest: { scale: 0, opacity: 0 },
                    hover: { 
                      scale: 1,
                      opacity: 1,
                      transition: { delay: 4.1, duration: 0.3 }
                    }
                  }}
                >
                  <motion.div className="space-y-0.5">
                    <motion.div className="w-4/5 h-0.5 bg-blue-400 rounded"></motion.div>
                    <motion.div className="w-3/5 h-0.5 bg-yellow-400 rounded"></motion.div>
                    <motion.div className="w-2/3 h-0.5 bg-green-400 rounded"></motion.div>
                  </motion.div>
                </motion.div>
                <motion.div className="space-y-0.5">
                  {[
                    { width: 'w-3/4', color: 'bg-brown-400' },
                    { width: 'w-full', color: 'bg-brown-300' },
                    { width: 'w-4/5', color: 'bg-brown-300' },
                  ].map((line, index) => (
                    <motion.div 
                      key={index}
                      className={`${line.width} h-0.5 ${line.color} rounded`}
                      variants={{
                        rest: { scaleX: 0, opacity: 0 },
                        hover: { 
                          scaleX: 1,
                          opacity: 1,
                          transition: { delay: 4.4 + (index * 0.1), duration: 0.2 }
                        }
                      }}
                    ></motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Section: API Reference */}
              <motion.div className="mb-1">
                <motion.div 
                  className="w-11 h-1 bg-brown-700 rounded mb-0.5"
                  variants={{
                    rest: { scaleX: 0, opacity: 0 },
                    hover: { 
                      scaleX: 1,
                      opacity: 1,
                      transition: { delay: 4.8, duration: 0.3 }
                    }
                  }}
                ></motion.div>
                <motion.div className="space-y-0.5">
                  {[
                    { width: 'w-full', color: 'bg-brown-500' },
                    { width: 'w-5/6', color: 'bg-brown-400' },
                    { width: 'w-2/3', color: 'bg-brown-400' },
                    { width: 'w-3/4', color: 'bg-brown-300' },
                    { width: 'w-4/5', color: 'bg-brown-300' },
                    { width: 'w-full', color: 'bg-brown-300' },
                  ].map((line, index) => (
                    <motion.div 
                      key={index}
                      className={`${line.width} h-0.5 ${line.color} rounded`}
                      variants={{
                        rest: { scaleX: 0, opacity: 0 },
                        hover: { 
                          scaleX: 1,
                          opacity: 1,
                          transition: { delay: 5.1 + (index * 0.08), duration: 0.2 }
                        }
                      }}
                    ></motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              className="absolute right-0.5 top-0.5 bottom-0.5 w-0.5 bg-brown-200 rounded overflow-hidden"
              variants={{
                rest: { opacity: 0 },
                hover: { 
                  opacity: 1,
                  transition: { delay: 1 }
                }
              }}
            >
              <motion.div 
                className="w-full bg-brown-700 rounded"
                variants={{
                  rest: { height: "25%", y: 0 },
                  hover: { 
                    height: ["25%", "25%", "20%", "20%", "25%"],
                    y: [0, 0, 30, 30, 0],
                    transition: { 
                      duration: 6, 
                      times: [0, 0.2, 0.7, 0.9, 1],
                      repeat: Infinity 
                    }
                  }
                }}
              ></motion.div>
            </motion.div>
          </motion.div>

          {/* Footer with action buttons */}
          <motion.div 
            className="flex gap-0.5 justify-end mt-0.5"
            variants={{
              rest: { opacity: 0, y: 2 },
              hover: { 
                opacity: 1, 
                y: 0,
                transition: { delay: 1.5 }
              }
            }}
          >
            <motion.div 
              className="w-3 h-1.5 bg-brown-300 border border-brown-500 rounded"
              variants={buttonVariants}
            ></motion.div>
            <motion.div 
              className="w-3 h-1.5 bg-brown-700 rounded"
              variants={buttonVariants}
            ></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const TypographyThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-4 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="space-y-2" variants={staggerChildren}>
        {/* Display 2XL - Real text instead of wireframe */}
        <motion.div 
          className="text-brown-800 font-bold leading-none"
          style={{ fontSize: '10px' }}
          variants={{
            rest: { opacity: 0.8, scale: 1 },
            hover: { 
              opacity: 1, 
              scale: 1.05,
              transition: { duration: 0.3 }
            }
          }}
        >
          Display 2XL
        </motion.div>
        <motion.div className="w-4/5 h-2 bg-brown-600 rounded" variants={fillVariants}></motion.div>
        <motion.div className="w-full h-1.5 bg-brown-500 rounded" variants={fillVariants}></motion.div>
        <motion.div className="w-3/4 h-1 bg-brown-400 rounded" variants={fillVariants}></motion.div>
        <motion.div className="w-2/3 h-0.5 bg-brown-300 rounded" variants={fillVariants}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const SystemColorsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="grid grid-cols-4 gap-1 h-full" variants={staggerChildren}>
        <motion.div className="bg-brown-800 rounded" variants={pulseVariants}></motion.div>
        <motion.div className="bg-brown-600 rounded" variants={pulseVariants}></motion.div>
        <motion.div className="bg-brown-400 rounded" variants={pulseVariants}></motion.div>
        <motion.div className="bg-brown-200 rounded" variants={pulseVariants}></motion.div>
        <motion.div className="bg-red-500 rounded" variants={pulseVariants}></motion.div>
        <motion.div className="bg-green-500 rounded" variants={pulseVariants}></motion.div>
        <motion.div className="bg-blue-500 rounded" variants={pulseVariants}></motion.div>
        <motion.div className="bg-yellow-500 rounded" variants={pulseVariants}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const IconsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-4 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="grid grid-cols-3 gap-2 h-full" variants={staggerChildren}>
        <motion.div className="bg-brown-600 rounded-full" variants={floatVariants}></motion.div>
        <motion.div className="bg-brown-600 rounded" variants={floatVariants}></motion.div>
        <motion.div className="bg-brown-600 rounded-lg" variants={floatVariants}></motion.div>
        <motion.div className="bg-brown-500 rounded-xl" variants={floatVariants}></motion.div>
        <motion.div className="bg-brown-500 rounded-full" variants={floatVariants}></motion.div>
        <motion.div className="bg-brown-500 rounded" variants={floatVariants}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const ButtonThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-6 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="space-y-3" variants={staggerChildren}>
        <motion.div 
          className="w-16 h-6 bg-brown-700 rounded mx-auto"
          variants={buttonVariants}
        ></motion.div>
        
        <motion.div className="flex gap-2 justify-center">
          <motion.div 
            className="w-12 h-5 bg-brown-300 rounded"
            variants={buttonVariants}
          ></motion.div>
          <motion.div 
            className="w-12 h-5 bg-white border-2 border-brown-700 rounded"
            variants={buttonVariants}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const ChartsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="h-full space-y-1" variants={staggerChildren}>
        {/* Chart header */}
        <motion.div className="flex items-center justify-between">
          <motion.div className="w-8 h-1 bg-brown-700 rounded" variants={fillVariants}></motion.div>
          <motion.div className="flex gap-0.5">
            <motion.div 
              className="w-1 h-1 bg-green-500 rounded-full"
              variants={{
                rest: { scale: 1, opacity: 0.7 },
                hover: { 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                  transition: { duration: 1.5, repeat: Infinity }
                }
              }}
            ></motion.div>
            <motion.div 
              className="w-1 h-1 bg-blue-500 rounded-full"
              variants={{
                rest: { scale: 1, opacity: 0.7 },
                hover: { 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                  transition: { duration: 1.5, delay: 0.3, repeat: Infinity }
                }
              }}
            ></motion.div>
            <motion.div 
              className="w-1 h-1 bg-orange-500 rounded-full"
              variants={{
                rest: { scale: 1, opacity: 0.7 },
                hover: { 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                  transition: { duration: 1.5, delay: 0.6, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Bar chart with glowing bars */}
        <motion.div className="h-8 flex items-end justify-center gap-0.5 relative">
          <motion.div 
            className="w-2 bg-brown-600 rounded-t relative"
            variants={{
              rest: { height: "1rem" },
              hover: { 
                height: "1.5rem",
                transition: { duration: 0.5, delay: 0.1 }
              }
            }}
          >
            {/* Glow effect */}
            <motion.div 
              className="absolute inset-0 bg-brown-400 rounded-t"
              variants={{
                rest: { opacity: 0 },
                hover: { 
                  opacity: [0, 0.6, 0],
                  transition: { duration: 2, repeat: Infinity, delay: 1 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          <motion.div 
            className="w-2 bg-green-500 rounded-t relative"
            variants={{
              rest: { height: "0.75rem" },
              hover: { 
                height: "1.25rem",
                transition: { duration: 0.5, delay: 0.2 }
              }
            }}
          >
            <motion.div 
              className="absolute inset-0 bg-green-300 rounded-t"
              variants={{
                rest: { opacity: 0 },
                hover: { 
                  opacity: [0, 0.6, 0],
                  transition: { duration: 2, repeat: Infinity, delay: 1.2 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          <motion.div 
            className="w-2 bg-blue-500 rounded-t relative"
            variants={{
              rest: { height: "1.25rem" },
              hover: { 
                height: "1.75rem",
                transition: { duration: 0.5, delay: 0.3 }
              }
            }}
          >
            <motion.div 
              className="absolute inset-0 bg-blue-300 rounded-t"
              variants={{
                rest: { opacity: 0 },
                hover: { 
                  opacity: [0, 0.6, 0],
                  transition: { duration: 2, repeat: Infinity, delay: 1.4 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          <motion.div 
            className="w-2 bg-orange-500 rounded-t relative"
            variants={{
              rest: { height: "0.5rem" },
              hover: { 
                height: "1rem",
                transition: { duration: 0.5, delay: 0.4 }
              }
            }}
          >
            <motion.div 
              className="absolute inset-0 bg-orange-300 rounded-t"
              variants={{
                rest: { opacity: 0 },
                hover: { 
                  opacity: [0, 0.6, 0],
                  transition: { duration: 2, repeat: Infinity, delay: 1.6 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          <motion.div 
            className="w-2 bg-purple-500 rounded-t relative"
            variants={{
              rest: { height: "0.875rem" },
              hover: { 
                height: "1.375rem",
                transition: { duration: 0.5, delay: 0.5 }
              }
            }}
          >
            <motion.div 
              className="absolute inset-0 bg-purple-300 rounded-t"
              variants={{
                rest: { opacity: 0 },
                hover: { 
                  opacity: [0, 0.6, 0],
                  transition: { duration: 2, repeat: Infinity, delay: 1.8 }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Line chart overlay */}
        <motion.div className="relative h-4 bg-brown-50 rounded">
          <svg className="w-full h-full" viewBox="0 0 100 20">
            <motion.path
              d="M10,15 L25,8 L40,12 L55,5 L70,10 L85,6"
              stroke="rgb(120 113 108)"
              strokeWidth="1.5"
              fill="none"
              variants={{
                rest: { pathLength: 0, opacity: 0.6 },
                hover: { 
                  pathLength: 1, 
                  opacity: 1,
                  transition: { duration: 2, delay: 2 }
                }
              }}
            />
            {/* Data points */}
            <motion.circle
              cx="10" cy="15" r="1"
              fill="rgb(120 113 108)"
              variants={{
                rest: { scale: 0 },
                hover: { scale: 1, transition: { delay: 2.2 } }
              }}
            />
            <motion.circle
              cx="25" cy="8" r="1"
              fill="rgb(120 113 108)"
              variants={{
                rest: { scale: 0 },
                hover: { scale: 1, transition: { delay: 2.4 } }
              }}
            />
            <motion.circle
              cx="40" cy="12" r="1"
              fill="rgb(120 113 108)"
              variants={{
                rest: { scale: 0 },
                hover: { scale: 1, transition: { delay: 2.6 } }
              }}
            />
            <motion.circle
              cx="55" cy="5" r="1"
              fill="rgb(120 113 108)"
              variants={{
                rest: { scale: 0 },
                hover: { scale: 1, transition: { delay: 2.8 } }
              }}
            />
            <motion.circle
              cx="70" cy="10" r="1"
              fill="rgb(120 113 108)"
              variants={{
                rest: { scale: 0 },
                hover: { scale: 1, transition: { delay: 3 } }
              }}
            />
            <motion.circle
              cx="85" cy="6" r="1"
              fill="rgb(120 113 108)"
              variants={{
                rest: { scale: 0 },
                hover: { scale: 1, transition: { delay: 3.2 } }
              }}
            />
          </svg>
        </motion.div>
        
        {/* Progress indicators */}
        <motion.div className="flex gap-1 justify-center">
          <motion.div 
            className="w-6 h-0.5 bg-brown-200 rounded overflow-hidden"
            variants={{
              rest: { opacity: 0.5 },
              hover: { opacity: 1, transition: { delay: 3.5 } }
            }}
          >
            <motion.div 
              className="h-full bg-brown-700 rounded"
              variants={{
                rest: { width: "30%" },
                hover: { 
                  width: "85%",
                  transition: { duration: 1.5, delay: 3.7 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          <motion.div 
            className="w-4 h-0.5 bg-green-200 rounded overflow-hidden"
            variants={{
              rest: { opacity: 0.5 },
              hover: { opacity: 1, transition: { delay: 3.6 } }
            }}
          >
            <motion.div 
              className="h-full bg-green-600 rounded"
              variants={{
                rest: { width: "60%" },
                hover: { 
                  width: "95%",
                  transition: { duration: 1.2, delay: 3.9 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          <motion.div 
            className="w-5 h-0.5 bg-blue-200 rounded overflow-hidden"
            variants={{
              rest: { opacity: 0.5 },
              hover: { opacity: 1, transition: { delay: 3.7 } }
            }}
          >
            <motion.div 
              className="h-full bg-blue-600 rounded"
              variants={{
                rest: { width: "45%" },
                hover: { 
                  width: "75%",
                  transition: { duration: 1.8, delay: 4.1 }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const FormsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="space-y-1.5" variants={staggerChildren}>
        {/* Form title */}
        <motion.div className="w-16 h-1.5 bg-brown-700 rounded mb-1" variants={fillVariants}></motion.div>
        
        {/* First name field with typing */}
        <motion.div className="space-y-0.5">
          <motion.div className="w-10 h-0.5 bg-brown-700 rounded" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-full h-2.5 bg-brown-50 border border-brown-300 rounded px-1 flex items-center relative"
            variants={{
              rest: { borderColor: "rgb(168 162 158)" },
              hover: { borderColor: "rgb(120 113 108)" }
            }}
          >
            <motion.div 
              className="w-6 h-0.5 bg-brown-500 rounded"
              variants={{
                rest: { scaleX: 0 },
                hover: { scaleX: 1, transition: { duration: 1.2, delay: 0.5 } }
              }}
            ></motion.div>
            <motion.div 
              className="w-0.5 h-1.5 bg-brown-700 ml-0.5"
              variants={{
                rest: { opacity: 0 },
                hover: { 
                  opacity: [0, 1, 0],
                  transition: { duration: 0.8, repeat: Infinity, delay: 1.2 }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Email field with validation */}
        <motion.div className="space-y-0.5">
          <motion.div className="w-8 h-0.5 bg-brown-700 rounded" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-full h-2.5 bg-brown-50 border border-brown-300 rounded px-1 flex items-center relative"
            variants={{
              rest: { borderColor: "rgb(168 162 158)" },
              hover: { 
                borderColor: "rgb(34 197 94)",
                transition: { delay: 2 }
              }
            }}
          >
            <motion.div 
              className="w-12 h-0.5 bg-brown-500 rounded"
              variants={{
                rest: { scaleX: 0.3 },
                hover: { scaleX: 1, transition: { duration: 1, delay: 1 } }
              }}
            ></motion.div>
            
            {/* @ symbol */}
            <motion.div 
              className="w-1 h-0.5 bg-brown-600 rounded ml-0.5"
              variants={{
                rest: { opacity: 0, scaleX: 0 },
                hover: { 
                  opacity: 1, 
                  scaleX: 1,
                  transition: { duration: 0.3, delay: 1.8 }
                }
              }}
            ></motion.div>
            
            {/* Domain typing */}
            <motion.div 
              className="w-4 h-0.5 bg-brown-500 rounded ml-0.5"
              variants={{
                rest: { scaleX: 0 },
                hover: { 
                  scaleX: 1,
                  transition: { duration: 0.8, delay: 2 }
                }
              }}
            ></motion.div>
            
            {/* Valid email checkmark */}
            <motion.div 
              className="absolute right-1 w-1 h-1 bg-green-500 rounded-full"
              variants={{
                rest: { scale: 0, opacity: 0 },
                hover: { 
                  scale: 1, 
                  opacity: 1,
                  transition: { delay: 2.5 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Validation message */}
          <motion.div 
            className="flex items-center gap-1"
            variants={{
              rest: { opacity: 0, y: -2 },
              hover: { 
                opacity: 1, 
                y: 0,
                transition: { delay: 2.7 }
              }
            }}
          >
            <motion.div className="w-0.5 h-0.5 bg-green-500 rounded-full"></motion.div>
            <motion.div className="w-8 h-0.5 bg-green-600 rounded"></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Submit button with hover effect */}
        <motion.div 
          className="w-full h-2.5 bg-brown-700 rounded mx-auto mt-2 relative overflow-hidden"
          variants={{
            rest: { scale: 1 },
            hover: { 
              scale: 1.02,
              transition: { delay: 3 }
            }
          }}
        >
          <motion.div className="w-8 h-0.5 bg-brown-100 rounded mx-auto mt-1" variants={fillVariants}></motion.div>
          
          {/* Button loading indicator */}
          <motion.div 
            className="absolute inset-0 bg-brown-800 rounded"
            variants={{
              rest: { scaleX: 0 },
              hover: { 
                scaleX: [0, 1, 0],
                transition: { duration: 1.5, delay: 3.5 }
              }
            }}
            style={{ originX: 0 }}
          >
            <motion.div className="w-6 h-0.5 bg-brown-100 rounded mx-auto mt-1"></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Form progress indicator */}
        <motion.div 
          className="flex gap-0.5 justify-center mt-1"
          variants={{
            rest: { opacity: 0 },
            hover: { 
              opacity: 1,
              transition: { delay: 1.5 }
            }
          }}
        >
          <motion.div className="w-2 h-0.5 bg-brown-700 rounded" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-2 h-0.5 bg-brown-300 rounded"
            variants={{
              rest: { backgroundColor: "rgb(168 162 158)" },
              hover: { 
                backgroundColor: "rgb(120 113 108)",
                transition: { delay: 2.5 }
              }
            }}
          ></motion.div>
          <motion.div className="w-2 h-0.5 bg-brown-200 rounded"></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const InputThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="space-y-2" variants={staggerChildren}>
        {/* Single line input with typing */}
        <motion.div className="space-y-1">
          <motion.div className="w-12 h-1 bg-brown-700 rounded" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-full h-3 bg-brown-50 border border-brown-300 rounded px-1 flex items-center relative"
            variants={{
              rest: { borderColor: "rgb(168 162 158)" },
              hover: { 
                borderColor: "rgb(120 113 108)",
                boxShadow: "0 0 0 1px rgb(120 113 108, 0.3)"
              }
            }}
          >
            {/* Typed text appearing */}
            <motion.div 
              className="w-8 h-0.5 bg-brown-500 rounded"
              variants={{
                rest: { scaleX: 0.3 },
                hover: { scaleX: 1, transition: { duration: 1.5 } }
              }}
            ></motion.div>
            
            {/* Additional characters typing */}
            <motion.div 
              className="w-3 h-0.5 bg-brown-600 rounded ml-0.5"
              variants={{
                rest: { scaleX: 0, opacity: 0 },
                hover: { 
                  scaleX: 1, 
                  opacity: 1,
                  transition: { duration: 0.5, delay: 1 }
                }
              }}
            ></motion.div>
            
            {/* Blinking cursor */}
            <motion.div 
              className="w-0.5 h-2 bg-brown-700 ml-0.5"
              variants={{
                rest: { opacity: 0.3 },
                hover: { 
                  opacity: [0.3, 1, 0.3],
                  scaleY: [1, 1.1, 1],
                  transition: { duration: 1, repeat: Infinity }
                }
              }}
            ></motion.div>
            
            {/* Input focus glow */}
            <motion.div 
              className="absolute inset-0 rounded pointer-events-none"
              variants={{
                rest: { boxShadow: "0 0 0 0 transparent" },
                hover: { 
                  boxShadow: [
                    "0 0 0 0 transparent",
                    "0 0 0 2px rgba(120, 113, 108, 0.1)",
                    "0 0 0 0 transparent"
                  ],
                  transition: { duration: 2, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Textarea with multi-line typing */}
        <motion.div className="space-y-1">
          <motion.div className="w-16 h-1 bg-brown-700 rounded" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-full h-6 bg-brown-50 border border-brown-300 rounded p-1 relative"
            variants={{
              rest: { borderColor: "rgb(168 162 158)" },
              hover: { 
                borderColor: "rgb(120 113 108)",
                transition: { delay: 0.5 }
              }
            }}
          >
            {/* Line 1 */}
            <motion.div 
              className="w-full h-0.5 bg-brown-300 rounded"
              variants={{
                rest: { scaleX: 0.6 },
                hover: { scaleX: 1, transition: { duration: 1, delay: 0.2 } }
              }}
            ></motion.div>
            
            {/* Line 2 - typing in progress */}
            <motion.div className="flex items-center mt-0.5 gap-0.5">
              <motion.div 
                className="w-3/4 h-0.5 bg-brown-200 rounded"
                variants={{
                  rest: { scaleX: 0.2 },
                  hover: { scaleX: 1, transition: { duration: 1.2, delay: 0.8 } }
                }}
              ></motion.div>
              
              {/* Typing indicator for textarea */}
              <motion.div 
                className="w-0.5 h-1 bg-brown-700"
                variants={{
                  rest: { opacity: 0 },
                  hover: { 
                    opacity: [0, 1, 0],
                    transition: { duration: 0.8, repeat: Infinity, delay: 1.5 }
                  }
                }}
              ></motion.div>
            </motion.div>
            
            {/* Character count indicator */}
            <motion.div 
              className="absolute bottom-0.5 right-0.5 w-2 h-0.5 bg-brown-400 rounded opacity-60"
              variants={{
                rest: { scaleX: 0.5 },
                hover: { scaleX: 1, transition: { delay: 1 } }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Input validation indicator */}
        <motion.div 
          className="flex items-center gap-1"
          variants={{
            rest: { opacity: 0, y: 2 },
            hover: { 
              opacity: 1, 
              y: 0,
              transition: { delay: 2 }
            }
          }}
        >
          <motion.div className="w-1 h-1 bg-green-500 rounded-full" variants={pulseVariants}></motion.div>
          <motion.div className="w-8 h-0.5 bg-green-600 rounded" variants={fillVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const CardHeadersThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="space-y-3" variants={staggerChildren}>
        <motion.div 
          className="w-full h-4 bg-brown-700 rounded"
          variants={fillVariants}
        ></motion.div>
        
        <motion.div 
          className="w-2/3 h-2 bg-brown-400 rounded"
          variants={fillVariants}
        ></motion.div>
        
        <motion.div 
          className="w-16 h-6 bg-brown-700 rounded ml-auto"
          variants={buttonVariants}
        ></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

// Create all other unique thumbnails based on their component types
export const AccordionThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="space-y-1" variants={staggerChildren}>
        <motion.div 
          className="w-full h-4 bg-brown-50 border border-brown-200 rounded flex items-center justify-between px-2"
          variants={itemVariants}
        >
          <motion.div className="w-12 h-1 bg-brown-600 rounded-lg" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-2 h-0.5 bg-brown-500 rounded-full"
            variants={{ rest: { scaleX: 1 }, hover: { scaleX: 1.5 } }}
          />
        </motion.div>
        
        <motion.div 
          className="w-full bg-brown-50 border border-brown-200 rounded overflow-hidden"
          variants={{ rest: { height: "1rem" }, hover: { height: "2rem" } }}
        >
          <motion.div className="px-2 py-1 space-y-0.5">
            <motion.div className="w-full h-0.5 bg-brown-300 rounded-lg" variants={fillVariants}></motion.div>
            <motion.div className="w-3/4 h-0.5 bg-brown-200 rounded-lg" variants={fillVariants}></motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="w-full h-4 bg-brown-50 border border-brown-200 rounded flex items-center justify-between px-2"
          variants={itemVariants}
        >
          <motion.div className="w-10 h-1 bg-brown-600 rounded-lg" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-2 h-0.5 bg-brown-500 rounded-full"
            variants={{ rest: { scaleX: 1 }, hover: { scaleX: 1.5 } }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const AuthCardThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="space-y-2" variants={staggerChildren}>
        <motion.div className="w-16 h-1.5 bg-brown-700 rounded-lg mx-auto" variants={fillVariants}></motion.div>
        <motion.div className="w-20 h-1 bg-brown-500 rounded-lg mx-auto" variants={fillVariants}></motion.div>
        <motion.div className="space-y-1">
          <motion.div className="w-full h-2 bg-brown-100 rounded border border-brown-300" variants={itemVariants}></motion.div>
          <motion.div className="w-full h-2 bg-brown-100 rounded border border-brown-300" variants={itemVariants}></motion.div>
        </motion.div>
        <motion.div className="w-full h-3 bg-brown-700 rounded mx-auto" variants={buttonVariants}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

// Create simple but unique designs for all remaining thumbnails
export const BreadcrumbsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-1 shadow-sm" variants={itemVariants}>
      <motion.div className="relative h-full overflow-hidden rounded-lg bg-stone-50 p-1" variants={staggerChildren}>
        
        {/* Header with navigation - always visible */}
        <motion.div 
          className="w-full h-2 bg-brown-700 rounded mb-1 flex items-center justify-between px-1"
          variants={{
            rest: { opacity: 0.9 },
            hover: { 
              opacity: 1,
              y: [0, -1, 0],
              transition: { duration: 1.5, repeat: Infinity }
            }
          }}
        >
          <motion.div 
            className="w-2 h-0.5 bg-brown-100 rounded"
            variants={{
              rest: { scaleX: 0.8 },
              hover: { 
                scaleX: 1,
                transition: { delay: 0.2, duration: 0.3 }
              }
            }}
          ></motion.div>
          <motion.div 
            className="w-1 h-1 bg-brown-200 rounded-full"
            variants={{
              rest: { scale: 0.8 },
              hover: { 
                scale: [0.8, 1.2, 0.8],
                transition: { delay: 0.4, duration: 2, repeat: Infinity }
              }
            }}
          ></motion.div>
        </motion.div>

        {/* Main Breadcrumb Navigation - always visible */}
        <motion.div 
          className="flex items-center gap-0.5 mb-1"
          variants={{
            rest: { opacity: 0.9 },
            hover: { 
              opacity: 1,
              x: [0, 1, 0],
              transition: { duration: 2, repeat: Infinity }
            }
          }}
        >
          {/* Home */}
          <motion.div 
            className="w-3 h-1 bg-brown-400 rounded flex items-center justify-center relative"
            variants={{
              rest: { scaleX: 0.9 },
              hover: { 
                scaleX: [0.9, 1.1, 0.9],
                backgroundColor: "rgb(231 229 228)",
                transition: { 
                  delay: 0.5, 
                  duration: 1.5, 
                  repeat: Infinity,
                  backgroundColor: { delay: 1, duration: 0.5 }
                }
              }
            }}
          >
            <motion.div 
              className="w-0.5 h-0.5 bg-brown-700 rounded-full"
              variants={{
                rest: { scale: 0.8 },
                hover: { 
                  scale: [0.8, 1.2, 0.8],
                  transition: { delay: 0.7, duration: 1.5, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Separator 1 */}
          <motion.div 
            className="w-0.5 h-0.5 bg-brown-400 rounded-full"
            variants={{
              rest: { scale: 0.8 },
              hover: { 
                scale: [0.8, 1.3, 0.8],
                opacity: [0.8, 1, 0.8],
                transition: { delay: 1, duration: 1.5, repeat: Infinity }
              }
            }}
          ></motion.div>
          
          {/* HR Department */}
          <motion.div 
            className="w-4 h-1 bg-brown-400 rounded"
            variants={{
              rest: { scaleX: 0.9 },
              hover: { 
                scaleX: [0.9, 1.1, 0.9],
                backgroundColor: "rgb(231 229 228)",
                transition: { 
                  delay: 1.2, 
                  duration: 1.5, 
                  repeat: Infinity,
                  backgroundColor: { delay: 2, duration: 0.5 }
                }
              }
            }}
          ></motion.div>
          
          {/* Separator 2 */}
          <motion.div 
            className="w-0.5 h-0.5 bg-brown-400 rounded-full"
            variants={{
              rest: { scale: 0.8 },
              hover: { 
                scale: [0.8, 1.3, 0.8],
                opacity: [0.8, 1, 0.8],
                transition: { delay: 1.4, duration: 1.5, repeat: Infinity }
              }
            }}
          ></motion.div>
          
          {/* Employees (Active) */}
          <motion.div 
            className="w-5 h-1 bg-brown-700 rounded relative"
            variants={{
              rest: { scaleX: 0.95 },
              hover: { 
                scaleX: [0.95, 1.05, 0.95],
                transition: { delay: 1.6, duration: 1.5, repeat: Infinity }
              }
            }}
          >
            {/* Active indicator */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-brown-800 rounded"
              variants={{
                rest: { scaleX: 0.8 },
                hover: { 
                  scaleX: 1,
                  transition: { delay: 1.8, duration: 0.4 }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>

        {/* Secondary Breadcrumb (Sub-navigation) - always visible */}
        <motion.div 
          className="flex items-center gap-0.5 mb-1 pl-1"
          variants={{
            rest: { opacity: 0.8 },
            hover: { 
              opacity: 1,
              x: [0, 0.5, 0],
              transition: { duration: 2, delay: 0.5, repeat: Infinity }
            }
          }}
        >
          {['All', 'Active', 'New Hires'].map((item, index) => (
            <React.Fragment key={item}>
              <motion.div 
                className={`w-${2 + index} h-0.5 ${index === 1 ? 'bg-brown-600' : 'bg-brown-300'} rounded`}
                variants={{
                  rest: { scaleX: 0.8, opacity: 0.8 },
                  hover: { 
                    scaleX: 1,
                    opacity: 1,
                    backgroundColor: index === 1 ? "rgb(120 113 108)" : 
                                    index === 0 ? "rgb(231 229 228)" : "rgb(168 162 158)",
                    transition: { 
                      delay: 2 + (index * 0.1), 
                      duration: 0.3,
                      backgroundColor: { delay: 2.5 + (index * 0.3), duration: 0.4 }
                    }
                  }
                }}
              ></motion.div>
              {index < 2 && (
                <motion.div 
                  className="w-0.5 h-0.5 bg-brown-300 rounded-full"
                  variants={{
                    rest: { scale: 0.7 },
                    hover: { 
                      scale: [0.7, 1.1, 0.7],
                      transition: { delay: 2.2 + (index * 0.1), duration: 1.5, repeat: Infinity }
                    }
                  }}
                ></motion.div>
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Page Content - always visible */}
        <motion.div 
          className="w-full bg-white border border-brown-200 rounded flex-1 p-1"
          variants={{
            rest: { opacity: 0.9, scale: 0.98 },
            hover: { 
              opacity: 1,
              scale: [0.98, 1.01, 0.98],
              transition: { delay: 2.5, duration: 2, repeat: Infinity }
            }
          }}
        >
          {/* Page Title */}
          <motion.div 
            className="w-full h-1 bg-brown-700 rounded mb-1"
            variants={{
              rest: { scaleX: 0.9 },
              hover: { 
                scaleX: 1,
                transition: { delay: 3, duration: 0.4 }
              }
            }}
          ></motion.div>
          
          {/* Content Grid */}
          <motion.div className="grid grid-cols-2 gap-0.5 h-8">
            {[0, 1, 2, 3].map((index) => (
              <motion.div 
                key={index}
                className="bg-stone-50 border border-brown-200 rounded p-0.5"
                variants={{
                  rest: { scale: 0.95, opacity: 0.8 },
                  hover: { 
                    scale: [0.95, 1.02, 0.95],
                    opacity: 1,
                    transition: { 
                      delay: 3.5 + (index * 0.1), 
                      duration: 2,
                      repeat: Infinity
                    }
                  }
                }}
              >
                {/* Employee Card Header */}
                <motion.div 
                  className="w-full h-0.5 bg-brown-600 rounded mb-0.5"
                  variants={{
                    rest: { scaleX: 0.8 },
                    hover: { 
                      scaleX: 1,
                      transition: { delay: 3.2 + (index * 0.1), duration: 0.2 }
                    }
                  }}
                ></motion.div>
                
                {/* Employee Info */}
                <motion.div className="space-y-0.5">
                  <motion.div 
                    className="w-3/4 h-0.5 bg-brown-400 rounded"
                    variants={{
                      rest: { scaleX: 0.7 },
                      hover: { 
                        scaleX: 1,
                        transition: { delay: 3.4 + (index * 0.1), duration: 0.2 }
                      }
                    }}
                  ></motion.div>
                  <motion.div 
                    className="w-1/2 h-0.5 bg-brown-300 rounded"
                    variants={{
                      rest: { scaleX: 0.6 },
                      hover: { 
                        scaleX: 1,
                        transition: { delay: 3.6 + (index * 0.1), duration: 0.2 }
                      }
                    }}
                  ></motion.div>
                </motion.div>
                
                {/* Status Badge */}
                <motion.div 
                  className={`w-1.5 h-0.5 bg-${['green', 'blue', 'orange', 'red'][index]}-500 rounded mt-0.5 ml-auto`}
                  variants={{
                    rest: { scale: 0.8 },
                    hover: { 
                      scale: [0.8, 1.1, 0.8],
                      transition: { delay: 3.8 + (index * 0.1), duration: 1.5, repeat: Infinity }
                    }
                  }}
                ></motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Breadcrumb Action Buttons - always visible */}
        <motion.div 
          className="absolute bottom-1 right-1 flex gap-0.5"
          variants={{
            rest: { opacity: 0.8 },
            hover: { 
              opacity: 1,
              transition: { delay: 4, duration: 0.3 }
            }
          }}
        >
          <motion.div 
            className="w-1 h-1 bg-brown-600 rounded"
            variants={{
              rest: { scale: 0.8 },
              hover: { 
                scale: [0.8, 1.2, 0.8],
                transition: { delay: 4.2, duration: 1.5, repeat: Infinity }
              }
            }}
          ></motion.div>
          <motion.div 
            className="w-1 h-1 bg-brown-400 rounded"
            variants={{
              rest: { scale: 0.8 },
              hover: { 
                scale: [0.8, 1.1, 0.8],
                transition: { delay: 4.4, duration: 1.5, repeat: Infinity }
              }
            }}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const ColorPickerThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-2" variants={staggerChildren}>
        <motion.div className="w-16 h-12 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg mx-auto relative" variants={itemVariants}>
          <motion.div className="absolute top-1 left-1 w-2 h-2 bg-white border border-gray-300 rounded-full" variants={floatVariants}></motion.div>
        </motion.div>
        <motion.div className="flex gap-1 justify-center" variants={staggerChildren}>
          <motion.div className="w-3 h-3 bg-red-500 rounded" variants={pulseVariants}></motion.div>
          <motion.div className="w-3 h-3 bg-green-500 rounded" variants={pulseVariants}></motion.div>
          <motion.div className="w-3 h-3 bg-blue-500 rounded" variants={pulseVariants}></motion.div>
          <motion.div className="w-3 h-3 bg-yellow-500 rounded" variants={pulseVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const CommandMenuThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-1.5" variants={staggerChildren}>
        <motion.div className="w-full h-2.5 bg-brown-100 border border-brown-300 rounded flex items-center px-2" variants={itemVariants}>
          <motion.div className="w-8 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
        </motion.div>
        <motion.div className="space-y-1">
          <motion.div className="w-full h-2 bg-brown-50 hover:bg-brown-100 rounded flex items-center px-2" variants={itemVariants}>
            <motion.div className="w-12 h-0.5 bg-brown-600 rounded" variants={slideVariants}></motion.div>
          </motion.div>
          <motion.div className="w-full h-2 bg-brown-100 rounded flex items-center px-2" variants={itemVariants}>
            <motion.div className="w-14 h-0.5 bg-brown-700 rounded" variants={slideVariants}></motion.div>
          </motion.div>
          <motion.div className="w-full h-2 bg-brown-50 hover:bg-brown-100 rounded flex items-center px-2" variants={itemVariants}>
            <motion.div className="w-8 h-0.5 bg-brown-400 rounded" variants={slideVariants}></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const DrawerThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="w-full h-full bg-stone-50 rounded-lg relative overflow-hidden" variants={staggerChildren}>
        {/* Main content area */}
        <motion.div className="absolute inset-0 bg-stone-100 rounded-lg p-2">
          <motion.div className="space-y-1">
            <motion.div className="w-full h-1 bg-brown-600 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-3/4 h-1 bg-brown-500 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-full h-1 bg-brown-400 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-1/2 h-1 bg-brown-400 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-2/3 h-1 bg-brown-300 rounded" variants={fillVariants}></motion.div>
          </motion.div>
          
          {/* Menu trigger button */}
          <motion.div 
            className="absolute top-1 left-1 w-3 h-2 bg-brown-700 rounded flex items-center justify-center"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: 1.1,
                transition: { delay: 0.1 }
              }
            }}
          >
            <motion.div className="space-y-0.5">
              <motion.div className="w-2 h-0.5 bg-brown-100 rounded"></motion.div>
              <motion.div className="w-2 h-0.5 bg-brown-100 rounded"></motion.div>
              <motion.div className="w-2 h-0.5 bg-brown-100 rounded"></motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Drawer panel sliding in */}
        <motion.div 
          className="absolute top-0 bottom-0 bg-brown-600 rounded-l-lg shadow-lg"
          variants={{
            rest: { left: "-60%", width: "60%" },
            hover: { 
              left: "0%", 
              width: "60%",
              transition: { 
                duration: 0.6, 
                ease: "easeInOut",
                delay: 0.3
              }
            }
          }}
        >
          <motion.div className="p-1.5 space-y-1 h-full" variants={staggerChildren}>
            {/* Drawer header */}
            <motion.div 
              className="w-full h-2 bg-brown-200 rounded mb-1"
              variants={{
                rest: { opacity: 0, x: -10 },
                hover: { 
                  opacity: 1, 
                  x: 0,
                  transition: { delay: 0.8 }
                }
              }}
            ></motion.div>
            
            {/* Drawer menu items */}
            <motion.div className="space-y-0.5">
              <motion.div 
                className="w-full h-1.5 bg-brown-100 rounded"
                variants={{
                  rest: { opacity: 0, x: -10 },
                  hover: { 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 1 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-4/5 h-1.5 bg-brown-200 rounded"
                variants={{
                  rest: { opacity: 0, x: -10 },
                  hover: { 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 1.2 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-full h-1.5 bg-brown-100 rounded"
                variants={{
                  rest: { opacity: 0, x: -10 },
                  hover: { 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 1.4 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-3/4 h-1.5 bg-brown-200 rounded"
                variants={{
                  rest: { opacity: 0, x: -10 },
                  hover: { 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 1.6 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-full h-1.5 bg-brown-100 rounded"
                variants={{
                  rest: { opacity: 0, x: -10 },
                  hover: { 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 1.8 }
                  }
                }}
              ></motion.div>
            </motion.div>
            
            {/* Drawer footer */}
            <motion.div 
              className="absolute bottom-1 left-1 right-1"
              variants={{
                rest: { opacity: 0, y: 10 },
                hover: { 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 2 }
                }
              }}
            >
              <motion.div className="w-full h-0.5 bg-brown-300 rounded"></motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Overlay backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black rounded-lg"
          variants={{
            rest: { opacity: 0 },
            hover: { 
              opacity: 0.3,
              transition: { duration: 0.4, delay: 0.5 }
            }
          }}
        ></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

// Create simple placeholder thumbnails for the remaining components to prevent duplicates
export const LayoutThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-1 shadow-sm" variants={itemVariants}>
      <motion.div className="relative h-full overflow-hidden rounded-lg bg-stone-50" variants={staggerChildren}>
        
        {/* Single Scene: HR Dashboard Layout */}
        <motion.div className="absolute inset-0 flex">
          {/* Sidebar */}
          <motion.div 
            className="w-6 bg-brown-700 rounded-l-lg flex flex-col"
            variants={{
              rest: { opacity: 1 },
              hover: { 
                opacity: 1,
                x: [0, -1, 0],
                transition: { duration: 2, repeat: Infinity }
              }
            }}
          >
            {/* Logo area */}
            <motion.div 
              className="h-2 bg-brown-800 rounded-tl-lg mb-0.5"
              variants={{
                rest: { opacity: 0.8 },
                hover: { 
                  opacity: 1,
                  scale: [1, 1.05, 1],
                  transition: { delay: 0.2, duration: 1.5, repeat: Infinity }
                }
              }}
            ></motion.div>
            
            {/* Navigation items */}
            <motion.div className="flex-1 px-0.5 py-0.5 space-y-0.5">
              {[0, 1, 2, 3].map((index) => (
                <motion.div 
                  key={index}
                  className={`h-1 ${index === 0 ? 'bg-brown-100' : 'bg-brown-200'} rounded`}
                  variants={{
                    rest: { scaleX: 0.8, opacity: 0.7 },
                    hover: { 
                      scaleX: 1, 
                      opacity: 1,
                      backgroundColor: index === 0 ? "rgb(231 229 228)" : 
                                      index === 1 ? "rgb(231 229 228)" : "rgb(231 229 228)",
                      transition: { 
                        delay: 0.3 + (index * 0.2),
                        duration: 0.5,
                        backgroundColor: { delay: 1 + (index * 0.8), duration: 0.6 }
                      }
                    }
                  }}
                ></motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div className="flex-1 flex flex-col ml-0.5">
            {/* Top Header */}
            <motion.div 
              className="h-2.5 bg-white border border-brown-200 rounded-tr-lg flex items-center justify-between px-1"
              variants={{
                rest: { opacity: 0.9 },
                hover: { 
                  opacity: 1,
                  y: [0, -1, 0],
                  transition: { duration: 1.5, delay: 0.5, repeat: Infinity }
                }
              }}
            >
              <motion.div 
                className="w-8 h-0.5 bg-brown-600 rounded"
                variants={{
                  rest: { scaleX: 0.8 },
                  hover: { 
                    scaleX: 1,
                    transition: { delay: 0.8, duration: 0.4 }
                  }
                }}
              ></motion.div>
              <motion.div className="flex gap-0.5">
                <motion.div 
                  className="w-1 h-1 bg-brown-400 rounded-full" 
                  variants={{
                    rest: { scale: 0.9 },
                    hover: { 
                      scale: [0.9, 1.2, 0.9],
                      transition: { delay: 1, duration: 2, repeat: Infinity }
                    }
                  }}
                ></motion.div>
                <motion.div 
                  className="w-1 h-1 bg-brown-300 rounded"
                  variants={{
                    rest: { scale: 0.9 },
                    hover: { 
                      scale: [0.9, 1.1, 0.9],
                      transition: { delay: 1.2, duration: 2, repeat: Infinity }
                    }
                  }}
                ></motion.div>
              </motion.div>
            </motion.div>

            {/* Dashboard Content Grid */}
            <motion.div className="flex-1 p-0.5 mt-0.5">
              <motion.div className="grid grid-cols-2 gap-0.5 h-full">
                {/* Widget 1: Employee Stats */}
                <motion.div 
                  className="bg-blue-50 border border-blue-200 rounded p-0.5"
                  variants={{
                    rest: { scale: 0.95, opacity: 0.8 },
                    hover: { 
                      scale: [0.95, 1.05, 0.95],
                      opacity: 1,
                      transition: { delay: 1.5, duration: 2, repeat: Infinity }
                    }
                  }}
                >
                  <motion.div 
                    className="w-4 h-0.5 bg-blue-700 rounded mb-0.5"
                    variants={{
                      rest: { scaleX: 0.8 },
                      hover: { 
                        scaleX: 1,
                        transition: { delay: 0.6, duration: 0.3 }
                      }
                    }}
                  ></motion.div>
                  <motion.div className="flex items-end gap-0.5 h-3">
                    {[50, 80, 30].map((height, index) => (
                      <motion.div 
                        key={index}
                        className={`w-1 bg-blue-${600 - index * 100} rounded-t`}
                        style={{ height: `${height}%` }}
                        variants={{
                          rest: { scaleY: 0.7 },
                          hover: { 
                            scaleY: [0.7, 1, 0.8, 1],
                            transition: { 
                              delay: 2 + (index * 0.2), 
                              duration: 2, 
                              repeat: Infinity 
                            }
                          }
                        }}
                      ></motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Widget 2: Performance Metrics */}
                <motion.div 
                  className="bg-green-50 border border-green-200 rounded p-0.5"
                  variants={{
                    rest: { scale: 0.95, opacity: 0.8 },
                    hover: { 
                      scale: [0.95, 1.05, 0.95],
                      opacity: 1,
                      transition: { delay: 2, duration: 2, repeat: Infinity }
                    }
                  }}
                >
                  <motion.div 
                    className="w-5 h-0.5 bg-green-700 rounded mb-0.5"
                    variants={{
                      rest: { scaleX: 0.8 },
                      hover: { 
                        scaleX: 1,
                        transition: { delay: 0.8, duration: 0.3 }
                      }
                    }}
                  ></motion.div>
                  <motion.div className="relative w-full h-3 flex items-center justify-center">
                    <motion.div 
                      className="w-2 h-2 border-2 border-green-200 rounded-full"
                      variants={{
                        rest: { rotate: 0 },
                        hover: { 
                          rotate: 360,
                          transition: { duration: 3, repeat: Infinity, delay: 1 }
                        }
                      }}
                    >
                      <motion.div 
                        className="w-full h-full border-t-2 border-green-600 rounded-full"
                        style={{ transform: 'rotate(270deg)' }}
                        variants={{
                          rest: { opacity: 0.8 },
                          hover: { 
                            opacity: 1,
                            rotate: [270, 360, 450],
                            transition: { duration: 2, repeat: Infinity, delay: 1.5 }
                          }
                        }}
                      ></motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Widget 3: Recent Activity */}
                <motion.div 
                  className="bg-orange-50 border border-orange-200 rounded p-0.5"
                  variants={{
                    rest: { scale: 0.95, opacity: 0.8 },
                    hover: { 
                      scale: [0.95, 1.05, 0.95],
                      opacity: 1,
                      transition: { delay: 2.5, duration: 2, repeat: Infinity }
                    }
                  }}
                >
                  <motion.div 
                    className="w-6 h-0.5 bg-orange-700 rounded mb-0.5"
                    variants={{
                      rest: { scaleX: 0.8 },
                      hover: { 
                        scaleX: 1,
                        transition: { delay: 1, duration: 0.3 }
                      }
                    }}
                  ></motion.div>
                  <motion.div className="space-y-0.5">
                    {[0, 1].map((index) => (
                      <motion.div key={index} className="flex gap-0.5">
                        <motion.div 
                          className="w-1 h-1 bg-orange-500 rounded-full"
                          variants={{
                            rest: { scale: 0.8 },
                            hover: { 
                              scale: [0.8, 1.3, 0.8],
                              transition: { 
                                delay: 2 + (index * 0.3), 
                                duration: 2, 
                                repeat: Infinity 
                              }
                            }
                          }}
                        ></motion.div>
                        <motion.div 
                          className="w-3 h-0.5 bg-orange-600 rounded mt-0.25"
                          variants={{
                            rest: { scaleX: 0.7 },
                            hover: { 
                              scaleX: 1,
                              transition: { delay: 1.2 + (index * 0.1), duration: 0.3 }
                            }
                          }}
                        ></motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Widget 4: Notifications */}
                <motion.div 
                  className="bg-red-50 border border-red-200 rounded p-0.5"
                  variants={{
                    rest: { scale: 0.95, opacity: 0.8 },
                    hover: { 
                      scale: [0.95, 1.05, 0.95],
                      opacity: 1,
                      transition: { delay: 3, duration: 2, repeat: Infinity }
                    }
                  }}
                >
                  <motion.div 
                    className="w-4 h-0.5 bg-red-700 rounded mb-0.5"
                    variants={{
                      rest: { scaleX: 0.8 },
                      hover: { 
                        scaleX: 1,
                        transition: { delay: 1.4, duration: 0.3 }
                      }
                    }}
                  ></motion.div>
                  <motion.div className="relative flex items-center justify-center h-3">
                    <motion.div 
                      className="w-2 h-2 bg-red-500 rounded-full"
                      variants={{
                        rest: { scale: 0.9 },
                        hover: { 
                          scale: [0.9, 1.3, 0.9],
                          transition: { duration: 1.5, delay: 2.5, repeat: Infinity }
                        }
                      }}
                    ></motion.div>
                    <motion.div 
                      className="absolute top-0 right-1 w-1 h-1 bg-red-600 rounded-full"
                      variants={{
                        rest: { scale: 0.8, opacity: 0.8 },
                        hover: { 
                          scale: [0.8, 1.2, 0.8],
                          opacity: [0.8, 1, 0.8],
                          transition: { delay: 3, duration: 1, repeat: Infinity }
                        }
                      }}
                    ></motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const HRCardsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="h-full space-y-1" variants={staggerChildren}>
        {/* Employee Card 1 */}
        <motion.div 
          className="w-full h-5 bg-stone-50 border border-brown-200 rounded p-1 flex items-center gap-1"
          variants={{
            rest: { scale: 1, opacity: 0.8, x: 0 },
            hover: { 
              scale: 1.02,
              opacity: 1,
              x: 0,
              transition: { delay: 0.1 }
            }
          }}
        >
          {/* Avatar */}
          <motion.div 
            className="w-3 h-3 bg-brown-600 rounded-full"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.2, 1],
                transition: { delay: 0.3, duration: 1, repeat: Infinity }
              }
            }}
          ></motion.div>
          
          {/* Employee info */}
          <motion.div className="flex-1 space-y-0.5">
            <motion.div className="w-8 h-0.5 bg-brown-700 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-6 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
          </motion.div>
          
          {/* Status indicator */}
          <motion.div 
            className="w-1 h-1 bg-green-500 rounded-full"
            variants={{
              rest: { scale: 1, opacity: 0.7 },
              hover: { 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
                transition: { duration: 1.5, delay: 0.5, repeat: Infinity }
              }
            }}
          ></motion.div>
        </motion.div>

        {/* Employee Card 2 */}
        <motion.div 
          className="w-full h-5 bg-stone-50 border border-brown-200 rounded p-1 flex items-center gap-1"
          variants={{
            rest: { scale: 1, opacity: 0.8, x: 0 },
            hover: { 
              scale: 1.02,
              opacity: 1,
              x: 0,
              transition: { delay: 0.7 }
            }
          }}
        >
          {/* Avatar */}
          <motion.div 
            className="w-3 h-3 bg-brown-500 rounded-full"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.2, 1],
                transition: { delay: 0.9, duration: 1, repeat: Infinity }
              }
            }}
          ></motion.div>
          
          {/* Employee info */}
          <motion.div className="flex-1 space-y-0.5">
            <motion.div className="w-10 h-0.5 bg-brown-600 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-7 h-0.5 bg-brown-300 rounded" variants={fillVariants}></motion.div>
          </motion.div>
          
          {/* Status indicator */}
          <motion.div 
            className="w-1 h-1 bg-orange-500 rounded-full"
            variants={{
              rest: { scale: 1, opacity: 0.7 },
              hover: { 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
                transition: { duration: 1.5, delay: 1.1, repeat: Infinity }
              }
            }}
          ></motion.div>
        </motion.div>

        {/* Employee Card 3 */}
        <motion.div 
          className="w-full h-5 bg-stone-50 border border-brown-200 rounded p-1 flex items-center gap-1"
          variants={{
            rest: { scale: 1, opacity: 0.8, x: 0 },
            hover: { 
              scale: 1.02,
              opacity: 1,
              x: 0,
              transition: { delay: 1.3 }
            }
          }}
        >
          {/* Avatar */}
          <motion.div 
            className="w-3 h-3 bg-brown-400 rounded-full"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.2, 1],
                transition: { delay: 1.5, duration: 1, repeat: Infinity }
              }
            }}
          ></motion.div>
          
          {/* Employee info */}
          <motion.div className="flex-1 space-y-0.5">
            <motion.div className="w-9 h-0.5 bg-brown-500 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-5 h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
          </motion.div>
          
          {/* Status indicator */}
          <motion.div 
            className="w-1 h-1 bg-blue-500 rounded-full"
            variants={{
              rest: { scale: 1, opacity: 0.7 },
              hover: { 
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
                transition: { duration: 1.5, delay: 1.7, repeat: Infinity }
              }
            }}
          ></motion.div>
        </motion.div>

        {/* Add new card animation */}
        <motion.div 
          className="w-full h-5 bg-stone-50 border-2 border-dashed border-brown-300 rounded p-1 flex items-center justify-center"
          variants={{
            rest: { scale: 0, opacity: 0 },
            hover: { 
              scale: 1,
              opacity: 1,
              transition: { 
                delay: 2,
                type: "spring",
                damping: 15,
                stiffness: 300
              }
            }
          }}
        >
          {/* Plus icon */}
          <motion.div 
            className="w-2 h-2 bg-brown-600 rounded flex items-center justify-center relative"
            variants={{
              rest: { rotate: 0 },
              hover: { 
                rotate: 180,
                transition: { delay: 2.5, duration: 0.5 }
              }
            }}
          >
            <motion.div className="w-1 h-0.5 bg-brown-100 rounded absolute"></motion.div>
            <motion.div className="w-0.5 h-1 bg-brown-100 rounded absolute"></motion.div>
          </motion.div>
        </motion.div>

        {/* Cards interaction indicator */}
        <motion.div 
          className="w-full h-0.5 bg-brown-200 rounded overflow-hidden"
          variants={{
            rest: { opacity: 0 },
            hover: { 
              opacity: 1,
              transition: { delay: 3 }
            }
          }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-green-500 via-orange-500 to-blue-500 rounded"
            variants={{
              rest: { width: "0%" },
              hover: { 
                width: "100%",
                transition: { duration: 2, delay: 3.5 }
              }
            }}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const DataDisplayThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="h-full space-y-1" variants={staggerChildren}>
        {/* Data cards header */}
        <motion.div className="flex items-center justify-between">
          <motion.div className="w-8 h-1 bg-brown-700 rounded" variants={fillVariants}></motion.div>
          <motion.div className="flex gap-0.5">
            <motion.div 
              className="w-1 h-1 bg-green-500 rounded-full"
              variants={{
                rest: { scale: 1, opacity: 0.7 },
                hover: { 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                  transition: { duration: 1.5, repeat: Infinity }
                }
              }}
            ></motion.div>
            <motion.div 
              className="w-1 h-1 bg-blue-500 rounded-full"
              variants={{
                rest: { scale: 1, opacity: 0.7 },
                hover: { 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                  transition: { duration: 1.5, delay: 0.3, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Data cards layout */}
        <motion.div className="grid grid-cols-2 gap-1 h-12">
          {/* Revenue Card */}
          <motion.div 
            className="bg-green-50 border border-green-200 rounded p-1"
            variants={{
              rest: { scale: 1, opacity: 0.8 },
              hover: { 
                scale: 1.05,
                opacity: 1,
                transition: { delay: 0.2 }
              }
            }}
          >
            <motion.div className="space-y-0.5">
              <motion.div className="w-6 h-0.5 bg-green-700 rounded font-bold" variants={fillVariants}></motion.div>
              <motion.div className="flex items-center justify-between">
                <motion.div 
                  className="w-8 h-1 bg-green-600 rounded"
                  variants={{
                    rest: { scaleX: 0.4 },
                    hover: { 
                      scaleX: [0.4, 1, 0.7],
                      transition: { duration: 2, delay: 0.5, repeat: Infinity }
                    }
                  }}
                ></motion.div>
                <motion.div 
                  className="w-1 h-1 bg-green-500 rounded-full"
                  variants={{
                    rest: { y: 0, scale: 1 },
                    hover: { 
                      y: [-1, 0, -1],
                      scale: [1, 1.2, 1],
                      transition: { duration: 1, delay: 0.7, repeat: Infinity }
                    }
                  }}
                ></motion.div>
              </motion.div>
              <motion.div className="w-4 h-0.5 bg-green-400 rounded opacity-60" variants={fillVariants}></motion.div>
            </motion.div>
          </motion.div>

          {/* Users Card */}
          <motion.div 
            className="bg-blue-50 border border-blue-200 rounded p-1"
            variants={{
              rest: { scale: 1, opacity: 0.8 },
              hover: { 
                scale: 1.05,
                opacity: 1,
                transition: { delay: 0.8 }
              }
            }}
          >
            <motion.div className="space-y-0.5">
              <motion.div className="w-5 h-0.5 bg-blue-700 rounded" variants={fillVariants}></motion.div>
              <motion.div className="flex items-center justify-between">
                <motion.div 
                  className="w-7 h-1 bg-blue-600 rounded"
                  variants={{
                    rest: { scaleX: 0.6 },
                    hover: { 
                      scaleX: [0.6, 1, 0.8],
                      transition: { duration: 1.8, delay: 1.2, repeat: Infinity }
                    }
                  }}
                ></motion.div>
                <motion.div 
                  className="w-1 h-1 bg-blue-500 rounded-full"
                  variants={{
                    rest: { rotate: 0 },
                    hover: { 
                      rotate: [0, 360],
                      transition: { duration: 2, delay: 1.4, repeat: Infinity }
                    }
                  }}
                ></motion.div>
              </motion.div>
              <motion.div className="w-6 h-0.5 bg-blue-400 rounded opacity-60" variants={fillVariants}></motion.div>
            </motion.div>
          </motion.div>

          {/* Performance Card */}
          <motion.div 
            className="bg-orange-50 border border-orange-200 rounded p-1"
            variants={{
              rest: { scale: 1, opacity: 0.8 },
              hover: { 
                scale: 1.05,
                opacity: 1,
                transition: { delay: 1.6 }
              }
            }}
          >
            <motion.div className="space-y-0.5">
              <motion.div className="w-7 h-0.5 bg-orange-700 rounded" variants={fillVariants}></motion.div>
              <motion.div className="flex items-center justify-between">
                <motion.div 
                  className="w-5 h-1 bg-orange-600 rounded"
                  variants={{
                    rest: { scaleX: 0.3, backgroundColor: "rgb(234 88 12)" },
                    hover: { 
                      scaleX: [0.3, 0.8, 0.5],
                      backgroundColor: [
                        "rgb(234 88 12)",
                        "rgb(249 115 22)",
                        "rgb(234 88 12)"
                      ],
                      transition: { duration: 1.5, delay: 2, repeat: Infinity }
                    }
                  }}
                ></motion.div>
                <motion.div 
                  className="w-1 h-1 bg-orange-500 rounded-full"
                  variants={{
                    rest: { scale: 1 },
                    hover: { 
                      scale: [1, 1.3, 1],
                      transition: { duration: 0.8, delay: 2.2, repeat: Infinity }
                    }
                  }}
                ></motion.div>
              </motion.div>
              <motion.div className="w-3 h-0.5 bg-orange-400 rounded opacity-60" variants={fillVariants}></motion.div>
            </motion.div>
          </motion.div>

          {/* Issues Card */}
          <motion.div 
            className="bg-red-50 border border-red-200 rounded p-1"
            variants={{
              rest: { scale: 1, opacity: 0.8 },
              hover: { 
                scale: 1.05,
                opacity: 1,
                transition: { delay: 2.4 }
              }
            }}
          >
            <motion.div className="space-y-0.5">
              <motion.div className="w-6 h-0.5 bg-red-700 rounded" variants={fillVariants}></motion.div>
              <motion.div className="flex items-center justify-between">
                <motion.div 
                  className="w-4 h-1 bg-red-600 rounded"
                  variants={{
                    rest: { scaleX: 0.2, x: 0 },
                    hover: { 
                      scaleX: [0.2, 0.7, 0.4],
                      x: [0, -0.5, 0.5, 0],
                      transition: { duration: 1.2, delay: 2.8, repeat: Infinity }
                    }
                  }}
                ></motion.div>
                <motion.div 
                  className="w-1 h-1 bg-red-500 rounded-full"
                  variants={{
                    rest: { opacity: 0.7 },
                    hover: { 
                      opacity: [0.7, 1, 0.3, 1],
                      transition: { duration: 1, delay: 3, repeat: Infinity }
                    }
                  }}
                ></motion.div>
              </motion.div>
              <motion.div className="w-5 h-0.5 bg-red-400 rounded opacity-60" variants={fillVariants}></motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Summary analytics bar */}
        <motion.div 
          className="w-full h-1 bg-stone-100 rounded overflow-hidden border border-brown-200"
          variants={{
            rest: { opacity: 0.6 },
            hover: { opacity: 1, transition: { delay: 3.5 } }
          }}
        >
          <motion.div 
            className="h-full bg-gradient-to-r from-green-500 via-blue-500 via-orange-500 to-red-500 rounded"
            variants={{
              rest: { width: "25%" },
              hover: { 
                width: "85%",
                transition: { duration: 2.5, delay: 4 }
              }
            }}
          ></motion.div>
        </motion.div>
        
        {/* Live metrics footer */}
        <motion.div 
          className="flex justify-between items-center"
          variants={{
            rest: { opacity: 0, y: 2 },
            hover: { 
              opacity: 1,
              y: 0,
              transition: { delay: 4.5 }
            }
          }}
        >
          <motion.div className="flex gap-0.5">
            <motion.div 
              className="w-1 h-1 bg-green-500 rounded"
              variants={{
                rest: { scaleY: 0.4 },
                hover: { 
                  scaleY: [0.4, 1, 0.6, 1],
                  transition: { duration: 1, delay: 5, repeat: Infinity }
                }
              }}
            ></motion.div>
            <motion.div 
              className="w-1 h-1 bg-blue-500 rounded"
              variants={{
                rest: { scaleY: 0.6 },
                hover: { 
                  scaleY: [0.6, 0.3, 1, 0.7],
                  transition: { duration: 1, delay: 5.2, repeat: Infinity }
                }
              }}
            ></motion.div>
            <motion.div 
              className="w-1 h-1 bg-orange-500 rounded"
              variants={{
                rest: { scaleY: 0.3 },
                hover: { 
                  scaleY: [0.3, 0.8, 0.5, 0.9],
                  transition: { duration: 1, delay: 5.4, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
          
          <motion.div className="w-6 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const InteractionThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="relative h-full flex items-center justify-center" variants={staggerChildren}>
        {/* Main interactive element */}
        <motion.div 
          className="w-8 h-8 bg-brown-600 rounded-lg flex items-center justify-center relative cursor-pointer"
          variants={{
            rest: { 
              scale: 1, 
              rotate: 0,
              backgroundColor: "rgb(120 113 108)"
            },
            hover: { 
              scale: [1, 1.1, 0.95, 1.05, 1],
              rotate: [0, -5, 5, -2, 0],
              backgroundColor: [
                "rgb(120 113 108)",
                "rgb(87 83 78)",
                "rgb(120 113 108)"
              ],
              transition: { duration: 1.5, repeat: Infinity }
            }
          }}
        >
          {/* Inner element */}
          <motion.div 
            className="w-4 h-4 bg-white rounded flex items-center justify-center"
            variants={{
              rest: { scale: 1, rotate: 0 },
              hover: { 
                scale: [1, 0.8, 1.2, 1],
                rotate: [0, 180, 360],
                transition: { duration: 1.5, repeat: Infinity }
              }
            }}
          >
            <motion.div 
              className="w-2 h-2 bg-brown-600 rounded-full"
              variants={{
                rest: { scale: 1 },
                hover: { 
                  scale: [1, 1.5, 0.5, 1],
                  transition: { duration: 1.5, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Click ripple effect */}
          <motion.div 
            className="absolute inset-0 bg-brown-400 rounded-lg"
            variants={{
              rest: { scale: 1, opacity: 0 },
              hover: { 
                scale: [1, 1.5, 2],
                opacity: [0, 0.3, 0],
                transition: { 
                  duration: 1, 
                  repeat: Infinity,
                  repeatDelay: 0.5
                }
              }
            }}
          ></motion.div>
        </motion.div>
        
        {/* Interaction indicators around the main element */}
        <motion.div 
          className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full"
          variants={{
            rest: { scale: 0, opacity: 0 },
            hover: { 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              transition: { duration: 2, delay: 0.5, repeat: Infinity }
            }
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"
          variants={{
            rest: { scale: 0, opacity: 0 },
            hover: { 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              transition: { duration: 2, delay: 1, repeat: Infinity }
            }
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute bottom-2 left-2 w-2 h-2 bg-orange-500 rounded-full"
          variants={{
            rest: { scale: 0, opacity: 0 },
            hover: { 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              transition: { duration: 2, delay: 1.5, repeat: Infinity }
            }
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute bottom-2 right-2 w-2 h-2 bg-red-500 rounded-full"
          variants={{
            rest: { scale: 0, opacity: 0 },
            hover: { 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              transition: { duration: 2, delay: 2, repeat: Infinity }
            }
          }}
        ></motion.div>
        
        {/* Hover trail effect */}
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          variants={{
            rest: {},
            hover: {}
          }}
        >
          <motion.div 
            className="w-1 h-1 bg-purple-400 rounded-full absolute"
            variants={{
              rest: { x: 0, y: 0, opacity: 0 },
              hover: { 
                x: [0, 10, -5, 8, -3],
                y: [0, -8, 6, -4, 2],
                opacity: [0, 1, 0.7, 0.5, 0],
                transition: { duration: 3, repeat: Infinity }
              }
            }}
          ></motion.div>
        </motion.div>
        
        {/* Interactive feedback bars */}
        <motion.div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-0.5"
          variants={{
            rest: { opacity: 0, y: 2 },
            hover: { 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.5 }
            }
          }}
        >
          <motion.div 
            className="w-1 h-2 bg-brown-600 rounded"
            variants={{
              rest: { scaleY: 0.3 },
              hover: { 
                scaleY: [0.3, 1, 0.6, 1],
                transition: { duration: 1, repeat: Infinity }
              }
            }}
          ></motion.div>
          <motion.div 
            className="w-1 h-2 bg-brown-500 rounded"
            variants={{
              rest: { scaleY: 0.5 },
              hover: { 
                scaleY: [0.5, 0.8, 1, 0.7],
                transition: { duration: 1, delay: 0.2, repeat: Infinity }
              }
            }}
          ></motion.div>
          <motion.div 
            className="w-1 h-2 bg-brown-400 rounded"
            variants={{
              rest: { scaleY: 0.2 },
              hover: { 
                scaleY: [0.2, 0.9, 0.4, 0.8],
                transition: { duration: 1, delay: 0.4, repeat: Infinity }
              }
            }}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const NavigationThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-1 shadow-sm"
      variants={itemVariants}
    >
      <motion.div className="relative w-full h-full overflow-hidden rounded-lg bg-stone-50">
        
        {/* Main Content Background */}
        <motion.div 
          className="absolute inset-0 bg-stone-100 rounded-lg"
          variants={{
            rest: { opacity: 1 },
            hover: { opacity: 1 }
          }}
        >
          <motion.div className="p-2 space-y-1">
            <motion.div className="w-full h-0.5 bg-brown-300 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-3/4 h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-full h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-5/6 h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-2/3 h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
          </motion.div>
        </motion.div>

        {/* Top Navigation Bar - Slides in from top */}
        <motion.div 
          className="absolute left-0 right-0 h-4 bg-brown-700 rounded-t-lg shadow-lg z-20"
          variants={{
            rest: { top: "-100%", opacity: 0 },
            hover: { 
              top: "0%", 
              opacity: 1,
              transition: { 
                duration: 0.6, 
                ease: "easeOut",
                delay: 0.2
              }
            }
          }}
        >
          {/* Top nav content */}
          <motion.div 
            className="h-full flex items-center justify-between px-1"
            variants={{
              rest: { opacity: 0 },
              hover: { 
                opacity: 1,
                transition: { delay: 0.6, duration: 0.3 }
              }
            }}
          >
            {/* Logo/Brand */}
            <motion.div 
              className="w-6 h-2 bg-brown-100 rounded"
              variants={{
                rest: { scaleX: 0 },
                hover: { 
                  scaleX: 1,
                  transition: { delay: 0.8, duration: 0.3 }
                }
              }}
            ></motion.div>
            
            {/* Navigation Links */}
            <motion.div className="flex gap-0.5">
              {[0, 1, 2, 3].map((index) => (
                <motion.div 
                  key={index}
                  className="w-2.5 h-0.5 bg-brown-200 rounded"
                  variants={{
                    rest: { scaleX: 0, opacity: 0 },
                    hover: { 
                      scaleX: 1,
                      opacity: 1,
                      transition: { 
                        delay: 0.9 + (index * 0.1), 
                        duration: 0.2 
                      }
                    }
                  }}
                ></motion.div>
              ))}
            </motion.div>
            
            {/* User Menu */}
            <motion.div 
              className="w-2 h-2 bg-brown-300 rounded-full"
              variants={{
                rest: { scale: 0, opacity: 0 },
                hover: { 
                  scale: 1,
                  opacity: 1,
                  transition: { delay: 1.3, duration: 0.2 }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>

        {/* Sidebar Navigation - Slides in from left */}
        <motion.div 
          className="absolute top-4 bottom-0 w-8 bg-brown-600 rounded-bl-lg shadow-lg z-10"
          variants={{
            rest: { left: "-100%", opacity: 0 },
            hover: { 
              left: "0%", 
              opacity: 1,
              transition: { 
                duration: 0.7, 
                ease: "easeOut",
                delay: 0.5
              }
            }
          }}
        >
          {/* Sidebar content */}
          <motion.div 
            className="p-1 space-y-1 h-full"
            variants={{
              rest: { opacity: 0 },
              hover: { 
                opacity: 1,
                transition: { delay: 1.0, duration: 0.3 }
              }
            }}
          >
            {/* Sidebar header */}
            <motion.div 
              className="w-full h-1.5 bg-brown-200 rounded mb-1"
              variants={{
                rest: { scaleX: 0 },
                hover: { 
                  scaleX: 1,
                  transition: { delay: 1.2, duration: 0.3 }
                }
              }}
            ></motion.div>
            
            {/* Menu items */}
            <motion.div className="space-y-0.5">
              {[
                { width: 'w-full', active: true },
                { width: 'w-4/5', active: false },
                { width: 'w-full', active: false },
                { width: 'w-3/4', active: false },
                { width: 'w-5/6', active: false },
                { width: 'w-2/3', active: false },
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className={`${item.width} h-0.5 ${item.active ? 'bg-brown-100' : 'bg-brown-300'} rounded`}
                  variants={{
                    rest: { scaleX: 0, opacity: 0 },
                    hover: { 
                      scaleX: 1,
                      opacity: 1,
                      transition: { 
                        delay: 1.4 + (index * 0.1), 
                        duration: 0.2 
                      }
                    }
                  }}
                ></motion.div>
              ))}
            </motion.div>

            {/* Sidebar footer */}
            <motion.div 
              className="absolute bottom-1 left-1 right-1"
              variants={{
                rest: { opacity: 0, y: 5 },
                hover: { 
                  opacity: 1,
                  y: 0,
                  transition: { delay: 2.0, duration: 0.3 }
                }
              }}
            >
              <motion.div className="w-full h-0.5 bg-brown-400 rounded"></motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Content area that gets pushed by sidebar */}
        <motion.div 
          className="absolute top-4 right-0 bottom-0 bg-white rounded-br-lg border-l border-brown-300"
          variants={{
            rest: { left: "0%", width: "100%" },
            hover: { 
              left: "32%", 
              width: "68%",
              transition: { 
                duration: 0.7, 
                ease: "easeOut",
                delay: 0.5
              }
            }
          }}
        >
          <motion.div 
            className="p-1 space-y-0.5 h-full"
            variants={{
              rest: { opacity: 0.8 },
              hover: { 
                opacity: 1,
                transition: { delay: 1.0 }
              }
            }}
          >
            {/* Page header */}
            <motion.div 
              className="w-3/4 h-1 bg-brown-700 rounded mb-0.5"
              variants={{
                rest: { scaleX: 0.7 },
                hover: { 
                  scaleX: 1,
                  transition: { delay: 1.5, duration: 0.3 }
                }
              }}
            ></motion.div>
            
            {/* Content lines */}
            {[
              { width: 'w-full', color: 'bg-brown-400' },
              { width: 'w-4/5', color: 'bg-brown-300' },
              { width: 'w-full', color: 'bg-brown-300' },
              { width: 'w-2/3', color: 'bg-brown-200' },
              { width: 'w-5/6', color: 'bg-brown-300' },
              { width: 'w-3/4', color: 'bg-brown-200' },
            ].map((line, index) => (
              <motion.div 
                key={index}
                className={`${line.width} h-0.5 ${line.color} rounded`}
                variants={{
                  rest: { scaleX: 0.6, opacity: 0.6 },
                  hover: { 
                    scaleX: 1,
                    opacity: 1,
                    transition: { 
                      delay: 1.6 + (index * 0.1), 
                      duration: 0.2 
                    }
                  }
                }}
              ></motion.div>
            ))}

            {/* Action buttons */}
            <motion.div 
              className="flex gap-0.5 justify-end mt-1"
              variants={{
                rest: { opacity: 0, scale: 0.8 },
                hover: { 
                  opacity: 1,
                  scale: 1,
                  transition: { delay: 2.2, duration: 0.3 }
                }
              }}
            >
              <motion.div className="w-2 h-1 bg-brown-300 border border-brown-500 rounded"></motion.div>
              <motion.div className="w-2 h-1 bg-brown-700 rounded"></motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Overlay for depth effect */}
        <motion.div 
          className="absolute inset-0 bg-black rounded-lg pointer-events-none"
          variants={{
            rest: { opacity: 0 },
            hover: { 
              opacity: 0.1,
              transition: { delay: 0.8, duration: 0.4 }
            }
          }}
        ></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const ModalsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="w-full h-full bg-stone-50 rounded-lg relative">
        {/* Background content */}
        <motion.div className="absolute inset-0 bg-stone-100 rounded-lg p-2">
          <motion.div className="space-y-1 opacity-40">
            <motion.div className="w-full h-1 bg-brown-400 rounded"></motion.div>
            <motion.div className="w-3/4 h-1 bg-brown-300 rounded"></motion.div>
            <motion.div className="w-full h-1 bg-brown-200 rounded"></motion.div>
          </motion.div>
        </motion.div>

        {/* Modal overlay */}
        <motion.div 
          className="absolute inset-0 bg-black rounded-lg"
          variants={{
            rest: { opacity: 0 },
            hover: { 
              opacity: 0.4,
              transition: { duration: 0.3 }
            }
          }}
        ></motion.div>

        {/* Modal dialog */}
        <motion.div 
          className="absolute inset-2 bg-white border border-brown-300 rounded-lg p-2 shadow-lg"
          variants={{
            rest: { scale: 0.8, opacity: 0, y: 10 },
            hover: { 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: { 
                type: "spring",
                damping: 15,
                stiffness: 300,
                delay: 0.2
              }
            }
          }}
        >
          <motion.div className="space-y-1 h-full flex flex-col">
            {/* Modal header */}
            <motion.div 
              className="flex items-center justify-between"
              variants={{
                rest: { opacity: 0, y: -5 },
                hover: { 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.5 }
                }
              }}
            >
              <motion.div className="w-12 h-1 bg-brown-700 rounded" variants={fillVariants}></motion.div>
              <motion.div 
                className="w-2 h-2 bg-brown-300 rounded"
                variants={{
                  rest: { scale: 1, rotate: 0 },
                  hover: { 
                    scale: 1.2,
                    rotate: 90,
                    transition: { delay: 0.7 }
                  }
                }}
              ></motion.div>
            </motion.div>
            
            {/* Modal content */}
            <motion.div 
              className="flex-1 space-y-1"
              variants={{
                rest: { opacity: 0 },
                hover: { 
                  opacity: 1,
                  transition: { delay: 0.8 }
                }
              }}
            >
              <motion.div className="w-full h-0.5 bg-brown-500 rounded" variants={fillVariants}></motion.div>
              <motion.div className="w-3/4 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
              <motion.div className="w-full h-0.5 bg-brown-300 rounded" variants={fillVariants}></motion.div>
              <motion.div className="w-2/3 h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
            </motion.div>
            
            {/* Modal actions */}
            <motion.div 
              className="flex gap-1 justify-end pt-1"
              variants={{
                rest: { opacity: 0, y: 5 },
                hover: { 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 1 }
                }
              }}
            >
              <motion.div 
                className="w-6 h-2 bg-brown-300 border border-brown-500 rounded"
                variants={{
                  rest: { scale: 1 },
                  hover: { 
                    scale: 1.05,
                    transition: { delay: 1.2 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-6 h-2 bg-brown-700 rounded relative overflow-hidden"
                variants={{
                  rest: { scale: 1 },
                  hover: { 
                    scale: 1.05,
                    transition: { delay: 1.4 }
                  }
                }}
              >
                {/* Confirm button animation */}
                <motion.div 
                  className="absolute inset-0 bg-brown-800 rounded"
                  variants={{
                    rest: { scaleX: 0 },
                    hover: { 
                      scaleX: [0, 1, 0],
                      transition: { 
                        duration: 1.5, 
                        delay: 1.6,
                        repeat: Infinity,
                        repeatDelay: 2
                      }
                    }
                  }}
                  style={{ originX: 0 }}
                ></motion.div>
                <motion.div className="relative w-3 h-0.5 bg-brown-100 rounded mx-auto mt-0.75"></motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const ListsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="h-full space-y-1" variants={staggerChildren}>
        {/* List header */}
        <motion.div 
          className="flex items-center justify-between pb-1 border-b border-brown-200"
          variants={{
            rest: { opacity: 0.8 },
            hover: { 
              opacity: 1,
              transition: { delay: 0.1 }
            }
          }}
        >
          <motion.div className="w-10 h-1 bg-brown-700 rounded font-bold" variants={fillVariants}></motion.div>
          <motion.div className="flex gap-0.5">
            <motion.div 
              className="w-1 h-1 bg-brown-500 rounded"
              variants={{
                rest: { scale: 1 },
                hover: { 
                  scale: [1, 1.2, 1],
                  transition: { delay: 0.3, repeat: Infinity, duration: 2 }
                }
              }}
            ></motion.div>
            <motion.div 
              className="w-1 h-1 bg-brown-400 rounded"
              variants={{
                rest: { scale: 1 },
                hover: { 
                  scale: [1, 1.2, 1],
                  transition: { delay: 0.5, repeat: Infinity, duration: 2 }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced list items */}
        <motion.div className="space-y-1">
          {/* Priority item */}
          <motion.div 
            className="flex items-center gap-1 p-1 bg-red-50 border border-red-200 rounded"
            variants={{
              rest: { scale: 1, opacity: 0.8, x: 0 },
              hover: { 
                scale: 1.02,
                opacity: 1,
                x: 0,
                transition: { delay: 0.2 }
              }
            }}
          >
            <motion.div 
              className="w-1.5 h-1.5 bg-red-500 rounded-full"
              variants={{
                rest: { scale: 1 },
                hover: { 
                  scale: [1, 1.3, 1],
                  transition: { duration: 1.5, delay: 0.4, repeat: Infinity }
                }
              }}
            ></motion.div>
            <motion.div className="flex-1">
              <motion.div className="w-12 h-0.5 bg-red-700 rounded mb-0.5" variants={fillVariants}></motion.div>
              <motion.div className="w-8 h-0.5 bg-red-400 rounded opacity-70" variants={fillVariants}></motion.div>
            </motion.div>
            <motion.div 
              className="w-2 h-1 bg-red-600 rounded text-xs flex items-center justify-center"
              variants={{
                rest: { scale: 1 },
                hover: { 
                  scale: 1.1,
                  transition: { delay: 0.6 }
                }
              }}
            >
              <motion.div className="w-1 h-0.5 bg-red-100 rounded"></motion.div>
            </motion.div>
          </motion.div>

          {/* In progress item */}
          <motion.div 
            className="flex items-center gap-1 p-1 bg-blue-50 border border-blue-200 rounded"
            variants={{
              rest: { scale: 1, opacity: 0.8, x: 0 },
              hover: { 
                scale: 1.02,
                opacity: 1,
                x: 0,
                transition: { delay: 0.8 }
              }
            }}
          >
            <motion.div 
              className="w-1.5 h-1.5 bg-blue-500 rounded-full relative"
              variants={{
                rest: { scale: 1 },
                hover: { 
                  scale: 1.1,
                  transition: { delay: 1 }
                }
              }}
            >
              {/* Progress indicator */}
              <motion.div 
                className="absolute inset-0 bg-blue-600 rounded-full"
                variants={{
                  rest: { scale: 0.6, opacity: 0.5 },
                  hover: { 
                    scale: [0.6, 1.2, 0.6],
                    opacity: [0.5, 0.8, 0.5],
                    transition: { duration: 2, delay: 1.2, repeat: Infinity }
                  }
                }}
              ></motion.div>
            </motion.div>
            <motion.div className="flex-1">
              <motion.div className="w-14 h-0.5 bg-blue-700 rounded mb-0.5" variants={fillVariants}></motion.div>
              <motion.div className="w-10 h-0.5 bg-blue-400 rounded opacity-70" variants={fillVariants}></motion.div>
            </motion.div>
            <motion.div 
              className="w-3 h-0.5 bg-blue-200 rounded overflow-hidden"
              variants={{
                rest: { opacity: 0.6 },
                hover: { 
                  opacity: 1,
                  transition: { delay: 1.4 }
                }
              }}
            >
              <motion.div 
                className="h-full bg-blue-600 rounded"
                variants={{
                  rest: { width: "60%" },
                  hover: { 
                    width: "85%",
                    transition: { duration: 1.5, delay: 1.6 }
                  }
                }}
              ></motion.div>
            </motion.div>
          </motion.div>

          {/* Completed item */}
          <motion.div 
            className="flex items-center gap-1 p-1 bg-green-50 border border-green-200 rounded"
            variants={{
              rest: { scale: 1, opacity: 0.8, x: 0 },
              hover: { 
                scale: 1.02,
                opacity: 1,
                x: 0,
                transition: { delay: 1.8 }
              }
            }}
          >
            <motion.div 
              className="w-1.5 h-1.5 bg-green-500 rounded-full flex items-center justify-center"
              variants={{
                rest: { scale: 1 },
                hover: { 
                  scale: [1, 1.2, 1],
                  transition: { delay: 2, repeat: Infinity, duration: 1.5 }
                }
              }}
            >
              {/* Checkmark */}
              <motion.div 
                className="w-0.5 h-0.5 bg-green-100 rounded"
                variants={{
                  rest: { scale: 0.8 },
                  hover: { 
                    scale: [0.8, 1.2, 0.8],
                    transition: { delay: 2.2, repeat: Infinity, duration: 1.5 }
                  }
                }}
              ></motion.div>
            </motion.div>
            <motion.div className="flex-1">
              <motion.div 
                className="w-11 h-0.5 bg-green-700 rounded mb-0.5 opacity-60"
                variants={fillVariants}
                style={{ textDecoration: 'line-through' }}
              ></motion.div>
              <motion.div className="w-7 h-0.5 bg-green-400 rounded opacity-50" variants={fillVariants}></motion.div>
            </motion.div>
            <motion.div 
              className="w-2 h-1 bg-green-600 rounded flex items-center justify-center"
              variants={{
                rest: { scale: 1, opacity: 0.8 },
                hover: { 
                  scale: 1.1,
                  opacity: 1,
                  transition: { delay: 2.4 }
                }
              }}
            >
              <motion.div className="w-1 h-0.5 bg-green-100 rounded"></motion.div>
            </motion.div>
          </motion.div>

          {/* Pending item */}
          <motion.div 
            className="flex items-center gap-1 p-1 bg-stone-50 border border-stone-200 rounded"
            variants={{
              rest: { scale: 1, opacity: 0.8, x: 0 },
              hover: { 
                scale: 1.02,
                opacity: 1,
                x: 0,
                transition: { delay: 2.6 }
              }
            }}
          >
            <motion.div 
              className="w-1.5 h-1.5 bg-stone-400 rounded-full border border-stone-500"
              variants={{
                rest: { scale: 1, rotate: 0 },
                hover: { 
                  scale: 1.1,
                  rotate: 360,
                  transition: { delay: 2.8, duration: 2, repeat: Infinity }
                }
              }}
            ></motion.div>
            <motion.div className="flex-1">
              <motion.div className="w-13 h-0.5 bg-stone-600 rounded mb-0.5" variants={fillVariants}></motion.div>
              <motion.div className="w-9 h-0.5 bg-stone-400 rounded opacity-70" variants={fillVariants}></motion.div>
            </motion.div>
            <motion.div 
              className="w-2 h-1 bg-stone-300 border border-stone-400 rounded"
              variants={{
                rest: { opacity: 0.6 },
                hover: { 
                  opacity: 1,
                  transition: { delay: 3 }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>

        {/* List summary */}
        <motion.div 
          className="flex justify-between items-center pt-1 border-t border-brown-200"
          variants={{
            rest: { opacity: 0, y: 2 },
            hover: { 
              opacity: 1,
              y: 0,
              transition: { delay: 3.5 }
            }
          }}
        >
          <motion.div className="flex gap-0.5">
            <motion.div className="w-1 h-0.5 bg-red-500 rounded"></motion.div>
            <motion.div className="w-1 h-0.5 bg-blue-500 rounded"></motion.div>
            <motion.div className="w-1 h-0.5 bg-green-500 rounded"></motion.div>
            <motion.div className="w-1 h-0.5 bg-stone-400 rounded"></motion.div>
          </motion.div>
          <motion.div className="w-4 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const SkeletonsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-4 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-2">
        <motion.div className="w-full h-2 bg-stone-200 rounded animate-pulse" variants={{rest: {opacity: 0.5}, hover: {opacity: 1}}}></motion.div>
        <motion.div className="w-3/4 h-2 bg-stone-200 rounded animate-pulse" variants={{rest: {opacity: 0.3}, hover: {opacity: 0.8}}}></motion.div>
        <motion.div className="w-1/2 h-2 bg-stone-200 rounded animate-pulse" variants={{rest: {opacity: 0.4}, hover: {opacity: 0.9}}}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const TextEditorThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-1 h-full" variants={staggerChildren}>
        {/* Toolbar with formatting buttons */}
        <motion.div className="w-full h-3 bg-stone-50 border border-brown-200 rounded p-0.5">
          <motion.div className="flex gap-0.5 h-full">
            {/* Bold button */}
            <motion.div 
              className="w-2 h-2 bg-brown-600 rounded flex items-center justify-center"
              variants={{
                rest: { scale: 1, backgroundColor: "rgb(120 113 108)" },
                hover: { 
                  scale: 1.1,
                  backgroundColor: "rgb(87 83 78)",
                  transition: { delay: 0.1 }
                }
              }}
            >
              <motion.div className="w-1 h-1 bg-brown-100 rounded"></motion.div>
            </motion.div>
            
            {/* Italic button */}
            <motion.div 
              className="w-2 h-2 bg-brown-500 rounded flex items-center justify-center"
              variants={{
                rest: { scale: 1, skew: 0 },
                hover: { 
                  scale: 1.1,
                  skew: 10,
                  transition: { delay: 0.3 }
                }
              }}
            >
              <motion.div className="w-0.5 h-1 bg-brown-100 rounded"></motion.div>
            </motion.div>
            
            {/* Underline button */}
            <motion.div 
              className="w-2 h-2 bg-brown-400 rounded flex items-center justify-center relative"
              variants={{
                rest: { scale: 1 },
                hover: { 
                  scale: 1.1,
                  transition: { delay: 0.5 }
                }
              }}
            >
              <motion.div className="w-1 h-0.5 bg-brown-100 rounded"></motion.div>
              <motion.div 
                className="absolute bottom-0.5 w-1 h-0.5 bg-brown-100 rounded"
                variants={{
                  rest: { scaleX: 0 },
                  hover: { 
                    scaleX: 1,
                    transition: { delay: 0.7 }
                  }
                }}
              ></motion.div>
            </motion.div>
            
            {/* Color picker button */}
            <motion.div 
              className="w-2 h-2 bg-gradient-to-r from-red-500 to-blue-500 rounded"
              variants={{
                rest: { scale: 1, rotate: 0 },
                hover: { 
                  scale: 1.1,
                  rotate: 360,
                  transition: { delay: 0.9, duration: 1 }
                }
              }}
            ></motion.div>
            
            {/* List button */}
            <motion.div 
              className="w-2 h-2 bg-brown-300 rounded flex items-center justify-center"
              variants={{
                rest: { scale: 1 },
                hover: { 
                  scale: 1.1,
                  transition: { delay: 1.1 }
                }
              }}
            >
              <motion.div className="space-y-0.5">
                <motion.div className="w-0.5 h-0.5 bg-brown-600 rounded-full"></motion.div>
                <motion.div className="w-0.5 h-0.5 bg-brown-600 rounded-full"></motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Separator */}
        <motion.div className="w-full h-px bg-brown-300"></motion.div>
        
        {/* Text content area */}
        <motion.div className="flex-1 space-y-1 pt-0.5">
          {/* Paragraph 1 */}
          <motion.div className="w-full h-0.5 bg-brown-600 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-4/5 h-0.5 bg-brown-500 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-full h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
          
          {/* Current line being typed */}
          <motion.div className="flex items-center gap-0.5">
            <motion.div 
              className="w-2/3 h-0.5 bg-brown-300 rounded"
              variants={{
                rest: { scaleX: 0.4 },
                hover: { 
                  scaleX: 1,
                  transition: { duration: 2, delay: 1.5 }
                }
              }}
            ></motion.div>
            
            {/* Typing cursor */}
            <motion.div 
              className="w-0.5 h-1 bg-brown-700"
              variants={{
                rest: { opacity: 0.3 },
                hover: { 
                  opacity: [0.3, 1, 0.3],
                  scaleY: [1, 1.2, 1],
                  transition: { duration: 1, repeat: Infinity, delay: 2 }
                }
              }}
            ></motion.div>
            
            {/* Characters appearing */}
            <motion.div 
              className="flex gap-0.5"
              variants={{
                rest: { opacity: 0, width: 0 },
                hover: { 
                  opacity: 1, 
                  width: "auto",
                  transition: { duration: 1, delay: 2.5 }
                }
              }}
            >
              <motion.div 
                className="w-1 h-0.5 bg-brown-400 rounded"
                variants={{
                  rest: { scaleX: 0 },
                  hover: { 
                    scaleX: 1,
                    transition: { duration: 0.1, delay: 3 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-2 h-0.5 bg-brown-300 rounded"
                variants={{
                  rest: { scaleX: 0 },
                  hover: { 
                    scaleX: 1,
                    transition: { duration: 0.1, delay: 3.2 }
                  }
                }}
              ></motion.div>
            </motion.div>
          </motion.div>
          
          {/* Empty line */}
          <motion.div className="h-0.5"></motion.div>
          
          {/* Next paragraph preview */}
          <motion.div 
            className="w-3/4 h-0.5 bg-brown-200 rounded opacity-50"
            variants={{
              rest: { opacity: 0 },
              hover: { 
                opacity: 0.5,
                transition: { delay: 3.5 }
              }
            }}
          ></motion.div>
        </motion.div>
        
        {/* Word count indicator */}
        <motion.div 
          className="absolute bottom-1 right-1 w-4 h-0.5 bg-brown-400 rounded opacity-60"
          variants={{
            rest: { scaleX: 0.3 },
            hover: { 
              scaleX: 1,
              transition: { delay: 4 }
            }
          }}
        ></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const PageHeadersThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-2">
        <motion.div className="w-full h-3 bg-brown-700 rounded" variants={fillVariants}></motion.div>
        <motion.div className="w-2/3 h-1 bg-brown-400 rounded" variants={fillVariants}></motion.div>
        <motion.div className="flex gap-2">
          <motion.div className="w-8 h-2 bg-brown-600 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-8 h-2 bg-brown-300 rounded" variants={buttonVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const AvatarsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-4 shadow-sm" variants={itemVariants}>
      <motion.div className="flex items-center justify-center gap-1">
        <motion.div className="w-6 h-6 bg-brown-600 rounded-full" variants={pulseVariants}></motion.div>
        <motion.div className="w-5 h-5 bg-brown-500 rounded-full" variants={pulseVariants}></motion.div>
        <motion.div className="w-4 h-4 bg-brown-400 rounded-full" variants={pulseVariants}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const FileUploadThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-4 shadow-sm" variants={itemVariants}>
      <motion.div className="border-2 border-dashed border-brown-400 rounded-lg h-full flex items-center justify-center">
        <motion.div className="w-6 h-6 bg-brown-600 rounded" variants={floatVariants}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const PaginationThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="h-full space-y-1" variants={staggerChildren}>
        {/* Table above pagination */}
        <motion.div 
          className="w-full h-10 bg-stone-50 border border-brown-200 rounded p-1"
          variants={{
            rest: { opacity: 0.8, scale: 1 },
            hover: { 
              opacity: 1,
              scale: 1.02,
              transition: { delay: 0.1 }
            }
          }}
        >
          {/* Table header */}
          <motion.div className="flex gap-1 h-2 mb-0.5">
            <motion.div 
              className="w-6 h-full bg-brown-700 rounded"
              variants={{
                rest: { scaleY: 1 },
                hover: { 
                  scaleY: [1, 1.1, 1],
                  transition: { delay: 0.3 }
                }
              }}
            ></motion.div>
            <motion.div 
              className="w-4 h-full bg-brown-600 rounded"
              variants={{
                rest: { scaleY: 1 },
                hover: { 
                  scaleY: [1, 1.1, 1],
                  transition: { delay: 0.5 }
                }
              }}
            ></motion.div>
            <motion.div 
              className="w-5 h-full bg-brown-500 rounded"
              variants={{
                rest: { scaleY: 1 },
                hover: { 
                  scaleY: [1, 1.1, 1],
                  transition: { delay: 0.7 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Table rows */}
          <motion.div className="space-y-0.5">
            <motion.div className="flex gap-1 h-1">
              <motion.div 
                className="w-6 h-full bg-brown-300 rounded"
                variants={{
                  rest: { opacity: 0.7 },
                  hover: { 
                    opacity: 1,
                    backgroundColor: "rgb(120 113 108)",
                    transition: { delay: 0.9 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-4 h-full bg-brown-200 rounded"
                variants={{
                  rest: { opacity: 0.7 },
                  hover: { 
                    opacity: 1,
                    transition: { delay: 1.1 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-5 h-full bg-brown-400 rounded"
                variants={{
                  rest: { opacity: 0.7 },
                  hover: { 
                    opacity: 1,
                    transition: { delay: 1.3 }
                  }
                }}
              ></motion.div>
            </motion.div>
            
            <motion.div className="flex gap-1 h-1">
              <motion.div 
                className="w-6 h-full bg-brown-200 rounded"
                variants={{
                  rest: { opacity: 0.7 },
                  hover: { 
                    opacity: 1,
                    transition: { delay: 1.5 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-4 h-full bg-brown-300 rounded"
                variants={{
                  rest: { opacity: 0.7 },
                  hover: { 
                    opacity: 1,
                    transition: { delay: 1.7 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-5 h-full bg-brown-200 rounded"
                variants={{
                  rest: { opacity: 0.7 },
                  hover: { 
                    opacity: 1,
                    transition: { delay: 1.9 }
                  }
                }}
              ></motion.div>
            </motion.div>
            
            <motion.div className="flex gap-1 h-1">
              <motion.div 
                className="w-6 h-full bg-brown-400 rounded"
                variants={{
                  rest: { opacity: 0.7 },
                  hover: { 
                    opacity: 1,
                    transition: { delay: 2.1 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-4 h-full bg-brown-200 rounded"
                variants={{
                  rest: { opacity: 0.7 },
                  hover: { 
                    opacity: 1,
                    transition: { delay: 2.3 }
                  }
                }}
              ></motion.div>
              <motion.div 
                className="w-5 h-full bg-brown-300 rounded"
                variants={{
                  rest: { opacity: 0.7 },
                  hover: { 
                    opacity: 1,
                    transition: { delay: 2.5 }
                  }
                }}
              ></motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Animated pagination below */}
        <motion.div 
          className="flex items-center justify-center gap-0.5"
          variants={{
            rest: { opacity: 0.8, y: 2 },
            hover: { 
              opacity: 1,
              y: 0,
              transition: { delay: 2.7 }
            }
          }}
        >
          {/* Previous button */}
          <motion.div 
            className="w-2.5 h-2.5 bg-brown-300 rounded flex items-center justify-center"
            variants={{
              rest: { scale: 1, backgroundColor: "rgb(168 162 158)" },
              hover: { 
                scale: 1.1,
                backgroundColor: "rgb(120 113 108)",
                transition: { delay: 3 }
              }
            }}
          >
            <motion.div className="w-0.5 h-1 bg-brown-700 rounded"></motion.div>
          </motion.div>
          
          {/* Page numbers with animation */}
          <motion.div 
            className="w-2.5 h-2.5 bg-brown-200 rounded flex items-center justify-center"
            variants={{
              rest: { scale: 1, backgroundColor: "rgb(231 229 228)" },
              hover: { 
                scale: [1, 1.2, 1],
                backgroundColor: [
                  "rgb(231 229 228)",
                  "rgb(120 113 108)",
                  "rgb(231 229 228)"
                ],
                transition: { 
                  duration: 3,
                  delay: 3.2,
                  repeat: Infinity,
                  times: [0, 0.33, 1]
                }
              }
            }}
          >
            <motion.div className="w-0.5 h-0.5 bg-brown-600 rounded"></motion.div>
          </motion.div>
          
          {/* Current page */}
          <motion.div 
            className="w-2.5 h-2.5 bg-brown-700 rounded flex items-center justify-center relative"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: 1.15,
                transition: { delay: 3.5 }
              }
            }}
          >
            <motion.div className="w-0.5 h-1 bg-brown-100 rounded"></motion.div>
            
            {/* Current page glow */}
            <motion.div 
              className="absolute inset-0 rounded"
              variants={{
                rest: { boxShadow: "0 0 0 0 transparent" },
                hover: { 
                  boxShadow: [
                    "0 0 0 0 transparent",
                    "0 0 4px rgba(120, 113, 108, 0.6)",
                    "0 0 0 0 transparent"
                  ],
                  transition: { duration: 2, delay: 4, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Next pages */}
          <motion.div 
            className="w-2.5 h-2.5 bg-brown-200 rounded flex items-center justify-center"
            variants={{
              rest: { scale: 1, backgroundColor: "rgb(231 229 228)" },
              hover: { 
                scale: [1, 1, 1.2, 1],
                backgroundColor: [
                  "rgb(231 229 228)",
                  "rgb(231 229 228)",
                  "rgb(120 113 108)",
                  "rgb(231 229 228)"
                ],
                transition: { 
                  duration: 3,
                  delay: 5,
                  repeat: Infinity,
                  times: [0, 0.33, 0.66, 1]
                }
              }
            }}
          >
            <motion.div className="w-0.5 h-0.5 bg-brown-600 rounded"></motion.div>
          </motion.div>
          
          {/* Ellipsis */}
          <motion.div 
            className="flex gap-0.5 px-0.5"
            variants={{
              rest: { opacity: 0.6 },
              hover: { opacity: 1, transition: { delay: 4.2 } }
            }}
          >
            <motion.div className="w-0.5 h-0.5 bg-brown-400 rounded-full" variants={pulseVariants}></motion.div>
            <motion.div className="w-0.5 h-0.5 bg-brown-400 rounded-full" variants={pulseVariants}></motion.div>
          </motion.div>
          
          {/* Next button */}
          <motion.div 
            className="w-2.5 h-2.5 bg-brown-300 rounded flex items-center justify-center"
            variants={{
              rest: { scale: 1, backgroundColor: "rgb(168 162 158)" },
              hover: { 
                scale: 1.1,
                backgroundColor: "rgb(120 113 108)",
                transition: { delay: 4.5 }
              }
            }}
          >
            <motion.div className="w-0.5 h-1 bg-brown-700 rounded"></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Results info */}
        <motion.div 
          className="flex justify-center gap-0.5 text-xs"
          variants={{
            rest: { opacity: 0, y: 2 },
            hover: { 
              opacity: 1, 
              y: 0,
              transition: { delay: 5 }
            }
          }}
        >
          <motion.div className="w-3 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-1 h-0.5 bg-brown-600 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-2 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
        </motion.div>
        
        {/* Page loading transition */}
        <motion.div 
          className="w-full h-0.5 bg-brown-200 rounded overflow-hidden"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1, transition: { delay: 5.5 } }
          }}
        >
          <motion.div 
            className="h-full bg-brown-600 rounded"
            variants={{
              rest: { width: "0%" },
              hover: { 
                width: ["0%", "100%", "0%"],
                transition: { duration: 2, delay: 6, repeat: Infinity }
              }
            }}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const AlertsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-1.5 h-full" variants={staggerChildren}>
        {/* Success Alert */}
        <motion.div 
          className="flex items-center gap-1 p-1 bg-green-50 border border-green-200 rounded relative overflow-hidden"
          variants={{
            rest: { scale: 1, opacity: 0.8, x: 0 },
            hover: { 
              scale: 1.02,
              opacity: 1,
              x: 0,
              transition: { delay: 0.1 }
            }
          }}
        >
          <motion.div 
            className="w-1.5 h-1.5 bg-green-500 rounded-full"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.3, 1],
                transition: { duration: 1, delay: 0.3, repeat: Infinity }
              }
            }}
          ></motion.div>
          <motion.div className="w-12 h-0.5 bg-green-700 rounded" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-1.5 h-1.5 bg-green-600 rounded ml-auto"
            variants={buttonVariants}
          ></motion.div>
          
          {/* Success sweep animation */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200 to-transparent"
            variants={{
              rest: { x: "-100%", opacity: 0 },
              hover: { 
                x: "100%", 
                opacity: [0, 0.5, 0],
                transition: { duration: 1.5, delay: 1, repeat: Infinity }
              }
            }}
          ></motion.div>
        </motion.div>

        {/* Warning Alert */}
        <motion.div 
          className="flex items-center gap-1 p-1 bg-yellow-50 border border-yellow-200 rounded relative"
          variants={{
            rest: { scale: 1, opacity: 0.8 },
            hover: { 
              scale: 1.02,
              opacity: 1,
              transition: { delay: 0.3 }
            }
          }}
        >
          <motion.div 
            className="w-1.5 h-1.5 bg-yellow-500 rounded-full"
            variants={{
              rest: { scale: 1, rotate: 0 },
              hover: { 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
                transition: { duration: 1.2, delay: 0.5, repeat: Infinity }
              }
            }}
          ></motion.div>
          <motion.div className="w-10 h-0.5 bg-yellow-700 rounded" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-1.5 h-1.5 bg-yellow-600 rounded ml-auto"
            variants={buttonVariants}
          ></motion.div>
        </motion.div>

        {/* Error Alert with shake */}
        <motion.div 
          className="flex items-center gap-1 p-1 bg-red-50 border border-red-200 rounded relative"
          variants={{
            rest: { scale: 1, opacity: 0.8, x: 0 },
            hover: { 
              scale: 1.02,
              opacity: 1,
              x: [0, -1, 1, -0.5, 0.5, 0],
              transition: { 
                scale: { delay: 0.5 },
                opacity: { delay: 0.5 },
                x: { duration: 0.6, delay: 0.7, repeat: Infinity, repeatDelay: 2 }
              }
            }
          }}
        >
          <motion.div 
            className="w-1.5 h-1.5 bg-red-500 rounded-full"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.4, 1],
                transition: { duration: 0.8, delay: 0.7, repeat: Infinity }
              }
            }}
          ></motion.div>
          <motion.div className="w-14 h-0.5 bg-red-700 rounded" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-1.5 h-1.5 bg-red-600 rounded ml-auto"
            variants={buttonVariants}
          ></motion.div>
          
          {/* Error pulse */}
          <motion.div 
            className="absolute inset-0 bg-red-100 rounded"
            variants={{
              rest: { opacity: 0, scale: 1 },
              hover: { 
                opacity: [0, 0.3, 0],
                scale: [1, 1.05, 1],
                transition: { duration: 1.5, delay: 1.5, repeat: Infinity }
              }
            }}
          ></motion.div>
        </motion.div>

        {/* Info Alert with slide */}
        <motion.div 
          className="flex items-center gap-1 p-1 bg-blue-50 border border-blue-200 rounded relative overflow-hidden"
          variants={{
            rest: { scale: 1, opacity: 0.8 },
            hover: { 
              scale: 1.02,
              opacity: 1,
              transition: { delay: 0.7 }
            }
          }}
        >
          <motion.div 
            className="w-1.5 h-1.5 bg-blue-500 rounded-full"
            variants={{
              rest: { scale: 1, rotate: 0 },
              hover: { 
                scale: 1.1,
                rotate: 360,
                transition: { duration: 2, delay: 0.9, repeat: Infinity }
              }
            }}
          ></motion.div>
          <motion.div className="w-11 h-0.5 bg-blue-700 rounded" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-1.5 h-1.5 bg-blue-600 rounded ml-auto"
            variants={buttonVariants}
          ></motion.div>
          
          {/* Info slide indicator */}
          <motion.div 
            className="absolute bottom-0 left-0 h-0.5 bg-blue-600 rounded"
            variants={{
              rest: { width: "0%" },
              hover: { 
                width: "100%",
                transition: { duration: 2, delay: 1.2 }
              }
            }}
          ></motion.div>
        </motion.div>

        {/* Notification toast appearing */}
        <motion.div 
          className="absolute top-1 right-1 w-6 h-4 bg-brown-700 rounded shadow-lg p-0.5"
          variants={{
            rest: { scale: 0, opacity: 0, y: -10 },
            hover: { 
              scale: 1,
              opacity: 1,
              y: 0,
              transition: { 
                type: "spring",
                damping: 15,
                stiffness: 300,
                delay: 2
              }
            }
          }}
        >
          <motion.div className="w-full h-0.5 bg-brown-100 rounded mb-0.5"></motion.div>
          <motion.div className="w-3/4 h-0.5 bg-brown-200 rounded"></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const BadgesThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-2" variants={staggerChildren}>
        {/* Row 1: Status badges */}
        <motion.div className="flex gap-1 items-center justify-center">
          {/* Active badge with pulse */}
          <motion.div 
            className="w-6 h-2.5 bg-green-500 rounded-full flex items-center justify-center relative"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.1, 1],
                transition: { duration: 1, delay: 0.1, repeat: Infinity }
              }
            }}
          >
            <motion.div className="w-3 h-0.5 bg-green-100 rounded"></motion.div>
            {/* Notification dot */}
            <motion.div 
              className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-red-500 rounded-full"
              variants={{
                rest: { scale: 0 },
                hover: { 
                  scale: [0, 1.3, 1],
                  transition: { delay: 0.5 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Warning badge */}
          <motion.div 
            className="w-7 h-2.5 bg-yellow-500 rounded-full flex items-center justify-center"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.05, 1],
                backgroundColor: ["rgb(234 179 8)", "rgb(245 158 11)", "rgb(234 179 8)"],
                transition: { duration: 1.2, delay: 0.3, repeat: Infinity }
              }
            }}
          >
            <motion.div className="w-4 h-0.5 bg-yellow-100 rounded"></motion.div>
          </motion.div>
          
          {/* Error badge with shake */}
          <motion.div 
            className="w-6 h-2.5 bg-red-500 rounded-full flex items-center justify-center"
            variants={{
              rest: { scale: 1, x: 0 },
              hover: { 
                scale: [1, 1.1, 1],
                x: [0, -1, 1, -0.5, 0.5, 0],
                transition: { duration: 0.8, delay: 0.7, repeat: Infinity }
              }
            }}
          >
            <motion.div className="w-3 h-0.5 bg-red-100 rounded"></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Row 2: Category badges */}
        <motion.div className="flex gap-1 items-center justify-center">
          {/* Primary badge */}
          <motion.div 
            className="w-8 h-2.5 bg-brown-700 rounded-full flex items-center justify-center relative overflow-hidden"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: 1.05,
                transition: { delay: 1 }
              }
            }}
          >
            <motion.div className="w-5 h-0.5 bg-brown-100 rounded z-10 relative"></motion.div>
            {/* Shimmer effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-brown-500 to-transparent"
              variants={{
                rest: { x: "-100%" },
                hover: { 
                  x: "100%",
                  transition: { duration: 1.5, delay: 1.2, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Secondary badge */}
          <motion.div 
            className="w-5 h-2.5 bg-blue-500 rounded-full flex items-center justify-center"
            variants={{
              rest: { scale: 1, opacity: 0.8 },
              hover: { 
                scale: 1.08,
                opacity: 1,
                transition: { delay: 1.3 }
              }
            }}
          >
            <motion.div className="w-2 h-0.5 bg-blue-100 rounded"></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Row 3: Count badges */}
        <motion.div className="flex gap-1 items-center justify-center">
          {/* Count badge with number animation */}
          <motion.div 
            className="w-4 h-2.5 bg-purple-500 rounded-full flex items-center justify-center relative"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.2, 1],
                transition: { delay: 1.5 }
              }
            }}
          >
            <motion.div 
              className="w-1 h-0.5 bg-purple-100 rounded"
              variants={{
                rest: { scaleX: 0.5 },
                hover: { 
                  scaleX: [0.5, 1, 0.3, 1],
                  transition: { duration: 1, delay: 1.8, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* New badge with glow */}
          <motion.div 
            className="w-6 h-2.5 bg-orange-500 rounded-full flex items-center justify-center"
            variants={{
              rest: { 
                scale: 1,
                boxShadow: "0 0 0 0 transparent"
              },
              hover: { 
                scale: 1.1,
                boxShadow: [
                  "0 0 0 0 transparent",
                  "0 0 8px rgba(249 115 22, 0.6)",
                  "0 0 0 0 transparent"
                ],
                transition: { 
                  delay: 2,
                  boxShadow: { duration: 2, repeat: Infinity }
                }
              }
            }}
          >
            <motion.div className="w-3 h-0.5 bg-orange-100 rounded"></motion.div>
          </motion.div>
          
          {/* Pro badge with premium effect */}
          <motion.div 
            className="w-5 h-2.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center relative"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: 1.15,
                transition: { delay: 2.3 }
              }
            }}
          >
            <motion.div className="w-2 h-0.5 bg-yellow-100 rounded"></motion.div>
            {/* Crown indicator */}
            <motion.div 
              className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-yellow-200 rounded"
              variants={{
                rest: { scale: 0, opacity: 0 },
                hover: { 
                  scale: 1,
                  opacity: 1,
                  transition: { delay: 2.5 }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Badge interaction line */}
        <motion.div 
          className="w-full h-0.5 bg-brown-200 rounded overflow-hidden"
          variants={{
            rest: { opacity: 0 },
            hover: { 
              opacity: 1,
              transition: { delay: 3 }
            }
          }}
        >
          <motion.div 
            className="h-full bg-brown-600 rounded"
            variants={{
              rest: { width: "0%" },
              hover: { 
                width: "100%",
                transition: { duration: 1.5, delay: 3.2 }
              }
            }}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const InlineCTAsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-2" variants={staggerChildren}>
        <motion.div className="w-full h-1 bg-brown-300 rounded" variants={fillVariants}></motion.div>
        <motion.div className="w-3/4 h-1 bg-brown-200 rounded" variants={fillVariants}></motion.div>
        <motion.div className="w-full h-1 bg-brown-200 rounded" variants={fillVariants}></motion.div>
        <motion.div className="flex gap-2 justify-center mt-3">
          <motion.div className="w-12 h-4 bg-brown-700 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-10 h-4 bg-brown-300 border border-brown-500 rounded" variants={buttonVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const CarouselsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="relative h-full overflow-hidden rounded-lg" variants={staggerChildren}>
        {/* Carousel viewport */}
        <motion.div className="relative w-full h-16 bg-stone-50 rounded-lg overflow-hidden">
          {/* Slide container */}
          <motion.div 
            className="flex absolute top-0 left-0 h-full"
            variants={{
              rest: { x: 0 },
              hover: { 
                x: [0, -26, -52, -26, 0],
                transition: { 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }
              }
            }}
          >
            {/* Slide 1 - Image placeholder */}
            <motion.div 
              className="w-24 h-full bg-brown-600 rounded flex-shrink-0 mr-1 flex items-center justify-center relative"
              variants={{
                rest: { opacity: 1, scale: 1 },
                hover: { opacity: 1, scale: 1 }
              }}
            >
              <motion.div className="w-16 h-10 bg-brown-700 rounded"></motion.div>
              <motion.div className="absolute bottom-1 left-1 w-8 h-1 bg-brown-100 rounded opacity-80"></motion.div>
            </motion.div>
            
            {/* Slide 2 - Featured content */}
            <motion.div 
              className="w-24 h-full bg-brown-500 rounded flex-shrink-0 mr-1 flex items-center justify-center relative"
              variants={{
                rest: { opacity: 0.8, scale: 0.95 },
                hover: { opacity: 1, scale: 1 }
              }}
            >
              <motion.div className="w-16 h-10 bg-brown-600 rounded"></motion.div>
              <motion.div className="absolute bottom-1 left-1 w-6 h-1 bg-brown-100 rounded opacity-80"></motion.div>
            </motion.div>
            
            {/* Slide 3 - Next item */}
            <motion.div 
              className="w-24 h-full bg-brown-400 rounded flex-shrink-0 mr-1 flex items-center justify-center relative"
              variants={{
                rest: { opacity: 0.6, scale: 0.9 },
                hover: { opacity: 1, scale: 1 }
              }}
            >
              <motion.div className="w-16 h-10 bg-brown-500 rounded"></motion.div>
              <motion.div className="absolute bottom-1 left-1 w-10 h-1 bg-brown-100 rounded opacity-80"></motion.div>
            </motion.div>
            
            {/* Slide 4 - Loop back */}
            <motion.div 
              className="w-24 h-full bg-brown-300 rounded flex-shrink-0 mr-1 flex items-center justify-center relative"
              variants={{
                rest: { opacity: 0.5, scale: 0.85 },
                hover: { opacity: 1, scale: 1 }
              }}
            >
              <motion.div className="w-16 h-10 bg-brown-400 rounded"></motion.div>
              <motion.div className="absolute bottom-1 left-1 w-7 h-1 bg-brown-100 rounded opacity-80"></motion.div>
            </motion.div>
          </motion.div>
          
          {/* Navigation arrows */}
          <motion.div 
            className="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white bg-opacity-80 rounded-full flex items-center justify-center"
            variants={{
              rest: { scale: 1, opacity: 0.6 },
              hover: { 
                scale: 1.2,
                opacity: 1,
                transition: { delay: 1 }
              }
            }}
          >
            <motion.div className="w-0.5 h-1 bg-brown-700 rounded"></motion.div>
          </motion.div>
          
          <motion.div 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white bg-opacity-80 rounded-full flex items-center justify-center"
            variants={{
              rest: { scale: 1, opacity: 0.6 },
              hover: { 
                scale: 1.2,
                opacity: 1,
                transition: { delay: 1.2 }
              }
            }}
          >
            <motion.div className="w-0.5 h-1 bg-brown-700 rounded"></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Pagination dots */}
        <motion.div className="flex gap-1 justify-center mt-1">
          <motion.div 
            className="w-1.5 h-1.5 bg-brown-700 rounded-full"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.3, 1, 1.3, 1],
                transition: { 
                  duration: 6, 
                  repeat: Infinity,
                  delay: 0.5
                }
              }
            }}
          ></motion.div>
          <motion.div 
            className="w-1.5 h-1.5 bg-brown-400 rounded-full"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1, 1.3, 1, 1],
                backgroundColor: [
                  "rgb(168 162 158)",
                  "rgb(168 162 158)",
                  "rgb(120 113 108)",
                  "rgb(168 162 158)",
                  "rgb(168 162 158)"
                ],
                transition: { 
                  duration: 6, 
                  repeat: Infinity,
                  delay: 0.5
                }
              }
            }}
          ></motion.div>
          <motion.div 
            className="w-1.5 h-1.5 bg-brown-400 rounded-full"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1, 1, 1.3, 1],
                backgroundColor: [
                  "rgb(168 162 158)",
                  "rgb(168 162 158)",
                  "rgb(168 162 158)",
                  "rgb(120 113 108)",
                  "rgb(168 162 158)"
                ],
                transition: { 
                  duration: 6, 
                  repeat: Infinity,
                  delay: 0.5
                }
              }
            }}
          ></motion.div>
          <motion.div 
            className="w-1.5 h-1.5 bg-brown-400 rounded-full"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1, 1, 1, 1.3],
                backgroundColor: [
                  "rgb(168 162 158)",
                  "rgb(168 162 158)",
                  "rgb(168 162 158)",
                  "rgb(168 162 158)",
                  "rgb(120 113 108)"
                ],
                transition: { 
                  duration: 6, 
                  repeat: Infinity,
                  delay: 0.5
                }
              }
            }}
          ></motion.div>
        </motion.div>
        
        {/* Progress indicator */}
        <motion.div 
          className="w-full h-0.5 bg-brown-200 rounded overflow-hidden mt-0.5"
          variants={{
            rest: { opacity: 0 },
            hover: { 
              opacity: 1,
              transition: { delay: 2 }
            }
          }}
        >
          <motion.div 
            className="h-full bg-brown-700 rounded"
            variants={{
              rest: { width: "25%" },
              hover: { 
                width: ["25%", "50%", "75%", "100%", "25%"],
                transition: { 
                  duration: 6, 
                  repeat: Infinity,
                  delay: 2.5
                }
              }
            }}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const ProgressStepsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="h-full flex flex-col justify-center" variants={staggerChildren}>
        {/* Progress steps in the middle */}
        <motion.div className="flex items-center justify-center gap-1">
          {/* Step 1 - Completed */}
          <motion.div 
            className="w-4 h-4 bg-brown-700 rounded-full flex items-center justify-center relative"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.2, 1],
                transition: { delay: 0.2 }
              }
            }}
          >
            {/* Checkmark animation */}
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full"
              variants={{
                rest: { scale: 1 },
                hover: { 
                  scale: [1, 0.8, 1.2, 1],
                  transition: { delay: 0.4 }
                }
              }}
            ></motion.div>
            
            {/* Completion glow */}
            <motion.div 
              className="absolute inset-0 rounded-full"
              variants={{
                rest: { boxShadow: "0 0 0 0 transparent" },
                hover: { 
                  boxShadow: [
                    "0 0 0 0 transparent",
                    "0 0 8px rgba(120, 113, 108, 0.6)",
                    "0 0 0 0 transparent"
                  ],
                  transition: { duration: 2, delay: 1, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Connector 1 - Completed */}
          <motion.div 
            className="w-6 h-0.5 bg-brown-200 rounded overflow-hidden"
            variants={{
              rest: { opacity: 0.5 },
              hover: { opacity: 1, transition: { delay: 0.6 } }
            }}
          >
            <motion.div 
              className="h-full bg-brown-700 rounded"
              variants={{
                rest: { width: "0%" },
                hover: { 
                  width: "100%",
                  transition: { duration: 1, delay: 0.8 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Step 2 - Current/Active */}
          <motion.div 
            className="w-4 h-4 bg-brown-500 rounded-full border-2 border-brown-700 relative"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.15, 1],
                transition: { delay: 1.8 }
              }
            }}
          >
            {/* Active pulse */}
            <motion.div 
              className="absolute inset-0 bg-brown-600 rounded-full"
              variants={{
                rest: { scale: 1, opacity: 0.5 },
                hover: { 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5],
                  transition: { duration: 2, delay: 2, repeat: Infinity }
                }
              }}
            ></motion.div>
            
            {/* Current step indicator */}
            <motion.div 
              className="absolute inset-1 bg-brown-700 rounded-full"
              variants={{
                rest: { scale: 0.6 },
                hover: { 
                  scale: [0.6, 1, 0.8],
                  transition: { delay: 2.2 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Connector 2 - Not completed */}
          <motion.div 
            className="w-6 h-0.5 bg-brown-200 rounded"
            variants={{
              rest: { opacity: 0.3 },
              hover: { 
                opacity: 0.6,
                transition: { delay: 2.5 }
              }
            }}
          ></motion.div>
          
          {/* Step 3 - Future */}
          <motion.div 
            className="w-4 h-4 bg-brown-200 rounded-full border-2 border-brown-400"
            variants={{
              rest: { scale: 1, opacity: 0.6 },
              hover: { 
                scale: 1.05,
                opacity: 0.8,
                transition: { delay: 3 }
              }
            }}
          >
            {/* Future step preview */}
            <motion.div 
              className="w-full h-full bg-brown-300 rounded-full"
              variants={{
                rest: { scale: 0 },
                hover: { 
                  scale: [0, 0.5, 0],
                  transition: { duration: 1, delay: 3.5, repeat: Infinity }
                }
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
        
        {/* Step labels */}
        <motion.div 
          className="flex items-center justify-center gap-2 mt-2"
          variants={{
            rest: { opacity: 0, y: 5 },
            hover: { 
              opacity: 1, 
              y: 0,
              transition: { delay: 4 }
            }
          }}
        >
          <motion.div className="w-3 h-0.5 bg-brown-600 rounded"></motion.div>
          <motion.div className="w-4 h-0.5 bg-brown-700 rounded"></motion.div>
          <motion.div className="w-3 h-0.5 bg-brown-300 rounded"></motion.div>
        </motion.div>
        
        {/* Progress percentage */}
        <motion.div 
          className="w-full h-0.5 bg-brown-200 rounded overflow-hidden mt-1"
          variants={{
            rest: { opacity: 0 },
            hover: { 
              opacity: 1,
              transition: { delay: 4.5 }
            }
          }}
        >
          <motion.div 
            className="h-full bg-brown-700 rounded"
            variants={{
              rest: { width: "0%" },
              hover: { 
                width: "66%",
                transition: { duration: 1.5, delay: 5 }
              }
            }}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const ActivityFeedsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-2" variants={staggerChildren}>
        <motion.div className="flex items-center gap-2">
          <motion.div className="w-3 h-3 bg-brown-600 rounded-full" variants={pulseVariants}></motion.div>
          <motion.div className="space-y-0.5">
            <motion.div className="w-16 h-1 bg-brown-600 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-12 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
          </motion.div>
        </motion.div>
        <motion.div className="flex items-center gap-2">
          <motion.div className="w-3 h-3 bg-green-500 rounded-full" variants={pulseVariants}></motion.div>
          <motion.div className="space-y-0.5">
            <motion.div className="w-14 h-1 bg-brown-500 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-10 h-0.5 bg-brown-300 rounded" variants={fillVariants}></motion.div>
          </motion.div>
        </motion.div>
        <motion.div className="flex items-center gap-2">
          <motion.div className="w-3 h-3 bg-blue-500 rounded-full" variants={pulseVariants}></motion.div>
          <motion.div className="space-y-0.5">
            <motion.div className="w-18 h-1 bg-brown-600 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-8 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const MessagingThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-2" variants={staggerChildren}>
        <motion.div className="flex justify-end">
          <motion.div className="w-16 h-3 bg-brown-700 rounded-lg rounded-br-sm" variants={slideVariants}></motion.div>
        </motion.div>
        <motion.div className="flex justify-start">
          <motion.div className="w-14 h-3 bg-brown-200 border border-brown-300 rounded-lg rounded-bl-sm" variants={slideOutVariants}></motion.div>
        </motion.div>
        <motion.div className="flex justify-end">
          <motion.div className="w-12 h-3 bg-brown-700 rounded-lg rounded-br-sm" variants={slideVariants}></motion.div>
        </motion.div>
        <motion.div className="w-full h-2 bg-brown-50 border border-brown-300 rounded flex items-center px-1" variants={itemVariants}>
          <motion.div className="w-8 h-0.5 bg-brown-400 rounded" variants={fillVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const TabsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-2" variants={staggerChildren}>
        <motion.div className="flex gap-1">
          <motion.div className="w-8 h-3 bg-brown-700 rounded-t border-b-2 border-brown-700" variants={buttonVariants}></motion.div>
          <motion.div className="w-6 h-3 bg-brown-200 rounded-t border-b border-brown-300" variants={buttonVariants}></motion.div>
          <motion.div className="w-7 h-3 bg-brown-200 rounded-t border-b border-brown-300" variants={buttonVariants}></motion.div>
        </motion.div>
        <motion.div className="w-full h-px bg-brown-300"></motion.div>
        <motion.div className="space-y-1 pt-1">
          <motion.div className="w-full h-1 bg-brown-600 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-3/4 h-1 bg-brown-400 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-full h-1 bg-brown-300 rounded" variants={fillVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const TablesThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-1" variants={staggerChildren}>
        <motion.div className="flex gap-1">
          <motion.div className="w-8 h-2 bg-brown-700 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-6 h-2 bg-brown-700 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-7 h-2 bg-brown-700 rounded" variants={fillVariants}></motion.div>
        </motion.div>
        <motion.div className="w-full h-px bg-brown-400"></motion.div>
        <motion.div className="flex gap-1">
          <motion.div className="w-8 h-1.5 bg-brown-300 rounded" variants={slideVariants}></motion.div>
          <motion.div className="w-6 h-1.5 bg-brown-200 rounded" variants={slideVariants}></motion.div>
          <motion.div className="w-7 h-1.5 bg-brown-400 rounded" variants={slideVariants}></motion.div>
        </motion.div>
        <motion.div className="flex gap-1">
          <motion.div className="w-8 h-1.5 bg-brown-200 rounded" variants={slideVariants}></motion.div>
          <motion.div className="w-6 h-1.5 bg-brown-300 rounded" variants={slideVariants}></motion.div>
          <motion.div className="w-7 h-1.5 bg-brown-200 rounded" variants={slideVariants}></motion.div>
        </motion.div>
        <motion.div className="flex gap-1">
          <motion.div className="w-8 h-1.5 bg-brown-400 rounded" variants={slideVariants}></motion.div>
          <motion.div className="w-6 h-1.5 bg-brown-200 rounded" variants={slideVariants}></motion.div>
          <motion.div className="w-7 h-1.5 bg-brown-300 rounded" variants={slideVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const NotificationsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-1.5" variants={staggerChildren}>
        <motion.div className="flex items-center gap-2">
          <motion.div className="w-2 h-2 bg-red-500 rounded-full" variants={pulseVariants}></motion.div>
          <motion.div className="w-16 h-1 bg-brown-600 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-4 h-1 bg-brown-300 rounded ml-auto" variants={fillVariants}></motion.div>
        </motion.div>
        <motion.div className="flex items-center gap-2">
          <motion.div className="w-2 h-2 bg-blue-500 rounded-full" variants={pulseVariants}></motion.div>
          <motion.div className="w-14 h-1 bg-brown-500 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-6 h-1 bg-brown-300 rounded ml-auto" variants={fillVariants}></motion.div>
        </motion.div>
        <motion.div className="flex items-center gap-2">
          <motion.div className="w-2 h-2 bg-green-500 rounded-full" variants={pulseVariants}></motion.div>
          <motion.div className="w-18 h-1 bg-brown-600 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-3 h-1 bg-brown-300 rounded ml-auto" variants={fillVariants}></motion.div>
        </motion.div>
        <motion.div className="flex items-center gap-2">
          <motion.div className="w-2 h-2 bg-yellow-500 rounded-full" variants={pulseVariants}></motion.div>
          <motion.div className="w-12 h-1 bg-brown-400 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-5 h-1 bg-brown-300 rounded ml-auto" variants={fillVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const CalendarsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-1" variants={staggerChildren}>
        {/* Calendar header with month/year */}
        <motion.div className="w-full h-2.5 bg-brown-700 rounded-t flex items-center justify-between px-1" variants={itemVariants}>
          <motion.div 
            className="w-1 h-1 bg-brown-100 rounded"
            variants={buttonVariants}
          ></motion.div>
          <motion.div className="w-12 h-0.5 bg-brown-100 rounded" variants={fillVariants}></motion.div>
          <motion.div 
            className="w-1 h-1 bg-brown-100 rounded"
            variants={buttonVariants}
          ></motion.div>
        </motion.div>
        
        {/* Week day headers */}
        <motion.div className="grid grid-cols-7 gap-0.5 px-0.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <motion.div 
              key={day + index}
              className="w-3 h-1 bg-brown-300 rounded text-center"
              variants={{
                rest: { opacity: 0.7 },
                hover: { opacity: 1 }
              }}
            ></motion.div>
          ))}
        </motion.div>
        
        {/* Calendar grid - 4 weeks */}
        <motion.div className="grid grid-cols-7 gap-0.5 px-0.5" variants={staggerChildren}>
          {/* Week 1 */}
          <motion.div className="w-3 h-1.5 bg-brown-100 rounded opacity-50" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div 
            className="w-3 h-1.5 bg-blue-500 rounded"
            variants={{
              rest: { scale: 1, backgroundColor: "rgb(59 130 246)" },
              hover: { 
                scale: [1, 1.2, 1], 
                backgroundColor: ["rgb(59 130 246)", "rgb(37 99 235)", "rgb(59 130 246)"],
                transition: { duration: 1, repeat: Infinity }
              }
            }}
          ></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-300 rounded" variants={buttonVariants}></motion.div>
          
          {/* Week 2 */}
          <motion.div className="w-3 h-1.5 bg-brown-300 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div 
            className="w-3 h-1.5 bg-green-500 rounded"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.15, 1],
                transition: { duration: 1.2, repeat: Infinity, delay: 0.3 }
              }
            }}
          ></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div 
            className="w-3 h-1.5 bg-brown-700 rounded"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.1, 1],
                transition: { duration: 0.8, repeat: Infinity, delay: 0.6 }
              }
            }}
          ></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-300 rounded" variants={buttonVariants}></motion.div>
          
          {/* Week 3 */}
          <motion.div className="w-3 h-1.5 bg-brown-300 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div 
            className="w-3 h-1.5 bg-orange-500 rounded"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.25, 1],
                transition: { duration: 1.5, repeat: Infinity, delay: 0.9 }
              }
            }}
          ></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-300 rounded" variants={buttonVariants}></motion.div>
          
          {/* Week 4 */}
          <motion.div className="w-3 h-1.5 bg-brown-300 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div 
            className="w-3 h-1.5 bg-red-500 rounded"
            variants={{
              rest: { scale: 1 },
              hover: { 
                scale: [1, 1.3, 1],
                transition: { duration: 1.8, repeat: Infinity, delay: 1.2 }
              }
            }}
          ></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-200 rounded" variants={buttonVariants}></motion.div>
          <motion.div className="w-3 h-1.5 bg-brown-100 rounded opacity-50" variants={buttonVariants}></motion.div>
        </motion.div>
        
        {/* Event indicators */}
        <motion.div className="flex gap-0.5 justify-center pt-0.5">
          <motion.div 
            className="w-1 h-0.5 bg-blue-500 rounded-full"
            variants={pulseVariants}
          ></motion.div>
          <motion.div 
            className="w-1 h-0.5 bg-green-500 rounded-full"
            variants={pulseVariants}
          ></motion.div>
          <motion.div 
            className="w-1 h-0.5 bg-orange-500 rounded-full"
            variants={pulseVariants}
          ></motion.div>
          <motion.div 
            className="w-1 h-0.5 bg-red-500 rounded-full"
            variants={pulseVariants}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const ContentDividersThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-4 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-3" variants={staggerChildren}>
        <motion.div className="w-full h-1 bg-brown-400 rounded" variants={fillVariants}></motion.div>
        <motion.div className="flex items-center gap-2">
          <motion.div className="w-6 h-px bg-brown-300 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-8 h-1 bg-brown-600 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-6 h-px bg-brown-300 rounded" variants={fillVariants}></motion.div>
        </motion.div>
        <motion.div className="w-full h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
        <motion.div className="flex items-center justify-center">
          <motion.div className="w-4 h-4 bg-brown-500 rounded-full" variants={pulseVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const LoadingIndicatorsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-4 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-3" variants={staggerChildren}>
        <motion.div className="flex items-center justify-center">
          <motion.div 
            className="w-6 h-6 border-2 border-brown-300 border-t-brown-700 rounded-full"
            variants={{
              rest: { rotate: 0 },
              hover: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: "linear" } }
            }}
          ></motion.div>
        </motion.div>
        <motion.div className="w-full h-1 bg-brown-200 rounded overflow-hidden">
          <motion.div 
            className="h-full bg-brown-700 rounded"
            variants={{
              rest: { width: "30%" },
              hover: { width: "100%", transition: { duration: 1.5, repeat: Infinity } }
            }}
          ></motion.div>
        </motion.div>
        <motion.div className="flex gap-1 justify-center">
          <motion.div className="w-1 h-1 bg-brown-700 rounded-full" variants={pulseVariants}></motion.div>
          <motion.div className="w-1 h-1 bg-brown-500 rounded-full" variants={pulseVariants}></motion.div>
          <motion.div className="w-1 h-1 bg-brown-300 rounded-full" variants={pulseVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const EmptyStatesThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-4 shadow-sm" variants={itemVariants}>
      <motion.div className="flex flex-col items-center justify-center h-full space-y-2" variants={staggerChildren}>
        <motion.div className="w-8 h-6 bg-brown-200 border-2 border-dashed border-brown-400 rounded flex items-center justify-center" variants={floatVariants}>
          <motion.div className="w-3 h-3 bg-brown-500 rounded" variants={pulseVariants}></motion.div>
        </motion.div>
        <motion.div className="w-16 h-1 bg-brown-400 rounded" variants={fillVariants}></motion.div>
        <motion.div className="w-12 h-0.5 bg-brown-300 rounded" variants={fillVariants}></motion.div>
        <motion.div className="w-8 h-2 bg-brown-600 rounded" variants={buttonVariants}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const CodeSnippetsThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="w-full h-full bg-stone-900 rounded border border-stone-600 p-1.5 relative" variants={itemVariants}>
        <motion.div className="space-y-1" variants={staggerChildren}>
          {/* Terminal header */}
          <motion.div className="flex gap-1 pb-1">
            <motion.div className="w-1 h-1 bg-red-400 rounded-full" variants={pulseVariants}></motion.div>
            <motion.div className="w-1 h-1 bg-yellow-400 rounded-full" variants={pulseVariants}></motion.div>
            <motion.div className="w-1 h-1 bg-green-400 rounded-full" variants={pulseVariants}></motion.div>
            <motion.div className="ml-auto w-6 h-0.5 bg-stone-600 rounded"></motion.div>
          </motion.div>
          
          {/* Code lines with syntax highlighting */}
          <motion.div className="space-y-0.5">
            {/* Line 1: import statement */}
            <motion.div className="flex gap-1 items-center">
              <motion.div className="w-3 h-0.5 bg-purple-400 rounded" variants={fillVariants}></motion.div>
              <motion.div className="w-8 h-0.5 bg-blue-300 rounded" variants={fillVariants}></motion.div>
              <motion.div className="w-2 h-0.5 bg-green-400 rounded" variants={fillVariants}></motion.div>
            </motion.div>
            
            {/* Line 2: function declaration with indentation */}
            <motion.div className="flex gap-1 items-center ml-1">
              <motion.div className="w-6 h-0.5 bg-yellow-400 rounded" variants={fillVariants}></motion.div>
              <motion.div className="w-4 h-0.5 bg-pink-400 rounded" variants={fillVariants}></motion.div>
              <motion.div className="w-2 h-0.5 bg-white rounded" variants={fillVariants}></motion.div>
            </motion.div>
            
            {/* Line 3: return statement */}
            <motion.div className="flex gap-1 items-center ml-2">
              <motion.div className="w-4 h-0.5 bg-orange-400 rounded" variants={fillVariants}></motion.div>
              <motion.div className="w-8 h-0.5 bg-cyan-300 rounded" variants={fillVariants}></motion.div>
            </motion.div>
            
            {/* Line 4: currently typing with animated cursor */}
            <motion.div className="flex gap-1 items-center ml-1">
              <motion.div className="w-5 h-0.5 bg-green-300 rounded" variants={fillVariants}></motion.div>
              <motion.div className="w-3 h-0.5 bg-blue-400 rounded" variants={fillVariants}></motion.div>
              
              {/* Animated typing cursor */}
              <motion.div 
                className="w-0.5 h-1 bg-white rounded"
                variants={{
                  rest: { opacity: 0.3 },
                  hover: { 
                    opacity: [0.3, 1, 0.3],
                    scaleY: [1, 1.2, 1],
                    transition: { duration: 1, repeat: Infinity }
                  }
                }}
              ></motion.div>
              
              {/* Typing animation - characters appearing */}
              <motion.div 
                className="flex gap-0.5"
                variants={{
                  rest: { opacity: 0, width: 0 },
                  hover: { 
                    opacity: 1, 
                    width: "auto",
                    transition: { duration: 2, delay: 0.5 }
                  }
                }}
              >
                <motion.div 
                  className="w-1 h-0.5 bg-yellow-300 rounded"
                  variants={{
                    rest: { scaleX: 0 },
                    hover: { 
                      scaleX: 1,
                      transition: { duration: 0.1, delay: 1 }
                    }
                  }}
                ></motion.div>
                <motion.div 
                  className="w-2 h-0.5 bg-pink-300 rounded"
                  variants={{
                    rest: { scaleX: 0 },
                    hover: { 
                      scaleX: 1,
                      transition: { duration: 0.1, delay: 1.2 }
                    }
                  }}
                ></motion.div>
              </motion.div>
            </motion.div>
            
            {/* Line 5: closing bracket */}
            <motion.div className="flex gap-1 items-center">
              <motion.div className="w-1 h-0.5 bg-white rounded" variants={fillVariants}></motion.div>
            </motion.div>
          </motion.div>
          
          {/* Terminal prompt at bottom */}
          <motion.div className="absolute bottom-1 left-1.5 flex items-center gap-1">
            <motion.div className="w-1 h-0.5 bg-green-400 rounded"></motion.div>
            <motion.div className="w-4 h-0.5 bg-stone-400 rounded" variants={fillVariants}></motion.div>
            <motion.div 
              className="w-0.5 h-1 bg-green-400 rounded"
              variants={{
                rest: { opacity: 0.7 },
                hover: { 
                  opacity: [0.7, 1, 0.7],
                  transition: { duration: 0.8, repeat: Infinity, delay: 2 }
                }
              }}
            ></motion.div>
          </motion.div>
          
          {/* Syntax error indicator */}
          <motion.div 
            className="absolute top-6 right-1 w-1 h-1 bg-red-500 rounded-full"
            variants={{
              rest: { scale: 0, opacity: 0 },
              hover: { 
                scale: [0, 1.2, 1], 
                opacity: [0, 1, 0.8],
                transition: { duration: 0.5, delay: 1.5 }
              }
            }}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const StatusThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-4 shadow-sm" variants={itemVariants}>
      <motion.div className="flex items-center justify-center gap-2" variants={staggerChildren}>
        <motion.div className="w-3 h-3 bg-green-500 rounded-full" variants={pulseVariants}></motion.div>
        <motion.div className="w-3 h-3 bg-yellow-500 rounded-full" variants={pulseVariants}></motion.div>
        <motion.div className="w-3 h-3 bg-red-500 rounded-full" variants={pulseVariants}></motion.div>
        <motion.div className="w-3 h-3 bg-blue-500 rounded-full" variants={pulseVariants}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const MiscellaneousThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-4 shadow-sm" variants={itemVariants}>
      <motion.div className="grid grid-cols-2 gap-2 h-full" variants={staggerChildren}>
        <motion.div className="bg-brown-600 rounded" variants={floatVariants}></motion.div>
        <motion.div className="bg-brown-400 rounded-full" variants={floatVariants}></motion.div>
        <motion.div className="bg-brown-500 rounded-lg" variants={floatVariants}></motion.div>
        <motion.div className="bg-brown-300 rounded" variants={floatVariants}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const DashboardThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm" variants={itemVariants}>
      <motion.div className="grid grid-cols-2 gap-1 h-full" variants={staggerChildren}>
        <motion.div className="bg-brown-600 rounded p-1 flex flex-col justify-between" variants={itemVariants}>
          <motion.div className="w-full h-1 bg-brown-100 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-2/3 h-3 bg-brown-200 rounded" variants={chartBarVariants}></motion.div>
        </motion.div>
        <motion.div className="bg-brown-500 rounded p-1 flex items-center justify-center" variants={itemVariants}>
          <motion.div className="w-6 h-6 bg-brown-100 rounded-full" variants={pulseVariants}></motion.div>
        </motion.div>
        <motion.div className="bg-brown-400 rounded p-1" variants={itemVariants}>
          <motion.div className="space-y-0.5">
            <motion.div className="w-full h-0.5 bg-brown-100 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-3/4 h-0.5 bg-brown-200 rounded" variants={fillVariants}></motion.div>
            <motion.div className="w-full h-0.5 bg-brown-100 rounded" variants={fillVariants}></motion.div>
          </motion.div>
        </motion.div>
        <motion.div className="bg-brown-300 rounded p-1 flex items-end gap-0.5" variants={itemVariants}>
          <motion.div className="w-1 h-2 bg-brown-600 rounded" variants={chartBarVariants}></motion.div>
          <motion.div className="w-1 h-3 bg-brown-700 rounded" variants={chartBarVariants}></motion.div>
          <motion.div className="w-1 h-1 bg-brown-500 rounded" variants={chartBarVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const SimpleInsightThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center" variants={containerVariants} initial="rest" animate={isHovered ? "hover" : "rest"}>
    <motion.div className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-3 shadow-sm" variants={itemVariants}>
      <motion.div className="space-y-2" variants={staggerChildren}>
        <motion.div className="flex items-center justify-between">
          <motion.div className="w-12 h-2 bg-brown-600 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-6 h-4 bg-green-500 rounded flex items-center justify-center" variants={buttonVariants}>
            <motion.div className="w-3 h-1 bg-white rounded"></motion.div>
          </motion.div>
        </motion.div>
        <motion.div className="w-full h-6 bg-brown-50 border border-brown-200 rounded p-1">
          <motion.div className="flex items-end gap-0.5 h-full">
            <motion.div className="w-2 bg-brown-600 rounded-t h-1/2" variants={chartBarVariants}></motion.div>
            <motion.div className="w-2 bg-brown-700 rounded-t h-full" variants={chartBarVariants}></motion.div>
            <motion.div className="w-2 bg-brown-500 rounded-t h-1/3" variants={chartBarVariants}></motion.div>
            <motion.div className="w-2 bg-brown-600 rounded-t h-2/3" variants={chartBarVariants}></motion.div>
          </motion.div>
        </motion.div>
        <motion.div className="w-2/3 h-1 bg-brown-400 rounded" variants={fillVariants}></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);