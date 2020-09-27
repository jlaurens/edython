#This is an example of RECURSION (a recursive function)
#Can you spot the recursion? (which line?)
#What's wrong with this function?!
#How can you fix the problem!!! Every recursive function MUST HAVE A....?!?!? B___C___ or S______ C________

def moose(n):
    if n==10:
        return 1
    else:
        return n + moose(n-1)
                    
