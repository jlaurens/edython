#Solution 1
print("******* Using Simple Sequence*******")
print(1,2,3,4,5)
print(1,2,3,4,5)
print(1,2,3,4,5)
print(1,2,3,4,5)
print(1,2,3,4,5)

print()

print("******* Using multiple For Loops***********")

for i in range(1,6):
    print(i, end=" ")
print()
for i in range(1,6):
    print(i, end=" ")
print()
for i in range(1,6):
    print(i, end=" ")
print()
for i in range(1,6):
    print(i, end=" ")
print()
for i in range(1,6):
    print(i, end=" ")
print()
print()

print("******* Elegant Solution: Using just 2 For loops (nested)***********")
#I want to print the for loop below (which prints 0,1,2,3,4,5) five times.
#I need another for loop that iterates from 1 - 5

for i in range(1,6):
    for i in range(1,6):
        print(i, end=" ")
    print() #the indentation of this print() break is important
    #if it indented to the left it would be out of the loop and produce a horizontal line
    #if indented more to the right it would produce a vertical line (because it would be part of the second for loop - indenting each of the 5 times within the nested loop)
    
print()

print("******* Using Nested Loops - better variable names***********")

for row in range(1,6):
    for column in range(1,6):
        print(column, end=" ")
    print()
   
    
    
                    
