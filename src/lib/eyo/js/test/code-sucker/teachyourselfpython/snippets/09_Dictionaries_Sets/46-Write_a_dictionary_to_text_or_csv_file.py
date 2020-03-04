import csv

#this particular example shows a nested dictionary with username(key) and user info (pair) stored as a list
dict = {'username' : [gender,age,password]}
w = csv.writer(open("output.csv", "w"))
for key, val in dict.items():
w.writerow([key, val])                    
