<?php

require_once('db_properties.php');
$connection = new mysqli($servername, $usernameSQL, $passwordSQL, $dbname);
if ($connection->connect_error)
{
    echo "Error in connecting to the database.";
    die("Connection failed: " . $connection->connect_error);
}
$result = $connection->query("SELECT Name from Colors");
if ($result->num_rows > 0)
{
    while($row = $result->fetch_assoc())
    {
        echo '<p>'.$row['Name'].'</p>';
    }
}

$connection->close();

?>