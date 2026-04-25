import React from 'react';
import { motion } from 'framer-motion';

interface ThumbnailProps {
  isHovered?: boolean;
}

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

// New simple thumbnails

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
      {/* Simple card header */}
      <motion.div className="space-y-3" variants={staggerChildren}>
        {/* Header title */}
        <motion.div 
          className="w-full h-4 bg-brown-700 rounded"
          variants={fillVariants}
        ></motion.div>
        
        {/* Subtitle */}
        <motion.div 
          className="w-2/3 h-2 bg-brown-400 rounded"
          variants={fillVariants}
        ></motion.div>
        
        {/* Action button */}
        <motion.div 
          className="w-16 h-6 bg-brown-700 rounded ml-auto"
          variants={buttonVariants}
        ></motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const SectionHeadersSimpleThumbnail = ({ isHovered = false }: ThumbnailProps) => (
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
      {/* Simple section header */}
      <motion.div className="space-y-4" variants={staggerChildren}>
        {/* Main section title */}
        <motion.div 
          className="w-full h-5 bg-brown-700 rounded"
          variants={fillVariants}
        ></motion.div>
        
        {/* Divider line */}
        <motion.div 
          className="w-full h-1 bg-brown-200 rounded"
          variants={{ rest: { scaleX: 0.5 }, hover: { scaleX: 1 } }}
          style={{ originX: 0 }}
        ></motion.div>
        
        {/* Content preview */}
        <motion.div className="space-y-1">
          <motion.div className="w-full h-2 bg-brown-300 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-3/4 h-2 bg-brown-300 rounded" variants={fillVariants}></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const SectionFootersSimpleThumbnail = ({ isHovered = false }: ThumbnailProps) => (
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
      {/* Simple section footer */}
      <motion.div className="space-y-4" variants={staggerChildren}>
        {/* Content preview */}
        <motion.div className="space-y-1">
          <motion.div className="w-full h-2 bg-brown-300 rounded" variants={fillVariants}></motion.div>
          <motion.div className="w-2/3 h-2 bg-brown-300 rounded" variants={fillVariants}></motion.div>
        </motion.div>
        
        {/* Divider line */}
        <motion.div 
          className="w-full h-1 bg-brown-200 rounded"
          variants={{ rest: { scaleX: 1 }, hover: { scaleX: 0.8 } }}
          style={{ originX: 1 }}
        ></motion.div>
        
        {/* Footer actions */}
        <motion.div className="flex gap-2 justify-end">
          <motion.div 
            className="w-12 h-4 bg-brown-300 border border-brown-400 rounded"
            variants={buttonVariants}
          ></motion.div>
          <motion.div 
            className="w-12 h-4 bg-brown-700 rounded"
            variants={buttonVariants}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const SidebarNavigationsSimpleThumbnail = ({ isHovered = false }: ThumbnailProps) => (
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
      {/* Simple sidebar navigation */}
      <motion.div className="space-y-2" variants={staggerChildren}>
        {/* Active nav item */}
        <motion.div className="flex items-center gap-2">
          <motion.div 
            className="w-3 h-3 bg-brown-700 rounded"
            variants={pulseVariants}
          ></motion.div>
          <motion.div 
            className="w-16 h-3 bg-brown-700 rounded"
            variants={fillVariants}
          ></motion.div>
        </motion.div>
        
        {/* Regular nav items */}
        <motion.div className="flex items-center gap-2">
          <motion.div 
            className="w-3 h-3 bg-brown-300 rounded"
            variants={buttonVariants}
          ></motion.div>
          <motion.div 
            className="w-14 h-3 bg-brown-300 rounded"
            variants={fillVariants}
          ></motion.div>
        </motion.div>
        
        <motion.div className="flex items-center gap-2">
          <motion.div 
            className="w-3 h-3 bg-brown-300 rounded"
            variants={buttonVariants}
          ></motion.div>
          <motion.div 
            className="w-12 h-3 bg-brown-300 rounded"
            variants={fillVariants}
          ></motion.div>
        </motion.div>
        
        <motion.div className="flex items-center gap-2">
          <motion.div 
            className="w-3 h-3 bg-brown-300 rounded"
            variants={buttonVariants}
          ></motion.div>
          <motion.div 
            className="w-18 h-3 bg-brown-300 rounded"
            variants={fillVariants}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const HeaderNavigationsSimpleThumbnail = ({ isHovered = false }: ThumbnailProps) => (
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
      {/* Simple header navigation */}
      <motion.div className="space-y-3" variants={staggerChildren}>
        {/* Logo/brand */}
        <motion.div 
          className="w-12 h-4 bg-brown-700 rounded"
          variants={pulseVariants}
        ></motion.div>
        
        {/* Navigation items */}
        <motion.div className="flex gap-2">
          <motion.div 
            className="w-8 h-3 bg-brown-700 rounded"
            variants={buttonVariants}
          ></motion.div>
          <motion.div 
            className="w-10 h-3 bg-brown-300 rounded"
            variants={buttonVariants}
          ></motion.div>
          <motion.div 
            className="w-6 h-3 bg-brown-300 rounded"
            variants={buttonVariants}
          ></motion.div>
        </motion.div>
        
        {/* User section */}
        <motion.div className="flex gap-2 ml-auto w-fit">
          <motion.div 
            className="w-4 h-4 bg-brown-400 rounded-full"
            variants={pulseVariants}
          ></motion.div>
          <motion.div 
            className="w-3 h-3 bg-brown-300 rounded"
            variants={buttonVariants}
          ></motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const LineBarChartsSimpleThumbnail = ({ isHovered = false }: ThumbnailProps) => (
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
      {/* Simple line and bar chart */}
      <motion.div className="space-y-3" variants={staggerChildren}>
        {/* Bar chart */}
        <motion.div className="flex items-end gap-1 h-8">
          <motion.div 
            className="w-3 bg-brown-700 rounded-t h-1/2"
            variants={chartBarVariants}
            style={{ originY: 1 }}
          ></motion.div>
          <motion.div 
            className="w-3 bg-green-500 rounded-t h-full"
            variants={chartBarVariants}
            style={{ originY: 1 }}
            transition={{ delay: 0.1 }}
          ></motion.div>
          <motion.div 
            className="w-3 bg-blue-500 rounded-t h-1/3"
            variants={chartBarVariants}
            style={{ originY: 1 }}
            transition={{ delay: 0.2 }}
          ></motion.div>
          <motion.div 
            className="w-3 bg-yellow-500 rounded-t h-2/3"
            variants={chartBarVariants}
            style={{ originY: 1 }}
            transition={{ delay: 0.3 }}
          ></motion.div>
        </motion.div>
        
        {/* Line chart representation */}
        <motion.div className="relative h-6 bg-brown-50 rounded">
          <motion.div 
            className="absolute inset-0 flex items-center"
            variants={staggerChildren}
          >
            <svg className="w-full h-full" viewBox="0 0 100 20">
              <motion.path
                d="M5,15 L25,8 L45,12 L65,5 L85,10 L95,6"
                stroke="rgb(120 113 108)"
                strokeWidth="2"
                fill="none"
                variants={{
                  rest: { pathLength: 0.3 },
                  hover: { pathLength: 1 }
                }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const ActivityGaugesSimpleThumbnail = ({ isHovered = false }: ThumbnailProps) => (
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
      {/* Simple activity gauge */}
      <motion.div className="flex items-center justify-center h-full" variants={staggerChildren}>
        <motion.div className="relative">
          {/* Gauge background */}
          <motion.div 
            className="w-16 h-16 rounded-full border-4 border-brown-200"
            variants={itemVariants}
          ></motion.div>
          {/* Gauge progress */}
          <motion.div 
            className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-brown-700 border-r-brown-700"
            variants={{ 
              rest: { rotate: 0 }, 
              hover: { rotate: 180 } 
            }}
            style={{ borderTopColor: "rgb(120 113 108)", borderRightColor: "rgb(120 113 108)" }}
            transition={{ duration: 0.8 }}
          ></motion.div>
          {/* Center dot */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div 
              className="w-3 h-3 bg-brown-700 rounded-full"
              variants={pulseVariants}
            ></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const PieChartsSimpleThumbnail = ({ isHovered = false }: ThumbnailProps) => (
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
      {/* Simple pie chart */}
      <motion.div className="flex items-center justify-center h-full" variants={staggerChildren}>
        <motion.div className="relative">
          <motion.div 
            className="w-14 h-14 rounded-full overflow-hidden"
            variants={itemVariants}
            style={{
              background: `conic-gradient(
                rgb(120 113 108) 0deg 140deg,
                rgb(34 197 94) 140deg 220deg,
                rgb(59 130 246) 220deg 280deg,
                rgb(234 179 8) 280deg 360deg
              )`
            }}
          >
            {/* Center hole for donut effect */}
            <motion.div 
              className="absolute inset-2 bg-white rounded-full"
              variants={pulseVariants}
            ></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  </motion.div>
);

export const SlideoutMenusSimpleThumbnail = ({ isHovered = false }: ThumbnailProps) => (
  <motion.div 
    className="w-full h-full bg-stone-100 rounded-lg flex items-center justify-center"
    variants={containerVariants}
    initial="rest"
    animate={isHovered ? "hover" : "rest"}
  >
    <motion.div 
      className="w-32 h-24 bg-white border border-brown-300 rounded-xl p-2 shadow-sm relative overflow-hidden"
      variants={itemVariants}
    >
      {/* Main Content Area */}
      <motion.div className="w-full h-full bg-brown-50 rounded-lg p-2 relative" variants={staggerChildren}>
        {/* Header with Menu Button */}
        <motion.div className="flex items-center justify-between mb-2">
          <motion.div 
            className="w-4 h-4 bg-brown-700 rounded flex items-center justify-center"
            variants={buttonVariants}
          >
            {/* Hamburger menu icon */}
            <motion.div className="space-y-0.5">
              <motion.div className="w-2 h-0.5 bg-white rounded"></motion.div>
              <motion.div className="w-2 h-0.5 bg-white rounded"></motion.div>
              <motion.div className="w-2 h-0.5 bg-white rounded"></motion.div>
            </motion.div>
          </motion.div>
          <motion.div className="w-12 h-1.5 bg-brown-600 rounded-lg" variants={fillVariants}></motion.div>
          <motion.div className="w-3 h-3 bg-brown-600 rounded-full" variants={pulseVariants}></motion.div>
        </motion.div>

        {/* Content Lines */}
        <motion.div className="space-y-1" variants={staggerChildren}>
          <motion.div className="w-full h-1 bg-brown-300 rounded-lg" variants={fillVariants}></motion.div>
          <motion.div className="w-4/5 h-1 bg-brown-200 rounded-lg" variants={fillVariants}></motion.div>
          <motion.div className="w-full h-1 bg-brown-200 rounded-lg" variants={fillVariants}></motion.div>
          <motion.div className="w-3/5 h-1 bg-brown-200 rounded-lg" variants={fillVariants}></motion.div>
        </motion.div>
      </motion.div>

      {/* Slideout Panel */}
      <motion.div 
        className="absolute top-0 right-0 h-full bg-white border-l-2 border-brown-300 shadow-lg rounded-r-lg overflow-hidden"
        variants={{ 
          rest: { width: "0px", opacity: 0 }, 
          hover: { width: "24px", opacity: 1 } 
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <motion.div 
          className="p-1.5 space-y-1 h-full"
          variants={{ 
            rest: { opacity: 0, x: 8 }, 
            hover: { opacity: 1, x: 0 } 
          }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {/* Panel Header */}
          <motion.div className="flex items-center justify-between mb-1">
            <motion.div className="w-4 h-0.5 bg-brown-700 rounded-lg" variants={fillVariants}></motion.div>
            <motion.div 
              className="w-1.5 h-1.5 bg-brown-500 rounded-full"
              variants={buttonVariants}
            ></motion.div>
          </motion.div>

          {/* Navigation Items */}
          <motion.div className="space-y-0.5" variants={staggerChildren}>
            <motion.div className="flex items-center gap-1">
              <motion.div className="w-1 h-1 bg-brown-700 rounded-full" variants={pulseVariants}></motion.div>
              <motion.div 
                className="w-4 h-1 bg-brown-700 rounded"
                variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
              ></motion.div>
            </motion.div>
            
            <motion.div className="flex items-center gap-1">
              <motion.div className="w-1 h-1 bg-brown-500 rounded-full" variants={buttonVariants}></motion.div>
              <motion.div 
                className="w-3 h-1 bg-brown-500 rounded"
                variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
              ></motion.div>
            </motion.div>
            
            <motion.div className="flex items-center gap-1">
              <motion.div className="w-1 h-1 bg-brown-400 rounded-full" variants={buttonVariants}></motion.div>
              <motion.div 
                className="w-4 h-1 bg-brown-400 rounded"
                variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
              ></motion.div>
            </motion.div>
            
            <motion.div className="flex items-center gap-1">
              <motion.div className="w-1 h-1 bg-brown-400 rounded-full" variants={buttonVariants}></motion.div>
              <motion.div 
                className="w-2 h-1 bg-brown-400 rounded"
                variants={{ rest: { scale: 1 }, hover: { scale: 1.05 } }}
              ></motion.div>
            </motion.div>
          </motion.div>

          {/* Panel Footer */}
          <motion.div className="border-t border-brown-200 pt-1 mt-auto">
            <motion.div className="w-3 h-0.5 bg-brown-300 rounded-lg" variants={fillVariants}></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Backdrop overlay on hover */}
      <motion.div 
        className="absolute inset-0 bg-black/5 rounded-lg"
        variants={{ 
          rest: { opacity: 0 }, 
          hover: { opacity: 1 } 
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  </motion.div>
);