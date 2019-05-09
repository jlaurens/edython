import csv #assuming the file is in csv format, import csv

#Task: Search for a teacher, and return the subject they teach
"""File contents
Mr A : Maths
Mr B: History
Mr C: Computing
"""

def main():
      #open the file
      with open("teacherbook1.csv", "r") as teacherfile:
            teacher=input("Enter teacher you are looking for:")
            teacherfileReader=csv.reader(teacherfile)
            for row in teacherfileReader:
                  for field in row:
                        if field==teacher:
                              print("That teacher's subject is:", row[1])
                              break
                        
                        
      main()



main()





                    
