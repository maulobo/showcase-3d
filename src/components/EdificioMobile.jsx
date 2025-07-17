import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Html,
  PerspectiveCamera,
} from "@react-three/drei";
import BackToHome from "./BackToHome";

// Componente ultra-optimizado para móviles
function MobileModel3D({ position = [0, 0, 0], scale = 0.8 }) {
  const { scene } = useGLTF("/d.glb");
  const modelRef = useRef();

  // OPTIMIZACIONES AGRESIVAS PARA MÓVILES
  if (scene) {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Desactivar todas las sombras
        child.castShadow = false;
        child.receiveShadow = false;
        
        // Reducir calidad de materiales
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              // Configuración ultra-low para móviles
              mat.flatShading = true;
              mat.transparent = false;
              mat.opacity = 1;
              mat.metalness = 0;
              mat.roughness = 1;
              mat.needsUpdate = true;
              
              // Reducir resolución de texturas si existen
              if (mat.map) {
                mat.map.generateMipmaps = false;
                mat.map.minFilter = 1003; // NearestFilter
                mat.map.magFilter = 1003; // NearestFilter
              }
            });
          } else {
            child.material.flatShading = true;
            child.material.transparent = false;
            child.material.opacity = 1;
            child.material.metalness = 0;
            child.material.roughness = 1;
            child.material.needsUpdate = true;
            
            if (child.material.map) {
              child.material.map.generateMipmaps = false;
              child.material.map.minFilter = 1003;
              child.material.map.magFilter = 1003;
            }
          }
        }
        
        // Simplificar geometrías complejas
        if (child.geometry && child.geometry.attributes.position) {
          const vertexCount = child.geometry.attributes.position.count;
          if (vertexCount > 5000) {
            // Para geometrías muy complejas, usar level of detail básico
            child.visible = false; // Ocultar temporalmente objetos muy complejos
          }
        }
      }
    });
  }

  return <primitive ref={modelRef} object={scene} position={position} scale={scale} />;
}

// Loading más simple para móviles
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
        Cargando...
      </div>
    </Html>
  );
}

// Controles táctiles optimizados
function MobileControls() {
  return (
    <OrbitControls
      enablePan={false} // Desactivar pan en móviles para evitar conflictos
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={15}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5} // Reducir velocidad de rotación
      zoomSpeed={0.5} // Reducir velocidad de zoom
      touches={{
        ONE: 2, // TOUCH.ROTATE
        TWO: 1, // TOUCH.DOLLY_PAN (solo zoom, no pan)
      }}
    />
  );
}

export default function EdificioMobile() {
  return (
    <>
      {/* Botón de regreso optimizado para móviles */}
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
          maxWidth: "150px",
        }}
      >
        <div>🤏 Pellizca para zoom</div>
        <div>👆 Arrastra para rotar</div>
      </div>

      {/* Canvas 3D optimizado para móviles */}
      <Canvas
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(to bottom, #87CEEB, #98D8E8)",
          touchAction: "none", // Importante para controles táctiles
        }}
        // Configuración de cámara más conservadora
        camera={{
          position: [8, 6, 8],
          fov: 50, // FOV más bajo para mejor performance
          near: 0.5,
          far: 100, // Far más cerca para menos rendering
        }}
        // Configuración de renderer optimizada para móviles
        gl={{
          antialias: false, // Desactivar antialiasing en móviles
          alpha: false,
          powerPreference: "low-power", // Usar GPU de bajo consumo
          precision: "lowp", // Precisión baja
          depth: true,
          stencil: false,
          preserveDrawingBuffer: false,
        }}
        // Reducir pixel ratio en móviles
        dpr={Math.min(window.devicePixelRatio, 2)}
        shadows={false} // Sin sombras en móviles
      >
        {/* Cámara con configuración fija */}
        <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />

        {/* Iluminación simple para móviles */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />

        {/* Controles táctiles */}
        <MobileControls />

        {/* Modelo 3D con fallback */}
        <Suspense fallback={<MobileLoadingComponent />}>
          <MobileModel3D position={[0, 0, 0]} scale={0.8} />
        </Suspense>
      </Canvas>

      {/* Estilos para la animación */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            /* Optimizaciones CSS para móviles */
            body {
              overscroll-behavior: none;
              overflow: hidden;
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
