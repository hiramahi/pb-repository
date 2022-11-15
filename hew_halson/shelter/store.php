<?php
session_start();

if(!(isset($_GET['stores_id'])
  && ($_GET['stores_id'] === '1'
      || $_GET['stores_id'] === '2'
      || $_GET['stores_id'] === '3'))){
  header('Location: index.php');
  exit;
}

// ファイル読込
include('db_config.php');

// DB処理
$error = '';
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $sql = "SELECT * FROM products ORDER BY 1";
    $prepare = $pdo->prepare($sql);
    $prepare->execute();

    // 連想配列取得
    $products = $prepare->fetchAll(PDO::FETCH_ASSOC);
    $json_product_data = json_encode($products);

    // 選択された店舗の在庫数を取得
    $sql = "SELECT products_id, quantity FROM stores_products WHERE stores_id = :stores_id";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue(':stores_id', $_GET['stores_id']);

    $prepare->execute();

    $quantities = $prepare->fetchAll(PDO::FETCH_ASSOC);
    $json_quantity_data = json_encode($quantities);

}catch(PDOException $e){
  $error = $e->getMessage();
}
?><!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8"/>
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/store.css">
  <script src="js/threejs/three.min.js"></script>
  <script src="js/threejs/GLTFLoader.js"></script>
  <script src="js/threejs/OrbitControls.js"></script>
  <script>
    const phpGetStoreNum = <?php echo $_GET['stores_id'] ?>;
    const jsonProductData = <?php echo $json_product_data ?>;
    const jsonQuantityData = <?php echo $json_quantity_data ?>;
  </script>
  <script src="js/main2.js"></script>
  <title>商品選択ページ</title>
</head>
<body>
  <div id="main-canvas">
    <canvas id="my-canvas"></canvas>
    <div class="alink">
      <p><a href="index.php">index</a></p>
      <p id="camCoord_btn">カメラ座標</p>
      <p>
        <?php if(isset($_SESSION['id'])): echo $_SESSION['id'];
              else: echo 'ログインされてません';
              endif; ?>
      </p>
    </div>

    <div id="productModal" class="product-modal">
      <div class="product-modal__flex">
        <div class="product-modal__img-div">
          <img id="productModalImg" class="product-modal__img">
        </div>
        <div id="productModalInfoDiv" class="product-modal__text-div">
          <h2 id="productModalTitle" class="product-modal__title"></h2>
          <p id="productModalPrice" class="product-modal__price-quantity">
            <span id="productModalQuantity"></span> /
            <span id="productModalDesc"></span>
          </p>
          <p class="product-modal__desc"></p>
          <div class="product-modal__btn-area">
            <label class="product-modal__label">数量：
              <select id="productModalSelect" class="product-modal__select"></select><br>
            </label>
            <div id="addToCartBtn" class="add-to-cart-btn">カートに入れる</div>
          </div>
        </div>
      </div>
      <div id="modalHideBtn" class="modal-hide-btn">×</div>
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
  
  <div id="cartArea" class="cart-area">
    <ul id="cartAreaList"></ul>
    <div class="cart-area__sum-price">合計金額：<span id="cartAreaSumPrice"></span>円</div>
    <div id="cartAreaResetBtn" class="cart-area__reset-btn">カートリセット</div>
  </div>

  <!-- <div class="cambtn-area__btn">
    <p id="camLeft" class="cambtn-area__span">カメラ移動【左】</p>
  </div>
  <div class="cambtn-area__btn">
    <p id="camRight" class="cambtn-area__span">カメラ移動【右】</p>
  </div> -->

  <!-- <button id="btnCoord_btn" type="button" name="button" onclick="getBtnCoord()">このボタンの座標を取得</button>
  <button id="camCoord_btn" type="button" name="button">カメラ位置の座標を取得</button>
  <button id="camReset_btn" type="button" name="button">カメラ位置をリセット</button>
  <button id="camZoom_btn" type="button" name="button">拡大表示 / 縮小表示</button> -->

</body>
</html>
