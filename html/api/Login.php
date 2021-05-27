<?php
# Request json should have 'login' and 'password'. 
# 'password' is assumed to have been hashed on the client side with md5. 

# Response json example: 
# {"id":0, "firstName":"", "lastName":"", "error":"", "lastLogin":"0000-00-00 00:00:00"}

# Returns an associative array from the incoming json (sourced from the php input file stream)
function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

$inData = getRequestInfo();

# The inData array has the wrong number of elements, or the required 'login' and 'password' are missing
if ((count($inData) != 2) || (!isset($inData["login"]) || !isset($inData["password"])))
{
    returnWithError("Bad Login Request", 400);
}

$id = 0;
$firstName = "";
$lastName = "";
$lastLogin = "";
$err = "";

$conn = new mysqli("localhost", "groupseventeen", "Group17Grapefruit", "CONTACTS"); 	
if( $conn->connect_error )
{
    returnWithError( $conn->connect_error );
}
else
{
    # Prevent SQL injection, also trim whitespace.
    $escaped_login = trim($conn->real_escape_string($inData["login"]));
    $escaped_password = trim($conn->real_escape_string($inData["password"]));

    if (empty($escaped_login) || empty($escaped_password) || !(strcmp($escaped_password, "d41d8cd98f00b204e9800998ecf8427e")))
    {
        $conn->close();
        returnWithError("We couldn't log you in, a field was empty.");
    }

    $stmt = $conn->prepare("SELECT ID, FirstName, LastName, DateLastLoggedIn, Password FROM Users WHERE Login=?");
    $stmt->bind_param("s", $escaped_login);
    $stmt->execute();
    $result = $stmt->get_result();

    # Did a User exist with that login?
    if($row = $result->fetch_assoc())
    {
        // $stmt->close();
        // $conn->close();

        # Register will use an additional hash (php's built in bcrypt hash) and this compares
        # the hashed password from the DB, to the incoming hash. Passwords are hashed
        # with md5 client side, and then bcrypt on the server side.
        if (password_verify($escaped_password, $row['Password']))
        {
            $stmt = $conn->prepare("UPDATE Users SET DateLastLoggedIn = CURRENT_TIMESTAMP WHERE ID = ?");
            $stmt->bind_param("s", $row['ID']);
            $stmt->execute();
            $stmt->close();
            $stmt = $conn->prepare("SELECT DateLastLoggedIn FROM Users WHERE ID = ?");
            $stmt->bind_param("s", $row['ID']);
            $stmt->execute();
            $secondResultSet = $stmt->get_result();
            $secondRow = $secondResultSet->fetch_assoc();
            $lastLoggedIn = $secondRow["DateLastLoggedIn"];
            $stmt->close();
            $conn->close();
            returnWithInfo( $row['FirstName'], $row['LastName'], $row['ID'],  $lastLoggedIn);
        }
        else
        {
            returnWithError("Invalid Password");
        }
    }
    else
    {
        $stmt->close();
        $conn->close();
        returnWithError("Invalid Username");
    }

    
}

function sendResultInfoAsJson( $obj, $response_code = 200)
{
    header('Content-type: application/json');
    echo $obj;
    http_response_code($response_code);
    die();
}

function returnWithError( $err, $response_code = 200)
{
    $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '","lastLogin":"0000-00-00 00:00:00"}';
    sendResultInfoAsJson( $retValue, $response_code);
    
}

function returnWithInfo( $firstName, $lastName, $id, $lastLogin)
{
    $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":"","lastLogin":"'.$lastLogin.'"}';
    sendResultInfoAsJson( $retValue );
}

?>
