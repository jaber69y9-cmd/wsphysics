import React, { useMemo } from 'react';

const BackgroundAnimation = () => {
  const circles = useMemo(() => [...Array(6)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  })), []);

  const shapes = useMemo(() => [...Array(8)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}vw`,
    top: `${Math.random() * 100}vh`,
    rotate: `${Math.random() * 360}deg`,
    type: i % 2 === 0 ? 'float-slow' : 'float-slower'
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
      {/* Floating Circles */}
      {circles.map((circle) => (
        <div
          key={`circle-${circle.id}`}
          className="absolute w-64 h-64 rounded-full bg-orange-200/10 blur-3xl"
          style={{
            left: circle.left,
            top: circle.top,
          }}
        />
      ))}

      {/* Physics-themed shapes */}
      {shapes.map((shape) => (
        <div
          key={`shape-${shape.id}`}
          className="absolute text-orange-400 opacity-5"
          style={{ 
            left: shape.left, 
            top: shape.top,
            transform: `rotate(${shape.rotate})`
          }}
        >
          <div className={shape.type}>
            {shape.id % 2 === 0 ? (
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2v20M2 12h20"/>
              </svg>
            ) : (
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BackgroundAnimation;
