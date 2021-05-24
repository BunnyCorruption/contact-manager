<?php
  # Requested Information
  $inData = getRequestInfo();

  $firstName = $inData["firstName"];
  $lastName = $inData["lastName"];
  $email = $inData["email"];
  $phone = $inData["phone"];
  $userId = $inData["userId"];

  # Connect to CONTACTS database
  $conn = new mysqli("localhost", "groupseventeen", "Group17Grapefruit", "CONTACTS");
  if ($conn->connect_error)
  {
    returnWithError( $conn->connect_error );
  }
  else
  {
    # insert into Information (FirstName, LastName, Email, Phone, UserID) VALUES ('Jane', 'Doe', 'jd@email.com', '8773934448', 1);
	$escaped_firstName = trim($conn->real_escape_string($inData["firstName"]));
	$escaped_lastName = trim($conn->real_escape_string($inData["lastName"]));

    $stmt = $conn->prepare("INSERT into Information (FirstName, LastName, Email, Phone, UserID) VALUES(?,?,?,?,?)");
    $stmt->bind_param("sssss", $firstName, $lastName, $email, $phone, $userId);
    $stmt->execute();
    $stmt->close();
    $conn->close();
    returnWithError("");
  }

  function getRequestInfo()
  {
    return json_decode(file_get_contents('php://input'), true);
  }

  function sendResultInfoAsJson( $obj )
  {
    header('Content-type: application/json');
    echo $obj;
  }

  function returnWithError( $err )
  {
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson( $retValue );
  }

?>
