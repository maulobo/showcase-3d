import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from "three";

export function ScrollWaypointCamera2({ onEnd, onProgress }) {
  const { camera } = useThree();
  const scrollOffset = useRef(0);
  const currentOffset = useRef(0);
  const smoothScrollVelocity = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const isScrolling = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Waypoints optimizados para caminata natural dentro del dpto
  const waypoints = [
    // Entrada - vista general
    { position: [-0.5, 1.8, -8], lookAt: [0, 1.5, 0], speed: 1.0 },

    // Acercamiento gradual al living
    { position: [-0.5, 1.75, -6], lookAt: [0, 1.4, 6], speed: 0.8 },
    { position: [-0.5, 1.7, -4], lookAt: [-10, 1.3, 10], speed: 0.7 },

    // Dentro del living - explorando
    { position: [-0.5, 1.68, -3], lookAt: [-15, 1.2, 1], speed: 0.6 },
    { position: [-0.5, 1.65, -3], lookAt: [-30, 1.1, 1], speed: 0.5 },

    { position: [-0.5, 1.68, -1.5], lookAt: [-15, 1.2, 1], speed: 0.6 },
    { position: [-3, 1.68, -1.5], lookAt: [5, 1.1, -1], speed: 0.5 },
    { position: [-3, 1.68, -1.5], lookAt: [60, 1.1, -11], speed: 0.5 },
    { position: [-4, 1.68, -1.5], lookAt: [30, 1.1, -20], speed: 0.5 },
    { position: [-4, 1.68, -1.5], lookAt: [100, 1.1, 1], speed: 0.5 },
    { position: [-4, 1.68, -1.5], lookAt: [100, -40, -20], speed: 0.5 },

    // Girando hacia la cocina/comedor
    { position: [-0.5, 1.67, -3], lookAt: [-30, 1.2, -11], speed: 0.6 },
    { position: [-0.5, 1.69, -3], lookAt: [-30, 1.3, 17], speed: 0.7 },

    // Explorando área de comedor
    { position: [-0.5, 1.71, -5], lookAt: [-30, 1.4, 17], speed: 0.8 },
    { position: [-2, 1.73, -5], lookAt: [-10, 1.5, -5], speed: 0.7 },

    // Hacia los dormitorios
    { position: [-2, 1.71, -5], lookAt: [-10, 1.3, -7], speed: 0.6 },
    { position: [-3, 1.69, -5], lookAt: [-10, 1.2, -10], speed: 0.5 },

    // Explorando dormitorios
    { position: [-3, 1.67, -5], lookAt: [-10, 1.1, 10], speed: 0.4 },
    { position: [-3.5, 1.65, -5], lookAt: [-10, 1.0, -20], speed: 0.5 },

    // Vista final panorámica
    { position: [-3.5, 1.75, -5.5], lookAt: [-10, 1.8, -1000], speed: 0.8 },
    { position: [-3.5, 1.8, -5.5], lookAt: [1000, -401, -1000], speed: 1.0 },
  ];

  const totalSections = waypoints.length - 1;

  // Función para suavizar el scroll con inercia BIDIRECCIONAL
  const smoothScroll = (delta) => {
    const currentTime = Date.now();
    lastScrollTime.current = currentTime;

    // Marcar que estamos haciendo scroll
    isScrolling.current = true;

    // Limpiar timeout anterior y crear uno nuevo
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Dejar de hacer scroll después de 500ms de inactividad
    scrollTimeoutRef.current = setTimeout(() => {
      isScrolling.current = false;
    }, 500);

    // Aplicar inercia al scroll (permite dirección positiva Y negativa)
    smoothScrollVelocity.current *= 0.92; // Decaimiento de velocidad más suave
    smoothScrollVelocity.current += delta * 0.0001; // Sensibilidad reducida significativamente

    // Limitar velocidad máxima en ambas direcciones (más lento)
    smoothScrollVelocity.current = THREE.MathUtils.clamp(
      smoothScrollVelocity.current,
      -0.003, // Velocidad hacia atrás más lenta
      0.003 // Velocidad hacia adelante más lenta
    );

    // Actualizar offset permitiendo ir hacia atrás (0) y adelante (1)
    scrollOffset.current += smoothScrollVelocity.current;
    scrollOffset.current = THREE.MathUtils.clamp(scrollOffset.current, 0, 1);
  };

  useEffect(() => {
    let lastY = null;
    let touchVelocity = 0;

    const handleScroll = (e) => {
      e.preventDefault();
      smoothScroll(e.deltaY);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        lastY = e.touches[0].clientY;
        touchVelocity = 0;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && lastY !== null) {
        const currentY = e.touches[0].clientY;
        const deltaY = lastY - currentY; // Positivo = hacia adelante, Negativo = hacia atrás

        // Suavizar el movimiento touch manteniendo la dirección
        touchVelocity = touchVelocity * 0.8 + deltaY * 0.2;
        smoothScroll(touchVelocity * 0.5); // Factor reducido para mejor control móvil

        lastY = currentY;
      }
    };

    const handleTouchEnd = () => {
      lastY = null;
      // Aplicar inercia al finalizar el touch
      const inertiaDecay = () => {
        if (Math.abs(touchVelocity) > 0.2) { // Umbral más bajo
          smoothScroll(touchVelocity * 0.3); // Inercia más suave
          touchVelocity *= 0.95; // Decaimiento más gradual
          requestAnimationFrame(inertiaDecay);
        }
      };
      requestAnimationFrame(inertiaDecay);
    };

    window.addEventListener("wheel", handleScroll, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);

      // Limpiar timeout al desmontar
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useFrame((state) => {
    if (totalSections < 1) return;

    // Interpolación más suave y adaptativa
    const targetOffset = scrollOffset.current;
    const lerpSpeed =
      Math.abs(targetOffset - currentOffset.current) > 0.1 ? 0.04 : 0.06; // Velocidades más lentas

    currentOffset.current = THREE.MathUtils.lerp(
      currentOffset.current,
      targetOffset,
      lerpSpeed
    );

    const t = currentOffset.current * totalSections;
    const index = Math.floor(t);
    const lerpT = t - index;

    // Suavizado con curva easing
    const easedLerpT = lerpT * lerpT * (3 - 2 * lerpT); // Smoothstep

    const current = waypoints[index];
    const next = waypoints[Math.min(index + 1, totalSections)];

    // Interpolación de posición con curva suave
    const pos = new THREE.Vector3()
      .fromArray(current.position)
      .lerp(new THREE.Vector3().fromArray(next.position), easedLerpT);

    // Interpolación de lookAt con curva suave
    const target = new THREE.Vector3()
      .fromArray(current.lookAt)
      .lerp(new THREE.Vector3().fromArray(next.lookAt), easedLerpT);

    // Agregar micro-movimientos SOLO mientras se hace scroll
    const time = state.clock.getElapsedTime();

    // Solo aplicar micro-movimientos si se está haciendo scroll activamente
    if (isScrolling.current) {
      const walkBob = Math.sin(time * 6) * 0.02; // Movimiento sutil arriba/abajo
      const walkSway = Math.sin(time * 4) * 0.01; // Movimiento sutil lateral

      pos.y += walkBob * (1 - currentOffset.current); // Menos bobbing al final
      pos.x += walkSway * (1 - currentOffset.current);
    }

    // Aplicar transformaciones suaves
    camera.position.lerp(pos, 0.08); // Movimiento más suave

    // LookAt suave con damping
    const currentLookDirection = camera.getWorldDirection(new THREE.Vector3());
    const targetLookDirection = target.clone().sub(camera.position).normalize();
    const smoothLookDirection = currentLookDirection.lerp(
      targetLookDirection,
      0.05 // Rotación más suave
    );

    const lookAtPoint = camera.position.clone().add(smoothLookDirection);
    camera.lookAt(lookAtPoint);

    // Llamar onEnd solo si el usuario está en el final por un tiempo prolongado
    // NO automáticamente al llegar al 98%
    if (currentOffset.current >= 0.99 && onEnd) {
      // Solo activar cámara libre si está en el final y no se mueve por 2 segundos
      // (esto se manejará desde el componente padre si es necesario)
      // onEnd(); // Comentado para permitir navegación libre
    }

    // Reportar progreso si hay callback
    if (onProgress) {
      onProgress(currentOffset.current);
    }

    // Debug info en consola (opcional)
    if (Math.abs(scrollOffset.current - currentOffset.current) < 0.01) {
      // const currentWaypoint = Math.round(currentOffset.current * totalSections);
      // Comentar la siguiente línea si no quieres ver el debug
      // console.log(`📍 Waypoint: ${currentWaypoint}/${totalSections} | Progress: ${(currentOffset.current * 100).toFixed(1)}%`);
    }
  });

  return null;
}
