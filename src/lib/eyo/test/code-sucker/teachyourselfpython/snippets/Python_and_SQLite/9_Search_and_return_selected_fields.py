import sqlite3

#This simply allows us to select specific fields to return, in this case just the ID and the NAME from the table
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

return_specific_fields()

                    
