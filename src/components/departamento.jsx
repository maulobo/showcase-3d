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
function ModeloGLB({ url = "/ok.glb", ...props }) {
  const { scene, materials } = useGLTF(url);

  // Diagnóstico COMPLETO del modelo GLTF
  useEffect(() => {
    if (scene) {
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
  }, [scene, materials]);

  return <primitive object={scene} {...props} />;
}

// Loader customizado con mejor diseño
const CustomLoader = () => {
  const { progress } = useProgress();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background:
          "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "280px",
          height: "6px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #00d4ff, #ff00a8)",
            borderRadius: "10px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <p
        style={{
          fontSize: "1.1rem",
          fontWeight: 500,
          margin: 0,
          opacity: 0.9,
        }}
      >
        Cargando modelo 3D... {Math.round(progress)}%
      </p>
    </div>
  );
};

export default function VisorGLB() {
  const [isTouch, setIsTouch] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef();

  // Preload y cleanup optimizado
  useEffect(() => {
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

      {!isLoaded && <CustomLoader />}

      {/* Monitor de FPS fuera del Canvas */}
      <FPSMonitor />

      {/* Instrucciones de scroll mejoradas */}
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
        }}
      >
        {isTouch ? "👆 Desliza para explorar" : "🖱️ Scroll para explorar"}
      </div>

      <Canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
        }}
        {...canvasConfig}
        onCreated={() => setIsLoaded(true)}
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
          <ModeloGLB />
        </Suspense>

        <Preload all />
      </Canvas>
    </>
  );
}
