#1: The program should start by running the PASSWORD FUNCTION. What do you need to change to do that?
#2:  Only if the user is above 12 (and types "yes") skip to another function called "quiz" which asks further questions
#......else, if the user is under 12, print "Sorry you are too young"

def password():
          password=input("Enter password to continue:")
          if password=="open123":
                    main()
          else:
                    print("Sorry, you appear to be an impostor! Access denied")

def main():
          print("*******************************WELCOME**************************************")
          name=input("Hello there - what is your name?")
          print("What a lovely name ..." + name)
          age=int(input("Please enter your age?"))
          if age >12:
                         quiz()
          else:
               print("Sorry, you are too young")


def quiz():
               print("*****WELCOME TO THE QUIZ***************")
          
         
password()

                    
