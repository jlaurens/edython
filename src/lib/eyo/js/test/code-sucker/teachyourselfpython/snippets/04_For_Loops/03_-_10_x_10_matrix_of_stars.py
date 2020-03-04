#Incorrect Solution - Hint: where should the 'print()' go?
print("Solution - nearly but not quite:")
for i in range(10):
        for j in range(10):
                print("*", end="")
#the print here is outside the for loop (j) in line with the first loop
print()

    
    
print()

print("Correct Solution")

for i in range(10):
        for j in range(10):
                print("*", end="")
        print()
        #note the correct indentation of the print() command
        #play around with different indentations to see what happens.
        #Understanding how a command can be in or out of a loop is key!

                    
