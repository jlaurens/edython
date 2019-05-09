""" ==============TASK
ALLOW THE USER TO CHANGE OR EDIT THEIR PASSWORD
1. Search for any given username
2. Edit the password field for that given username
3. Save the new updated username and password to file / updated
"""

#1. This code snippet asks the user for a username and then allows them to change password for that record
    
import csv
def main():

    updatedlist=[]
    temporarylist=[]
    
    with open("fakefacebook.txt",newline="") as f:
      reader=list(csv.reader(f))#convert iterable to a list to make it easier 
      print("CHANGE PASSWORD?!")
      username=input("Enter the username for the required user:")
      temporarylist=reader #store a copy of the data
      
      for row in reader: #for every row in the file
          for field in row:
                if field==username: #if a field is == to the required username
                    updatedlist.append(row) #add each row, line by line, into a list called 'udpatedlist'
                    newpassword=input("Enter new password")
                    updatedlist[0][1] = newpassword #set the field for password to the new password
               
      
      updatepassword(updatedlist,temporarylist)
        
def updatepassword(updatedlist,temporarylist):
    for index, row in enumerate(temporarylist):
        for field in row:
            if field==updatedlist[0]:
                temporarylist[index]=updatedlist #replace old record with updated records

    
    with open("fakefacebook.txt","w",newline="") as f:
        Writer=csv.writer(f)
        Writer.writerows(temporarylist)
        print("File has been updated")


main()
                    
