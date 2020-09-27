def main():
    #create a dictionary to store teachers and the subject they teach
    d={"Name": "Mr Moose","Subject": "Philosophy","Hobby":"Chess","School House":"Red House"}

    #using a for loop to iterate over a dictionary and print the values (as opposed to the keys)
    for value in d.values():
        print(value)


    print()
    print()
    #but a very simple solution as shown below can also be used to print all the keys

    print(d.values())
    
main()
                    
