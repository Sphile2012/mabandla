import { useEffect, useRef, useState } from 'react';

function polygon(THREE, points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  return shape;
}

function extrude(THREE, shape, material, depth = 0.18, bevel = 0.02) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 24,
  });
  geometry.translate(0, 0, -depth / 2);
  return new THREE.Mesh(geometry, material);
}

function bar(THREE, x1, y1, x2, y2, thickness, depth, material) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, thickness, depth), material);
  mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);
  mesh.rotation.z = Math.atan2(y2 - y1, x2 - x1);
  return mesh;
}

function makeEnvironment(THREE, renderer) {
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = new THREE.Scene();
  const image = document.createElement('canvas');
  image.width = 4;
  image.height = 256;
  const context = image.getContext('2d');
  if (!context) {
    generator.dispose();
    return null;
  }

  const gradient = context.createLinearGradient(0, 0, 0, image.height);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.48, '#aeb8d0');
  gradient.addColorStop(1, '#252d45');
  context.fillStyle = gradient;
  context.fillRect(0, 0, image.width, image.height);

  const texture = new THREE.CanvasTexture(image);
  texture.flipY = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  environment.add(new THREE.Mesh(
    new THREE.SphereGeometry(20, 32, 16),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide }),
  ));

  const addPanel = (x, y, z, width, height, brightness) => {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(brightness, brightness, brightness), side: THREE.DoubleSide }),
    );
    panel.position.set(x, y, z);
    panel.lookAt(0, 0, 0);
    environment.add(panel);
  };
  addPanel(-8, 5, 7, 8, 4, 6);
  addPanel(9, 3, 6, 6, 3, 4);
  addPanel(0, 9, 2, 10, 4, 3);

  const target = generator.fromScene(environment, 0.03);
  generator.dispose();
  return { scene: environment, target, texture };
}

function buildCrest(THREE, scene) {
  const materials = {
    blue: new THREE.MeshStandardMaterial({ color: 0x7194d3, metalness: 0.2, roughness: 0.3, envMapIntensity: 1.2 }),
    blueEdge: new THREE.MeshStandardMaterial({ color: 0x31558e, metalness: 0.34, roughness: 0.28, envMapIntensity: 1.3 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xc5b068, metalness: 0.68, roughness: 0.27, envMapIntensity: 1.5 }),
    paleGold: new THREE.MeshStandardMaterial({ color: 0xe1d18f, metalness: 0.45, roughness: 0.25, envMapIntensity: 1.2 }),
  };
  const crest = new THREE.Group();
  const parts = [];

  const addPart = (object, from, delay) => {
    const target = object.position.clone();
    object.position.copy(from);
    crest.add(object);
    parts.push({ object, target, from, delay });
  };

  const shield = new THREE.Group();
  shield.add(bar(THREE, -1.24, 0.45, 0, 0.92, 0.16, 0.2, materials.blue));
  shield.add(bar(THREE, 0, 0.92, 1.24, 0.45, 0.16, 0.2, materials.blue));
  shield.add(bar(THREE, -1.19, 0.47, -1.19, -0.68, 0.18, 0.2, materials.blue));
  shield.add(bar(THREE, 1.19, 0.47, 1.19, -0.68, 0.18, 0.2, materials.blue));
  shield.position.z = -0.04;
  addPart(shield, new THREE.Vector3(0, 0, -1.5), 0.12);

  const letter = new THREE.Shape();
  letter.moveTo(-0.34, -0.68);
  letter.lineTo(-0.07, -0.68);
  letter.lineTo(-0.07, -0.03);
  letter.lineTo(0.12, -0.03);
  letter.bezierCurveTo(0.56, -0.03, 0.56, 0.55, 0.12, 0.55);
  letter.lineTo(-0.34, 0.55);
  letter.closePath();
  const letterHole = new THREE.Path();
  letterHole.moveTo(-0.06, 0.31);
  letterHole.lineTo(0.1, 0.31);
  letterHole.bezierCurveTo(0.31, 0.31, 0.31, 0.13, 0.1, 0.13);
  letterHole.lineTo(-0.06, 0.13);
  letterHole.closePath();
  letter.holes.push(letterHole);
  const monogram = extrude(THREE, letter, materials.blue, 0.2, 0.025);
  monogram.position.set(0, -0.02, 0.34);
  addPart(monogram, new THREE.Vector3(0, 0, 1.8), 0.42);

  const sigma = new THREE.Group();
  sigma.add(bar(THREE, -0.13, 0.15, 0.13, 0.15, 0.045, 0.07, materials.blueEdge));
  sigma.add(bar(THREE, -0.13, -0.15, 0.13, -0.15, 0.045, 0.07, materials.blueEdge));
  sigma.add(bar(THREE, -0.12, 0.14, 0.04, 0, 0.045, 0.07, materials.blueEdge));
  sigma.add(bar(THREE, 0.04, 0, -0.12, -0.14, 0.045, 0.07, materials.blueEdge));
  sigma.position.set(-0.62, -0.12, 0.36);
  addPart(sigma, new THREE.Vector3(-1.6, 0, 0.6), 0.62);

  const multiply = new THREE.Group();
  multiply.add(bar(THREE, -0.09, -0.09, 0.09, 0.09, 0.045, 0.07, materials.blueEdge));
  multiply.add(bar(THREE, -0.09, 0.09, 0.09, -0.09, 0.045, 0.07, materials.blueEdge));
  multiply.position.set(0.62, -0.15, 0.36);
  addPart(multiply, new THREE.Vector3(1.6, 0, 0.6), 0.68);

  const book = new THREE.Group();
  const leftPage = polygon(THREE, [
    [-1.38, -0.58], [-0.68, -0.61], [-0.03, -0.91], [-0.03, -1.14], [-0.68, -0.95], [-1.38, -0.86],
  ]);
  const rightPage = polygon(THREE, [
    [1.38, -0.58], [0.68, -0.61], [0.03, -0.91], [0.03, -1.14], [0.68, -0.95], [1.38, -0.86],
  ]);
  book.add(extrude(THREE, leftPage, materials.blueEdge, 0.25, 0.018));
  book.add(extrude(THREE, rightPage, materials.blueEdge, 0.25, 0.018));
  const coverLeft = polygon(THREE, [
    [-1.42, -0.77], [-0.7, -0.82], [-0.03, -1.12], [-0.03, -1.3], [-0.7, -1.08], [-1.42, -1.01],
  ]);
  const coverRight = polygon(THREE, [
    [1.42, -0.77], [0.7, -0.82], [0.03, -1.12], [0.03, -1.3], [0.7, -1.08], [1.42, -1.01],
  ]);
  book.add(extrude(THREE, coverLeft, materials.blue, 0.26, 0.018));
  book.add(extrude(THREE, coverRight, materials.blue, 0.26, 0.018));
  const addPageLine = (points) => {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0.15)));
    book.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.018, 8, false), materials.paleGold));
  };
  addPageLine([[-1.34, -0.68], [-0.95, -0.65], [-0.55, -0.75], [-0.04, -1.02]]);
  addPageLine([[-1.25, -0.76], [-0.91, -0.73], [-0.53, -0.82], [-0.05, -1.08]]);
  addPageLine([[1.34, -0.68], [0.95, -0.65], [0.55, -0.75], [0.04, -1.02]]);
  addPageLine([[1.25, -0.76], [0.91, -0.73], [0.53, -0.82], [0.05, -1.08]]);
  addPart(book, new THREE.Vector3(0, -1.5, 0.5), 0.02);

  const crown = new THREE.Group();
  const crownShape = new THREE.Shape();
  crownShape.moveTo(-1.17, 1.08);
  crownShape.lineTo(-0.83, 0.87);
  crownShape.lineTo(-0.55, 1.06);
  crownShape.lineTo(-0.24, 0.84);
  crownShape.lineTo(0, 1.46);
  crownShape.lineTo(0.24, 0.84);
  crownShape.lineTo(0.55, 1.06);
  crownShape.lineTo(0.83, 0.87);
  crownShape.lineTo(1.17, 1.08);
  crownShape.lineTo(0.77, 0.79);
  crownShape.quadraticCurveTo(0, 0.64, -0.77, 0.79);
  crownShape.closePath();
  crown.add(extrude(THREE, crownShape, materials.gold, 0.18, 0.022));
  [[-0.55, 1.11], [0.55, 1.11]].forEach(([x, y]) => {
    const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 16), materials.paleGold);
    jewel.position.set(x, y, 0);
    crown.add(jewel);
  });
  const centerJewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), materials.paleGold);
  centerJewel.scale.set(0.9, 1.35, 0.7);
  centerJewel.position.set(0, 1.52, 0);
  crown.add(centerJewel);
  addPart(crown, new THREE.Vector3(0, 1.7, 0.5), 0.82);

  crest.position.y = -0.08;
  scene.add(crest);
  return { crest, parts };
}

export default function Crest3D() {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    import('three').then((THREE) => {
      if (disposed) return;
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch (error) {
        console.error('Could not initialize the 3D academy crest:', error);
        setUnavailable(true);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x445066, 0.7));

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.25);
      keyLight.position.set(-3, 4, 6);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0xffd98a, 0.8);
      rimLight.position.set(4, 1, -4);
      scene.add(rimLight);

      const environment = makeEnvironment(THREE, renderer);
      if (environment) scene.environment = environment.target.texture;
      const { crest, parts } = buildCrest(THREE, scene);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let frameId = null;
      let dragRotation = 0;
      let dragging = false;
      let lastX = 0;
      let elapsed = 0;

      const resize = () => {
        const { width, height } = stage.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
        const distanceByHeight = (3.4 / 2) / Math.tan(halfFov);
        const distanceByWidth = (3.2 / 2) / (Math.tan(halfFov) * camera.aspect);
        camera.position.set(0, 0, Math.max(distanceByHeight, distanceByWidth));
        camera.updateProjectionMatrix();
        if (reducedMotion) scheduleFrame();
      };

      const animate = (now) => {
        frameId = null;
        if (disposed) return;
        elapsed = (now - startTime) / 1000;
        parts.forEach(({ object, target, from, delay }) => {
          const progress = reducedMotion ? 1 : Math.min(Math.max((elapsed - delay) / 1.1, 0), 1);
          const eased = 1 - ((1 - progress) ** 3);
          object.position.lerpVectors(from, target, eased);
        });
        if (!dragging && !reducedMotion) dragRotation *= 0.96;
        crest.rotation.y = dragRotation + (reducedMotion ? 0 : Math.sin(elapsed * 0.7) * 0.22);
        crest.rotation.x = reducedMotion ? 0 : Math.sin(elapsed * 0.5) * 0.035;
        crest.position.y = -0.08 + (reducedMotion ? 0 : Math.sin(elapsed * 1.1) * 0.025);
        renderer.render(scene, camera);
        if (!reducedMotion || dragging) scheduleFrame();
      };

      const scheduleFrame = () => {
        if (frameId === null && !disposed) frameId = window.requestAnimationFrame(animate);
      };
      const startTime = performance.now();

      const onPointerDown = (event) => {
        dragging = true;
        lastX = event.clientX;
        canvas.setPointerCapture(event.pointerId);
        canvas.style.cursor = 'grabbing';
        scheduleFrame();
      };
      const onPointerMove = (event) => {
        if (!dragging) return;
        dragRotation += (event.clientX - lastX) * 0.012;
        lastX = event.clientX;
        scheduleFrame();
      };
      const onPointerUp = () => {
        dragging = false;
        canvas.style.cursor = 'grab';
        if (!reducedMotion) scheduleFrame();
      };

      const observer = window.ResizeObserver ? new window.ResizeObserver(resize) : null;
      if (observer) observer.observe(stage);
      else window.addEventListener('resize', resize);
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerUp);
      resize();
      scheduleFrame();

      const disposeResources = (root) => {
        const geometries = new Set();
        const usedMaterials = new Set();
        root.traverse((object) => {
          if (object.geometry) geometries.add(object.geometry);
          if (Array.isArray(object.material)) object.material.forEach((material) => usedMaterials.add(material));
          else if (object.material) usedMaterials.add(object.material);
        });
        geometries.forEach((geometry) => geometry.dispose());
        usedMaterials.forEach((material) => material.dispose());
      };

      cleanup = () => {
        if (frameId !== null) window.cancelAnimationFrame(frameId);
        if (observer) observer.disconnect();
        else window.removeEventListener('resize', resize);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerUp);
        disposeResources(scene);
        if (environment) {
          disposeResources(environment.scene);
          environment.texture.dispose();
          environment.target.dispose();
        }
        renderer.dispose();
      };
    }).catch((error) => {
      console.error('Could not load the 3D academy crest:', error);
      if (!disposed) setUnavailable(true);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <figure className="mx-auto w-full max-w-[560px]">
      <div
        ref={stageRef}
        className="relative mx-auto h-[min(86vw,560px,52svh)] w-[min(86vw,560px,52svh)] rounded-full bg-[radial-gradient(closest-side,rgba(201,154,46,0.22),transparent_72%)] dark:bg-[radial-gradient(closest-side,rgba(230,185,74,0.16),transparent_72%)] lg:h-[min(560px,58svh)] lg:w-[min(560px,58svh)]"
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Interactive 3D crest with a golden crown, navy shield, mathematics symbols and open book"
          className="absolute inset-0 block h-full w-full touch-pan-y cursor-grab active:cursor-grabbing"
          style={{ display: unavailable ? 'none' : 'block' }}
        />
        {unavailable && (
          <img
            src="/icon.svg"
            alt="Prince Math Academy crest"
            className="absolute inset-[12%] h-[76%] w-[76%] object-contain drop-shadow-[0_24px_32px_rgba(15,29,74,0.28)]"
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[7%] left-[22%] right-[22%] h-[4%] rounded-full bg-[radial-gradient(closest-side,rgba(15,29,74,0.28),transparent)] blur-md dark:bg-[radial-gradient(closest-side,rgba(0,0,0,0.55),transparent)]"
        />
      </div>
      <figcaption className="sr-only">Animated 3D academy crest. Drag to turn.</figcaption>
    </figure>
  );
}
