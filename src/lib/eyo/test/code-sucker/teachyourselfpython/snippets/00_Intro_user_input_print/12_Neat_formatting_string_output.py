#MAKING OUTPUT OF STRINGS LOOK PRETTY
#STRING FORMATTING

#sometimes you can spend a whole lot of time adding spaces to your print statements to get the formatting right....
#You could also do the below which produces the effect you'll see when you run this!

name1="User1"
age1=32
name2="User2"
age2=33
name3="User3"
age3=92

print("{0:<10} {1:<7}".format("Name","Age"))
print("{0:<10} {1:<7}".format(name1,age1))
print("{0:<10} {1:<7}".format(name2,age2))
print("{0:<10} {1:<7}".format(name3,age3))


"""
Note: Each {} placeholder contains additional control characters.
These specify the width of space that is given to each placeholder and the alignment of the characters within that space.
The < character represents left alignment and the number 10 the amount of spaces that are provided for the placeholder to fill.
The following alignments are available:
<	left alignment
^	centre alignment
>	right alignment

Find out more about string formatting here: https://docs.python.org/release/3.2.2/library/string.html#formatstrings


"""
    
    
                    
