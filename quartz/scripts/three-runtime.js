import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "https://unpkg.com/three@0.160.0/examples/jsm/loaders/STLLoader.js";

function initScene(container) {
  const config = JSON.parse(decodeURIComponent(container.dataset.config));

  // Scene
  const scene = new THREE.Scene();
  if (config.scene?.backgroundColor === "transparent") {
    scene.background = null;
  } else if (config.scene?.backgroundColor) {
    scene.background = new THREE.Color(`#${config.scene.backgroundColor}`);
  } else {
    scene.background = new THREE.Color(0x111111);
  }

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Camera
  const camCfg = config.camera || {};
  const camPos = camCfg.camPosXYZ || [0, 5, 10];
  let camera;
  if (camCfg.orthographic) {
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.OrthographicCamera(-aspect * 5, aspect * 5, 5, -5, 0.1, 1000);
  } else {
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  }
  camera.position.set(...camPos);
  if (camCfg.LookatXYZ) camera.lookAt(...camCfg.LookatXYZ);

  // Orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = config.scene?.orbitControlDamping ?? true;

  // Lights
  if (config.lights) {
    config.lights.forEach(lightCfg => {
      let light;
      if (lightCfg.type === "directional") {
        light = new THREE.DirectionalLight(`#${lightCfg.color}`, lightCfg.strength || 1);
        light.position.set(...lightCfg.pos);
        light.target.position.set(...(lightCfg.target || [0,0,0]));
        if (lightCfg.castShadows) light.castShadow = true;
      } else if (lightCfg.type === "ambient") {
        light = new THREE.AmbientLight(`#${lightCfg.color}`, lightCfg.strength || 1);
      }
      if (light) scene.add(light);
    });
  }

  // Ground helper / shadows (optional)
  if (config.scene?.showGroundShadows) {
    const planeGeo = new THREE.PlaneGeometry(100, 100);
    const planeMat = new THREE.ShadowMaterial({ opacity: 0.2 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = 0;
    plane.receiveShadow = true;
    scene.add(plane);
  }

  // Helpers
  if (config.scene?.showAxisHelper) {
    const axis = new THREE.AxesHelper(config.scene.length || 5);
    scene.add(axis);
  }
  if (config.scene?.showGridHelper) {
    const grid = new THREE.GridHelper(config.scene.gridSize || 10);
    scene.add(grid);
  }

  // Load models
  const objLoader = new OBJLoader();
  const stlLoader = new STLLoader();

  if (config.models) {
    config.models.forEach(m => {
      const ext = m.name.split(".").pop().toLowerCase();
      const path = `/models/${m.name}`;
      const scale = m.scale ?? 1;
      const pos = m.position ?? [0,0,0];
      const rot = m.rotation ?? [0,0,0];

      if (ext === "obj") {
        objLoader.load(path, obj => {
          obj.scale.set(scale, scale, scale);
          obj.position.set(...pos);
          obj.rotation.set(...rot);
          scene.add(obj);
        });
      } else if (ext === "stl") {
        stlLoader.load(path, geom => {
          const material = new THREE.MeshStandardMaterial({
            color: parseInt(config.stl?.stlColorHexString || "606060", 16),
            wireframe: config.stl?.stlWireframe ?? false
          });
          const mesh = new THREE.Mesh(geom, material);
          mesh.scale.set(scale, scale, scale);
          mesh.position.set(...pos);
          mesh.rotation.set(...rot);
          scene.add(mesh);
        });
      }
    });
  }

  // Animation
  function animate() {
    requestAnimationFrame(animate);
    if (config.scene?.autoRotation) {
      scene.rotation.x += config.scene.autoRotation[0] || 0;
      scene.rotation.y += config.scene.autoRotation[1] || 0;
      scene.rotation.z += config.scene.autoRotation[2] || 0;
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

// Initialize all scenes
document.querySelectorAll(".threejs-scene").forEach(initScene);