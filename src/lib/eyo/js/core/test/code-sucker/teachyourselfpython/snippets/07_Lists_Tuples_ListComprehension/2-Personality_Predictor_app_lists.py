#demonstration of the use of lists and the append feature (adding to a list)

from time import sleep #this allows you to use features associated with time - like the time delay effect below

#TASK - add to this code to make the personality predictor program ask more questions and give more interesting, insightful answers that are added to the list

def main():
   fortune=[]
   print("*****THE PERSONALITY PREDICTOR!***************")
   sleep(1.0) #this just produces a delay effect in printing the text
   name=input("......First, type in your name:")
   fortune.append(name)
   q1=input("..........Do you like mooses?")
   if q1=="yes" or q1=="Yes":
      fortune.append("You are adventurous and exotic")
   else:
      fortune.append("You are rather reserved, but wise")
   q2=input("Have you been to egypt?")
   if q2=="yes" or q2=="Yes":
      fortune.append("...and you love to travel and experience new things")
   else:
      fortune.append("....you are reluctant to travel")
      
   print("*********YOUR PERSONALITY REVEALED:**************")
   print(fortune[0],fortune[1],fortune[2],".......to conclude: you are an incredibly interesting person and it's been fun chatting!")

main()
                    
