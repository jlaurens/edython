#demonstration of ELIF

def main():
    password=input("Please enter your password::")
    if password=="student":
        student()
    elif password=="teacher":
        teacher()
    elif password=="headmaster":
        headmaster()
    else:
        print("incorrect password. We cannot take you any further, goodbye!")


def student():
    print("****WELCOME STUDENT****")

def teacher():
    print("****WELCOME TEACHER****")

def headmaster():
    print("****WELCOME HEADMASTER****")

main()
                    
