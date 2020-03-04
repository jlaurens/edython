subjects = ['Biology', 'Chemistry', 'Physics', 'Maths', 'Computing', 'English']

for i in range(len(subjects)):
    print('Room[',i,'] =', subjects[i])

what_subject = input("What Subject do you have next?: ")
print("That subject is assigned to the room: ", subjects.index(what_subject))
                    
