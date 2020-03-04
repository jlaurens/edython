#This is an example of RECURSION (a recursive function)
#Can you spot the recursion? (which line?)
#Can you write another recursive function to calculate the FACTORIAL of a number
#e.g. Factorial 5 = 120. (5 * 4 *3 * 2 * 1 = 120)   and Factorial 2 = 2 * 1 = 2 etc...

def mystery(n):
    if n == 1:
        return 1
    else:
        return n + mystery(n-1)
                    
