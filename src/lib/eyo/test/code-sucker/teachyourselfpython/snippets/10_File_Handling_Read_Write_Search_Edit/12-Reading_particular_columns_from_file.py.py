
#Suppose we have a file in the below format, and only want to retrieve the list of subjects. How can we do this?
"""
Mr Moose : Maths
Mr Goose: History
Mrs Congenelipilling: English
"""
alldata=[]
col_num=0
teacher_names=[]
delimiter=":"

with open("teacherbook.txt") as f:
      for line in f.readlines():
            alldata.append((line.strip()))

      print(alldata) #this prints all the data from the file which is now held in a list called 'alldata'         

      print()
      print()

      for x in alldata: #for every element in the list (Mr Moose:Maths, is 1 element)
            print("x: ",x) #this just demonstrates that x is indeed what is stated above
            teacher_names.append(x.split(delimiter)[col_num]) #split x by the given delimiter and column no, and append it to the list
print()
print()
print(teacher_names) #print the list that consists of just teacher names!




                    
