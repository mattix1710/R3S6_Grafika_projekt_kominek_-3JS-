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
    const renderer = new THREE.WebGLRenderer({antialias: true});             // renderer - coś w rodzaju naszego płótna (canvas)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);  // sharpening image after antialiasing
    document.body.appendChild( renderer.domElement );       // dodajemy renderer do naszego pliku HTML

    document.addEventListener("keydown", onDocumentKeyDown, false);     //adding event

    camera.position.z = 10;
    camera.position.y = 2;
    camera.rotation.x = 0;

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

    var rotation = 0;
    var distance = 10;
    

    function onDocumentKeyDown(event){
        var keyCode = event.which;

        //A - rotate LEFT
        if(keyCode == 65) rotation -= 1;
        //D - rotate RIGHT
        if(keyCode == 68) rotation += 1;
    }

    function setCameraPos(){
        var posZ = Math.cos(rotation * Math.PI/180) * distance;
        var posX = -Math.sin(rotation * Math.PI/180) * distance;
        camera.position.x = posX;
        camera.position.z = posZ;
        
        camera.lookAt(0,0,0);
    }

    var renderLoop = function(){
        setCameraPos();
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

main();