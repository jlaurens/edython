#-------------------------------------------------------------------------------
# Name:       Maths Quiz
# Purpose:    Tutoral
# Author:     teachingcomputing.com
# Created:     23/02/2016
# Copyright:   (c) teachingcomputing.com 2016

#-------------------------------------------------------------------------------
""" File Structure
scores.txt
===========
user1,1
user2,3
user3,1

"""
import random

#identifying the variables we will be using
score=0
answer=0
operators=("x", "+", "-")
#Add a variable for valid_name set to Boolean value 'false' by default
valid_name=False
#Add a variable to be used in validation of the name (not to include numbers)
found_number=False
numbers="123456789"

#Ask for name
#While valid_name is false...then ask the user for their name
while valid_name==False:
   #the variable found_number needs to be initialised to FALSE at the start of the loop
   found_number=False
   name=input("Hi there, what is your name?: ")

#for every character in the name entered
   for i in name:
   #...and for every character in name (i) that is equal to a number in numbers
      for u in numbers:
         if i==u:
            found_number=True

   if found_number==True:
         valid_name=False
         print("Invalid Name - Try again, without any numbers")
         
   elif found_number==False:
         valid_name=True
         break

print("Great...let's start the quiz")
print("*********************************************")

#Randomly generate the numbers and operators we will be using in this Maths Quiz
#Let's say we only need to ask 5 questions
#The For in in range loop will tell us how many times to repeat the program

for i in range(3):
    #variable num is equal to a random number between 5 and 10
    num1=random.randint(5,10)
    #this will generate a random number between 1 and 5
    num2=random.randint(1,5)
    #select an operator of choice
    operator=random.choice(operators)

#Now we need to calculate the answer! For that, we need to know which operator is being used
    if operator=="+":
         answer=num1+num2
    elif operator=="-":
        answer=num1-num2
    elif operator=="x":
        answer=num1*num2

#Creating the question (randomlly generated) and create user's input
#remember the lines to follow should be indented to be IN the above for loop
    print('What is ' + str(num1)+operator+str(num2))
    user_answer=int(input("Enter Answer: "))

#This section allows for the user's response
    if user_answer==answer:
        print("That's Right")
        #increment (add 1) to the score if it is right
        score=score+1
    else:
            print("Not quite, sorry! The answer was: " + str(answer))
            score=score
print("Well done:>" + name + "...Your Score was: " + str(score))
                    
