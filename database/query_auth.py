import os
import uuid
import mysql.connector
from dotenv import load_dotenv
import re


def get_db_connection():
    """Establish and return a connection to the database."""
    load_dotenv()

    # Get MySQL credentials from environment variables
    db_host = os.getenv('DB_HOST')
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')

    conn = mysql.connector.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        database="auth_db"
    )
    return conn


def create_user(username, email, password_hash, first_name=None, last_name=None):
    """
    Create a new user in the database.

    Args:
        username (str): Unique username
        email (str): Unique email address
        password_hash (str): Hashed password
        first_name (str, optional): User's first name
        last_name (str, optional): User's last name

    Returns:
        dict: User data with status message or error message
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Generate UUID for user_id
        user_id = str(uuid.uuid4())

        # Insert user into database
        query = """
        INSERT INTO users (user_id, username, email, hash_passwd, f_name, l_name)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (user_id, username, email, password_hash, first_name, last_name))
        conn.commit()

        cursor.close()
        conn.close()

        return {"status": "success", "message": "User created successfully", "user_id": user_id}

    except mysql.connector.Error as err:
        # Handle errors such as duplicate usernames or emails
        if err.errno == 1062:  # Error code for duplicate entry
            if "username" in str(err):
                return {"status": "error", "message": "Username already exists"}
            elif "email" in str(err):
                return {"status": "error", "message": "Email already exists"}
        return {"status": "error", "message": f"Database error: {str(err)}"}


def check_user_exists(username=None, email=None):
    """
    Check if a username or email already exists in the database.

    Args:
        username (str, optional): Username to check
        email (str, optional): Email to check

    Returns:
        dict: Status and whether username/email exists
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        result = {"username_exists": False, "email_exists": False}

        if username:
            query = "SELECT 1 FROM users WHERE username = %s LIMIT 1"
            cursor.execute(query, (username,))
            result["username_exists"] = cursor.fetchone() is not None

        if email:
            query = "SELECT 1 FROM users WHERE email = %s LIMIT 1"
            cursor.execute(query, (email,))
            result["email_exists"] = cursor.fetchone() is not None

        cursor.close()
        conn.close()

        return result

    except mysql.connector.Error as err:
        print(f"Error checking user existence: {str(err)}")
        return {"status": "error", "message": f"Database error: {str(err)}"}


def is_valid_email(email):
    """
    Check if string is a valid email using regex pattern.
    """
    # A more comprehensive email validation pattern
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def verify_user(identifier, password_hash):
    """
    Verify user credentials using either email or username.

    Args:
        identifier (str): User's email or username
        password_hash (str): Hashed password to verify

    Returns:
        dict: User data if credentials are valid, or error message
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if identifier is a valid email or username
        if is_valid_email(identifier):
            # Use email for authentication
            query = """
            SELECT user_id, username, email, hash_passwd, f_name, l_name
            FROM users
            WHERE email = %s
            LIMIT 1
            """
        else:
            # Use username for authentication
            query = """
            SELECT user_id, username, email, hash_passwd, f_name, l_name
            FROM users
            WHERE username = %s
            LIMIT 1
            """

        cursor.execute(query, (identifier,))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user and user['hash_passwd'] == password_hash:
            # Remove password hash before returning user data
            user.pop('hash_passwd', None)
            return {
                "status": "success",
                "message": "Login successful",
                "user": user
            }
        else:
            return {"status": "error", "message": "Invalid credentials"}

    except mysql.connector.Error as err:
        return {"status": "error", "message": f"Database error: {str(err)}"}