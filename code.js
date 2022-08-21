const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(24, window.innerWidth / window.innerHeight, 0.1, 1000);    
                                        // ogniskowa, proporcja ekranu, [najbliższy, najdalszy] punkt widoczny w kamerze

const renderer = new THREE.WebGLRenderer();             // renderer - coś w rodzaju naszego płótna (canvas)
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );       // dodajemy renderer do naszego pliku HTML