import React from 'react'

// Simple male head SVG: square jaw, short hair, light stubble. Still accepts an optional imageSrc clipped into the face.
export default function Character({ shirtColor = '#c62828', pantsColor = '#1f1f1f', hairColor = '#3b2412', size = 160, imageSrc }){
  const width = size
  const height = Math.round(size * 1.6)
  const faceClipId = `face-clip-${Math.abs(Math.floor(Math.random()*1e9))}`

  return (
    <div className="avatar-container" style={{width, height}}>
      <svg width={width} height={height} viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
        <defs>
          <linearGradient id="hood-grad" x1="0" x2="1">
            <stop offset="0%" stopColor={shirtColor} />
            <stop offset="100%" stopColor="#8a0" />
          </linearGradient>
          <radialGradient id="skin-grad" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#f0ceb2" />
            <stop offset="100%" stopColor="#d9a97a" />
          </radialGradient>
          <clipPath id={faceClipId}><ellipse cx="100" cy="120" rx="52" ry="64" /></clipPath>
        </defs>

        {/* hoodie */}
        <path d="M18 86 C18 40, 182 40, 182 86 L160 180 L40 180 Z" fill="url(#hood-grad)" stroke="#240" strokeOpacity="0.12" />

        {/* hair */}
        <path d="M64 86 C78 48, 122 48, 136 86 C120 76, 100 72, 86 76 C72 72, 52 76, 64 86 Z" fill={hairColor} />

        {/* face */}
        <g clipPath={`url(#${faceClipId})`}>
          <rect x="48" y="56" width="104" height="144" rx="48" fill="url(#skin-grad)" />
          {imageSrc && (
            <image href={imageSrc} x="48" y="56" width="104" height="144" preserveAspectRatio="xMidYMid slice" />
          )}
        </g>

        {/* jaw / chin to make it masculine */}
        <path d="M70 184 C92 206, 108 206, 130 184 L130 170 L70 170 Z" fill="#d39a72" opacity="0.95" />

        {/* stubble */}
        <g fill="#5b3a2a" opacity="0.9">
          <circle cx="95" cy="168" r="1.8" />
          <circle cx="105" cy="168" r="1.6" />
          <circle cx="98" cy="174" r="1.6" />
        </g>

        {/* sunglasses (optional) - kept subtle */}
        <rect x="72" y="112" rx="6" ry="6" width="36" height="20" fill="#0f0f0f" opacity="0.95" />
        <rect x="92" y="112" rx="6" ry="6" width="36" height="20" fill="#0f0f0f" opacity="0.95" />

        {/* torso */}
        <rect x="40" y="200" rx="10" width="120" height="64" fill={shirtColor} />
      </svg>
    </div>
  )
}
