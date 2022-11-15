<?php
session_start();

$forum_message = '';
if(isset($_SESSION['forum_message'])){
    $forum_message = $_SESSION['forum_message'];
}

// ファイル読込
include('db_config.php');

// DB処理
$forums = [];
$error = '';
try{
    $pdo = new PDO($dsn, $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    $sql = "SELECT f.id, u.nickname, f.created_at, p.name, f.title, f.content, f.good_cnt FROM users u JOIN forums f ON u.id = f.users_id JOIN products p ON f.products_id = p.id WHERE p.id = 1;";
    $prepare = $pdo->prepare($sql);
    $prepare->execute();

    // 連想配列取得
    $forums = $prepare->fetchAll(PDO::FETCH_ASSOC);

}catch(PDOException $e){
  $error = $e->getMessage();
}
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <p>forum.phpで起きたエラー<br>
        ⇒<?php echo $forum_message ?></p>

    <p>index10.phpで起きたエラー<br>
        ⇒<?php echo $error ?></p>
        
    <h1>掲示板</h1>
    <form action="forum.php" method="post">
        <input type="hidden" name="products_id">
        
        <div>
            <label>タイトル：<input type="text" name="title"></label>
        </div>

        <div>
            <label>投稿内容：<textarea name="content" required></textarea></label>
        </div>

        <input type="submit" value="投稿">
    </form><hr>

    <h1>投稿一覧</h1>
    <?php echo !empty($forums) ? '' : 'この商品についての投稿はありません。' ?>
    <?php echo empty($forums) ? '' : '<ul>' ?>
    <?php foreach($forums as $forum): ?>
        <li>
            ユーザ名：<?php echo $forum['nickname'] ?><br>
            投稿日時：<?php echo $forum['created_at'] ?><br>
            商品名：<?php echo $forum['name'] ?><br>
            タイトル：<?php echo $forum['title'] ?><br>
            投稿内容：<?php echo $forum['content'] ?><br>
            <p style=margin:0>いいね数：
                <span id="goodCnt"><?php echo $forum['good_cnt'] ?></span>
                <button id="goodBtn" type="button">いいねする</button></p>
        </li><br>
    <?php endforeach; ?>
    <?php echo empty($forums) ? '' : '</ul>' ?>

    <script>
        document.getElementById('goodBtn').addEventListener('click', () => {
            document.getElementById('goodCnt').innerText = parseInt(document.getElementById('goodCnt').innerText) + 1;
        });
    </script>
</body>
</html>