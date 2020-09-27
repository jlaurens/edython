import sqlite3

#This is a useful function that demonstrates looking up a particular variable (in this case id and name) to see if there is a match
#You could use this example to create say, a username and password look up. 
def login():
    idnumber=input("Enter id:") #this could be username in a login feature
    name=input("Enter name:") #this would be a password in a login feature
    conn = sqlite3.connect("test.db") #establish a connection to the database
    cursor=conn.cursor() #the cursor is essentially an iterator,which automatically invokes fetchall, or fetchone
    cursor.execute('SELECT * from STUDENT WHERE id="%s" AND name="%s"' %(idnumber,name))
    if cursor.fetchone() is not None: #if the iterator does actually return something (details are found...then...)
        print("Welcome you are logged in")
    else:
        print("Login failed")

"""
Something to note here is the dangers of what is called an SQL injection:
If you were creating something in the real world or for a web application, you would not use the string formatting replacement option...see notes below with alternative
# Get login details from user

# Connect to database
db = sqlite3.connect('path/to/database')
c = db.cursor()

# Execute sql statement and grab all records where the "username" and
# "password" are the same as "user" and "password"
c.execute('SELECT * FROM sabb WHERE username = ? AND password = ?', (user, password))

# If nothing was found then c.fetchall() would be an empty list, which
# evaluates to False 
if c.fetchall():
    print('Welcome')
else:
    print('Login failed')

IT IS ADVISED THAT YOU DO NOT DO THE FOLLOWING:
c.execute('SELECT * from sabb WHERE username="%s" AND password="%s"' % (user, pswd))
Imagine if someone passed in:

User =  Ruth
Password = my_cool_password" OR 1=1; --
The cursor would evaluate: SELECT * from sabb WHERE username="Ruth" AND password="my_cool_password" OR 1=1; -- ";

It'd allow me to log in as any user. By trivially changing my input I could execute any
command on the database that I wish (including deleting a login, adding a login, dropping the entire table etc).

"""


        
def calculate_sum():
    conn=sqlite3.connect("test.db")
    myrows=conn.execute("SELECT sum(POINTS) from STUDENT;")
    print("The sum total of all the points held by the student in our database is.........")
    print("=========================================")
    for row in myrows:
        print(row)
    
def calculate_average():
    conn=sqlite3.connect("test.db")
    myrows=conn.execute("SELECT avg(POINTS) from STUDENT;")
    print("The average points held by all students in our database is.........")
    print("=========================================")
    for row in myrows:
        print(row)
    
def find_max(): 
    conn=sqlite3.connect("test.db")
    myrows=conn.execute("SELECT max(POINTS) from STUDENT;")
    print("The max points held by any student in our database is.........")
    print("=========================================")
    for row in myrows:
        print(row)
    
def count_rows():
    conn=sqlite3.connect("test.db")
    myrows=conn.execute("SELECT count(*) from STUDENT;")
    for row in myrows:
        print(row)

def return_specific_fields():
    conn=sqlite3.connect("test.db")
    myrows=conn.execute("SELECT ID, NAME from STUDENT;")
    for row in myrows:
        print(row)
        

def sorting():
    conn=sqlite3.connect('test.db')
    #change the ASC at the end to DESC and ...yes, it will sort by descending order instead!
    myrows=conn.execute("SELECT * from STUDENT ORDER BY POINTS ASC;")
    print("Sorting from the least points to the most")
    print("===========================")
    for row in myrows:
        print(row)
        
def search_for_phrase():
    conn=sqlite3.connect('test.db')
    myrows=conn.execute("SELECT * from STUDENT WHERE POINTS GLOB '*00*'")
    for row in myrows:
        print(row)

def the_where_clause():
    conn=sqlite3.connect('test.db')
    myrows=conn.execute("SELECT * from STUDENT WHERE POINTS >= 19000;")
    print("The students who have achieved points above 19000 are:")
    print("=======================================")
    for row in myrows:
        print(row)
    conn.close()

def deleting():
    conn=sqlite3.connect('test.db')
    conn.execute("DELETE from STUDENT where ID = 3;")
    conn.commit()
    print("Total number of rows deleted :", conn.total_changes)

    cursor = conn.execute("SELECT id, name, comment, points from STUDENT")
    for row in cursor:
     print("ID = ", row[0])
     print("NAME = ", row[1])
     print("COMMENTS = ", row[2])
     print("POINTS = ", row[3], "
")
     print("====Your request to delete has been completed=====")
    conn.close()

def update_database():
    conn = sqlite3.connect('test.db')
    conn.execute("UPDATE STUDENT set POINTS = 99000.00 where ID = 4")
    conn.commit
    print("Total number of rows updated :", conn.total_changes)

    cursor = conn.execute("SELECT id, name, comment, points from STUDENT")
    for row in cursor:
       print ("ID = ", row[0])
       print ("NAME = ", row[1])
       print ("COMMENT = ", row[2])
       print ("POINTS = ", row[3], "
")

    print("===Request complete===")
    conn.close()

def create_table():
    conn = sqlite3.connect('test.db')
    print("Opened database")
    conn.execute('''CREATE TABLE STUDENT
         (ID INT PRIMARY KEY     NOT NULL,
         NAME           TEXT    NOT NULL,
         AGE            INT     NOT NULL,
         COMMENT        CHAR(50),
         POINTS         REAL);''')
    print("A database table has been created now")
    conn.close()

def add_records():
    conn=sqlite3.connect('test.db')
    
    conn.execute("INSERT INTO STUDENT (ID,NAME,AGE,COMMENT,POINTS) \
          VALUES (1, 'Jonathan', 14, 'One of our top students!', 20000.00 )");

    conn.execute("INSERT INTO STUDENT (ID,NAME,AGE,COMMENT,POINTS) \
          VALUES (2, 'Ruth', 15, 'An all rounder - wonderful!', 15000.00 )");

    conn.execute("INSERT INTO STUDENT (ID,NAME,AGE,COMMENT,POINTS) \
          VALUES (3, 'Nick', 14, 'Lacks drive and motivation. Rude.', 2.00 )");

    conn.execute("INSERT INTO STUDENT (ID,NAME,AGE,COMMENT,POINTS) \
          VALUES (4, 'Pigachee', 15, 'No.1 at everything.Simply Amazing!', 65000.00 )");

    conn.commit()
    print("Records have been created")
    conn.close()

def fetch_display():
    conn = sqlite3.connect('test.db')
    cursor = conn.execute("SELECT id, name, comment, points from STUDENT")
    for row in cursor:
       print ("ID=" ,row[0])
       print ("NAME = ", row[1])
       print ("COMMENT = ", row[2])
       print ("POINTS = ", row[3], "
")

    print ("Operation has been completed as per your request")
    conn.close()


        
login()



                    
