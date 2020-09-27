f=open("teacherbook.txt","r") #opens file with the name of teacherbook.txt
next=f.read(1) #set a variable called next to read the next character 
while next !="": #while the variable next is NOT equal to blank.....(in other words, while something is there to get...continue with loop!)
        print(next) #print the character
        next=f.read(1) #increment, which means, keep going with reading the next single character....until condition of the while loop is met.
        




                    
