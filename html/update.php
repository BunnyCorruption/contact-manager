<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pull Latest</title>
</head>
<body>
    <!-- testing discord webhook -->
    <form action="update.php" method="post">
        <button name="update" value="grapefruit" type="submit">Pull latest</button>
    </form>
    <?php
    if (isset($_POST['update']) && !strcmp($_POST['update'], "grapefruit"))
    {
        $stdout = shell_exec('cd /var/www && /usr/bin/git pull origin main 2>&1');
        echo "<code>$stdout</code>";
        echo "<br>";
        echo "<p><a href='index.html'>Back to index.html</a></p>";
        echo "<p>If you see something like:</p>";
        echo "<code><span style='color:red'> error:</span> Your local changes to the following files would be overwritten by merge:
        html/update.php</code>";
        echo "<p>Then click this, it will discard changes on the remote server (then try to pull latest again)</p>";
        echo <<<EOT
        <form action="update.php" method="post">
        <button name="gitreset" value="citrus" type="submit">local git reset</button>
        </form>
        EOT;
    }
    if (isset($_POST['gitreset']) && !strcmp($_POST['gitreset'], "citrus"))
    {
        $stdout = shell_exec('cd /var/www && /usr/bin/git reset --hard HEAD^ 2>&1');
        echo "<code>$stdout</code>";
        echo "<br>";
        echo "<p>Now, click pull latest again. or <a href='index.html'>Back to index.html</a></p>";
    }
    
    ?>
</body>
</html>