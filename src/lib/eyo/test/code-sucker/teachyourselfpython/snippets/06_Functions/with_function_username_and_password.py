#Press F5 to run this program
#in the Shell type 'login()' - this will CALL the function below and run it!

def login():
          tries=1
          while tries <3:
                    username="username1"
                    password="open123"
                    print('*********************************************')
                    print('Enter username')
                    answer1=input()
                    print('Enter password:')
                    answer2=input()
                    if answer1 == username and answer2 == password:
                          print("Access Granted")
                    else:
                          print("Sorry, Access Denied")
                          tries = + 1
                    
