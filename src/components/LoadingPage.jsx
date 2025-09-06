import { motion } from 'framer-motion'
import { useEffect } from 'react'
import AshokaChakra from './AshokaChakra.jsx'
import { localCacheSet, cacheKeyForUrl } from '../utils/swrCache.js'

const LoadingPage = () => {
  // Prewarm: fetch glimpses list and first image; cache for HomePage
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const timeoutId = setTimeout(() => { try { controller.abort() } catch {} }, 8000)

    const imageUtils = {
      detectMime: (b64) => {
        if (!b64 || typeof b64 !== 'string') return ''
        const head = b64.slice(0, 16)
        if (head.startsWith('/9j/')) return 'image/jpeg'
        if (head.startsWith('iVBORw0KGgo')) return 'image/png'
        if (head.startsWith('R0lGOD')) return 'image/gif'
        if (head.startsWith('UklGR')) return 'image/webp'
        return ''
      },
      sanitizeBase64: (raw) => {
        if (!raw || typeof raw !== 'string') return ''
        let cleaned = raw.trim()
        if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith('\'') && cleaned.endsWith('\''))) {
          try { cleaned = JSON.parse(cleaned) } catch {}
        }
        cleaned = String(cleaned).replace(/^data:[^;]+;base64,/, '')
        return cleaned.replace(/[^A-Za-z0-9+/=]/g, '')
      },
      extractBase64: (payload) => {
        let mime = '', dataUri = '', base64 = ''
        if (payload == null) return { base64, mime, dataUri }
        if (typeof payload === 'string') {
          const trimmed = payload.trim()
          if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith('\'') && trimmed.endsWith('\''))) {
            try {
              const unwrapped = JSON.parse(trimmed)
              if (typeof unwrapped === 'string') return imageUtils.extractBase64(unwrapped)
            } catch {}
          }
          if (trimmed.startsWith('data:')) {
            dataUri = trimmed
            const match = trimmed.match(/^data:([^;]+);base64,(.*)$/)
            if (match) { mime = match[1]; base64 = match[2] }
            return { base64, mime, dataUri }
          }
          base64 = imageUtils.sanitizeBase64(trimmed)
          return { base64, mime, dataUri }
        }
        const candidates = [payload.base64Image, payload.base64, payload.data, payload.image, payload.base64EncodedImage]
        for (const c of candidates) { if (typeof c === 'string' && c.trim()) return imageUtils.extractBase64(c) }
        mime = payload.imageType || payload.mimeType || payload.contentType || mime
        const anyString = Object.values(payload).find((v) => typeof v === 'string')
        if (anyString) return imageUtils.extractBase64(anyString)
        return { base64, mime, dataUri }
      }
    }

    const cacheKey = cacheKeyForUrl('https://api.thinkindiasvnit.in/glimpses', 'glimpses-v1')

    const run = async () => {
      try {
        const res = await fetch('https://api.thinkindiasvnit.in/glimpses', {
          method: 'GET', headers: { 'Accept': 'application/json' }, signal: controller.signal
        })
        if (!res.ok) return
        const listRaw = await res.json()
        const list = Array.isArray(listRaw) ? listRaw : []
        const first = list.find((ev) => ev?.imageId != null || ev?.imageID != null || ev?.image_id != null || ev?.imageid != null)
        const imageId = first?.imageId ?? first?.imageID ?? first?.image_id ?? first?.imageid
        const alt = first?.name || first?.eventName || 'Glimpse'
        if (imageId == null) return
        const imgRes = await fetch(`https://api.thinkindiasvnit.in/image/${encodeURIComponent(imageId)}`, {
          method: 'GET', headers: { 'Accept': 'application/json, text/plain, */*' }, signal: controller.signal
        })
        if (!imgRes.ok) return
        const contentType = imgRes.headers.get('content-type') || ''
        let base64 = '', mime = '', dataUri = ''
        if (contentType.includes('application/json')) {
          const json = await imgRes.json()
          const ext = imageUtils.extractBase64(json)
          base64 = imageUtils.sanitizeBase64(ext.base64)
          mime = ext.mime || imageUtils.detectMime(base64) || 'image/jpeg'
          dataUri = ext.dataUri
        } else {
          const text = await imgRes.text()
          const maybeJson = text.trim()
          try {
            const parsed = JSON.parse(maybeJson)
            const ext = imageUtils.extractBase64(parsed)
            base64 = imageUtils.sanitizeBase64(ext.base64)
            mime = ext.mime || imageUtils.detectMime(base64) || 'image/jpeg'
            dataUri = ext.dataUri
          } catch {
            base64 = imageUtils.sanitizeBase64(maybeJson)
            mime = imageUtils.detectMime(base64) || 'image/jpeg'
          }
        }
        const src = dataUri || (base64 ? `data:${mime};base64,${base64}` : '')
        if (!cancelled && src) {
          localCacheSet(cacheKey, [{ src, alt }], 15 * 60 * 1000)
        }
      } catch {}
    }

    run()
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
      try { controller.abort() } catch {}
    }
  }, [])
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
