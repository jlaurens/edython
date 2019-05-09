"""File Contents
"['a', 5]"
"['b', 2]"
"['c', 3]"
"['d', 0]"
"""
import re 

def readfiletodict():
   
   with open("testfile.txt","r",newline="") as f:
     mydict={} #create a dictionary called mydict
     for line in f:
        lineFormat = re.sub('[^A-Za-z0-9,]+', '', line)
        (key,val) = lineFormat.split(",")
        mydict[key]=val
     print(mydict) #test
     for keys in mydict:
       print(keys) #test to see if the keys are being retrieved correctly
       

readfiletodict()    
                    
