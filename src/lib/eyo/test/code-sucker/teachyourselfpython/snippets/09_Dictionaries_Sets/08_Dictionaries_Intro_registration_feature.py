#TASK: Understand how a dictionary is sometimes an amazing solution (works better than two lists)
#****1. SELECT REGISTRATION AND ADD MORE USERS
#*** 2. GO THROUGH THE CODE AND NOTE HOW THE DICTIONARY HAS BEEN CREATED with key value pairs
#****3. Note the code to search a dictionary in the login function, to add to the dictionary in the reg function and how to print out a dictionary and its items in the registration_details function
usernames_passwords={"user1":"pass1","user2":"pass2","user3":"pass3"}

def main():
   mainmenu()


def mainmenu():
   print("****MAIN MENU****")
   print("=======Press L to login :")
   print("=======Press R to register :")
   choice1=input()
   if choice1=="L" or choice1=="l":
      login()
   elif choice1=="R" or choice1=="r":
      register()
   else:
      print("please make a valid selection")

def login():
   print("*****LOGIN SCREEN******")
   username=input("Username: ")
   password=input("Password: ")
   if username not in usernames_passwords:
      print("The user does not exist")
   elif usernames_passwords[username]==password:
      print("That's fine - access granted!")
   elif usernames_passwords[username] !=password:
      print("Sorry - wrong combination")
   

def register():
   print("*****REGISTRATION****")
   username=input("Enter a username:")
   password=input("Enter a password:")
   usernames_passwords[username]=password #this adds a username and password key value pair to the existing dictionary
   answer=input("Do you want to make another registration?")
   if answer=="y":
      register()
   else:
      registration_details()

def registration_details():
   print(usernames_passwords) #note that a dictionary does not store the items in any particular sorted order
   #****CAN ALSO BE PRINTED OUT USING A FOR LOOP BELOW
   #for k, v in usernames_passwords.items():
      #print(k,v)
main()
                    
