#Note: This covers the creation of a class, attributes and methods - all will be done in detail as we go along
""" =======TASK===========
1. Add additional variables (attributes) (info needed as input for each student) such as Special Interest (e.g. singing, chess, football), attendance %, No.of Merits)
2. create two more student objects (student3 and student4) and update the code to ensuer student1 and student2 are created with the right information as well
3. Create a method that displays the attendance in % for any given student
4. Create a method that displays the average attendance for all existing students

"""

class Student: #creates a class called Student
    studentCount=0 #sets the count of students variable to 0

    def __init__(self, name, form): #method in the class - which defines all the essential information needed
        self.name=name
        self.form=form
        Student.studentCount+=1

    def displayCount(self): #method inside the Student class that counts all the students that exist
        print("Total Students:",Student.studentCount)

    def displayStudent(self): #method that prints the student, and their corresponding information
        print("=Name:",self.name,"=Form:",self.form)
    


student1=Student("Ruth","9F") #creates an instance of the Student class called student1, gives values to the needed paramaters
student2=Student("Jonathan","9R") #does the same for student2
student1.displayStudent() #calls the displayStudent() method for student1 (this will print info for student 1)
student2.displayStudent() #does the same as above for student2
print("Total Students:",Student.studentCount) #prints the class method studentCount (keeps count of all students)


              
                    
