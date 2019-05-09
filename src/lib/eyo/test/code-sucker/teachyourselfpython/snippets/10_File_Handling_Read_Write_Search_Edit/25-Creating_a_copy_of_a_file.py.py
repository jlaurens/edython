def copyFile(oldFile, newFile): 
  f1 = open(oldFile, "r") 
  f2 = open(newFile, "w") 
  while 1: 
    text = f1.read(50) 
    if text == "": 
      break 
    f2.write(text) 
  f1.close() 
  f2.close() 
  return 

filecopy = "C:\temp\tester2copy.txt" #this file will be created
fileold = "C:\temp\tester2.txt" # existing file
copyFile(fileold, filecopy)


#Example from: http://www.annedawson.net/Python3Programs.txt

                    
