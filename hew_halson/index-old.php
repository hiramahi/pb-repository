<?php
session_start();

$server_message = '';
if(isset($_SESSION['server_message'])){
    $server_message = $_SESSION['server_message'];
    unset($_SESSION['server_message']);
}

// DB処理
include_once('db_config.php');

$error = '';
$user_name = ['name' => 'ゲスト'];

try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    // 選択された店舗で取り扱う商品データ取得
    $sql = "SELECT p.id, p.name, p.price, p.imgURL FROM products p JOIN stores_products s ON p.id = s.products_id WHERE s.stores_id = :stores_id";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue(':stores_id', 1, PDO::PARAM_INT);
    $prepare->execute();
    $products = $prepare->fetchAll(PDO::FETCH_ASSOC); // 連想配列取得

    // ログイン済みであれば名前を取得
    if(isset($_SESSION['id'])){
      $sql = "SELECT name FROM users WHERE id = :users_id";
      $prepare = $pdo->prepare($sql);
      $prepare->bindValue(':users_id', $_SESSION['id'], PDO::PARAM_STR);
      $prepare->execute();
      $user_name = $prepare->fetch(PDO::FETCH_ASSOC);
    }
}catch(PDOException $e){
  $error = $e->getMessage();
}

?><!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>HALSON</title>
    <link rel="stylesheet" href="css/reset.css">
    <link rel="stylesheet" href="css/style.css">
    <script src="js/threejs/three.min.js"></script>
    <script src="js/threejs/GLTFLoader.js"></script>
    <script src="js/threejs/OrbitControls2.js"></script>
    <script src="js/threejs/DragControls.js"></script>
    <!-- <script src="js/threejs/TextGeometry.js"></script> -->
    <!-- <script src="js/threejs/FontLoader.js"></script> -->
    <script>
        const jsonUserName = <?php echo json_encode($user_name) ?>;
        const jsonProducts = <?php echo json_encode($products) ?>;
    </script>
    <script src="js/main.js"></script>
    <!-- <script src="js/main_text.js"></script> -->
</head>
<body>
  <!-- ローディングエリア -->
    <div id="loadingArea" class="loading-area">
        <div class="loading-area__main">
            <div class="loading-area__img-div"><img id="loadingImg" src="img/hew2_loading1.png"></div>
            <p class="loading-area__progress-bar">開店準備中...<span id="progressBarPercent">0</span>%</p>
        </div>
        
        <div class="loading-area__desc">
            <div class="loading-area__desc__title">
                <p id="loadingAreaDescTitle" class="loading-area__desc__title__text">マップ上での操作方法</p>
                <div class="loading-area__desc__mouse">
                    <p class="loading-area__desc__page"><span id="loadingAreaDescPageNum">1</span>/2</p>
                    <div class="loading-area__desc__click"><img src="img/right_click.png"></div>
                </div>
            </div>
            <div id="loadingAreaDescCont" class="loading-area__desc__cont">1. 右上の一覧から店舗を選択して、メニューの「マップ移動」（デフォルトでは東京マップに移動済）をクリックします。<br>2. 移動後、「出発する」が有効になるのでクリックします。<br>3. 出発後、「店に入る」が有効になるのでクリックします。<br>4. 入店後、買い物が始められます。</div>
        </div>
    </div>

    <!-- ロゴ -->
    <div id="logoArea" class="logo-area">
        <a href=""><div class="logo-area__logo"><img src="img/logo.png"></div></a>
    </div>

    <!-- ヘッダー -->
    <div class="header-area">

        <ul id="gnavList" class="header-area__gnav-list">
            <li class="header-area__gnav-list__item"></li>

            <li class="header-area__gnav-list__item">
                <a href="#storeArea">トップ</a>
                <p class="frame"></p>
                <p class="frame"></p>
                <p class="frame"></p>
                <p class="frame"></p>
            </li>

            <li class="header-area__gnav-list__item">
                <a id="loginAreaAnchor" href="#loginArea">ログイン</a>
                <p class="frame"></p>
                <p class="frame"></p>
                <p class="frame"></p>
                <p class="frame"></p>
            </li>

            <li class="header-area__gnav-list__item">
                <a href="#contactFooterArea">お問合せ</a>
                <p class="frame"></p>
                <p class="frame"></p>
                <p class="frame"></p>
                <p class="frame"></p>
            </li>

            <li class="header-area__gnav-list__item">
                <p class="header-close-btn">閉じる</p>
                <p class="frame"></p>
                <p class="frame"></p>
                <p class="frame"></p>
                <p class="frame"></p>
            </li>
        </ul>

        <div id="hamburgerMenu" class="header-area__hamburger-menu">
            <span></span>
            <span></span>
            <span></span>
        </div>

    </div>

    <!-- canvas -->
    <div id="displayArea">
        <canvas id="renderingArea"></canvas>

        <!-- 値札 -->
        <p id="productPriceTagArea" class="product-price-tag-area"></p>

        <!-- カートに追加された時のメッセージ -->
        <p id="viewMessageArea" class="view-message-area"></p>
    </div>

    <!-- header用のoverlay -->
    <div id="headerOverlayArea" class="header-overlay-area"></div>

    <!-- 店舗画面 -->
    <div id="storeArea" class="store-area">
        <!-- 店舗検索エリア -->
        <div id="storeSearchArea" class="store-search-area">
            <!-- <p class="store-search-area__title">以下から店舗を選択 → 出発 → 入店の手順で進めてください</p> -->
            <ul class="store-search-area__list">
                <li class="store-search-area__item">
                    <div class="store-search-area__item__content">
                        <p class="store-search-area__item__content-item"></p>
                        <p class="store-search-area__item__content-item">出発する</p>
                        <p class="store-search-area__item__content-item">店に入る</p>
                        <p class="store-search-area__item__content-item view-generalmapbtn" data-map-num="1">全体マップ</p>
                    </div>
                    <div id="nagoya" class="store-search-area__item__title">
                        <p class="store-search-area__item__text">名古屋店</p>
                        <p class="store-search-area__item__plus-btn">+</p>
                    </div>
                </li><li class="store-search-area__item">
                    <div class="store-search-area__item__content">
                        <p class="store-search-area__item__content-item"></p>
                        <p id="jumptoBtn" class="store-search-area__item__content-item">出発する</p>
                        <p class="store-search-area__item__content-item">店に入る</p>
                        <p class="store-search-area__item__content-item" id="tokyoMap" data-map-num="2">全体マップ</p>
                    </div>
                    <div id="tokyo" class="store-search-area__item__title">
                        <p class="store-search-area__item__text">東京店</p>
                        <p class="store-search-area__item__plus-btn">+</p>
                    </div>
                </li><li class="store-search-area__item">
                    <div class="store-search-area__item__content">
                        <p class="store-search-area__item__content-item"></p>
                        <p class="store-search-area__item__content-item">出発する</p>
                        <p class="store-search-area__item__content-item">店に入る</p>
                        <p class="store-search-area__item__content-item view-generalmapbtn" data-map-num="0">全体マップ</p>
                    </div>
                    <div id="osaka" class="store-search-area__item__title">
                        <p class="store-search-area__item__text">大阪店</p>
                        <p class="store-search-area__item__plus-btn">+</p>
                    </div>
                </li>
            </ul>
        </div>

        <!-- カートエリア -->
        <div id="cartArea" class="cart-area">
            <ul id="cartAreaList" class="cart-area__list"></ul>
            <div class="cart-area__not-list">
                <div class="cart-area__not-list__item1">
                    <p class="cart-area__not-list__text">小計：</p>
                    <p class="cart-area__not-list__text"><span id="cartAreaSumPrice"></span>円</p>
                </div>
                <div class="cart-area__not-list__item2">
                    <p class="cart-area__not-list__text">合計：</p>
                    <p class="cart-area__not-list__text"><span id="cartAreaSumQuantity"></span>点</p>
                </div>
                
                <div id="cartAreaResetBtn" class="cart-area__reset-btn">ドローンリセット</div>
                <div id="cartAreaRegiBtn" class="cart-area__regi-btn">ドローンを飛ばす</div>
            </div>
        </div>

        <!-- カメラ操作ボタンエリア -->
        <ul id="cambtnArea" class="cambtn-area">
            <li class="cambtn-area__btn"><p id="camLeftBtn" class="cambtn-area__btn__arrow">&#8678;</p><p id="camRightBtn" class="cambtn-area__btn__arrow">&#8680;</p></li>
            <li class="cambtn-area__btn" style=background:#2C92C5>おにぎり</li>
            <li class="cambtn-area__btn">サンド・惣菜</li>
            <li class="cambtn-area__btn">弁当</li>
            <li class="cambtn-area__btn">酒</li>
            <li class="cambtn-area__btn">飲料</li>
            <li class="cambtn-area__btn">飲料</li>
            <li class="cambtn-area__btn">デザート</li>
            <li class="cambtn-area__btn">アイス</li>
            <li class="cambtn-area__btn">冷凍食品</li>
            <li class="cambtn-area__btn">インスタント</li>
            <li class="cambtn-area__btn">パン</li>
            <li class="cambtn-area__btn">菓子</li>
            <li id="camReset" class="cambtn-area__btn">視点リセット</li>
        </ul>

        <!-- 店を出る(店舗画面時) -->
        <p id="exitStoreBtn" class="exit-store-btn">店から出る</p>

        <!-- 商品モーダル                               viewProductInfoBtnとかに変更                                -->
        <div id="productModal" class="product-modal">
            <div class="product-modal__nav-area">
            <p id="productModalProductBtn" class="product-modal__switch-btn">商品情報</p>
            <p id="productModalForumBtn" class="product-modal__switch-btn">掲示板</p>
            <div id="productModalHideBtn" class="product-modal__hide-btn">×</div>
            </div>

            <div id="productModalContent" class="product-modal__content"></div>
        </div>

        <!-- 商品がドラッグエンドされた時 -->
        <div id="selectedQuantityModal" class="selected-quantity-modal">
            <form class="selected-quantity-modal__form">
                <p id="selectedQuantityTitle" class="selected-quantity-modal__title"></p>

                <div class="selected-quantity-modal__content">
                    <p class="selected-quantity-modal__text">×</p>
                    <select id="selectedQuantitySelect" class="selected-quantity-modal__select">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                    <p class="selected-quantity-modal__text">個を</p>
                    <input id="selectedQuantityCartBtn" class="selected-quantity-modal__cartbtn" type="button" value="ドローンに積む">
                </div>
            </form>
            <div id="selectedQuantityHideBtn" class="selected-quantity-modal__hidebtn">×</div>
        </div>

        <!-- storeArea(selectedQuantityModal)用のoverlay -->
        <div id="storeOverlay" class="store-overlay"></div>

        <!-- カート追加領域 -->
        <div id="dragDropBox" class="drag-drop-box"><img class="drag-drop-box__img" src="img/drone.png"></div>
    </div>

    <!-- 注文内容エリア -->
    <div id="orderArea" class="order-area">
        <p id="viewOrderBtn" class="order-area__view-order-btn">注文内容を見る</p>

        <!-- viewOrderBtnが押された時だけ表示 -->
        <div id="orderDetails" class="order-area__order-details">
            <!-- カートリスト -->
            <ul class="order-area__cart"></ul>

            <!-- 詳細リスト -->
            <div id="orderAreaDetails" class="order-area__details">
                <div class="order-area__details__item">
                    <p class="order-area__details__item__title">お届け先<span><a href="#">変更</a></span></p>

                    <div class="order-area__details__item__content">
                        <div class="order-area__details__item__content__items">
                            <p class="order-area__details__item__content__item">山田太郎</p>
                            <p class="order-area__details__item__content__item">160-0023</p>
                            <p class="order-area__details__item__content__item">東京都新宿区西新宿1丁目7-3</p>
                        </div>
                        <label class="order-area__details__item__content__title">
                            <input type="radio" name="receive" checked>購入した店舗で受け取り
                        </label>
                    </div>

                    <div class="order-area__details__item__content">
                        <div class="order-area__details__item__content__items">
                            <p class="order-area__details__item__content__item">山田太郎</p>
                            <p class="order-area__details__item__content__item">160-0023</p>
                            <p class="order-area__details__item__content__item">東京都新宿区西新宿1丁目7-3</p>
                        </div>
                        <label  class="order-area__details__item__content__title">
                            <input type="radio" name="receive">指定した住所にお届け
                        </label>
                    </div>
                </div>

                <div class="order-area__details__item">
                    <p class="order-area__details__item__title">お支払方法<span><a href="#">変更</a></span></p>

                    <div class="order-area__details__item__content">
                        <div class="order-area__details__item__content__items">
                            <p class="order-area__details__item__content__item">山田太郎</p>
                            <p class="order-area__details__item__content__item">160-0023</p>
                            <p class="order-area__details__item__content__item">東京都新宿区西新宿1丁目7-3</p>
                        </div>
                        <label class="order-area__details__item__content__title">
                            <input type="radio" name="payment" checked>購入した店舗で直接支払い
                        </label>
                    </div>

                    <div class="order-area__details__item__content">
                        <div class="order-area__details__item__content__items">
                            <p class="order-area__details__item__content__item">山田太郎</p>
                            <p class="order-area__details__item__content__item">160-0023</p>
                            <p class="order-area__details__item__content__item">東京都新宿区西新宿1丁目7-3</p>
                        </div>
                        <label class="order-area__details__item__content__title">
                            <input type="radio" name="payment">クレジットカード払い
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- ログインエリア -->
    <div id="loginArea" class="login-area">

        <?php if(isset($_SESSION['id'])): ?>
            <div class="login-area__logined">
                <p class="login-area__logined__text">ログイン済みです。</p>
                <p class="login-area__logined__text"><a href="logout.php" style=color:red>ログアウト</a></p>
            </div>

        <?php else: ?>
            <form class="login-area__form" action="login.php" name="loginForm" method="post" autocomplete="off">

                <p id="loginAreaError" class="error-area"><?php echo $server_message ?></p>

                <p class="modal-title"><span class="modal-title__span">HALSON</span>にログイン</p>

                <div class="login-area__item">
                    <input class="login-area__input" type="email" name="id" id="login_id" value="" placeholder=" " required>
                    <label class="login-area__label" for="login_id">メールアドレス</label>
                </div>

                <div class="login-area__item">
                    <input class="login-area__input" type="password" name="password" id="login_pass" value="" placeholder=" " required>
                    <label class="login-area__label" for="login_pass">パスワード</label>
                </div>

                <!-- <p class="login-area__other-link">パスワードを忘れた場合はこちら</p> -->
            
                <input class="login-area__submit-btn" type="submit" value="ログイン">

                <p id="switchSignupAreaBtn" class="login-area__other-link">アカウントをお持ちでない場合はこちら</p>
            </form>
        <?php endif ?>

    </div>

    <!-- 新規ユーザ登録エリア -->
    <div id="signupArea" class="login-area signup-area">
        <form class="login-area__form" action="signup.php" name="signupForm" method="post" autocomplete="off">
            <p id="signupAreaError" class="error-area"></p>
            <p class="modal-title"><span class="modal-title__span">HALSON</span>に新規ユーザ登録</p>

            <div class="login-area__item">
                <input class="login-area__input" type="email" name="id" id="signup_id" placeholder=" " required>
                <label class="login-area__label" for="signup_id">メールアドレス</label>
            </div>
    
            <div class="login-area__item">
                <input class="login-area__input" type="password" name="password" id="signup_password" placeholder=" " required>
                <label class="login-area__label" for="signup_password">パスワード</label>
            </div>

            <div class="login-area__item">
                <input class="login-area__input" type="password" name="confirm_password" id="signup_confirm-password" placeholder=" " required>
                <label class="login-area__label" for="signup_confirm-password">確認用パスワード</label>
            </div>

            <div class="login-area__item">
                <input class="login-area__input" type="text" name="name" id="signup_name" placeholder=" " required>
                <label class="login-area__label" for="signup_name">名前</label>
            </div>

            <div class="login-area__item">
                <input class="login-area__input" type="text" name="kananame" id="signup_kananame" placeholder=" " required>
                <label class="login-area__label" for="signup_kananame">フリガナ</label>
            </div>

            <div class="login-area__item">
                <input class="login-area__input" type="text" name="nickname" id="signup_nickname" placeholder=" " required>
                <label class="login-area__label" for="signup_nickname">ニックネーム</label>
            </div>
    
            <input class="login-area__submit-btn" type="submit" value="この内容で登録する">

            <p id="switchLoginAreaBtn" class="login-area__other-link">ログイン画面に戻る</p>
        </form>

    </div>

    <!-- お問い合わせ + フッターエリア -->
    <div id="contactFooterArea" class="contact-footer-area">
        <!-- お問い合わせエリア -->
        <div id="contactArea" class="contact-area">
            <?php if(!isset($_SESSION['id'])): ?>
                <p class="contact-area__not-logged-in">お問い合わせ機能はログイン後に使えます。</p>
            <?php else: ?>

                <form class="contact-area__form" action="contact.php" method="post">
                    <?php if(!empty($server_message)): ?>
                        <p class="error-area"><?php echo $server_message ?></p>
                    <?php endif ?>

                    <p class="contact-title"><span class="modal-title__span">HALSON</span>にお問い合わせ</p>

                    <table>
                        <tr class="contact-area__tr">
                            <th class="contact-area__th">お問い合わせ種別<span class="form-require-item">※</span></th>
                            <td class="contact-area__td">
                                <select class="contact-area__select" name="contact_items_id" required>
                                    <option value="" hidden>お問い合わせ種別</option>
                                    <option value="1">HALSONサイトに関するお問い合わせ</option>
                                    <option value="2">店内サービスに関するお問い合わせ</option>
                                    <option value="3">商品に関するお問い合わせ</option>
                                    <option value="4">キャンペーンに関するお問い合わせ</option>
                                </select>
                            </td>
                        </tr>

                        <tr class="contact-area__tr">
                            <th class="contact-area__th">返事の要不要<span class="form-require-item">※</span></th>
                            <td class="contact-area__td">
                                <label class="contact-area__label">
                                    <input class="contact-area__input" type="radio" name="is_replied" value="1">必要
                                </label>
                                <label class="contact-area__label">
                                    <input class="contact-area__input" type="radio" name="is_replied" value="0" checked>不要
                                </label>
                            </td>
                        </tr>

                        <tr class="contact-area__tr">
                            <th class="contact-area__th contact-area__th-last">お問い合わせ内容<span class="form-require-item">※</span></th>
                            <td class="contact-area__td">
                                <textarea class="contact-area__textarea" name="text" rows="8" placeholder="例)いらっしゃいませ" required></textarea>
                            </td>
                        </tr>
                    </table>

                    <input id="contactAreaSubmitBtn" class="login-area__submit-btn contact-area__submit-btn" type="submit" value="送信">
                </form>
            <?php endif ?>
        </div>

        <!-- フッターエリア -->
        <div class="footer-area">
            <p class="footer-area__text">&copy; 2022 HALSON</p>
        </div>
    </div>

</body>
</html>