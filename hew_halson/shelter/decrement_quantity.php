<?php
$stores_id = $_GET['stores_id'];

include('db_config.php');
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $sql = "UPDATE stores_products SET quantity = quantity-1 WHERE stores_id = :stores_id AND products_id = :products_id";
    $prepare = $pdo->prepare($sql);
    $prepare->bindValue(':stores_id', $_GET['stores_id']);
    $prepare->bindValue(':products_id', $_GET['products_id']);

    $prepare->execute();

}catch(PDOException $e){
    $_SESSION['signup_error'] = $e->getMessage();
}
header("Location: store.php?stores_id=${stores_id}");