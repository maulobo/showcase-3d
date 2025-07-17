import React from 'react';
import Edificio from './edificio';
import EdificioMobile from './EdificioMobile';
import { useIsMobile } from '../hooks/useIsMobile';

// Componente que detecta automáticamente el dispositivo
const EdificioAdaptive = () => {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? <EdificioMobile /> : <Edificio />}
    </>
  );
};

export default EdificioAdaptive;
