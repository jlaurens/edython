#solution to modulo arithemetic magic using lists

days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

enterday=input("Enter day of week:")
enternumber=input("Enter no. of days:")
day_number = days.index(enterday)
offset = enternumber
print(days[(day_number + int(offset)) % 7])
# Thursday
                    
