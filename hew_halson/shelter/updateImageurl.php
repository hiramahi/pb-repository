<?php
include('db_config.php');
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $cate_arr = ['nigiri', 'sand', 'side', 'bento', 'sake', 'drink', 'sweet', 'ice', 'frozen', 'ins', 'pan', 'snack'];
    $cnt_arr = [25, 8, 17, 25, 24, 48, 16, 16, 16, 25, 25, 25];
    $cnt = 0;
    for($i = 0; $i < count($cate_arr); $i++){
        for($j = 0; $j < $cnt_arr[$i]; $j++){
            $sql = "UPDATE products SET imageurl = :imageurl WHERE id = :id";
            $prepare = $pdo->prepare($sql);
            $k = $j + 1;
            $id = $k + $cnt;
            $imageurl = "$cate_arr[$i]/$cate_arr[$i]$k";
            $prepare->bindValue(':id', $id);
            $prepare->bindValue(':imageurl', $imageurl);
        
            $prepare->execute();
        }
        $cnt += $j;
    }

}catch(PDOException $e){
    $_SESSION['signup_error'] = $e->getMessage();
}
echo '更新完了';