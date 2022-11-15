<?php
session_start();

// アドレス直打ちチェック
if(!isset($_SESSION['id'])){
    $_SESSION['login_error'] = 'ログインしてください。';
    header('Location: index.php');
    exit;
}

// ファイル読込
include('db_config.php');

// 認証処理
$success = false;
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $sql = "DELETE FROM users WHERE id = :id";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue(':id', $_SESSION['id'], PDO::PARAM_STR);

    $prepare->execute();

    $_SESSION['login_error'] = 'アカウントの削除が完了しました。';
}catch(PDOException $e){
    $_SESSION['signup_error'] = $e->getMessage();
}

// セッション変数を初期化
$_SESSION = [];

// cookieにあるセッションIDを削除
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// サーバにあるセッションファイルを削除
session_destroy();

header('Location: index.php');

