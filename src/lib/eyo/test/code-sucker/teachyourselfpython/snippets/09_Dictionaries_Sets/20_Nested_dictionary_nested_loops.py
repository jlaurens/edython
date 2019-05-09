# This program stores information about pets. For each pet,
#   we store the kind of animal, the owner's name, and
#   the breed.
pets = {'willie': {'kind': 'dog', 'owner': 'eric', 'vaccinated': True},
        'walter': {'kind': 'cockroach', 'owner': 'eric', 'vaccinated': False},
        'peso': {'kind': 'dog', 'owner': 'chloe', 'vaccinated': True},
        }

# Let's show all the information for each pet.
for pet_name, pet_information in pets.items():
    print("
Here is what I know about %s:" % pet_name.title())
    # Each animal's dictionary is in 'information'
    for key in pet_information:
        print(key + ": " + str(pet_information[key]))

#Example from www.introtopython.org
        
                    
