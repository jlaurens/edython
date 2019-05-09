print("******* Similar Planets on same row***********")
#11111
#22222
#33333
#44444
#55555


#Solving thte problem using plain sequence
print("****Using Sequence*********")
print("1,1,1,1,1")
print("2,2,2,2,2")
print("3,3,3,3,3")
print("4,4,4,4,4")
print("5,5,5,5,5")
print()



print("******Using Iteration Attempt #1 *****")

#the outside loop controls the row count
#the inside loop controls the column count

for row in range(1,6):
    for column in range(1,6):
        print(column,end=",")
    print()
print()
print("******Note: What are the outside & inside loops doing?*****")

#the outside loop controls the row count (produces the number of rows, in this case just 2)
#the inside loop controls the column count (number of columns produced)
#Change the values to get it to produce the desired outcome

for row in range(1,3):
    for column in range(1,9):
        print(row,end=",")
    print()
    

print()
print("******Final Solution: Using Iteration(Loops)*****")

#the outside loop controls the row count
#the inside loop controls the column count

for row in range(1,6):
    for column in range(1,6):
        print(row,end=",")
    print()
                    
