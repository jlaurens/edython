words = ['The', 'quick', 'BROWN', 'Fox', 'jumped', 'OVER', 'the', 'Lazy', 'DOG']

#for each word in the list of words, print it, if it is lower case
print([word for word in words if word.islower()])


print()
print()


#for each word in the list of words, print it, if it is upper case
print([word for word in words if word.isupper()])


print()
print()
#if a word in the list of words is neither all lower case or all upper case, print!
print([word for word in words if not word.islower() and not word.isupper()])
                    
