var urlBase = 'http://group17.codes/api';
var extension = 'php';

// var userId = 0;
// var firstName = "";
// var lastName = "";

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

				var minutesToExpiry = 20;
				var expiresOn = new Date();
				expiresOn.setTime(expiresOn.getTime()+(minutesToExpiry*60*1000));
				var expiration = expiresOn.toUTCString();
				
				saveCookie(firstName, lastName, userId, expiration);
	
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

function saveCookie(fname, lname, id, expiry = "Thu, 01 Jan 1970 00:00:00 GMT")
{
	document.cookie = "";
	var sessionCookieObject = {firstName:fname, lastName: lname, userId: id, expires: expiry};
	var sessionCookie = JSON.stringify(sessionCookieObject);
	document.cookie = sessionCookie;
	// document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	var sessionData = document.cookie;
	if (sessionData == "")
	{
		window.location.href = "index.html?err=notloggedin";
	}
	sessionJSON = JSON.parse(sessionData);
	id = sessionJSON.userId;
	fname = sessionJSON.firstName;
	lname = sessionJSON.lastName;
	expires = sessionJSON.expires;

	parsedDate = Date.parse(expires);
	currentDate = new Date().getTime();

	valid = true;

	if (parsedDate <= currentDate)
	{
		valid = false;
	}
	if (id <= 0)
	{
		valid = false;
	}
		
	if (!valid)
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = "Logged in as " + fname + " " + lname;
	}
}

function doLogout()
{
	saveCookie("","","0");
	window.location.href = "index.html";
	// userId = 0;
	// firstName = "";
	// lastName = "";
	// document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	// window.location.href = "index.html";
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


/*
Many changes needed below
but also, to retrieve the user's ID, you should run (names irrelevant)

var sessionData = document.cookie;
sessionJSON = JSON.parse(sessionData);
****THEUSERSID**** = sessionJSON.userId;

*/


function addContact()
{
	var newContact = document.getElementById("contactText").value;
	document.getElementById("contactAddResult").innerHTML = "";
	
	var jsonPayload = '{"contact" : "' + newContact + '", "contactId" : ' + contactId + '}';
	var url = urlBase + '/addUser.' + extension;
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("contactAddResult").innerHTML = "Contact has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}
	
}

function deleteContact() {

    if (confirm("Are you sure you want to delete this contact?")) {

        //Aw frick I gotta see the table to determine how we're selecting this beast to delete. To be continued.
        var contact = document.getElementById("contactText").value;

        document.getElementById("contactDeleteResult").innerHTML = "";

        var jsonPayload = '{"contactId" : ' + contactId + '}';
        var url = urlBase + '/addUser.' + extension;

        var xhr = new XMLHttpRequest();
        xhr.open("DELETE", url, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
        try {
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    document.getElementById("contactDeleteResult").innerHTML = "Contact has been removed.";
                }
            };
            xhr.send(jsonPayload);
        }
        catch (err) {
            document.getElementById("contactDeleteResult").innerHTML = err.message;
        }
    }
    
}
function searchContacts()
{
	var srch = document.getElementById("searchText").value;
	document.getElementById("contactSearchResult").innerHTML = "";
	
	var contactList = "";
	
	var jsonPayload = '{"search" : "' + srch + '","contactId" : ' + contactId + '}';
	var url = urlBase + '/searchContacts.' + extension;
	
	var xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("contactSearchResult").innerHTML = "Contact(s) has been retrieved";
				var jsonObject = JSON.parse( xhr.responseText );
				
				for( var i=0; i<jsonObject.results.length; i++ )
				{
					contactList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						contactList += "<br />\r\n";
					}
				}
				
				document.getElementsByTagName("p")[0].innerHTML = contactList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
	
}
