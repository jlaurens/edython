
#num1 and num2 are GLOBAL variables
num1 = 10;
num2 = 20;

def test1():
   #num3 is a LOCAL variable, declared inside function 'test1' only
   num3=30;
   totalscore = num1+num2+num3; 
   print (totalscore)


def test2():
   totalscore=num1+num2+num3
   print(totalscore)
   return totalscore;

#Call the functions test1 and test2. Can you predict the output?
                    
