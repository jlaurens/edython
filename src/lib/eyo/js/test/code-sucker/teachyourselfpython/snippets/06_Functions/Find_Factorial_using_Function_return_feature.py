def main():
    x=int(input("Enter a number you would like to find a factorial for:>>"))
    print (fact(x))

def fact(x):
    if x == 0:
        return 1
    return x * fact(x - 1)

main()

                    
