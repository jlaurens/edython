f=open("teacherbook.txt","r") #opens file with the name of teacherbook.txt
print(f.read(1))
print(f.read(1))
print(f.read(1))
print(f.read(1))
print(f.read(1))
print(f.read(1))
print(f.read(1))
print(f.read(1))

#Doing the above would print the first few characters "M-r-M-o-o-s-e", even though you have put in a 1 for the argument - this is beacuse Python is clever enough to know to go to the next character each time

#A better way of doing the above is to use a for loop ...this would obviouisly be a little ardous!



                    
