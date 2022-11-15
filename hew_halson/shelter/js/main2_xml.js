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
  });
  
  // デバイスごとに解像度を調整する
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setSize(width, height);
  renderer.setClearColor(0xAA9966, 1);

  // テクスチャをガンマ補正
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;  

  // シーンを作成
  const scene = new THREE.Scene();

  // テクスチャ読み込み
  const texEqu = new THREE.TextureLoader().load('http://localhost/hew_211214_toppage/img/px6.png');
  texEqu.anisotropy = renderer.getMaxAnisotropy();
  texEqu.mapping = THREE.UVMapping;

  // 背景用ジオメトリ生成、THREE.SphereGeometry(radius, widthSegments, heightSegments)
  const sphereGeometry = new THREE.SphereGeometry(10000, 32, 32);
  sphereGeometry.scale(-1, 1, 1); // コレを指定しないと背景が左右反転してしまう
  const mat = new THREE.MeshBasicMaterial({
    map: texEqu,
    fog: false,
  });
  bgMesh = new THREE.Mesh(sphereGeometry, mat);
  scene.add(bgMesh);

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(60, width / height, 1, 30000);
  camera.position.set(1996.8009497246335, 496.99502557499625, -638.2546977217146);
  scene.add(camera); // // ライトを追従させるために追加する

  // ライトを作成(平行光源 = 太陽光のように一定方向から差し込む光)
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z);
  scene.add(directionalLight);
  camera.add(directionalLight); // カメラに追従させるために追加する

  // ライトを作成(環境光源 = 3D空間全体に均等に当てる光)
  const ambientLight = new THREE.AmbientLight(0x666666);
  scene.add(ambientLight);

  // 地面を作成
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000, 1, 1),
    new THREE.MeshLambertMaterial({
      map: THREE.ImageUtils.loadTexture('http://localhost/hew_211214_toppage/img/marble_01_diff_4k.jpg')
    })
  );
  plane.rotation.x = Math.PI / -2;
  scene.add(plane);
  
  // glbファイル読込(商品棚)
  // loader.load(url, onSuccessCallback, onProgressCallback, onErrorCallback);
  // 非同期処理のため、urlの読み込みが完了するまで以下のいずれかのコールバック関数は実行されない
  // ⇒ targetListにmodel1を代入したのに中身がnullだったのは、代入処理がモデル取得処理の前だったから

  // 読み込んだデータはJSON形式で引数として渡される（構造はオブジェクト型）、
  // そのデータのsceneプロパティが必要なデータ（モデル） ⇒ コンソールで確認済み
  const loader = new THREE.GLTFLoader();
  let model = null;
  loader.load(
      'http://localhost/hew_211214_toppage/glb/hew7.glb',
      // Function when resource is loaded
      (gltf) => {
        model = gltf.scene; // モデルを取得、sceneオブジェクトのインスタンス
        model.name = "main";
        model.scale.set(400.0, 400.0, 400.0);
        model.position.set(0, 0, 0);
        scene.add(model);
        console.log('Finished loading');
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
        modal.position.set(jsonProductData[i].x, jsonProductData[i].y, jsonProductData[i].z);
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
  controls.minPolarAngle = Math.PI / 2.8; // 天井に行かせない
  controls.maxPolarAngle = Math.PI / 2.15; // 地下に行かせない

  // ズーム制御
  // controls.maxDistance = 2400; // 遠ざかれる距離の最大値
  // controls.maxDistance = 10000; // 仮
  controls.minDistance = 1400; // 近づける距離の最大値

  // マウス回転スピードを下げる(デフォルトは1)
  controls.rotateSpeed = 0.1;

  const dragTarget = [];
  const dragControls = new THREE.DragControls(scene.getObjectByName('wrap').children, camera, renderer.domElement);
  console.log(dragControls)
  dragControls.addEventListener('dragstart', function(event) { controls.enabled = false; });
  dragControls.addEventListener('dragend', function(event) { controls.enabled = true; });


  // 棚データ
  rackData = [
    {id: 'coldRack1', x: 851.2291695652245, y: 432.6049808599266, z: -1472.27225017357, style: false},
    {id: 'coldRack2', x: 1.0924340204322376, y: 452.6049808599266, z: -1718.207239598229, style: false},
    {id: 'coldRack3', x: -855.6534842868189, y: 452.6049808599266, z: -1484.2138011655813, style: false},
    {id: 'drinkRack1', x: -1487.4649014481827, y: 504.35916140756495, z: -860.0496954127674, style: false},
    {id: 'drinkRack2', x: -1712.4552842729863, y: 504.3181761443858, z: -1.0887769344141904, style: false},
    {id: 'drinkRack3', x: -1502.2951163267774, y: 524.0995228807711, z: 866.077413983474, style: false},
    {id: 'dessertRack', x: -857.170550620749, y: 504.3181761443855, z: 1482.485390558101, style: false},
    {id: 'iceRack1', x: -1.095943208380466, y: 464.33457219368086, z: 1723.7265771674704, style: false},
    {id: 'iceRack2', x: 863.5542496648436, y: 465.29975109051577, z: 1497.9184435578456, style: false},
    {id: 'snackRack1', x: 1482.485390558101, y: 494.31817614438484, z: 857.1705506207501, style: false},
    {id: 'snackRack2', x: 1712.455284272986, y: 494.3181761443849, z: 1.0887769344094567, style: false},
    {id: 'snackRack3', x: 1488.557335468612, y: 494.3591614075649, z: -858.1575441854696, style: false}
  ];

  // 各棚ボタンにイベント発行
  let canPrepared = true;
  for(let i = 0; i < rackData.length; i++){
    const rackBtn = document.getElementById(`${rackData[i].id}`);

    rackBtn.addEventListener('click', () => {
      if(!canPrepared) return;
      canPrepared = false;

      moveRack(rackData[i].x, rackData[i].y, rackData[i].z);

      returnStyle();

      updateStyle(i);
    });
  }

  // スタイルを元に戻す
  function returnStyle() {
    for(let i = 0; i < rackData.length; i++){
      if(rackData[i].style == true){
        const returnStyleRack = document.getElementById(`${rackData[i].id}`);

        returnStyleRack.style.backgroundColor = 'black';
        rackData[i].style = false;

        return i;
      }
    }
  }
  
  // スタイルを更新する
  function updateStyle(rackNum) {
    const updateStyleRack = document.getElementById(`${rackData[rackNum].id}`);

    updateStyleRack.style.backgroundColor = '#2C92C5';
    rackData[rackNum].style = true;
  }

  // カメラ移動処理
  let startX, startY, startZ, endX, endY, endZ, diffX, diffY, diffZ, progress;
  const time = 1000;

  function moveRack(x, y, z) {
    startX = camera.position.x;
    startY = camera.position.y;
    startZ = camera.position.z;
    endX = x;
    endY = y;
    endZ = z;
    diffX = endX - startX;
    diffY = endY - startY;
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
          const resultY = startY + diffY * progress;
          const resultZ = startZ + diffZ * progress;
          camera.position.copy(new THREE.Vector3(resultX, resultY, resultZ));
        }

        if(progress < 1){
          requestAnimationFrame(update);
        }else{
          // addEventListenerのcallback内の処理は非同期実行⇒最も終わるのが遅い処理の直前でtrueにする
          canPrepared = true;
        }
      }
    });
  }

  // カメラ位置を1つ左の棚の前に移動する ⇒ 左右移動まとめる
  document.getElementById('camLeftBtn').addEventListener('click', () => {
    if(!canPrepared) return;
    canPrepared = false;

    let nextNum = returnStyle() - 1;
    if(nextNum == -1){
      nextNum = 11;
    }else if(isNaN(nextNum)){
      nextNum = 10;
    }

    updateStyle(nextNum);

    moveRack(rackData[nextNum].x, rackData[nextNum].y, rackData[nextNum].z);
  });

   // カメラ位置を1つ右の棚の前に移動する
   document.getElementById('camRightBtn').addEventListener('click', () => {
    if(!canPrepared) return;
    canPrepared = false;

    let nextNum = returnStyle() + 1;
    if(nextNum == 12){
      nextNum = 0;
    }else if(isNaN(nextNum)){
      nextNum = 11;
    }

    updateStyle(nextNum);

    moveRack(rackData[nextNum].x, rackData[nextNum].y, rackData[nextNum].z);
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
  // const postProductData = {};

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
    productModalForumBtn.style.color = 'black';
    productModalForumBtn.style.borderBottom = '1px solid #9AA0A6';
    productModalProductBtn.style.color = 'blue';
    productModalProductBtn.style.borderBottom = '2px solid blue';

    const imgDiv = document.createElement('div');
    imgDiv.classList.add('product-modal__img-div');
    productModalContent.appendChild(imgDiv);

    const img = document.createElement('img');
    img.classList.add('product-modal__img');
    img.src = `img/${window.postProductData.imgURL}.png`;
    imgDiv.appendChild(img);

    const h2 = document.createElement('h2');
    h2.id = 'productModalTitle';
    h2.classList.add('product-modal__title');
    h2.innerText = window.postProductData.name;
    productModalContent.appendChild(h2);

    const priceQuantityP = document.createElement('p');
    priceQuantityP.id = 'productModalPriceQuantity';
    priceQuantityP.classList.add('product-modal__price-quantity');
    productModalContent.appendChild(priceQuantityP);

    const priceP = document.createElement('p');
    priceP.className = 'product-modal__price-quantity-p';
    priceQuantityP.appendChild(priceP);

    const priceSpan = document.createElement('span');
    priceSpan.innerText = window.postProductData.price;
    priceP.appendChild(priceSpan);

    priceP.innerHTML += '円 | ';

    const quantityP = document.createElement('p');
    quantityP.className = 'product-modal__price-quantity-p'
    quantityP.innerText = '在庫数';
    priceQuantityP.appendChild(quantityP);

    const quantitySpan = document.createElement('span');
    quantitySpan.innerText = window.postProductData.stock;
    quantityP.appendChild(quantitySpan);

    quantityP.innerHTML += '個';

    const descP = document.createElement('p');
    descP.classList.add('product-modal__desc');
    descP.innerText = window.postProductData.explanation;
    productModalContent.appendChild(descP);

    const btnAreaDiv = document.createElement('div');
    btnAreaDiv.classList.add('product-modal__btn-area');
    productModalContent.appendChild(btnAreaDiv);

    const selectLabel = document.createElement('label');
    selectLabel.classList.add('product-modal__label');
    selectLabel.innerText = '数量：';
    btnAreaDiv.appendChild(selectLabel);

    const selectedSelect = document.createElement('select');
    selectedSelect.id = 'productModalSelect';
    selectedSelect.classList.add('product-modal__select');
    selectLabel.appendChild(selectedSelect);

    const cartBtnDiv = document.createElement('div');
    cartBtnDiv.id = 'addToCartBtn';
    cartBtnDiv.classList.add('add-to-cart-btn');
    cartBtnDiv.innerText = 'カートに入れる';
    btnAreaDiv.appendChild(cartBtnDiv);
    cartBtnDiv.addEventListener('click', addLocalStorage);

    for(let i = 1; i <= window.postProductData.stock; i++){
      const option = document.createElement('option');
      option.value = option.innerText = i;
      if(i === 1) option.selected = true;
      selectedSelect.appendChild(option);
    }
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

  const viewProductNameArea = document.getElementById('viewProductNameArea');
  const viewProductName = document.getElementById('viewProductName');

  // 毎フレーム実行させる
  tick();
  function tick() {
    // カメラコントローラーを更新
    controls.update();

    // カメラが原点(0, 0, 0)を向くようにする
    camera.lookAt(new THREE.Vector3(0, 150, 0));

    // 全てのmodalの向きをカメラに追従させる⇒どの角度から見ても正面になる
    for(let i = 0; i < wrap.children.length; i++){
      if(wrap.children[i]) wrap.children[i].quaternion.copy(camera.quaternion);
    }

    if(productObj.length > 0){
      canvas.style.cursor = 'pointer';
      viewProductNameArea.style.display = 'inline-block';
      viewProductNameArea.style.left = (screenMouse.x + 25) + 'px';
      viewProductNameArea.style.top = (screenMouse.y - 25) + 'px';
      viewProductNameArea.innerText = productObj[0].object.parent.name;
    }else{
      canvas.style.cursor = 'not-allowed';
      viewProductNameArea.innerText = '';
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
    // camDegree = -45;
    controls.reset();
  });

  // カメラ位置の座標を取得する
  document.getElementById('camCoord_btn').addEventListener('click', () => {
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
      viewMessageAsAddToCart(0.75, `${window.postProductData.name}は在庫不足のため、カートに追加できません`);
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

    viewMessageAsAddToCart(0.75, `「${window.postProductData.name}」×${selectedQuantity} がカートに追加されました`);

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
    
    if(results.length === 0){
      const li = document.createElement('li');
      li.className = 'cart-area__item-empty'
      li.innerText = `${jsonUsersName.name}様のカートに商品はありません。`;
      cartAreaList.appendChild(li);
    }

    for(let i = 0; i < results.length; i++){
      const result = results[i];

      const li = document.createElement('li');
      li.classList.add('cart-area__item');
      cartAreaList.appendChild(li);

      const div = document.createElement('div');
      div.classList.add('cart-area__img-wrapper');
      li.appendChild(div);

      const img = document.createElement('img');
      img.src = `img/${result.value.imgURL}.png`;
      div.appendChild(img);

      const select = document.createElement('select');
      select.classList.add('cart-area__select');
      li.appendChild(select);
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
      sumSelectedQuantity += result.value.selectedQuantity;

      const p1 = document.createElement('p');
      p1.classList.add('cart-area__product-name');
      p1.innerText = result.value.name;
      li.appendChild(p1);

      const div2 = document.createElement('div');
      div2.classList.add('cart-area__price-delete');
      li.appendChild(div2);

      const p2 = document.createElement('p');
      p2.classList.add('cart-area__product-price');
      const price = parseInt(result.value.price) * parseInt(result.value.selectedQuantity);
      sumPrice += price;
      p2.innerText = `${price}円`;
      div2.appendChild(p2);

      const a = document.createElement('a');
      a.classList.add('cart-area__delete-btn');
      a.innerText = '削除';
      div2.appendChild(a);

      // カート内商品削除、localStorageから指定キーに対する値を削除
      a.addEventListener('click', (e) => {
        deleteStorage(result.key);
        e.preventDefault();
      });
    }
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

  cartArea.addEventListener('mouseover', () => { changeHeightOfCartArea(250); });

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
    productModalProductBtn.style.color = 'black';
    productModalProductBtn.style.borderBottom = '1px solid #9AA0A6';
    productModalForumBtn.style.color = 'blue';
    productModalForumBtn.style.borderBottom = '2px solid blue';

    const formimgDiv = document.createElement('div');
    formimgDiv.classList.add('product-modal__forum-formimg-div');
    formimgDiv.addEventListener('click', openForumForm)
    productModalContent.appendChild(formimgDiv);

    const formimg = document.createElement('img');
    formimg.src = 'img/forum_modal_post.png';
    formimgDiv.appendChild(formimg);

    const forumTitle = document.createElement('h2');
    forumTitle.classList.add('product-modal__forum-maintitle');
    forumTitle.innerText = 'みんなの感想';
    productModalContent.appendChild(forumTitle);

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
      const p = document.createElement('p');
      p.classList.add('product-modal__forum-empty');
      p.innerText = `${window.postProductData.name}\nについての投稿はまだありません。`;
      productModalContent.appendChild(p);
      return;
    }

    // 閲覧エリア
    const ul = document.createElement('ul');
    ul.classList.add('product-modal__forum-ul');
    productModalContent.appendChild(ul);

    for(let i = 0; i < json.length; i++){
      const forumData = json[i];

      const li = document.createElement('li');
      li.classList.add('product-modal__forum-li');
      ul.appendChild(li);

      const item1 = document.createElement('div');
      item1.classList.add('product-modal__forum-item1');
      li.appendChild(item1)

      const userimgDiv = document.createElement('div');
      userimgDiv.classList.add('product-modal__forum-userimg-div')
      item1.appendChild(userimgDiv);

      const userimg = document.createElement('img');
      userimg.classList.add('product-modal__forum-userimg');
      userimg.src = 'img/forum_modal_user.png';
      userimgDiv.appendChild(userimg);

      const item2 = document.createElement('div');
      item2.classList.add('product-modal__forum-item2');
      li.appendChild(item2);

      const nickname = document.createElement('p');
      nickname.classList.add('product-modal__forum-nickname');
      nickname.innerText = forumData.user_name;
      item2.appendChild(nickname);

      const liTitle = document.createElement('p');
      liTitle.classList.add('product-modal__forum-view-title');
      liTitle.innerText = forumData.title;
      item2.appendChild(liTitle);
  
      const content = document.createElement('p');
      content.classList.add('product-modal__forum-view-content');
      content.innerText = forumData.content;
      item2.appendChild(content);

      const wrapOfGoodWrap = document.createElement('div');
      wrapOfGoodWrap.classList.add('product-modal__forum-goodwrap-wrap');
      item2.appendChild(wrapOfGoodWrap);
  
      const goodWrap = document.createElement('div');
      goodWrap.id = 'productModalForumGoodWrap';
      goodWrap.classList.add('product-modal__forum-goodwrap');
      goodWrap.addEventListener('click', increment);
      wrapOfGoodWrap.appendChild(goodWrap);

      const goodimgDiv = document.createElement('div');
      goodimgDiv.classList.add('product-modal__forum-goodimg-div');
      goodWrap.appendChild(goodimgDiv);

      const goodimg = document.createElement('img');
      goodimg.classList.add('product-modal__forum-goodimg');
      goodimg.src = 'img/forum_modal_good.png';
      goodimgDiv.appendChild(goodimg);

      const goodCnt = document.createElement('span');
      goodCnt.classList.add('product-modal__forum-goodcnt');
      goodCnt.innerText = forumData.good_cnt;
      goodWrap.appendChild(goodCnt);

      const date = document.createElement('p');
      date.classList.add('product-modal__forum-date');
      date.innerText = forumData.created_at;
      item2.appendChild(date);
    }
  }

  function increment(e) {
    e.currentTarget.children[0].children[0].src = 'img/forum_modal_good_blue.png';
    e.currentTarget.children[1].innerText = parseInt(e.currentTarget.children[1].innerText) + 1;
    e.currentTarget.children[1].style.color = 'blue';
    e.currentTarget.removeEventListener(e.type, increment);
    e.currentTarget.addEventListener('click', decrement);
  }

  function decrement(e) {
    e.currentTarget.children[0].children[0].src = 'img/forum_modal_good.png';
    e.currentTarget.children[1].innerText = parseInt(e.currentTarget.children[1].innerText) - 1;
    e.currentTarget.children[1].style.color = 'black';
    e.currentTarget.removeEventListener(e.type, decrement);
    e.currentTarget.addEventListener('click', increment);
  }


  // 投稿エリア作成
  function openForumForm(e) {
    // 画像変更
    e.currentTarget.children[0].src = 'img/forum_modal_post_blue.png';

    // フォーム展開
    const formDiv = document.createElement('div');
    formDiv.classList.add('product-modal__forum-form-div');
    productModalContent.insertAdjacentElement('afterbegin', formDiv);

    const formTitle = document.createElement('div');
    formTitle.classList.add('product-modal__forum-form-title');
    formTitle.innerText = 'この商品の感想を書いてみよう';
    formDiv.appendChild(formTitle);

    const form = document.createElement('form');
    form.action = `insert_forum.php?stores_id=${phpGetStoreNum}`;
    form.method = 'post';
    formDiv.appendChild(form);

    const productsIdOfInput = document.createElement('input');
    productsIdOfInput.type = 'hidden';
    productsIdOfInput.name = 'products_id';
    productsIdOfInput.value = window.postProductData.id;
    form.appendChild(productsIdOfInput);

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('product-modal__forum-label-div');
    form.appendChild(titleDiv);

    const titleOfInput = document.createElement('input');
    titleOfInput.id = 'titleOfInput';
    titleOfInput.classList.add('product-modal__forum-input');
    titleOfInput.type = 'text';
    titleOfInput.name = 'title';
    titleOfInput.placeholder = ' ';
    titleDiv.appendChild(titleOfInput);

    const titleLabel = document.createElement('label');
    titleLabel.htmlFor = 'titleOfInput';
    titleLabel.classList.add('product-modal__forum-label');
    titleLabel.innerText = 'タイトル';
    titleDiv.appendChild(titleLabel);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('product-modal__forum-label-div');
    form.appendChild(contentDiv);

    const contentOfTextarea = document.createElement('textarea');
    contentOfTextarea.id = 'contentOfTextarea';
    contentOfTextarea.classList.add('product-modal__forum-input', 'product-modal__forum-textarea');
    contentOfTextarea.name = 'content';
    contentOfTextarea.placeholder = ' ';
    contentOfTextarea.required = 'true';
    contentDiv.appendChild(contentOfTextarea);

    const contentLabel = document.createElement('label');
    contentLabel.htmlFor = 'contentOfTextarea';
    contentLabel.classList.add('product-modal__forum-label');
    contentLabel.innerText = '投稿内容';
    contentDiv.appendChild(contentLabel);

    const postBtn = document.createElement('input');
    postBtn.classList.add('product-modal__forum-postbtn');
    postBtn.type = 'submit';
    postBtn.value = '投稿する';
    form.appendChild(postBtn);

    // イベント更新
    e.currentTarget.removeEventListener(e.type, openForumForm);
    e.currentTarget.addEventListener('click', closeForumForm);
  }

  // 投稿エリア閉じる
  function closeForumForm(e) {
    e.currentTarget.children[0].src = 'img/forum_modal_post.png';

    productModalContent.removeChild(productModalContent.children[0]);

    e.currentTarget.removeEventListener(e.type, closeForumForm);
    e.currentTarget.addEventListener('click', openForumForm);
  }

  // ヘッダー拡大 + ハンバーガーメニュー移動
  const header = document.getElementById('header')
  const headerStyle = window.getComputedStyle(header);
  const hamburgerMenu = document.getElementById('headerHamburgerMenu');
  const hamburgerMenuStyle = window.getComputedStyle(hamburgerMenu);
  const initHamburgerMenuTop = parseInt(hamburgerMenuStyle.top);
  const gnav = document.getElementById('headerGnav');
  const gnavStyle = window.getComputedStyle(gnav);
  const copyright = document.getElementById('headerCopyright');

  hamburgerMenu.addEventListener('click', function changeWidthOfHeaderWrap(e) {
    e.currentTarget.removeEventListener(e.type, changeWidthOfHeaderWrap);
    changeWidthOfHeader(200, 200, 1);
  });

  let canOpenHeader = true;
  function changeWidthOfHeader(endWidth, endTop, endOpacity) {
    if(gnavStyle.display == 'none' && canOpenHeader == true){
      gnav.style.display = 'block';
      copyright.style.display = 'block';
    }

    const startHeaderWidth = parseInt(headerStyle.width);
    const startHamburgerMenuTop = parseInt(hamburgerMenuStyle.top);
    const startGnavOpacity = parseInt(gnavStyle.opacity);

    const endHeaderWidth = endWidth;
    const endHamburgerMenuTop = endTop;
    const endGnavOpacity = endOpacity;

    const diffHeaderWidth = endHeaderWidth - startHeaderWidth;
    const diffHamburgerMenuTop = endHamburgerMenuTop - startHamburgerMenuTop;
    const diffGnavOpacity = endGnavOpacity - startGnavOpacity;

    requestAnimationFrame(startTime => {
      update(startTime);

      function update(timeStamp) {
        // 進捗率 = 経過した時間 / 変化にかかる総時間
        progress = (timeStamp - startTime) / 200;

        progress = Math.min(progress, 1);

        if(progress > 0){
          header.style.width = (startHeaderWidth + diffHeaderWidth * progress) + 'px';
          hamburgerMenu.style.top = (startHamburgerMenuTop + diffHamburgerMenuTop * progress) + 'px';
          gnav.style.opacity = startGnavOpacity + diffGnavOpacity * progress;
          copyright.style.opacity = startGnavOpacity + diffGnavOpacity * progress;
        }

        if(progress < 1){
          requestAnimationFrame(update);
        }else{
          if(gnavStyle.display == 'block' && canOpenHeader == false){
            gnav.style.display = 'none';
            copyright.style.display = 'none';
          }

          hamburgerMenu.addEventListener('click', function changeWidthOfHeaderWrap(e) {
            e.currentTarget.removeEventListener(e.type, changeWidthOfHeaderWrap);
            if(canOpenHeader){
              canOpenHeader = false;
              changeWidthOfHeader(100, initHamburgerMenuTop, 0);
              return;
            }
            canOpenHeader = true;
            changeWidthOfHeader(200, 200, 1);
          });
        }
      }
    });
  }

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
  document.getElementById('cartAreaBuyBtn').addEventListener('click', () => {
    // 商品詳細モーダルが表示されているなら閉じる
    if(productModalStyle.display == 'block') slideModal(-310);

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
}

window.addEventListener('load', () => {
  if(typeof localStorage === 'undefined'){
    window.alert('このブラウザではWeb Storage機能が実装されていません。\n他のブラウザを使用することを推奨します。');
  }else{
    // window.alert('このブラウザではWeb Storage機能が実装されています。');
  }
});
