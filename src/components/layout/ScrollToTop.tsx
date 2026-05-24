import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Smooth scrolling to the top of standard window and layout containers
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    
    // Support legacy or custom scroll layout containers if any have overflow-y-scroll
    try {
      document.documentElement.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      document.body.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (e) {
      // Graceful fallback for browsers or configurations that don't support modern scroll options
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);

  return null;
}
