def main():
    guess=input("Enter Guess:")
    PASSWORD="open123"
    if is_correct(guess,PASSWORD):
        print("yes")
    else:
        print("no")
    main()
    

def is_correct(guess,PASSWORD):
    if guess==PASSWORD:
        return True
    
    


main()
                    
