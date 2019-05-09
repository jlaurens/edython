#Example of passing parameters

def values_change ( mylist ):
   "This changes a passed list into this function"
   mylist.append([1,2,3,4]);
   print ("Values inside the function: ", mylist)
   return

# Now you can call values_change function
mylist = [10,20,30];
values_change( mylist );
print( "Values outside the function: ", mylist)
                    
