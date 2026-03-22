import React from 'react';
import { motion } from 'motion/react';
import { Atom, Zap, Thermometer, Magnet, FlaskConical, CircleDot, Waves, Radio, Gauge, Lightbulb, Binary, Cpu } from 'lucide-react';

const FloatingElements = () => {
  const elements = [
    { Icon: Atom, size: 24, top: '15%', left: '5%', duration: 25, delay: 0 },
    { Icon: Zap, size: 20, top: '25%', right: '8%', duration: 22, delay: 2 },
    { Icon: Magnet, size: 22, bottom: '15%', right: '12%', duration: 24, delay: 3 },
    { Icon: Lightbulb, size: 20, top: '5%', left: '40%', duration: 32, delay: 3.5 },
    { Icon: Binary, size: 16, bottom: '5%', right: '40%', duration: 35, delay: 4.5 },
    { Icon: Cpu, size: 18, top: '50%', right: '2%', duration: 31, delay: 1.2 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.1, 0.1, 0],
            y: [-10, 10, -10],
            rotate: [0, 360],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            top: el.top,
            left: el.left,
            right: el.right,
            bottom: el.bottom,
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
