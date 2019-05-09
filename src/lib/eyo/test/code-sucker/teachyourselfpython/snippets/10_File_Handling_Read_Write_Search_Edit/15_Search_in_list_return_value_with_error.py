#A COMMON ERROR is leaving in blank spaces and then finding you cannot work with the data in the way you want!

"""Try the following program with the input: Mr Moose
...it doesn't work..........
but if you try "Mr Moose " (that is a space after Moose..."), it will work!
So how to remove that space from the list entry (that is how do we strip not just the new lines but the leading and trailing blank spaces?
Note: We would want the spaces in between words -Mr Moose - to remain!
"""

alldata=[]
col_num=0
teacher_names=[]
delimiter=":"

with open("teacherbook.txt") as f:
      for line in f.readlines():
            alldata.append((line.strip()))
      print(alldata)
              

      print()
      print()

      for x in alldata: 
             teacher_names.append(x.split(delimiter)[col_num]) 

      teacher=input("Enter teacher you are looking for:")
      if teacher in teacher_names: 
            print("found")
      else:
            print("No")



                    
