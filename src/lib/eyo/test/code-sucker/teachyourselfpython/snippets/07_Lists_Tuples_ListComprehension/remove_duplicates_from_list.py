a = ["Moose", "Goose", "Moose", "Moose", "Pancake", "Gosh", "Wow","Moose"]

dup_items = set()
uniq_items = []
for x in a:
    
    
    if x not in dup_items:
        uniq_items.append(x)
        dup_items.add(x)
        
print(dup_items)
                    
