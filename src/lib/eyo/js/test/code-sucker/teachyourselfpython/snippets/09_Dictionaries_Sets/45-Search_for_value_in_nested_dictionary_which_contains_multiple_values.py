def main():
    hobby=input("Enter a hobby, and we'll tell you which teacher's hobby it is:")

#This allows you to search for a value in a nested dictionary (in other words in a 'value' that contains multiple 'values' as tuples or a list
    
    d = {'Mr Moose':("001","Philosophy","Red House","Chess"),"Mrs Computing":("002","Blue House","Piano")}
    for i in d.keys(): #reaching the keys of dict
        for x in d[i]: #reaching every element in tuples (which are the 'value' of the dictionary)
            if x==hobby: #if match found..
                print ("{} is the teacher that plays {}.".format(i,x)) #printing it..

main()
                    
