#This is a comment

total = 0; #This is a global variable.
# ‘sum’ is the name of a function
def sum( arg1, arg2 ):
   # Add both the parameters and return them."
   total = arg1 + arg2; # Here, total is a local variable.
   print ("Inside the function local total : ", total)
   return total;

# Here we are calling the sum function with two parameters.
sum( 10, 20 );
print ("Outside the function global total : ", total)
#the output will be Global total = 0 and Local total = 30
                    
