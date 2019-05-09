#Login using username and password and a read into/from dictionary method

"""
File contents:

user1,pass1
user2,pass2
user3,pass3
user4,pass4
user5,pass5

"""

def main():

     logindetails_dict={}

     with open("logindetails.txt","r") as f:
          for line in f:
               fields=line.strip().split(",")
               logindetails_dict[fields[0]]=fields[1]


          username=input("Username:")
          password=input("Password:")

          if username in logindetails_dict and logindetails_dict[username]==password:
               print("Yes")
          else:
               print("Nope")
main()
                    
