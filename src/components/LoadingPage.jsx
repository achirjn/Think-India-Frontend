import { motion } from 'framer-motion'
import AshokaChakra from './AshokaChakra.jsx'

const LoadingPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[color:var(--color-india-saffron)] via-white to-[color:var(--color-india-green)]"
    >
      {/* Loading Content */}
      <div className="text-center">
        {/* Rotating Ashoka Chakra */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <AshokaChakra size={120} opacity={0.8} />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LoadingPage
