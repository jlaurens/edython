def main():
    #create a dictionary to store teachers and the subject they teach
    teacher_details={"Mr Moose":"Philosophy","Mrs Snib":"Computing"}
    print(teacher_details)

    teacher=input("Which teacher are you after?:")
    if teacher in teacher_details:
        print(teacher, "teaches:", teacher_details[teacher])
        

main()
                    
