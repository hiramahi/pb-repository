<?php
session_start();

// アドレス直打ちチェック
if(!isset($_POST['id'], $_POST['password'], $_POST['confirm_password'], $_POST['name'], $_POST['kananame'], $_POST['nickname'])){
	$msg = 'ログインしてください。';
	if ($_POST['id'] == 'guest@gmail.com') $msg = 'メールアドレスに「guest@gmail.com」は使えません';
	if ($_POST['name'] == 'ゲスト') $msg = '名前に「ゲスト」は使えません。';

    $_SESSION['signup_error'] = $msg;
    header('Location: index.php');
    exit;
}

// ファイル読込
include('db_config.php');

// データ登録
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    // パスワードの暗号化
    // $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO users(id, name, kananame, nickname, password) VALUES(:id, :name, :kananame, :nickname, :password)";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue(':id', $_POST['id'], PDO::PARAM_STR);
    $prepare->bindValue(':name', $_POST['name'], PDO::PARAM_STR);
    $prepare->bindValue(':kananame', $_POST['kananame'], PDO::PARAM_STR);
    $prepare->bindValue(':nickname', $_POST['nickname'], PDO::PARAM_STR);
    $prepare->bindValue(':password', $_POST['password'], PDO::PARAM_STR);

    $prepare->execute();
    
    $_SESSION['server_message'] = '正常に登録されました。';
}catch(PDOException $e){
    if($e->errorInfo[1] === 1062){
        $_SESSION['server_message'] = '入力されたメールアドレスは既に利用されています。';
    }
}
header('Location: index.php');
