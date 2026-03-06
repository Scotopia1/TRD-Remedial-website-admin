import { useEffect } from 'react';

/**
 * Detects keyboard navigation and adds/removes class to body
 * Helps differentiate between mouse and keyboard focus
 */
export function useKeyboardNav() {
  useEffect(() => {
    let isUsingKeyboard = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isUsingKeyboard = true;
        document.body.classList.add('keyboard-nav');
      }
    };

    const handleMouseDown = () => {
      isUsingKeyboard = false;
      document.body.classList.remove('keyboard-nav');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}
