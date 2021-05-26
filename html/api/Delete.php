<?php

	$inData = getRequestInfo();
	
	$userId = $inData["userId"];

	$conn = new mysqli("localhost", "groupseventeen", "Group17Grapefruit", "CONTACTS"); 	
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{

		#Prevent SQL injection, also trim whitespace.
		$escaped_userId = trim($conn->real_escape_string($userId));

		$stmt = $conn->prepare("DELETE FROM Contacts WHERE (UserId) VALUES(?)");
		$stmt->bind_param("s", $escaped_userId);
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