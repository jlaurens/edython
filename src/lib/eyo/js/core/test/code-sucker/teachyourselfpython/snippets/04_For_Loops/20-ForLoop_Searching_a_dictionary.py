print("*****Looping through and searching a dictionary*****")


data = ['Obed', 'Jesse', 'David', 'Solomon']

#search = 'c'
search=input("Who are you searching for?")

for name in data:
    if name == search:
        print ("Found it!", name)
        break
# Prints: Found it! ['a', 'c']
                    
