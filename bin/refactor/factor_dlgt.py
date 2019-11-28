"""
Create code for dlgt.test.js

with X: expected value
without X: real value

NS: None|'eYo'|'NS'
NSX -> NSX = NS;
Super: None|eYo.Dflt|Super0|Super1
SuperX: None|eYo.Dflt|Super0|Super1
Dlgt: None|eYo.Dlgt|Dlgt0|Dlgt1
DlgtX: eYo.Dlgt|Dlgt0|Dlgt1

Each time we create a version without model and a version with model
template:
      () => {
        NSX = NS; Super = Super1; Dlgt = Dlgt1;
        return eYo.makeClass(NSX, 'A', Super, model())
      },


"""
args = {
  'Super': {
    None: {
      'SuperX'
    }
  }
}
NSX = SuperX = DlgtX = ''

f'''      () => {{
        NSX = {NSX}; Super = {SuperX}; Dlgt = {DlgtX};'''
