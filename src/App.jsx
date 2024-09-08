import { Canvas, useThree, useFrame, createPortal } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { Text, useFBO } from "@react-three/drei"

import BlobShader from "./BlobShader"
import "./index.css"

function InteractiveLink({ url, text, position }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Text
      fontSize={0.2}
      color={hovered ? "yellow" : "black"}
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

function GradientBackground({ width, height, color1, color2 }) {
  // Create a left-to-right gradient texture
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 1
  const ctx = canvas.getContext("2d")
  const gradient = ctx.createLinearGradient(0, 0, 256, 0)
  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 1)
  const texture = new THREE.CanvasTexture(canvas)

  return (
    <mesh>
      <planeGeometry args={[width, height]} position={[0, 0, -1]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

function Buffer({ children, ...props }) {
  const planeRef = useRef()
  const buffer = useFBO()
  const { viewport } = useThree()

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
        <planeGeometry args={[viewport.width, viewport.height]} />{" "}
        {/* Plane with 3x3 units*/}
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
          {/* Full-screen background with black to white gradient (left to right) */}
          <GradientBackground
            width={24}
            height={10}
            color1="black"
            color2="white"
            font={"/fonts/Open_Sans_Condensed_Light_Regular.json"}
          />

          {/* Smaller gradient background (blue to yellow) behind the links */}
          <GradientBackground
            width={1.4}
            height={1.7}
            color1="blue"
            color2="yellow"
          />

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
    </>
  )
}
