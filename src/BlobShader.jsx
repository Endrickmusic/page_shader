import React, { useRef, useMemo, useEffect, useCallback } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useCubeTexture, useTexture, useFBO } from "@react-three/drei"
import { useControls, Leva } from "leva"
import * as THREE from "three"
import vertexShader from "./shaders/vertexShader.js"
import fragmentShader from "./shaders/fragmentShader.js"

// Create shader material outside of component to prevent recompilation
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  transparent: true,
  uniforms: {
    uCamPos: { value: new THREE.Vector3() },
    uCamToWorldMat: { value: new THREE.Matrix4() },
    uCamInverseProjMat: { value: new THREE.Matrix4() },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uResolution: { value: new THREE.Vector2() },
    uTexture: { value: null },
    uNoiseTexture: { value: null },
    iChannel0: { value: null },
    uSpeed: { value: 0.5 },
    uIOR: { value: 0.84 },
    uCount: { value: 3 },
    uReflection: { value: 1.5 },
    uSize: { value: 0.005 },
    uDispersion: { value: 0.03 },
    uRefractPower: { value: 0.15 },
    uChromaticAberration: { value: 0.5 },
  },
})

export default function BlobShader({ map }) {
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

  useEffect(() => {
    const handleResize = () => {
      shaderMaterial.uniforms.uResolution.value
        .set(viewport.width, viewport.height)
        .multiplyScalar(Math.min(window.devicePixelRatio, 2))
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [viewport])

  const cameraForwardPos = useMemo(() => new THREE.Vector3(), [])
  const mouseVector = useMemo(() => new THREE.Vector2(), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    mouseVector.set(mousePosition.current.x, mousePosition.current.y)
    shaderMaterial.uniforms.uMouse.value = mouseVector
    shaderMaterial.uniforms.uTime.value = time * controls.speed

    Object.entries(controls).forEach(([key, value]) => {
      const uniformName = `u${key.charAt(0).toUpperCase() + key.slice(1)}`
      if (shaderMaterial.uniforms[uniformName]) {
        shaderMaterial.uniforms[uniformName].value = value
      }
    })

    camera.getWorldDirection(cameraForwardPos).multiplyScalar(camera.near)
    cameraForwardPos.add(camera.position)
    meshRef.current.position.copy(cameraForwardPos)
    meshRef.current.rotation.copy(camera.rotation)

    shaderMaterial.uniforms.uCamPos.value.copy(camera.position)
    shaderMaterial.uniforms.uCamToWorldMat.value.copy(camera.matrixWorld)
    shaderMaterial.uniforms.uCamInverseProjMat.value.copy(
      camera.projectionMatrixInverse
    )

    gl.setRenderTarget(buffer)
    gl.setClearColor("#d8d7d7")
    gl.render(scene, camera)
    gl.setRenderTarget(null)
  })

  useEffect(() => {
    shaderMaterial.uniforms.uTexture.value = map
    shaderMaterial.uniforms.uNoiseTexture.value = noiseTexture
    shaderMaterial.uniforms.iChannel0.value = cubeTexture
  }, [map, noiseTexture, cubeTexture])

  const nearPlaneWidth = useMemo(
    () =>
      camera.near *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
      camera.aspect *
      2,
    [camera]
  )
  const nearPlaneHeight = useMemo(
    () => nearPlaneWidth / camera.aspect,
    [nearPlaneWidth, camera]
  )

  return (
    <>
      <Leva hidden />
      <mesh ref={meshRef} scale={[nearPlaneWidth, nearPlaneHeight, 1]}>
        <planeGeometry args={[1, 1]} />
        <primitive object={shaderMaterial} />
      </mesh>
    </>
  )
}
