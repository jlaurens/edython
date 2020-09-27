def main():
    #Create an empty dictionary
    dict={}
    
    #create a sequence of keys (USING TUPLES) that would be used to store teacher's details
    seq=('name','salary','subject')

    #create a dictionary from the sequence above
    dict=dict.fromkeys(seq)
    print(str(dict))
    #........as of yet the dictionary does not have values

    #Add values to the dictionary
    dict=dict.fromkeys(seq,10)
    print("New Dictionary with values:",dict)
    #........this obviously doesn't make sense, as a teacher's name is unlikely to be all 10, but it illustrates the point!

   
main()
                    
