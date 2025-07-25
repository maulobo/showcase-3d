import { useState, useRef, useEffect } from "react";

export default function Edf() {
  const [hoveredFloor, setHoveredFloor] = useState(null);
  const [svgDimensions, setSvgDimensions] = useState({
    width: 600,
    height: 700,
    offsetLeft: 0,
    offsetTop: 0,
  });
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Definir las zonas de hover basadas en el SVG del edificio
  // Coordenadas precisas en píxeles convertidas a porcentajes para SVG 600x700
  const floorZones = [
    {
      id: "penthouse",
      name: "Penthouse",
      description: "Apartamento exclusivo con terraza privada",
      top: "20%", // Arriba del piso 14
      left: "60%", // 360px / 600px
      width: "40.83%", // 245px / 600px = 40.83%
      height: "4.29%", // 30px / 700px = 4.29%
      color: "#FFC46A",
    },
    {
      id: "floor-14",
      name: "Piso 14",
      description: "Apartamentos premium con vista panorámica",
      top: "29.93%", // 209.5px / 700px (tu referencia)
      left: "60%", // Más a la derecha
      width: "40.83%", // 245px / 600px
      height: "4.29%", // 30px / 700px
      color: "#F8A668",
    },
    {
      id: "floor-13",
      name: "Piso 13",
      description: "Apartamentos de lujo",
      top: "34.22%", //
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#C24C50",
    },
    {
      id: "floor-12",
      name: "Piso 12",
      description: "Apartamentos estándar superior",
      top: "38.51%",
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#FFC46A",
    },
    {
      id: "floor-11",
      name: "Piso 11",
      description: "Apartamentos estándar superior",
      top: "42.8%",
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#F8A668",
    },
    {
      id: "floor-10",
      name: "Piso 10",
      description: "Apartamentos estándar",
      top: "47.09%",
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#C24C50",
    },
    {
      id: "floor-9",
      name: "Piso 9",
      description: "Apartamentos estándar",
      top: "51.38%",
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#FFC46A",
    },
    {
      id: "floor-8",
      name: "Piso 8",
      description: "Apartamentos estándar",
      top: "55.67%",
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#F8A668",
    },
    {
      id: "floor-7",
      name: "Piso 7",
      description: "Apartamentos estándar",
      top: "59.96%",
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#C24C50",
    },
    {
      id: "floor-6",
      name: "Piso 6",
      description: "Apartamentos estándar",
      top: "64.25%",
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#FFC46A",
    },
    {
      id: "floor-5",
      name: "Piso 5",
      description: "Apartamentos estándar",
      top: "68.54%",
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#F8A668",
    },
    {
      id: "floor-4",
      name: "Piso 4",
      description: "Apartamentos estándar",
      top: "72.83%",
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#C24C50",
    },
    {
      id: "floor-3",
      name: "Piso 3",
      description: "Apartamentos estándar",
      top: "77.12%",
      left: "60%",
      width: "40.83%",
      height: "4.29%",
      color: "#FFC46A",
    },
    {
      id: "floor-2",
      name: "Piso 2",
      description: "Apartamentos estándar",
      top: "82.76%", // 579.31px / 700px = 82.76%
      left: "60%", // Ajustado a la derecha
      width: "40.83%", // 244.98px ≈ 245px
      height: "4.29%", // 30.03px ≈ 30px
      color: "#C24C50",
    },
    {
      id: "ground-floor",
      name: "Planta Baja",
      description: "Lobby, comercios y servicios",
      top: "87.05%", // Después del piso 2
      left: "55%",
      width: "45%",
      height: "8.57%", // Más alto para planta baja
      color: "#3B2B30",
    },
  ];

  // Función para actualizar las dimensiones del SVG cuando se carga o redimensiona
  const updateSvgDimensions = () => {
    if (svgRef.current) {
      const svg = svgRef.current;

      // Obtener las dimensiones reales del SVG mostrado respecto al viewport
      const svgRect = svg.getBoundingClientRect();

      setSvgDimensions({
        width: svgRect.width,
        height: svgRect.height,
        offsetLeft: svgRect.left,
        offsetTop: svgRect.top,
      });

      console.log("Dimensiones SVG actualizadas:", {
        width: svgRect.width,
        height: svgRect.height,
        offsetLeft: svgRect.left,
        offsetTop: svgRect.top,
      });
    }
  };

  // useEffect para escuchar cambios de tamaño
  useEffect(() => {
    const handleResize = () => {
      updateSvgDimensions();
    };

    window.addEventListener("resize", handleResize);

    // Timeout para asegurar que el SVG esté completamente cargado
    const timer = setTimeout(updateSvgDimensions, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Función para calcular el estilo de las zonas de hover dinámicamente
  const getZoneStyle = (zone) => {
    if (!svgDimensions.width || !svgDimensions.height) {
      return { display: "none" };
    }

    // Calcular posición y tamaño en píxeles basado en porcentajes del SVG
    const topInPixels = (parseFloat(zone.top) / 100) * svgDimensions.height;
    const leftInPixels = (parseFloat(zone.left) / 100) * svgDimensions.width;
    const widthInPixels = (parseFloat(zone.width) / 100) * svgDimensions.width;
    const heightInPixels =
      (parseFloat(zone.height) / 100) * svgDimensions.height;

    return {
      position: "fixed",
      top: `${svgDimensions.offsetTop + topInPixels}px`,
      left: `${svgDimensions.offsetLeft + leftInPixels}px`,
      width: `${widthInPixels}px`,
      height: `${heightInPixels}px`,
      backgroundColor: "transparent",
      border: "2px solid transparent",
      cursor: "pointer",
      transition: "all 0.3s ease",
      zIndex: 10,
    };
  };
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "auto",
        backgroundColor: "#F0EBE0",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Info panel */}
      {hoveredFloor && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: hoveredFloor.color,
            color: "#F0EBE0",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 1000,
            fontFamily: "'Inter', sans-serif",
            fontWeight: "bold",
            minWidth: "250px",
          }}
        >
          🏢 {hoveredFloor.name}
          <br />
          <small style={{ color: "#F0EBE0", opacity: 0.9, fontSize: "12px" }}>
            {hoveredFloor.description}
          </small>
        </div>
      )}

      {/* Panel de navegación */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          background: "#F0EBE0",
          color: "#3B2B30",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 1000,
          fontFamily: "'Inter', sans-serif",
          minWidth: "200px",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <h3
          style={{ margin: "0 0 10px 0", color: "#C24C50", fontSize: "16px" }}
        >
          🏢 Edificio Interactivo
        </h3>
        <div style={{ fontSize: "11px", lineHeight: "1.3", color: "#3B2B30" }}>
          <div style={{ marginBottom: "3px" }}>
            🔸 <strong>Penthouse:</strong> Vista exclusiva
          </div>
          <div style={{ marginBottom: "3px" }}>
            🔸 <strong>Pisos 4-12:</strong> Apartamentos
          </div>
          <div style={{ marginBottom: "3px" }}>
            🔸 <strong>Planta Baja:</strong> Servicios
          </div>
        </div>
        <div
          style={{
            marginTop: "10px",
            padding: "8px",
            background: "#FFC46A",
            borderRadius: "4px",
            fontSize: "10px",
            textAlign: "center",
          }}
        >
          💡 Pasa el mouse sobre el edificio
        </div>
      </div>

      {/* Contenedor principal del SVG */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* SVG del edificio directamente incluido */}
        <object
          ref={svgRef}
          data="/rec.svg"
          type="image/svg+xml"
          width="600"
          height="700"
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            borderRadius: "8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}
          onLoad={() => {
            console.log("SVG cargado correctamente");
            setTimeout(updateSvgDimensions, 100);
          }}
        >
          {/* Fallback para navegadores que no soportan object */}
          <img
            src="/rec.svg"
            alt="Edificio"
            width="600"
            height="700"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
            onLoad={() => updateSvgDimensions()}
          />
        </object>
      </div>

      {/* Zonas de hover sobre el SVG */}
      {svgDimensions.width > 0 &&
        floorZones.map((zone) => (
          <div
            key={zone.id}
            style={{
              ...getZoneStyle(zone),
              // Debug temporal: hacer visible las zonas
              backgroundColor: `${zone.color}20`, // 20 = 12% opacity para debug
              border: `1px dashed ${zone.color}`,
            }}
            onMouseEnter={() => {
              console.log("Hover en:", zone.name);
              setHoveredFloor(zone);
            }}
            onMouseLeave={() => {
              console.log("Salió de:", zone.name);
              setHoveredFloor(null);
            }}
            onClick={() => {
              console.log(`Clicked on ${zone.name}`);
              // Aquí puedes agregar navegación o mostrar detalles
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = `${zone.color}60`; // 60 = 37% opacity
              e.target.style.border = `2px solid ${zone.color}`;
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = `${zone.color}20`;
              e.target.style.border = `1px dashed ${zone.color}`;
            }}
          />
        ))}

      {/* Controles de zoom */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={() => {
            if (svgRef.current) {
              svgRef.current.style.transform = "scale(1)";
              updateSvgDimensions();
            }
          }}
          style={{
            background: "#FFC46A",
            color: "#3B2B30",
            border: "2px solid #C24C50",
            padding: "10px 15px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          🔍 Reset Zoom
        </button>

        <button
          onClick={() => {
            if (svgRef.current) {
              const currentTransform = svgRef.current.style.transform;
              const currentScale = currentTransform.match(/scale\(([\d.]+)\)/);
              const scale = currentScale ? parseFloat(currentScale[1]) : 1;
              svgRef.current.style.transform = `scale(${scale * 1.2})`;
              setTimeout(updateSvgDimensions, 100);
            }
          }}
          style={{
            background: "#F8A668",
            color: "#3B2B30",
            border: "2px solid #C24C50",
            padding: "10px 15px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          🔍 Zoom In
        </button>

        <button
          onClick={() => {
            if (svgRef.current) {
              const currentTransform = svgRef.current.style.transform;
              const currentScale = currentTransform.match(/scale\(([\d.]+)\)/);
              const scale = currentScale ? parseFloat(currentScale[1]) : 1;
              if (scale > 0.5) {
                svgRef.current.style.transform = `scale(${scale * 0.8})`;
                setTimeout(updateSvgDimensions, 100);
              }
            }
          }}
          style={{
            background: "#C24C50",
            color: "#F0EBE0",
            border: "2px solid #3B2B30",
            padding: "10px 15px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "12px",
          }}
        >
          🔍 Zoom Out
        </button>
      </div>
    </div>
  );
}
