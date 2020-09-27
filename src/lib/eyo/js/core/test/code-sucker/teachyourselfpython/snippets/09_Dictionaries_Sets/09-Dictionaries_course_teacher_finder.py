#TASK: Create a course-teacher program
#---1-create a dictionary that stores the names of three teachers and three courses
#---2-go straight to a login screen, where a user is asked: "What course are you doing?"
#---3 -the program responds by telling them which wonderful teacher they will have for that particular course

#EXTENSION: Create a main menu which allows a user to select STUDENT or TEACHER
#if STUDENT _ go to the login screen (as above, where they are asked for a course name, and a teacher is returned)
#ifTEACHER  _go to a teacher screen where additional courses and teachers can be added to the program

teachers_courses={"Computing":"Mrs Curious Egg","History":"Mr Knowitall Feather","Maths":"Mr CalcConfetti Purpose Esquire"}

def main():
   mainmenu()


def mainmenu():
   print("****MAIN MENU****")
   print("=======Press S if you are a STUDENT :")
   print("=======Press T if you are a TEACHER :")
   choice1=input()
   if choice1=="s" or choice1=="S":
      checkcourse()
   elif choice1=="T" or choice1=="t":
      addteachers()
   else:
      print("please make a valid selection")

def checkcourse():
   print("*****STUDENT -Find out what teacher you will have this year******")
   course=input("What course/subject are you studying?: ")
   
   print("Your teacher will be: ", teachers_courses[course])
   
   

def addteachers():
   print("*****REGISTRATION****")
   course=input("Enter a course")
   teacher=input("Enter the name of the teacher teaching this course:")
   teachers_courses[course]=teacher #this adds a teacher and course key value pair to the existing dictionary
   answer=input("Do you want to make another addition?")
   if answer=="y":
     addteachers()
   else:
      print_course_details()

def print_course_details():
   print(teachers_courses) #note that a dictionary does not store the items in any particular sorted order
   #****CAN ALSO BE PRINTED OUT USING A FOR LOOP BELOW
   #for k, v in usernames_passwords.items():
      #print(k,v)
main()
                    
