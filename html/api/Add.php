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
    $escaped_firstName = trim($conn->real_escape_string($firstName));
    $escaped_lastName = trim($conn->real_escape_string($lastName));
    $escaped_email = trim($conn->real_escape_string($email));
    $escaped_phone = trim($conn->real_escape_string($phone));
    $escaped_userId = trim($conn->real_escape_string($userId));

    # Check for duplicate contacts
    $stmt = $conn->prepare("SELECT FirstName from Information WHERE FirstName = ? and LastName = ? and Email = ? and Phone = ? and UserID = ?");
    $stmt->bind_param("sssss", $escaped_firstName, $escaped_lastName, $escaped_email, $escaped_phone, $escaped_userId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows != 0)
    {
      $stmt->close();
      $conn->close();
      returnWithError("Contact Already Exists");
    } 

    # Sample mySQL command:
    # Insert into Information (FirstName, LastName, Email, Phone, UserID) VALUES ('Jane', 'Doe', 'jd@email.com', '8773934448', 1);
    # When using an additional query the statement has to be closed first before reusing
    $stmt->close();
    $stmt = $conn->prepare("INSERT into Information (FirstName, LastName, Email, Phone, UserID) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $escaped_firstName, $escaped_lastName, $escaped_email,$escaped_phone, $escaped_userId);
    $stmt->execute();
    $result = $stmt->get_result();
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
