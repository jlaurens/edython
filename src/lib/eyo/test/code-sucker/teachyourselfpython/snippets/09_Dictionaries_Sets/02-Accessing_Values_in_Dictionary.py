def main():
    #create a dictionary to store teachers and the subject they teach
    teacher_details={"Name": "Mr Moose","Subject": "Philosophy","Hobby":"Chess","School House":"Red House"}
    print(teacher_details["Name"]) #this is getting at the specified key, and producing the value for that key
    print(teacher_details["Subject"])


    print()
    print()
    #a way of getting the key's value
    print(teacher_details.get("Name","none"))

    print()
    print()
    
    #Printing only the keys in a dictionary
    teacher_info=teacher_details.keys()
    print(teacher_info)
          
main()
                    
