<?php
session_start();

$server_message = '';
if (isset($_SESSION['server_message'])) {
	$server_message = $_SESSION['server_message'];
	unset($_SESSION['server_message']);
}

// DB処理
include_once('db_config.php');

$error = '';
$user_name = ['name' => 'ゲス'];///////////////////////////////////////

try {
	$pdo = new PDO($dsn, $db_user, $db_pass);
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	$pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

	// 選択された店舗で取り扱う商品データ取得
	$sql = "SELECT p.id, p.name, p.price, p.imgURL url FROM products p JOIN stores_products s ON p.id = s.products_id WHERE s.stores_id = :stores_id";
	$prepare = $pdo->prepare($sql);
	$prepare->bindValue(':stores_id', 1, PDO::PARAM_INT);
	$prepare->execute();
	$products = $prepare->fetchAll(PDO::FETCH_ASSOC); // 連想配列取得

	// ログイン済みであれば名前を取得
	if (isset($_SESSION['id'])) {
		$sql = "SELECT name FROM users WHERE id = :users_id";
		$prepare = $pdo->prepare($sql);
		$prepare->bindValue(':users_id', $_SESSION['id'], PDO::PARAM_STR);
		$prepare->execute();
		$user_name = $prepare->fetch(PDO::FETCH_ASSOC);
	}
} catch (PDOException $e) {
	$error = $e->getMessage();
}

?>
<!DOCTYPE html>
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
	<script>
		const userName = <?php echo json_encode($user_name) ?>;
		const products = <?php echo json_encode($products) ?>;
	</script>
	<!-- <script src="js/main.js" type="module"></script> -->
	<script src="js/main.js"></script>

</head>
<body>
	<!-- ローディングエリア -->
	<div id="loadingArea" class="loading-area loading-area--active">
		<div class="loading-area__main">
			<p id="progressBar" class="loading-area__progress-bar"></p>
			<div id="loadingImgDiv" class="loading-area__img-div"><img id="loadingImg" src="img/hew2_loading_center.png"></div>
		</div>

		<div class="loading-area__desc">
			<p class="loading-area__ttl"></p>
			<p class="loading-area__cont"></p>
			<div class="loading-area__sub">
				<p class="loading-area__page-num">1/2</p>
				<div class="loading-area__mouse-img"><img src="img/right_click.png"></div>
			</div>
		</div>
	</div>

	<!-- ロゴ -->
	<div id="logoArea" class="logo-area"><a href=""><img class="logo-area__img-div" src="img/logo.png"></a></div>

	<!-- ユーザ名 -->
	<p id="userNameArea" class="user-name-area">ゲスト</p>

	<!-- canvas -->
	<div id="displayArea">
		<canvas id="renderingArea"></canvas>

		<p id="priceTagArea" class="price-tag-area"></p>

		<p id="viewMessageArea" class="view-message-area"></p>
	</div>

	<!-- 店舗画面 -->
	<div id="storeArea" class="store-area">
		<!-- マップ操作ボタン -->
		<div id="preStoreBtn" class="command1 pre-store-btn" data-main="-1">
			<p class="command1__text">ログイン・お問合せ</p>
			<p class="command1__arrow">&or;</p>
		</div>
		<div id="nextStoreBtn" class="command1 next-store-btn" data-main="1">
			<p class="command1__text">神奈川マップ</p>
			<p class="command1__arrow">&and;</p>
		</div>
		<div id="goStoreBtn" class="command2 go-store-btn">
			<p class="command2__arrow">&and;</p>
			<p class="command2__text">出発する</p>
		</div>
		<div id="backStoreBtn" class="command2 back-store-btn">
			<p class="command2__text">&minus;</p>
			<p class="command2__arrow">&or;</p>
		</div>

		<!-- 現在地エリア -->
		<div class="current-map-name">現在地：<span id="currentMapName">東京マップ</span></div>

		<!-- カートエリア -->
		<div id="cartArea" class="cart-area">
			<ul id="cartAreaList" class="cart-area__list"></ul>

			<ul class="cart-area__btns">
				<li class="cart-area__btn"><p class="cart-area__btn__text" style="padding: 3px 0 0 3px; text-align: left">小計：</p><p class="cart-area__btn__text"><span id="cartAreaSumPrice"></span>円（<span id="cartAreaSumQuantity"></span>点）</p></li>
				<li id="cartAreaResetBtn" class="cart-area__btn">ドローンリセット</li>
				<li id="cartAreaRegiBtn" class="cart-area__btn">
					<div style="position:relative; top: 17px">
						<p class="cart-area__btn__text">ドローンを飛ばす</p>
						<p class="cart-area__btn__text">（確認画面を挟みます）</p>
					</div>
				</li>
			</ul>
		</div>

		<!-- カメラ操作ボタンエリア -->
		<div id="cambtnArea" class="cambtn-area">
			<ul class="cambtn-area__btns">
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
		</div>

		<!-- 商品モーダル                               viewProductInfoBtnとかに変更                                -->
		<div id="productModal" class="product-modal">
			<div class="product-modal__nav-area">
				<p id="productModalProductBtn" class="product-modal__switch-btn">商品情報</p>
				<p id="productModalForumBtn" class="product-modal__switch-btn">掲示板</p>
				<div id="productModalHideBtn" class="product-modal__hide-btn">×</div>
			</div>

			<div id="productModalContent" class="product-modal__content"></div>
		</div>

		<!-- 商品ドラッグ時モーダル -->
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

		<!-- overlay -->
		<div id="storeOverlay" class="store-overlay"></div>

		<!-- カート追加領域 -->
		<div id="dropBox" class="drop-box">
			<p class="drop-box__text">ここにドロップ</p>
			<img class="drop-box__img" src="img/drone.png">
		</div>
	</div>

	<!-- 注文内容エリア -->
	<div id="orderArea" class="order-area">
		<form id="orderDetails" class="order-area__wrap">
			<!-- カートリスト -->
			<ul id="orderAreaCart" class="order-area__cart"></ul>

			<!-- 詳細リスト -->
			<ul id="orderAreaDetails" class="order-area__details">
				<li class="order-area__details__item">
					<p class="order-area__details__item__title">お届け先（指定した住所にお届けのみ）</p>

					<ul class="order-area__details__item__content">
						<li class="order-area__details__item__content__text"><input type="text" value="ハルソン"></li>
						<li class="order-area__details__item__content__text"><input type="text" value="160-0023"></li>
						<li class="order-area__details__item__content__text"><input type="text" value="東京都新宿区西新宿1丁目7-3"></li>
					</ul>
				</li>

				<li class="order-area__details__item">
					<p class="order-area__details__item__title">お支払方法（クレジットカード払いのみ）</p>

					<ul class="order-area__details__item__content">
						<li class="order-area__details__item__content__text"><input type="text" value="1234567891234567"></li>
					</ul>
				</li>

				<li id="orderAreaSubmitBtn" class="order-area__details__submit-btn">
					<p class="order-area__details__submit-btn__text">ドローンを飛ばす</p>
					<p class="order-area__details__submit-btn__text">（注文が確定します）</p>
				</li>
			</ul>
		</form>
	</div>

	<!-- ログインエリア -->
	<div id="loginArea" class="login-area login-area--active">
		<div class="page-overlay login-area__overlay">
			<?php if (isset($_SESSION['id'])) : ?>
				<p class="login-area__logined"><a href="logout.php" style="color:red">ログアウト</a></p>

			<?php else : ?>
				<form class="login-area__form" action="login.php" name="loginForm" method="post" autocomplete="off">

					<p id="loginAreaError" class="error-area"><?php echo $server_message ?></p>
					<p class="error-area">HEW用：このままログインできます。</p>

					<p class="modal-title"><span class="modal-title__span">HALSON</span>にログイン</p>

					<div class="login-area__item">
						<input class="login-area__input" type="email" name="id" id="login_id" value="hew@halson.com" placeholder=" " required>
						<label class="login-area__label" for="login_id">メールアドレス</label>
					</div>

					<div class="login-area__item">
						<input class="login-area__input" type="password" name="password" id="login_pass" value="hew" placeholder=" " required>
						<label class="login-area__label" for="login_pass">パスワード</label>
					</div>

					<!-- <p class="login-area__other-link">パスワードを忘れた場合はこちら</p> -->

					<input class="login-area__submit-btn" type="submit" value="ログイン">

					<p id="switchSignupAreaBtn" class="login-area__other-link">アカウントをお持ちでない場合はこちら</p>
				</form>
			<?php endif ?>
		</div>
	</div>

	<!-- 新規ユーザ登録エリア -->
	<div id="signupArea" class="login-area signup-area login-area--active">
		<div class="page-overlay signup-area__overlay">
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

	</div>

	<!-- お問い合わせ -->
	<div id="contactArea" class="contact-footer-area login-area--active">
		<div class="page-overlay login-area__overlay">
			<!-- お問い合わせエリア -->
			<?php if (!isset($_SESSION['id'])) : ?>
				<p class="contact-area__not-logged-in">お問い合わせ機能はログイン後に使えます。</p>
			<?php else : ?>

				<form class="contact-area__form" action="contact.php" method="post">
					<?php if (!empty($server_message)) : ?>
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
	</div>

</body>

</html>