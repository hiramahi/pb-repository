<?php
session_start();

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