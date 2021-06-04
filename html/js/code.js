var urlBase = 'http://group17.codes/api';
var extension = 'php';

var userId = 0;
var firstName = "";
var lastName = "";

var searched = false;
var showedTooltip = false;
const BATCH_SIZE = 10;
var batch_start = 0;
var displayed_so_far = 0;
// When count of 
var stopPolling = false;


function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	var login = document.getElementById("userLogin").value;
	var password = document.getElementById("userPassword").value;
	var hash = md5( password ); 
	
	document.getElementById("loginResult").innerHTML = "";

	var jsonPayload = '{"login" : "' + login + '", "password" : "' + hash + '"}';
//	var jsonPayload = '{"login" : "' + login + '", "password" : "' + password + '"}';
	var url = urlBase + '/Login.' + extension;

	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				var jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "\nUser/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName; //I was lazy and didn't swap the first/last to user/pass throughout

				saveCookie();
	
				window.location.href = "contacts.html";
				
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	var minutes = 20;
	var date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + "; expires=" + date.toUTCString() + ";";
	console.log(document.cookie);
}

function readCookie()
{
	userId = -1;
	var data = document.cookie;
	var splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		var thisOne = splits[i].trim();
		var tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
		console.log("User not logged in, redirected to index.html");
	}
	else
	{
		console.log(document.cookie);
		// console.log( "Logged in as " + firstName + " " + lastName);
		// console.log("id:" + userId);
		// just for now.
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
	window.location.href = "index.html";
}


function doRegistration() //This bad boi will be pertinent to the register.html
{
    var firstName = document.getElementById("regFirstName").value;
    var lastName = document.getElementById("regLastName").value;
    var email = document.getElementById("regEmail").value;
    var userLogin = document.getElementById("regUserLogin").value;
    var password = document.getElementById("regPassword").value;
    var hash = md5(password); 
	document.getElementById("registrationResult").innerHTML = "";
	
    var jsonPayload = '{"firstName" : "' + firstName + '", "lastName" : "' + lastName + '", "email" : "' +
        email + '", "userLogin" : "' + userLogin + '", "password" : "' + hash + '"}';

	var url = urlBase + '/Register.' + extension;
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				var jsonObject = JSON.parse( xhr.responseText );
				errorMessage = jsonObject.error;
				
				console.log(errorMessage);

				var statusString = "";
				if (errorMessage === "")
					statusString = "User has been added";
				else
					statusString = errorMessage;

				document.getElementById("registrationResult").innerHTML = statusString;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("registrationResult").innerHTML = err.message;
	}
	
}



function addContact()
{
	
	var newfName = document.getElementById("addFirstName").value.trim();
	var newlName = document.getElementById("addLastName").value.trim();
	var newPhone = document.getElementById("addPhone").value.trim();
	var newEmail = document.getElementById("addEmail").value.trim();
	var myId = userId;

	$("#addAlerts").empty();
	
	if (newfName == "" || newlName == "" || newPhone == "" || newEmail == "")
	{
		alertString = "";
		alertString += '<div id="addAlert" class="alert my-2 alert-warning alert-dismissible fade show" role="alert">';
		alertString += '<strong><i class="fa fa-exclamation-triangle"></i> Fields are empty!</strong> Check form fields before submitting.';
		alertString += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
		alertString += '</div>';
		$("#addAlerts").append(alertString);
		return false;
	}

	var jsonObjPayload = {
		"firstName": newfName,
		"lastName": newlName,
		"email" : newEmail,
		"phone" : newPhone,
		"userId": myId
	  };
	
	var jsonPayload = JSON.stringify(jsonObjPayload);

	var url = urlBase + '/Add.' + extension;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				var responseText = JSON.parse(xhr.responseText);
				var responseError = responseText.error;
				if (responseError == "")
				{
					alertString = "";
					alertString += '<div id="addAlert" class="alert my-2 alert-success alert-dismissible fade show" role="alert">';
					alertString += '<strong><i class="fa fa-check-square"></i> Contact added!</strong> Visit <i class="fa fa-home"></i> Home to search for all your contacts.';
					alertString += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
					alertString += '</div>';

					document.getElementById("addFirstName").value = "";
					document.getElementById("addLastName").value = "";
					document.getElementById("addPhone").value = "";
					document.getElementById("addEmail").value = "";

					$("#addAlerts").append(alertString);
				}
				else if (responseError == "Contact Already Exists")
				{
					alertString = "";
					alertString += '<div id="addAlert" class="alert my-2 alert-warning alert-dismissible fade show" role="alert">';
					alertString += '<strong><i class="fa fa-exclamation-triangle"></i> Contact Already Exists!</strong>' + newfName +' is a direct duplicate of one of your contacts.';
					alertString += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
					alertString += '</div>';
					$("#addAlerts").append(alertString);
				}
				else
				{
					alertString = "";
					alertString += '<div id="addAlert" class="alert my-2 alert-danger alert-dismissible fade show" role="alert">';
					alertString += '<strong><i class="fa fa-times-circle"></i> Error!</strong> '+ responseError+ '.';
					alertString += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
					alertString += '</div>';
					$("#addAlerts").append(alertString);
				}
				// This is a workaround for refreshing the results
				if (searched)
				{
					searchContacts();
				}
				// Dismiss alerts after 8 seconds.
				setTimeout(() => {$("#addAlerts").empty();}, 8000);
				// document.getElementById("contactAddResult").innerHTML = "Contact has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}
	
}

function handleDelete(idToRemove)
{
	first = document.getElementById("fNameUser" + idToRemove).value;
	last = document.getElementById("lNameUser" + idToRemove).value;
	document.getElementById("deleteName").innerHTML = `(${first} ${last})`
	document.getElementById("deleteButtonInsideModal").onclick = function() {deleteContact(idToRemove)};
	$('#deleteModal').modal("toggle")
}

function cleanModalAndToggle()
{
	document.getElementById("deleteName").innerHTML = "";
	document.getElementById("deleteButtonInsideModal").onclick = function() {return false;};
	$('#deleteModal').modal("toggle")
}

function deleteContact(id) {
	//Aw frick I gotta see the table to determine how we're selecting this beast to delete. To be continued.
	// var contact = document.getElementById("contactText").value;

	document.getElementById("contactDeleteResult").innerHTML = "";

	var jsonPayloadObj = {
		"ID": id,
		"userId": userId
	};
	var jsonPayload = JSON.stringify(jsonPayloadObj);
	var url = urlBase + '/Delete.' + extension;

	var xhr = new XMLHttpRequest();
	// I wanted this to be NOT asynchronous, so it "waits" for deletion but it should be fine.
	// also the "DELETE" http method here wasn't working, had to revert to POST
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				var responseText = JSON.parse(xhr.responseText);
				var responseError = responseText.error;
				if (responseError == "")
				{
					document.getElementById("contactDeleteResult").innerHTML = "Contact has been removed.";
					cleanModalAndToggle();
					document.getElementById("resultItem" +id).animate([
						{ // from
							opacity: 1,
							color: "#fff"
						},
						{ // to
							opacity: 0,
							color: "#000"
						}
						], 300);
						setTimeout(() => {$("#resultItem" +id).remove()}, 300);
				}
				else
				{
					document.getElementById("contactDeleteResult").innerHTML = responseError;
				}
				
			}
		};
		xhr.send(jsonPayload);
	}
	catch (err) {
		document.getElementById("contactDeleteResult").innerHTML = err.message;
	}
    
    
}

function searchContacts()
{
	batch_start = 0;
	displayed_so_far = 0;
	stopPolling = false;

	var srch = document.getElementById("searchText").value;
	$("#searchResults").empty();
	$("#searchResults").css("display", "block");
	$("#loadMoreButton").empty();

	var contactList = "";
	//////////////////////////////////////////////////////////////////////
	// delete me when done ////////////////////////////////////////////////
	// userId = 9;
	//////////////////////////////////////////////////////////////////////
	// var jsonPayload = '{"name" : "' + srch + '","userId" : ' + userId + '}';
	var jsonPayloadObj = {
		"name": srch,
		"userId": userId,
		"batchSize": BATCH_SIZE,
		"batchStart": batch_start
	};
	var jsonPayload = JSON.stringify(jsonPayloadObj);
	var url = urlBase + '/BatchSearch.' + extension;
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				// alert(xhr.responseText);
				var jsonObject = JSON.parse(xhr.responseText);
				var results = jsonObject.results;
				var count = jsonObject.count;
				if (results == null || Object.keys(results).length == 0)
				{
					var HTMLstring = "<div class=\"no-results\">No results found.</div>";

					$("#searchResults").append(HTMLstring);
				}
				else
				{
					$("#loadMoreButton").empty();
					// Dont show the plus button when there are no more than BATCH_SIZE results.
					if (count == BATCH_SIZE)
					{
						plusButton = "";
						plusButton += '<div class="m-2 search-header" >';
						plusButton += '<i style="font-size: 30px;" class="fa fa-plus-circle"></i>';
						plusButton += '</div>';
						$("#loadMoreButton").empty();
						if (!showedTooltip)
						{
							$('#loadMoreButton').tooltip('enable');
							setTimeout(() => { 
								var id = $('.tab-content .active').attr('id');
								if(id != "home") {
								return;
								}
								$('#loadMoreButton').tooltip('show');
							}, 1000);
						}
						showedTooltip = true;
						$("#loadMoreButton").append(plusButton);
					}

					searched = true;
					


					batch_start = parseInt(count);
					displayed_so_far = parseInt(count);
					// console.log(results);
					var counter = 4;
					for (const property in results)
					{
						var resId = property;
						var resfName = results[property].firstName;
						var reslName = results[property].lastName;
						var resEmail = results[property].email;
						var resPhone = results[property].phone;
						var resDate = results[property].dateCreated;
						var resPic = results[property].profilePic;
						
						var HTMLstring = "";
						HTMLstring += '<div id="resultItem'+resId+'" class="accordion-item charcoal-bg test" style="animation:load-slide '+ counter++/20 +'s linear">';
						HTMLstring += '                <h2 class="accordion-header" id="heading'+resId+'">';
						HTMLstring += '<button class="accordion-button collapsed courgette" type="button"';
						HTMLstring += 'data-bs-toggle="collapse" data-bs-target="#collapse'+resId+'"';
						HTMLstring += 'aria-expanded="true" aria-controls="collapseOne"> ';
						HTMLstring += `<span id="firstLast${resId}" >${resfName + ' ' + reslName}</span>`;
						HTMLstring += '</button>';
						HTMLstring += '</h2>';
						HTMLstring += '<div id="collapse'+resId+'" class="accordion-collapse collapse"'; 
						HTMLstring += 'aria-labelledby="heading'+resId+'" data-bs-parent="#searchResults">';
						HTMLstring += '<div class="accordion-body" style="border-radius: 12px;">';
						
						
						HTMLstring += '<div id="editingContainer'+resId+'" class="d-flex align-items-center editing d-none ">';
						HTMLstring += '<strong>Editing Contact...</strong>';
						HTMLstring += '<div class="spinner-grow text-info ms-auto" role="status" aria-hidden="true"></div>';
						HTMLstring += '</div>';

						HTMLstring += '<span class="contactInfoHeader" id="contactFirstName'+resId+'">First Name: </span>'; 
						HTMLstring += '<input class="m-2 contact-info-field" readonly type="text" placeholder="First Name" value="'+resfName+'" id="fNameUser'+resId+'">';
						HTMLstring += '<span class="contactInfoHeader" id="contactLastName'+resId+'">Last Name: </span>';
						HTMLstring += '<input class="m-2 contact-info-field" readonly type="text" placeholder="Last Name" value="'+reslName+'" id="lNameUser'+resId+'">';
						HTMLstring += '<span class="contactInfoHeader" id="contactEmail'+resId+'">Email: </span>';
						HTMLstring += '<input class="m-2 contact-info-field" readonly type="text" placeholder="Email" value="'+resEmail+'" id="emailUser'+resId+'">';
						HTMLstring += '<span class="contactInfoHeader" id="contactNumber'+resId+'">Phone Number: </span>';
						HTMLstring += '<input class="m-2 contact-info-field" readonly type="text" placeholder="Phone Number" value="'+resPhone+'" id="phoneUser'+resId+'">';                                                    
						HTMLstring += '<img id="user_picture_'+resId+'" class="m-2 profilePic mt-3" src="assets/profile_pictures/'+resPic+'" />';					
						HTMLstring += '<a class="contactInfoHeader photoLink"'; 
						HTMLstring += 'onclick="document.getElementById(\'photoForm'+resId+'\').style.display = \'flex\';">Add a photo?</a>';
						
											
						HTMLstring += '<form style="display: none" id="photoForm'+resId+'"'; 
						HTMLstring += 'class="input-group mt-1 mb-2 uploadcontainer" method="POST" action="upload.php"'; 
						HTMLstring += 'enctype="multipart/form-data"  target="hidden_iframe">';
						HTMLstring += '<input name="uploadedFile" type="file"'; 
						HTMLstring += 'class="form-control contact-info-field" id="photoUpload'+resId+'">';
						HTMLstring += '<input type="hidden" value="'+resId+'" name="id">';
						HTMLstring += '<input onclick="handlePhotoUpload('+resId+');"'; 
						HTMLstring += 'name="uploadButton" class="btn upload-file"'; 
						HTMLstring += 'type="button" value="Upload" />';
						HTMLstring += '</form>';
						HTMLstring += '<div id="successMessage'+resId+'"></div>';
						HTMLstring += '<div id="editMessage'+resId+'"></div>';
						HTMLstring += '<button id="deleteBtn'+resId+'" class="m-1 mb-3 btn fa-button" onclick="handleDelete('+resId+')">';
						HTMLstring += '<i class="fa fa-trash"></i> Delete</button>';
						HTMLstring += '<button id="editBtn'+resId+'" class="m-1  mb-3 btn fa-button" onclick="edit('+resId+')"><i class="fa fa-pencil"></i> Edit</button>';
						HTMLstring += '<button style="display:none" id="saveBtn'+resId+'" class="m-1 mb-3 btn fa-button" disabled onclick="save('+resId+')"><i class="fa fa-save"></i> Save</button>';
						HTMLstring += '<div class="dateInfo" id="date'+resId+'">Added on '+new Date(resDate).toLocaleDateString('en-us', {month: 'long', day: 'numeric' , year: 'numeric'}) +'</div>';
						HTMLstring += '</div>';

						HTMLstring += '</div>';
						HTMLstring += '</div>'; 


						$("#searchResults").append(HTMLstring);
						
					}		
				}		
				
				
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log(err.message);
	}

	return false;
	
}


function searchNextBatch()
{
	
	var srch = document.getElementById("searchText").value;
	$('#loadMoreButton').tooltip('disable');

	// This occurs when no more results are available.
	if (stopPolling)
		return;

	//////////////////////////////////////////////////////////////////////
	// delete me when done ////////////////////////////////////////////////
	// userId = 9;
	//////////////////////////////////////////////////////////////////////
	// var jsonPayload = '{"name" : "' + srch + '","userId" : ' + userId + '}';
	var jsonPayloadObj = {
		"name": srch,
		"userId": userId,
		"batchSize": BATCH_SIZE,
		"batchStart": batch_start
	};
	var jsonPayload = JSON.stringify(jsonPayloadObj);
	var url = urlBase + '/BatchSearch.' + extension;
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, false);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				// alert(xhr.responseText);
				var jsonObject = JSON.parse(xhr.responseText);
				var results = jsonObject.results;
				var count = jsonObject.count;
				
				displayed_so_far += parseInt(count);
				batch_start += parseInt(count);
				if (count < BATCH_SIZE)
				{
					plusButton = '<div class="m-2 ">';
					// plusButton += '<div class="m-2 search-header to-top" >';
					plusButton += '<a href="#" class="to-top" > To top</a>';
					plusButton += '</div>';
					$("#loadMoreButton").empty();
					$('#loadMoreButton').tooltip('disable')
					$("#loadMoreButton").append(plusButton);
					stopPolling = true;
				}

				if (results == null || Object.keys(results).length == 0)
				{
					// var HTMLstring = "<div class=\"no-results\">No results found.</div>";

					// $("#searchResults").append(HTMLstring);
				}
				else
				{
					// console.log(results);
					var counter = 4;
					for (const property in results)
					{
						var resId = property;
						var resfName = results[property].firstName;
						var reslName = results[property].lastName;
						var resEmail = results[property].email;
						var resPhone = results[property].phone;
						var resDate = results[property].dateCreated;
						var resPic = results[property].profilePic;
						
						var HTMLstring = "";
						HTMLstring += '<div id="resultItem'+resId+'" class="accordion-item charcoal-bg test" style="animation:load-slide '+ counter++/20 +'s linear">';
						HTMLstring += '                <h2 class="accordion-header" id="heading'+resId+'">';
						HTMLstring += '<button class="accordion-button collapsed courgette" type="button"';
						HTMLstring += 'data-bs-toggle="collapse" data-bs-target="#collapse'+resId+'"';
						HTMLstring += 'aria-expanded="true" aria-controls="collapseOne"> ';
						HTMLstring += `<span id="firstLast${resId}" >${resfName + ' ' + reslName}</span>`;
						HTMLstring += '</button>';
						HTMLstring += '</h2>';
						HTMLstring += '<div id="collapse'+resId+'" class="accordion-collapse collapse"'; 
						HTMLstring += 'aria-labelledby="heading'+resId+'" data-bs-parent="#searchResults">';
						HTMLstring += '<div class="accordion-body" style="border-radius: 12px;">';
						
						
						HTMLstring += '<div id="editingContainer'+resId+'" class="d-flex align-items-center editing d-none">';
						HTMLstring += '<strong>Editing Contact...</strong>';
						HTMLstring += '<div class="spinner-grow text-info ms-auto" role="status" aria-hidden="true"></div>';
						HTMLstring += '</div>';

						HTMLstring += '<span class="contactInfoHeader" id="contactFirstName'+resId+'">First Name: </span>'; 
						HTMLstring += '<input class="m-2 contact-info-field" readonly type="text" placeholder="First Name" value="'+resfName+'" id="fNameUser'+resId+'">';
						HTMLstring += '<span class="contactInfoHeader" id="contactLastName'+resId+'">Last Name: </span>';
						HTMLstring += '<input class="m-2 contact-info-field" readonly type="text" placeholder="Last Name" value="'+reslName+'" id="lNameUser'+resId+'">';
						HTMLstring += '<span class="contactInfoHeader" id="contactEmail'+resId+'">Email: </span>';
						HTMLstring += '<input class="m-2 contact-info-field" readonly type="text" placeholder="Email"  value="'+resEmail+'" id="emailUser'+resId+'">';
						HTMLstring += '<span class="contactInfoHeader" id="contactNumber'+resId+'">Phone Number: </span>';
						HTMLstring += '<input class="m-2 contact-info-field" readonly type="text" placeholder="Phone Number"  value="'+resPhone+'" id="phoneUser'+resId+'">';                                                    
						HTMLstring += '<img id="user_picture_'+resId+'" class="m-2 profilePic mt-3" src="assets/profile_pictures/'+resPic+'" />';					
						HTMLstring += '<a class="contactInfoHeader photoLink"'; 
						HTMLstring += 'onclick="document.getElementById(\'photoForm'+resId+'\').style.display = \'flex\';">Add a photo?</a>';
						
											
						HTMLstring += '<form style="display: none" id="photoForm'+resId+'"'; 
						HTMLstring += 'class="input-group mt-1 mb-2 uploadcontainer" method="POST" action="upload.php"'; 
						HTMLstring += 'enctype="multipart/form-data"  target="hidden_iframe">';
						HTMLstring += '<input name="uploadedFile" type="file"'; 
						HTMLstring += 'class="form-control contact-info-field" id="photoUpload'+resId+'">';
						HTMLstring += '<input type="hidden" value="'+resId+'" name="id">';
						HTMLstring += '<input onclick="handlePhotoUpload('+resId+');"'; 
						HTMLstring += 'name="uploadButton" class="btn upload-file"'; 
						HTMLstring += 'type="button" value="Upload" />';
						HTMLstring += '</form>';
						HTMLstring += '<div id="successMessage'+resId+'"></div>';
						HTMLstring += '<div id="editMessage'+resId+'"></div>';
						HTMLstring += '<button id="deleteBtn'+resId+'" class="m-1 mb-3 btn fa-button" onclick="handleDelete('+resId+')">';
						HTMLstring += '<i class="fa fa-trash"></i> Delete</button>';
						HTMLstring += '<button id="editBtn'+resId+'" class="m-1  mb-3 btn fa-button" onclick="edit('+resId+')"><i class="fa fa-pencil"></i> Edit</button>';
						HTMLstring += '<button style="display:none" id="saveBtn'+resId+'" class="m-1 mb-3 btn fa-button" disabled onclick="save('+resId+')"><i class="fa fa-save"></i> Save</button>';
						HTMLstring += '<div class="dateInfo" id="date'+resId+'">Added on '+new Date(resDate).toLocaleDateString('en-us', {month: 'long', day: 'numeric' , year: 'numeric'}) +'</div>';
						HTMLstring += '</div>';

						HTMLstring += '</div>';
						HTMLstring += '</div>'; 


						$("#searchResults").append(HTMLstring);
						
					}		
				}		
				
				
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log(err.message);
	}

	return false;
	
}


function handlePhotoUpload(id)
{
  if (document.getElementById("photoUpload" + id).files.length == 0)
	return;
var spinner = '';
spinner += '<button class="btn loading" type="button">';
spinner += '  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
spinner += '  Loading...';
spinner += '</button>';
document.getElementById("successMessage"+id).innerHTML = spinner;
document.getElementById("photoForm" + id).submit();
	
}


function edit(id)
{
	document.getElementById("editMessage" + id).innerHTML = "";
	document.getElementById("saveBtn" + id).disabled = false;
	document.getElementById("saveBtn" + id).style.display = "inline-block";
	document.getElementById("editingContainer" + id).classList.toggle("d-none");
	document.getElementById("fNameUser" + id).readOnly = false;
	document.getElementById("lNameUser" + id).readOnly = false;
	document.getElementById("emailUser" + id).readOnly = false;
	document.getElementById("phoneUser" + id).readOnly = false;
	document.getElementById("editBtn" + id).disabled = true;
	document.getElementById("editBtn" + id).style.display = "none";
}

function save(id)
{
	document.getElementById("editMessage" + id).innerHTML = "";

	var fName = document.getElementById("fNameUser" + id).value.trim();
	var lName = document.getElementById("lNameUser" + id).value.trim();
	var email = document.getElementById("emailUser" + id).value.trim();
	var phone = document.getElementById("phoneUser" + id).value.trim();
	
	if (fName == "" || lName == "" || phone == "" || email == "")
	{
		document.getElementById("editMessage" + id).innerHTML = "Fields cannot be empty.";
		return;
	}

	var jsonPayloadObj = {
		"ID": id,
		"firstName": fName,
		"lastName": lName,
		"email": email,
		"phone": phone,
		"userId": userId
	};
	var jsonPayload = JSON.stringify(jsonPayloadObj);
	var url = urlBase + '/Edit.' + extension;

	var xhr = new XMLHttpRequest();
	// I wanted this to be NOT asynchronous, so it "waits" for deletion but it should be fine.
	// also the "DELETE" http method here wasn't working, had to revert to POST
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				var responseText = JSON.parse(xhr.responseText);
				var responseError = responseText.error;
				if (responseError == "")
				{
					document.getElementById("saveBtn" + id).disabled = true;
					document.getElementById("saveBtn" + id).style.display = "none";
					document.getElementById("fNameUser" + id).readOnly = true;
					document.getElementById("lNameUser" + id).readOnly = true;
					document.getElementById("emailUser" + id).readOnly = true;
					document.getElementById("phoneUser" + id).readOnly = true;
					document.getElementById("editBtn" + id).disabled = false;
					document.getElementById("editBtn" + id).style.display = "inline-block";
					document.getElementById("editingContainer" + id).classList.toggle("d-none");
					document.getElementById("editMessage" + id).innerHTML = "User updated!"
					document.getElementById("firstLast" + id).innerHTML = fName + ' ' + lName;
					setTimeout(() => {document.getElementById("editMessage" + id).innerHTML = "";}, 5000);
				}
				else
				{
					document.getElementById("editMessage" + id).innerHTML = responseError;
				}
				
			}
		};
		xhr.send(jsonPayload);
	}
	catch (err) {
		document.getElementById("editMessage").innerHTML = err.message;
	}
    
    
	
}

function resetAnimation()
{
	var counter = 4;
	$('#searchResults').children('.accordion-item').each(function () {
		document.getElementById(this.id).style.animation = "load-slide "+ counter++/45 +"s linear";
	});
}