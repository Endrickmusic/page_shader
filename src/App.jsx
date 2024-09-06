import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"

import "./index.css"

import Experience from "./Experience"

export default function App() {
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

      <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
        <Environment files="./textures/envmap.hdr" />
        <color attach="background" args={["#eeeeee"]} />
        <Experience />
      </Canvas>
    </>
  )
}
