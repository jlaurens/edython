def main():
    #create a dictionary to store teacher's details - such as their subject, hobby, school house, and more
    d1={"Name": "Mr Moose","Subject": "Philosophy","Hobby":"Chess","School House":"Red House"}
    d2={"Name": "Mr Mendipnose","Subject": "Computing","Hobby":"Carpentry","School House":"Blue House"}

    d1.update(d2)
    print(d1) #note this will overwrite any values of the same key!

    print()
    print()

    d3={"Name": "Mr Moose","Subject": "Philosophy","Hobby":"Chess","School House":"Red House"}
    d4={"Salary": "40K","After-School_Job": "Web developer","Available on Sat?":"No"}

    d3.update(d4) #this adds new keys and values and appends it to the first dictionary (merge in action)
    print(d3)
        
main()
                    
