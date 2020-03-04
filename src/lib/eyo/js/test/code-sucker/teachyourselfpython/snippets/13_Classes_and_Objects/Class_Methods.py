""" =======TASK===========
1. Add additional methods (and call them)...think about things that babies do ....they cry...they poo...
.>>add simple print commands in the methods (e.g. Baby is doing a poo)
"""

class Baby:
    def __init__(self, weight,milk):
        #initialise the attributes
        self.weight=0
        self.milk=milk
        self.status="Healthy"
        self.type="Generic"
        

    #a method that contains the baby's needs (such as milk needed)
    def babyneeds(self): #when you create any method you must pass self as a parameter
        #returns a dictionary containing the baby's needs ..
        return {"Milk needed:":self.milk}
    def doctorsnote(self): #this will provide a report on the progress and welfare of the baby
        return{"Status:":self.status}
    
    
def main():
    baby1=Baby(7,2)
    print(baby1.babyneeds()) #this is far preferred than calling the attributes directly (which you really shouldn't do)
    print(baby1.doctorsnote())
    
    
if __name__ == "__main__":
    main()
                    
