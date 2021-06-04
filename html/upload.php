<?php
if (!isset($_FILES["uploadedFile"]))
{
  die();
}
$total_files = count($_FILES["uploadedFile"]["name"]);

$file_success = 0;
$duplicate = FALSE;

$uniq_hash = hash('md5', basename($_FILES["uploadedFile"]["name"]));
$hash_prefix = time()%1000000 . '_' . substr($uniq_hash, 0, 8);
$fname_temp = $hash_prefix.'__'.basename($_FILES["uploadedFile"]["name"]);
$fname = str_replace(' ', '', $fname_temp);
$target_file = getcwd().'/assets/profile_pictures/'.$fname;
echo $target_file;

if (strpos($target_file, '.png') !== FALSE || strpos($target_file, '.jpeg') !== FALSE
    || strpos($target_file, '.jpg') !== FALSE || strpos($target_file, '.webp') !== FALSE
    || strpos($target_file, '.bmp') !== FALSE || strpos($target_file, '.gif') !== FALSE)
{
    $uploadOk = 1;
    echo 'all good';
}
else
{
    echo 'This file type is not valid. You can use png, jpg, jpeg, webp, gif, or bmp.';
    echo '<script>window.parent.document.getElementById("successMessage'.$_POST['id'].'").innerHTML = "'.'This file type is not valid. You can use png, jpg, jpeg, webp, gif, or bmp.'.'"</script>';
    die();
}




// Check if file already exists
if (file_exists($target_file)) 
{
    
    $duplicate = TRUE;

}


// Check if $uploadOk is set to 0 by an error
if (!$duplicate)
{
    echo "<p>". $target_file . "</p>";
    if (move_uploaded_file($_FILES["uploadedFile"]["tmp_name"], $target_file)) 
    {
        chmod($target_file, 777);
        $file_success++;
        echo '<h2>Success!</h2>';
        echo '<h2>'.$_POST['id']." was the id</h2>";
        echo '<script>console.log("successful file transfer");</script>';

        $conn = new mysqli("localhost", "groupseventeen", "Group17Grapefruit", "CONTACTS"); 	
        if ($conn->connect_error) 
        {
            echo '<script>window.parent.alert("database error.");</script>';
        } 
        else
        {
            $escaped_userId = trim($conn->real_escape_string($_POST['id']));

            $stmt = $conn->prepare("UPDATE Information SET ProfilePicture = ? WHERE ID = ?");
            $stmt->bind_param("ss", $fname, $escaped_userId);
            $stmt->execute();
            
            $result = $stmt->get_result();
            $loadedString = "";
            $loadedString .= '<button class="btn loading" type="button">';
            $loadedString .= '  <i class="fa fa-check"> </i>';
            $loadedString .= '  Done!';
            $loadedString .= '</button>';
            echo '<script>window.parent.document.getElementById("successMessage'.$_POST['id'].'").innerHTML = "'.$loadedString.'"</script>';
            echo '<script>setTimeout(() => {window.parent.document.getElementById("successMessage'.$_POST['id'].'").innerHTML = ""}, 5000);</script>';
            echo '<script>window.parent.document.getElementById("user_picture_'.$_POST['id'].'").src = "assets/profile_pictures/'.$fname.'"</script>';
            
        }
            
            

    }
    else 
    {
        echo '<h2>File size must be smaller than 20 MB. Choose a different file.</h2>';
        echo '<script>window.parent.document.getElementById("successMessage'.$_POST['id'].'").innerHTML = "Error."</script>';
        //echo'<a href="/profile_setting.php">Back to profile settings.</a>';
    }
}

?>

