#Task 9c

#For loops are often used (instead of WHILE Loops) when you KNOW the number of iterations you wish to use.
#A times table program is ideal (i.e. do your times table up to 10x)
#For loops are called "COUNT CONTROLLED LOOPS", where as WHILE LOOPS are condition controlled

#TASK: Ask the user to input any number
#Create a times table program for the number they enter.
#For instance, if they enter 3, produce a program, like below, for the number 3

def main():
    number=int(input("Enter a number : "))
    
    for i in range(0,21):
        print(number,"times:", i, "is equal to:", i*number)        
        
main()


                    
