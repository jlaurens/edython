#THINGS WITH STRINGS
#Formatting strings -making stuff look good!

#We are going to format strings using a method of the string class called format

print("The {} who say {}!".format("mooses", "hi"))
#it looks through the brackets and looks to see what you are passing as an argument


#Doing things with numbers - whatever you put in the brackets, is added in the curly brackets
print("I ate {} {}!".format(50,"mooses"))


#You can also specify spaces (like nine below between the strings
print("I ate {0:9} {1:9}!".format(50,"mooses"))
    
#Rounding to three decimal points
print("I ate {0:5.3f} {1}!".format(50,"mooses"))

#to print the number, then the square and then the cube
for i in range(1,11):
    print("{} {} {}".format(i,i*i,i*i*i))

#formatting: highest number is 10 for thefirst number - so format to two
    #second number - highest is 100. so format to 3d, and the last one
    #the highest number is 1000. 
for i in range(1,11):
    print("{:2d} {:3d} {:4d}".format(i,i*i,i*i*i))

                    
