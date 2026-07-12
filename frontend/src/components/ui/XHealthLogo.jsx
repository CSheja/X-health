import React from 'react';
import { motion } from 'framer-motion';

const XHealthLogo = ({ size = 'md', light = false }) => {
  const color = light ? '#ffffff' : '#111111';
  const dimColor = light ? 'rgba(255,255,255,0.4)' : 'rgba(17,17,17,0.35)';

  const sizes = {
    sm: { unit: 5, fontSize: '13px', subSize: '9px' },
    md: { unit: 7, fontSize: '16px', subSize: '10px' },
    lg: { unit: 10, fontSize: '22px', subSize: '11px' },
    xl: { unit: 14, fontSize: '30px', subSize: '13px' },
  };

  const { unit, fontSize, subSize } = sizes[size];
  const gap = Math.round(unit * 0.3);
  const totalSize = unit * 3 + gap * 2;

  // Three blocks along one diagonal (top-left to bottom-right)
  const blocks = [
    { x: 0, y: 0 },
    { x: unit + gap, y: unit + gap },
    { x: (unit + gap) * 2, y: (unit + gap) * 2 },
  ];

  // The solid line goes from top-right to bottom-left
  // That means from (totalSize, 0) to (0, totalSize)
  // We draw it as a rotated rectangle
  const lineLength = Math.sqrt(totalSize * totalSize + totalSize * totalSize);
  const lineThickness = Math.round(unit * 0.28);

  return (
    <div className="flex items-center gap-3">
      {/* X mark */}
      <div
        className="relative flex-shrink-0"
        style={{ width: totalSize, height: totalSize }}
      >
        {/* Arm 1: segmented blocks top-left to bottom-right */}
        {blocks.map((pos, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: unit,
              height: unit,
              background: color,
              borderRadius: Math.round(unit * 0.18),
            }}
          />
        ))}

        {/* Arm 2: solid line top-right to bottom-left */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          style={{
            position: 'absolute',
            top: totalSize / 2 - lineThickness / 2,
            left: -(lineLength - totalSize) / 2,
            width: lineLength,
            height: lineThickness,
            background: color,
            borderRadius: lineThickness,
            transform: 'rotate(45deg)',
            transformOrigin: 'center',
          }}
        />
      </div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <div
          style={{
            color,
            fontSize,
            fontWeight: 900,
            letterSpacing: '0.18em',
            lineHeight: 1,
          }}
        >
          HEALTH
        </div>
        <div
          style={{
            color: dimColor,
            fontSize: subSize,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            marginTop: 3,
            lineHeight: 1,
          }}
        >
          Rwanda
        </div>
      </motion.div>
    </div>
  );
};

export default XHealthLogo;