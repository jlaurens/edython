#What is going to happen here? Can you spot the recursion?
#Call it with 5 - it will work
#Call it with 120 - it crashes. Why!?
#Call it with 6 - it crashes! Why? 

def moose(n):
    if n==5:
        return 1
    else:
        return moose(n+1)
    
                    
