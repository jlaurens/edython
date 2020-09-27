import csv
#illustrating reading in data from a file

"""
File: bankdetails.txt
customer1,1
customer2,2
customer3,3
customer4,4
customer5,5
"""

def main():
   print("===Demo of reading file with csv reader====")
   read_from_file_csv_method2()


               
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

                    
