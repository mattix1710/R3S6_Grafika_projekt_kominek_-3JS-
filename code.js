///////////////////////////////////
// GLOBAL VARIABLES
//

var fov = {FOV: 60};

/////////////////////////////////////
// ALL THE IMPORTANT FUNCTIONS
//

/**
 * Setting up the renderer scene
 */
function main(){
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov.FOV, window.innerWidth / window.innerHeight, 0.1, 30000);    
                                            // ogniskowa, proporcja ekranu, [najbliższy, najdalszy] punkt widoczny w kamerze

    //const canvas = document.querySelector('#fireplaceView');
    const renderer = new THREE.WebGLRenderer({antialias: true});        // renderer - coś w rodzaju naszego płótna (canvas)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);  // sharpening image after antialiasing
    document.body.appendChild( renderer.domElement );       // dodajemy renderer do naszego pliku HTML

    document.addEventListener("keydown", onDocumentKeyDown, false);     // adding event

    camera.position.z = 3;
    camera.position.y = 1;
    camera.position.x = 0.5;
    camera.rotation.x = Math.PI/180*(-5);

    {
        // adding background

        // TODO: all in one array??

        let materialArray = [];
        let backgroundFront = new THREE.TextureLoader().load('/res/night_sky_Front.jpg');
        let backgroundBack  = new THREE.TextureLoader().load('/res/night_sky_Back.jpg');
        let backgroundUp    = new THREE.TextureLoader().load('/res/night_sky_Top.jpg');
        let backgroundDown  = new THREE.TextureLoader().load('/res/night_sky_Bottom.jpg');
        let backgroundRight = new THREE.TextureLoader().load('/res/night_sky_Right.jpg');
        let backgroundLeft  = new THREE.TextureLoader().load('/res/night_sky_Left.jpg');

        materialArray.push(new THREE.MeshBasicMaterial({map: backgroundFront}));
        materialArray.push(new THREE.MeshBasicMaterial({map: backgroundBack}));
        materialArray.push(new THREE.MeshBasicMaterial({map: backgroundUp}));
        materialArray.push(new THREE.MeshBasicMaterial({map: backgroundDown}));
        materialArray.push(new THREE.MeshBasicMaterial({map: backgroundRight}));
        materialArray.push(new THREE.MeshBasicMaterial({map: backgroundLeft}));

        for(let i = 0; i < 6; i++){
            materialArray[i].side = THREE.BackSide;
        }

        let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
        let skybox = new THREE.Mesh(skyboxGeo, materialArray);
        scene.add(skybox);
    }

    //{
        const color = 0xFFFF9D;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);//new THREE.DirectionalLight(color, intensity);
        // position: X, Y, Z
        light.position.set(0.35, 0.3, 0.3);
        scene.add(light);
    //}

    // adding light SPHERE helper
    // const geometrySphere = new THREE.SphereGeometry(0.05);
    // const materialSphere = new THREE.MeshLambertMaterial({color: 0xFFFF00});
    // const sphere = new THREE.Mesh(geometrySphere, materialSphere);
    // scene.add(sphere);

    ///////////////////////////////////
    // adding whole room model

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('/res/');

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
        objLoader.setPath('/res/');
        objLoader.load('scene.obj', function(object){
            scene.add(object);
            object.position.y = 0;
        });
    });

    // END OF adding whole room model
    ///////////////////////////////////


    ///////////////////////////////////
    // ADDING helper arrows to the scene

    const dir = new THREE.Vector3( 5, 0, 0 );
    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    const origin = new THREE.Vector3( 0, 0, 0 );
    const length = 2;
    const hex = 0xffff00;

    const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
    scene.add( arrowHelper );

    ///////////////////////////////////

    // TODO: create particle effect - flame
    // X value: (0.0 - 0.7)
    // Y value: (0.0 - 0.6)
    // Z value: (0.2 - 0.4)

    var rotation = 0;
    var distance = 10;

    // initial values - somewhere near the center of a chimney
    var posXsphere = 0.35;
    var posYsphere = 0.3;
    var posZsphere = 0.3;
    const constDiff = 0.1;


    function onDocumentKeyDown(event){
        var keyCode = event.which;

        //A - rotate LEFT
        if(keyCode == 65) rotation -= 1;
        //D - rotate RIGHT
        if(keyCode == 68) rotation += 1;

        // LIGHT POSITIONING
        //
        // Num 4 - go LEFT (-X)
        if(keyCode == 100) posXsphere -= constDiff;
        // Num 6 - go RIGHT (+X)
        if(keyCode == 102) posXsphere += constDiff;
        // Num 8 - go FORWARD (-Z)
        if(keyCode == 104) posZsphere -= constDiff;
        // Num 2 - go BACKWARD (+Z)
        if(keyCode == 98) posZsphere += constDiff;
        // Num - - go UP (-Y)
        if(keyCode == 109) posYsphere -= constDiff;
        // Num + - go DOWN (+Y)
        if(keyCode == 107) posYsphere += constDiff;
    }

    function setCamera(){
        // var posZ = Math.cos(rotation * Math.PI/180) * distance;
        // var posX = -Math.sin(rotation * Math.PI/180) * distance;
        // camera.position.x = posX;
        // camera.position.z = posZ;
        
        // camera.lookAt(0,0,0);
        camera.rotation.y = Math.PI/180 * rotation;
    }

    function setLightPos(){
        //sphere.position.set(posXsphere, posYsphere, posZsphere);
        light.position.set(posXsphere, posYsphere, posZsphere);
        //console.log("LIGHT POS (", posXsphere, posYsphere, posZsphere, ")");
    }

    var renderLoop = function(){
        setCamera();
        setLightPos();
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    }

    ///////////////////////////////////
    // GUI controls

    function updateCameraFOV(){
        camera.fov = fov.FOV;
        camera.updateProjectionMatrix();        // used for updating FOV of camera
    }

    const gui = new lil.GUI();
    gui.add(fov, 'FOV', 24, 70, 1).onChange( updateCameraFOV );

    requestAnimationFrame(renderLoop);
}

main();