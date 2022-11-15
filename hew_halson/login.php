<?php
session_start();

// アドレス直打ちチェック
if(!isset($_POST['id'], $_POST['password'])){
    header('Location: index.php#loginArea');
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

    $sql = "SELECT * FROM users WHERE id = :id";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue(':id', $_POST['id'], PDO::PARAM_STR);
    $prepare->execute();

    // 連想配列取得
    $users = $prepare->fetch(PDO::FETCH_ASSOC);

    // if(password_verify($_POST['password'], $users['password'])){
    if($_POST['password'] == $users['password']){
        $success = true;
    }
}catch(PDOException $e){

}

// 次画面制御
if($success){
    $_SESSION['id'] = $_POST['id'];
}else{
    $_SESSION['server_message'] = 'メールアドレスまたはパスワードが正しくありません。';
}
header('Location: index.php');

