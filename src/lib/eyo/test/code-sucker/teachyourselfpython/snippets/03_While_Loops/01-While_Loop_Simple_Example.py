#This uses a while loop to produce the 2 times table

def main():
   using_a_while_loop()
   using_a_for_loop()

def  using_a_while_loop():
   print("Using a While Loop")
   i=1
   while i < 11:
      number=2
      print(i*number)
      i =i+1
      
#This uses a for loop to produce the 2 times table      
def  using_a_for_loop():
   print("Using a For Loop to do the same thing")
  
   for i in range(1,11):
      number=2
      print(i*number)
      #i =i+1 #this is not needed as the for loop automatically goes up in the range

main()


                    
