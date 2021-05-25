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

	# Sample mySQL command:
	# insert into Information (FirstName, LastName, Email, Phone, UserID) VALUES ('Jane', 'Doe', 'jd@email.com', '8773934448', 1);
    $stmt = $conn->prepare("INSERT into Information (FirstName, LastName, Email, Phone, UserID) VALUES(?,?,?,?,?)");
    $stmt->bind_param("sssss", $firstName, $lastName, $email, $phone, $userId);
    $stmt->execute();
    $stmt->close();
    $conn->close();
    returnWithError("");
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
