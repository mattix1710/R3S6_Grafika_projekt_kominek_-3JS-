///////////////////////////////////
// GLOBAL VARIABLES
//

var fov = {fovValue: 60};

// var candle = {
//     positionStyle  : Type.SPHERE,
//     positionBase   : new THREE.Vector3( 0, 50, 0 ),
//     positionRadius : 2,
    
//     velocityStyle  : Type.CUBE,
//     velocityBase   : new THREE.Vector3(0,100,0),
//     velocitySpread : new THREE.Vector3(20,0,20),
    
//     particleTexture : THREE.ImageUtils.loadTexture( 'images/smokeparticle.png' ),
    
//     sizeTween    : new Tween( [0, 0.3, 1.2], [20, 150, 1] ),
//     opacityTween : new Tween( [0.9, 1.5], [1, 0] ),
//     colorTween   : new Tween( [0.5, 1.0], [ new THREE.Vector3(0.02, 1, 0.5), new THREE.Vector3(0.05, 1, 0) ] ),
//     blendStyle : THREE.AdditiveBlending,  
    
//     particlesPerSecond : 60,
//     particleDeathAge   : 1.5,		
//     emitterDeathAge    : 60
// }

/////////////////////////////////////
// ALL THE IMPORTANT FUNCTIONS
//

/**
 * Setting up the renderer scene
 */
function main(){
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov.fovValue, window.innerWidth / window.innerHeight, 0.1, 30000);    
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
    // ----------------------
    // ranges of particle positions
    // X value: (0.1 - 0.6)
    // Y value: (0.1 - 0.6)
    // Z value: (0.1 - 0.25)
    var particleXmin = 0.1;
    var particleXmax = 0.6;
    var particleYmin = 0.1;
    var particleYmax = 0.6;
    var particleZmin = 0.1;
    var particleZmax = 0.25;


    var pm = new THREE.ParticleBasicMaterial();
    pm.map = THREE.ImageUtils.loadTexture("./res/particle.png");
    pm.blending = THREE.AdditiveBlending;
    pm.transparent = true;
    pm.size = 0.3;
    pm.vertexColors = true;

    //creating simple particle system
    var targetGeometry = new THREE.Geometry();
    const WIDTH = 25;
    const HEIGHT = 25;

    for(var i = 0; i < WIDTH; i++){
        for(var j = 0; j < HEIGHT; j++){
            let xPos = Math.random()%(particleXmax - particleXmin) + particleXmin;
            let yPos = Math.random()%(particleYmax - particleYmin) + particleYmin;
            let zPos = Math.random()%(particleZmax - particleZmin) + particleZmin;

            //var v = new THREE.Vector3(i/2-(WIDTH/2)/2, 0, j/2-(HEIGHT/2)/2);
            var v = new THREE.Vector3(xPos, yPos, zPos);
            targetGeometry.vertices.push(v);
            targetGeometry.colors.push(new THREE.Color(Math.random() * 0xFFFFFF));
        }
    }

    var ps = new THREE.ParticleSystem(targetGeometry, pm);
    ps.name = 'ps';
    scene.add(ps);


    var rotationH = 0;
    var rotationV = 0;
    var distance = 10;

    // initial values - somewhere near the center of a chimney
    var posXsphere = 0.35;
    var posYsphere = 0.3;
    var posZsphere = 0.3;
    const constDiff = 0.1;


    function onDocumentKeyDown(event){
        var keyCode = event.which;

        // A - rotate LEFT
        if(keyCode == 68) rotationH -= 1;
        // D - rotate RIGHT
        if(keyCode == 65) rotationH += 1;
        // W - rotate UP
        if(keyCode == 87) rotationV += 1;
        // S - rotate DOWN
        if(keyCode == 83) rotationV -= 1;



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
        camera.rotation.y = Math.PI/180 * rotationH;
        camera.rotation.x = Math.PI/180 * rotationV;
    }

    function setLightPos(){
        //sphere.position.set(posXsphere, posYsphere, posZsphere);
        light.position.set(posXsphere, posYsphere, posZsphere);
        //console.log("LIGHT POS (", posXsphere, posYsphere, posZsphere, ")");
    }

    ///////////////////////////////////
    // GUI controls

    function updateCameraFOV(){
        camera.fov = fov.fovValue;
        camera.updateProjectionMatrix();        // used for updating FOV of camera
    }

    const gui = new lil.GUI();
    gui.add(fov, 'fovValue', 24, 70, 1).name('FOV').onChange( updateCameraFOV );
    //gui.add(camera.rotation.x).name('Rotation vertical');

    // EOF GUI controls
    ///////////////////////////////////

    var renderLoop = function(){
        setCamera();
        setLightPos();
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

main();