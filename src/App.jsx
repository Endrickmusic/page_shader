import { Canvas, useThree, useFrame, createPortal } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { Text, useFBO } from "@react-three/drei"
import html2canvas from "html2canvas"

import BlobShader from "./BlobShader"
import "./index.css"

function InteractiveLink({ url, text, position }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Text
      fontSize={0.1}
      color={hovered ? "yellow" : "white"}
      position={position}
      onClick={() => window.open(url, "_blank")}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  )
}

function GradientBackground() {
  // Create a blue to yellow gradient texture
  const canvas = document.createElement("canvas")
  canvas.width = 1
  canvas.height = 256
  const ctx = canvas.getContext("2d")
  const gradient = ctx.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, "blue")
  gradient.addColorStop(1, "yellow")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 1, 256)
  const texture = new THREE.CanvasTexture(canvas)

  return (
    <mesh>
      <planeGeometry args={[2, 5]} position={[0, 0, -0.1]} />
      <meshBasicMaterial attach="material" map={texture} />
    </mesh>
  )
}

function Buffer({ children, ...props }) {
  const planeRef = useRef()
  const buffer = useFBO()
  const viewport = useThree((state) => state.viewport)
  const [scene] = useState(() => new THREE.Scene())

  useFrame((state) => {
    // Render the FBO scene to the buffer texture
    state.gl.setRenderTarget(buffer)
    state.gl.render(scene, state.camera)
    state.gl.setRenderTarget(null) // Reset render target to the main scene

    // If you want to do something special with the plane, like rotate it, you can do that here
    if (planeRef.current) {
      // planeRef.current.rotation.y += 0.01 // Example of rotating the plane
    }
  })

  return (
    <>
      {createPortal(children, scene)}

      <mesh ref={planeRef}>
        <planeGeometry args={[3, 3]} /> {/* Plane with 3x3 units*/}
        <meshBasicMaterial side={THREE.DoubleSide} map={buffer.texture} />
        {/* Apply the FBO texture */}
      </mesh>
      <BlobShader map={buffer.texture} />
    </>
  )
}

export default function App() {
  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
        <Buffer>
          {/* Gradient background */}
          <GradientBackground />

          {/* List of Links */}
          <InteractiveLink
            url="https://www.youtube.com/watch?v=QXb8siKy3dc&feature=youtu.be"
            text="Youtube"
            position={[0, 0.6, 0]}
          />
          <InteractiveLink
            url="https://open.spotify.com/artist/3zTm668ZXG1rJzFN3puF6y?si=FSvv5fUSRFGnZfstDsj_4Q"
            text="Spotify"
            position={[0, 0.4, 0]}
          />
          <InteractiveLink
            url="https://www.instagram.com/end_rick/?hl=de"
            text="Instagram"
            position={[0, 0.2, 0]}
          />
          <InteractiveLink
            url="https://endrick.bandcamp.com/releases"
            text="Bandcamp"
            position={[0, 0, 0]}
          />
          <InteractiveLink
            url="mailto:mail@christianhohenbild.de"
            text="Contact"
            position={[0, -0.2, 0]}
          />
          <InteractiveLink
            url="about.htm"
            text="About"
            position={[0, -0.4, 0]}
          />

          {/* Newsletter */}
          <Text
            fontSize={0.1}
            color="white"
            position={[0, -0.6, 0]}
            anchorX="center"
            anchorY="middle"
          >
            Newsletter
          </Text>
        </Buffer>
      </Canvas>
    </>
  )
}
