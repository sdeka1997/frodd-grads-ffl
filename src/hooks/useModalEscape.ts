import { useEffect } from 'react';

export function useModalEscape(onClose: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    const html = document.documentElement;
    const scrollY = window.scrollY;
    html.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      html.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [onClose]);
}
