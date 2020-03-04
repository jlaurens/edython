#Part 1: Create a list with 10 numbers

numbers = [1,2,3,4,5,6,7,8,9,10]

#Part 2: User input - ask for a number 'n'

select_number = int(input("Select a number from the list: "))

#Part 3: user selection 'n' x Loop through numbers 1 to 10.

for i in range (1, 11):

    print(select_number, "times", i, "=", select_number*i)
                    
