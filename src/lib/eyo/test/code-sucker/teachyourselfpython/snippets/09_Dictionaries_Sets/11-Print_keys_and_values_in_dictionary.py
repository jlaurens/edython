def main():
    #create a dictionary to store teachers and the subject they teach
    d={"Name": "Mr Moose","Subject": "Philosophy","Hobby":"Chess","School House":"Red House"}

    #using a for loop to iterate over a dictionary and print both keys and values
    for key,value in d.items():
        print("This is the key:",key,"..and this is the value:",value)


    print()
    print()
    #but a very simple solution as shown below can also be used to print all the keys and values

    print(d.items())
    
main()
                    
