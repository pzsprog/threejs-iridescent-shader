import config from '../assets/config.js'
import FS from './frag.js'
import MAP_FRAGMENT from './map_fragment.js'

// Load 3D Scene
var scene = new THREE.Scene();

// Load Camera Perspektive
var camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 20000);
let polar = config.cametaPitch // fixed vertical pitch
let dist = config.cameraDist; // camera distance
let deg = config.modelRotate; // default rotation

// model / camera positioning
let cam_x = 0;
let cam_y = dist * (Math.sin((Math.PI/2) - polar));
let cam_z = dist * (Math.cos((Math.PI/2) - polar));
const axis = new THREE.Vector3(0, 1, 0).normalize();
const calc = new THREE.Vector3(0, cam_y, cam_z);
let cameraQuaternion = new THREE.Quaternion();
cameraQuaternion.setFromAxisAngle(axis, THREE.Math.degToRad(deg));
calc.applyQuaternion(cameraQuaternion);
camera.position.set(calc.x, calc.y, calc.z);

// Load a Renderer
const canvas = document.querySelector('#canvas');
var renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Model rotation plugin setup
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; // disable zooming
controls.enablePan = false; // disable 'right mouse click' navig
controls.minPolarAngle = controls.maxPolarAngle = polar;

// Lights - ambient
var ambientLight = new THREE.AmbientLight(config.spotLightColor, config.amibientLightBrightness);
scene.add(ambientLight);

// Lights - top light
let topLight = new THREE.PointLight(0xffffff, config.topLightBrightness);
topLight.castShadow = true;
topLight.shadow.mapSize.width = 1024; // 512
topLight.shadow.mapSize.height = 1024; // 512
topLight.shadow.camera.near = 0.5;
topLight.shadow.camera.far = 100;
topLight.castShadow = true;
topLight.position.set(config.topLightPoz.x, config.topLightPoz.y, config.topLightPoz.z);

// Lights - bottom
let bottomLight = new THREE.PointLight(0xffffff, config.frontalLightBrightness);
bottomLight.position.set(config.frontalLightPoz.x, config.frontalLightPoz.y, config.frontalLightPoz.z);

// Lights - grouping (for rotation)
var lightHolder = new THREE.Group();
scene.add(topLight);
lightHolder.add(bottomLight);
scene.add(lightHolder);

// Display some 'gizmos' helping on pos lights
if(config.showLightGelperGizmos) {
    const topLightHelper = new THREE.PointLightHelper(topLight);
    const bottomLightHelper = new THREE.PointLightHelper(bottomLight);
    scene.add(topLightHelper);
    scene.add(bottomLightHelper);
}

// glTf 2.0 Loader
var textureLoader = new THREE.TextureLoader();
var gltfLoader = new THREE.GLTFLoader();
gltfLoader.load('./assets/model.gltf', function (gltf) {

    var object = gltf.scene;
    let scalemultiplier = config.modelScale;
    gltf.scene.scale.set(scalemultiplier,scalemultiplier,scalemultiplier);
    gltf.scene.position.x = 0; //Position (x = right+ left-) 
    gltf.scene.position.y = 0; //Position (y = up+, down-)
    gltf.scene.position.z = 0; //Position (z = front +, back-)

    gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            // normal map OFF
            child.material.normalMap = null;
            child.material.onBeforeCompile = function (shader) {
                // SHADER UNIFORMS
                shader.uniforms.hologram = { type: "t", value: textureLoader.load("./assets/hologram.png") };
                // VERTEX SHADER override
                shader.vertexShader = 'varying vec2 f_uv;\n' + 'varying vec3 f_normal;\n' + 'varying vec3 f_position;\n' + shader.vertexShader;
                shader.vertexShader = shader.vertexShader.replace(
                    '#include <worldpos_vertex>',
                    [
                        '#include <worldpos_vertex>'
                        , 'f_uv = uv;'
                        , 'f_normal = normal;'
                        , 'f_position = position;'
                    ].join('\n')
                );
                // FRAGMENT SHADER override
                shader.fragmentShader = FS + shader.fragmentShader;
                shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', MAP_FRAGMENT);
            };
        }
    });

    let model = gltf.scene;
    model.castShadow = true;
    model.receiveShadow = true;
    scene.add(model);
});

function animate() {
    render();
    requestAnimationFrame(animate);
}

function render() {
    // dont move lights with orbitcontrol
    lightHolder.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
}

render();
animate();

// window resize
window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}