
#create a dictionary to store teacher's details
d={"Name": "Mr Moose","Subject": "Philosophy","Hobby":"Chess","School House":"Red House"}

def main():
   key=input("Enter Key you are looking for:")
   if key in d:
       print("Yep, we have that key in the dictionary")
   else:
        print("Nope - doesn't exist in the dictionary, sorry!")
        
main()
                    
