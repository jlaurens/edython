import sqlite3

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


create_table()
                    
