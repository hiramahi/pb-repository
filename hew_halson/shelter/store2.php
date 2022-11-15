<?php
session_start();

if(!(isset($_GET['stores_id'])
  && ($_GET['stores_id'] === '1'
      || $_GET['stores_id'] === '2'
      || $_GET['stores_id'] === '3'))){
  header('Location: index.php');
  exit;
}

$forum_message = '';
if(isset($_SESSION['forum_message'])){
  $forum_message = $_SESSION['forum_message'];
}

include('db_config.php');

$error = '';
$users_name = ['name' => 'ゲスト'];

try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    // 選択された店舗で取り扱う商品データ取得
    $sql = "SELECT p.id, p.name, p.imgURL FROM products p JOIN stores_products s ON p.id = s.products_id WHERE s.stores_id = :stores_id";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue(':stores_id', intval($_GET['stores_id']), PDO::PARAM_INT);
    $prepare->execute();
    $products = $prepare->fetchAll(PDO::FETCH_ASSOC); // 連想配列取得

    // ログイン済みであれば名前を取得
    if(isset($_SESSION['id'])){
      $sql = "SELECT name FROM users WHERE id = :users_id";
      $prepare = $pdo->prepare($sql);
      $prepare->bindValue(':users_id', $_SESSION['id'], PDO::PARAM_STR);
      $prepare->execute();
      $users_name = $prepare->fetch(PDO::FETCH_ASSOC);
    }
}catch(PDOException $e){
  $error = $e->getMessage();
}
?><!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8"/>
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/store2.css">
  <script src="js/threejs/three.min.js"></script>
  <script src="js/threejs/GLTFLoader.js"></script>
  <script src="js/threejs/OrbitControls2.js"></script>
  <!-- <script src="js/threejs/TrackballControls.js"></script> -->
  <script src="js/threejs/DragControls.js"></script>
  <script>
    const phpGetStoreNum = <?php echo $_GET['stores_id'] ?>;
    const jsonUsersName = <?php echo json_encode($users_name) ?>;
    const jsonProductData = <?php echo json_encode($products) ?>;
  </script>
  <script src="js/main2_xml.js"></script>
  <title>商品選択ページ</title>
</head>
<body>
  <div id="header" class="header">
    <div class="header__logo" style=cursor:pointer id="camCoord_btn">
      <img src="img/logo.png">
    </div>

    <div id="headerHamburgerMenu" class="header__hamburger">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <div id="headerGnav" class="header__gnav">
      <p class="header__login">ログイン</p>
      <p class="header__userinfo">ユーザ情報</p>
      <p class="header__search-store">店舗検索</p>
      <p class="header__all-forum">掲示板</p>
      <p class="header__contact">お問い合わせ</p>
    </div>

    <p id="headerCopyright" class="header__copyright">&copy; 2022 HALSON</p>
  </div>

  <div class="main-content">
    <div id="cartArea" class="cart-area">
      <ul id="cartAreaList" class="cart-area__list"></ul>
      <div class="cart-area__not-list">
        <div class="cart-area__sum">合計：<span id="cartAreaSumPrice"></span>円</div>
        <div class="cart-area__sum">合計：<span id="cartAreaSumQuantity"></span>個</div>
        <div id="cartAreaResetBtn" class="cart-area__reset-btn">カートリセット</div>
        <div id="cartAreaBuyBtn" class="cart-area__buy-btn">カート詳細を見る</div>
      </div>
    </div>

    <ul class="cambtn-area">
      <li class="cambtn-area__btn">
        <span id="camLeftBtn" class="cambtn-area__span">&#9664</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="coldRack1" class="cambtn-area__span">おにぎり</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="coldRack2" class="cambtn-area__span">サンド・惣菜</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="coldRack3" class="cambtn-area__span">弁当</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="drinkRack1" class="cambtn-area__span">酒</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="drinkRack2" class="cambtn-area__span">飲料１</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="drinkRack3" class="cambtn-area__span">飲料２</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="dessertRack" class="cambtn-area__span">デザート</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="iceRack1" class="cambtn-area__span">アイス</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="iceRack2" class="cambtn-area__span">冷凍食品</p>
      </li>
      <li class="cambtn-area__btn">
        <span id="snackRack1" class="cambtn-area__span">インスタント</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="snackRack2" class="cambtn-area__span">パン</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="snackRack3" class="cambtn-area__span">菓子</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="camReset" class="cambtn-area__span">カメラリセット</span>
      </li>
      <li class="cambtn-area__btn">
        <span id="camRightBtn" class="cambtn-area__span">&#9654</span>
      </li>
    </ul>

    <div id="displayArea">
      <canvas id="renderingArea"></canvas>

      <p id="viewProductNameArea"></p>

      <div id="viewMessageArea"><p id="viewMessage"></p></div>

      <div id="productModal" class="product-modal">
        <div class="product-modal__nav-area">
          <p id="productModalProductBtn" class="product-modal__switch-btn">商品情報</p>
          <p id="productModalForumBtn" class="product-modal__switch-btn">掲示板</p>
          <div id="productModalHideBtn" class="product-modal__hide-btn">×</div>
        </div>

        <div id="productModalContent" class="product-modal__content"></div>
      </div>

    </div>

  </div>
  <div id="buyDetailModal" class="buy-detail-modal-wrap">
    <div class="buy-detail-modal">
      <div id="buyDetailModalLeftArea" class="buy-detail-modal__left-area">
        <p class="buy-detail-modal__left-area__title">カートに入っている商品</p>
        <ul id="buyDetailModalCartList" class="buy-detail-modal__cart-list"></ul>
      </div>

      <div id="buyDetailModalRightArea" class="buy-detail-modal__right-area">
        <p class="buy-detail-modal__right-area__title">注文内容詳細</p>
        <form class="buy-detail-modal__selected-list-form">
          <ul id="buyDetailModalSelectedList" class="buy-detail-modal__selected-list">
            <li class="buy-detail-modal__selected-list__item">
              <h2 class="selected-list__selected-list__item-title">受け取り方法を選択</h2>
              <div class="selected-list__selected-list__item-content">
                <label class="selected-list__selected-list__radio-label">
                  <input class="selected-list__selected-list__radio" type="radio" name="receive" checked>登録した住所にお届け
                </label>
                <label class="selected-list__selected-list__radio-label">
                  <input class="selected-list__selected-list__radio" type="radio" name="receive">購入した店舗で受け取り
                </label>
              </div>
            </li>

            <li class="buy-detail-modal__selected-list__item">
              <h2 class="selected-list__selected-list__item-title">お届け先住所を指定</h2>
              <div class="selected-list__selected-list__item-content">
                <label class="selected-list__selected-list__input-label">
                  <input class="selected-list__selected-list__input" type="text" value="林田航大">
                </label>
                <label class="selected-list__selected-list__input-label">
                  <input class="selected-list__selected-list__input" type="text" value="123-4567">
                </label>
                <label class="selected-list__selected-list__input-label">
                  <input class="selected-list__selected-list__input" type="text" value="神奈川県大和市大田区1-2-3">
                </label>
              </div>
            </li>

            <li class="buy-detail-modal__selected-list__item">
              <h2 class="selected-list__selected-list__item-title">支払方法選択</h2>
              <div class="selected-list__selected-list__item-content">

              </div>
            </li>
          </ul>
        </form>
      </div>
    </div>
  </div>
</body>
</html>
