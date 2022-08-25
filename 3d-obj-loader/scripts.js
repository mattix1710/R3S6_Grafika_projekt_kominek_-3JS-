var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 24, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.z = 10;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

var keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
keyLight.position.set(-100, 0, 100);

var fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
fillLight.position.set(100, 0, 100);

var backLight = new THREE.DirectionalLight(0xffffff, 1.0);
backLight.position.set(100, 0, -100).normalize();

scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

var mtlLoader = new THREE.MTLLoader();
mtlLoader.setTexturePath('/assets/');
mtlLoader.setPath('/assets/');
mtlLoader.load('scena.mtl', function (materials) {

    materials.preload();

    for(const material of Object.values(materials.materials)){
        material.side = THREE.DoubleSide;
    }

    var objLoader = new THREE.OBJLoader();
    //const material = new THREE.MeshLambertMaterial({color: 0x44aa88});
    objLoader.setMaterials(materials);
    objLoader.setPath('/assets/');
    objLoader.load('scena.obj', function (object) {

        scene.add(object);
        object.position.y -= 0;
        object.Color
    });

});

//////////////////////////////
// TESTING - arrow helper


const dir = new THREE.Vector3( 5, 0, 0 );

//normalize the direction vector (convert to vector of length 1)
dir.normalize();

const origin = new THREE.Vector3( 0, 0, 0 );
const length = 5;
const hex = 0xffff00;

const arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
scene.add( arrowHelper );

//
///////////////////////////////

var animate = function () {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render(scene, camera);
};

animate();