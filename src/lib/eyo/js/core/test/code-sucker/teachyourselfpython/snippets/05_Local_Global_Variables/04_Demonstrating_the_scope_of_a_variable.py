#  program demonstrating the scope of a variable
# (i.e. where it can be used)

def my_function(n):
    print("n in function: ",n)
    print("number in function: ",number)

number = 10
print("number in main program: ",number)
my_function(number)
#print(n)

# Uncomment the line above and try to run.
# You will get an error, because....
# n is not known outside of the function my_function.
# Notice however that number is known in the function
# as well as in the main program!
# We say that number has global scope, but n has local scope.
# Local scope means the variable is only available
# in the function where it is defined
# Global scope means the variable is available everywhere in the code.



#example from: http://www.annedawson.net/Python3Programs.txt
                    
