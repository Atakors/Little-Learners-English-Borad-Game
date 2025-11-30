
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DiceProps {
  value: number | null;
  rolling: boolean;
}

const Dice: React.FC<DiceProps> = ({ value, rolling }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (rolling) {
      // Rolling animation loop
      const interval = setInterval(() => {
        setRotation({
          x: Math.random() * 360 * 4,
          y: Math.random() * 360 * 4,
        });
      }, 150);
      return () => clearInterval(interval);
    } else {
      // Settle on the target face
      const targetValue = value || 1;
      const targetRotation = getRotationForValue(targetValue);
      
      // Calculate the nearest multiple of 360 to ensure smooth transition without unwinding
      const currentX = rotation.x;
      const currentY = rotation.y;
      
      const xTurns = Math.floor(currentX / 360);
      const yTurns = Math.floor(currentY / 360);
      
      const newX = (xTurns * 360) + targetRotation.x;
      const newY = (yTurns * 360) + targetRotation.y;

      // Add extra turns if the new value is behind the current value to keep spinning forward mostly
      setRotation({
        x: newX + (newX < currentX ? 720 : 0),
        y: newY + (newY < currentY ? 720 : 0)
      });
    }
  }, [rolling, value]);

  const getRotationForValue = (v: number) => {
    switch (v) {
      case 1: return { x: 0, y: 0 };
      case 6: return { x: 180, y: 0 };
      case 2: return { x: 90, y: 0 };
      case 5: return { x: -90, y: 0 };
      case 3: return { x: 0, y: -90 };
      case 4: return { x: 0, y: 90 };
      default: return { x: 0, y: 0 };
    }
  };

  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 perspective-1000">
      <motion.div
        className="w-full h-full relative transform-style-3d"
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
          scale: rolling ? 0.9 : 1 // Slightly smaller when rolling, normal when stopped
        }}
        transition={{ 
          duration: rolling ? 0.15 : 0.6, 
          ease: rolling ? "linear" : "backOut",
        }}
      >
        {/* Face 1: Front */}
        <DiceFace index={1} transform="translateZ(32px) sm:translateZ(40px)" />
        
        {/* Face 6: Back */}
        <DiceFace index={6} transform="rotateY(180deg) translateZ(32px) sm:translateZ(40px)" />
        
        {/* Face 2: Top */}
        <DiceFace index={2} transform="rotateX(-90deg) translateZ(32px) sm:translateZ(40px)" />
        
        {/* Face 5: Bottom */}
        <DiceFace index={5} transform="rotateX(90deg) translateZ(32px) sm:translateZ(40px)" />
        
        {/* Face 3: Right */}
        <DiceFace index={3} transform="rotateY(90deg) translateZ(32px) sm:translateZ(40px)" />
        
        {/* Face 4: Left */}
        <DiceFace index={4} transform="rotateY(-90deg) translateZ(32px) sm:translateZ(40px)" />
      </motion.div>
    </div>
  );
};

const DiceFace: React.FC<{ index: number; transform: string }> = ({ index, transform }) => {
  return (
    <div
      className="absolute inset-0 bg-white border-2 border-gray-300 rounded-xl shadow-inner flex items-center justify-center"
      style={{ transform }}
    >
      <div className="w-full h-full p-2">
         {renderDots(index)}
      </div>
    </div>
  );
};

const renderDots = (value: number) => {
  const showCenter = value % 2 !== 0;
  const showTL_BR = value > 1;
  const showTR_BL = value > 3;
  const showMid = value === 6;

  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
      {/* Row 1 */}
      <div className="flex items-center justify-center">{showTL_BR || showTR_BL || showMid ? <Dot /> : null}</div>
      <div className="flex items-center justify-center"></div>
      <div className="flex items-center justify-center">{showTL_BR || showTR_BL || showMid ? <Dot /> : null}</div>
      
      {/* Row 2 */}
      <div className="flex items-center justify-center">{showMid ? <Dot /> : null}</div>
      <div className="flex items-center justify-center">{showCenter ? <Dot /> : null}</div>
      <div className="flex items-center justify-center">{showMid ? <Dot /> : null}</div>
      
      {/* Row 3 */}
      <div className="flex items-center justify-center">{showTL_BR || showTR_BL || showMid ? <Dot /> : null}</div>
      <div className="flex items-center justify-center"></div>
      <div className="flex items-center justify-center">{showTL_BR || showTR_BL || showMid ? <Dot /> : null}</div>
    </div>
  );
};

const Dot = () => <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-black rounded-full" />;

export default Dice;
