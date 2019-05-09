#What happens when you use the "+" operator to add strings or mixed data types?

a = 'This is a string such as www.teachyourselfpython.com'
b = "Boo - another string!"
c = a + b
print (c)
#d = c + 10
# you cannot concatenate a string and an integer
# The solution is to convert the integer to a string first, like so:
d = c + str(10)
print (d)
                    
