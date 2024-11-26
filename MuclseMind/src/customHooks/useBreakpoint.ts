// useBreakpoint.ts
import { useEffect, useState } from 'react';

// Tailwind CSS breakpoints in pixels
const breakpoints: { [key: string]: number } = {
    sm: 640,    // Small screens
    md: 768,    // Medium screens
    lg: 1024,   // Large screens
    xl: 1280,   // Extra large screens
    '2xl': 1536 // Double extra large screens
};

/**
 * Custom hook to track the current Tailwind breakpoint.
 * @returns {string} - The name of the current breakpoint.
 */
export const useBreakpoint = (): string => {
    const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('2xl'); // Default to '2xl'

    const handleResize = () => {
        const width = window.innerWidth;

        const newBreakpoint = Object.keys(breakpoints).find(key => width < breakpoints[key]) || '2xl';
        setCurrentBreakpoint(newBreakpoint);
    };

    useEffect(() => {
        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return currentBreakpoint;
};
