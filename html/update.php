<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pull Latest</title>
</head>
<body>
    <form action="update.php" method="post">
        <button name="update" value="grapefruit" type="submit">Pull latest</button>
    </form>
    <?php
    if (isset($_POST['update']) && !strcmp($_POST['update'], "grapefruit"))
    {
        $stdout = shell_exec('cd /var/www && /usr/bin/git pull origin main');
        echo "<code>$stdout</code>";
        echo "<br>";
        echo "<p><a href='index.html'>Back to index.html</a></p>";
    }
    ?>
</body>
</html>