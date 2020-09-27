#Note if you just read in lines, without stripping as shown below, it will add a blank space between printing lines, which is not desired.

f=open("teacherbook.txt","r") #opens file with the name of teacherbook.txt

#print(f.readlines()) - Note: readlines as opposed to readline, is a method that reads all the lines in a file and returns it as a list!

#Lists are familiar things, so we can simply iterate over the list of lines as shown below:

for line in f.readlines():
        print("Line:" + line.strip())

"""
In actuality, you don't even have to call readlines()
-this is because Python assumes that if you try to loop through a file with a loop, you want it line by line.
Hence, you could just use this:

for line in f():
        print("Line:" + line.strip())
        
"""
                    
