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
    const renderer = new THREE.WebGLRenderer({antialias: true});        // renderer - coś w rodzaju naszego płótna (canvas)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);  // sharpening image after antialiasing
    document.body.appendChild( renderer.domElement );       // dodajemy renderer do naszego pliku HTML

    document.addEventListener("keydown", onDocumentKeyDown, false);     // adding event

    camera.position.z = 15;
    camera.position.y = 1;
    camera.rotation.x = 0;

//     var controls = new THREE.OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.25;
// controls.enableZoom = true;

    {
        const color = 0xFFFF9D;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        // position: X, Y, Z
        light.position.set(5, 2, 4);
        scene.add(light);
    }

    // // creating a box
    // const boxWidth = 1;
    // const boxHeight = 1;
    // const boxDepth = 1;
    // const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    // const material = new THREE.MeshLambertMaterial({color: 0x44aa88});
    // const cube = new THREE.Mesh(geometry, material);

    // scene.add(cube);

    ///////////////////////////////////
    // adding whole room model

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('/models/');

    // loading 'mtl' - material files of object exported file
    mtlLoader.load('scene.mtl', function(materials){
        materials.preload();

        // for each item in materials array - set DoubleSide parameter
        // source of information: https://threejs.org/manual/#en/materials
        for(const material of Object.values(materials.materials)){
            material.side = THREE.DoubleSide;
        }

        // loading objects from obj file generated from Blender
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('/models/');
        objLoader.load('scene.obj', function(object){
            scene.add(object);
            object.position.y = 0;
        });
    });



    // END OF adding whole room model
    ///////////////////////////////////

    const dir = new THREE.Vector3( 5, 0, 0 );
    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    const origin = new THREE.Vector3( 0, 0, 0 );
    const length = 5;
    const hex = 0xffff00;

    const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
    scene.add( arrowHelper );

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
        //setCameraPos();
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

main();