number = 1234.5678
print (number)
number = round(number,2)
print (number)
# the above line rounds the number to 2 decimal places

thousands = number / 1000
print (thousands)
thousands = int(thousands)
print (thousands)
remainder = number % 1000
print (remainder)
pretty_output = "$" + str(thousands) + "," + str(remainder)
print (pretty_output)                    
