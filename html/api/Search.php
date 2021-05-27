<?php

	$inData = getRequestInfo();
	
	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli("localhost", "groupseventeen", "Group17Grapefruit", "CONTACTS"); 	
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		$stmt = $conn->prepare("SELECT * from Contacts where (FirstName like ? or LastName like ?) and UserID=?");
		$firstName = "%" . $inData["firstName"] . "%";
		$lastName = "%" . $inData["lastName"] . "%";
		$stmt->bind_param("sss", $firstName, $lastname, $inData["userId"]);
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
			$searchResults .= '"' . $row["ID"] . '":{"firstName":"' . $row["FirstName"] .'","lastName":"' . $row["LastName"] . '","email":"' . $row["Email"] . '","phone":"' . $row["Phone"] . '","dateCreated":"' . $row["DateCreated"] . '"}';
		}
		
		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
		}
		
		$stmt->close();
		$conn->close();
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
		$retValue = '{"id":0,"firstName":"","lastName":"","email":"","phone":"","dateCreated":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>