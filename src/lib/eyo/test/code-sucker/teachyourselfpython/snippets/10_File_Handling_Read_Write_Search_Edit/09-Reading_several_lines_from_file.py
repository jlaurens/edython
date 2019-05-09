#NOTE WE ARE USING READLINE instead of just READ

f=open("teacherbook.txt","r") #opens file with the name of teacherbook.txt

#again, this does the same thing as it would do for reading characters. Python just reads the first line and then picks up where it left off,
#and goes on to read the second line and so on..
"""
print(f.readline()) 
print(f.readline()) 
print(f.readline())
"""
#of course it would be much easier to use a loop to acheive this, in much the same way we did for retrieving each character from the file

next=f.readline()
while next !="":
        print(next)
        next=f.readline()
        
        
                    
