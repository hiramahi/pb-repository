<?php
include('db_config.php');
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    // カテゴリごとの商品数取得
    $sql = "SELECT categories_id, COUNT(*) FROM products GROUP BY categories_id";
    $prepare = $pdo->prepare($sql);
    $prepare->execute();

    $categories = $prepare->fetchAll(PDO::FETCH_ASSOC);

    // 店舗テーブル取得
    $sql = "SELECT * FROM stores ORDER BY id";
    $prepare = $pdo->prepare($sql);
    $prepare->execute();

    $stores = $prepare->fetchAll(PDO::FETCH_ASSOC);

    // 在庫数insert
    $quantity_arr = [];
    for($i = 0; $i < count($categories); $i++){
        foreach($categories[$i] as $key => $value){
            if($key == 'COUNT(*)'){
                array_push($quantity_arr, $value);
            }
        }
    }

    $sql = "INSERT INTO stores_products VALUES(:stores_id, :products_id, 10)";
    $prepare = $pdo->prepare($sql);
    for($i = 0; $i < count($stores); $i++){
        $product_cnt = 0;
        for($j = 0; $j < count($quantity_arr); $j++){
            for($k = 0; $k < $quantity_arr[$j]; $k++){
                $prepare->bindValue(':stores_id', ($i + 1));
                $prepare->bindValue(':products_id', ($k + 1 + $product_cnt));
            
                $prepare->execute();
            }
            $product_cnt += $k;
        }
    }

}catch(PDOException $e){
    $_SESSION['signup_error'] = $e->getMessage();
}
echo 'insert完了';