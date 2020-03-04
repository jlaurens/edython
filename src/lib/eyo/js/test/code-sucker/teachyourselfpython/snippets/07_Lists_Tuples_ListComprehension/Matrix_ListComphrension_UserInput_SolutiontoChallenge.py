Matrix = [ [1,2,3],
           [4,5,6],
           [7,8,9] ]

userinput = int(input("Enter a Column in the Matrix:"))

column1 = [item[0] for item in Matrix]
column2 = [item[1] for item in Matrix]
column3 = [item[2] for item in Matrix]

if userinput == 1:
    print(column1)
else:
    if userinput == 2:
        print(column2)
    else:
        if userinput == 3:
            print(column3)
        
    
                    
