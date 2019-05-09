print("***CAN YOU SURVIVE?****")
print("""

[] Type 'o' to list starting objects
[] Type 'c' to list crafting rules
[] Type 'q' to be miserable and quit!

""")
#Use a dictionary to create an inventory of objects
objects = {
            "sharp_flint" : 50,

            "grass" : 100,
            "hay" : 0,

            "tree" : 500,
            "log" : 0,

            "Big rock" : 30,
            "Cut rock" : 0,

        }


#rules to craft new objects
craft = {
            "hay" : { "grass" : 1 },
            "axe" : { "log" : 1, "sharp_flint" : 1 },
}

            
#This little while statement allows for the user input question to be repeated indefinitely
while True:

    userinput = input("....So, here you are! What now? : ")
    if userinput == "o":
        print("***Here are a list of STARTING OBJECTS: ", objects)

    elif userinput == "c":
        print("***CRAFTING RULES..you'd better get started:", craft)

    elif userinput == "q":
            print("Good bye ....")
            break
    
    

    
    

                    
