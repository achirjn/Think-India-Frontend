import { motion } from 'framer-motion'

export default function AshokaChakra({ className = '', size = 520, opacity = 0.14, rotate = 0 }) {
  const radius = size / 2
  const spokes = 24
  const innerRadius = radius * 0.18
  const outerRadius = radius * 0.92

  const lines = Array.from({ length: spokes }, (_, i) => {
    const angle = (i * 360) / spokes
    const rad = (angle * Math.PI) / 180
    const x1 = radius + innerRadius * Math.cos(rad)
    const y1 = radius + innerRadius * Math.sin(rad)
    const x2 = radius + outerRadius * Math.cos(rad)
    const y2 = radius + outerRadius * Math.sin(rad)
    return (
      <line 
        key={i} 
        x1={x1} 
        y1={y1} 
        x2={x2} 
        y2={y2} 
        stroke="currentColor" 
        strokeWidth="6" 
        strokeLinecap="round" 
      />
    )
  })

  return (
    <motion.svg
      initial={{ rotate }}
      animate={{ rotate: rotate + 360 }}
      transition={{ repeat: Infinity, ease: 'linear', duration: 180 }}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ color: 'rgba(0,0,128,1)', opacity }}
    >
      <circle 
        cx={radius} 
        cy={radius} 
        r={outerRadius} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="10" 
      />
      <circle 
        cx={radius} 
        cy={radius} 
        r={innerRadius} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="8" 
      />
      {lines}
    </motion.svg>
  )
}
