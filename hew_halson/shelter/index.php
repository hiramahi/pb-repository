<?php
session_start();

$login_error = '';
$signup_error = '';
if(isset($_SESSION['login_error'])){
  $login_error = $_SESSION['login_error'];
  unset($_SESSION['login_error']);
}else if(isset($_SESSION['signup_error'])){
  $signup_error = $_SESSION['signup_error'];
  unset($_SESSION['signup_error']);
}
?><!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8"/>
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/index.css">
  <script src="js/threejs/three.min.js"></script>
  <script src="js/threejs/GLTFLoader.js"></script>
  <script src="js/threejs/OrbitControls.js"></script>
  <script>
    const loginError = '<?php echo $login_error ?>';
  </script>
  <script src="js/main.js"></script>
  <title>トップページ</title>
</head>
<body>
  <div class="header">
    <div class="header__logo-area">
      <img class="logo-area__img" src="img/logo2.png">
    </div>

    <div class="header__top-white"></div>
    <div class="header__blue">
      <div class="blue__search-box">
        検索窓領域
      </div>
    </div>
    <div class="header__center-white"></div>
    <div class="header__red"></div>
    <div class="header__bottom-white">
      <ul class="bottom-white__ul">
        <li class="bottom-white__li">ログイン</li>
        <li class="bottom-white__li">ユーザ情報</li>
        <li class="bottom-white__li">店舗検索</li>
        <li class="bottom-white__li">掲示板</li>
        <li class="bottom-white__li">お問い合わせ</li>
      </ul>
    </div>
  </div>

  <!-- canvasは親子構造を持つことができない ⇒ 要素を重ねることができない。重ねるためには、親要素にdivを持たせ、positionで配置する必要がある。重ねたい要素は、親divの中でcanvasと並行になる構造を取る-->
  <div id="displayArea">
    <canvas id="renderingArea"></canvas>

    <div id="getCamPosiArea">
      カメラ座標<span id="getCamPosiSpan"></span>
    </div>


    <!-- 新規ユーザ登録エリア -->
    <div id="signupArea" class="login-area signup-area">
      <form id="signupAreaForm" class="login-area__form" name="signupForm" autocomplete="off">
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
  
        <input class="login-area__submit-btn" type="submit" value="入力内容確認">
      </form>
      <!-- <div class="modal-hide-btn">×</div> -->
      <input class="backto-loginmodal-btn" type="reset" form="signupAreaForm" value="&crarr;">
    </div>

    <!-- 新規ユーザ登録エリア(入力内容確認) -->
    <div id="signupConfirmArea" class="login-area signup-confirm-area">
      <form class="login-area__form" action="signup.php" name="signupConfirmForm" method="post" autocomplete="off">
        <p class="modal-title">入力内容確認</p>

        <div class="login-area__item">
          <input class="login-area__input" type="email" name="id" id="signup-confirm_id" placeholder=" " readonly="readonly">
          <label class="login-area__label" for="signup-confirm_id">メールアドレス</label>
        </div>
  
        <div class="login-area__item">
          <input class="login-area__input" type="password" name="password" id="signup-confirm_password" placeholder=" " readonly="readonly">
          <label class="login-area__label" for="signup-confirm_password">パスワード</label>
        </div>

        <div class="login-area__item">
          <input class="login-area__input" type="password" name="confirm_password" id="signup-confirm_confirm-password" placeholder=" " readonly="readonly">
          <label class="login-area__label" for="signup-confirm_confirm-password">確認用パスワード</label>
        </div>

        <div class="login-area__item">
          <input class="login-area__input" type="text" name="name" id="signup-confirm_name" placeholder=" " readonly="readonly">
          <label class="login-area__label" for="signup-confirm_name">名前</label>
        </div>

        <div class="login-area__item">
          <input class="login-area__input" type="text" name="kananame" id="signup-confirm_kananame" placeholder=" " readonly="readonly">
          <label class="login-area__label" for="signup-confirm_kananame">フリガナ</label>
        </div>

        <div class="login-area__item">
          <input class="login-area__input" type="text" name="nickname" id="signup-confirm_nickname" placeholder=" " readonly="readonly">
          <label class="login-area__label" for="signup-confirm_nickname">ニックネーム</label>
        </div>
  
        <input class="login-area__submit-btn" type="submit" value="この内容で登録する">

        <p id="backToSignupModalBtn" class="login-area__forget-pass">入力内容変更の場合はこちら</p>
      </form>
      <!-- <div class="modal-hide-btn">×</div> -->
    </div>

    <!-- ユーザ情報エリア -->
    <div id="userInfoArea" class="login-area userinfo-area">
      <?php if(!isset($_SESSION['id'])): ?>
        <p>ログインするとこの機能が使えます。</p>
      <?php else: ?>
        <!-- ユーザ情報内容 -->
        <p id="userInfoDeleteBtn" style=display:inline-block;width:auto;color:red;cursor:pointer>退会</p>
      <?php endif; ?>
      <div class="modal-hide-btn">×</div>
    </div>

    <!-- 店舗検索エリア -->
    <div id="searchStoreArea" class="login-area search-store-area">
      <p style=display:inline-block;width:auto><a href="deploy_google_map_api.html" style=display:block;width:100%;height:100%;color:white>店舗検索</a></p>
      <div class="modal-hide-btn">×</div>
    </div>


    <!-- お問い合わせエリア(入力内容確認) -->
    <div id="contactConfirmArea" class="login-area contact-area contact-confirm-area">
      <form class="login-area__form contact-area__form" action="contact.php" name="contactConfirmForm" method="post">
        <p class="error-area contact-confirm-error-area"></p>
        <p class="modal-title contact-title">入力内容確認</p>

        <div class="contact-area__message">
          お問い合わせ種別を以下から選択してください。
          <select class="contact-area__select" name="category_select">
            <option hidden>お問い合わせ種別</option>
            <option value="1">HALSONサイトに関するお問い合わせ</option>
            <option value="2">店内サービスに関するお問い合わせ</option>
            <option value="3">商品に関するお問い合わせ</option>
            <option value="4">キャンペーンに関するお問い合わせ</option>
          </select>
        </div>

        <div class="contact-area__message">
          このお問い合わせの返事の要不要を選択してください。<br>
          <label class="contact-area__label">
            <input class="contact-area__input" type="radio" name="reply" value="1">必要
          </label>
          <label class="contact-area__label">
            <input class="contact-area__input" type="radio" name="reply" value="0">不要
          </label>
        </div>

        <div class="contact-area__message">
          性別を選択してください。<br>
          <label class="contact-area__label">
            <input class="contact-area__input" type="radio" name="gender" value="男">男性
          </label>
          <label class="contact-area__label">
            <input class="contact-area__input" type="radio" name="gender" value="女">女性
          </label>
        </div>

        <div class="contact-area__message">
          年齢を以下から選択してください。<br>
          <select class="contact-area__select" name="age_select">
            <option hidden>年齢</option>
            <option value="10">10代未満</option>
            <option value="20">20代</option>
            <option value="30">30代</option>
            <option value="40">40代</option>
            <option value="50">50代</option>
            <option value="60">60代以上</option>
          </select>
        </div>

        <div class="contact-area__message">
          お問い合わせ内容を記入してください。
          <textarea class="contact-area__textarea" name="textarea" rows="8" readonly="readonly"></textarea>
        </div>

        <input class="login-area__submit-btn" type="submit" value="送信">

        <p id="backToContactModalBtn" class="login-area__forget-pass modify-btn">入力内容変更の場合はこちら</p>
      </form>
      <!-- <div class="modal-hide-btn">×</div> -->
    </div>

  </div>

  <!-- <div style=width:50%;height:500px>aaaaa</div> -->

  <!-- ログインエリア -->
  <div id="loginArea" class="login-area">
    <?php if(isset($_SESSION['id'])): ?>
      <div class="login-area__logined">
        <p>ログイン済みです。</p>
        <p><a href="logout.php" style=color:red>ログアウト</a></p>
      </div>
    <?php else: ?>
      <form class="login-area__form" action="login.php" name="loginForm" method="post" autocomplete="off">
        <?php if($login_error !== '' || $signup_error !== ''): ?>
          <p id="loginAreaError" class="error-area"><?php echo $login_error ?><?php echo $signup_error ?></p>
        <?php endif; ?>
        <p class="modal-title"><span class="modal-title__span">HALSON</span>にログイン</p>

        <div class="login-area__item">
          <input class="login-area__input" type="email" name="id" id="login_id" value="" placeholder=" " required>
          <label class="login-area__label" for="login_id">メールアドレス</label>
        </div>
  
        <div class="login-area__item">
          <input class="login-area__input" type="password" name="password" id="login_pass" value="" placeholder=" " required>
          <label class="login-area__label" for="login_pass">パスワード</label>
        </div>

        <!-- 後回し -->
        <p class="login-area__forget-pass">パスワードを忘れた場合はこちら</p>
  
        <input class="login-area__submit-btn" type="submit" value="ログイン">

        <p id="changeSignupAreaBtn" class="login-area__forget-pass">アカウントをお持ちでない場合はこちら</p>
      </form>
    <?php endif; ?>
    <div class="modal-hide-btn">×</div>
  </div>

  <!-- お問い合わせエリア -->
  <div id="contactArea" class="login-area contact-area" style=display:block>
    <?php if(isset($_SESSION['id'])): ?>
      <p class="not-login-area">ログインするとこの機能が使えます。</p>
    <?php else: ?>
      <form class="contact-area__form" name="contactForm">
        <p class="error-area"><?php echo $signup_error ?></p>
        <p class="modal-title contact-title"><span class="modal-title__span">HALSON</span>にお問い合わせ</p>

        <div class="contact-area__message">
          お問い合わせ種別を以下から選択してください。
          <select class="contact-area__select" name="category_select" required>
            <option hidden>お問い合わせ種別</option>
            <option value="1">HALSONサイトに関するお問い合わせ</option>
            <option value="2">店内サービスに関するお問い合わせ</option>
            <option value="3">商品に関するお問い合わせ</option>
            <option value="4">キャンペーンに関するお問い合わせ</option>
          </select>
        </div>

        <div class="contact-area__message">
          このお問い合わせの返事の要不要を選択してください。<br>
          <label class="contact-area__label">
            <input class="contact-area__input" type="radio" name="reply" value="0">必要
          </label>
          <label class="contact-area__label">
            <input class="contact-area__input" type="radio" name="reply" checked value="1">不要
          </label>
        </div>

        <div class="contact-area__message">
          性別を選択してください。<br>
          <label class="contact-area__label">
            <input class="contact-area__input" type="radio" name="gender"  value="0" required>男性
          </label>
          <label class="contact-area__label">
            <input class="contact-area__input" type="radio" name="gender" value="1">女性
          </label>
        </div>

        <div class="contact-area__message">
          年齢を以下から選択してください。<br>
          <select class="contact-area__select" name="age_select" required>
            <option hidden>年齢</option>
            <option value="1">10代未満</option>
            <option value="2">20代</option>
            <option value="3">30代</option>
            <option value="4">40代</option>
            <option value="5">50代</option>
            <option value="6">60代以上</option>
          </select>
        </div>

        <div class="contact-area__message">
          お問い合わせ内容を記入してください。
          <textarea class="contact-area__textarea" name="textarea" rows="8" placeholder="例)いらっしゃいませ" required></textarea>
        </div>

        <input id="contactAreaSubmitBtn" class="login-area__submit-btn" type="submit" value="入力内容確認">
      </form>
    <?php endif; ?>
    <div class="modal-hide-btn">×</div>
  </div>


</body>
</html>
