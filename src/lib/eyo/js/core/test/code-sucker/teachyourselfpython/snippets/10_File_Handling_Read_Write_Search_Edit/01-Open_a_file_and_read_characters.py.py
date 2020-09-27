#Task: Write some code that will read the whole secret message from the file and display it on the screen
# The whole secret message is: "Put the contents of the secret message in the file here"

# Open a file
myfile = open("secretmessage.txt", "r+")
str = myfile.read(23)
print ("The first 10 characters of the stored secret message are : ", str)

# Check current position of the 'pointer' -it should be at 23
position = myfile.tell()
print ("Current file position : ", position)

# Reposition pointer at the beginning once again
position = myfile.seek(0, 0)
str = myfile.read(23)
print ("Again read String is : ", str)

# Close opened file <--- ALWAY REMEMBER TO CLOSE YOUR FILE! There is a more pythonic way to open and close files, which we'll come to later
myfile.close()
                    
