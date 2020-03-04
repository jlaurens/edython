#-------------------------------------------------------------------------------
# Name:       Maths Quiz
# Purpose:    Tutoral
# Created:     23/02/2016
# Copyright:   (c) teachyourselfpython.com 2016

#-------------------------------------------------------------------------------
def quiz():
   import random
   import csv 

   
   score=0
   answer=0
   operators=("x", "+", "-")
   valid_name=False
   found_number=False
   numbers="123456789"


   #Test score file - connecting (w = write - this simply creates a scores text file)
   #myFile=open("scores.txt","w")
   #a = append. (add scores to - rather than over write what is already there)
   with open("scores.txt","a") as f: 
      
  
   
   

     
      while valid_name==False:
        
         found_number=False
         name=input("Hi there, what is your name?: ")

      
         for i in name:
        
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


      for i in range(3):
         
          num1=random.randint(5,10)
          num2=random.randint(1,5)
       
          operator=random.choice(operators)

      
          if operator=="+":
               answer=num1+num2
          elif operator=="-":
              answer=num1-num2
          elif operator=="x":
              answer=num1*num2

          print('What is ' + str(num1)+operator+str(num2))
          user_answer=int(input("Enter Answer: "))

     
          if user_answer==answer:
              print("That's Right")
      
              score=score+1
          else:
                  print("Not quite, sorry! The answer was: " + str(answer))
                  score=score
      print("Well done:>" + name + "...Your Score was: " + str(score))


   with open("scores.txt","a") as f:
         #Open the file in append mode, and write to the file the name and score of student
         f.write(name+ "," + str(score)+ "
") 
     

   

quiz()

   
                    
