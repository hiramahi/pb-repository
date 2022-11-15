// ページの読み込みを待つ
window.addEventListener('DOMContentLoaded', init);

function init() {
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
  
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // テクスチャをガンマ補正
  // = 光が当たっているところの白とびを抑える、暗すぎるところを明るくする、といった自動で色空間の調整を行ってくれる
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
  // scene.add(new THREE.AxisHelper(1500));

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 60000);
  camera.position.set(0, 6000, 0);
  // scene.add(camera); // ライトを追従させるために追加する

  // ライトを作成(環境光源 = 3D空間全体に均等に当てる光)
  scene.add(new THREE.AmbientLight(0xffffff));

  // ライトを作成(平行光源 = 太陽光のように一定方向から差し込む光)
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  // directionalLight.position.set(4000, 2500, -3400);
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

  // 地面を作成
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15000, 15000, 1, 1),
    new THREE.MeshLambertMaterial({
      map: THREE.ImageUtils.loadTexture('http://localhost/hew_211214_toppage/img/plane.jpg')
    })
  );
  plane.rotation.x = Math.PI / -2;
  plane.position.set(-1800, 0, 3000)
  plane.receiveShadow = true;
  // scene.add(plane);

  // カメラコントローラを作成
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  // カメラに制限をかける
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.enableZoom = false;

  // glbファイル読込
  const loader = new THREE.GLTFLoader();
  const url = 'http://localhost/hew_211214_toppage/glb/map9_hew15.glb';
  let model = null;
  loader.load(
    url,
    (gltf) => {
      model = gltf.scene;
      model.name = 'map';
      model.scale.set(100, 100, 100);
      model.position.set(0, 0, 0);
      scene.add(model);
      // scene.traverse((model) => {
      //   model.castShadow = true;
      //   model.receiveShadow = true;
      // });
    },
    (progress) => {
        // console.log('progress rendering');
    },
    (error) => {
        console.log('An error happened');
    }
  );

  // 動径を求める(不変)
  const x = 4000;
  const y = 2200;
  const z = -3400;
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

  // 店舗ページ用の処理に変更 ///////////////////////////////////////////////////////////////////////////////
  document.getElementById('logoArea').addEventListener('click', init2);

  function init2() {
    displayArea.style.zIndex = 1;

    // カメラの制限を解除
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.2;
    controls.enableDamping = true;
    // controls.dampingFactor = 0.2;
    console.log(controls);

    // アニメーションの停止
    cancelAnimationFrame(requestId);

    // 棚の前までカメラ移動
    // function changeHeightOfCartArea(end) {
    //   const startCartAreaHeight = parseInt(cartAreaStyle.height);
    //   const endCartAreaHeight = end;
    //   const diffCartAreaHeight = endCartAreaHeight - startCartAreaHeight;
  
    //   requestAnimationFrame(startTime => {
    //     update(startTime);
  
    //     function update(timeStamp) {
    //       // 進捗率 = 経過した時間 / 変化にかかる総時間
    //       progress = (timeStamp - startTime) / 200;
  
    //       progress = Math.min(progress, 1);
  
    //       if(progress > 0) cartArea.style.height = (startCartAreaHeight + diffCartAreaHeight * progress) + 'px';
  
    //       if(progress < 1) requestAnimationFrame(update);
    //     }
    //   });
    // }

    // 毎フレーム呼び出す関数を変更
    tick2();
    function tick2() {
      // カメラコントローラーを更新
      controls.update();

      camera.lookAt(new THREE.Vector3(0, 0, 0));

      //レンダリング
      renderer.render(scene, camera);

      // 更新が完了したら再度呼び出す
      requestId = requestAnimationFrame(tick2);
    };


  };





  document.getElementById('logoArea').addEventListener('dblclick', () => {
    console.log(camera.position);
  });

  // Three.js以外の処理 ///////////////////////////////////////////////////////////////////////////////////

  // ヘッダー開く + 中身変更
  let canOpenHeader = true;
  const header = document.getElementById('headerArea');
  const headerStyle = window.getComputedStyle(header);
  const overlayArea = document.getElementById('overlayArea');
  console.log(overlayArea);

  header.addEventListener('click', () => {
    if(!canOpenHeader) return;
    changeHeaderSize(175, 275);
  });

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

  // 要素ノード作成
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
}
