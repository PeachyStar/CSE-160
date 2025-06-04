import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

let fountainModel, lampModel, benchModel, treeModel;

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();

    //make camera
    const fov = 75;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(-4, -0.1, 4);
    camera.lookAt(0, 0, -1); 
    
    //camera controls
    const controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(controls.object);
    var velocity = new THREE.Vector3();
    var direction = new THREE.Vector3();
    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;

    const keys = {
        'KeyW': 'moveForward',
        'KeyS': 'moveBackward',
        'KeyA': 'moveLeft',
        'KeyD': 'moveRight'
    };

    document.addEventListener('keydown', (event) => {
        if (keys[event.code] !== undefined) {
            eval(keys[event.code] + ' = true');
        }
    });

    document.addEventListener('keyup', (event) => {
        if (keys[event.code] !== undefined) {
            eval(keys[event.code] + ' = false');
        }
    });

    canvas.addEventListener('click', () => {
        controls.lock();
    });

    const aLight = new THREE.AmbientLight(0xffffff, 0.05)
    scene.add(aLight);

    const light = new THREE.HemisphereLight(0xfffff, 0x00000, 0.1);
    scene.add(light);

    //ground
    const groundSize = 100;
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('textures/ground.jpg'); 
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(50,50); 

    const groundMat = new THREE.MeshPhongMaterial({
        map: groundTexture,
        side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2; 
    ground.position.y = -2.5;
    ground.receiveShadow = true;
    scene.add(ground);

    //sky
    const skyloader = new THREE.CubeTextureLoader();
    const skyboxTexture = skyloader.load([
    'textures/nz.png',
    'textures/pz.png',
    'textures/py.png',
    'textures/ny.png',
    'textures/nx.png',
    'textures/px.png'
    ]);
    scene.background = skyboxTexture;

    //make objects
    const loadingManager = new THREE.LoadingManager();

    loadingManager.onLoad = () => {
    document.getElementById('loading-screen').style.display = 'none';
    };

    const loader = new GLTFLoader(loadingManager);
    loader.load('models/street_lamp.glb', (gltf) => {
        lampModel = gltf.scene;
        scene.add(lampModel);
        lampModel.position.set(-3, -2.52, -5);
        lampModel.scale.set(2,2,2);

        var color = 0xffe573;
        var intensity = 1.5;
        var distance = 0; //maximum range of the light
        var decay = 1.5; // the amount the light dims along the distance of the light. Default is 2.

        const light1 = new THREE.PointLight(color, intensity, distance, decay);
        light1.position.set(-0.15, 2.5, 0);
        light1.castShadow = true;
        lampModel.add(light1);

        const light2 = new THREE.PointLight(color, intensity, distance, decay);
        light2.position.set(0.15, 2.5, 0);
        light2.castShadow = true;
        lampModel.add(light2);

        const light3 = new THREE.PointLight(color, intensity, distance, decay);
        light3.position.set(0, 2.5, 0.15);
        light3.castShadow = true;
        lampModel.add(light3);

        const light4 = new THREE.PointLight(color, intensity, distance, decay);
        light4.position.set(0, 2.5, -0.15);
        light4.castShadow = true;
        lampModel.add(light4);
    });

    loader.load('models/fountain_ps1.glb', (gltf) => {
        fountainModel = gltf.scene;
        scene.add(fountainModel);
        fountainModel.position.set(0, -2.5, 0);
        fountainModel.rotation.set(0,Math.PI/6,0)
    });

    loader.load('models/a_bench.glb', (gltf) => {
        benchModel = gltf.scene;
        scene.add(benchModel);
        benchModel.scale.set(2.5,2.5,2.5);
        benchModel.position.set(0, -2.5, -5);
    });

    loader.load('models/tree_1.glb', (gltf) => {
        treeModel = gltf.scene;
        scene.add(treeModel);
        treeModel.position.set(3.5,-2.5,-5)

        let treeCount = 0;
        const maxTrees = 50;

        while (treeCount < maxTrees) {
            const x = Math.random() * 80 - 40;
            const z = Math.random() * 80 - 40;

            // Exclude area: x ∈ [-5, 5], z ∈ [-6.5, 1]
            if (x > -5 && x < 5 && z > -6.5 && z < 3) {
                continue;
            }

            const clone = treeModel.clone(true);
            clone.position.set(x, -2.5, z);
            clone.rotation.y = Math.random() * Math.PI;

            scene.add(clone);
            treeCount++;
        }
    });

    loader.load('models/grass.glb', (gltf) => {
        const grassModel = gltf.scene;

        grassModel.scale.set(0.01,0.005,0.01);

        // Place multiple random copies
        for (let i = 0; i < 200; i++) {
            const clone = grassModel.clone(true);
            const x = Math.random() * 80 - 40;
            const z = Math.random() * 80 - 40;

            clone.position.set(x, -2.5, z);
            clone.rotation.y = Math.random() * Math.PI;
            scene.add(clone);
        }
    });

    loader.load('models/moon_tears.glb', (gltf) => {
        const flowerModel = gltf.scene;

        flowerModel.scale.set(0.5,0.5,0.5);

        // Place multiple random copies
        for (let i = 0; i < 100; i++) {
            const clone = flowerModel.clone(true);
            const x = Math.random() * 80 - 40;
            const z = Math.random() * 80 - 40;

            clone.position.set(x, -2.5, z);
            clone.rotation.y = Math.random() * Math.PI;
            scene.add(clone);
        }
    });


    const waterTexture = textureLoader.load('textures/water.jpg');
    waterTexture.wrapS = THREE.RepeatWrapping;
    waterTexture.wrapT = THREE.RepeatWrapping;
    waterTexture.repeat.set(1, 5); // adjust to match the shape of your mesh

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({
        map: waterTexture,
        transparent: true,
        opacity: 0.7,
    });

    const water1 = new THREE.Mesh(geometry, material);
    water1.position.set(0, 1.0, -0.27);
    water1.scale.set(0.1, 0.6, 0.02);
    scene.add(water1);

    const water2 = new THREE.Mesh(geometry, material);
    water2.position.set(0.1, 0.35, 0.4);
    water2.scale.set(0.1, 1.2, 0.02);
    scene.add(water2);

    const water3 = new THREE.Mesh(geometry, material);
    water3.position.set(-0.2, -0.86, -0.7);
    water3.scale.set(0.1, 1.5, 0.02);
    scene.add(water3);

    let clock = new THREE.Clock();
    function render(time) {
        time *= 0.001; // Convert time to seconds

        waterTexture.offset.y += 0.01;

        // First-person movement
        const delta = clock.getDelta(); // Time since last frame (in seconds)

        velocity.set(0, 0, 0);
        direction.set(
            (moveRight ? 1 : 0) - (moveLeft ? 1 : 0),
            0,
            (moveBackward ? 1 : 0) - (moveForward ? 1 : 0)
        ).normalize();

        if (direction.length() > 0) {
            velocity.z = direction.z * 3.0 * delta;
            velocity.x = direction.x * 3.0 * delta;
            controls.moveRight(velocity.x);
            controls.moveForward(-velocity.z);
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();