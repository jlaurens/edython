print("***CAN YOU SURVIVE?****")
print("Type 'o' to list starting objects......")

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

userinput = input("....So, here you are! What now? : ")


if userinput == "o":
    print("Here are a list of starting objects: ", objects)
    
                    
