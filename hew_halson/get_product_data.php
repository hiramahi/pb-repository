<?php
$post_data = json_decode(file_get_contents('php://input'), true);

include('db_config.php');

$error = '';
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $sql = "SELECT p.id, p.name, p.price, p.imgURL, p.explanation, s.stock FROM products p JOIN stores_products s ON p.id = s.products_id WHERE s.stores_id = :stores_id AND p.name = :products_name";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue('stores_id', $post_data['stores_id']);
    $prepare->bindValue('products_name', $post_data['products_name']);

    $prepare->execute();

    $product_data = $prepare->fetch(PDO::FETCH_ASSOC);
    echo json_encode($product_data);

}catch(PDOException $e){
  $error = $e->getMessage();
}
