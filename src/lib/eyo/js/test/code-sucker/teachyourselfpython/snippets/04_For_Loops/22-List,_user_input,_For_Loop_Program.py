print ("**********Hello, welcome to the program***********")
print ("This program will ask you to enter the names of places you've been to")
print ("Before we get started, please enter the number of places you want to enter")
number = int(input("How many holidays have you had this year?: "))

print ("Thank you!")
print ("We'll now ask you to enter all the places you've traveled to: ")
places_traveled = [] #Empty list created to hold entered values

for i in range(number): #range(number) used because we want to limit number of inputs to user choice
       places = input("Enter Place:")
       places_traveled.append(places)

print (("Here's a list of places you've been to: 
"), places_traveled)

                    
