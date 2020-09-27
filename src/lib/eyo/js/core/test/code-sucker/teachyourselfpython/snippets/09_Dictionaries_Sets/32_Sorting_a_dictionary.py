import operator
def main():
    #create a dictionary to store teacher's details - such as their subject, hobby, school house, and more
    d={"005":"David","002":"Xaiver","004":"Albert","001":"Christopher","003":"Bobby"}

    #Sorting by Keys
    d_sorted=sorted(d.items(),key=operator.itemgetter(0),reverse=False)
    print(d_sorted)

    print()

    #Sorting by  Values
    d_sorted=sorted(d.items(),key=operator.itemgetter(1),reverse=False)
    print(d_sorted)

   

main()
                    
