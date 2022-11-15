window.addEventListener('load',function(){
    init();
 });
  
 let scene,camera,renderer;
 let orbitControls;
  
 function init(){
    //シーン、カメラ、レンダラーを生成
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.set(0.1,0,0);
    scene.add(camera);

    //canvasを作成
    const container = document.querySelector('#canvas_vr');
    //  container.appendChild(renderer.domElement);
    const canvas = document.getElementById('canvas')

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        container: canvas
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth,window.innerHeight);

    //OrbitControls
    document.addEventListener('touchmove',function(e){e.preventDefault();},{passive: false});
    orbitControls = new THREE.OrbitControls(camera,renderer.domElement);     
  
    //ウィンドウのリサイズに対応
    window.addEventListener('resize',function(){
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth,window.innerHeight);
    },false);

    threeWorld();
    setLight();
    rendering();
 }
  
 function threeWorld(){
     //座標軸の生成
     const axes = new THREE.AxesHelper(1000);
     axes.position.set(0,0,0);
     scene.add(axes);
   
     //グリッドの生成
     const grid = new THREE.GridHelper(100,100);
     scene.add(grid);
 }
  
 function setLight(){
     //環境光
     const ambientLight = new THREE.AmbientLight(0xFFFFFF);
     scene.add(ambientLight);
 }
  
 function rendering(){
     requestAnimationFrame(rendering);
     renderer.render(scene,camera);
 }

 //Sky
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);
 
//Skyの設定
const sky_uniforms = sky.material.uniforms;
sky_uniforms['turbidity'].value = 10;
sky_uniforms['rayleigh'].value = 2;
sky_uniforms['luminance'].value = 1;
sky_uniforms['mieCoefficient'].value = 0.005;
sky_uniforms['mieDirectionalG'].value = 0.8;
 
//Sun
const sunSphere = new THREE.Mesh(
    new THREE.SphereGeometry(200,16,8),
    new THREE.MeshBasicMaterial({color:0xFFFFFF})
);
scene.add(sunSphere);
 
//Sunの設定
const sun_uniforms = sky.material.uniforms;
sun_uniforms['turbidity'].value = 10;
sun_uniforms['rayleigh'].value = 2;
sun_uniforms['mieCoefficient'].value = 0.005;
sun_uniforms['mieDirectionalG'].value = 0.8;
sun_uniforms['luminance'].value = 1;
 
const theta = Math.PI * ( -0.01 );
const phi = 2 * Math.PI * ( -0.25 );
const distance = 400000;
sunSphere.position.x = distance * Math.cos(phi);
sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
sunSphere.visible = true;
sun_uniforms['sunPosition'].value.copy(sunSphere.position);