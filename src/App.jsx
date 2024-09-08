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

const InteractiveLink = React.memo(({ url, text, position }) => {
  const [hovered, setHovered] = useState(false)

  const handlePointerOver = useCallback(() => setHovered(true), [])
  const handlePointerOut = useCallback(() => setHovered(false), [])
  const handleClick = useCallback(() => window.open(url, "_blank"), [url])

  return (
    <Text
      fontSize={0.2}
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

const GradientBackground = React.memo(({ width, height, color1, color2 }) => {
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

  return (
    <mesh>
      <planeGeometry args={[width, height]} position={[0, 0, -1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
})

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
    url: "https://www.youtube.com/watch?v=QXb8siKy3dc&feature=youtu.be",
    text: "Youtube",
    y: 0.6,
  },
  {
    url: "https://open.spotify.com/artist/3zTm668ZXG1rJzFN3puF6y?si=FSvv5fUSRFGnZfstDsj_4Q",
    text: "Spotify",
    y: 0.4,
  },
  {
    url: "https://www.instagram.com/end_rick/?hl=de",
    text: "Instagram",
    y: 0.2,
  },
  { url: "https://endrick.bandcamp.com/releases", text: "Bandcamp", y: 0 },
  { url: "mailto:mail@christianhohenbild.de", text: "Contact", y: -0.2 },
  { url: "about.htm", text: "About", y: -0.4 },
]

export default function App() {
  return (
    <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
      <Buffer>
        <GradientBackground
          width={24}
          height={10}
          color1="black"
          color2="white"
        />
        <GradientBackground
          width={1.4}
          height={1.7}
          color1="blue"
          color2="yellow"
        />
        {links.map((link, index) => (
          <InteractiveLink key={index} {...link} position={[0, link.y, 0]} />
        ))}
        <Text
          fontSize={0.2}
          color="black"
          position={[0, -0.6, 0]}
          anchorX="center"
          anchorY="middle"
        >
          Newsletter
        </Text>
      </Buffer>
    </Canvas>
  )
}
