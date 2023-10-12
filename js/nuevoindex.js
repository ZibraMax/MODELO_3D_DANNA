import * as THREE from "./build/three.module.js";
import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm";
import { OrbitControls } from "./build/OrbitControls.js";

import { MTLLoader } from "./build/MTLLoader.js";
import { OBJLoader } from "./build/OBJLoader.js";
import { GLTFLoader } from "./build/GLTFLoader.js";
let camera, scene, renderer, group;
THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
const styleElement = document.createElement("style");
document.body.appendChild(styleElement);
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
const container = document.createElement("div");
document.body.appendChild(container);
const loaderIcon = document.getElementById("LOADER");
const loaderIcon2 = document.getElementById("loadingContainer");
init();
const controls = new OrbitControls(camera, container);
controls.target.set(0, 0, 0);
controls.update();
const themes = {
	Default: {},
	"Transparent background": {
		...{
			"--gui-background-color": "#f6f6f6",
			"--gui-text-color": "#3d3d3d",
			"--gui-title-background-color": "#efefef",
			"--gui-title-text-color": "#3d3d3d",
			"--gui-widget-color": "#eaeaea",
			"--gui-hover-color": "#f0f0f0",
			"--gui-focus-color": "#fafafa",
			"--gui-number-color": "#07aacf",
			"--gui-string-color": "#8da300",
			"--focus-color": "#dc2c41",
		},
		"--backbround-color": "transparent",
		emmisive: true,
	},
	Light: {
		"--gui-background-color": "#f6f6f6",
		"--gui-text-color": "#3d3d3d",
		"--gui-title-background-color": "#efefef",
		"--gui-title-text-color": "#3d3d3d",
		"--gui-widget-color": "#eaeaea",
		"--gui-hover-color": "#f0f0f0",
		"--gui-focus-color": "#fafafa",
		"--gui-number-color": "#07aacf",
		"--gui-string-color": "#8da300",
		"--focus-color": "#dc2c41",
		emmisive: true,
	},
	Dark: {
		"--gui-background-color": "#1f1f1f",
		"--gui-text-color": "#ebebeb",
		"--gui-title-background-color": "#111111",
		"--gui-title-text-color": "#ebebeb",
		"--gui-widget-color": "#424242",
		"--gui-hover-color": "#4f4f4f",
		"--gui-focus-color": "#595959",
		"--gui-number-color": "#2cc9ff",
		"--gui-string-color": "#a2db3c",
		"--focus-color": "var(--gui-focus-color)",
		"--plot-grid-color": "#616161",
	},
	"Solarized Light": {
		"--gui-background-color": "#fdf6e3",
		"--gui-text-color": "#657b83",
		"--gui-title-background-color": "#f5efdc",
		"--gui-title-text-color": "#657b83",
		"--gui-widget-color": "#eee8d5",
		"--gui-hover-color": "#e7e1cf",
		"--gui-focus-color": "#e6ddc7",
		"--gui-number-color": "#2aa0f3",
		"--gui-string-color": "#97ad00",
		"--focus-color": "var(--gui-focus-color)",
	},
	"Solarized Dark": {
		"--gui-background-color": "#002b36",
		"--gui-text-color": "#b2c2c2",
		"--gui-title-background-color": "#001f27",
		"--gui-title-text-color": "#b2c2c2",
		"--gui-widget-color": "#094e5f",
		"--gui-hover-color": "#0a6277",
		"--gui-focus-color": "#0b6c84",
		"--gui-number-color": "#2aa0f2",
		"--gui-string-color": "#97ad00",
		"--focus-color": "var(--gui-focus-color)",
		"--plot-grid-color": "#616161",
	},
	Tennis: {
		"--gui-background-color": "#32405e",
		"--gui-text-color": "#ebe193",
		"--gui-title-background-color": "#713154",
		"--gui-title-text-color": "#ffffff",
		"--gui-widget-color": "#057170",
		"--gui-hover-color": "#057170",
		"--gui-focus-color": "#b74f88",
		"--gui-number-color": "#ddfcff",
		"--gui-string-color": "#ffbf00",
		"--focus-color": "var(--gui-focus-color)",
		"--plot-grid-color": "#616161",
	},
};

const settings = { theme: "Default", zoom: zoomExtents };

function updateStylesheet() {
	let style = "";
	const stylesheet = settings.theme;
	for (let prop in stylesheet) {
		const value = stylesheet[prop];
		style += `\t${prop}: ${value};\n`;
	}
	if (style) {
		style = ":root {\n" + style + "}";
		styleElement.innerHTML = style;
	} else {
		styleElement.innerHTML = "";
	}
}

function updateTheme() {
	updateStylesheet();
}

const gui = new GUI({ title: "Menu" });
const settingsFolder = gui.addFolder("Settings");

settingsFolder
	.add(settings, "theme", themes, "Default")
	.name("Theme")
	.listen()
	.onChange(updateTheme);

gui.close();

animate();

function afterLoad() {
	loaderIcon.style.display = "none";
	loaderIcon2.style.display = "none";
}

function zoomExtents() {
	let vFoV = camera.getEffectiveFOV();
	let hFoV = camera.fov * camera.aspect;

	let FoV = Math.min(vFoV, hFoV);
	let FoV2 = FoV / 2;

	let dir = new THREE.Vector3();
	camera.getWorldDirection(dir);
	let mesh = group.children[0];
	let bs = mesh.geometry.boundingSphere;
	let bsWorld = bs.center.clone();
	mesh.localToWorld(bsWorld);

	let th = (FoV2 * Math.PI) / 180.0;
	let sina = Math.sin(th);
	let R = bs.radius;
	let FL = R / sina;

	let cameraDir = new THREE.Vector3();
	camera.getWorldDirection(cameraDir);

	let cameraOffs = cameraDir.clone();
	cameraOffs.multiplyScalar(-FL * 5);
	let newCameraPos = bsWorld.clone().add(cameraOffs);

	camera.position.copy(newCameraPos);
	camera.lookAt(bsWorld);
	controls.target.copy(bsWorld);
	controls.update();
}

function init() {
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.00001,
		1000000
	);
	camera.position.z = 0;
	camera.position.x = 0;
	camera.position.y = -200;

	// scene

	scene = new THREE.Scene();

	const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
	scene.add(ambientLight);

	const pointLight = new THREE.PointLight(0xffffff, 0.8);
	camera.add(pointLight);
	scene.add(camera);

	// model

	const onProgress = function (xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = (xhr.loaded / xhr.total) * 100;
			console.log(Math.round(percentComplete, 2) + "% downloaded");
			loaderIcon2.innerHTML =
				"Loading... " + Math.round(percentComplete, 2) + "%";
		}
	};

	new MTLLoader()
		.setPath("resources/Ensamble_con_tanques/")
		.load("Ensamble_con_tanques.mtl", function (materials) {
			materials.preload();

			new OBJLoader()
				.setMaterials(materials)
				.setPath("resources/Ensamble_con_tanques/")
				.load(
					"Ensamble_con_tanques.obj",
					function (object) {
						group = object;
						scene.add(object);

						render();
						afterLoad();
						zoomExtents();
					},
					onProgress
				);
		});
	// const loader = new GLTFLoader().setPath("resources/LUIS/");
	// loader.load(
	// 	"ggg.glb",
	// 	function (gltf) {
	//         gltf.scene.rotation.x -= 3.141592654 / 4;
	// 		scene.add(gltf.scene);
	// 		render();
	// 		group = gltf.scene;
	// 		zoomExtents();
	// 		afterLoad();
	// 	},
	// 	onProgress
	// );

	//

	renderer = new THREE.WebGLRenderer({
		container,
		antialias: true,
		alpha: true,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	//

	window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
	mouseX = (event.clientX - windowHalfX) / 2;
	mouseY = (event.clientY - windowHalfY) / 2;
}

//

function animate() {
	requestAnimationFrame(animate);

	render();
}

function render() {
	renderer.render(scene, camera);
}
settingsFolder.add(settings, "zoom").name("Initial view");
