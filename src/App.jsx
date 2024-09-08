import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import html2canvas from "html2canvas"

import BlobShader from "./BlobShader"
import "./index.css"

function HtmlTexture({ htmlContent, setTexture }) {
  useEffect(() => {
    const renderHtmlToTexture = async () => {
      const element = document.getElementById("child")
      if (element) {
        const canvas = await html2canvas(element)
        const texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true
        setTexture(texture)
      }
    }

    renderHtmlToTexture() // Trigger the texture update when the content changes
  }, [htmlContent, setTexture]) // Depend on `htmlContent` changes

  return null
}

export default function App() {
  const textureRef = useRef()
  const [htmlContent, setHtmlContent] = useState("initial") // Track HTML content change

  return (
    <>
      <div id="child">
        <ul>
          <li>
            <a href="https://www.youtube.com/watch?v=QXb8siKy3dc&feature=youtu.be">
              Youtube
            </a>
          </li>
          <li>
            <a href="https://open.spotify.com/artist/3zTm668ZXG1rJzFN3puF6y?si=FSvv5fUSRFGnZfstDsj_4Q">
              Spotify
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/end_rick/?hl=de">Instagram</a>
          </li>
          <li>
            <a href="https://endrick.bandcamp.com/releases">Bandcamp</a>
          </li>
          <li>
            <a href="mailto:mail@christianhohenbild.de">Contact</a>
          </li>
          <li>
            <a href="about.htm">About</a>
          </li>
          <li id="newsletter-form">
            <a>Newsletter</a>
            <form id="subscribe-form">
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="email address"
              />
              <button type="submit">Subscribe</button>
            </form>
          </li>
        </ul>
      </div>

      <button onClick={() => setHtmlContent("updated")}>
        Update HTML Content
      </button>

      <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
        {/* Render the HTML as a texture */}
        <HtmlTexture
          htmlContent={htmlContent}
          setTexture={(texture) => (textureRef.current = texture)}
        />
        {/* Pass the texture to the shader */}
        {textureRef.current && <BlobShader map={textureRef.current} />}
      </Canvas>
    </>
  )
}
