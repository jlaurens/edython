import string

# Use a list of lists to hold the information
phoneList = [['Billy Bob Jones', '651-405-2345'],
             ['Xavier Brown', '763-506-6789'],
             ['Sue Smith', '612-789-0011']]


# Create a dictionary to allow for sorting
phoneDict = {}
for person in phoneList:
    names = string.split(person[0])
    lastName = names[-1]
    phoneDict[lastName] = person # Use last name as the dictionary key
# Sort the dictionary keys
nameKeys = phoneDict.keys()
nameKeys.sort()
# Now print the list sorted by last name
print ("%-20s  Number" % 'Name')
print ("="*34)
for lastName in nameKeys:
    name = phoneDict[lastName][0]
    number = phoneDict[lastName][1]
    print ("%-20s  %s" % (name, number))
                    
