print("******* Triangular Planetary alignment***********")

#1
#12
#123
#1234
#12345

#Note: The outside loop must begin with 1, then go to 2,3,4 and finally 5.
#The range needs to change -not a fixed number
#The range is i (which starts at 0) and then i + 1
print("******Final Solution:*****")

for row in range(6):
    for column in range(row+1):
            print(column,end=",")
    #this print prints a blank line to move to the next row
    print()
                    
