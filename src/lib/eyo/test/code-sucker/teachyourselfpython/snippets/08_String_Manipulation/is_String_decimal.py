while True: #this does whatever is inside the loop while unless it is told to exit the loop
    
    print("Enter your age")
    age=input()
    if age.isdecimal(): #if the the input entered is a DECIMAL, then exit the loop. 
        break
    print("Please enter only a whole number")
                    
