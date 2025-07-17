import React from 'react';
import Departamento from './departamento';
import DepartamentoMobile from './DepartamentoMobile';
import { useIsMobile } from '../hooks/useIsMobile';

// Componente que detecta automáticamente el dispositivo para departamento
const DepartamentoAdaptive = () => {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? <DepartamentoMobile /> : <Departamento />}
    </>
  );
};

export default DepartamentoAdaptive;
