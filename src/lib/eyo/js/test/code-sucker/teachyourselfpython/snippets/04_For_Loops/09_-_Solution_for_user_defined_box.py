def make_box():       
    size = int(input('Please enter a positive integer between 1 and 15: '))
    for i in range(size):
        if i == 0 or i == size - 1:
            print("*"*(size+2))
        else:
            print("*" + " "*size + "*")


make_box()
    
                    
