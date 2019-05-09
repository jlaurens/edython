import collections #this import collections statement is important

def main():
    string="I love python"
    d=collections.defaultdict(int)
    for o in string:
        d[o] +=1

    for o in sorted(d, key=d.get, reverse=True):
        if d[o] >1:
            print("%s %d" % (o,d[o]))

    print()
    print()
    string="o and two more o's, I love python"
    d=collections.defaultdict(int)
    for o in string:
        d[o] +=1

    for o in sorted(d, key=d.get, reverse=True):
        if d[o] >1:
            print("%s %d" % (o,d[o]))
    
main()
                    
