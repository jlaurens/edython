#Part 1: Create a list with some teachers

teachers = ["Mr Moose", "Miss Orange", "Mr Donkey"]

#Part 2: User input - ask for a teacher's name:

select_teacher = input("What teacher would you like to sack?: ")

#Part 3: user selection deleted from list.


if select_teacher in teachers:
    print(select_teacher, "has been sacked")
    teachers.remove(select_teacher)

print(teachers)

                    
