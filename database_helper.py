import sqlite3
from flask import g


database_uri = "database.db"


def get_db():
    db = getattr(g, "db", None)  # To check if there is a database or not
    if db is None:
        db = g.db = sqlite3.connect(database_uri)

    return db


def disconnect():
    db = getattr(g, "db", None)
    if db is not None:
        db.close()
        g.db = None


def create_user(fname, lname, gender, city, country, email, password):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("INSERT INTO user (firstname, familyname, gender, city, country, email,password) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (fname, lname, gender, city, country, email, password))
        get_db().commit()

        return True
    except:
        return False


def add_user_token_table(email):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO token_data (email) VALUES (?)", (email,))
    get_db().commit()


def find_user(email):
    db = get_db()
    cursor = db.cursor()
    cursor = db.execute(
        "select * from  user where email like  ?", [email])
    data = cursor.fetchone()

    # print(data)

    if (data != None):
        return True
    else:
        return False


def get_password_with_email(email):
    db = get_db()
    cursor = db.cursor()
    cursor = db.execute(
        "select password from  user where email like  ?", [email])
    password_data = cursor.fetchone()[0]
    # print(password_data)

    return (password_data)


def token_store(email, token):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE token_data SET token = ? WHERE email = ?", (token, email))
    get_db().commit()


def get_token(token):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("select * from token_data where token like ?", (token,))
    token_value = cursor.fetchone()

    # print(token_value)

    if (token_value != None):
        return True
    else:
        return False


def remove_token(token):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        # if it is () with one value then we need to put comma, it we use [] then we dont need to put comma
        "update token_data set token = NULL where token = ?", (token,))
    get_db().commit()


def get_email(token):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("select email from token_data where token like ?", [token])
    email_value = cursor.fetchone()[0]

    return (email_value)


def update_password(password, email):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("update user set password = ? where email = ?", [
                   password, email])
    get_db().commit()


def append_message(sender_email, receiver_email, message, latitude, longitude):
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        """
        INSERT INTO
            messages (sender, receiver, message_data,latitude,longitude)
        VALUES
            (?, ?, ?,?,?)
        """,
        [sender_email, receiver_email, message, latitude, longitude]
    )

    db.commit()


def get_messages(receiver_email):
    db = get_db()
    cursor = db.cursor()
    all_msgs = cursor.execute(
        "SELECT sender, receiver, message_data,latitude, longitude FROM messages where receiver = ?", [receiver_email])
    all_msgs = all_msgs.fetchall()

    return all_msgs


def get_user_data_with_token(token):  # get user data with token from database
    db = get_db()
    cursor = db.cursor()  # sqlite internal function to execute the query
    cursor.execute(
        """
        select
            firstname,
            familyname,
            gender,
            city,
            country,
            email
        from
            user
        where
            email = (select email from token_data where token = ?)
        """,
        [token])
    # fetchone returns None if there is no data
    user_data = cursor.fetchone()  # just to get one row from the database.to be safe
    return user_data


def get_user_data_with_email(email):  # get user data with email from database
    db = get_db()
    cursor = db.cursor()  # sqlite internal function to execute the query
    cursor.execute(
        """
        select
            firstname,
            familyname,
            gender,
            city,
            country,
            email
        from
            user
        where
            email = ?
        """,
        [email])
    # fetchone returns None if there is no data
    user_data = cursor.fetchone()  # just to get one row from the database.to be safe
    return user_data
