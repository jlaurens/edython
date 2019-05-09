def main():
    #create a dictionary to store teachers and the subject they teach
    teacher_details={"Name": "Mr Moose","Subject": "Philosophy","Hobby":"Chess","School House":"Red House"}

    #DELETE A KEY VALUE PAIR WITH THE DEL OPERATOR

    del teacher_details["Name"]
    print(teacher_details)

    print()
    print()

    #REMOVE ALL ENTRIES IN DICTIONARY
    teacher_details.clear()

    #DELETE ENTIRE DICTIONARY
    del teacher_details

    
main()
                    
