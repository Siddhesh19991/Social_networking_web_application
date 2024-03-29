displayView = function (contentView) {
  // to display a view
  var viewContainer = document.getElementById("viewContainer");
  viewContainer.innerHTML = contentView;
};

window.onload = function () {
  //code that is executed as the page is loaded.
  //You shall put your own custom code here.
  //window.alert() is not allowed to be used in your implementation.
  //window.alert("Hello TDDD97!");

  // to skip the sign in if token exists
  // returns null if the token is not set
  token = localStorage.getItem("token");
  signedIn = token != null;
  //var signedIn = false;

  if (!signedIn) {
    var welcomeView = document.getElementById("welcomeview").textContent;
    displayView(welcomeView);
    return;
  }
  // finding the script tag containing the appropriate view
  var profileView = document.getElementById("profileview").textContent;
  displayView(profileView);

  const websocket = new WebSocket("ws://" + location.host + "/echo");
  console.log(websocket);

  websocket.onopen = function (event) {
    console.log("WebSocket connection opened.");
    token = localStorage.getItem("token");
    websocket.send(token);

    websocket.onmessage = function (message) {
      console.log(message.data);
      if (message.data == "sign_out") {
        setTimeout(function () {
          localStorage.removeItem("token");
          localStorage.removeItem("activeProfileViewTab");

          websocket.close();
          //make the page wait for 2 seconds before redirecting to welcome page
          var welcomeViewScript = document.getElementById("welcomeview");
          var contentView = welcomeViewScript.textContent;
          displayView(contentView);
        }, 2000);
      }
    };
  };

  websocket.onerror = function (event) {
    console.error("WebSocket error:", event);
  };

  //get the last active tab from localstorage
  let activeTab = localStorage.getItem("activeProfileViewTab");
  if (activeTab == null) {
    //if last tab null direct it to home tab
    activeTab = "home";
  }

  switch (activeTab) {
    case "home":
      openHome();
      break;
    case "browse":
      openBrowse();
      break;
    case "account":
      openAccount();
      break;
    default:
      console.log("returned to default tab");
      openHome();
  }
};

// check password while signup is the same
function check() {
  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/sign_up", true);

  xmlr.onreadystatechange = function () {
    if (xmlr.readyState == 4) {
      if (xmlr.status == 201) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("signup_message").innerHTML =
          "The user is created";
      } else if (xmlr.status == 400) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        if (jsonResponse.msg == "incorrect structure of the email") {
          document.getElementById("signup_message").innerHTML =
            "The email structure is not right";
        }  else if (jsonResponse.msg == "no empty fields allowed") {
          document.getElementById("signup_message").innerHTML =
            "None of the input fields can be empty";
        } else if (
          jsonResponse.msg == "password must be atleast 8 characters long"
        ) {
          document.getElementById("signup_message").innerHTML =
            "The password must be 8 characters or more long";
        }
      } else if (xmlr.status == 409) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("signup_message").innerHTML =
          "Error: User already exist. Try again.";
      } else if (xmlr.status == 405) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.gtElementById("signup_message").innerHTML =
          "Error: The request method is not supported by the target resource ";
      } else if (xmlr.status == 500) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        if (jsonResponse.msg == "issue with creating the user") {
          document.getElementById("signup_message").innerHTML =
            "There was an issue with uploading the information to the database";
        } else {
          document.getElementById("signup_message").innerHTML = "server error";
        }
      }
    }
  };

  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");
  ///// What is the above for?/////

  event.preventDefault();

  intial_pw = document.getElementById("signup-password").value;
  second_pw = document.getElementById("signup-repeatpass").value;

  if (intial_pw != second_pw) {
    document.getElementById("signup_message").innerHTML =
      "Password is not the same";
    return false;
  } else if (intial_pw.length < 8) {
    document.getElementById("signup_message").innerHTML =
      "Password should be equal to or more than 8 characters";
    return false;
  } else {
    document.getElementById("signup_message").innerHTML = "";

    var formData = {
      email: document.getElementById("signup-email").value,
      password: document.getElementById("signup-password").value,
      firstname: document.getElementById("signup-name").value,
      familyname: document.getElementById("signup-familyName").value,
      gender: document.getElementById("signup-gender").value,
      city: document.getElementById("signup-city").value,
      country: document.getElementById("signup-country").value,
    };

    xmlr.send(JSON.stringify(formData));

    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";
    document.getElementById("signup-repeatpassd").value = "";
    document.getElementById("signup-name").value = "";
    document.getElementById("signup-familyName").value = "";
    document.getElementById("signup-gender").value = "";
    document.getElementById("signup-city").value = "";
    document.getElementById("signup-country").value = "";

    return false;
  }
}

var login_info;

//check login fields and go to next page according to login status
function check_login(event) {
  event.preventDefault();
  password_entered = document.getElementById("login-password").value;
  email_entered = document.getElementById("login-email").value;
  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/sign_in", true);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");

  xmlr.onreadystatechange = function () {
    if (xmlr.readyState == 4) {
      if (xmlr.status == 200) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("login_message").innerHTML =
          "You have logged in successucfully";
        console.log(jsonResponse.success);
        if (jsonResponse.success == false) {
          return false; //stay on login screen
        } else {
          localStorage.setItem("token", jsonResponse.data); // login token saved
          localStorage.setItem("email", email_entered);

          //if success true open next page
          var profileViewContent =
            document.getElementById("profileview").textContent;
          displayView(profileViewContent);
        }

        const websocket = new WebSocket("ws://" + location.host + "/echo");

        console.log(websocket);

        websocket.onopen = function (event) {
          console.log("WebSocket connection opened.");
          websocket.send(jsonResponse.data);

          websocket.onmessage = function (message) {
            console.log(message.data);
            if (message.data == "sign_out") {
              setTimeout(function () {
                localStorage.removeItem("token");
                localStorage.removeItem("activeProfileViewTab");

                websocket.close();
                //make the page wait for 2 seconds before redirecting to welcome page
                var welcomeViewScript = document.getElementById("welcomeview");
                var contentView = welcomeViewScript.textContent;
                displayView(contentView);
                document.getElementById("login_message").innerHTML =
                  "You have been sign-out due to multiple sign-ins";
              }, 2000);
            }
          };
        };

        websocket.onerror = function (event) {
          console.error("WebSocket error:", event);
          console.error("WebSocket readyState:", websocket.readyState);
          console.error("WebSocket URL:", websocket.url);
        };

        //login sucess-opening next page data retrieval and post-tezt retrieval

        openHome();
      } else if (xmlr.status == 400) {
        let jsonResponse = JSON.parse(xmlr.responseText);

        if (jsonResponse.msg == "e-mail and password fields are required") {
          document.getElementById("login_message").innerHTML =
            "No empty fields are allowed to sign-in";
        } else if (jsonResponse.msg == "user does not exist") {
          document.getElementById("login_message").innerHTML =
            "User does not exist in the database";
        } 
      } 
      else if (xmlr.status == 401) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("login_message").innerHTML =
          "Password is not correct. Check again";
      } else if (xmlr.status == 405) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.gtElementById("login_message").innerHTML =
          "Error: The request method is not supported by the target resource ";
      } else if (xmlr.status == 500) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("login_message").innerHTML = "server error";
      }
    }
  };

  //login_info = serverstub.signIn(email_entered, password_entered);
  // console.log(login_info);
  //document.getElementById("login_message").innerHTML = login_info.message;

  xmlr.send(
    JSON.stringify({ username: email_entered, password: password_entered })
  );
}

function openHome() {
  data_retrival();
  text_display();
  document.getElementById("text-wall").innerHTML = "";

  document.getElementById("home-content").style.display = "block";
  document.getElementById("browse-content").style.display = "none";
  document.getElementById("account-content").style.display = "none";

  document.getElementById("home-button").classList.add("active");
  document.getElementById("browse-button").classList.remove("active");
  document.getElementById("account-button").classList.remove("active");
  document.getElementById("text-wall").innerHTML = "";

  //to track in which tab we left the webapp we save it to local storage with specific key-> activeProfileViewTab
  //(keyword,value)
  localStorage.setItem("activeProfileViewTab", "home");
}

function openBrowse() {
  document.getElementById("home-content").style.display = "none";
  document.getElementById("browse-content").style.display = "block";
  document.getElementById("account-content").style.display = "none";

  document.getElementById("home-button").classList.remove("active");
  document.getElementById("browse-button").classList.add("active");
  document.getElementById("account-button").classList.remove("active");
  document.getElementById("text-wall").innerHTML = "";

  localStorage.setItem("activeProfileViewTab", "browse");
}

function openAccount() {
  document.getElementById("home-content").style.display = "none";
  document.getElementById("browse-content").style.display = "none";
  document.getElementById("account-content").style.display = "block";

  document.getElementById("home-button").classList.remove("active");
  document.getElementById("browse-button").classList.remove("active");
  document.getElementById("account-button").classList.add("active");
  document.getElementById("text-wall").innerHTML = "";

  localStorage.setItem("activeProfileViewTab", "account");
}

function data_retrival() {
  let token = localStorage.getItem("token");
  let xmlr = new XMLHttpRequest();
  xmlr.open("GET", "/get_user_data_by_token", true);
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = function () {
    if (xmlr.readyState == 4) {
      if (xmlr.status == 200) {
        let jsonResponse = JSON.parse(xmlr.responseText);

        document.getElementById("user-first-name").textContent =
          jsonResponse.data.firstname;
        document.getElementById("user-family-name").textContent =
          jsonResponse.data.familyname;
        document.getElementById("user-gender").textContent =
          jsonResponse.data.gender;
        document.getElementById("user-city").textContent =
          jsonResponse.data.city;
        document.getElementById("user-country").textContent =
          jsonResponse.data.country;
        document.getElementById("user-mail").textContent =
          jsonResponse.data.email;
      } else if (xmlr.status == 401) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        if (jsonResponse.msg == "token invalid") {
          document.getElementById("profile-error").innerHTML =
            "Invalid token error";
        } else {
          document.getElementById("profile-error").innerHTML =
            "Unauthorized error";
        }
      } else if (xmlr.status == 405) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.gtElementById("profile-error").innerHTML =
          "Error: The request method is not supported by the target resource ";
      } else if (xmlr.status == 500) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("profile-error").innerHTML = "server error";
      }
    }
  };

  xmlr.send();
}

function text_save() {
  event.preventDefault();

  let token = localStorage.getItem("token");
  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/post_message", true);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = function () {
    if (xmlr.readyState == 4) {
      let jsonResponse = JSON.parse(xmlr.responseText);
      if (xmlr.status == 201) {
        document.getElementById("message-post-response").innerHTML =
          jsonResponse.msg;
      } else if (xmlr.status == 401) {
        // Unauthorized
        document.getElementById("message-post-response").innerHTML =
          "Unauthorized access. Please check your token.";
      } else if (xmlr.status == 400) {
        // Bad Request
        document.getElementById("message-post-response").innerHTML =
          "Fields can not be empty. Please check the message.";
      } else if (xmlr.status == 400) {
        // Not Found
        document.getElementById("message-post-response").innerHTML =
          "User not found. Please check the email address.";
      } else if (xmlr.status == 500) {
        document.getElementById("message-post-response").innerHTML =
          "An error occurred. Please try again.";
      }
    }
  };

  textMessage = document.getElementById("user-text-to-be-posted").value;

  if (textMessage != "") {
    document.getElementById("user-text-to-be-posted").value = "";

    //called when location successfully retrieved
    function success(pos) {
      console.log("ok");
      const lat = pos.coords.latitude;
      const long = pos.coords.longitude;

      xmlr.send(
        JSON.stringify({
          email: localStorage.getItem("email"),
          message: textMessage,
          latitude: lat,
          longitude: long,
        })
      );
    }
    //called if there is an error getting the location
    function error(err) {
      console.error("Error occurred while getting geolocation:", err);

      xmlr.send(
        JSON.stringify({
          email: localStorage.getItem("email"),
          message: textMessage,
          latitude: 0,
          longitude: 0,
        })
      );
    }

    const options = { async: false };
    //request the current position of the device 
    navigator.geolocation.getCurrentPosition(success, error, options);
  } else {
    document.getElementById("message-post-response").innerHTML =
      "Field can not be Empty";
  }
}

function text_display() {
  let token = localStorage.getItem("token");

  let xmlr = new XMLHttpRequest();
  xmlr.open("GET", "/get_user_messages_by_token", true);
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = async function () {
    if (xmlr.readyState == 4) {
      if (xmlr.status == 200) {
        let responseData = JSON.parse(xmlr.responseText);
        allMessages = responseData.all_messages;

        console.log(allMessages.length);

        for (let rep = 0; rep < allMessages.length; rep++) {
          msgIndex = allMessages.length - rep;
          la = allMessages[msgIndex - 1].latitude;
          lo = allMessages[msgIndex - 1].longitude;
          const response = await fetch( //fetching the address from the latitude and longitude
            `https://geocode.xyz/${la},${lo}?json=1&auth=974118388864149676164x70514`
          );
          const data = await response.json(); //converting the response to json
          const address = data.region; //getting the region from the json response
          console.log(data);

          document.getElementById("text-wall").innerHTML += `
          <div id="message-${msgIndex}"> ${msgIndex}) - ${
            allMessages[msgIndex - 1].message
          } <br>
          <i>posted by: ${allMessages[msgIndex - 1].sender}</i><br>
          <span>Address: ${address}</span> 
          </div>`;
        }
      }
    } else if (xmlr.status == 401) {
      document.getElementById("text-wall").innerHTML =
        "Session expired. Please log in again.";
    }  else if (xmlr.status == 500) {
      document.getElementById("text-wall").innerHTML =
        "An unexpected error occurred.Please try again.";
    }
    else if (xmlr.status == 405) {
      document.getElementById("text-wall").innerHTML =
      "Error: The request method is not supported by the target resource ";
    }
  };

  //console.log(array.data[0].content); there is error here in chrome console!
  xmlr.send();
}

function refresh() {
  //clean the server message and text wall home tab
  document.getElementById("message-post-response").innerHTML = "";
  document.getElementById("text-wall").innerHTML = "";

  text_display();
}

//change password in account tab
function passwordChange() {
  old_password = document.getElementById("old-password").value;
  new_password = document.getElementById("new-change-password").value;
  new_password_repeat = document.getElementById("changed-password").value;

  token = localStorage.getItem("token");

  let xmlr = new XMLHttpRequest();
  xmlr.open("PUT", "/change_password", true);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");
  xmlr.setRequestHeader("Authorization", token);
  if (new_password !== new_password_repeat) {
    document.getElementById("password_change_message").innerHTML =
      "Error: New passwords do not match";
    return false; // prevent reload
  }

  xmlr.onreadystatechange = function () {
    if (xmlr.readyState == 4) {
      if (xmlr.status == 200) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("password_change_message").innerHTML =
          "Password has been successfully updated";
      } else if (xmlr.status == 400) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        if (jsonResponse.msg == "no empty fields allowed") {
          document.getElementById("password_change_message").innerHTML =
            "None of the input fields can be empty";
        } else if (
          jsonResponse.msg == "old and new password cannot be the same!"
        ) {
          document.getElementById("password_change_message").innerHTML =
            "The old password and new password cannot be the same";
        } else if (
          jsonResponse.msg == "new password must be at least 8 characters!"
        ) {
          document.getElementById("password_change_message").innerHTML =
            "The new password must have atleast 8 characters as well";
        }
      } else if (xmlr.status == 401) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        if (jsonResponse.msg == "token invalid") {
          document.getElementById("password_change_message").innerHTML =
            "Invalid token error";
        }  
        else if (jsonResponse.msg == "old password entered is not correct!") {
          document.getElementById("password_change_message").innerHTML =
          "The old password entered is incorrect";
        }
        else {
          document.getElementById("password_change_message").innerHTML =
            "Unauthorized error";
        }
      } else if (xmlr.status == 405) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.gtElementById("password_change_message").innerHTML =
          "Error: The request method is not supported by the target resource ";
      } else if (xmlr.status == 500) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("password_change_message").innerHTML =
          "server error";
      }
    }
  };

  document.getElementById("old-password").value = "";
  document.getElementById("new-change-password").value = "";
  document.getElementById("changed-password").value = "";

  xmlr.send(
    JSON.stringify({
      oldpassword: old_password,
      newpassword: new_password,
    })
  );

  return false; // prevent reload
}

//signout function in account tab
function signout() {
  let token = localStorage.getItem("token");
  let xmlr = new XMLHttpRequest();
  xmlr.open("DELETE", "/sign_out", true);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = function () {
    if (xmlr.readyState == 4) {
      if (xmlr.status == 200) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("signout_message").innerHTML =
          "sign out successful";
        localStorage.removeItem("token");
        localStorage.removeItem("activeProfileViewTab");
        setTimeout(function () {
          //make the page wait for 2 seconds before redirecting to welcome page
          var welcomeViewScript = document.getElementById("welcomeview");
          var contentView = welcomeViewScript.textContent;
          displayView(contentView);
        }, 2000);
      } else if (xmlr.status == 400) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("signout_message").innerHTML =
          "Bad request error. token not found";
      } else if (xmlr.status == 401) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        if (jsonResponse.msg == "token invalid") {
          document.getElementById("signout_message").innerHTML =
            "Invalid token error";
        } else {
          document.getElementById("signout_message").innerHTML =
            "Unauthorized error";
        }
      } else if (xmlr.status == 405) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.gtElementById("signout_message").innerHTML =
          "Error: The request method is not supported by the target resource ";
      } else if (xmlr.status == 500) {
        let jsonResponse = JSON.parse(xmlr.responseText);
        document.getElementById("signout_message").innerHTML = "server error";
      }
    }
  };
  xmlr.send();
}

function userretrive() {
  //retrieve information browse tab
  event.preventDefault();

  userEmail = document.getElementById("user-email").value;
  let token = localStorage.getItem("token");
  let xmlr = new XMLHttpRequest();

  xmlr.open("GET", `/get_user_data_by_email/${userEmail}`, true);
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = function () {
    if (xmlr.readyState == 4) {
      if (xmlr.status == 200) {
        let responseData = JSON.parse(xmlr.responseText);

        if (responseData.success == false) {
          // if its not sucess
          document.getElementById("user-wall").innerHTML = "";
          document.getElementById("retrive_message").innerHTML =
            responseData.msg;
          return;
        } else {
          document.getElementById("retrive_message").innerHTML = "";
          //get whole browse tab without information
          var browseTabContent =
            document.getElementById("browse-tab").innerHTML;
          //browse tab is added to user-wall(whole page)
          //user-wall is empty page in the beginning
          document.getElementById("user-wall").innerHTML = browseTabContent;

          // display other users information in browse tab related fields
          document.getElementById("other_first_name").textContent =
            responseData.data.firstname;
          document.getElementById("other_family_name").textContent =
            responseData.data.familyname;
          document.getElementById("other_gender").textContent =
            responseData.data.gender;
          document.getElementById("other_city").textContent =
            responseData.data.city;
          document.getElementById("other_country").textContent =
            responseData.data.country;
          document.getElementById("other_email").textContent =
            responseData.data.email;

          let xmlr2 = new XMLHttpRequest();
          xmlr2.open("GET", `get_user_messages_by_email/${userEmail}`, true);
          xmlr2.setRequestHeader("Authorization", token);

          xmlr2.onreadystatechange = async function () {
            if (xmlr2.status == 200 && xmlr2.readyState == 4) {
              let userMessagesData = JSON.parse(xmlr2.responseText);
              let allMessages = userMessagesData.all_messages;

              for (let rep = 0; rep < allMessages.length; rep++) {
                msgIndex = allMessages.length - rep;
                la = allMessages[msgIndex - 1].latitude;
                lo = allMessages[msgIndex - 1].longitude;
                const response = await fetch(
                  `https://geocode.xyz/${la},${lo}?json=1&auth=974118388864149676164x70514`
                );
                const data = await response.json();
                const address = data.region;

                document.getElementById(
                  "other-user-text-wall"
                ).innerHTML += `<div id="message-${msgIndex}"> ${msgIndex} - ${
                  allMessages[msgIndex - 1].message
                } <br>
              <i>posted by: ${allMessages[msgIndex - 1].sender}</i><br>
              <span>Address: ${address}</span>
              </div>`;
              }
            }
          };
          xmlr2.send();
        }
      } else if (xmlr.status == 401) {
        document.getElementById("retrive_message").innerHTML =
          "Session expired. Please log in again.";
      } else if (xmlr.status == 404) {
        document.getElementById("retrive_message").innerHTML =
          "User with this email not found in the system";
      } else if (xmlr.status == 500) {
        document.getElementById("retrive_message").innerHTML =
          "An unexpected error occurred.Please try again.";
      }
    }
  };
  xmlr.send();
  return false;
}

function other_user_test_save() {
  //other user text post
  event.preventDefault();
  textMessageToBePosted = document.getElementById(
    "message-text-to-be-posted"
  ).value;
  otherUserEmail = document.getElementById("user-email").value;

  //if (textMessageToBePosted == "") {
  //  document.getElementById("server-response").innerHTML = "Cannot be empty";
  //  return false;
  //}
  document.getElementById("message-text-to-be-posted").value = "";

  let token = localStorage.getItem("token");
  let xmlr = new XMLHttpRequest();
  xmlr.open("POST", "/post_message", true);
  xmlr.setRequestHeader("Authorization", token);
  xmlr.setRequestHeader("Content-Type", "application/json;charset = utf-8");

  xmlr.onreadystatechange = function () {
    if (xmlr.readyState == 4) {
      if (xmlr.status == 200) {
        let responseData = JSON.parse(xmlr.responseText);
        document.getElementById("server-response").innerHTML = responseData.msg;
      } else if (xmlr.status == 401) {
        let responseData = JSON.parse(xmlr.responseText);
        document.getElementById("server-response").innerHTML =
          "Session expired. Please log in again.";
      } else if (xmlr.status == 400) {
        let responseData = JSON.parse(xmlr.responseText);
        if(responseData.msg=="Messsage cannot be empty"){ 
        document.getElementById("server-response").innerHTML =
          "Message fields can not be empty. Please check again." 
        }else if(responseData.msg=="Email cannot be empty"){
          document.getElementById("server-response").innerHTML =
          "Email field can not be empty. Please check again. " 
        }
      } else if (xmlr.status == 404) {
        let responseData = JSON.parse(xmlr.responseText);
        document.getElementById("server-response").innerHTML =
          "User with entered email does not exist. ";
      } else if (xmlr.status == 500) {
        document.getElementById("server-response").innerHTML =
          "An unexpected error occurred.Please try again.";
      }
    }
  };
  function success(pos) {
    console.log("ok");
    const lat = pos.coords.latitude;
    const long = pos.coords.longitude;

    xmlr.send(
      JSON.stringify({
        email: otherUserEmail,
        message: textMessageToBePosted,
        latitude: lat,
        longitude: long,
      })
    );
  }

  function error(err) {
    console.error("Error occurred while getting geolocation:", err);

    xmlr.send(
      JSON.stringify({
        email: otherUserEmail,
        message: textMessageToBePosted,
        latitude: 0,
        longitude: 0,
      })
    );
  }

  const options = { async: false };

  navigator.geolocation.getCurrentPosition(success, error, options);
  return false;
}

function other_user_refresh() {
  //refresh message wall browse tab
  document.getElementById("server-response").innerHTML = "";
  document.getElementById("message-text-to-be-posted").innerHTML = "";
  document.getElementById("other-user-text-wall").innerHTML = "";
  userMail = document.getElementById("user-email").value;
  let token = localStorage.getItem("token");

  let xmlr = new XMLHttpRequest();
  xmlr.open("GET", `get_user_messages_by_email/${userEmail}`, true);
  xmlr.setRequestHeader("Authorization", token);

  xmlr.onreadystatechange = async function () {
    if (xmlr.readyState == 4) {
      if (xmlr.status == 200) {
        let userMessagesData = JSON.parse(xmlr.responseText);
        let allMessages = userMessagesData.all_messages;

        for (let rep = 0; rep < allMessages.length; rep++) {
          msgIndex = allMessages.length - rep;
          la = allMessages[msgIndex - 1].latitude;
          lo = allMessages[msgIndex - 1].longitude;
          const response = await fetch(
            `https://geocode.xyz/${la},${lo}?json=1&auth=974118388864149676164x70514`
          );
          const data = await response.json();
          const address = data.region;

          document.getElementById(
            "other-user-text-wall"
          ).innerHTML += `<div id="message-${msgIndex}"> ${msgIndex} - ${
            allMessages[msgIndex - 1].message
          } <br>
              <i>posted by: ${allMessages[msgIndex - 1].sender}</i><br>
              <span>Address: ${address}</span>
              </div>`;
        }
      }
    } else if (xmlr.status == 401) {
      document.getElementById("other-user-text-wall").innerHTML =
        "Session expired. Please log in again.";
    } else if (xmlr.status == 404) {
      document.getElementById("other-user-text-wall").innerHTML =
        "Entered email does not exist";
    } else if (xmlr.status == 500) {
      document.getElementById("other-user-text-wall").innerHTML =
        "An unexpected error occurred.Please try again.";
    }
  };
  xmlr.send();
}
