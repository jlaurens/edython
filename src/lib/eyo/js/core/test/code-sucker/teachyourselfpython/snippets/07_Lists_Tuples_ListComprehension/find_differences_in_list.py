#if list 1 has any differences from list 2, print them!
#This will help Mr Moose identify any errors, as List 2 is his FINAL LIST

list1 = [99, 82, 83, 44]
list2 = [99, 22,83,44]
print(list(set(list1) - set(list2)))
                    
