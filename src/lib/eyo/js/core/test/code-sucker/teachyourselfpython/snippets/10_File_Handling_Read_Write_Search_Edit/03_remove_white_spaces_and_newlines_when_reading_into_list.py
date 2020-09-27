#ALTERNATIVE METHOD that does not use f.readlines()

"""
 f.readlines() does not handle the 
 occurrences
We can simply iterate through the file object to get each line, this will give us
each line with the 
 characters already stripped, and is the more pythonic implementation
for this use case. As such, we can use the following solution with list comprehension;

"""
"""File contents
Mr Moose : Maths
Mr Goose: History
Mrs Cook: English

"""

alldata=[]
col_num=0
teacher_names=[]
delimiter=":"

def main():
      with open("teacherbook.txt") as f:
            #getting each line with 
 stripped and removing the blank spaces
            alldata = [':'.join([value.strip() for value in line.split(':')]) 
               for line in f]
            print(alldata)

            print()
            print()

            for x in alldata: 
                   teacher_names.append(x.split(delimiter)[col_num].strip()) 


            teacher=input("Enter teacher you are looking for:")
            if teacher in teacher_names: 
                  print("Yes, that teacher exists")
            else:
                  print("Nope, not found")

main()
                    
