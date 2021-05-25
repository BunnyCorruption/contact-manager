<?php
    # SYNTAX: $var == variable
  # Requested Information
  $inData = getRequestInfo();

  # Declare global variables
  $firstName = $inData["firstName"];
  $lastName = $inData["lastName"];
  $email = $inData["email"];
  $phone = $inData["phone"];
  $userId = $inData["userId"];

  # Connect to CONTACTS database
  $conn = new mysqli("localhost", "groupseventeen", "Group17Grapefruit", "CONTACTS");

  # SYNTAX: -> == object operator that accesses properties/methods of an object
  # If the connection leads to an error
  if ($conn->connect_error)
  {
    returnWithError( $conn->connect_error );
  }
  else
  {

    # Prevent SQL injection, also trim whitespace.
    $escaped_firstName = trim($conn->real_escape_string($inData["firstName"]));
    $escaped_lastName = trim($conn->real_escape_string($inData["lastName"]));
    $escaped_email = trim($conn->real_escape_string($inData["email"]));
    $escaped_phone = trim($conn->real_escape_string($inData["phone"]));

    # Check for duplicate contacts
    $stmt = $conn->prepare("SELECT FirstName from Information where FirstName = ? and SELECT LastName from Information where LastName = ? and SELECT Email from Information where Email = ? and SELECT Phone from Information where Phone = ? and SELECT UserID from Information where UserID = ?");
    $stmt->bind_param("sssss", $escaped_firstName, $escaped_lastName, $escaped_email, $escaped_phone, $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows != 0)
    {
      returnWithError("Contact Already Exists")
    } 

    # Sample mySQL command:
    # Insert into Information (FirstName, LastName, Email, Phone, UserID) VALUES ('Jane', 'Doe', 'jd@email.com', '8773934448', 1);
    $stmt = $conn->query("INSERT into Information (FirstName, LastName, Email, Phone, UserID) VALUES(\"$escaped_firstName\",\"$escaped_lastName\",\"$escaped_email\",\"$escaped_firstName\",?)");
    // $stmt->bind_param("sssss", $firstName, $lastName, $email, $phone, $userId);
    // $stmt->execute();
    $err = "";
    if (!$result)
    {
      $err = mysqli_error($conn);
    }

    # Close open resources
    $stmt->close();
    $conn->close();
    returnWithError($err);
  }

  # Function to obtain json file/information
  function getRequestInfo()
  {
    return json_decode(file_get_contents('php://input'), true);
  }

  # Function to send info as json
  function sendResultInfoAsJson( $obj )
  {
    header('Content-type: application/json');
    echo $obj;
  }

  # Function to return an error
  function returnWithError( $err )
  {
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson( $retValue );
  }

?>
