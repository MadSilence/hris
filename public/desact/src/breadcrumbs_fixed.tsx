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