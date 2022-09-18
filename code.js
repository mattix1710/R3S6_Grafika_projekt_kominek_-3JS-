///////////////////////////////////
// GLOBAL VARIABLES
//

var fov = {fovValue: 25};

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
    // TODO: delete before release
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
    // LIMITS:
    // X value: (0.05 - 0.65)
    // Y value: (0.1 - 0.7)
    // Z value: (-0.1 - 0.2)

    // STARTING:
    // X value: (0.1 - 0.6)
    // Y value: (0.1)
    // Z value: (-0.1 - 0.2)
    const PARTICLE_X_MIN = 0.05;
    const PARTICLE_X_MAX = 0.65;
    const PARTICLE_Y_MIN = 0.15;
    const PARTICLE_Y_MAX = 0.6;
    const PARTICLE_Z_MIN = -0.1;
    const PARTICLE_Z_MAX = 0.15;
    const PARTICLE_X_MEAN = (PARTICLE_X_MAX + PARTICLE_X_MIN) / 2;

    const PARTICLE_LIMIT_X_MIN = PARTICLE_X_MIN - 0.05;
    const PARTICLE_LIMIT_X_MAX = PARTICLE_X_MAX + 0.05;
    const PARTICLE_LIMIT_Y_MIN = PARTICLE_Y_MIN;
    const PARTICLE_LIMIT_Y_MAX = 0.7;
    const PARTICLE_LIMIT_Z_MIN = PARTICLE_Z_MIN;
    const PARTICLE_LIMIT_Z_MAX = PARTICLE_Z_MAX;

    const rIle = 1200
    var rSpeed = 0.1
    var rWidth = 1
    var rHeight = 0.7

    // time intervals (in seconds)
    const PARTICLE_TTL = 3.5;
    const INTERVAL_TTL = 0.1;

    function normalRand(min, max){
        if(min > max){
            var aux = min;
            min = max;
            max = aux;
        }

        return Math.random() * (max-min) + min;
    }

    function rand(min, max) {
        min = parseInt(min, 10);
        max = parseInt(max, 10);

        if (min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }

        return (Math.random() * (max - min + 0.05) + min);
    }

    function rand2(min, max) {
        min = parseInt(min, 10);
        max = parseInt(max, 10);

        if (min > max) {
            var tmp = min;
            min = max;
            max = tmp;
        }

        return (Math.random() * (max - min + 0.75) + min);
    }

    function Fire() {
        var material = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: normalRand(0.3, 0.7),
            depthWrite: false,
            wireframe: false,
            blending: THREE
                .AdditiveBlending // kluczowy element zapewniający mieszanie kolorów poszczególnych cząsteczek
        });
        var particles = []
        var particlesTTL = []
        var intervalTTL = 0.0;
        var newInterval = true;
        var particleXvector = 0.0;

        function generate(ilosc) {
            while (particles.length) {
                scene.remove(particles.shift())
            }
            for (var i = 0; i < ilosc; i++) {
                var size = rand(0.01, 0.05)
                var particle = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), material.clone())
                particle.position.set(normalRand(PARTICLE_X_MIN, PARTICLE_X_MAX), PARTICLE_Y_MIN, rand(PARTICLE_Z_MIN, PARTICLE_Z_MAX));
                scene.add(particle)
                particles.push(particle)
                particlesTTL.push(PARTICLE_TTL);
            }

            intervalTTL = INTERVAL_TTL;

        }
        generate(rIle)

        function resetParticle(index){
            particles[index].position.y = PARTICLE_Y_MIN;
            particles[index].position.x = normalRand(PARTICLE_X_MIN, PARTICLE_X_MAX);
            particles[index].position.z = normalRand(PARTICLE_Z_MIN, PARTICLE_Z_MAX);
            particles[index].material.opacity = normalRand(0.3, 0.7);
            particlesTTL[index] = PARTICLE_TTL;
        }

        // function update(speed, width, height) {
        //     for (var i = 0; i < particles.length; i++) {
        //         if (particles[i].position.y < height) {
        //             particles[i].position.y += rand(0.01, 0.6);
        //             particles[i].material.opacity -= 0.02;
        //         } else {
        //             particles[i].material.opacity = 1;
        //             particles[i].position.y = 0;
        //             particles[i].position.x = rand2(-0.175 , 0.55)
        //             console.log(particles[i].position.x)
        //         }
        //         if (particles[i].position.y > height / 2) {
        //             if (particles[i].position.x > 0.35)
        //                 particles[i].position.x -= 0.02
        //             else
        //                 particles[i].position.x += 0.02
        //         }
        //     }
        // }

        // new UPDATE
        function update(speed, width, height, delta){
            for(var i = 0; i < particles.length; i++){
                // console.log(normalRand(0.3, 0.7));
                // count TTL of a particle
                particlesTTL[i] -= delta/1000;
                
                // if a particle has exceeded its life (TTL)
                // delete it and create a new one
                if(particlesTTL[i] < 0.0 ||
                    particles[i].position.y >= PARTICLE_LIMIT_Y_MAX ||
                    particles[i].material.opacity <= 0.0){
                    resetParticle(i);
                }

                particles[i].position.y += rand(0.01, 0.6) * speed * (delta/16);
                particles[i].material.opacity -= normalRand(0.001, 0.007);

                if(newInterval){
                    // particleXvector = normalRand(-0.01, 0.01);
                    if(particles[i].position.x < PARTICLE_X_MEAN)
                        particles[i].position.x += normalRand(-0.01, 0.02);
                    else if(particles[i].position.x >= PARTICLE_X_MEAN)
                        particles[i].position.x += normalRand(-0.02, 0.01);
                }

                // if particle would go over the given limit
                if(particles[i].position.x <= PARTICLE_LIMIT_X_MIN){
                    particles[i].position.x = PARTICLE_LIMIT_X_MIN + normalRand(0.0, 0.02);
                } else if(particles[i].position.x >= PARTICLE_LIMIT_X_MAX){
                    particles[i].position.x = PARTICLE_LIMIT_X_MAX - normalRand(0.0, 0.02);
                } else if(particles[i].position.z <= PARTICLE_LIMIT_Z_MIN){
                    particles[i].position.z = PARTICLE_LIMIT_Z_MIN + normalRand(0.0, 0.02);
                } else if(particles[i].position.z >= PARTICLE_LIMIT_Z_MAX){
                    particles[i].position.z = PARTICLE_LIMIT_Z_MAX - normalRand(0.0, 0.02);
                }

                // particles[i].position.x += particleXvector;

            }

            intervalTTL -= delta/1000;
            newInterval = false;
            if(intervalTTL <= 0){
                intervalTTL = INTERVAL_TTL;
                newInterval = true;
            }
        }



        this.generate = function (val) {
            generate(val);
        }
        this.update = function (speed, width, height, delta) {
            update(speed, width, height, delta);
        }
    }
    var f = new Fire();


    var rotationH = 0;
    var rotationV = -11;
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
        // sphere.position.set(posXsphere, posYsphere, posZsphere);
        light.position.set(posXsphere, posYsphere, posZsphere);
        // console.log("LIGHT POS (", posXsphere, posYsphere, posZsphere, ")");
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

    let be = Date.now(), delta = 0;

    var renderLoop = function(){
        let now = Date.now();
        delta = (now - be);
        be = now;


        setCamera();
        setLightPos();
        f.update(rSpeed,rWidth,rHeight, delta);
        renderer.render(scene, camera);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

main();