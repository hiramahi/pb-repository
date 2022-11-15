// 外部リソースが読み込まれる前に実行
window.addEventListener('DOMContentLoaded', firstInit);

function firstInit() {
  const displayArea = document.getElementById('displayArea');
  let width = displayArea.getBoundingClientRect().width;
  let height = displayArea.getBoundingClientRect().height;

  // レンダラーを作成
  const canvas = document.getElementById('renderingArea');
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas, // html上のどのcanvas要素と紐づけるか
    antialias: true,
    alpha: true
  });

  // デバイスごとに解像度を調整する
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setSize(width, height);

  // テクスチャをガンマ補正
  // 光が当たっているところの白とびを抑える、暗すぎるところを明るくする、といった自動で色空間の調整を行ってくれる
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;

  // 影を有効にする
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // シーンを作成
  const scene = new THREE.Scene();

  // // フォグを設定(色, 開始距離, 終点距離)
  // scene.fog = new THREE.Fog(0x333333, 1000, 20000);

  // xyz軸(補助線)
  scene.add(new THREE.AxisHelper(1500));

  // カメラを作成
  // const camera = new THREE.PerspectiveCamera(45, width / height, 1, 60000);
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 600000);
  // camera.position.set(0, 6000, 0);
  camera.position.set(0, 12530.046668032428, 0)
  // scene.add(camera); // ライトを追従させるために追加する

  // ライトを作成(環境光源 = 3D空間全体に均等に当てる光)
  // scene.add(new THREE.AmbientLight(0xffffff)); // これ使う
  scene.add(new THREE.AmbientLight(0x666666));

  // ライトを作成(平行光源 = 太陽光のように一定方向から差し込む光)
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(9343.224761177347, 3813.073145443687, -3071.7958900095587);
  // camera.add(directionalLight); // カメラに追従させるために追加する
  
  directionalLight.castShadow = true; // ライトに影を有効にする
  directionalLight.shadow.camera.near = 100;
  directionalLight.shadow.camera.far = 16000;
  directionalLight.shadow.camera.right = 6000;
  directionalLight.shadow.camera.left = -5000;
  directionalLight.shadow.camera.top = -2000;
  directionalLight.shadow.camera.bottom = 6000;
  // directionalLight.shadow.mapSize.set(1024, 1024);
  scene.add(directionalLight);

  // 平行光源のヘルパー作成
  // scene.add(new THREE.CameraHelper(directionalLight.shadow.camera));

  // カメラコントローラを作成(camera系クラスのオブジェクト, マウス操作対象とするDOM要素)
  // 第2引数を省略した場合、ブラウザ全体がマウス操作の対象となる
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  // カメラに制限をかける
  controls.enablePan = false; // 横移動不可
  controls.enableRotate = false;
  controls.enableZoom = false;

  const loader = new THREE.GLTFLoader();

  // glbファイル読込(全体マップ)
  loader.load(
    'http://localhost/hew_211214_toppage/glb/map12_hew15.glb',
    (gltf) => {
      const model = gltf.scene;
      model.name = 'map';
      model.scale.set(100, 100, 100);
      model.position.set(0, -50, 0);
      scene.add(model);
      // scene.traverse((model) => {
      //   model.castShadow = true;
      //   model.receiveShadow = true;
      // });
    },
    () => { console.log('progress rendering'); },
    () => { console.log('An error happened'); }
  );

  // 動径を求める(不変)
  const x = 9089.731605047518;
  const y = 6532.303588176477;
  const z = -6763.753409934909;
  const xSquared = Math.pow(x, 2);
  const ySquared = Math.pow(y, 2);
  const zSquared = Math.pow(z, 2);
  const radius = Math.sqrt(xSquared + ySquared + zSquared);

  // 初期のマウス位置を設定
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  // 初期の天頂角と偏角を取得
  let theta = Math.acos(y / radius);
  let phi = Math.sign(z) * Math.acos(x / Math.sqrt(xSquared + zSquared));

  // マウス動かしたときスクリーン座標取得
  document.querySelector('html body').addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // 毎フレーム実行させる
  let requestId = 0;
  tick();

  function tick() {
    // カメラコントローラーを更新
    controls.update();

    // マウスが動いたときにカメラ位置アニメーション
    let targetTheta = (mouseY / height) * 20 + 50; // 天頂角(θ)を求める(範囲は30~60)
    let targetPhi = (mouseX / width) * -20 - 20; // 偏角(φ)を求める(範囲は-30~-60)

    // イージングの公式を使って滑らかにする
    theta += (targetTheta - theta) * 0.02;
    phi += (targetPhi - phi) * 0.02;

    // ラジアンに変換
    const radTheta = theta * (Math.PI / 180);
    const radPhi = phi * (Math.PI / 180);

    // 各座標を求めた後に反映
    const endX = radius * Math.sin(radTheta) * Math.cos(radPhi);
    const endY = radius * Math.cos(radTheta);
    const endZ = radius * Math.sin(radTheta) * Math.sin(radPhi);
    camera.position.copy(new THREE.Vector3(endX, endY, endZ));

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //レンダリング
    renderer.render(scene, camera);

    // 更新が完了したら再度呼び出す
    requestId = requestAnimationFrame(tick);
  }

  // リサイズ処理
  window.addEventListener('resize', () => {
    // 新しくサイズを取得
    width = displayArea.getBoundingClientRect().width;
    height = displayArea.getBoundingClientRect().height;

    // レンダラーのサイズを調整する
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // カメラのアスペクト比を正す
    camera.aspect = width / height;

    // カメラの内部状態を更新する
    camera.updateProjectionMatrix();
  });


  // 店舗ページ用の処理(一度だけ実行する処理 = secondInitが呼ばれる度に実行したくない処理) //////////////////////

  // 各商品のワールド座標
  const productWorldCoords = {
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
  for(let i = 0; i < jsonProducts.length; i++){
    jsonProducts[i].x = productWorldCoords.x[i];
    jsonProducts[i].y = productWorldCoords.y[i];
    jsonProducts[i].z = productWorldCoords.z[i];
  }
  console.log(jsonProducts);

  //3Dオブジェクトをグループ化してsceneに配置する⇒グループ全体に操作をかけれるようになる
  const wrap = new THREE.Group();
  wrap.name = 'wrap';
  scene.add(wrap);

  // glbファイル読込(商品)
  for(let i = 0; i < jsonProducts.length - 269; i++){
    const url = 'http://localhost/hew_211214_toppage/glb/' + jsonProducts[i].imgURL + '.glb';
    loader.load(
      url,
      (gltf) => {
        const modal = gltf.scene;
        modal.name = jsonProducts[i].name;
        modal.scale.set(25.0, 25.0, 25.0);
        modal.position.set((jsonProducts[i].x / 4), ((jsonProducts[i].y - 200) / 4), (jsonProducts[i].z / 4));
        wrap.add(modal);
      },
      undefined,
      undefined
    );
  }

  // 棚データ作成
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

  let canPrepared = true;
  let tempRackNum = -1;
  const cambtnArea = document.getElementById('cambtnArea');

  // 各棚ボタンにイベント発行
  for(let i = 0; i < rackData.length; i++){
    cambtnArea.children[i+1].addEventListener('click', (e) => {
      if(!canPrepared) return;
      canPrepared = false;

      tempRackNum = i;
      document.getElementById('camLeftBtn').style.opacity = '1';
      document.getElementById('camRightBtn').style.opacity = '1';
      
      // preMoveCamera(moveCamera, rackData[i].deg, rackData[i].x, rackData[i].z);
      moveCamera(rackData[i].deg);

      // changeCamBtnStyle(tempRackNum);
    });
  }

  // カメラボタンのスタイル更新
  function changeCamBtnStyle(rackNum) {
    for(let i = 1; i <= rackData.length; i++) cambtnArea.children[i].style.backgroundColor = 'black';
    cambtnArea.children[rackNum+1].style.backgroundColor = '#2C92C5';
  }


  let startX = startZ = endX = endZ = diffX = diffZ = progress = 0;
  const time = 1000, maxRadius = 800;

  // カメラ移動(棚ボタン)(前処理)
  // function preMoveCamera(callback, deg, x, z) {
  //   startX = camera.position.x;
  //   startZ = camera.position.z;

  //   let radius = Math.sqrt(Math.pow(startX, 2) + Math.pow(startZ, 2)); // 半径を求める
  //   const xTimes = maxRadius / radius; // 何倍か

  //   endX = startX * xTimes;
  //   endZ = startZ * xTimes;
  //   // よって、Math.sqrt(Math.pow(endX, 2) + Math.pow(endZ, 2)) === 3000 になる

  //   diffX = endX - startX;
  //   diffZ = endZ - startZ;

  //   requestAnimationFrame(startTime => {
  //     update(startTime);

  //     function update(timeStamp) {
  //       // 進捗率 = 経過した時間 / 変化にかかる総時間
  //       progress = (timeStamp - startTime) / time;

  //       progress = Math.min(progress, 1);

  //       if(progress > 0){
  //         const resultX = startX + diffX * progress;
  //         const resultZ = startZ + diffZ * progress;
  //         camera.position.copy(new THREE.Vector3(resultX, camera.position.y, resultZ));
  //       }

  //       if(progress < 1){
  //         requestAnimationFrame(update);
  //       }else{
  //         callback(deg, x, z);
  //       }
  //     }
  //   });
  // }

  // カメラ移動(棚ボタン)(メイン処理)
  function moveCamera(deg) {
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
          // postMoveCamera(x, z);
          canPrepared = true; // pre or postMoveCamera使うなら不要
        }
      }
    });
  }

  // // カメラ移動(棚ボタン)(後処理)
  // function postMoveCamera(x, z) {
  //   startX = camera.position.x;
  //   startZ = camera.position.z;
  //   endX = x;
  //   endZ = z;
  //   diffX = endX - startX;
  //   diffZ = endZ - startZ;

  //   requestAnimationFrame(startTime => {
  //     update(startTime);

  //     function update(timeStamp) {
  //       // 進捗率 = 経過した時間 / 変化にかかる総時間
  //       progress = (timeStamp - startTime) / time;

  //       progress = Math.min(progress, 1);

  //       if(progress > 0){
  //         const resultX = startX + diffX * progress;
  //         const resultZ = startZ + diffZ * progress;
  //         camera.position.copy(new THREE.Vector3(resultX, camera.position.y, resultZ));
  //       }

  //       if(progress < 1){
  //         requestAnimationFrame(update);
  //       }else{
  //         // addEventListenerのcallback内では非同期実行⇒最も終わるのが遅い処理の直前でtrueにする
  //         canPrepared = true;
  //       }
  //     }
  //   });
  // }

  // カメラ移動(棚ボタン)(左移動)
  // document.getElementById('camLeftBtn').addEventListener('click', () => {
  //   if(!canPrepared) return;
  //   canPrepared = false;

  //   // 次に移動する棚を求める
  //   if(tempRackNum > 0){ tempRackNum -= 1; }
  //   else if(tempRackNum === 0){ tempRackNum = 11; }

  //   preMoveCamera(moveCamera, rackData[tempRackNum].deg, rackData[tempRackNum].x, rackData[tempRackNum].z);

  //   changeCamBtnStyle(tempRackNum);
  // });

  // カメラ移動(棚ボタン)(右移動)
  // document.getElementById('camRightBtn').addEventListener('click', () => {
  //   if(!canPrepared) return;
  //   canPrepared = false;

  //   // 次に移動する棚を求める
  //   if(tempRackNum < 11){ tempRackNum += 1; }
  //   else if(tempRackNum === 11){ tempRackNum = 0; }

  //   preMoveCamera(moveCamera, rackData[tempRackNum].deg, rackData[tempRackNum].x, rackData[tempRackNum].z);

  //   changeCamBtnStyle(tempRackNum);
  // });

  // カメラ位置リセット、角度も初期化要
  document.getElementById('camReset').addEventListener('click', () => {
    tempRackNum = -1;
    for(let i = 1; i <= rackData.length; i++) cambtnArea.children[i].style.backgroundColor = 'black';
    controls.reset();
  });

  // カメラ移動(汎用)
  function cameraAnimation(x, y, z) {
    const startX = camera.position.x;
    const startY = camera.position.y;
    const startZ = camera.position.z;

    const diffX = x - startX;
    const diffY = y - startY;
    const diffZ = z - startZ;

    requestAnimationFrame(startTime => {
      update(startTime);

      function update(timeStamp) {
        // 進捗率 = 経過した時間 / 変化にかかる総時間
        progress = (timeStamp - startTime) / 1000;

        progress = Math.min(progress, 1);

        if(progress > 0){
          const resultX = startX + diffX * progress;
          const resultY = startY + diffY * progress;
          const resultZ = startZ + diffZ * progress;
          camera.position.copy(new THREE.Vector3(resultX, resultY, resultZ));
        }

        if(progress < 1) requestAnimationFrame(update);
      }
    });
  }

  const cartArea = document.getElementById('cartArea');
  const cartAreaStyle = window.getComputedStyle(cartArea);
  const enterStoreBtn = document.getElementById('enterStoreBtn');

  // カート領域の拡大縮小
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

  // コントローラー設定
  function setControls(x, z) {
    const xSquared = Math.pow(x, 2);
    const zSquared = Math.pow(z, 2);
    const radius = Math.sqrt(xSquared + zSquared);

    controls.minPolarAngle = Math.PI / 2.25; // 天井に行かせない
    controls.maxPolarAngle = Math.PI / 2.25; // 地下に行かせない
    controls.maxDistance = 800; /////////////////////////////////////////////////////////////////////////////// ここ調整要
    // controls.maxDistance = radius + 50; // 遠ざかれる距離の最大値
    console.log(radius, controls.maxDistance);
    controls.minDistance = 550; // 近づける距離の最大値
  }

  // ピッキング関連処理 /////////////////////////////////////////////////////////////

  // マウス座標管理用のベクトルを作成
  const mouse = new THREE.Vector2();
  const ray = new THREE.Raycaster();

  //3Dオブジェクトを格納する変数
  // const targetList = [];
  // targetList.push(model);
  let obj;

  const productModal = document.getElementById('productModal');
  const productModalStyle = window.getComputedStyle(productModal);

  function dblclickObj(e) {
    console.log('start');
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

    controls.enabled = true;

    console.log('progress');

    // 交差判定
    if(obj.length === 0) return;
    console.log('ok');

    // xhrでデータ取得
    fetch('get_product_data.php', {
      method: 'POST',
      body: JSON.stringify({
        stores_id: 1, //////////////////////////////////////////////////////////////// 後で訂正
        products_name: obj[0].object.parent.name
      }),
      headers: {"Content-Type": "application/json"}
    }).then(response => {
      return response.json();
    }).then(json => {
      window.postProductData = Object.assign({}, json);
      console.log(window.postProductData);
    }).then(() => {
      makeModalPackage();
    });

    // 既にモーダルが表示されていれば、そのモーダルを閉じる
    // if(productModal.className === 'product-modal'){ ////////////////////////////////////////////// エラー箇所
    //   console.log(true);
    //   slideModal(-310);
    //   setTimeout(() => { makeModalPackage(); }, 600);
    // }else{
    //   makeModalPackage();
    // }
    console.log('end');
  }

  // 3Dオブジェクトマウスムーブ処理 ///////////////////////////////////////////////////////////////

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

  // モーダル作成の一連の処理 //////////////////////////////////////////////////////////////////////
  const productModalContent = document.getElementById('productModalContent');
  function makeModalPackage() {
    // productModal.classList.replace('product-modal', 'product-modal-active');
    productModal.style.display = 'block';

    console.log(productModalStyle.zIndex);

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

  // 一時的なDOMツリー作成
  function createFragment(children) {
    const fragment = document.createDocumentFragment();
    if(children) children.forEach(child => fragment.appendChild(child));
    return fragment;
  }

  // カート機能 //////////////////////////////////////////////////////////////////////////////
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

  // カート表示、localStorageのキーと値を取得 + DOM作成
  viewLocalStorage();
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
      const li = createElement('li', [ createTextNode(`*「${jsonUserName.name}さんのカートに商品は入ってないよ。`) ], 'cart-area__item-empty');
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


  // 初期化処理を店舗ページ用の処理に更新 ////////////////////////////////////////////////////////////////////////////////
  document.getElementById('logoArea').addEventListener('click', function secondInitWrap(e) {
    e.currentTarget.removeEventListener(e.type, secondInitWrap); // 後で消す
    secondInit();
  });

  // 店舗ページ用初期化処理
  function secondInit() {
    // displayArea.style.zIndex = 1;

    // カメラの制限を解除
    // controls.enablePan = true;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.1; // マウス回転スピードを下げる(デフォルトは1)
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;
    console.log(controls);

    // アニメーションの停止
    cancelAnimationFrame(requestId);

    // 店の前までカメラ移動(ロゴクリック後)
    (function (x, y, z) {
      cameraAnimation(x, y, z);

      setTimeout(() => { enterStoreBtn.classList.add('enter-store-btn-active'); }, 1000);
    })(2780.9729880045456, 888.2437839272408, -817.3945575723257);

    // 店の中に入る(店の前までカメラ移動後)
    enterStoreBtn.addEventListener('click', function enterStore(e) {
      e.currentTarget.removeEventListener(e.type, enterStore);
      e.currentTarget.classList.remove('enter-store-btn-active');

      // カメラ回転での最大半径を求めるための座標
      const x = 722.0517215086305;
      const z = -209.5004772684191;

      cameraAnimation(x, 134.4760763295645, z); // ドアを超える
      setTimeout(() => {
        cameraAnimation(381.93172735910605, 122.68304740750044, -649.9307494876437); // カメラの初期位置まで回転
        cartArea.classList.add('cart-area-active');
        cambtnArea.classList.add('cambtn-area-active');
        setControls(x, z);
      }, 1000);
    });

    // displaynone
    // document.querySelector('body').style.overflow = 'hidden';
    // displayArea.style.position = 'relative';
    // document.getElementById('loginArea').style.display = 'none';
    // document.getElementById('contactFooterArea').style.display = 'none';
    // document.getElementById('storeSearchArea').style.display = 'none';

    // ピッキングを有効にする
    canvas.addEventListener('dblclick', dblclickObj); // 処理がinitに戻った時にremoveする、後で変更

    // 商品オブジェに対してmousemoveを有効にする
    canvas.addEventListener('mousemove', mouseMoveObj); // 上記と同様

    // マウスが乗った時、カート領域拡大
    cartArea.addEventListener('mouseover', () => {
      // if(cartArea.children[0].children[0].className == 'cart-area__item-empty') return;
  
      // 商品詳細モーダルが表示されているなら閉じる
      // if(productModalStyle.display == 'block') slideModal(-310);
  
      changeHeightOfCartArea(250);
    });

    // マウスから離れたとき、カート領域縮小
    cartArea.addEventListener('mouseout', () => { changeHeightOfCartArea(100); });

    document.getElementById('camRightBtn').addEventListener('click', () => {
      console.log(controls);
    })




    // 毎フレーム呼び出す関数を変更
    tick2();
    function tick2() {
      // カメラコントローラーを更新
      controls.update();

      // ヘルパーを更新
      // lightHelper.update();

      // if(directionalLight){
      //   directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z);
      //   directionalLight.quaternion.copy(camera.quaternion);
      // }

      // // 全てのmodalの向きをカメラに追従させる(どの角度から見ても正面にする)
      // // カメラの回転角と回転させたいオブジェを同調させる
      // for(let i = 0; i < wrap.children.length; i++){
      //   if(wrap.children[i]) wrap.children[i].quaternion.copy(camera.quaternion);
      // }

      // if(productObj.length > 0){
      //   canvas.style.cursor = 'pointer';
      //   viewProductNameArea.style.display = 'inline-block';
      //   viewProductNameArea.style.left = (screenMouse.x + 25) + 'px';
      //   viewProductNameArea.style.top = (screenMouse.y - 25) + 'px';
      //   if(viewProductNameArea.textContent !== productObj[0].object.parent.name){
      //     viewProductNameArea.textContent = productObj[0].object.parent.name;
      //   }
      // }else{
      //   canvas.style.cursor = 'not-allowed';
      //   viewProductNameArea.textContent = '';
      //   viewProductNameArea.style.display = 'none';
      // }

      camera.lookAt(new THREE.Vector3(0, 0, 0));

      //レンダリング
      renderer.render(scene, camera);

      // 更新が完了したら再度呼び出す
      requestId = requestAnimationFrame(tick2);
    }
  }

  // 後で消す
  document.getElementById('logoArea').addEventListener('dblclick', () => {
    console.log(`${camera.position.x}, ${camera.position.y}, ${camera.position.z}`);
  });

  // Three.js以外の処理 ///////////////////////////////////////////////////////////////////////////////////

  // 要素ノード作成ショートカット
  function createElement(tagName, children, className, idName) {
    const element = document.createElement(tagName);

    if(children.length > 0) children.forEach(child => { element.appendChild(child); });
    if(className) element.className = className;
    if(idName) element.id = idName;
    
    return element;
  }

  // テキストノード作成ショートカット
  function createTextNode(text) {
    return document.createTextNode(text);
  }

  // グローバルナビ関連処理 ////////////////////////////////////////////////////////////
  let canOpenHeader = true;
  const header = document.getElementById('headerArea');
  const headerStyle = window.getComputedStyle(header);
  const overlayArea = document.getElementById('overlayArea');
  console.log(overlayArea);

  // ヘッダー開く
  header.addEventListener('click', () => {
    if(!canOpenHeader) return;
    changeHeaderSize(175, 275);
  });

  // ヘッダー閉じる
  function closeHeader(e) {
    if(canOpenHeader) return;
    header.replaceChild(hamburgerMenuDiv, header.children[0]); // 中身をハンバーガーメニューに変更
    changeHeaderSize(50, 50);
    e.preventDefault();
  }

  // ハンバーガーメニュー要素作成
  const hamburgerMenuDiv = (function() {
    const spanArr = [];
    for(let i = 0; i < 3; i++) spanArr.push(createElement('span', []));

    return createElement('div', spanArr, 'header-area__hamburger-menu');
  })();

  // ヘッダーサイズ変更処理
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
            resetGnavItemMark();
            overlayArea.classList.add('overlay-area-active'); // overlayを作成
          }else{
            canOpenHeader = true;
          }
        }
      }
    });
  }

  // overlayを解除
  overlayArea.addEventListener('click', (e) => {
    e.currentTarget.classList.remove('overlay-area-active');
    closeHeader(e);
  });

  // gnavデータ作成
  const gnavItems = [];
  const gnavHrefs = [ '#storeSearchArea', '#loginArea', '#contactArea', '' ];
  const gnavTexts = [ '店舗検索をする', 'ログインする', 'お問い合わせをする', '閉じる' ];

  for(let i = 0; i < gnavTexts.length; i++){
    gnavItems.push({
      li: { className: 'header-area__gnav__item' },
      a: { href: gnavHrefs[i] },
      span: { text: '▶', className: 'header-area__gnav__item__mark' },
      p: { text: gnavTexts[i], className: 'header-area__gnav__item__text' }
    });
  }

  // グローバルナビ作成
  const gnav = (function (items) {
    const itemsArr = items.map(createGnavItem);
    itemsArr[3].children[0].addEventListener('click', (e) => { closeHeader(e); });
    return createElement('ul', itemsArr, 'header-area__gnav', 'headerGnav');
  })(gnavItems);

  // グローバルナビの各項目作成
  function createGnavItem(item) {
    const span = createElement('span', [ createTextNode(item.span.text) ], item.span.className);
    const p = createElement('p', [ createTextNode(item.p.text) ], item.p.className);
    const a = createElement('a', [ span, p ]);
    a.href = item.a.href;
    const li = createElement('li', [ a ], item.li.className);
    li.addEventListener('mousemove', markOnGnavItem);
    return li;
  }

  // グローバルナビの選択マークをリセット
  function resetGnavItemMark() {
    const gnavItems = document.getElementsByClassName('header-area__gnav__item__mark');
    for(let i = 0; i < gnavItems.length; i++) gnavItems[i].style.opacity = '0';
  }

  // グローバルナビの選択マークを取得
  function getGnavItemMarkPosition() {
    let markedNum = -1;
    const gnavItems = document.getElementsByClassName('header-area__gnav__item__mark');

    for(let i = 0; i < gnavItems.length; i++){
      const gnavItemStyle = window.getComputedStyle(gnavItems[i]);
      if(gnavItemStyle.opacity == '1'){
        markedNum = i;
        break;
      }
    }
    return markedNum;
  }

  // グローバルナビゲーションに触れた時、マーク表示
  function markOnGnavItem(e) {
    resetGnavItemMark();
    e.currentTarget.children[0].children[0].style.opacity = '1';
  }

  // キーダウンでマーク位置移動
  document.addEventListener('keydown', (e) => {
    if(canOpenHeader || !(e.key === 'w' || e.key === 'ArrowUp' || e.key === 's' || e.key === 'ArrowDown')) return;

    const num = getGnavItemMarkPosition(); // 現在のマーク位置取得
    resetGnavItemMark(); // 現在のマークリセット

    let nextNum = 0;
    if(num === -1){
      nextNum = 0;
    }else if(e.key === 'w' || e.key === 'ArrowUp'){
      nextNum = (num === 0) ? 3 : (num - 1);
    }else if(e.key === 's' || e.key === 'ArrowDown'){
      nextNum = (num === 3) ? 0 : (num + 1);
    }

    document.getElementsByClassName('header-area__gnav__item__mark')[nextNum].style.opacity = '1';
    e.preventDefault(); // 画面スクロールさせない
  });

  // Enterでページ内をスムーズスクロール
  document.addEventListener('keydown', (e) => {
    if(canOpenHeader || e.key !== 'Enter') return;

    const num = getGnavItemMarkPosition();
    if(num !== -1) document.getElementsByClassName('header-area__gnav__item__mark')[num].click();
  });

  ////////////////////////////////////////////////////////////////////////////ここまでがグローバルナビ処理
}
