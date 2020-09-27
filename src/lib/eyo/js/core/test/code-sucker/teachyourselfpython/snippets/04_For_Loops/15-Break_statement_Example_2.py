#set a flag to false
found=False #this is the initial assumption

for x in range(0,11):
    #if x is equal to 5 then set the found flag to True and exit the loop!
    if x == 5:
        found=True
        break #this exits the loop
    else: #if 5 is not found, then continue and print all values for x
        print(x)
    
                    
