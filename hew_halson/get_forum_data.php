<?php
$post_data = json_decode(file_get_contents('php://input'), true);

include('db_config.php');

$error = '';
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $sql = "SELECT f.id forums_id, u.nickname, f.content, f.good_cnt, f.created_at FROM forums f JOIN users u ON f.users_id = u.id JOIN products p ON f.products_id = p.id WHERE p.name = :products_name  ORDER BY f.id DESC;";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue('products_name', $post_data['products_name']);

    $prepare->execute();

    $forum_data = $prepare->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($forum_data);

}catch(PDOException $e){
  $error = $e->getMessage();
}
