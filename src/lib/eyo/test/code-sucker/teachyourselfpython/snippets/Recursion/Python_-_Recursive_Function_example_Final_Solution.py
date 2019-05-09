#We've nearly fixed the problem.
#Try calling the function with 120 (it will work!)
#Now call it with the value 5 (for n) - it will not work! Why?

def moose(n):
    if n==1: #the base case needs to be 1, as it is going down by 1
        return 1
    else:
        return n + moose(n-1) #here n is decrementing in order to reach the base case
                    
