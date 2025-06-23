import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';

export const DraggableCardContainer = ({ children, onClose }) => {
  const containerRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === containerRef.current) {
      onClose();
    }
  };

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ willChange: 'opacity' }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute z-50 p-3 text-white transition-all duration-200 rounded-full bg-white/20 top-4 right-4 hover:bg-white/30 hover:scale-110 active:scale-95 backdrop-blur-sm"
        aria-label="Close modal"
      >
        <X className="w-6 h-6" />
      </button>
      
      {/* Draggable Cards Container */}
      <div className="relative w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export const DraggableCardBody = ({ children, initialPosition, zIndex = 20 }) => {
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentZIndex, setCurrentZIndex] = useState(zIndex);

  // Smooth position update using RAF
  const updatePosition = useCallback((newPosition) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      setPosition(newPosition);
    });
  }, []);

  // Get constrained position
  const getConstrainedPosition = useCallback((x, y) => {
    if (!cardRef.current) return { x, y };

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    const cardRect = cardRef.current.getBoundingClientRect();
    const cardSize = {
      width: cardRect.width,
      height: cardRect.height
    };

    return {
      x: Math.max(0, Math.min(x, viewport.width - cardSize.width)),
      y: Math.max(0, Math.min(y, viewport.height - cardSize.height))
    };
  }, []);

  // Mouse Events
  const handleMouseDown = useCallback((e) => {
    if (!cardRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setIsDragging(true);
    setCurrentZIndex(100); // Bring to front
    
    // Prevent text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    const constrainedPos = getConstrainedPosition(newX, newY);
    updatePosition(constrainedPos);
  }, [isDragging, dragOffset, getConstrainedPosition, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setCurrentZIndex(zIndex); // Reset z-index
    
    // Restore text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }, [zIndex]);

  // Touch Events for Mobile
  const handleTouchStart = useCallback((e) => {
    if (!cardRef.current) return;
    
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    
    setIsDragging(true);
    setCurrentZIndex(100);
    
    e.preventDefault();
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !e.touches[0]) return;

    e.preventDefault();
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    
    const constrainedPos = getConstrainedPosition(newX, newY);
    updatePosition(constrainedPos);
  }, [isDragging, dragOffset, getConstrainedPosition, updatePosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setCurrentZIndex(zIndex);
  }, [zIndex]);

  // Global Event Listeners
  useEffect(() => {
    if (isDragging) {
      const options = { passive: false, capture: true };
      
      document.addEventListener('mousemove', handleMouseMove, options);
      document.addEventListener('mouseup', handleMouseUp, options);
      document.addEventListener('touchmove', handleTouchMove, options);
      document.addEventListener('touchend', handleTouchEnd, options);
    }

    return () => {
      const options = { passive: false, capture: true };
      document.removeEventListener('mousemove', handleMouseMove, options);
      document.removeEventListener('mouseup', handleMouseUp, options);
      document.removeEventListener('touchmove', handleTouchMove, options);
      document.removeEventListener('touchend', handleTouchEnd, options);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const constrainedPos = getConstrainedPosition(position.x, position.y);
      if (constrainedPos.x !== position.x || constrainedPos.y !== position.y) {
        updatePosition(constrainedPos);
      }
    };

    const debouncedResize = debounce(handleResize, 150);
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [position, getConstrainedPosition, updatePosition]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`absolute select-none cursor-grab active:cursor-grabbing transition-all ease-out ${
        isDragging 
          ? 'duration-0 scale-105 shadow-2xl rotate-1' 
          : 'duration-300 shadow-xl hover:shadow-2xl hover:scale-102'
      }`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) ${isDragging ? 'scale(1.05) rotate(1deg)' : ''}`,
        zIndex: currentZIndex,
        willChange: isDragging ? 'transform' : 'auto',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {children}
    </div>
  );
};

// Utility debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}