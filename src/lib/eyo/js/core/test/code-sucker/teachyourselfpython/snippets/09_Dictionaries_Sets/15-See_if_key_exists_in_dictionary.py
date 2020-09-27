
#create a dictionary to store teacher's details
d={"Name": "Mr Moose","Subject": "Philosophy","Hobby":"Chess","School House":"Red House"}

def main():
    key=input("Enter key you are looking for:")
    check_for_key(key)
    if check_for_key(key)==True: #if the function check_for_key returns True (You can also omit the 'True' check as it will do this by default
        print("The dictionary has that key")
    else:
        print("Sorry, that key does not exist in the dictionary")
    

def check_for_key(key):
    
    if key in d: #if the user required key IS in the dictionary, then this function will return True
        return True
        
main()
                    
