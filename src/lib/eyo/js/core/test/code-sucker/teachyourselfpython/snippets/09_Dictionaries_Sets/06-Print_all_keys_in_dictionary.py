def main():
    #create a dictionary to store teachers and the subject they teach
    d={"Name": "Mr Moose","Subject": "Philosophy","Hobby":"Chess","School House":"Red House"}

    #no method is needed to iterate over a dictionary - you can just do this:

    for key in d:
        print(key)


    print()
    print()
    #but a very simple solution as shown below can also be used to print all the keys

    print(d.keys())
    
main()
                    
