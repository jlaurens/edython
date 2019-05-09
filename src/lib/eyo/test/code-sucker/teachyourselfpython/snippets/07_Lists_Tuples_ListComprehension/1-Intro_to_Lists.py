#Task 1

#https://repl.it/IyKS/0

#Create another list called answers
#Populate the list with the following values = "yes", "Yes", "YES", "always", "of course", "absoultely", "I do"
#Once the user has enquired succesfully about a course that DOES Exist,
#jump to a new function to ask them for their name
#Then ask them the question: "Do you always do your homework?"
#If they answer anything from the above "answers" list, then print their name and "You are welcome on our course"
#else: print their name and "We reserve judgement about letting you on our course. HW is important"

subjects=["Computing","Maths","History"]
answers=["yes","YES","Yes", "absolutely","ofcourse", "of course", "always", "I do"]


def main():
  course=input("Hello, what course are you finding out about?:")
  if course in subjects:
    print("We still have spaces on the: ", course, "course.")
    askname()
  else:
    print("Sorry, we do not run that course")

def askname():
   name=input("So, please could you tell us your name?:")
   print("Thank you")
   hw=input("Do you always do your homework?")
   if hw in answers:
      print(name, "....we would be very pleased to have you on our course")
   else:
      print("I'm sorry,", name, "...but hw is important, and therefore we reserve judgement about your entry to our course")


   
   
main()
                    
