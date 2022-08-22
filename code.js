import * as THREE from './lib/three.module.js';

/////////////////////////////////////
// ALL THE IMPORTANT FUNCTIONS
//

/**
 * Setting up the renderer scene
 */
function main(){
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(24, window.innerWidth / window.innerHeight, 0.1, 1000);    
                                            // ogniskowa, proporcja ekranu, [najbliższy, najdalszy] punkt widoczny w kamerze

    //const canvas = document.querySelector('#fireplaceView');
    const renderer = new THREE.WebGLRenderer();             // renderer - coś w rodzaju naszego płótna (canvas)
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement );       // dodajemy renderer do naszego pliku HTML

    document.addEventListener("keydown", onDocumentKeyDown, false);     //adding event

    camera.position.z = 10;

    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // creating a box
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const material = new THREE.MeshLambertMaterial({color: 0x44aa88});
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);

    var ySpeed = 0.1;

    function onDocumentKeyDown(event){
        var keyCode = event.which;
        if(keyCode == 65) cube.rotation.y -= ySpeed;        //A - rotate LEFT
        if(keyCode == 68) cube.rotation.y += ySpeed;        //D - rotate RIGHT
    }

    var renderLoop = function(){
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

main();