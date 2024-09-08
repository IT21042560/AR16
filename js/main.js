import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/OBJLoader.js";

// Create a Three.js scene
const scene = new THREE.Scene();

// Create a camera and set its position
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50; // Adjust the z position if needed

// Create a renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// Instantiate a loader for the .obj file
const loader = new OBJLoader();

// Load the .obj file
let object;
loader.load(
  'models/model.obj', // Ensure this path is correct
  function (obj) {
    object = obj;
    scene.add(object);
    object.position.set(0, 0, 0); // Center the model
    object.scale.set(5, 5, 5); // Adjust the scale
    changeObjectColor(object, 0x228b22); // Change color to your desired color
    console.log('Model loaded successfully');
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error('Error loading model:', error);
  }
);

// Function to change the color of the object
function changeObjectColor(object, colorHex) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set(colorHex);
      child.material.needsUpdate = true;
    }
  });
}

// Create a video element for the camera feed
const video = document.createElement('video');
video.autoplay = true;
video.style.display = 'none'; // Hide the video element

// Access the rear camera
navigator.mediaDevices.getUserMedia({
  video: { facingMode: { exact: 'environment' } } // Request the rear camera
})
  .then((stream) => {
    video.srcObject = stream; // Set the video source to the camera stream
    const videoTexture = new THREE.VideoTexture(video); // Create a texture from the video feed
    scene.background = videoTexture; // Set the video texture as the scene background
    video.addEventListener('loadeddata', () => {
      console.log('Video feed loaded.');
    });
  })
  .catch((err) => {
    console.error("Error accessing the camera:", err);
  });

// Set up camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Handle device orientation
window.addEventListener('deviceorientation', (event) => {
  if (object) {
    // Convert device orientation values to radians
    const alpha = THREE.MathUtils.degToRad(event.alpha);
    const beta = THREE.MathUtils.degToRad(event.beta);
    const gamma = THREE.MathUtils.degToRad(event.gamma);

    // Apply rotation to the object
    object.rotation.y = alpha;  // Rotate around Y-axis
    object.rotation.x = beta;   // Rotate around X-axis
    object.rotation.z = gamma;  // Rotate around Z-axis
  }
}, true);

// Render the scene
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  // Render the scene
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation loop
animate();