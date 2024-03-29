from flask import Flask, jsonify, request
import sqlite3
import database_helper
import secrets
from email_validator import validate_email, EmailNotValidError
import secrets
from flask_sock import Sock


app = Flask(__name__)
sock = Sock(app)


active_users = {}


@app.route("/sign_up", methods=["POST"])
def sign_up():
    json_dic = request.get_json()
    # print(json_dic)
    fname = json_dic.get("firstname")
    lname = json_dic.get("familyname")
    gender = json_dic.get("gender")
    city = json_dic.get("city")
    country = json_dic.get("country")
    email = json_dic.get("email")
    password = json_dic.get("password")

    if fname == None or lname == None or gender == None or city == None or country == None or email == None or password == None:
        return jsonify({"success": False, "msg": "no empty fields allowed"}), 400

    try:
        validate_email(email, check_deliverability=False)

    except:
        return jsonify({"success": False, "msg": "incorrect structure of the email"}), 400

    if len(password) < 8:
        return jsonify({"success": False, "msg": "password must be atleast 8 characters long"}), 400

    if (database_helper.find_user(email) == True):
        return jsonify({"success": False, "msg": "User already exists"}), 409

    if password == "":
        return jsonify({"success": False, "msg": "password can not be empty"}), 400
    if fname == "":
        return jsonify({"success": False, "msg": "First Name can not be empty"}), 400
    if lname == "":
        return jsonify({"success": False, "msg": "Family Name can not be empty"}), 400
    if gender == "":
        return jsonify({"success": False, "msg": "Gender field can not be empty"}), 400
    if city == "":
        return jsonify({"success": False, "msg": "City field can not be empty"}), 400
    if country == "":
        return jsonify({"success": False, "msg": "Country field can not be empty"}), 400
    if email == "":
        return jsonify({"success": False, "msg": "e-mail field can not be empty"}), 400

    resp = database_helper.create_user(
        fname, lname, gender, city, country, email, password)

    if resp == False:
        return jsonify({"success": False, "msg": "issue with creating the user"}), 500
    else:
        database_helper.add_user_token_table(email)
        return jsonify({"success": True, "msg": "user created"}), 201


@app.route("/sign_in", methods=["POST"])
def sign_in():
    json_dic = request.get_json()
    email = json_dic.get("username")
    password = json_dic.get("password")

    token = secrets.token_hex(16)  # generate token

    if email in active_users:
        print("already logged in")
        active_users[email].send("sign_out")
        del active_users[email]

    if email == None or password == None:
        return jsonify({"success": False, "msg": "e-mail and password fields are required"}), 400

    if (database_helper.find_user(email) == False):
        return jsonify({"success": False, "msg": "user does not exist"}), 400

    password_check = database_helper.get_password_with_email(email)

    if password == password_check:
        database_helper.token_store(email, token)
        return jsonify({"success": True, "data": token, "msg": "logged in successucfully"}), 200
    else:
        return jsonify({"success": False, "msg": "incorrect password"}), 401


@app.route("/sign_out", methods=["DELETE"])
def sign_out():
    # get the token from the header with authorization key
    token = request.headers.get("Authorization")
    user_data = database_helper.get_user_data_with_token(token)

    if token == None:
        return jsonify({"success": False, "msg": "no token found"}), 400

    if user_data == None:
        return jsonify({"success": False, "msg": "token invalid"}), 401
   

    email = database_helper.get_email(token)

    del active_users[email]
    database_helper.remove_token(token)
    return jsonify({"success": True, "msg": "sign out successful"}), 200

# in test.py Put was required


@app.route("/change_password", methods=["PUT"])
def change_password():
    # get the token from the header with authorization key
    token = request.headers.get("Authorization")
    user_data = database_helper.get_user_data_with_token(token)

    if user_data == None:
        return jsonify({"success": False, "msg": "token invalid"}), 401

    request_json = request.get_json()
    old_password_from_user = request_json.get(
        "oldpassword")  # get old password from the request
    new_password_from_user = request_json.get(
        "newpassword")  # get new password from the request

    email = user_data[5]  # get email from the user_data
    password_from_database = database_helper.get_password_with_email(email)

    if (old_password_from_user == None or new_password_from_user == None):
        return jsonify({"success": False, "msg": "no empty fields allowed"}), 400
    if (old_password_from_user != password_from_database):
        return jsonify({"success": False, "msg": "old password entered is not correct!"}), 401
    if (old_password_from_user == new_password_from_user):
        return jsonify({"success": False, "msg": "old and new password cannot be the same!"}), 400
    if len(new_password_from_user) < 8:
        return jsonify({"success": False, "msg": "new password must be at least 8 characters!"}), 400

    database_helper.update_password(new_password_from_user, email)
    return jsonify({"success": True, "msg": "password updated"}), 200


@app.route("/get_user_data_by_token", methods=["GET"])
def get_user_data_by_token():
    # get the token from the header with authorization key
    token = request.headers.get("Authorization")
    user_data = database_helper.get_user_data_with_token(token)

    if user_data == None:
        return jsonify({"success": False, "msg": "token invalid!!"}), 401

    received_data = {  # create a dictionary with the user data(json)
        "firstname": user_data[0],
        "familyname": user_data[1],
        "gender": user_data[2],
        "city": user_data[3],
        "country": user_data[4],
        "email": user_data[5]
    }
    # return the user data as a json
    return jsonify({"success": True, "msg": "user data retrieved", "data": received_data}), 200


@app.route("/get_user_data_by_email/<email>", methods=["GET"])
def get_user_data_by_email(email):
    # check if the token is valid
    token = request.headers.get("Authorization")
    token_user_data = database_helper.get_user_data_with_token(token)

    if token_user_data == None:
        return jsonify({"success": False, "msg": "token invalid"}), 401 #unauthorized

    # get the user data with the email
    email_user_data = database_helper.get_user_data_with_email(email)

    if email_user_data == None:
        return jsonify({"success": False, "msg": "User with this email not found! Check the email."}), 404

    received_data = {
        "firstname": email_user_data[0],
        "familyname": email_user_data[1],
        "gender": email_user_data[2],
        "city": email_user_data[3],
        "country": email_user_data[4],
        "email": email_user_data[5]
    }
    return jsonify({"success": True, "msg": "user data retrieved", "data": received_data}), 200


@app.route("/post_message", methods=["POST"])
def post_msg():
    # get the token from the header with authorization key
    token = request.headers.get("Authorization")
    token_user_data = database_helper.get_user_data_with_token(token)

    if token_user_data == None:
        return jsonify({"success": False, "msg": "Unauthorized:token invalid"}), 401

    request_json = request.get_json()  # user input (request data)
    user_entered_email = request_json.get(
        "email")  # get email from the request
    user_entered_message = request_json.get(
        "message")  # get message from the request
    latitude = request_json.get("latitude")
    longitude = request_json.get("longitude")

    if latitude == None or latitude == "":
        latitude = 0
    if longitude == None or longitude == "":
        longitude = 0

    print(latitude)

    if user_entered_message == None or user_entered_message == "":
        return jsonify({"success": False, "msg": "Messsage cannot be empty"}), 400
    if user_entered_email == None or user_entered_email == "":
        return jsonify({"success": False, "msg": "Email cannot be empty"}), 400
    if database_helper.find_user(user_entered_email) == False:
        return jsonify({"success": False, "msg": "user not found"}), 400

    database_helper.append_message(
        sender_email=token_user_data[5],
        receiver_email=user_entered_email,
        message=user_entered_message,
        latitude=latitude,
        longitude=longitude
    )

    return jsonify({"success": True, "msg": "Message posted!"}), 201


@app.route("/get_user_messages_by_token", methods=["GET"])
def get_msg_token():
    token = request.headers.get("Authorization")

    if database_helper.get_token(token) == False:
        return jsonify({"success": False, "msg": "token does not exist"}), 401

    # get email from the database with sending the token
    email = database_helper.get_email(token)

    # get all messages from the database with email
    all_msg = database_helper.get_messages(email)

    if all_msg is None or len(all_msg) == 0:
        return jsonify({"success": False, "msg": "No messages found"}), 200

    print(all_msg)
    formatted_messages = []  # formatting and store messages in formatted_messages list
    for message in all_msg:
        formatted_messages.append(
            {
                "sender": message[0],
                "receiver": message[1],
                "message": message[2],
                "latitude": message[3],
                "longitude": message[4]
            })

    return jsonify({"success": True, "msg": "data retrived!", "all_messages": formatted_messages}), 200


@app.route("/get_user_messages_by_email/<email>", methods=["GET"])
def get_msg_email(email):
    token = request.headers.get("Authorization")

    if database_helper.get_token(token) == False:
        return jsonify({"success": False, "msg": "token doesnt exist"}), 401

    if database_helper.find_user(email) == False:
        return jsonify({"success": False, "msg": "email doesnt exist"}), 404

    all_msg = database_helper.get_messages(email)
    formatted_messages = []
    for message in all_msg:
        formatted_messages.append(
            {
                "sender": message[0],
                "receiver": message[1],
                "message": message[2],
                "latitude": message[3],
                "longitude": message[4]
            }
        )

    return jsonify({"success": True, "msg": "data retrived!", "all_messages": formatted_messages}), 200


@sock.route("/echo")
def echo(sock):
    while True:
        token = sock.receive()
        print(token)
        email = database_helper.get_email(token)

        if email in active_users:
            print("already logged in")
            del active_users[email]

            # sock.send("sign_out")

            active_users[email] = sock
            print(sock)

        else:
            active_users[email] = sock
            print(sock)


@app.route('/')
def root():
    app = Flask(__name__, static_url_path='/static')

    return app.send_static_file("client.html")


if __name__ == "__main__":
    app.debug = True
    app.run()
