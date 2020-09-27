import sys
#TASK 4:
#Create a Main Menu Welcome screen: 1. P to Play Quiz 2. A - About the Quiz  3. Q to Quit
#Complete as many questions as you can, creating the pathway through the quiz


global score
score=0

def mainmenu():
          print("************MAIN MENU**************")
         


          choice = input("""
                      A: Press A to find out more about the Quiz
                      P: Press P to play the Quiz
                      Q: Press Q to Quit the program
             

                      Please enter your choice: """)

          if choice == "A" or choice =="a":
                  about()
          elif choice == "p" or choice =="P":
                  quiz(score)
          elif choice == "Q" or choice =="q":
                  quit()
          else:
                  print("You must only select either A,P or Q.")
                  print("Please try again")
                  menu()


def quiz(score):
               print("*****WELCOME TO THE QUIZ***************")
               print(".....ready to play?!")
               score=0
               print("********************************************************************************")
               answer1=input("Question 1: What is the last book of the Bible that also talks about the end of the world?")
               if answer1=="revelation" or answer1=="Revelation":
                         print("Correct")
                         score=score+1
                         print("Your score is:" + str(score))
                         question2(score)
               else:
                         print("Sorry, not quite!")
                         score=score-1
                         quiz(score)
                         

def question2(score):
          answer2=int(input("Genesis is book number: ..................?"))
          if answer2==1:
                    print("Correct")
                    score=score+1
                    print("Your score is:" + str(score))
                    question3(score)
          else:
                    print("Sorry, back to the start for you!")
          quiz(score)


def question3(score):
          answer2=input("The whole old testament is really leading up to the coming of ......?")
          if answer2=="Jesus" or answer2=="the messiah":
                    print("Correct")
                    score=score+1

                    print("Your score is:" + str(score))
                    print("And that's it.....well done! You're done")
                    sys.exit()
          else:
                    print("Sorry, back to the start for you!")
          quiz(score)
          

          
def about():
          print("About the quiz")
          print("This quiz is going to have 3 questions and will be on the Bible")
          print("********************************************************************************")
          
          

def quit():
          print("Sorry to see you go ....Goodbye!")
          sys.exit()
mainmenu()

                    
