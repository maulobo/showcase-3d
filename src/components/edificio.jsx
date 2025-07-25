import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Stats,
  Html,
  Environment,
  Sky,
} from "@react-three/drei";
import BackToHome from "./BackToHome";
import gsap from "gsap";
import { HOTSPOTS } from "../data/data";

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
          background: "rgba(0, 1, 0, 0.8)",
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
function Hotspot({ position, label, cameraConfig, onClick, hotspotData }) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={position}
      onClick={() => onClick(cameraConfig, hotspotData)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}
    >
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial
        color={hovered ? "#FFC46A" : "#F8A668"}
        emissive={hovered ? "#C24C50" : "#3B2B30"}
        emissiveIntensity={hovered ? 0.8 : 0.5}
      />
      {hovered && (
        <Html distanceFactor={8} position={[0, 0.4, 0]} center>
          <div
            style={{
              background: "#F0EBE0",
              color: "#3B2B30",
              padding: "8px 12px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              pointerEvents: "none",
              border: "2px solid #FFC46A",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            📍 {label}
          </div>
        </Html>
      )}
    </mesh>
  );
}

function Hotspots({ onHotspotClick }) {
  return (
    <group>
      {HOTSPOTS.map((h, i) => (
        <Hotspot
          key={i}
          position={h.position}
          label={h.label}
          cameraConfig={h.camera}
          hotspotData={h}
          onClick={onHotspotClick}
        />
      ))}
    </group>
  );
}

// Componente Drawer para mostrar características
function CharacteristicsDrawer({ isOpen, characteristics, onClose }) {
  if (!isOpen || !characteristics) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: isOpen ? 0 : "-400px",
        width: "400px",
        height: "100vh",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        color: "white",
        padding: "20px",
        boxShadow: "-5px 0 20px rgba(0,0,0,0.3)",
        transition: "right 0.3s ease-in-out",
        zIndex: 1001,
        overflowY: "auto",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "25px",
          borderBottom: "2px solid #444",
          paddingBottom: "15px",
        }}
      >
        <button
          onClick={onClose}
          style={{
            float: "right",
            background: "transparent",
            border: "none",
            color: "#ff6b6b",
            fontSize: "24px",
            cursor: "pointer",
            padding: "5px",
          }}
        >
          ✕
        </button>
        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          {characteristics.title}
        </h2>
        <p
          style={{
            margin: "10px 0 0 0",
            color: "#ccc",
            fontSize: "14px",
            lineHeight: "1.4",
          }}
        >
          {characteristics.description}
        </p>
      </div>

      {/* Características principales */}
      <div style={{ marginBottom: "25px" }}>
        <h3
          style={{ fontSize: "18px", marginBottom: "15px", color: "#ff6b6b" }}
        >
          ✨ Características destacadas
        </h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {characteristics.features.map((feature, index) => (
            <li
              key={index}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid #333",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Especificaciones técnicas */}
      <div style={{ marginBottom: "25px" }}>
        <h3
          style={{ fontSize: "18px", marginBottom: "15px", color: "#ff6b6b" }}
        >
          📋 Especificaciones
        </h3>
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          {Object.entries(characteristics.specs).map(([key, value], index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom:
                  index < Object.entries(characteristics.specs).length - 1
                    ? "1px solid #444"
                    : "none",
              }}
            >
              <span style={{ fontWeight: "bold", color: "#ddd" }}>{key}:</span>
              <span style={{ color: "#fff" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer con acción */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          right: "20px",
          background: "rgba(255,107,107,0.1)",
          padding: "15px",
          borderRadius: "8px",
          border: "1px solid #ff6b6b",
          textAlign: "center",
        }}
      >
        <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#ccc" }}>
          💡 Usa los controles del mouse para explorar en detalle
        </p>
      </div>
    </div>
  );
}

function SidebarHotspots({ hotspots, onHotspotClick }) {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        right: "10px",
        transform: "translateY(-50%)",
        background: "#F0EBE0",
        color: "#3B2B30",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 1000,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h3
        style={{
          margin: "0 0 10px 0",
          fontSize: "16px",
          textAlign: "center",
          color: "#C24C50",
        }}
      >
        Hotspots
      </h3>
      {hotspots.map((hotspot, index) => (
        <button
          key={index}
          onClick={() => onHotspotClick(hotspot.camera, hotspot)}
          style={{
            display: "block",
            width: "100%",
            margin: "5px 0",
            padding: "8px",
            background: "#FFC46A",
            color: "#3B2B30",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#F8A668")}
          onMouseLeave={(e) => (e.target.style.background = "#FFC46A")}
        >
          {hotspot.label}
        </button>
      ))}
    </div>
  );
}

export default function Edificio() {
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [selectedCharacteristics, setSelectedCharacteristics] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  const controlsRef = useRef();

  const handleHotspotClick = (cameraConfig, hotspotData) => {
    setActiveHotspot(cameraConfig);
    setSelectedCharacteristics(hotspotData.characteristics);
    setIsDrawerOpen(true);
    setIsZoomedIn(true);

    // NO tocar OrbitControls aquí para evitar saltos
    // La animación de GSAP se encargará de todo suavemente
  };

  const handleAnimationComplete = () => {
    setActiveHotspot(null);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedCharacteristics(null);
  };

  const handleResetView = () => {
    setIsDrawerOpen(false);
    setSelectedCharacteristics(null);
    setIsZoomedIn(false);

    // Trigger camera reset animation con lookAt correcto
    setActiveHotspot({
      position: [15, 10, 15], // Vista más lejana inicial
      lookAt: [0, 1.5, 1.8], // Vista general consistente con OrbitControls
    });
  };

  function CameraHotspotController({
    controlsRef,
    activeHotspot,
    onAnimationComplete,
  }) {
    const { camera } = useThree();

    useEffect(() => {
      if (activeHotspot && controlsRef.current) {
        const controls = controlsRef.current;

        // Posición final de la cámara
        const cameraEndPos = activeHotspot.position || [15, 10, 15];
        // Punto final al que mirar (el nuevo target de OrbitControls)
        const targetEndPos = activeHotspot.lookAt || [0, 1.5, 1.8];

        // 1. Animar la posición de la cámara
        gsap.to(camera.position, {
          x: cameraEndPos[0],
          y: cameraEndPos[1],
          z: cameraEndPos[2],
          duration: 1.5, // Un poco más de tiempo para suavidad
          ease: "power3.inOut",
          onComplete: () => {
            if (onAnimationComplete) {
              onAnimationComplete();
            }
          },
        });

        // 2. Animar el 'target' de OrbitControls SIMULTÁNEAMENTE
        gsap.to(controls.target, {
          x: targetEndPos[0],
          y: targetEndPos[1],
          z: targetEndPos[2],
          duration: 1.5,
          ease: "power3.inOut",
          onUpdate: () => {
            controls.update();
          },
        });
      }
    }, [activeHotspot, camera, controlsRef, onAnimationComplete]);

    return null;
  }

  return (
    <>
      {/* Barra lateral de hotspots */}
      <SidebarHotspots
        hotspots={HOTSPOTS}
        onHotspotClick={handleHotspotClick}
      />

      {/* Drawer de características */}
      <CharacteristicsDrawer
        isOpen={isDrawerOpen}
        characteristics={selectedCharacteristics}
        onClose={handleCloseDrawer}
      />

      {/* Botón para regresar al home de visores */}
      <BackToHome position="top-left" />

      {/* Botón para volver a vista general */}
      {isZoomedIn && (
        <button
          onClick={handleResetView}
          style={{
            position: "absolute",
            bottom: "80px",
            left: "20%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #ff6b6b, #ff4444)",
            color: "white",
            border: "2px solid rgba(255,255,255,0.3)",
            padding: "14px 28px",
            borderRadius: "30px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            zIndex: 1002,
            boxShadow:
              "0 6px 20px rgba(255,107,107,0.4), 0 2px 8px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            backdropFilter: "blur(10px)",
            animation: "pulseButton 3s ease-in-out infinite",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateX(-50%) scale(1.1)";
            e.target.style.boxShadow =
              "0 8px 25px rgba(255,107,107,0.5), 0 4px 12px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateX(-50%) scale(1)";
            e.target.style.boxShadow =
              "0 6px 20px rgba(255,107,107,0.4), 0 2px 8px rgba(0,0,0,0.2)";
          }}
        >
          🏠 Vista General
        </button>
      )}

      {/* Indicador de animación activa */}
      {activeHotspot && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.2)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "25px",
            zIndex: 1000,
            fontSize: "14px",
            fontWeight: "bold",
            pointerEvents: "none",
          }}
        >
          🎯 Enfocando característica...
        </div>
      )}

      {/* Instrucciones */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: isDrawerOpen ? "420px" : "10px",
          background: "rgba(0,0,0,0.1)",
          color: "white",
          padding: "10px 15px",
          borderRadius: "8px",
          fontSize: "12px",
          zIndex: 1000,
          transition: "right 0.3s ease-in-out",
        }}
      >
        🔍 Haz click en los puntos rojos para explorar
      </div>

      {/* Canvas 3D principal */}
      <Canvas
        camera={{
          position: [15, 10, 15], // Más lejos para vista inicial más amplia
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(to bottom, #87CEEB, #98D8E8)",
        }}
      >
        <Sky />
        {/* Iluminación estándar */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Environment para mejor iluminación */}
        <Environment preset="city" />

        {/* Controles de órbita mejorados y restringidos */}
        <OrbitControls
          ref={controlsRef}
          target={[0, 1.5, 1.8]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={6}
          maxDistance={35}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping={true}
          dampingFactor={0.05}
          panSpeed={0.8}
          rotateSpeed={0.8}
          zoomSpeed={0.6}
        />

        {/* Suelo realista tipo cemento */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial
            color="#6B6B6B"
            roughness={0.9}
            metalness={0.1}
            normalScale={[0.5, 0.5]}
          />
        </mesh>

        {/* Líneas de pavimento para dar realismo */}
        <group>
          {/* Líneas horizontales */}
          {Array.from({ length: 10 }, (_, i) => (
            <mesh
              key={`h-${i}`}
              position={[0, -0.09, (i - 5) * 10]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[100, 0.2]} />
              <meshStandardMaterial color="#555555" />
            </mesh>
          ))}
          {/* Líneas verticales */}
          {Array.from({ length: 10 }, (_, i) => (
            <mesh
              key={`v-${i}`}
              position={[(i - 5) * 10, -0.09, 0]}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            >
              <planeGeometry args={[100, 0.2]} />
              <meshStandardMaterial color="#555555" />
            </mesh>
          ))}
        </group>

        {/* Modelo 3D seleccionado */}
        <Suspense fallback={<LoadingComponent />}>
          <Model3D modelPath={"/a/c.glb"} position={[0, 0, 0]} scale={1} />
        </Suspense>

        <Hotspots onHotspotClick={handleHotspotClick} />
        <CameraHotspotController
          controlsRef={controlsRef} // Pasa el ref como prop
          activeHotspot={activeHotspot}
          onAnimationComplete={handleAnimationComplete}
        />

        {/* Stats de performance (opcional) */}
        <Stats />
      </Canvas>

      {/* Estilos CSS para las animaciones */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes fadeIn {
              0% { opacity: 0; transform: translateY(10px) scale(0.9); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes slideInFromRight {
              0% { transform: translateX(100%); opacity: 0; }
              100% { transform: translateX(0); opacity: 1; }
            }

            @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
              100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
            }

            @keyframes pulseButton {
              0% { 
                box-shadow: 0 6px 20px rgba(255,107,107,0.4), 0 2px 8px rgba(0,0,0,0.2);
                transform: translateX(-50%) scale(1);
              }
              50% { 
                box-shadow: 0 8px 30px rgba(255,107,107,0.6), 0 4px 12px rgba(0,0,0,0.3);
                transform: translateX(-50%) scale(1.02);
              }
              100% { 
                box-shadow: 0 6px 20px rgba(255,107,107,0.4), 0 2px 8px rgba(0,0,0,0.2);
                transform: translateX(-50%) scale(1);
              }
            }

            /* Scrollbar personalizado para el drawer */
            div[style*="overflowY: auto"]::-webkit-scrollbar {
              width: 8px;
            }
            
            div[style*="overflowY: auto"]::-webkit-scrollbar-track {
              background: rgba(255,255,255,0.1);
              border-radius: 4px;
            }
            
            div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
              background: #ff6b6b;
              border-radius: 4px;
            }
            
            div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
              background: #ff4444;
            }
          `,
        }}
      />
    </>
  );
}
