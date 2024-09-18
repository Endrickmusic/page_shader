import { Canvas, useThree, useFrame, createPortal } from "@react-three/fiber"
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  memo,
} from "react"
import * as THREE from "three"
import { Text, useFBO } from "@react-three/drei"

import BlobShader from "./BlobShader"
import "./index.css"

// Import the JSON font file
// import sans from "/fonts/Open_Sans_Condensed_Light_Regular.json"

const InteractiveLink = React.memo(({ url, text, position }) => {
  const [hovered, setHovered] = useState(false)

  const handlePointerOver = useCallback(() => setHovered(true), [])
  const handlePointerOut = useCallback(() => setHovered(false), [])
  const handleClick = useCallback(() => window.open(url, "_blank"), [url])

  return (
    <Text
      font="/fonts/open-sans-condensed-v14-latin-300.woff"
      fontSize={0.17}
      color={hovered ? "yellow" : "black"}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  )
})

const GradientBackground = React.memo(
  ({ color1, color2, scaleX = 1, scaleY = 1, minWidth = 0, minHeight = 0 }) => {
    const { viewport } = useThree()

    const texture = useMemo(() => {
      const canvas = document.createElement("canvas")
      canvas.width = 256
      canvas.height = 1
      const ctx = canvas.getContext("2d")
      const gradient = ctx.createLinearGradient(0, 0, 256, 0)
      gradient.addColorStop(0, color1)
      gradient.addColorStop(1, color2)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 256, 1)
      return new THREE.CanvasTexture(canvas)
    }, [color1, color2])

    const width = Math.max(viewport.width * scaleX, minWidth)
    const height = Math.max(viewport.height * scaleY, minHeight)

    return (
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    )
  }
)

function Buffer({ children }) {
  const planeRef = useRef()
  const buffer = useFBO()
  const { viewport, gl, camera } = useThree()

  const bufferScene = useMemo(() => new THREE.Scene(), [])

  useFrame(() => {
    gl.setRenderTarget(buffer)
    gl.render(bufferScene, camera)
    gl.setRenderTarget(null)
  })

  return (
    <>
      {createPortal(children, bufferScene)}
      <mesh ref={planeRef}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={buffer.texture} />
      </mesh>
      <BlobShader map={buffer.texture} />
    </>
  )
}

const links = [
  {
    url: "https://www.instagram.com/end_rick/?hl=de",
    text: "Instagram",
    y: 0.5,
  },
  {
    url: "https://www.youtube.com/@end_rick/shorts",
    text: "Youtube",
    y: 0.1,
  },
  {
    url: "https://open.spotify.com/artist/3zTm668ZXG1rJzFN3puF6y?si=FSvv5fUSRFGnZfstDsj_4Q",
    text: "Spotify",
    y: 0.3,
  },
  { url: "https://endrick.bandcamp.com/releases", text: "Bandcamp", y: -0.1 },
  { url: "mailto:mail@christianhohenbild.de", text: "Contact", y: -0.3 },
  { url: "about.htm", text: "About", y: -0.5 },
]

export default function App() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
      <Buffer>
        <GradientBackground
          color1="#000000"
          color2="#FFFFFF"
          scaleX={1}
          scaleY={1}
        />
        <GradientBackground
          color1="#FFD500"
          color2="#0000FF"
          scaleX={0.16}
          scaleY={0.28}
          minWidth={0.8} // Minimum width in Three.js units
          minHeight={1.4} // Minimum height in Three.js units
        />
        {links.map((link, index) => (
          <InteractiveLink key={index} {...link} position={[0, link.y, 0]} />
        ))}
        {/* <Text
          fontSize={0.2}
          color="black"
          position={[0, -0.6, 0]}
          anchorX="center"
          anchorY="middle"
        >
          Newsletter
        </Text> */}
      </Buffer>
    </Canvas>
  )
}
