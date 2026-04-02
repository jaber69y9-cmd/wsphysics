import React from 'react';
import { motion } from 'motion/react';
import { Atom, Zap, Thermometer, Magnet, FlaskConical, CircleDot, Waves, Radio, Gauge, Lightbulb, Binary, Cpu } from 'lucide-react';

const FloatingElements = () => {
  const elements = [
    { Icon: Atom, size: 24, top: '15%', left: '5%', duration: 25, delay: 0 },
    { Icon: Zap, size: 20, top: '25%', right: '8%', duration: 22, delay: 2 },
    { Icon: Lightbulb, size: 20, top: '5%', left: '40%', duration: 32, delay: 3.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.05, 0.05, 0],
            y: [-5, 5, -5],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: el.top,
            left: (el as any).left,
            right: (el as any).right,
            bottom: (el as any).bottom,
            color: '#ea580c', // orange-600
          }}
        >
          <el.Icon size={el.size} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;
