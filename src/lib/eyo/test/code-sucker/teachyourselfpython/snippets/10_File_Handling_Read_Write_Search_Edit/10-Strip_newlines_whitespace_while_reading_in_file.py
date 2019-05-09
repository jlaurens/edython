#Note if you just read in lines, without stripping as shown below, it will add a blank space between printing lines, which is not desired.

f=open("teacherbook.txt","r") #opens file with the name of teacherbook.txt


next=f.readline()
while next !="":
        next=next.strip()
        print(next)
        next=f.readline()

#The code above strips each line before it prints it....and this prints all your text file lines one after the other - without any blank lines in between!
        
                    
