import csv
#illustrating reading in data from a file

"""
METHOD 1: CSV Reader
METHOD 2: Working directly with a text File *the need for split and split
ME

"""
def main():
   print("===Demo of Split without Strip====")
   split_without_strip()
   print("===Demo of Strip without Split====")
   strip_without_split()
   print("===Demo of reading file with strip, split, and direct line access===")
   read_from_file_method1_split_strip()
   print("===Demo of reading file with csv reader====")
   read_from_file_csv_method2()
   print("===Use of Join====")
   use_of_join()
   
   
def split_without_strip():
         with open("bankdetails.txt","r") as f:
            for line in f:
               lines=line.split(",") #this splits the lines at the comma
               print(lines) #on printing the lines notice that the data contains a 
 character (end of line)
         print("lines[0] gives the split word:",lines[0]) #this demonstrates the line has been split
         


def strip_without_split():
         with open("bankdetails.txt","r") as f:
            for line in f:
               lines=line.strip() #this strips the new line character 

               print(lines)
         print("lines[0] gives just c, demonstrating that the lines have not been split by the , yet:",lines[0]) #this demonstrates the line has not been split

def strip_and_split():
   bankdetails=[]
   with open("bankdetails.txt","r") as f:
      for line in f:
         line = line.rstrip()
         split_line = line.split()
         for field in split_line:  #nested for loop, check if the word is in list and if not append it to the list
               bankdetails.append(field)
   print(bankdetails)
      
               
def read_from_file_method1_split_strip():
   bankdetails=[]
   with open("bankdetails.txt","r") as f:
      for line in f:
         line=line.rstrip() #r strip removes the new line character from the right side of the string
         split_line=line.split(",")
         for field in split_line:
            bankdetails.append(field)

   accessgranted=False
   while accessgranted==False:
       username=input("username:")
       password=input("account no:")

       for i in range(len(bankdetails)):
          if username==bankdetails[i] and password==bankdetails[i+1]:
              accessgranted=True
              break
          else:
              accessgranted=False
       if accessgranted==True:
         print("Access Granted")
       else:
         print("Sorry, wrong credentials")

def read_from_file_csv_method2():
   
    username=input("Enter username:")
    accountno=input("Enter account:")
    with open('bankdetails.txt','r') as f:
        reader=csv.reader(f)
        username_correct=False
        accountno_correct=False
        for row in reader:
            for field in row:
                if field==username:
                    currentindex=row.index(field)
                    if row[currentindex+1]==accountno:
                        username_correct=True
                        accountno_correct=True
                        
    if username_correct == False or accountno_correct == False:
        print("Wrong username or password, sorry!")
    else:
      print("****You're in!*****")
      
def use_of_join():
   s="00"
   list=[1,2,3,4,5]
   print(s.join(list)
            

#Follow on challenge
"""
The headteacher at a school stores information about the teaching staff
and the subjects they teach. Create a program that:
1. Allows the head teacher to add teachers and their subjects to a text file
2. Allows the head teacher to search for a member of staff and have it return
the subject they teach

Produce a suitable menu structure to facilitate the above
"""

main()



"""
file: bankdetails.txt

customer1,1
customer2,2
customer3,3
customer4,4
customer5,5
"""
                    
