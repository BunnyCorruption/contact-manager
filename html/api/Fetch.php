<?php
# Request json should have 'userId' and 'ID'. 


# Response json example: 
/*
{
    "ID": 0,
    "email": "",
    "phone": "",
    "firstName": "",
    "lastName": "",
    "dateCreated": "0000-00-00 00:00:00",
    "error": "Fetch error, a field was empty."
}
*/
# Returns an associative array from the incoming json (sourced from the php input file stream)
function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

$inData = getRequestInfo();

# The inData array has the wrong number of elements, or the required 'login' and 'password' are missing
if ((count($inData) != 2) || (!isset($inData["userId"]) || !isset($inData["ID"])))
{
    returnWithError("Bad Fetch Request", 400);
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
    $escaped_contactID = trim($conn->real_escape_string($inData["ID"]));
    $escaped_userID = trim($conn->real_escape_string($inData["userId"]));

    if (empty($escaped_contactID) || empty($escaped_userID) );
    {
        $conn->close();
        returnWithError("Fetch error, a field was empty.");
    }

    $stmt = $conn->prepare("SELECT ID, FirstName, LastName, DateCreated, Email, Phone FROM Information WHERE UserID = ? AND ID = ?");
    $stmt->bind_param("ss", $escaped_userID, $escaped_contactID);
    $stmt->execute();
    $result = $stmt->get_result();

    if($row = $result->fetch_assoc())
    {
        $stmt->close();
        $conn->close();

        $id = $email = $phone = $firstName = $lastName = $dateCreated = $error = "";
        
        $id = $row["ID"];
        $email = $row["Email"];
        $phone = $row["Phone"];
        $firstName = $row["FirstName"];
        $lastName = $row["LastName"];
        $dateCreated = $row["DateCreated"];
        $error == "";
        returnWithInfo($id, $email, $phone, $firstName, $lastName, $dateCreated, $error);
    }
    else
    {
        $stmt->close();
        $conn->close();
        returnWithError("No Result");
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
    $retValue = '{"ID":0, "email":"", "phone":"","firstName":"", "lastName":"", "dateCreated":"0000-00-00 00:00:00", "error":"'.$err.'"}';
    sendResultInfoAsJson( $retValue, $response_code);
    
}

function returnWithInfo($id, $email, $phone, $firstName, $lastName, $dateCreated, $error = "")
{
    $retValue = '{"ID":"'.$id.'", "email":"'.$email.'", "phone":"'.$phone.'","firstName":"'.$firstName.'", "lastName":"'.$lastName.'", "dateCreated":"'.$dateCreated.'", "error":"'.$error.'"}';
    sendResultInfoAsJson( $retValue );
}

?>
