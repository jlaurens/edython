def main():
    #Create an empty dictionary
    teacher={}
    
    #create a sequence of keys (USING TUPLES) that would be used to store teacher's details
    seq=('name','salary','subject')

    #create a dictionary from the sequence above
    teacher=dict.fromkeys(seq)
    print(str(dict))
    #........as of yet the dictionary does not have values
    
    #Add values to the dictionary
    teacher=dict.fromkeys(seq,10)
    print("New Dictionary with values:",teacher)
    #........this obviously doesn't make sense, as a teacher's name is unlikely to be all 10, but it illustrates the point!

    #Add multiple values to the the dictionary....
    
    
    teacher_detail_values=('Mr Moose','25k','Philosophy')
   
    print()
    print()
    teacher = dict(zip(seq, teacher_detail_values))
    print(teacher)
main()
                    
