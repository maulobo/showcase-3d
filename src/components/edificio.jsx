import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Stats,
  Html,
  Environment,
} from "@react-three/drei";
import BackToHome from "./BackToHome";

// Componente simple para cargar el modelo 3D
function Model3D({ position = [0, 0, 0], scale = 1 }) {
  const { scene } = useGLTF("/d.glb");

  // OPTIMIZACIONES DE PERFORMANCE EN TIEMPO DE EJECUCIÓN
  if (scene) {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Desactivar sombras en todos los meshes
        child.castShadow = false;
        child.receiveShadow = false;

        // Forzar flatShading en materiales complejos
        if (
          child.material &&
          child.geometry &&
          child.geometry.attributes.position &&
          child.geometry.attributes.position.count > 10000
        ) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              mat.flatShading = true;
              mat.needsUpdate = true;
              if (mat.transparent && mat.opacity >= 0.99)
                mat.transparent = false;
            });
          } else {
            child.material.flatShading = true;
            child.material.needsUpdate = true;
            if (child.material.transparent && child.material.opacity >= 0.99)
              child.material.transparent = false;
          }
        }
      }
    });
  }

  return <primitive object={scene} position={position} scale={scale} />;
}

// Componente de loading personalizado
function LoadingComponent() {
  return (
    <Html center>
      <div
        style={{
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "20px 30px",
          borderRadius: "10px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "16px",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            border: "2px solid #fff",
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        Cargando modelo 3D...
      </div>
    </Html>
  );
}

// Selector de modelos disponibles

export default function Edificio() {
  return (
    <>
      {/* Botón para regresar al home de visores */}
      <BackToHome position="top-left" />

      {/* Instrucciones de uso */}

      {/* Canvas 3D principal */}
      <Canvas
        camera={{
          position: [10, 8, 10],
          fov: 60,
          near: 0.1,
          far: 1000,
        }}
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(to bottom, #87CEEB, #98D8E8)",
        }}
        shadows
      >
        {/* Iluminación estándar */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Environment para mejor iluminación */}
        <Environment preset="sunset" />

        {/* Controles de órbita estándar */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={100}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.8}
          enableDamping={true}
          dampingFactor={0.1}
        />

        {/* Suelo básico */}

        {/* Modelo 3D seleccionado */}
        <Suspense fallback={<LoadingComponent />}>
          <Model3D modelPath={"/a/c.glb"} position={[0, 0, 0]} scale={1} />
        </Suspense>

        {/* Stats de performance (opcional) */}
        <Stats />
      </Canvas>

      {/* Estilos CSS para la animación del loader */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `,
        }}
      />
    </>
  );
}
