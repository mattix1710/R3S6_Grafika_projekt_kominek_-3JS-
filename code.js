//Global variable
var fov = {fovValue: 60};

// Setting up a render scene
function main(){
    const scene = new THREE.Scene();
     // ogniskowa, proporcja ekranu, [najbliższy, najdalszy] punkt widoczny w kamerze
    const camera = new THREE.PerspectiveCamera(fov.fovValue, window.innerWidth / window.innerHeight, 0.1, 30000);    

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
        let backgroundFront = new THREE.TextureLoader().load('res/night_sky_Front.jpg');
        let backgroundBack  = new THREE.TextureLoader().load('res/night_sky_Back.jpg');
        let backgroundUp    = new THREE.TextureLoader().load('res/night_sky_Top.jpg');
        let backgroundDown  = new THREE.TextureLoader().load('res/night_sky_Bottom.jpg');
        let backgroundRight = new THREE.TextureLoader().load('res/night_sky_Right.jpg');
        let backgroundLeft  = new THREE.TextureLoader().load('res/night_sky_Left.jpg');

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

    const color = 0xFFFF9D;
    const intensity = 1;
    const light = new THREE.PointLight(color, intensity);   //new THREE.DirectionalLight(color, intensity);
    // position: X, Y, Z
    light.position.set(0.35, 0.3, 0.3);
    scene.add(light);

    // adding whole room model
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('res/');

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
        objLoader.setPath('res/');
        objLoader.load('scene.obj', function(object){
            scene.add(object);
            object.position.y = 0;
        });
    });

    // end adding model room

    const dir = new THREE.Vector3( 5, 0, 0 );
    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    const PARTICLE_X_MIN = 0.05;
    const PARTICLE_X_MAX = 0.65;
    const PARTICLE_Y_MIN = 0.15;
    const PARTICLE_Z_MIN = -0.1;
    const PARTICLE_Z_MAX = 0.15;
    const PARTICLE_X_MEAN = (PARTICLE_X_MAX + PARTICLE_X_MIN) / 2;

    const PARTICLE_LIMIT_X_MIN = PARTICLE_X_MIN - 0.05;
    const PARTICLE_LIMIT_X_MAX = PARTICLE_X_MAX + 0.05;
    const PARTICLE_LIMIT_Y_MAX = 0.7;
    const PARTICLE_LIMIT_Z_MIN = PARTICLE_Z_MIN;
    const PARTICLE_LIMIT_Z_MAX = PARTICLE_Z_MAX;

    const DEVIATION_X_AXIS = {minDev: 0.01, maxDev: 0.02};

    const QUANTITY_P = {size: 1200};
    var rSpeed = 0.1
    var rWidth = 1
    var rHeight = 0.7

    // time intervals (in seconds)
    const PARTICLE_TTL = {inSec: 3.5};
    const INTERVAL_TTL = {inSec: 0.1};

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
                .AdditiveBlending // Most important element provides color mixing for individual particles
        });
        var particles = []
        var particlesTTL = []
        var intervalTTL = 0.0;
        var newInterval = true;

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
                particlesTTL.push(PARTICLE_TTL.inSec);
            }

            intervalTTL = INTERVAL_TTL.inSec;

        }
        generate(QUANTITY_P.size)

        function resetParticle(index){
            particles[index].position.y = PARTICLE_Y_MIN;
            particles[index].position.x = normalRand(PARTICLE_X_MIN, PARTICLE_X_MAX);
            particles[index].position.z = normalRand(PARTICLE_Z_MIN, PARTICLE_Z_MAX);
            particles[index].material.opacity = normalRand(0.3, 0.7);
            particlesTTL[index] = PARTICLE_TTL.inSec;
        }

        // Updating function for particles
        function update(speed, width, height, delta){
            for(var i = 0; i < particles.length; i++){
                particlesTTL[i] -= delta/1000;
                
                // if a particle has exceeded its life (TTL) delete it and create a new one
                if(particlesTTL[i] < 0.0 ||
                    particles[i].position.y >= PARTICLE_LIMIT_Y_MAX ||
                    particles[i].material.opacity <= 0.0){
                    resetParticle(i);
                }

                particles[i].position.y += rand(0.01, 0.6) * speed * (delta/16);
                particles[i].material.opacity -= normalRand(0.001, 0.007);

                // for each time of passed interval - randomize particle movement on X axis
                if(newInterval){
                    if(particles[i].position.x < PARTICLE_X_MEAN)
                        particles[i].position.x += normalRand(-DEVIATION_X_AXIS.minDev, DEVIATION_X_AXIS.maxDev);
                    else if(particles[i].position.x >= PARTICLE_X_MEAN)
                        particles[i].position.x += normalRand(-DEVIATION_X_AXIS.maxDev, DEVIATION_X_AXIS.minDev);
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

            }

            // manage base interval of particle movement
            intervalTTL -= delta/1000;
            newInterval = false;

            if(intervalTTL <= 0){
                intervalTTL = INTERVAL_TTL.inSec;
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
        camera.rotation.y = Math.PI/180 * rotationH;
        camera.rotation.x = Math.PI/180 * rotationV;
    }

    function setLightPos(){
        light.position.set(posXsphere, posYsphere, posZsphere);
    }

    ///////////////////////////////////
    // GUI controls

    function updateCameraFOV(){
        camera.fov = fov.fovValue;
        camera.updateProjectionMatrix();        // used for updating FOV of camera
    }

    const gui = new lil.GUI();
    gui.add(fov, 'fovValue', 24, 70, 1).name('FOV').onChange( updateCameraFOV );

    gui.add(PARTICLE_TTL    , 'inSec', 2.0, 4.0, 0.1).name('TTL cząsteczki');
    gui.add(INTERVAL_TTL    , 'inSec', 0.0, 0.5, 0.01).name('Interwał TTL cząsteczki');
    gui.add(DEVIATION_X_AXIS, 'minDev', 0.0, 0.05, 0.005).name('MIN dewiacja na osi X');
    gui.add(DEVIATION_X_AXIS, 'maxDev', 0.0, 0.05, 0.005).name('MAX dewiacja na osi X');

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