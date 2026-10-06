import React, { useRef, useState, useEffect, useCallback } from 'react';

interface JoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
  disabled?: boolean;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove, disabled = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [activePointerId, setActivePointerId] = useState<number | null>(null);

  const radius = 52; // max stick travel distance in px

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || activePointerId !== null) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setActivePointerId(e.pointerId);
    updateKnob(e.clientX, e.clientY);
  };

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) {
      setKnobPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
      return;
    }

    const clampedDist = Math.min(dist, radius);
    const angle = Math.atan2(dy, dx);
    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: clampedX, y: clampedY });
    // Normalized vector (-1 to 1)
    onMove({
      x: clampedX / radius,
      y: clampedY / radius,
    });
  }, [onMove, radius]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activePointerId !== e.pointerId) return;
    updateKnob(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activePointerId !== e.pointerId) return;
    setActivePointerId(null);
    setKnobPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (disabled) {
      setKnobPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
    }
  }, [disabled, onMove]);

  return (
    <div className="relative select-none touch-none flex flex-col items-center">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`w-36 h-36 rounded-full relative flex items-center justify-center transition-opacity duration-200 border-2 ${
          activePointerId !== null
            ? 'border-red-500/70 bg-black/70 shadow-[0_0_20px_rgba(239,68,68,0.35)]'
            : 'border-white/20 bg-black/50 backdrop-blur-md shadow-lg'
        } ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-90 active:scale-95'}`}
      >
        {/* Subtle crosshair grid */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-full h-px bg-white/10" />
          <div className="h-full w-px bg-white/10 absolute" />
          <div className="w-20 h-20 rounded-full border border-white/5" />
        </div>

        {/* Joystick Thumb Knob */}
        <div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-700 via-zinc-800 to-black border-2 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.5)] flex items-center justify-center pointer-events-none transition-transform duration-75 will-change-transform"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-red-500/90 shadow-[0_0_8px_#ef4444]" />
        </div>
      </div>

      {/* Label and desktop keyboard hint */}
      <div className="mt-1 flex items-center gap-2 text-[10px] tracking-wider font-mono text-zinc-400 uppercase">
        <span>JOYSTICK</span>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-500">WASD</span>
      </div>
    </div>
  );
};
