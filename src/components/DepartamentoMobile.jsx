import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Html,
  PerspectiveCamera,
} from "@react-three/drei";
import BackToHome from "./BackToHome";

// Componente ultra-simplificado para departamento en móviles
function DepartamentoMobileModel({ position = [0, 0, 0], scale = 0.6 }) {
  const { scene } = useGLTF("/c.glb"); // Asumiendo que tienes este modelo
  const modelRef = useRef();

  // Optimizaciones extremas para móviles
  if (scene) {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.flatShading = true;
              mat.transparent = false;
              mat.opacity = 1;
              mat.metalness = 0;
              mat.roughness = 1;
              mat.needsUpdate = true;
            });
          } else {
            child.material.flatShading = true;
            child.material.transparent = false;
            child.material.opacity = 1;
            child.material.metalness = 0;
            child.material.roughness = 1;
            child.material.needsUpdate = true;
          }
        }
      }
    });
  }

  return <primitive ref={modelRef} object={scene} position={position} scale={scale} />;
}

// Loading simple
function MobileLoadingComponent() {
  return (
    <Html center>
      <div
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "15px 20px",
          borderRadius: "8px",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            border: "2px solid #fff",
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 10px",
          }}
        />
        Cargando departamento...
      </div>
    </Html>
  );
}

export default function DepartamentoMobile() {
  return (
    <>
      {/* Botón de regreso */}
      <BackToHome position="top-left" />

      {/* Instrucciones táctiles */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "6px",
          fontSize: "12px",
          zIndex: 1000,
          maxWidth: "160px",
        }}
      >
        <div>🏠 Departamento 3D</div>
        <div>🤏 Pellizca para zoom</div>
        <div>👆 Arrastra para rotar</div>
      </div>

      {/* Canvas optimizado para móviles */}
      <Canvas
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(to bottom, #f0f8ff, #e6f3ff)",
          touchAction: "none",
        }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "low-power",
          precision: "lowp",
          depth: true,
          stencil: false,
          preserveDrawingBuffer: false,
        }}
        dpr={Math.min(window.devicePixelRatio, 1.5)} // Limitar DPR en móviles
        shadows={false}
      >
        {/* Cámara fija */}
        <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={45} />

        {/* Iluminación básica */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={0.6} />

        {/* Controles táctiles simplificados */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping={true}
          dampingFactor={0.08}
          rotateSpeed={0.4}
          zoomSpeed={0.4}
          touches={{
            ONE: 2, // TOUCH.ROTATE
            TWO: 1, // TOUCH.DOLLY (solo zoom)
          }}
        />

        {/* Modelo del departamento */}
        <Suspense fallback={<MobileLoadingComponent />}>
          <DepartamentoMobileModel position={[0, 0, 0]} scale={0.6} />
        </Suspense>
      </Canvas>

      {/* Estilos */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            body {
              overscroll-behavior: none;
              overflow: hidden;
              user-select: none;
              -webkit-user-select: none;
              -webkit-touch-callout: none;
            }
            
            canvas {
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
              -webkit-backface-visibility: hidden;
              backface-visibility: hidden;
            }
          `,
        }}
      />
    </>
  );
}
