#Decision using two conditions linked with and and or an or

age = input("Enter your age: ")
age = int(age)
have_own_car = input("Do you own your own car (y/n): ")

if (age > 21) and (have_own_car == 'y'):
    print ("You are over 21 years old and own your own car")
    
if (age > 21) and (have_own_car == 'n'):
    print ("You are over 21 years old and you do NOT own your own car")

if (age == 21) and (have_own_car == 'y'):
    print ("You are 21 years old and you own your own car")

if (age == 21) and (have_own_car == 'n'):
    print ("You are 21 years old and you DO NOT own your own car"    )

if (age < 21) and (have_own_car == 'y'):
    print ("You are younger than 21 and you own your own car")

if (age < 21) and (have_own_car == 'n'):
    print ("You are younger than 21 and you DO NOT own your own car"    )


salary = float(input("Enter your annual salary, (e.g. 50000): "))

if (salary > 50000) or (age > 21):
    print ("you can join our club because you earn more than $50000 OR you are over 21 (or both)")
else:
    print ("you need to be earning more than 50000 OR be over 21 (or both) to join our club")
    
    
#example from: http://www.annedawson.net/Python3Programs.txt
                    
