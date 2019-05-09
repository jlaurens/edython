import sys
#TASK 7
#Analyse the nature of the boolean flag, tries variable and WHILE LOOP USED BELOW
#CREATE a question inside of the quiz function. Give the user 2 tries to get the answer right, else out they go!
def main():
    tries=0 #this is a variable called tries set to start at 0 (initialised at zero)
    accessgranted=False #this is a boolean variable that is set to False. The other option is that it can be True!
    while accessgranted == False and tries<3: #while access granted is equal to False and the tries is less than 3....
        password=input("Enter Password to continue:")
        if password=="open123":
            print("Access Granted")
            accessgranted=True #if the password is right, then change this variable to TRUE and exit loop
            quiz()
        else:
            print("Denied")
            tries=tries+1 #for each time it is not true increase the variable 'tries' by +1
    if tries>=3: #finally, if tries is equal to or greater than 3, then kick the user off! They're an impostor!
        print("Sorry, you have exceeded the number of tries. Goodbye")

        
def  quiz():
    print("****************WELCOME***********************")
    print("The wonderful world of learning python awaits .....")
    
    tries=0
    question_correct=False

    while question_correct==False and tries<2:
        answer=input("What was the first name of the man who created Python?")
        if answer=="guido" or answer=="Guido":
            print("Whoop-Correct")
            questiontrue=False
            sys.exit()
        else:
            print("Ah.....nope.")
            tries=tries+1
            
    if tries>=2:
        print("...and that's it. Goodbye - there are consequences for getting things wrong!")
    


main()

                    
