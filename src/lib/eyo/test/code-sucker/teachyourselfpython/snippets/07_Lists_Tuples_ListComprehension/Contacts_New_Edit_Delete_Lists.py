menu_item = 0
namelist = []
while menu_item != 9:
    print("--------------------")
    print("1. Print Contact List")
    print("2. Add a Name to Contacts ")
    print("3. Delete a Contact")
    print("4. Edit a Contact")
    print("9. Exit Application")
    menu_item = int(input("Pick an item from the menu: "))
    if menu_item == 1:
        current = 0
        if len(namelist) > 0:
            while current < len(namelist):
                print(current, ".", namelist[current])
                current = current + 1
        else:
            print("You have no Contacts!")
    elif menu_item == 2:
        name = input("Type in a name to add: ")
        namelist.append(name)
    elif menu_item == 3:
        del_name = input("What Contact would you like to get rid of?: ")
        if del_name in namelist:
            # namelist.remove(del_name) would work just as fine
            item_number = namelist.index(del_name)
            del namelist[item_number]
            # The code above only removes the first occurrence of
            # the name.  The code below from Gerald removes all.
            # while del_name in namelist:
            #       item_number = namelist.index(del_name)
            #       del namelist[item_number]
        else:
            print(del_name, "was not found")
    elif menu_item == 4:
        old_name = input("What Contact would you like to edit?: ")
        if old_name in namelist:
            item_number = namelist.index(old_name)
            new_name = input("What is the new name: ")
            namelist[item_number] = new_name
        else:
            print(old_name, "was not found")

print("Goodbye")
                    
