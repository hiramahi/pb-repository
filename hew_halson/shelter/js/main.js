// ページの読み込みを待つ
window.addEventListener('DOMContentLoaded', init);

// const init = () => {};のアロー関数式だと関数式と同様に関数リテラルなので、実行時に関数が登録される
// ⇒つまり、関数定義をしてから、関数呼び出しの順でコードを記述しなけらばならない
// 関数宣言(functionベース)ならば、コード解析時に関数が登録されるので、関数呼び出しの後にその関数を定義することが可能である
// https://kde.hateblo.jp/entry/2017/05/20/212928 参照
// htmlが解析される ⇒ script要素があるとそのコードを解析(パース)し、エラーがなければ同期実行
// ⇒ DOMツリー構築完了と同時にブラウザが DOMContentLoadedイベントを発生 ⇒ 外部リソース読込 ⇒ ブラウザが loadイベントを発生

function init() {
  // displayAreaはcanvasの表示(確保)領域、renderingAreaはcanvasを描画する領域
  // つまり、確保された領域の中でどのくらいのサイズで描画しますかということ
  // 今回は確保領域いっぱいに描画する
  let width = document.getElementById('displayArea').getBoundingClientRect().width;
  let height = document.getElementById('displayArea').getBoundingClientRect().height;

  // レンダラーを作成
  const canvas = document.getElementById('renderingArea');
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas, // html上のどのcanvas要素と紐づけるか
    antialias: true
  });
  
  // デバイスの解像度をthree.jsに渡す、retina対応をさせる(apple製品の画面のこと)
  // つまり、見ている画面によって解像度を合わせることができる、ただpcによっては解像度が高くなりすぎて重くなることがある
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.setSize(width, height);
  // renderer.setClearColor(0x90D7EC, 1); // 3D空間を水色にする
  // renderer.setClearColor(0xAA9966, 1); // 3D空間を茶色にする

  // テクスチャをガンマ補正
  // = 光が当たっているところの白とびを抑える、暗すぎるところを明るくする、といった自動で色空間の調整を行ってくれる
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;

  // シーンを作成
  const scene = new THREE.Scene();

  // // テクスチャ読み込み
  // const texEqu = new THREE.TextureLoader().load("http://localhost/hew_211214_toppage/img/px6.png");
  // texEqu.anisotropy = renderer.getMaxAnisotropy();
  // texEqu.mapping = THREE.UVMapping;

  // // 背景用ジオメトリ生成、THREE.SphereGeometry(radius, widthSegments, heightSegments)
  // const sphereGeometry = new THREE.SphereGeometry(10000, 32, 32);
  // sphereGeometry.scale(-1, 1, 1); // コレを指定しないと背景が左右反転してしまう
  // const mat = new THREE.MeshBasicMaterial({
  //   map: texEqu,
  //   fog: false,
  // });
  // bgMesh = new THREE.Mesh(sphereGeometry, mat);
  // scene.add(bgMesh);

  // テクスチャ読み込み
  const texEqu2 = new THREE.TextureLoader().load("http://localhost/hew_211214_toppage/img/px10.jpg");
  texEqu2.anisotropy = renderer.getMaxAnisotropy();
  texEqu2.mapping = THREE.UVMapping;

  // 背景用ジオメトリ生成、THREE.SphereGeometry(radius, widthSegments, heightSegments)
  const sphereGeometry2 = new THREE.SphereGeometry(20000, 32, 32);
  sphereGeometry2.scale(-1, 1, 1); // コレを指定しないと背景が左右反転してしまう
  const mat2 = new THREE.MeshBasicMaterial({
    map: texEqu2,
    fog: false,
  });
  bgMesh2 = new THREE.Mesh(sphereGeometry2, mat2);
  scene.add(bgMesh2);

  // xyz軸(補助線)
  scene.add(new THREE.AxisHelper(1500));

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 60000);
  camera.position.set(6814.529571249156, 937.4630880314497, -2592.1725342674354);
  scene.add(camera); // ライトを追従させるために追加する

  // ライトを作成(平行光源 = 太陽光のように一定方向から差し込む光)
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z);
  // directionalLight.position.set(1500, 1000, -1000);
  scene.add(directionalLight);
  camera.add(directionalLight); // カメラに追従させるために追加する

  // ライトを作成(環境光源 = 3D空間全体に均等に当てる光)
  const ambientLight = new THREE.AmbientLight(0x666666);
  scene.add(ambientLight);

  // 地面を作成
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15000, 15000, 1, 1),
    new THREE.MeshLambertMaterial({
      map: THREE.ImageUtils.loadTexture('http://localhost/hew_211214_toppage/img/plane.jpg')
    })
  );
  plane.rotation.x = Math.PI / -2;
  scene.add(plane);

  // カメラコントローラを作成
  // THREE.OrbitControls: The second parameter 'domElement' is now mandatory ⇒ 2つ目のパラメータは必須だと
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  // カメラ操作に制限をかける
  // controls.minPolarAngle = Math.PI / 2.8; // 天井に行かせない
  // controls.maxPolarAngle = Math.PI / 2.15; // 地下に行かせない

  // ズーム制御
  // controls.maxDistance = 2400; // 遠ざかれる距離の最大値
  controls.maxDistance = 28000; // 仮
  controls.minDistance = 1400; // 近づける距離の最大値

  // マウス回転スピードを下げる(デフォルトは1)
  controls.rotateSpeed = 0.1;
  // console.log(controls);

  // boxオブジェをグループ化してsceneに配置⇒グループ全体に操作をかけれるようになる
  const boxGroup = new THREE.Group();
  boxGroup.name = 'boxGroup';
  scene.add(boxGroup);

  const boxData = {
    x: [3400, 3300, 3200, 3100, 3000],
    y: [750, 750, 750, 750, 750],
    z: [-1850, -2500, -3150, -3800, -4450]
  };
  // box作成
  for(let i = 0; i < boxData.x.length; i++){
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(350, 350, 350),
      new THREE.MeshStandardMaterial({
        color: 0x2C92C5,
        transparent: true,
        // alphaToCoverage: true,
        opacity: 0.6,
      })
    );
    // box.rotation.x = 0.5;
    // box.rotation.z = 0.5;
    box.position.set(boxData.x[i], boxData.y[i], boxData.z[i]);
    boxGroup.add(box);
  }

  const material = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load('http://localhost/hew_211214_toppage/img/login_text.png')
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.set(3700, 750, -1850);
  sprite.scale.set(500, 500, 500);
  scene.add(sprite);
  console.log(scene.children)

  // pageオブジェグループ化
  const glbGroup = new THREE.Group();
  glbGroup.name = 'glbGroup';
  scene.add(glbGroup);

  // glbファイルデータ準備
  const glbData = {
    url: ['hew9', 'login_page', 'contact_page'],
    x: [3500, -3100, -5100],
    y: [0, 750, 750],
    z: [500, 3300, 2200]
  };

  // glbファイル読込
  const loader = new THREE.GLTFLoader();
  for(let i = 0; i < glbData.url.length; i++){
    let model = null;
    loader.load(
      `http://localhost/hew_211214_toppage/glb/${glbData.url[i]}.glb`,
      (gltf) => {
        model = gltf.scene;
        model.name = glbData.url[i];
        model.scale.set(400.0, 400.0, 400.0);
        model.position.set(glbData.x[i], glbData.y[i], glbData.z[i]);
        if(i === 0){
          scene.add(model);
          return;
        }
        glbGroup.add(model);
      },
      undefined,
      (error) => {
          console.log('An error happened');
          // console.log(error);
      }
    );
  }

  // 3Dオブジェクトクリック処理
  canvas.addEventListener('click', clickObj);

  //マウス座標管理用のベクトルを作成
  const mouse = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  let isModal = isLoginModal = isContactModal = isUserModal = isStoreModal = false;

  function clickObj(e) {
    // canvas要素の座標情報取得
    const rect = e.target.getBoundingClientRect();

    // canvas領域の左上(0,0)からのマウス座標を取得
    // (縦横スクロールがないページ) かつ (canvas要素をtop:0,left:0に配置している)のならば、mouse.x = e.clientX, mouse.y = e.clientYで可
    // (縦横スクロールがあるページ) 又は (canvas要素をtop:0以外又は、left:0以外(ex.top: 100, left: 0)に配置している)のならば、差分を求める
    mouse.x =  e.clientX - rect.left;
    mouse.y =  e.clientY - rect.top;

    // マウス座標を3D座標に変換、取得したスクリーン座標を-1〜1に正規化する
    // 3D空間上では、左端~右端が-1~1で座標が表現され、真ん中が原点(0, 0)
    // スクリーン上では、0~window.innerWidth、左上が原点
    // mouse.x : width = α : 2(全体幅) ⇒ α = 2mouse.x / width
    mouse.x = -1 + ((2 * mouse.x) / width);
    mouse.y = 1 - ((2 * mouse.y) / height);

    // マウスの位置からまっすぐに伸びる光線(レイ)ベクトルに更新
    ray.setFromCamera(mouse, camera);

    // その光線と交差したオブジェ取得、ray.intersectObjects()の引数・返り値は配列⇒引数に対象とするオブジェを指定
    const boxObj = ray.intersectObjects(scene.getObjectByName('boxGroup').children, true);
    const glbObj = ray.intersectObjects(scene.getObjectByName('glbGroup').children, true);
    const obj = boxObj.concat(glbObj);

    // 交差判定(何らかのオブジェと交差⇒obj.length>=1、交差無し⇒obj.length=0)
    if(obj.length === 0) return;
    console.log('Selected icon');

    // 1つでもモーダルが表示されていれば、以降の処理を許可しない
    if(isModal) return;

    // boxオブジェと交差した時、それと紐づくpageオブジェの手前にカメラ移動
    if(obj[0].object == boxGroup.children[0]) return moveCamera(-3649.30426610158, 884.643685527643, 3885.7285490554846);
    if(obj[0].object == boxGroup.children[1]) return moveCamera(-5733.229870382785, 844.5678344350588, 2477.5415783005783);

    // pageオブジェと交差した時、モーダル表示
    if(obj[0].object.parent == glbGroup.children[0]){
      moveCamera(-3128.822245148843, 758.4713798792632, 3331.526514746447);
      setTimeout(() => { loginModal.style.display = 'block'; }, 1000);
      setTimeout(() => { moveCamera(6814.529571249156, 937.4630880314497, -2592.1725342674354); }, 1500);
      return;
    }else if(obj[0].object.parent == glbGroup.children[1]){
      moveCamera(-5174.239958020463, 762.2224705776406, 2235.981274416272);
      setTimeout(() => { contactModal.style.display = 'block'; }, 1000);
      setTimeout(() => { moveCamera(6814.529571249156, 937.4630880314497, -2592.1725342674354); }, 1500);
      return;
    }
    console.log('aa')
  }

  // 3Dオブジェクトマウスムーブ処理
  canvas.addEventListener('mousemove', rotateObj);

  let mouseMoveObj = 0;
  function rotateObj(e) {
    const rect = e.target.getBoundingClientRect();

    mouse.x =  e.clientX - rect.left;
    mouse.y =  e.clientY - rect.top;

    mouse.x = -1 + ((2 * mouse.x) / width);
    mouse.y = 1 - ((2 * mouse.y) / height);

    ray.setFromCamera(mouse, camera);

    mouseMoveObj = ray.intersectObjects(scene.getObjectByName('boxGroup').children, true);
  }

  // モーダル非表示
  const deleteBtns = document.getElementsByClassName('modal-hide-btn');
  for(const deleteBtn of deleteBtns){
    deleteBtn.addEventListener('click', () => {
      loginModal.style.display = 'none';
      contactModal.style.display = 'none';
    });
  }

  // カメラ移動処理
  let startX, startY, startZ, endX, endY, endZ, diffX, diffY, diffZ, progress, canPrepared = true;
  const time = 1000;

  const loginModal = document.getElementById('loginArea');
  const contactModal = document.getElementById('contactArea');

  function moveCamera(x, y, z) {
    if(canPrepared){
      canPrepared = false;
      startX = camera.position.x;
      startY = camera.position.y;
      startZ = camera.position.z;
      endX = x;
      endY = y;
      endZ = z;
      diffX = endX - startX;
      diffY = endY - startY;
      diffZ = endZ - startZ;
  
      // requestAnimationFrameメソッドに渡すコールバック関数は、引数でタイムスタンプ(ミリ秒)を受け取る
      requestAnimationFrame((startTime) => {
        update(startTime);
  
        function update(timeStamp) {
          // 進捗率 = 経過した時間 / 変化にかかる総時間
          progress = (timeStamp - startTime) / time;
  
          // 進捗率が 1(100%)を超えないように丸める、引数で与えられたもののうち最小の値を返す
          progress = Math.min(progress, 1);
          // console.log(progress);
  
          // 時間経過に合わせた計算をして少しずつ移動させる、アニメーション中の値 = 始点 + 変化量 * アニメーションの進捗率
          if(progress > 0){
            const resultX = startX + diffX * progress;
            const resultY = startY + diffY * progress;
            const resultZ = startZ + diffZ * progress;
            camera.position.copy(new THREE.Vector3(resultX, resultY, resultZ));
          }
  
          if(progress < 1){
            requestAnimationFrame(update);
          }else{
            canPrepared = true; // formの×を2回以上連続でクリックすることを禁止にする
            // model2.quaternion.copy(camera.quaternion);
          }
        }
      });
    }
  }

  // 毎フレーム実行させる
  tick();
  function tick() {
    // カメラコントローラーを更新
    controls.update();

    // 3Dモデルを回転させる、if(model)がないと正しく挙動しない
    // ⇒modelの読込が確認されてからアニメーション、というのがポイントらしい
    for(let i = 0; i < boxGroup.children.length; i++){
      if(boxGroup.children[i]){
        // boxGroup.children[i].rotation.x -= 0.01;
        boxGroup.children[i].rotation.y += 0.01;
        boxGroup.children[i].rotation.z -= 0.01;
      }
    }

    // if(scene.children[7] && plane){
    //   scene.children[7].rotation.y += 0.0005;
    //   plane.rotation.z += 0.0001;
    // }

    // フレーム毎にmouseMoveObj.lengthを監視する
    if(mouseMoveObj.length > 0){
      mouseMoveObj[0].object.rotation.x += 0.1;
      mouseMoveObj[0].object.rotation.y += 0.1;
      mouseMoveObj[0].object.rotation.z += 0.1;
      mouseMoveObj[0].object.material.color.setHex(0xff0000);
    }else{
      for(let i = 0; i < boxGroup.children.length; i++){
        if(boxGroup.children[i]) boxGroup.children[i].material.color.setHex(0x2C92C5);
      }
    }

    for(let i = 0; i < glbGroup.children.length; i++){
      if(glbGroup.children[i]){
        glbGroup.children[i].quaternion.copy(camera.quaternion);
      }
    }
    
    //レンダリング
    renderer.render(scene, camera);

    // 更新が完了したら再度呼び出す
    requestAnimationFrame(tick);
  }

  // リサイズ処理
  window.addEventListener('resize', () => {
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
  });

  // ログインモーダル⇒新規登録モーダル
  const signupModal = document.getElementById('signupArea');
  const loginErrorP = document.getElementById('loginAreaError');
  // document.getElementById('changeSignupAreaBtn').addEventListener('click', () => {
  //   // error初期化
  //   if(loginErrorP.innerText != ''){
  //     loginErrorP.innerText = '';
  //   }

  //   loginModal.style.display = 'none';
  //   signupModal.style.display = 'block';
  // });

  // 新規登録モーダル⇒ログインモーダル(戻るボタン)
  const signupErrorP = document.getElementById('signupAreaError');
  document.signupForm.onreset = function() {
    if(confirm('入力内容が初期化されます。\nログインモーダルに戻りますか？')){
      // error初期化
      if(signupErrorP.innerText != ''){
        signupErrorP.innerText = '';
      }
      
      signupModal.style.display = 'none';
      loginModal.style.display = 'block';
      return;
    }
    return false;
  }

  // 新規登録モーダル⇒入力内容確認モーダル(パスワードチェック)
  const signupConfirmModal = document.getElementById('signupConfirmArea');
  const signupForm = document.signupForm;
  const signupConfirmForm = document.signupConfirmForm;
  signupForm.onsubmit = function() {
    if(signupForm.password.value === signupForm.confirm_password.value){
      // 入力内容を入力内容確認モーダルにコピー
      signupConfirmForm.id.value = signupForm.id.value;
      signupConfirmForm.password.value = signupForm.password.value;
      signupConfirmForm.confirm_password.value = signupForm.confirm_password.value;
      signupConfirmForm.name.value = signupForm.name.value;
      signupConfirmForm.kananame.value = signupForm.kananame.value;
      signupConfirmForm.nickname.value = signupForm.nickname.value;

      // error初期化
      if(signupErrorP.innerText != ''){
        signupErrorP.innerText = '';
      }

      signupModal.style.display = 'none';
      signupConfirmModal.style.display = 'block';
    }else{
      signupErrorP.innerText = 'パスワードと確認用パスワードが一致していません。';
    }
    return false;
  }

  // 入力内容確認モーダル⇒新規登録モーダル(戻るボタン)
  document.getElementById('backToSignupModalBtn').addEventListener('click', () => {
    signupConfirmModal.style.display = 'none';
    signupModal.style.display = 'block';
  });

  // お問い合わせモーダル⇒入力内容確認モーダル(ユーザチェック)
  const contactConfirmModal = document.getElementById('contactConfirmArea');
  const contactForm = document.contactForm;
  const contactConfirmForm = document.contactConfirmForm;
  // contactForm.addEventListener('submit', (e) => {
  //   // select
  //   const contactCategorySelect = contactForm.category_select;
  //   const contactAgeSelect = contactForm.age_select;
  //   const contactConfirmCategorySelect = contactConfirmForm.category_select;
  //   const contactConfirmAgeSelect = contactConfirmForm.age_select;

  //   // radio
  //   const contactReplyRadios = contactForm.reply;
  //   const contactGenderRadios = contactForm.gender;
  //   const contactConfirmReplyRadios = contactConfirmForm.reply;
  //   const contactConfirmGenderRadios = contactConfirmForm.gender;

  //   // textarea
  //   const contactTextarea = contactForm.textarea;
  //   const contactConfirmTextarea = contactConfirmForm.textarea;

  //   // 入力内容を入力内容確認モーダルにコピー
  //   // select
  //   for(let i = 1; i < contactCategorySelect.length; i++){
  //     const option = contactConfirmCategorySelect.options[i];
  //     if(contactCategorySelect.options[i].selected) option.selected = true;
  //     else option.disabled = true;
  //   }

  //   for(let i = 1; i < contactAgeSelect.length; i++){
  //     const option = contactConfirmAgeSelect.options[i];
  //     if(contactAgeSelect.options[i].selected) option.selected = true;
  //     else option.disabled = true;
  //   }

  //   // radio
  //   for(let i = 0; i < contactReplyRadios.length; i++){
  //     if(contactReplyRadios[i].checked){
  //       contactConfirmReplyRadios[i].checked = true;
  //       contactConfirmReplyRadios[i].disabled = false; // 1つの項目がdisabled = trueになると全ての項目に反映されるからfalseにする
  //     }else{
  //       contactConfirmReplyRadios[i].disabled = true;
  //     }
  //   }

  //   for(let i = 0; i < contactGenderRadios.length; i++){
  //     if(contactGenderRadios[i].checked){
  //       contactConfirmGenderRadios[i].checked = true;
  //       contactConfirmGenderRadios[i].disabled = false;
  //     }else{
  //       contactConfirmGenderRadios[i].disabled = true;
  //     }
  //   }

  //   // textarea
  //   contactConfirmTextarea.value = contactTextarea.value;

  //   contactModal.style.display = 'none';
  //   contactConfirmModal.style.display = 'block';

  //   e.stopPropagation(); // イベント伝播の停止
  //   e.preventDefault(); // イベントキャンセル
  // });

  // 入力内容確認モーダル⇒お問い合わせモーダル(戻るボタン)
  document.getElementById('backToContactModalBtn').addEventListener('click', () => {
    contactConfirmModal.style.display = 'none';
    contactModal.style.display = 'block';
  });

  // 退会ダイアログ表示
  // document.getElementById('userInfoDeleteBtn').addEventListener('click', () => {
  //   if(confirm('退会してもよろしいですか？')){
  //     if(confirm('本当に退会してもよろしいですか？')){
  //       // パスワードを求める処理
        
  //       window.location.href = 'http://localhost/hew_211214_toppage/delete.php';
  //     }
  //   }
  // });

  // カメラの座標を取得する
  document.getElementById('getCamPosiArea').addEventListener('click', () => {
    // document.getElementById('getCamPosiSpan').innerText = `=(${camera.position.x}, ${camera.position.y}, ${camera.position.z})`;
    console.log(camera.position);
  });

  if(loginError !== ''){
    loginModal.style.display = 'block';
  }

}


window.addEventListener('load', () => {
  console.log('load')
});