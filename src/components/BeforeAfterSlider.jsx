import { useState, useRef, useEffect } from 'react'

/**
 * Slider drag/touch avant/après pour comparer 2 images au même cadrage.
 * Accessible clavier : flèches gauche/droite (5%) + Home/End.
 *
 * Props :
 *  - beforeSrc, afterSrc : URLs des images
 *  - beforeAlt, afterAlt : descriptions a11y
 *  - initialPosition : 0-100, défaut 50
 */
export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Avant',
  afterAlt = 'Après',
  initialPosition = 50,
}) {
  const [position, setPosition] = useState(initialPosition)
  const containerRef = useRef(null)
  const draggingRef = useRef(false)

  const updateFromClientX = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(pct)
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      updateFromClientX(clientX)
    }
    const onUp = () => { draggingRef.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { setPosition((p) => Math.max(0, p - 5)); e.preventDefault() }
    else if (e.key === 'ArrowRight') { setPosition((p) => Math.min(100, p + 5)); e.preventDefault() }
    else if (e.key === 'Home') { setPosition(0); e.preventDefault() }
    else if (e.key === 'End') { setPosition(100); e.preventDefault() }
  }

  const startDrag = (e) => {
    draggingRef.current = true
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    updateFromClientX(clientX)
  }

  return (
    <div
      ref={containerRef}
      className="ba-slider"
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      role="slider"
      aria-label="Comparer avant/après — utilisez les flèches du clavier pour ajuster"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <img className="ba-slider-img ba-slider-after" src={afterSrc} alt={afterAlt} />
      <div className="ba-slider-clip" style={{width: `${position}%`}}>
        <img className="ba-slider-img" src={beforeSrc} alt={beforeAlt} style={{width: `${10000 / Math.max(position, 1)}%`}} />
      </div>
      <div
        className="ba-slider-handle"
        style={{left: `${position}%`}}
        aria-hidden="true"
      >
        <span className="ba-slider-handle-knob" />
      </div>
      <span className="ba-slider-label ba-slider-label-before">Avant</span>
      <span className="ba-slider-label ba-slider-label-after">Après</span>
    </div>
  )
}
