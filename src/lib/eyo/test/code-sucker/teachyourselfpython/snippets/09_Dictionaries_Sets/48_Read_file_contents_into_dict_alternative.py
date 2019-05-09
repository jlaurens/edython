"""File Contents
"['a', 5]"
"['b', 2]"
"['c', 3]"
"['d', 0]"
"""
def readfiletodict():
    with open("testfile.txt", "r") as f:
        mydict = {} #create a dictionary called mydict
        for line in f:
            key, val = line.strip("\"
[]").split(",")
            mydict[key.strip("'")] = val.strip()
    print(mydict) #test
    for key in mydict:
        print(key) #test to see if the keys are being retrieved correctly


readfiletodict()
                    
