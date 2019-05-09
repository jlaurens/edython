
#Suppose we have a file in the below format, and only want to retrieve the list of subjects. How can we do this?
"""
Mr Moose : Maths
Mr Goose: History
Mrs Congenelipilling: English
"""

f=open("teacherbook.txt","r") #opens file with the name of teacherbook.txt
mylist=[] #creates an empty list 
for line in f.readlines(): #for each line in the file
      mylist.append((line.strip())) #append the line to the list
print(mylist) #print the list
print(mylist[0]) #this will give you the first element in the list (the first teacher AND their taught subject)

#How can we get at just one set of data in this list, such as all the teacher's names:
teacher_names=[] #create a list called teacher_names
for x in mylist: #for every element in mylist (created above from the original file)
        teacher_names.append(x.split(":")[0]) #split the list at the ":", starting with the first part (i.e the name), and append to list
print(teacher_names) #print the new list
        
        



                    
