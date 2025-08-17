// three.js 本体を import
import * as THREE from "three";

// OrbitControls も同じく import
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// canvas を取得
const canvas = document.getElementById("canvas");

// シーン
const scene = new THREE.Scene();

// サイズ
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// カメラ
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 3000);
camera.position.set(0, 0, 100);
scene.add(camera);

// レンダラー
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

// コントローラー
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// デモ用の立方体
const geometry = new THREE.BoxGeometry(20, 20, 20);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// リサイズ対応
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

// アニメーション
const animate = () => {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
};
animate();