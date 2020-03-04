#create a dictionary to store teacher's details
d={"Name": "Mr Moose","Subject": "Philosophy","Hobby":"Chess","School House":"Red House"}

def main():
   key=input("Enter key you're searching for:")
   check_key(key)
   if check_key(key):
      print("yes")
   else:
      print("No")
      
def check_key(key):
   if d.get(key):
      return True
   else:
      return None
        
main()
                    
