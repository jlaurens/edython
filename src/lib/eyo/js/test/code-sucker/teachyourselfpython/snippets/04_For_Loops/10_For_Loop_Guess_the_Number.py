def main():
    secretnumber= int(input("I'm thinking of a number from 1 - 10, can you guess what it is?: "))
    attempts=0
    for _ in range(0,10):
        if secretnumber ==7:
            print("Well done! You guessed the number in ",attempts+1," attempt[s]!")
            break
        else:  # Here only if guess != *is not equal to* password. You don't need to explain the condition again
            print("Try again!")
            attempts += 1 # if somebody gets the password wrong the try again string prints 8 times
            #        ^    ^ You need comment, ''' means string
            #        ^ syntax to increase by 1
        secretnumber = int(input("Enter a guess again:"))  # Ask user for new password each time the user gets it wrong

main()
                    
