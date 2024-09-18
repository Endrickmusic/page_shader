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

const InteractiveLink = React.memo(({ url, text, position, onClick }) => {
  const [hovered, setHovered] = useState(false)
  const handlePointerOver = useCallback(() => setHovered(true), [])
  const handlePointerOut = useCallback(() => setHovered(false), [])
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      if (onClick) {
        onClick()
      } else if (url) {
        window.open(url, "_blank")
      }
    },
    [url, onClick]
  )

  return (
    <Text
      font="/fonts/open-sans-condensed-v14-latin-300.woff"
      fontSize={0.15}
      color={hovered ? "#FFD500" : "#000000"}
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
const ImprintText = () => {
  const { viewport } = useThree()
  const maxWidth = Math.max(viewport.width * 0.3, 1.2)
  return (
    <Text
      font="/fonts/open-sans-condensed-v14-latin-300.woff"
      fontSize={0.05}
      maxWidth={maxWidth}
      lineHeight={1.5}
      color="#000000"
      anchorX="center"
      anchorY="middle"
    >
      {`Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
Christian Hohenbild
Gleditschstr. 71
0170 751 85 25
post@endrick.de

Streitschlichtung:
Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.

Haftung für Inhalte:
Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.`}
    </Text>
  )
}

const BackLink = ({ onClick }) => (
  <InteractiveLink
    text="Back"
    position={[0, -0.75, 0]}
    url="#"
    onClick={onClick}
  />
)

export default function App() {
  const [showImprint, setShowImprint] = useState(false)

  const toggleImprint = useCallback(() => {
    setShowImprint((prev) => !prev)
  }, [])

  return (
    <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
      <Buffer>
        <GradientBackground
          color1="#000000"
          color2="#FFFFFF"
          scaleX={1}
          scaleY={1}
        />
        {showImprint ? (
          <>
            <GradientBackground
              color1="#EB34E1"
              color2="#34EBA1"
              scaleX={0.35}
              scaleY={0.6}
              minWidth={1.6}
              minHeight={1.8}
            />
            <ImprintText />
            <BackLink onClick={toggleImprint} />
          </>
        ) : (
          <>
            <GradientBackground
              color1="#FFD500"
              color2="#0000FF"
              scaleX={0.14}
              scaleY={0.28}
              minWidth={0.8}
              minHeight={1.4}
            />
            {links.map((link, index) => (
              <InteractiveLink
                key={index}
                {...link}
                position={[0, link.y, 0]}
                onClick={link.text === "About" ? toggleImprint : undefined}
              />
            ))}
          </>
        )}
      </Buffer>
    </Canvas>
  )
}
