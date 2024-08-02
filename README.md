# Social_networking_web_application

This project is a social networking application featuring a welcome page and a profile page. The primary objective of this project was to implement different functionalities for both the Frontend and Backend using JavaScript and Python. Due to the emphasis on learning functionalities, less attention was given to CSS. A separate project was undertaken to focus on CSS to enhance the visual appeal of the website. You can find the repository for that project [here](https://github.com/Siddhesh19991/Responsive_meal_delivery_website).


<br>
<br>
<br>
<br>


Steps to view the app:
  1) Make sure the latest version of Python is installed.
     
  2) Create a virtual environment by running: <br>
       virtualenv -p python3 specified_directory

     This is done to create and use a separate and isolated virtual machine for the application.
     
  3) Run the below command:<br>
      source path_to_virtual_environment/bin/activate
    
  4) Ensure relevant libraries are installed as indicated in lines 1-7 in the server.py file. (Use pip3 install ____ )
     
  5) Now run the below command for the app to run: <br>
      gunicorn -b 0.0.0.0:5000 --workers 1 --threads 100 server:app



<br>
<br>
<br>
<br>


Here are some more information about the functionalities implemented in the project: 

1) The Flask development web server was initially used, later transitioning to Gunicorn for deploying the app to an external server.

2) SQLite3 was employed for database storage of user information.

3) Postman was utilized for testing backend connections.

4) Asynchronous HTTP requests were sent using the XMLHttpRequest object.

5) Two-way asynchronous communication was established using the WebSocket protocol. This facilitated automatic sign-out of a user from one browser when the same user signed in from another browser. Additionally, a logout notification was sent to the old client for clear communication regarding the sign-out event.

6) HTTPS status codes were implemented appropriately across various functions to ensure effective communication with the user.
   
7) The website is made responsive so that the application is adaptable to different display resolutions from mobile to desktop using the "Bootstrap" framework.
   
8) Geolocation was setup using the "Geocode.xyz" API and the implementation was done such that every message shall also include the user’s location who has posted it. (Note: Due to the limited number of free credits available for this API, once the limit has been reached, the address will, unfortunately, be displayed as "undefined" as the current auth key has reached its API limit) 


<br>
<br>
<br>
<br>


Welcome View: 
<img width="1244" alt="Screenshot 2024-03-16 at 3 15 02 PM" src="https://github.com/Siddhesh19991/Social_networking_web_application/assets/65071692/7bc3be52-703b-4044-a5e4-76319f5f990d">


<br>
<br>

Profile View: <be>

This profile page has different tabs within it for the user to use as shown below

In the "Home tab", the user shall own a message wall on which other users and himself/herself can post messages on it.
<img width="1688" alt="Screenshot 2024-03-16 at 3 16 55 PM" src="https://github.com/Siddhesh19991/Social_networking_web_application/assets/65071692/aa5002dc-d88c-431e-92ac-024937852d48">

In the "Browse tab". The user shall be able to view another user's personal information, everything excluding their password, and message wall by providing his/her email address. The user can also post on their wall from this tab. 
<img width="1626" alt="Screenshot 2024-03-16 at 3 27 19 PM" src="https://github.com/Siddhesh19991/Social_networking_web_application/assets/65071692/20180076-4dae-46c1-bc0e-b01856a0da2b">

In the "Account tab", the user can change their password and also sign-out. 
<img width="1619" alt="Screenshot 2024-03-16 at 3 17 18 PM" src="https://github.com/Siddhesh19991/Social_networking_web_application/assets/65071692/91788fd4-2896-4949-908f-bcc15c09d574">
