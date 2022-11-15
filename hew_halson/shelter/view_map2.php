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
    $sql = "SELECT p.id, p.name, p.imgURL FROM products p JOIN stores_products s ON p.id = s.products_id WHERE s.stores_id = :stores_id";
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
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Halson - Toppage</title>
    <link rel="stylesheet" href="css/reset.css">
    <link rel="stylesheet" href="css/map.css">
    <link rel="stylesheet" href="css/map_store.css">
    <link rel="stylesheet" href="css/docSlider.css">
    <script src="js/threejs/three.min.js"></script>
    <script src="js/threejs/GLTFLoader.js"></script>
    <script src="js/threejs/OrbitControls2.js"></script>
    <script>
        const jsonUserName = <?php echo json_encode($user_name) ?>;
        const jsonProducts = <?php echo json_encode($products) ?>;
    </script>
    <script src="js/map.js"></script>
</head>
<body>
  <!-- ローディングエリア -->
    <div id="loadingArea" class="loading-area">
        <div class="loading-area__content">
            <div class="loading-area__img-div"><img src="img/hew2_loading.png"></div>
            <p class="loading-area__progress-bar">開店準備中...<span id="progressBarPercent">0</span>%</p>
        </div>
    </div>

    <!-- ロゴ -->
    <div id="logoArea" class="logo-area">
        <a href=""><div class="logo-area__logo"><img src="img/logo.png"></div></a>
    </div>

    <!-- ヘッダー -->
    <div id="headerArea" class="header-area">
        <div id="hamburgerMenuArea" class="header-area__hamburger-menu header-area__hamburger-menu-active">
            <span></span>
            <span></span>
            <span></span>
        </div>

        <div id="gnavArea" class="header-area__gnav">
            <p class="header-area__user-name">ゲスト</p>
            <ul id="gnavList" class="header-area__list">
                <li class="header-area__list__item"><a href="#storeArea"><span class="header-area__list__item__mark">&#9654;</span><p class="header-area__list__item__text">トップ</p></a></li>
                <li class="header-area__list__item"><a href="#loginArea"><span class="header-area__list__item__mark">&#9654;</span><p class="header-area__list__item__text">ログイン</p></a></li>
                <li class="header-area__list__item"><a href="#contactFooterArea"><span class="header-area__list__item__mark">&#9654;</span><p class="header-area__list__item__text">お問合せ</p></a></li>
                <li class="header-area__list__item"><a href="#"><span class="header-area__list__item__mark">&#9654;</span><p class="header-area__list__item__text">閉じる</p></a></li>
            </ul>
        </div>
    </div>

    <!-- canvas(背景) -->
    <div id="displayArea">
        <canvas id="renderingArea"></canvas>

        <!-- 値札 -->
        <p id="productPriceTagArea" class="product-price-tag-area"></p>

        <!-- カートに追加された時のメッセージ -->
        <div id="viewMessageArea"><p id="viewMessage"></p></div>
    </div>

    <!-- ヘッダー開けた時用の overlay -->
    <div id="overlayArea" class="overlay-area"></div>

    <div id="wrap">
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
                            <p class="store-search-area__item__content-item">全体マップ</p>
                        </div>
                        <div id="nagoya" class="store-search-area__item__title">
                            <p class="store-search-area__item__text">名古屋店</p>
                            <p class="store-search-area__item__plus-btn">+</p>
                        </div>
                    </li><li class="store-search-area__item">
                        <div class="store-search-area__item__content">
                            <p class="store-search-area__item__content-item"></p>
                            <p id="jumpToTokyoBtn" class="store-search-area__item__content-item">出発する</p>
                            <p id="enterStoreTokyoBtn" class="store-search-area__item__content-item">店に入る</p>
                            <p id="viewEachMapBtn" class="store-search-area__item__content-item">全体マップ</p>
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
                            <p class="store-search-area__item__content-item">全体マップ</p>
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
                    
                    <div id="cartAreaResetBtn" class="cart-area__reset-btn">カートリセット</div>
                    <div id="cartAreaRegiBtn" class="cart-area__regi-btn">レジへ進む</div>
                </div>
            </div>

            <!-- カメラ操作ボタンエリア -->
            <ul id="cambtnArea" class="cambtn-area">
                <li class="cambtn-area__btn"><p id="camLeftBtn" class="cambtn-area__btn__arrow">&#8678;</p><p id="camRightBtn" class="cambtn-area__btn__arrow">&#8680;</p></li>
                <li class="cambtn-area__btn" style=background-color:#2C92C5>おにぎり</li>
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

            <!-- <p id="exitStoreArea" class="exit-store-area">店を出る</p> -->

            <!-- 商品モーダル -->
            <div id="productModal" class="product-modal">
                <div class="product-modal__nav-area">
                <p id="productModalProductBtn" class="product-modal__switch-btn">商品情報</p>
                <p id="productModalForumBtn" class="product-modal__switch-btn">掲示板</p>
                <div id="productModalHideBtn" class="product-modal__hide-btn">×</div>
                </div>

                <div id="productModalContent" class="product-modal__content"></div>
            </div>
        </div>

        <!-- ログインエリア -->
        <div id="loginArea" class="login-area">

            <?php if(isset($_SESSION['id'])): ?>
                <div class="login-area__logined">
                <p class="login-area__logined__text">ログイン済みです。</p><br>
                <p class="login-area__logined__text"><a href="logout.php" style=color:red>ログアウト</a></p>
                </div>

            <?php else: ?>
                <form class="login-area__form" action="login.php" name="loginForm" method="post" autocomplete="off">

                <?php if(!empty($server_message)): ?>
                    <p id="loginAreaError" class="error-area"><?php echo $server_message ?></p>
                <?php endif ?>

                <p class="modal-title"><span class="modal-title__span">HALSON</span>にログイン</p>

                <div class="login-area__item">
                    <input class="login-area__input" type="email" name="id" id="login_id" value="" placeholder=" " required>
                    <label class="login-area__label" for="login_id">メールアドレス</label>
                </div>

                <div class="login-area__item">
                    <input class="login-area__input" type="password" name="password" id="login_pass" value="" placeholder=" " required>
                    <label class="login-area__label" for="login_pass">パスワード</label>
                </div><br>

                <!-- <p class="login-area__other-link">パスワードを忘れた場合はこちら</p> -->
            
                <input class="login-area__submit-btn" type="submit" value="ログイン">

                <p id="changeSignupAreaBtn" class="login-area__other-link">アカウントをお持ちでない場合はこちら</p>
                </form>
            <?php endif ?>

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
    </div>

    <script>
        (function () {
            'use strict';
            
            // 変数
            var wrap = document.getElementById('wrap'),
                elements = document.querySelectorAll('#wrap > div'), // 1画面分スクロールさせる要素
                elRect = [], // 要素の位置情報を取得するための配列
                elTop = [], // 要素の位置を入れるための配列
                count = 0, // 
                wheelFlag = false;
                console.log(elements);
            
            // 各要素の位置を取得
            function getElTop() {
                for (var i = 0; i < elements.length; i++) { // 要素の数ループ
                elRect.push(elements[i].getBoundingClientRect()); // 要素の位置情報を配列へ
                }
                for (var i = 0; i < elRect.length; i++) { // 要素の数ループ
                elTop.push(elRect[i].top + window.scrollY); // 要素の位置を配列へ
                }
            }
            getElTop();
            
            // 画面リサイズのときの処理
            // window.addEventListener('resize', function () {
            //     elRect = []; // 位置情報の配列を一旦空に
            //     elTop = []; // 位置の配列を一旦空に
            //     getElTop(); // 位置を取得
            //     window.scrollTo(0, elTop[count]); // 現在表示中の画面位置へ
            // });
            // マウスホイールのときの処理
            wrap.addEventListener('wheel', function (e) {
                e.preventDefault(); // デフォルトのスクロール動作を削除
                if (!wheelFlag) { // wheelFlagがfalseのときに発動
                wheelFlag = true; // wheelFlagをtrueにして無駄に発動しないように
                if (e.deltaY > 0) { // ホイールが下方向だったら
                    if (count >= elements.length - 1) { // 要素の数以上に増えないようにcountが要素の数を超えたら
                    count = elements.length - 1; // countを要素の数とする
                    } else {
                    count++; // それまではcountをプラス
                    }
                } else if (e.deltaY < 0) { // ホイールが上方向だったら
                    if (count <= 0) { // 0より小さくならないようにcountが0以下なら
                    count = 0; // countを0とする
                    } else {
                    count--; // それまではcountをマイナスしていく
                    }
                }
                setTimeout(function () { //0.8秒後にwheelFlagをfalseにして次のページめくれるように
                    wheelFlag = false;
                },800);
                setTimeout(function () {
                    window.scrollTo({ // count番目の要素へスクロール
                    top: elTop[count],
                    behavior: 'smooth',
                    });
                },20); // スクロールまで時間差をつけて慣性スクロール対策
                }
            });
        }());
    </script>

</body>
</html>