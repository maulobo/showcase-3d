import { useState, useEffect } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      // Detectar dispositivos móviles por User Agent
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileUA = mobileRegex.test(userAgent);
      
      // Detectar por tamaño de pantalla
      const isSmallScreen = window.innerWidth <= 768;
      
      // Detectar si es touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Considerar móvil si cumple cualquiera de estas condiciones
      setIsMobile(isMobileUA || (isSmallScreen && isTouchDevice));
    };

    checkIsMobile();
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return isMobile;
};
