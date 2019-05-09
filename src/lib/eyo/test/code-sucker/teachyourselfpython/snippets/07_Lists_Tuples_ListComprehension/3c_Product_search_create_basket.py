#Task - first test the program by inputting "001"
#Add 5 more products with details to the list
#Create a main menu that allows a customer to 1. Browse Products 2. View Basket 
#Note: Add the products selected (for viewing) by the user to another list called "basket"
#print the basket in the "View Basket" sub


import sys
#this is a list that contains product informaton
product = ["001", "Iphone", "£1000", "002", "Samsung", "£2000", "003", "Toshiba", "£1500"]
basket=[] #created an empty list called basket
def mainmenu():
 while True:
   print("""=========MAIN MENU==============
            1 - Browse Products in our store
            2 - View Basket
            3 - Checkout
            4 - Quit
    """)
   choice=int(input("Enter choice:"))
   if choice==1:
        browseproducts()
   elif choice==2:
        viewbasket()
   elif choice==3:
        checkout()
   elif choice==4:
     sys.exit()
   else:
        print("Please make a valid selection")
 sys.exit()
def browseproducts():
  print("======BROWSE PRODUCTS IN OUR STORE==============")
  #stores whether the product has been found
  found= False
  #asks the user to enter a product code
  product_code=input("Enter the product code of an item: ")

  #a loop that will repeat for the length of the list
  for x in range(0,len(product)):
      #checks if the product code entered matches the current element of the list being checked
      if product[x] == product_code:
  	#if it is it prints the name and cost
          print("Product Name:", product[x + 1])
          print("Product Cost:", product[x + 2])
          print()
          basket.append([product[x+1],product[x+2]])
          print("This item has been added to your viewing basket")
  	#sets found to true as the product is found
          found = True    
  #after the loop checks if the product was not found
  if found==False:
      #if it wasn't found it says product not found
      print("Product not found")
    
def viewbasket():
 print("===============Your Basket======================")
 print("Your basket contains the following items:")
 for items in basket:
   print(items)

def checkout():
  #note: this will only acquire the first two in the basket, for all in the basket, a loop is required
  total_cost = 0
  for items in basket:
    total_cost = total_cost + extract_cost(items[1]) #this sends the items(just the £ in the list) to function extract_cost and that function simply uses basic string manipulation to get rid of the first character, namely the £
  print("Your total checkout cost is: £", total_cost)

#create a function that takes the parameter "money_in_pounds" - this will be passed from the checkout function
def extract_cost(money_in_pounds): 
    return int(money_in_pounds[1:]) #this function is given the items from checkout() (so £900 and £700 etc and it strips the first character away i.e gets rid of the £)

mainmenu()
                    
