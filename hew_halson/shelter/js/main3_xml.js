// 外部リソースが読み込まれる前に実行
window.addEventListener('DOMContentLoaded', init);

function init() {
  // サイズを指定
  let width = document.getElementById('displayArea').getBoundingClientRect().width;
  let height = document.getElementById('displayArea').getBoundingClientRect().height;

  // レンダラーを作成
  const canvas = document.getElementById('renderingArea');
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  
  // デバイスごとに解像度を調整する
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setSize(width, height);
  // renderer.setClearColor(0xAA9966, 1);

  // テクスチャをガンマ補正
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;

  // シーンを作成
  const scene = new THREE.Scene();

  // フォグを設定(色, 開始距離, 終点距離)
  // scene.fog = new THREE.Fog(0x000000, 1000, 9000);

  // テクスチャ読み込み
  const texEqu = new THREE.TextureLoader().load('http://localhost/hew_211214_toppage/img/px6.png');
  texEqu.anisotropy = renderer.getMaxAnisotropy();
  texEqu.mapping = THREE.UVMapping;

  // 背景用ジオメトリ生成、THREE.SphereGeometry(radius, widthSegments, heightSegments)
  const sphereGeometry = new THREE.SphereGeometry(5000, 32, 32);
  sphereGeometry.scale(-1, 1, 1); // コレを指定しないと背景が左右反転してしまう
  const mat = new THREE.MeshBasicMaterial({
    map: texEqu,
    fog: false,
  });
  bgMesh = new THREE.Mesh(sphereGeometry, mat);
  // scene.add(bgMesh);





  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 30000);
  camera.position.set(1497.944456450294, 520.9445330007912, -2546.522962575916);
  // camera.position.set(3000, 416.37662966889013, 0)
  scene.add(camera); // // ライトを追従させるために追加する

  // ライトを作成(平行光源 = 太陽光のように一定方向から差し込む光)
  const directionalLight = new THREE.DirectionalLight(0x666666);
  directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z);
  console.log(directionalLight)
  scene.add(directionalLight);
  // camera.add(directionalLight); // カメラに追従させるために追加する
  const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 2);
  directionalLightHelper.position.set(directionalLight.position.x, directionalLight.position.y, directionalLight.position.z);
  // scene.add(directionalLightHelper);

  // ライトを作成(環境光源 = 3D空間全体に均等に当てる光)
  const ambientLight = new THREE.AmbientLight(0x808080);
  scene.add(ambientLight);

  // // ライトを作成
  // const light = new THREE.SpotLight(0xFFFFFF, 4, 30, Math.PI / 6, 0, 0.5);
  // scene.add(light)
  // console.log(light);
  // camera.add(light)
  // light.position.set(camera.position.x, camera.position.y, camera.position.z);
  // console.log(camera.position);

  // const lightHelper = new THREE.SpotLightHelper(light);
  // scene.add(lightHelper);





  // 地面を作成
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000, 1, 1),
    new THREE.MeshLambertMaterial({
      map: THREE.ImageUtils.loadTexture('http://localhost/hew_211214_toppage/img/marble_01_diff_4k.jpg')
    })
  );
  plane.position.y = -200;
  plane.rotation.x = Math.PI / -2;
  // scene.add(plane);
  console.log(plane)
  
  // glbファイル読込(商品棚)
  // loader.load(url, onSuccessCallback, onProgressCallback, onErrorCallback);
  // 非同期処理のため、urlの読み込みが完了するまで以下のいずれかのコールバック関数は実行されない
  // ⇒ targetListにmodel1を代入したのに中身がnullだったのは、代入処理がモデル取得処理の前だったから

  // 読み込んだデータはJSON形式で引数として渡される（構造はオブジェクト型）、
  // そのデータのsceneプロパティが必要なデータ（モデル） ⇒ コンソールで確認済み
  const loader = new THREE.GLTFLoader();
  let model = null;

  // glTF(DRACO圧縮された)モデルを読み込む
  // loader.setDRACOLoader(new THREE.DRACOLoader('http://localhost/hew_211214_toppage/js/draco/', { type: 'js' }));
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('js/draco/');
  loader.setDRACOLoader(dracoLoader);

  const start = Date.now();
  let end;
  console.log(start);
  loader.load(
      'http://localhost/hew_211214_toppage/glb/hew7Draco.glb',
      // Function when resource is loaded
      (gltf) => {
        model = gltf.scene; // モデルを取得、sceneオブジェクトのインスタンス
        model.name = "main";
        model.scale.set(400.0, 400.0, 400.0);
        model.position.set(0, -200, 0);
        scene.add(model);
        console.log('Finished loading');
        // dracoLoader.releaseDecoderModule();
        end = Date.now();
        console.log(end);
        console.log(end - start);
      },
      // Function while loading is progressing
      () => { console.log('Not finished loading yet'); },
      // Function when loading has errors
      () => { console.log('An error happened'); }
  );

  // 各商品のワールド座標
  const worldCoordsOfProduct = {
    x: [
      745, 660, 570, 475, 390, 745, 660, 570, 475, 390, 745, 660, 570, 475, 390, 745, 660, 570, 475, 390, 745, 660, 570, 475, 390, // nigiri
      180, 90, 0, -90, -180, 180, 90, 0, -90, -180, 180, 90, 0, -90, -180, 180, 90, 0, -90, -180, 180, 90, 0, -90, -180, // sand, side
      -390, -475, -570, -660, -745, -390, -475, -570, -660, -745, -390, -475, -570, -660, -745, -390, -475, -570, -660, -745, -390, -475, -570, -660, -745, // bento
      -925, -975, -1025, -1080, -925, -975, -1025, -1080, -925, -975, -1025, -1080, -925, -975, -1025, -1080, -925, -975, -1025, -1080, -925, -975, -1025, -1080, // sake
      -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, -1150, // drink
      -1080, -1025, -975, -925, -1080, -1025, -975, -925, -1080, -1025, -975, -925, -1080, -1025, -975, -925, -1080, -1025, -975, -925, -1080, -1025, -975, -925, // drink
      -720, -635, -540, -440, -720, -635, -540, -440, -720, -635, -540, -440, -720, -630, -530, -440, // sweet
      -170, -65, 65, 170, -170, -65, 65, 170, -170, -65, 65, 170, -170, -65, 65, 170, // ice
      455, 555, 670, 760, 455, 560, 675, 765, 455, 555, 670, 765, 475, 580, 695, 790, // frozen
      845, 910, 965, 1010, 1060, 845, 910, 965, 1010, 1060, 850, 915, 970, 1020, 1070, 855, 920, 975, 1030, 1085, 885, 948, 1000, 1060, 1110, // ins
      1080, 1080, 1080, 1080, 1080, 1095, 1095, 1095, 1095, 1095, 1110, 1100, 1100, 1100, 1100, 1115, 1115, 1115, 1115, 1115, 1150, 1150, 1150, 1150, 1150, // pan
      1060, 1010, 965, 910, 845, 1060, 1010, 965, 910, 850, 1070, 1020, 970, 915, 850, 1085, 1030, 975, 920, 855, 1110, 1060, 1000, 948, 885, // snack
    ],
    y: [
      545, 545, 545, 545, 545, 440, 440, 440, 440, 440, 335, 335, 335, 335, 335, 243, 240, 243, 242, 243, 135, 141, 137, 137, 135,
      545, 545, 545, 545, 545, 440, 440, 440, 440, 440, 335, 335, 335, 335, 335, 243, 240, 243, 242, 243, 135, 141, 137, 137, 135,
      545, 545, 545, 545, 545, 440, 440, 440, 440, 440, 335, 335, 335, 335, 335, 243, 240, 243, 242, 243, 135, 141, 137, 137, 135,
      623, 623, 623, 623, 530, 530, 530, 530, 437, 437, 437, 437, 337, 338, 340, 338, 237, 235, 237, 240, 135, 135, 140, 140,
      623, 623, 623, 623, 530, 530, 530, 530, 437, 437, 437, 437, 337, 338, 340, 338, 237, 235, 237, 240, 135, 135, 140, 140,
      623, 623, 623, 623, 530, 530, 530, 530, 437, 437, 437, 437, 337, 338, 340, 338, 237, 235, 237, 240, 135, 135, 140, 140,
      570, 570, 570, 570, 470, 470, 460, 470, 360, 360, 360, 360, 250, 250, 250, 250,
      550, 550, 555, 555, 460, 462, 460, 462, 275, 260, 260, 260, 195, 195, 165, 195,
      555, 555, 555, 555, 460, 462, 460, 462, 285, 285, 285, 285, 185, 185, 180, 185,
      597, 597, 597, 597, 597, 460, 460, 460, 460, 460, 335, 335, 335, 335, 335, 215, 215, 215, 215, 215, 94, 93, 91, 88, 94,
      593, 597, 593, 593, 593, 460, 460, 460, 460, 460, 335, 335, 335, 335, 335, 215, 215, 215, 215, 215, 94, 93, 91, 88, 94,
      593, 597, 593, 593, 593, 460, 460, 460, 460, 460, 335, 335, 335, 335, 335, 215, 215, 215, 215, 215, 94, 93, 91, 88, 94,
    ],
    z: [
      -865, -910, -970, -1015, -1075, -865, -910, -970, -1015, -1075, -865, -910, -970, -1015, -1075, -865, -910, -970, -1015, -1075, -865, -910, -970, -1015, -1075,
      -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125, -1125,
      -1075, -1015, -970, -910, -865, -1075, -1015, -970, -910, -865, -1075, -1015, -970, -910, -865, -1075, -1015, -970, -910, -865, -1075, -1015, -970, -910, -865,
      -715, -630, -540, -450, -715, -630, -540, -450, -715, -630, -540, -450, -715, -630, -540, -450, -715, -630, -540, -450, -715, -630, -540, -450,
      -150, -50, 50, 150, -150, -50, 50, 150, -150, -50, 50, 150, -150, -50, 50, 150, -150, -50, 50, 150, -150, -50, 50, 150,
      450, 540, 630, 715, 450, 540, 630, 715, 450, 540, 630, 715, 450, 540, 630, 715, 450, 540, 630, 715, 450, 540, 630, 715,
      900, 955, 1005, 1065, 900, 955, 1005, 1065, 900, 955, 1005, 1065, 900, 960, 1015, 1065,
      1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1230, 1230, 1230, 1230,
      1140, 1070, 1000, 940, 1140, 1080, 1005, 945, 1140, 1070, 1000, 945, 1160, 1095, 1025, 970,
      730, 635, 535, 430, 335, 730, 635, 535, 430, 335, 735, 640, 540, 435, 340, 740, 645, 550, 450, 355, 770, 677, 570, 480, 385,
      206, 103, 0, -103, -206, 206, 103, 0, -103, -206, 206, 103, 0, -103, -206, 206, 103, 0, -103, -206, 206, 103, 0, -103, -206,
      -335, -430, -535, -635, -730, -335, -430, -535, -635, -735, -340, -435, -540, -640, -735, -355, -450, -550, -645, -740, -385, -480, -570, -677, -770,
    ]
  };

  // データベースから取ってきた商品データに座標データ追加
  for(let i = 0; i < jsonProductData.length; i++){
    jsonProductData[i].x = worldCoordsOfProduct.x[i];
    jsonProductData[i].y = worldCoordsOfProduct.y[i];
    jsonProductData[i].z = worldCoordsOfProduct.z[i];
  }

  //3Dオブジェクトをグループ化してsceneに配置⇒グループ全体に操作をかけれるようになる
  const wrap = new THREE.Group();
  wrap.name = 'wrap';
  scene.add(wrap);

  // glbファイル読込(商品)
  for(let i = 0; i < jsonProductData.length; i++){
    const url = 'http://localhost/hew_211214_toppage/glb/' + jsonProductData[i].imgURL + '.glb';
    loader.load(
      url,
      (gltf) => {
        const modal = gltf.scene;
        modal.name = jsonProductData[i].name;
        modal.scale.set(100.0, 100.0, 100.0);
        modal.position.set(jsonProductData[i].x, (jsonProductData[i].y - 200), jsonProductData[i].z);
        wrap.add(modal);
      },
      undefined,
      undefined
    );
  }

  // カメラコントローラを作成(camera系クラスのオブジェクト, マウス操作対象となるDOM要素)
  // 第2引数を省略した場合、ブラウザ全体がマウス操作の対象となる
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  // 移動(パン)操作不可
  controls.enablePan = false;
  console.log(controls);

  // カメラ操作に制限をかける
  controls.minPolarAngle = Math.PI / 2.25; // 天井に行かせない
  controls.maxPolarAngle = Math.PI / 2.25; // 地下に行かせない

  // ズーム制御
  // controls.maxDistance = 2400; // 遠ざかれる距離の最大値
  // controls.maxDistance = 3000; // 仮
  controls.minDistance = 2063.176918933226; // 近づける距離の最大値
  console.log(controls)

  // マウス回転スピードを下げる(デフォルトは1)
  controls.rotateSpeed = 0.1;

  // ドラッグアンドドロップ処理
  const dragTarget = [];
  const dragControls = new THREE.DragControls(scene.getObjectByName('wrap').children, camera, renderer.domElement);
  console.log(dragControls)
  dragControls.addEventListener('dragstart', function(event) { controls.enabled = false; });
  dragControls.addEventListener('dragend', function(event) { controls.enabled = true; });

  // 棚データ
  rackData = [
    {x: 1013.1767586950257, z: -1741.8636429935457, deg: 300}, // おにぎり
    {x: -2.2537454725409156, z: -2040.149331212351, deg: 270}, // サンド・惣菜
    {x: -1016.2007254555447, z: -1766.2490824585961, deg: 240}, // 弁当
    {x: -1769.95698032798, z: -1035.7550518568162, deg: 210}, // 酒
    {x: -2043.7114569214448, z: 0.47914530902540264, deg: 180}, // 飲料
    {x: -1791.8237807941964, z: 1043.4056114521907, deg: 150}, // 飲料
    {x: -957.444634854558, z: 1676.0456426353978, deg: 120}, // デザート
    {x: -6.317465195781998, z: 1945.8999602733709, deg: 90}, // アイス
    {x: 989.135051310981, z: 1685.1092670415676, deg: 60}, // 冷凍食品
    {x: 1785.6935706996458, z: 1003.6574311350595, deg: 30}, // インスタント
    {x: 2050.540553654348, z: 3.088210610194596, deg: 0}, // パン
    {x: 1781.4737169924952, z: -1027.0246725323302, deg: 330} // 菓子
  ];

  // 各棚ボタンにイベント発行
  let canPrepared = true;
  let tempRackNum = -1;
  const cambtnArea = document.getElementById('cambtnArea');

  for(let i = 0; i < rackData.length; i++){
    cambtnArea.children[i+1].addEventListener('click', (e) => {
      if(!canPrepared) return;
      canPrepared = false;

      tempRackNum = i;
      document.getElementById('camLeftBtn').style.opacity = '1';
      document.getElementById('camRightBtn').style.opacity = '1';
      
      preMoveCamera(moveCamera, rackData[i].deg, rackData[i].x, rackData[i].z);

      changeCamBtnStyle(tempRackNum);
    });
  }

  // カメラボタンのスタイル更新
  function changeCamBtnStyle(rackNum) {
    for(let i = 1; i <= rackData.length; i++) cambtnArea.children[i].style.backgroundColor = 'black';
    cambtnArea.children[rackNum+1].style.backgroundColor = '#2C92C5';
  }

  // カメラ移動処理
  let startX, startZ, endX, endZ, diffX, diffZ, progress;
  const time = 1000;
  const maxRadius = 3000;

  function preMoveCamera(callback, deg, x, z) {
    startX = camera.position.x;
    startZ = camera.position.z;

    let radius = Math.sqrt(Math.pow(startX, 2) + Math.pow(startZ, 2)); // 半径を求める
    const xTimes = maxRadius / radius; // 何倍か

    endX = startX * xTimes;
    endZ = startZ * xTimes;
    // よって、Math.sqrt(Math.pow(endX, 2) + Math.pow(endZ, 2)) === 3000になる

    diffX = endX - startX;
    diffZ = endZ - startZ;

    requestAnimationFrame(startTime => {
      update(startTime);

      function update(timeStamp) {
        // 進捗率 = 経過した時間 / 変化にかかる総時間
        progress = (timeStamp - startTime) / time;

        progress = Math.min(progress, 1);

        if(progress > 0){
          const resultX = startX + diffX * progress;
          const resultZ = startZ + diffZ * progress;
          camera.position.copy(new THREE.Vector3(resultX, camera.position.y, resultZ));
        }

        if(progress < 1){
          requestAnimationFrame(update);
        }else{
          callback(deg, x, z);
        }
      }
    });
  }

  function moveCamera(deg, x, z) {
    startX = camera.position.x;
    startZ = camera.position.z;

    const radian = deg * Math.PI / 180;
    endX = maxRadius * Math.cos(radian);
    endZ = maxRadius * Math.sin(radian);

    diffX = endX - startX;
    diffZ = endZ - startZ;

    // requestAnimationFrame()に渡すコールバック関数は、引数でタイムスタンプ(ミリ秒)を受け取る
    requestAnimationFrame(startTime => {
      update(startTime);

      function update(timeStamp) {
        // 進捗率 = 経過した時間 / 変化にかかる総時間
        progress = (timeStamp - startTime) / time;

        progress = Math.min(progress, 1);

        if(progress > 0){
          const resultX = startX + diffX * progress;
          const resultZ = startZ + diffZ * progress;
          camera.position.copy(new THREE.Vector3(resultX, camera.position.y, resultZ));
        }

        if(progress < 1){
          requestAnimationFrame(update);
        }else{
          postMoveCamera(x, z);
        }
      }
    });
  }

  function postMoveCamera(x, z) {
    startX = camera.position.x;
    startZ = camera.position.z;
    endX = x;
    endZ = z;
    diffX = endX - startX;
    diffZ = endZ - startZ;

    // requestAnimationFrame()に渡すコールバック関数は、引数でタイムスタンプ(ミリ秒)を受け取る
    requestAnimationFrame(startTime => {
      update(startTime);

      function update(timeStamp) {
        // 進捗率 = 経過した時間 / 変化にかかる総時間
        progress = (timeStamp - startTime) / time;

        progress = Math.min(progress, 1);

        if(progress > 0){
          const resultX = startX + diffX * progress;
          const resultZ = startZ + diffZ * progress;
          camera.position.copy(new THREE.Vector3(resultX, camera.position.y, resultZ));
        }

        if(progress < 1){
          requestAnimationFrame(update);
        }else{
          // addEventListenerのcallback内では非同期実行⇒最も終わるのが遅い処理の直前でtrueにする
          canPrepared = true;
        }
      }
    });
  }

  // カメラ位置を1つ左の棚の前に移動する
  document.getElementById('camLeftBtn').addEventListener('click', () => {
    if(!canPrepared) return;
    canPrepared = false;

    // 次に移動する棚を求める
    if(tempRackNum > 0){
      tempRackNum -= 1;
    }else if(tempRackNum === 0){
      tempRackNum = 11;
    }

    preMoveCamera(moveCamera, rackData[tempRackNum].deg, rackData[tempRackNum].x, rackData[tempRackNum].z);

    changeCamBtnStyle(tempRackNum);
  });

   // カメラ位置を1つ右の棚の前に移動する
   document.getElementById('camRightBtn').addEventListener('click', () => {
    if(!canPrepared) return;
    canPrepared = false;

    // 次に移動する棚を求める
    if(tempRackNum < 11){
      tempRackNum += 1;
    }else if(tempRackNum === 11){
      tempRackNum = 0;
    }

    preMoveCamera(moveCamera, rackData[tempRackNum].deg, rackData[tempRackNum].x, rackData[tempRackNum].z);

    changeCamBtnStyle(tempRackNum);
  });

  // ピッキング処理
  canvas.addEventListener('dblclick', dblclickObj);

  //マウス座標管理用のベクトルを作成
  const mouse = new THREE.Vector2();
  const ray = new THREE.Raycaster();

  //3Dオブジェクトを格納する変数
  // const targetList = [];
  // targetList.push(model);
  let obj;

  const productModal = document.getElementById('productModal');
  const productModalStyle = window.getComputedStyle(productModal);

  function dblclickObj(e) {
    controls.enabled = false;
    // canvas要素の座標情報取得
    const rect = e.target.getBoundingClientRect();

    // canvas領域の左上(0,0)からのマウス座標を取得
    mouse.x =  e.clientX - rect.left;
    mouse.y =  e.clientY - rect.top;

    // マウス座標を3D座標に変換
    mouse.x = -1 + ((2 * mouse.x) / width);
    mouse.y = 1 - ((2 * mouse.y) / height);

    // マウスの位置からまっすぐに伸びる光線(レイ)ベクトルに更新
    ray.setFromCamera(mouse, camera);

    // その光線と交差したオブジェ取得
    obj = ray.intersectObjects(scene.getObjectByName('wrap').children, true);

    // controls.enabled = true;

    // 交差判定
    if(obj.length === 0) return;

    // xhrでデータ取得
    fetch('get_product_data.php', {
      method: 'POST',
      body: JSON.stringify({
        stores_id: phpGetStoreNum,
        products_name: obj[0].object.parent.name
      }),
      headers: {"Content-Type": "application/json"}
    }).then(response => {
      return response.json();
    }).then(json => {
      window.postProductData = Object.assign({}, json);
    });

    // 既にモーダルが表示されていれば、そのモーダルを閉じる
    if(productModalStyle.display == 'block'){
      slideModal(-310);
      setTimeout(() => { makeModalPackage(); }, 600);
    }else{
      makeModalPackage();
    }
  }

  // モーダル作成の一連の処理
  const productModalContent = document.getElementById('productModalContent');
  function makeModalPackage() {
    productModal.style.display = 'block';

    makeProductModal();

    slideModal(0);
  }

  // 商品詳細モーダルの中身を動的に作成
  const productModalProductBtn = document.getElementById('productModalProductBtn');
  function makeProductModal() {
    // モーダルの中身を初期化
    while(productModalContent.firstElementChild) productModalContent.removeChild(productModalContent.firstElementChild);

    // ナビゲーションのスタイル変更
    // productModalForumBtn.style.color = 'black';
    productModalForumBtn.style.borderBottom = '1px solid #9AA0A6';
    // productModalProductBtn.style.color = 'blue';
    productModalProductBtn.style.borderBottom = '2px solid white';

    const img = createElement('img', [], 'product-modal__img');
    img.src = `img/${window.postProductData.imgURL}.png`;

    const imgDiv = createElement('div', [ img ], 'product-modal__img-div');

    const h2 = createElement('h2', [ createTextNode(window.postProductData.name) ], 'product-modal__title', 'productModalTitle');

    const priceSpan = createElement('span', [ createTextNode(window.postProductData.price) ]);

    const priceP = createElement('p', [ priceSpan, createTextNode('円 | ') ], 'product-modal__price-quantity-p');

    const quantitySpan = createElement('span', [ createTextNode(window.postProductData.stock) ]);

    const quantityP = createElement('p', [ createTextNode('在庫数'), quantitySpan, createTextNode('個') ], 'product-modal__price-quantity-p');

    const priceQuantityP = createElement('p', [ priceP, quantityP ], 'product-modal__price-quantity', 'productModalPriceQuantity');

    const descP = createElement('p', [ createTextNode(window.postProductData.explanation) ], 'product-modal__desc');

    const optionArr = [];
    for(let i = 1; i <= window.postProductData.stock; i++){
      const option = createElement('option', [createTextNode(i)]);
      option.value = i;
      if(i === 1) option.selected = true;
      optionArr.push(option);
    }

    const selectedSelect = createElement('select', optionArr, 'product-modal__select', 'productModalSelect');

    const selectLabel = createElement('label', [ createTextNode('数量：'), selectedSelect ], 'product-modal__label');

    const cartBtnDiv = createElement('div', [ createTextNode('カートに入れる') ], 'add-to-cart-btn', 'addToCartBtn');
    cartBtnDiv.addEventListener('click', addLocalStorage);

    const btnAreaDiv = createElement('div', [selectLabel, cartBtnDiv ], 'product-modal__btn-area');

    const insertArr = [imgDiv, h2, priceQuantityP, descP, btnAreaDiv];

    productModalContent.appendChild(createFragment(insertArr));
  }

  // 商品詳細モーダル非表示
  document.getElementById('productModalHideBtn').addEventListener('click', () => { slideModal(-310); });

  // 商品詳細モーダルスライドアニメーション
  function slideModal(end) {
    const startModalRight = parseInt(productModalStyle.right);
    const endModalRight = end;
    const diffModalRight = endModalRight - startModalRight;

    requestAnimationFrame(startTime => {
      update(startTime);

      function update(timeStamp) {
        // 進捗率 = 経過した時間 / 変化にかかる総時間
        progress = (timeStamp - startTime) / 500;

        progress = Math.min(progress, 1);

        if(progress > 0) productModal.style.right = (startModalRight + diffModalRight * progress) + 'px';

        if(progress < 1){
          requestAnimationFrame(update);
        }else{
          if(end === -310) productModal.style.display = 'none';
        }
      }
    });
  }

  // 3Dオブジェクトマウスムーブ処理
  canvas.addEventListener('mousemove', mouseMoveObj);

  //マウス座標管理用のベクトルを作成
  const screenMouse = new THREE.Vector2();
  let productObj = 0;

  function mouseMoveObj(e) {
    controls.enabled = true;
    const rect = e.target.getBoundingClientRect();

    screenMouse.x =  e.clientX - rect.left;
    screenMouse.y =  e.clientY - rect.top;

    mouse.x = -1 + ((2 * screenMouse.x) / width);
    mouse.y = 1 - ((2 * screenMouse.y) / height);

    ray.setFromCamera(mouse, camera);

    productObj = ray.intersectObjects(scene.getObjectByName('wrap').children, true);
  }

  // const viewProductNameArea = document.getElementById('viewProductNameArea');
  // const viewProductName = document.getElementById('viewProductName');

  // 毎フレーム実行させる
  tick();
  function tick() {
    // カメラコントローラーを更新
    controls.update();

    // ヘルパーを更新
    // lightHelper.update();

    if(directionalLight){
      directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z);
      directionalLight.quaternion.copy(camera.quaternion);
    }

    // カメラが原点(0, 0, 0)を向くようにする
    // camera.lookAt(new THREE.Vector3(0, 150, 0));
    camera.lookAt(new THREE.Vector3(0, 0, 0));


    // 全てのmodalの向きをカメラに追従させる⇒どの角度から見ても正面になる
    // カメラの回転角と回転させたいオブジェを同調させる
    for(let i = 0; i < wrap.children.length; i++){
      if(wrap.children[i]) wrap.children[i].quaternion.copy(camera.quaternion);
    }

    if(productObj.length > 0){
      canvas.style.cursor = 'pointer';
      viewProductNameArea.style.display = 'inline-block';
      viewProductNameArea.style.left = (screenMouse.x + 25) + 'px';
      viewProductNameArea.style.top = (screenMouse.y - 25) + 'px';
      if(viewProductNameArea.textContent !== productObj[0].object.parent.name){
        viewProductNameArea.textContent = productObj[0].object.parent.name;
      }
    }else{
      canvas.style.cursor = 'not-allowed';
      viewProductNameArea.textContent = '';
      viewProductNameArea.style.display = 'none';
    }

    //レンダリング
    renderer.render(scene, camera);

    // 更新準備が整った後に呼び出す
    requestAnimationFrame(tick);
  }

  // リサイズ処理
  window.addEventListener('resize', function() {
    // 新しくサイズを取得
    width = document.getElementById('displayArea').getBoundingClientRect().width;
    height = document.getElementById('displayArea').getBoundingClientRect().height;

    // レンダラーのサイズを調整する
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    // カメラのアスペクト比を正す
    camera.aspect = width / height;
    
    // カメラの内部状態を更新する
    camera.updateProjectionMatrix();
  }, false);

  // カメラ位置をリセット、角度も初期化しなけらばならない
  document.getElementById('camReset').addEventListener('click', () => {
    tempRackNum = -1;
    for(let i = 1; i <= rackData.length; i++) cambtnArea.children[i].style.backgroundColor = 'black';
    controls.reset();
  });

  // カメラ位置の座標を取得する
  document.getElementById('logoArea').addEventListener('click', () => {
    console.log(camera.position);
  });

  // カート機能 ///////////////////////////////////////////////////////////////////////////////////////////////////////
  const storage = localStorage;

  // カートに入れる、localStorageに値を格納
  function addLocalStorage() {
    if(!canPreparedAddToCart) return;

    const results = getProductsInCart(); // JSON文字列から復元済み

    // カートに入れた商品がカート内に既に存在しているかチェック
    let resultIndex = -1;
    for(let i = 0; i < results.length; i++){
      const result = results[i];
      if(result.value.id === window.postProductData.id){
        resultIndex = i;
        break;
      }
    }

    // 更新前に在庫数を超えてないかチェック
    if(resultIndex !== -1 && results[resultIndex].value.selectedQuantity == window.postProductData.stock){
      viewMessageAsAddToCart(0.75, `${window.postProductData.name}は もう売り切れちまったよ。`);
      return;
    }

    // key設定(3パターン)
    let key;
    if(results.length === 0) key = '0_productInCart'; // カート内に商品が1つもない場合

    if(resultIndex === -1 && results.length > 0){ // カート内に商品はあるが、重複はしていない場合
      const intKey = parseInt(results[results.length-1].key); // resultsに入っている最後の要素のkeyを取得
      key = `${intKey + 1}_productInCart`;  
    }

    if(resultIndex !== -1) key = results[resultIndex].key; // カート内に既に存在していた場合

    // value設定
    const value = {
      id: window.postProductData.id,
      name: window.postProductData.name,
      price: window.postProductData.price,
      stock: window.postProductData.stock,
      imgURL: window.postProductData.imgURL
    };

    // カート内に入れる個数を設定
    const productModalSelect = document.getElementById('productModalSelect');
    const selectedIndex = productModalSelect.selectedIndex;
    let selectedQuantity = parseInt(productModalSelect.options[selectedIndex].value);

    viewMessageAsAddToCart(0.75, `「${window.postProductData.name}」×${selectedQuantity}を カートに入れといたぜ。`);

    // カート内に既に選択商品が存在していた場合
    if(resultIndex !== -1){
      selectedQuantity += results[resultIndex].value.selectedQuantity;
      selectedQuantity = Math.min(selectedQuantity, window.postProductData.stock); // 在庫数を超えないようにする
    }

    value.selectedQuantity = selectedQuantity;

    // オブジェを保存するとただの文字列に変換されてしまうため、JSON文字列に変換する
    if(key && value) storage.setItem(key, JSON.stringify(value));

    viewLocalStorage();
  }

  // localStorage取得時のソート処理
  function compareNumbers(a, b) {
    const x = parseInt(a);
    // console.log(a) // 0_productInCart
    // console.log(x) // 0 ⇒ 数字以外は無視される ⇒ productInCart_0だと最初が文字のため、その後の数字を判定しないため不可
    const y = parseInt(b);
    return x - y;
  }

  function getProductsInCart() {
    // コレクション型でlocalStorage取得(オブジェクトが配列でまとめられた)
    const collection = Object.keys(storage).sort(compareNumbers).map(key => {
      return {
        key: key,
        value: JSON.parse(storage.getItem(key)) // JSON文字列をjavascriptオブジェに復元
      };
    });

    // localStorageに格納されているカート内商品以外を排除
    const results = collection.filter(object => {
      return object.key.match(/^[0-9]+_productInCart$/);
    });

    return results;
  }

  viewLocalStorage();

  // カート表示、localStorageのキーと値を取得 + DOM作成
  function viewLocalStorage() {
    const cartAreaList = document.getElementById('cartAreaList');
    while(cartAreaList.firstElementChild) cartAreaList.removeChild(cartAreaList.firstElementChild);

    const results = getProductsInCart();
    const sumPriceArea = document.getElementById('cartAreaSumPrice');
    const sumQuantityArea = document.getElementById('cartAreaSumQuantity');
    let sumPrice = 0;
    let sumSelectedQuantity = 0;
    const insertArr = [];
    
    if(results.length === 0){
      const li = createElement('li', [ createTextNode(`*「${jsonUsersName.name}さんのカートに商品は入ってないよ。`) ], 'cart-area__item-empty');
      insertArr.push(li);
    }

    for(let i = 0; i < results.length; i++){
      const result = results[i];

      const img = createElement('img', []);
      img.src = `img/${result.value.imgURL}.png`;

      const div = createElement('div', [ img ], 'cart-area__img-wrapper');

      // 在庫数分のoption作成
      const optionArr = [];
      for(let i = 0; i <= result.value.stock; i++){
        const option = createElement('option', [ createTextNode(i) ]);
        option.value = i;
        if(i === 0) option.innerText = `${i}(削除)`;
        if(i === result.value.selectedQuantity) option.selected = true;
        optionArr.push(option);
      }
      sumSelectedQuantity += result.value.selectedQuantity;

      const select = createElement('select', optionArr, 'cart-area__select');
      select.addEventListener('change', () => {
        if(select.selectedIndex === 0){ // option[0]はカートから削除
          deleteStorage(result.key);
        }else{ // localStorage(該当商品のquantity)更新
          const value = JSON.parse(storage.getItem(result.key));
          value.selectedQuantity = select.selectedIndex;
          storage.setItem(result.key, JSON.stringify(value));
        }
        viewLocalStorage();
      });

      const p1 = createElement('p', [ createTextNode(result.value.name) ], 'cart-area__product-name');

      const price = parseInt(result.value.price) * parseInt(result.value.selectedQuantity);
      sumPrice += price;
      const p2 = createElement('p', [ createTextNode(`${price}円`) ], 'cart-area__product-price');

      const a = createElement('a', [ createTextNode('削除') ], 'cart-area__delete-btn');
      // カート内商品削除、localStorageから指定キーに対する値を削除
      a.addEventListener('click', (e) => {
        deleteStorage(result.key);
        e.preventDefault();
      });

      const div2 = createElement('div', [ p2, a ], 'cart-area__price-delete');

      const li = createElement('li', [ div, select, p1, div2 ], 'cart-area__item');
      insertArr.push(li);
    }
    cartAreaList.appendChild(createFragment(insertArr));

    sumPriceArea.innerText = sumPrice;
    sumQuantityArea.innerText = sumSelectedQuantity;
  }

  function deleteStorage(key) {
    storage.removeItem(key);
    viewLocalStorage();
  }

  // カートリセット、localStorageから全て削除
  document.getElementById('cartAreaResetBtn').addEventListener('click', () => {
    const results = getProductsInCart();
    for(const result of results) storage.removeItem(result.key);
    viewLocalStorage();
  });

  // マウスが乗った時、カート領域拡大
  const cartArea = document.getElementById('cartArea');
  const cartAreaStyle = window.getComputedStyle(cartArea);

  cartArea.addEventListener('mouseover', () => {
    if(cartArea.children[0].children[0].className == 'cart-area__item-empty') return;

    // 商品詳細モーダルが表示されているなら閉じる
    if(productModalStyle.display == 'block') slideModal(-310);

    changeHeightOfCartArea(250);
  });

  cartArea.addEventListener('mouseout', () => { changeHeightOfCartArea(100); });

  function changeHeightOfCartArea(end) {
    const startCartAreaHeight = parseInt(cartAreaStyle.height);
    const endCartAreaHeight = end;
    const diffCartAreaHeight = endCartAreaHeight - startCartAreaHeight;

    requestAnimationFrame(startTime => {
      update(startTime);

      function update(timeStamp) {
        // 進捗率 = 経過した時間 / 変化にかかる総時間
        progress = (timeStamp - startTime) / 200;

        progress = Math.min(progress, 1);

        if(progress > 0) cartArea.style.height = (startCartAreaHeight + diffCartAreaHeight * progress) + 'px';

        if(progress < 1) requestAnimationFrame(update);
      }
    });
  }

  // モーダル切り替え
  const productModalForumBtn = document.getElementById('productModalForumBtn');
  productModalForumBtn.addEventListener('click', () => { makeForumModal(); });
  productModalProductBtn.addEventListener('click', () => { makeProductModal(); });

  // 掲示板モーダルの中身を動的に作成
  function makeForumModal(e) {
    // モーダルの中身を初期化
    while(productModalContent.firstElementChild) productModalContent.removeChild(productModalContent.firstElementChild);

    // ナビゲーションのスタイル変更
    productModalProductBtn.style.borderBottom = '1px solid #9AA0A6';
    productModalForumBtn.style.borderBottom = '2px solid white';

    const formimg = createElement('img', []);
    formimg.src = 'img/forum_modal_post_inactive.png';

    const formimgDiv = createElement('div', [ formimg ], 'product-modal__forum-formimg-div');
    formimgDiv.addEventListener('click', openForumForm)

    const forumTitle = createElement('h2', [ createTextNode('みんなの感想') ], 'product-modal__forum-maintitle');

    const insertArr = [formimgDiv, forumTitle];

    productModalContent.appendChild(createFragment(insertArr));

    // 商品名と一致する投稿のインデックスを取り出す
    // const indexOfJsonForumData = [];
    // for(let i = 0; i < jsonForumData.length; i++){
    //   if(jsonForumData[i].product_name == window.postProductData.name) indexOfJsonForumData.push(i);
    // }

    // xhrでデータ取得
    fetch('get_forum_data.php', {
      method: 'POST',
      body: JSON.stringify({ products_name: obj[0].object.parent.name }),
      headers: {"Content-Type": "application/json"}
    }).then(response => {
      return response.json();
    }).then(json => {
      makeForumContent(json);
    });
  }

  // 掲示板のメインコンテンツ表示
  function makeForumContent(json) {
    if(json.length === 0){
      const p = createElement('p', [ createTextNode('*「この商品の感想はまだないよ、\n     何でもいいから書いてくれよ。') ], 'product-modal__forum-empty');
      productModalContent.appendChild(p);
      return;
    }

    // 元の閲覧エリア削除
    while(productModalContent.children[3]) productModalContent.removeChild(productModalContent.children[3]);

    // 閲覧エリア作成
    const liArr = [];
    for(let i = 0; i < json.length; i++){
      const forumData = json[i];

      const content = createElement('p', [ createTextNode(`${forumData.nickname}「${forumData.content}`) ], 'product-modal__forum-li__content');

      const img = createElement('img', [], 'product-modal__forum-goodimg');
      img.src = 'img/forum_modal_good_inactive.png';

      const item1 = createElement('div', [ img ], 'product-modal__forum-goodimg-div');

      const item2 = createElement('span', [ createTextNode(forumData.good_cnt) ], 'product-modal__forum-goodcnt');

      const flexBox = createElement('div', [ item1, item2 ], 'product-modal__forum-li__flexbox');
      flexBox.addEventListener('click', increment);

      const inlineBlock1 = createElement('div', [ flexBox ], 'product-modal__forum-li__inlineblock');

      const inlineBlock2 = createElement('p', [ createTextNode(forumData.created_at) ], 'product-modal__forum-li__inlineblock');

      const notContent = createElement('div', [ inlineBlock1, inlineBlock2 ], 'product-modal__forum-li__not-content');

      const li = createElement('li', [ content, notContent ], 'product-modal__forum-li');
      liArr.push(li);
    }
    const ul = createElement('ul', liArr, 'product-modal__forum-ul');

    productModalContent.appendChild(ul);
  }

  function increment(e) {
    e.currentTarget.children[0].children[0].src = 'img/forum_modal_good_active.png';
    e.currentTarget.children[1].innerText = parseInt(e.currentTarget.children[1].innerText) + 1;
    e.currentTarget.children[1].style.color = '#2C92C5';
    e.currentTarget.removeEventListener(e.type, increment);
    e.currentTarget.addEventListener('click', decrement);
  }

  function decrement(e) {
    e.currentTarget.children[0].children[0].src = 'img/forum_modal_good_inactive.png';
    e.currentTarget.children[1].innerText = parseInt(e.currentTarget.children[1].innerText) - 1;
    e.currentTarget.children[1].style.color = '#9AA0A6';
    e.currentTarget.removeEventListener(e.type, decrement);
    e.currentTarget.addEventListener('click', increment);
  }

  const forumFormDiv = makeForumForm();

  function makeForumForm() {
    const formTitle = createElement('p', [ createTextNode('いいコメント書いてくれよな。') ], 'product-modal__forum-form-title');

    const input = createElement('input', []);
    input.type = 'hidden';

    const content = createElement('textarea', [], 'product-modal__forum-textarea');
    content.placeholder = 'ここに書くと投稿されるぜ。';
    content.required = 'true';

    const contentDiv = createElement('div', [ content ], 'product-modal__forum-textarea-div');

    const postBtn = createElement('button', [ createTextNode('投稿する') ], 'product-modal__forum-postbtn');
    postBtn.type = 'button';
    postBtn.addEventListener('click', insertForumData);

    const form = createElement('form', [ input, contentDiv, postBtn ]);
    form.name = 'postForm'

    return createElement('div', [ formTitle, form ], 'product-modal__forum-form-div');
  }

  // 投稿エリア作成
  function openForumForm(e) {
    // 画像変更
    e.currentTarget.children[0].src = 'img/forum_modal_post_active.png';

    // フォーム展開
    productModalContent.insertAdjacentElement('afterbegin', forumFormDiv);

    // イベント更新
    e.currentTarget.removeEventListener(e.type, openForumForm);
    e.currentTarget.addEventListener('click', closeForumForm);
  }

  // XHRで投稿登録 + 反映
  function insertForumData() {
    fetch('insert_forum_data.php', {
      method: 'POST',
      body: JSON.stringify({
        products_id: window.postProductData.id,
        content: content.value
      }),
      headers: {"Content-Type": "application/json"}
    }).then(response => {
      return response.json();
    }).then(json => {
      makeForumContent(json);

      content.value = '';
      formTitle.innerText = '投稿ありがとな！';
    });
  }

  // 投稿エリア閉じる
  function closeForumForm(e) {
    e.currentTarget.children[0].src = 'img/forum_modal_post_inactive.png';

    productModalContent.removeChild(productModalContent.children[0]);

    e.currentTarget.removeEventListener(e.type, closeForumForm);
    e.currentTarget.addEventListener('click', openForumForm);
  }

  // // ヘッダー開く + 中身変更
  const header = document.getElementById('headerArea');
  const headerStyle = window.getComputedStyle(header);

  header.addEventListener('click', (e) => {
    if(!canOpenHeader) return;
    changeHeaderSize(175, 275);
  });

  let canOpenHeader = true;
  function changeHeaderSize(endWidth, endHeight) {
    const startWidth = parseInt(headerStyle.width);
    const startHeight = parseInt(headerStyle.height);
    const diffWidth = endWidth - startWidth;
    const diffHeight = endHeight - startHeight;

    requestAnimationFrame(startTime => {
      update(startTime);

      function update(timeStamp) {
        // 進捗率 = 経過した時間 / 変化にかかる総時間
        progress = (timeStamp - startTime) / 200;

        progress = Math.min(progress, 1);

        if(progress > 0){
          header.style.width = (startWidth + diffWidth * progress) + 'px';
          header.style.height = (startHeight + diffHeight * progress) + 'px';
        }

        if(progress < 1){
          requestAnimationFrame(update);
        }else{
          if(canOpenHeader){
            canOpenHeader = false;
            header.replaceChild(gnav, header.children[0]); // 中身をグローバルナビゲーションに変更
          }else{
            canOpenHeader = true;
          }
        }
      }
    });
  }

  // gnavデータ作成
  const gnavItems = [];
  const gnavText = ['ログインする', '店舗検索をする', '掲示板を見る', 'お問い合わせをする', '閉じる'];
  const gnavFunc = [openLoginModal, openSearchStoreModal, openWholeForumModal, openContactModal, closeHeader];

  for(let i = 0; i < gnavText.length; i++){
    gnavItems.push({
      li: { className: 'header__gnav__item' },
      span: {
        className: 'header__gnav__item__mark',
        text: '▶'
      },
      p: {
        className: 'header__gnav__item__text',
        text: gnavText[i]
      },
      function: gnavFunc[i]
    });
  }
  console.log(gnavItems);

  // 要素ノード作成
  function createElement(tagName, children, className, idName) {
    const element = document.createElement(tagName);

    if(children.length > 0) children.forEach(child => { element.appendChild(child); });
    if(className) element.className = className;
    if(idName) element.id = idName;
    
    return element;
  }

  // グローバルナビの各項目作成
  function createGnavItem(item) {
    const span = createElement('span', [ createTextNode(item.span.text) ], item.span.className);
    const p = createElement('p', [ createTextNode(item.p.text) ], item.p.className);
    const li = createElement('li', [ span, p ], item.li.className);
    li.addEventListener('mousemove', viewMarkOfGnavitem);
    li.addEventListener('click', item.function);
    return li;
  }

  const gnav = createGnav(gnavItems);

  // グローバルナビ作成
  function createGnav(items) {
    const itemsArr = items.map(createGnavItem);
    return createElement('ul', itemsArr, 'header__gnav', 'headerGnav');
  }

  // これ以降のモーダルのDOM取得はinit関数スコープ直下で変数化しない(display:noneで作成のため)

  // サーバからログイン又は新規登録のエラーメッセージが返ってきたときに実行
  if(phpLoginError !== '' || phpSignupError !== '') openLoginModal();

  // ログインモーダル開く
  function openLoginModal() {
    document.getElementById('loginArea').style.display = 'block';
    document.getElementById('changeSignupAreaBtn').addEventListener('click', openSignupModal);
    document.signupForm.addEventListener('reset', closeSignupModal);
    document.signupForm.addEventListener('submit', checkPasswordSignupModal);
    document.getElementById('LoginModalHideBtn').addEventListener('click', closeLoginModal);
  }

  // ログインモーダル閉じる
  function closeLoginModal() {
    if(phpLoginError !== '' || phpSignupError !== ''){
      document.getElementById('loginAreaError').style.display = 'none';
    }
    document.getElementById('loginArea').style.display = 'none';
  }

  // 店舗検索モーダル開く
  function openSearchStoreModal() {}

  // 全体掲示板を開く
  function openWholeForumModal() {}

  // お問い合わせモーダルを開く
  function openContactModal() {
    document.getElementById('contactArea').style.display = 'block';
  }

  // 新規登録モーダル開く
  function openSignupModal() {
    document.getElementById('loginArea').style.display = 'none';
    document.getElementById('signupArea').style.display = 'block';
  }

  // 新規登録モーダル閉じる
  function closeSignupModal() {
    if(confirm('入力内容が初期化されます。\nログインモーダルに戻りますか？')){
      document.getElementById('signupAreaError').textContent = '';
      document.getElementById('signupArea').style.display = 'none';
      document.getElementById('loginArea').style.display = 'block';
      return;
    }
    return false;
  }

  // 新規登録モーダルのパスワードチェック
  function checkPasswordSignupModal(e) {
    const form = document.signupForm;
    if(form.password.value !== form.confirm_password.value){
      document.getElementById('signupAreaError').textContent = 'パスワードと確認用パスワードが一致していません。';
    }else{
      document.getElementById('signupAreaError').textContent = '';
      openSignupConfirmModal();
    }
    e.preventDefault();
  }

  // 新規登録確認モーダル開く
  function openSignupConfirmModal() {
    const signupModal = document.getElementById('signupArea');
    const signupConfirmModal = document.getElementById('signupConfirmArea');
    const signupForm = document.signupForm;
    const signupConfirmForm = document.signupConfirmForm;

    // 入力内容を入力内容確認モーダルにコピー
    signupConfirmForm.id.value = signupForm.id.value;
    signupConfirmForm.password.value = signupForm.password.value;
    signupConfirmForm.confirm_password.value = signupForm.confirm_password.value;
    signupConfirmForm.name.value = signupForm.name.value;
    signupConfirmForm.kananame.value = signupForm.kananame.value;
    signupConfirmForm.nickname.value = signupForm.nickname.value;

    console.log(signupModal);
    console.log(signupConfirmModal);
    console.log(document.getElementById('backToSignupModalBtn'))

    document.getElementById('backToSignupModalBtn').addEventListener('click', () => {
      signupConfirmModal.style.display = 'none';
      signupModal.style.display = 'block';
    });

    signupModal.style.display = 'none';
    signupConfirmModal.style.display = 'block';
  }

  // 一時的なDOMツリー作成
  function createFragment(children) {
    const fragment = document.createDocumentFragment();
    if(children) children.forEach(child => fragment.appendChild(child));
    return fragment;
  }

  // テキストノード作成ショートカット
  function createTextNode(text) {
    return document.createTextNode(text);
  }

  // ヘッダー閉じる
  function closeHeader() {
    if(canOpenHeader) return;
    header.replaceChild(hamburgerMenuDiv, header.children[0]); // 中身をハンバーガーメニューに変更
    changeHeaderSize(50, 50);
  }

  // グローバルナビゲーションに触れた時、マーク表示
  function viewMarkOfGnavitem(e) {
    const headerGnav = document.getElementById('headerGnav');
    for(let i = 0; i < headerGnav.children.length; i++){
      headerGnav.children[i].children[0].style.opacity = '0';
    }
    e.currentTarget.children[0].style.opacity = '1';
  }

  const hamburgerMenuDiv = makeHamburgerMenuDiv();

  // ハンバーガーメニュー要素作成
  function makeHamburgerMenuDiv() {
    const spanArr = [];
    for(let i = 0; i < 3; i++) spanArr.push(createElement('span', []));

    return createElement('div', spanArr, 'header__hamburger-menu');
  }

  // カメラボタンにマウスオーバー時、マーク表示
  // for(let i = 0; i < cambtnArea.children.length; i++){
  //   cambtnArea.children[i].addEventListener('mouseover', (e) => {
  //     for(let i = 0; i < cambtnArea.children.length; i++){
  //       cambtnArea.children[i].children[0].style.opacity = '0';
  //     }
  //     e.currentTarget.children[0].style.opacity = '1';
  //   })
  // }

  // カートに商品追加時、メッセージ出力
  const viewMessageArea = document.getElementById('viewMessageArea');
  const viewMessageAreaStyle = window.getComputedStyle(viewMessageArea);
  const viewMessage = document.getElementById('viewMessage');
  
  let canPreparedAddToCart = true;
  function viewMessageAsAddToCart(end, message) {
    // カートボタン連打時、メッセージ表示の重複回避
    if(!canPreparedAddToCart) return;
    canPreparedAddToCart = false;

    viewMessage.innerText = message;
    viewMessageArea.style.display = 'block';

    const startOpacity = parseFloat(viewMessageAreaStyle.opacity);
    const endOpacity = end;
    const diffOpacity = endOpacity - startOpacity;

    requestAnimationFrame(startTime => {
      update(startTime);

      function update(timeStamp) {
        // 進捗率 = 経過した時間 / 変化にかかる総時間
        progress = (timeStamp - startTime) / 500;

        progress = Math.min(progress, 1);

        if(progress > 0) viewMessageArea.style.opacity = startOpacity + diffOpacity * progress;

        if(progress < 1){
          requestAnimationFrame(update);
        }else{
          if(end === 0){
            viewMessageArea.style.display = 'none';
            canPreparedAddToCart = true;
            return;
          }
          setTimeout(() => {
            canPreparedAddToCart = true;
            viewMessageAsAddToCart(0, message);
          }, 2100);
        }
      }
    });
  }

  // 購入ボタン押下時、購入詳細モーダル表示
  const buyDetailModal = document.getElementById('buyDetailModal');
  document.getElementById('cartAreaRegiBtn').addEventListener('click', () => {
    const results = getProductsInCart();
    console.log(results)
    const buyDetailModalCartList = document.getElementById('buyDetailModalCartList');

    for(let i = 0; i < results.length; i++){
      const result = results[i];

      const li = document.createElement('li');
      li.classList.add('buy-detail-modal__left-area__item');
      buyDetailModalCartList.appendChild(li);

      const itemLeft = document.createElement('div');
      itemLeft.className = 'buy-detail-modal__left-area__item-left';
      li.appendChild(itemLeft);

      const itemRight = document.createElement('div');
      itemRight.className = 'buy-detail-modal__left-area__item-right';
      li.appendChild(itemRight);

      const imgDiv = document.createElement('div');
      imgDiv.classList.add('buy-detail-modal__left-area__img-wrapper');
      itemLeft.appendChild(imgDiv);

      const img = document.createElement('img');
      img.src = `img/${result.value.imgURL}.png`;
      imgDiv.appendChild(img);

      const p1 = document.createElement('p');
      p1.classList.add('buy-detail-modal__left-area__product-name');
      p1.innerText = result.value.name;
      itemRight.appendChild(p1);

      const div2 = document.createElement('div');
      div2.classList.add('buy-detail-modal__left-area__select-price-delete');
      itemRight.appendChild(div2);

      const select = document.createElement('select');
      select.classList.add('buy-detail-modal__left-area__select');
      div2.appendChild(select);
      select.addEventListener('change', () => {
        if(select.selectedIndex === 0){ // option[0]はカートから削除
          deleteStorage(result.key);
        }else{ // localStorage(該当商品のquantity)更新
          const value = JSON.parse(storage.getItem(result.key));
          value.selectedQuantity = select.selectedIndex;
          storage.setItem(result.key, JSON.stringify(value));
        }
        viewLocalStorage();
      });

      // 在庫数分のoption作成
      for(let i = 0; i <= result.value.stock; i++){
        const option = document.createElement('option');
        option.value = i;
        option.innerText = i;
        if(i === 0) option.innerText = `${i}(削除)`;
        if(i === result.value.selectedQuantity) option.selected = true;
        select.appendChild(option);
      }
      // sumSelectedQuantity += result.value.selectedQuantity;

      const p2 = document.createElement('p');
      p2.classList.add('buy-detail-modal__left-area__product-price');
      const price = parseInt(result.value.price) * parseInt(result.value.selectedQuantity);
      // sumPrice += price;
      p2.innerText = `${price}円`;
      div2.appendChild(p2);

      const div3 = document.createElement('div');
      div3.classList.add('buy-detail-modal__left-area__delete-btn');
      div3.innerText = '削除';
      div2.appendChild(div3);

      // カート内商品削除、localStorageから指定キーに対する値を削除
      div3.addEventListener('click', () => { deleteStorage(result.key); });
    }

    buyDetailModal.style.display = 'block';
  });

  scene.add(new THREE.AxisHelper(1500))
}

window.addEventListener('load', () => {
  if(typeof localStorage === 'undefined'){
    window.alert('このブラウザではWeb Storage機能が実装されていません。\n他のブラウザを使用することを推奨します。');
  }else{
    // window.alert('このブラウザではWeb Storage機能が実装されています。');
  }
});
