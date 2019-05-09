# This looks at what happens when you "mix" data types expressions
# mixed type expressions are "converted up"
# This (converted up) means that you are taking or using the data type with the greater storage
# float has greater storage (8 bytes) than a regular int (4 bytes)
print (2 + 4.0)
print (6 - 4.0)
print (6 * 3.0)
print (6 / 3.0)
print (6 % 3.0)
print (6 // 3.0) # floor division: always truncates fractional remainders
print (-5.0)
print (3**2.0)   # three to the power of 2                    
