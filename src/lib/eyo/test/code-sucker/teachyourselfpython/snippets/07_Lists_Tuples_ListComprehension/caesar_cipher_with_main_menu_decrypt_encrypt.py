def caesar_cipher(message, key, action):
    letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                '1', '2', '3', '4', '5', '6', '7', '8', '9']
    
    number_in_list = len(letters)
    output_message = ""
    for next_character in message:
        in_list = False
        i = 0
        while i < number_in_list:
            new_position = 0
            if next_character == letters[i]:
                in_list = True
                # What happens next determined by value of action.
                if action == 'E':
                    new_position = i + key
                else:
                    new_position = i - key                   
                if new_position >= number_in_list:
                    new_position -= number_in_list
                output_char = letters[new_position]
            i += 1
        if in_list:
             output_message += output_char
        else:
            output_message += next_character
    return output_message

   
#Main program
print("CAESAR CIPHER")
print("")
print("OPTIONS")
print("")
flag = True
while flag:
    print("")
    print("1. Encrypt a message")
    print("2. Decrypt a message")
    print("3. Exit the program")
    answer = input("Please select an option. ")
    if answer == "1":
        message = input("Enter the message you want to encrypt: ")
        key = input("Enter the key: ")
        action = "E"
        print("The encoded message is: ")
        print(caesar_cipher(message, int(key), action))
    elif answer == "2":
        message = input("Enter the message you want to decrypt: ")
        key = input("Enter the key: ")
        action = "D"
        print("The decoded message is: "),
        print(caesar_cipher(message, int(key), action))
    elif answer =="3":
        flag = False
print("Good bye")
                    
