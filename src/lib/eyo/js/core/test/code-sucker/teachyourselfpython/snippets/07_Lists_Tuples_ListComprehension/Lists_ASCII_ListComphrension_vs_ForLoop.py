

#using list comphrension

ascii_numbers=[ord(x) for x in 'ABCDEFG']
print(ascii_numbers)

#using FOR loop - note this is longer but more logical (easier to follow)
ascii_numbers=[]
for x in 'ABCDEFG':
	ascii_numbers.append(ord(x))


print(ascii_numbers)
                    
