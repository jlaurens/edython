""" ==============TASK
What if we want to ADD a new user to fakefacebook?! We would need to WRITE (and not read) from file

1.Add the required user input to add an entire full record to the file. (e.g. id, firstname, lastname, username, password, no.of.friends,etc.)
2. Write this record to the file, as has been shown with the example below
"""

import csv

#1. This code snippet asks the user to enter an ID number and first name, and writes it to the file (appends)

with open('fakefacebook_write.txt','a',newline="") as fo: #open the file in append mode (add to file, we don't wish to overwrite!)
        Writer=csv.writer(fo) #fo = file out (this can be called anything you like)
        id=input("Enter ID:")
        firstname=input("Enter firstname:")
        lastname=input("Enter lastname:")
        username=input("Enter username:")
        password=input("Enter password:")
        email=input("Enter email:")
        friends=int(input("Enter no. of friends:"))
                    
        Writer.writerow([id,firstname,lastname,username,password,email,friends])
        print("Record has been written to file")
                    
