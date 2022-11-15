<?php
$post_data = json_decode(file_get_contents('php://input'), true);

// アドレス直打ちチェック ⇒ 後で$session['id']追加 ////////////////////////////////////////////////////////////////////////
// if(!isset($_POST['products_id'], $_POST['content'])){
//     $_SESSION['forum_message'] = '投稿が正しくありません。';
//     header('Location: index.php');
//     exit;
// }

// ファイル読込
include('db_config.php');

// データ登録
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $sql = "INSERT INTO forums(id, stores_id, users_id, receives_id, payments_id) VALUES(:id, :stores_id, :users_id, :receives_id, :payments_id)";
    $prepare = $pdo->prepare($sql);

    $prepare->bindValue(':id', 0, PDO::PARAM_INT);
    $prepare->bindValue(':child_id', 2, PDO::PARAM_INT);
    $prepare->bindValue(':products_id', intval($post_data['products_id']), PDO::PARAM_INT);
    $prepare->bindValue(':content', $post_data['content'], PDO::PARAM_STR);

	$users_id = 'guest@gmail.com';
	if (isset($_SESSION['id'])) $users_id = $_SESSION['id'];
	$prepare->bindValue(':users_id', $users_id, PDO::PARAM_STR);

    $prepare->execute();

    $sql = "SELECT f.id forums_id, u.nickname, f.content, f.good_cnt, f.created_at FROM forums f JOIN users u ON f.users_id = u.id JOIN products p ON f.products_id = p.id WHERE p.id = :products_id ORDER BY f.id DESC;";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue('products_id', $post_data['products_id']);
    $prepare->execute();

    $forum_data = $prepare->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($forum_data);

    $_SESSION['forum_message'] = '投稿が完了しました。';
}catch(PDOException $e){
    $_SESSION['forum_message'] = '投稿に失敗しました。';
}
