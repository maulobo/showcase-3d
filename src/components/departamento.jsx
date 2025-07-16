import { Suspense, useEffect, useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  Environment,
  Preload,
  Stats,
  useProgress,
} from "@react-three/drei";
import { ScrollWaypointCamera2 } from "./scroll1";
import BackToHome from "./BackToHome";

// Monitor de FPS personalizado (fuera del Canvas)
function FPSMonitor() {
  const [fps, setFps] = useState(0);
  const [avgFps, setAvgFps] = useState(0);
  const fpsHistory = useRef([]);

  useEffect(() => {
    let animationId;
    let lastTime = performance.now();

    const updateFPS = (currentTime) => {
      const delta = currentTime - lastTime;
      const currentFps = Math.round(1000 / delta);

      fpsHistory.current.push(currentFps);
      if (fpsHistory.current.length > 30) {
        fpsHistory.current.shift();
      }

      const average =
        fpsHistory.current.reduce((a, b) => a + b, 0) /
        fpsHistory.current.length;

      setFps(currentFps);
      setAvgFps(Math.round(average));

      lastTime = currentTime;
      animationId = requestAnimationFrame(updateFPS);
    };

    animationId = requestAnimationFrame(updateFPS);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const fpsColor = fps > 50 ? "#00ff00" : fps > 30 ? "#ffff00" : "#ff0000";

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        background: "rgba(0, 0, 0, 0.8)",
        color: fpsColor,
        padding: "8px 12px",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "12px",
        zIndex: 100,
        border: `1px solid ${fpsColor}`,
      }}
    >
      FPS: {fps} | Avg: {avgFps}
    </div>
  );
}

// Componente de modelo optimizado con diagnóstico
function ModeloGLB({ url = "/ok.glb", onModelReady, ...props }) {
  const { scene, materials } = useGLTF(url);
  const [isProcessed, setIsProcessed] = useState(false);

  // Diagnóstico COMPLETO del modelo GLTF
  useEffect(() => {
    if (scene && !isProcessed) {
      console.group("🔍 DIAGNÓSTICO COMPLETO DEL MODELO GLTF");

      let totalVertices = 0;
      let totalTriangles = 0;
      let meshCount = 0;
      let materialCount = Object.keys(materials || {}).length;
      let textureCount = 0;
      let largestMesh = { vertices: 0, name: "", triangles: 0 };
      let problemMeshes = [];
      let textureMemory = 0;

      // Análisis detallado por mesh
      scene.traverse((child) => {
        if (child.isMesh && child.geometry) {
          meshCount++;
          const geometry = child.geometry;
          const meshName = child.name || `Mesh_${meshCount}`;

          if (geometry.attributes.position) {
            const vertices = geometry.attributes.position.count;
            let triangles = 0;

            if (geometry.index) {
              triangles = geometry.index.count / 3;
            } else {
              triangles = vertices / 3;
            }

            totalVertices += vertices;
            totalTriangles += triangles;

            // Encontrar el mesh más grande
            if (vertices > largestMesh.vertices) {
              largestMesh = {
                vertices,
                triangles: Math.round(triangles),
                name: meshName,
              };
            }

            // Detectar meshes problemáticos
            if (vertices > 15000) {
              problemMeshes.push({
                name: meshName,
                vertices,
                triangles: Math.round(triangles),
                severity: vertices > 30000 ? "CRÍTICO" : "ALTO",
              });
            }
          }

          // Analizar materiales y texturas por mesh
          if (child.material) {
            const material = child.material;

            // Contar texturas y calcular memoria estimada
            Object.keys(material).forEach((key) => {
              if (material[key] && material[key].isTexture) {
                textureCount++;
                const texture = material[key];

                // Estimar memoria de textura (aproximado)
                if (texture.image) {
                  const width = texture.image.width || 1024;
                  const height = texture.image.height || 1024;
                  textureMemory += (width * height * 4) / (1024 * 1024); // MB aproximados
                }
              }
            });
          }
        }
      });

      // Resultados del análisis
      console.log(`� ESTADÍSTICAS GENERALES:`);
      console.log(`   • Meshes: ${meshCount}`);
      console.log(`   • Vértices totales: ${totalVertices.toLocaleString()}`);
      console.log(
        `   • Triángulos totales: ${Math.round(
          totalTriangles
        ).toLocaleString()}`
      );
      console.log(`   • Materiales: ${materialCount}`);
      console.log(`   • Texturas: ${textureCount}`);
      console.log(
        `   • Memoria estimada texturas: ${textureMemory.toFixed(1)} MB`
      );
      console.log(
        `   • Mesh más grande: "${
          largestMesh.name
        }" (${largestMesh.vertices.toLocaleString()} vértices, ${largestMesh.triangles.toLocaleString()} triángulos)`
      );

      // Análisis de rendimiento con recomendaciones específicas
      console.log(`\n⚠️  ANÁLISIS DE RENDIMIENTO:`);

      // Análisis de vértices
      if (totalVertices > 150000) {
        console.error(
          `   🔴 CRÍTICO: Demasiados vértices (${totalVertices.toLocaleString()})`
        );
        console.error(`   💡 SOLUCIÓN URGENTE: Reducir a < 50,000 vértices`);
        console.error(
          `   🛠️  CÓMO: Blender > Modifier > Decimate (Ratio: 0.3)`
        );
      } else if (totalVertices > 75000) {
        console.warn(
          `   🟡 ALTO: Muchos vértices (${totalVertices.toLocaleString()})`
        );
        console.warn(
          `   💡 Recomendado: Reducir a < 50,000 para mejor FPS móvil`
        );
      } else {
        console.log(`   ✅ Vértices OK (${totalVertices.toLocaleString()})`);
      }

      // Análisis de triángulos
      if (totalTriangles > 100000) {
        console.error(
          `   🔴 CRÍTICO: Demasiados triángulos (${Math.round(
            totalTriangles
          ).toLocaleString()})`
        );
        console.error(`   💡 SOLUCIÓN: Simplificar geometría urgentemente`);
      } else if (totalTriangles > 50000) {
        console.warn(
          `   🟡 ALTO: Muchos triángulos (${Math.round(
            totalTriangles
          ).toLocaleString()})`
        );
      } else {
        console.log(
          `   ✅ Triángulos OK (${Math.round(totalTriangles).toLocaleString()})`
        );
      }

      // Análisis de materiales
      if (materialCount > 15) {
        console.warn(
          `   🟡 Muchos materiales (${materialCount}). Combinar en atlas de texturas`
        );
        console.warn(
          `   🛠️  CÓMO: Blender > UV Editing > Combinar texturas en una sola imagen`
        );
      } else {
        console.log(`   ✅ Materiales OK (${materialCount})`);
      }

      // Análisis de texturas
      if (textureMemory > 50) {
        console.warn(
          `   🟡 Memoria de texturas alta (${textureMemory.toFixed(1)} MB)`
        );
        console.warn(`   💡 Comprimir texturas o reducir resolución`);
      } else {
        console.log(
          `   ✅ Memoria texturas OK (${textureMemory.toFixed(1)} MB)`
        );
      }

      // Reporte de meshes problemáticos
      if (problemMeshes.length > 0) {
        console.log(`\n🚨 MESHES PROBLEMÁTICOS:`);
        problemMeshes.forEach((mesh) => {
          console.warn(
            `   ${mesh.severity === "CRÍTICO" ? "🔴" : "🟡"} "${
              mesh.name
            }": ${mesh.vertices.toLocaleString()} vértices, ${mesh.triangles.toLocaleString()} triángulos`
          );
        });
        console.warn(`   💡 Enfócate en simplificar estos meshes primero`);
      }

      // Recomendaciones generales
      console.log(`\n💡 RECOMENDACIONES PARA OPTIMIZAR:`);
      console.log(`   1. 🎯 Objetivo: < 50,000 vértices totales`);
      console.log(`   2. 🛠️  Herramienta: Blender Decimate Modifier`);
      console.log(
        `   3. 📦 Alternativa: Crear versiones LOD (baja/media/alta calidad)`
      );
      console.log(`   4. 🖼️  Texturas: Usar formatos comprimidos (WebP, AVIF)`);
      console.log(`   5. 🎨 Materiales: Combinar similares en atlas`);

      console.groupEnd();
      setIsProcessed(true);

      // Notificar que el modelo está listo
      if (onModelReady) {
        setTimeout(() => {
          onModelReady();
        }, 100);
      }
    }

    // Optimizar materiales para mejor rendimiento
    if (materials) {
      Object.values(materials).forEach((material) => {
        // Optimizaciones de materiales
        material.envMapIntensity = 0.8;
        material.roughness = Math.max(material.roughness, 0.1);
        material.metalness = Math.min(material.metalness, 0.9);

        // Optimizar texturas si existen
        if (material.map) {
          material.map.generateMipmaps = true;
          material.map.minFilter = 1008; // LinearMipmapLinearFilter
          material.map.magFilter = 1006; // LinearFilter
        }

        // Optimizar normal maps
        if (material.normalMap) {
          material.normalMap.generateMipmaps = true;
          material.normalMap.minFilter = 1008; // LinearMipmapLinearFilter
        }
      });
    }
  }, [scene, materials, isProcessed, onModelReady]);

  return <primitive object={scene} {...props} />;
}

// Loader customizado con mejor diseño y progreso más preciso
const CustomLoader = () => {
  const { progress, active, loaded, total } = useProgress();
  const [loadingPhase, setLoadingPhase] = useState("Iniciando...");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (progress < 10) {
      setLoadingPhase("Conectando...");
    } else if (progress < 30) {
      setLoadingPhase("Descargando modelo...");
    } else if (progress < 60) {
      setLoadingPhase("Procesando geometría...");
    } else if (progress < 85) {
      setLoadingPhase("Cargando texturas...");
    } else if (progress < 95) {
      setLoadingPhase("Optimizando...");
    } else {
      setLoadingPhase("Finalizando...");
    }
  }, [progress]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background:
          "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 40%, #16213e 80%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Animación de fondo */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at ${progress}% 50%, rgba(0,212,255,0.1) 0%, transparent 50%)`,
          animation: "pulse 2s ease-in-out infinite",
        }}
      />

      {/* Logo o título */}
      <div
        style={{
          marginBottom: "3rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            margin: 0,
            marginBottom: "0.5rem",
            background: "linear-gradient(45deg, #00d4ff, #ff00a8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          3D Show
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            margin: 0,
            opacity: 0.7,
            fontWeight: 400,
          }}
        >
          Experiencia inmersiva
        </p>
      </div>

      {/* Barra de progreso mejorada */}
      <div
        style={{
          width: "320px",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "1rem",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #00d4ff, #0080ff, #ff00a8)",
              borderRadius: "12px",
              transition: "width 0.5s ease",
              position: "relative",
            }}
          >
            {/* Animación de brillo */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                animation: progress > 0 ? "shimmer 1.5s infinite" : "none",
              }}
            />
          </div>
        </div>

        {/* Información de progreso */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#00d4ff",
            }}
          >
            {Math.round(progress)}%
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.7)",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            {showDetails ? "Ocultar" : "Detalles"}
          </button>
        </div>
      </div>

      {/* Fase de carga */}
      <p
        style={{
          fontSize: "1.2rem",
          fontWeight: 500,
          margin: 0,
          marginBottom: "1rem",
          opacity: 0.9,
          textAlign: "center",
        }}
      >
        {loadingPhase}
      </p>

      {/* Detalles técnicos (opcionales) */}
      {showDetails && (
        <div
          style={{
            background: "rgba(0,0,0,0.3)",
            padding: "1rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
            opacity: 0.8,
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div>
            Archivos cargados: {loaded} / {total}
          </div>
          <div>Estado: {active ? "Cargando..." : "Procesando..."}</div>
        </div>
      )}

      {/* Spinner sutil */}
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "2px solid rgba(255,255,255,0.1)",
          borderTop: "2px solid #00d4ff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginTop: "1rem",
        }}
      />

      {/* Estilos CSS inline para animaciones */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.2; }
          }
        `}
      </style>
    </div>
  );
};

export default function VisorGLB() {
  const [isTouch, setIsTouch] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const canvasRef = useRef();

  // Preload y cleanup optimizado
  useEffect(() => {
    // Precargar el modelo
    useGLTF.preload("/ok.glb");

    return () => {
      useGLTF.clear();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    setIsTouch(
      "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );
  }, []);

  // Configuración de Canvas optimizada SIN SOMBRAS
  const canvasConfig = useMemo(
    () => ({
      shadows: false, // NO SOMBRAS para máximo FPS
      gl: {
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        depth: true,
        stencil: false,
        preserveDrawingBuffer: false,
      },
      camera: {
        position: [8, 2, 8],
        fov: 60,
        near: 0.01,
        far: 1000,
      },
      dpr: isTouch ? 1 : Math.min(window.devicePixelRatio, 1.5), // Reducido para mejor FPS
      performance: { min: 0.1 }, // Muy agresivo
      frameloop: "always",
    }),
    [isTouch]
  );

  return (
    <>
      {/* Componente BackToHome - Botón para regresar al home de visores */}
      <BackToHome position="top-left" />

      {/* Mostrar loader hasta que el modelo esté completamente listo */}
      {(!isLoaded || !isModelReady) && <CustomLoader />}

      {/* Monitor de FPS fuera del Canvas - solo mostrar cuando esté cargado */}
      {isLoaded && isModelReady && <FPSMonitor />}

      {/* Instrucciones de scroll mejoradas - solo mostrar cuando esté cargado */}
      {isLoaded && isModelReady && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(10px)",
            color: "white",
            fontWeight: 600,
            padding: "12px 24px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            zIndex: 50,
            pointerEvents: "none",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.95rem",
            border: "1px solid rgba(255,255,255,0.1)",
            animation: "fadeIn 0.5s ease-in-out",
          }}
        >
          {isTouch ? "👆 Desliza para explorar" : "🖱️ Scroll para explorar"}
        </div>
      )}

      <Canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
          opacity: isLoaded && isModelReady ? 1 : 0,
          transition: "opacity 0.5s ease-in-out",
        }}
        {...canvasConfig}
        onCreated={() => {
          setIsLoaded(true);
        }}
      >
        {/* Cámara con scroll */}
        <ScrollWaypointCamera2 />

        {/* Environment optimizado para MÁXIMO FPS */}
        <Environment
          preset="apartment"
          environmentIntensity={0.5}
          resolution={256} // Resolución fija baja para máximo FPS
        />

        {/* Stats para monitoring FPS */}
        <Stats />

        <Suspense fallback={null}>
          <ModeloGLB onModelReady={() => setIsModelReady(true)} />
        </Suspense>

        <Preload all />
      </Canvas>

      {/* Estilos CSS para animaciones */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}
      </style>
    </>
  );
}
