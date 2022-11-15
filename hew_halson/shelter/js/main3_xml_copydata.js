// glTF(DRACO圧縮された)モデルを読み込む
// loader.setDRACOLoader(new THREE.DRACOLoader('http://localhost/hew_211214_toppage/js/draco/', { type: 'js' }));
const dracoLoader = new THREE.DRACOLoader();
dracoLoader.setDecoderPath('js/draco/');
loader.setDRACOLoader(dracoLoader);

const start = Date.now();
console.log(start);
loader.load(
    'http://localhost/hew_211214_toppage/glb/hew7Draco.glb',
    (gltf) => {
      model = gltf.scene;
      model.name = "main";
      model.scale.set(400.0, 400.0, 400.0);
      model.position.set(0, -200, 0);
      scene.add(model);
      console.log('Finished loading');
      // dracoLoader.releaseDecoderModule();
      const end = Date.now();
      console.log(end);
      console.log(end - start);
    },
);




// これ以降のモーダルのDOM取得はinit関数スコープ直下で変数化しない(display:noneで作成のため)

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







  // グローバルナビの選択マークを取得
  function getGnavItemMarkPosition() {
    let markedNum = -1;

    for(let i = 0; i < marks.length; i++){
      const markStyle = window.getComputedStyle(marks[i]);
      if(markStyle.opacity === '1') markedNum = i;
    }
    return markedNum;
  }

  // キーダウンでマーク位置移動
  document.addEventListener('keydown', (e) => {
    if(canOpenHeader || !(e.key === 'w' || e.key === 'ArrowUp' || e.key === 's' || e.key === 'ArrowDown')) return;

    const num = getGnavItemMarkPosition(); // 現在のマーク位置取得

    let nextNum = 0;
    if(num === -1){
      nextNum = 0;
    }else if(e.key === 'w' || e.key === 'ArrowUp'){
      nextNum = (num === 0) ? 3 : (num - 1);
    }else if(e.key === 's' || e.key === 'ArrowDown'){
      nextNum = (num === 3) ? 0 : (num + 1);
    }

    marks[nextNum].style.opacity = '1';
    e.preventDefault(); // 画面スクロールさせない
  });

  // Enterでページ内をスムーズスクロール
  document.addEventListener('keydown', (e) => {
    if(canOpenHeader || e.key !== 'Enter') return;

    const num = getGnavItemMarkPosition();
    if(num !== -1) marks[num].click();
  });

