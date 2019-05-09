def main():

    email=input("Enter email address:")
    if email.startswith("@"):
        print("Sorry, an email cannot start with the @ sign")
    else:
        print("Thanks for your email address") #this is obviously not perfect validation!


main()
                    
