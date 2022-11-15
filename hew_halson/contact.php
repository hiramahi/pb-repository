<?php
session_start();

// アドレス直打ちチェック
if(!isset($_SESSION['id'], $_POST['contact_items_id'], $_POST['text'], $_POST['is_replied'])){
    header('Location: index.php#contactArea');
    exit;
}

// ファイル読込
include('db_config.php');

// データ登録
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $sql = "INSERT INTO contacts(contact_items_id, text, is_replied, stores_id, users_id) VALUES(:contact_items_id, :text, :is_replied, :stores_id, :users_id)";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue(':contact_items_id', intval($_POST['contact_items_id']), PDO::PARAM_INT);
    $prepare->bindValue(':text', $_POST['text'], PDO::PARAM_STR);
    $prepare->bindValue(':is_replied', intval($_POST['is_replied']), PDO::PARAM_INT);
    $prepare->bindValue(':stores_id', 1, PDO::PARAM_INT);
    $prepare->bindValue(':users_id', $_SESSION['id'], PDO::PARAM_STR);

    $prepare->execute();

    $_SESSION['server_message'] = 'お問い合わせが完了しました。';
}catch(PDOException $e){
    // ここどうするか
}
header('Location: index.php');
