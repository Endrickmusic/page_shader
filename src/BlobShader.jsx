import { useCubeTexture, useTexture, useFBO } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo, useEffect, useCallback } from "react"
import { useControls } from "leva"
import vertexShader from "./shaders/vertexShader.js"
import fragmentShader from "./shaders/fragmentShader.js"
import { Vector2, Vector3, MathUtils } from "three"

export default function Shader({ map }) {
  const meshRef = useRef()
  const buffer = useFBO()
  const { viewport, scene, camera, gl } = useThree()

  const mousePosition = useRef({ x: 0, y: 0 })

  const updateMousePosition = useCallback((e) => {
    mousePosition.current = { x: e.pageX, y: e.pageY }
  }, [])

  const noiseTexture = useTexture("./textures/noise.png")
  const cubeTexture = useCubeTexture(
    ["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
    { path: "./cubemap/potsdamer_platz/" }
  )

  const controls = useControls({
    reflection: { value: 1.5, min: 0.01, max: 6.0, step: 0.1 },
    speed: { value: 0.5, min: 0.01, max: 3.0, step: 0.01 },
    IOR: { value: 0.84, min: 0.01, max: 1.0, step: 0.01 },
    count: { value: 3, min: 1, max: 20, step: 1 },
    size: { value: 0.005, min: 0.001, max: 0.5, step: 0.001 },
    dispersion: { value: 0.03, min: 0.0, max: 0.1, step: 0.001 },
    refract: { value: 0.15, min: 0.0, max: 2.0, step: 0.1 },
    chromaticAberration: { value: 0.5, min: 0.0, max: 5.0, step: 0.1 },
  })

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition, false)
    return () => {
      window.removeEventListener("mousemove", updateMousePosition, false)
    }
  }, [updateMousePosition])

  const cameraForwardPos = useMemo(() => new Vector3(), [])
  const mouseVector = useMemo(() => new Vector2(), [])

  useFrame((state) => {
    const {
      material: { uniforms },
    } = meshRef.current
    const time = state.clock.getElapsedTime()

    mouseVector.set(mousePosition.current.x, mousePosition.current.y)
    uniforms.uMouse.value = mouseVector
    uniforms.uTime.value = time * controls.speed

    Object.entries(controls).forEach(([key, value]) => {
      if (uniforms[`u${key.charAt(0).toUpperCase() + key.slice(1)}`]) {
        uniforms[`u${key.charAt(0).toUpperCase() + key.slice(1)}`].value = value
      }
    })

    camera.getWorldDirection(cameraForwardPos).multiplyScalar(camera.near)
    cameraForwardPos.add(camera.position)
    meshRef.current.position.copy(cameraForwardPos)
    meshRef.current.rotation.copy(camera.rotation)

    gl.setRenderTarget(buffer)
    gl.setClearColor("#d8d7d7")
    gl.render(scene, camera)
    gl.setRenderTarget(null)
  })

  const uniforms = useMemo(
    () => ({
      uCamPos: { value: camera.position },
      uCamToWorldMat: { value: camera.matrixWorld },
      uCamInverseProjMat: { value: camera.projectionMatrixInverse },
      uTime: { value: 1.0 },
      uMouse: { value: new Vector2(0, 0) },
      uResolution: {
        value: new Vector2(viewport.width, viewport.height).multiplyScalar(
          Math.min(window.devicePixelRatio, 2)
        ),
      },
      uTexture: { value: map },
      uNoiseTexture: { value: noiseTexture },
      iChannel0: { value: cubeTexture },
      uSpeed: { value: controls.speed },
      uIOR: { value: controls.IOR },
      uCount: { value: controls.count },
      uReflection: { value: controls.reflection },
      uSize: { value: controls.size },
      uDispersion: { value: controls.dispersion },
      uRefractPower: { value: controls.refract },
      uChromaticAberration: { value: controls.chromaticAberration },
    }),
    [viewport.width, viewport.height, map, noiseTexture, cubeTexture, controls]
  )

  const nearPlaneWidth = useMemo(
    () =>
      camera.near *
      Math.tan(MathUtils.degToRad(camera.fov / 2)) *
      camera.aspect *
      2,
    [camera]
  )
  const nearPlaneHeight = useMemo(
    () => nearPlaneWidth / camera.aspect,
    [nearPlaneWidth, camera]
  )

  return (
    <mesh ref={meshRef} scale={[nearPlaneWidth, nearPlaneHeight, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
      />
    </mesh>
  )
}
