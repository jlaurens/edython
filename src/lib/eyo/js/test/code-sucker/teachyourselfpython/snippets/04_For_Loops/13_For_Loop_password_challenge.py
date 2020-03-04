#Task 9
import sys

def main():

    password=input("What is your password : ")

    for i in range(3): #this will allow for 3 tries
        if password=="open123":
            print("yes, that's it ...")
            accessgranted()

            
        else:
            print("try again")
            password=input("Enter password again: ")
    triesover()

         


def accessgranted():
    print("****ACCESS GRANTED *****")
    for i in range(100):
        print("congrats", end="")
    sys.exit()


def triesover():
    print("TOO MANY TRIES, SORRY!")
    
main()
                    
