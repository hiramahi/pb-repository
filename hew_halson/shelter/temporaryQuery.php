<?php
include('db_config.php');
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $sql = "SELECT categories_id, COUNT(*) FROM products GROUP BY categories_id";
    $prepare = $pdo->prepare($sql);
    $prepare->execute();

    $categories = $prepare->fetchAll(PDO::FETCH_ASSOC);

    echo '<pre>';
    print_r($categories);
    echo '</pre>';

    echo '<pre>';
    print_r($categories[0]);
    echo '</pre>';
    
    echo '<hr>';

    $sql = "SELECT * FROM stores ORDER BY id";
    $prepare = $pdo->prepare($sql);
    $prepare->execute();

    $stores = $prepare->fetchAll(PDO::FETCH_ASSOC);

    echo '<pre>';
    print_r($stores);
    echo '</pre>';

    echo '<hr>';

    $quantity_arr = [];
    for($i = 0; $i < count($categories); $i++){
        foreach($categories[$i] as $key => $value){
            if($key == 'COUNT(*)'){
                array_push($quantity_arr, $value);
            }
        }
    }
    echo '<pre>';
    print_r($quantity_arr);
    echo '</pre>';

}catch(PDOException $e){
    $_SESSION['signup_error'] = $e->getMessage();
}
echo '<hr>取得完了';