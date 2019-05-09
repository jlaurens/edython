#A working solution - allowing a user to attempt login 3 times

def login():
          tries=1
          while tries <4:
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
                          print("attempt no:")
                          print(tries)
                          tries += 1
                    if tries==4:
                              print("Sorry you have had exceeded the number of tries")
                    
