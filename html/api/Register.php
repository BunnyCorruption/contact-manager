<?php
# Request json should have 'firstName', 'lastName', 'email', 'userLogin', and 'password'. 
# 'password' is assumed to have been hashed on the client side with md5. 

# Response json example: 
# {"error":""}

# Returns an associative array from the incoming json (sourced from the php input file stream)
function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

$inData = getRequestInfo();

# The inData array has the wrong number of elements, or the required 'login' and 'password' are missing
if ((count($inData) != 5) || (!isset($inData["firstName"]) || !isset($inData["lastName"]) ||
!isset($inData["email"]) || !isset($inData["userLogin"]) || !isset($inData["password"])))
{
    
    returnWithError("Bad Registration Request", 400);
}

$id = 0;
$err = "";

$conn = new mysqli("localhost", "groupseventeen", "Group17Grapefruit", "CONTACTS"); 	
if( $conn->connect_error )
{
    returnWithError( $conn->connect_error );
}
else
{
    # Prevent SQL injection, also trim whitespace.
    $esc_firstName = trim($conn->real_escape_string($inData["firstName"]));
    $esc_lastName = trim($conn->real_escape_string($inData["lastName"]));
    $esc_email = trim($conn->real_escape_string($inData["email"]));
    $esc_userLogin = trim($conn->real_escape_string($inData["userLogin"]));
    $esc_password = trim($conn->real_escape_string($inData["password"]));

    if (empty($esc_firstName) || empty($esc_lastName) || empty($esc_email) || empty($esc_userLogin)|| empty($esc_password))
    {
        $stmt->close();
        $conn->close();
        returnWithError("We couldn't register you, a field was empty.");
    }
    # Additional server side hashing, it uses the default PHP hashing algorithm (which is bcrypt)
    $hash = password_hash($esc_password, PASSWORD_DEFAULT, ['cost' => 12]);

    # Checking for duplicate usernames. This is also the place to check for other issues before inserting.
    $stmt = $conn->prepare("SELECT Login from Users where Login = ?");
    $stmt->bind_param("s", $esc_userLogin);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows != 0)
    {
        $stmt->close();
        $conn->close();
        returnWithError("Username Already Exists");
    }

    # Extend any checking here (or before)


    # Insert the new user
    $result = $conn->query("INSERT INTO Users (FirstName, LastName, Login, Password, Email) VALUES (\"$esc_firstName\", \"$esc_lastName\", \"$esc_userLogin\", \"$hash\", \"$esc_email\")");
    // $stmt->bind_param("sssss", $esc_firstName, $esc_lastName, $esc_userLogin, $hash, $esc_email);
    // $stmt->execute();
    $err = "";
    if (!$result)
    {
        $err = mysqli_error($conn);
    }
    # Close open resources.
    $stmt->close();
    $conn->close();

    # No error (but at this current state, that is just assumed. Maybe we check this?)
    returnWithError($err);
}

function sendResultInfoAsJson( $obj, $response_code)
{
    header('Content-type: application/json');
    echo $obj;
    http_response_code($response_code);
    die();
}

function returnWithError( $err, $response_code = 200)
{
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson( $retValue, $response_code);
}
?>
