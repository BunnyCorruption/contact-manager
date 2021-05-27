<?php
# Request json should have 'ID', 'firstName', 'lastName', 'email', 'phone', 'userId'
/* Example:
{
  "ID": "3",
  "firstName": "Test",
  "lastName": "Edit",
  "email": "edit@gmail.com",
  "phone": "407-000-6969",
  "userId": "9"
}
*/
# ID is the ID to edit, userID is the person (from Users) trying to make the edit.

# Response json example: 
# {"error":""}

# Returns an associative array from the incoming json (sourced from the php input file stream)
function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

$inData = getRequestInfo();

# The inData array has the wrong number of elements, or the required 'login' and 'password' are missing
if ((count($inData) != 6) || (!isset($inData["ID"]) || !isset($inData["firstName"]) 
|| !isset($inData["email"]) || !isset($inData["phone"]) || !isset($inData["lastName"])
|| !isset($inData["userId"])))
{
    
    returnWithError("Bad Edit Request", 400);
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
    $esc_phone = trim($conn->real_escape_string($inData["phone"]));
    $esc_userID = trim($conn->real_escape_string($inData["userId"]));
    $esc_contactID = trim($conn->real_escape_string($inData["ID"]));

    if (empty($esc_firstName) || empty($esc_lastName)
    || empty($esc_email) || empty($esc_phone)
    || empty($esc_userID) || empty($esc_contactID))
    {
        $conn->close();
        returnWithError("Edit failure, a field was empty.");
    }

    # Checking that the user is actually associated with the ID they are trying to edit.
    $stmt = $conn->prepare("SELECT ID from Information where ID = ? and UserID = ?");
    $stmt->bind_param("ss", $esc_contactID, $esc_userID);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows == 0)
    {
        $stmt->close();
        $conn->close();
        returnWithError("Cannot edit this user");
    }

    # Extend any checking here (or before)


    # Update that user
    $stmt->close();
    $stmt = $conn->prepare("UPDATE Information SET FirstName = ?, LastName = ?, Email = ?, Phone = ? WHERE ID = ?");
    $stmt->bind_param("sssss", $esc_firstName, $esc_lastName, $esc_email, $esc_phone, $esc_contactID);
    $stmt->execute();
    $result = $stmt->get_result();

    $err = "";
    if (!$result)
    {
        $err = mysqli_error($conn);
    }
    # Close open resources.
    $stmt->close();
    $conn->close();

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
