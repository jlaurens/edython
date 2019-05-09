which_one = int(input("What subject? (1-12)? "))
subjects = ['Biology', 'Chemistry', 'Physics', 'Maths', 'Computing', 'English']
#add another list for teachers
teacher =['Mrs Cool', 'Mr Boring', 'Miss Mouse', 'Mr Hothead', 'Mrs Clever']
if 1 <= which_one <= 5:
    #add something to make the corresponding teacher show up!
    print("The subject is", subjects[which_one - 1], "and the teacher is:", teacher[which_one - 1])
subjects.append("Quantum Physics")
teacher.append("Mr Wonderful")
print(subjects)
print(teacher)
                    
