<?php
	header('Access-Control-Allow-Origin: *');
	header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
	$inData = getRequestInfo();
	
	$userId = $inData["userId"]; // the USER id
	$contactId = $inData["ID"]; // the id of the contact ("INFORMATION table")

	$conn = new mysqli("localhost", "groupseventeen", "Group17Grapefruit", "CONTACTS"); 	
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{

		#Prevent SQL injection, also trim whitespace.
		$escaped_userId = trim($conn->real_escape_string($userId));
		$escaped_contactId = trim($conn->real_escape_string($contactId));

		$stmt = $conn->prepare("DELETE FROM Information WHERE UserID = ? AND ID = ?");
		$stmt->bind_param("ss", $escaped_userId, $escaped_contactId);
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
		die();
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
?>