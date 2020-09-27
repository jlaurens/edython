import sqlite3

def fetch_display():
    conn = sqlite3.connect('test.db')
    cursor = conn.execute("SELECT id, name, comment, points from STUDENT")
    for row in cursor:
       print ("ID=" ,row[0])
       print ("NAME = ", row[1])
       print ("COMMENT = ", row[2])
       print ("POINTS = ", row[3], "
")


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

    print ("Operation has been completed as per your request")
    conn.close()

fetch_display()
                    
