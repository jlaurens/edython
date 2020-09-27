#To get integer input or to work with integers which are accepted as input, you need to convert the user's answer into integer like so:

#this will accept age, but it will not be in integer format
age1=input("Please Enter Age 1:")

#instead do this

age2=int(input("Please Enter Age 2:")) #don't forget the double brackets at the end
#you can test to see it is an integer like so:
double_age=age2*2
print("Age 2 is an integer so it will multiply just fine:", double_age)

#On the other hand, if you try to work with age1 as an integer, it will throw up an error:
willthiswork=age1*age1
print(willthiswork)
                    
