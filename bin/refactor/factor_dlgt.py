"""
UNUSED : built into the dlgt.test.js

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

from enum import Enum

class K(Enum):
  eYo = 'eYo'
  NS = 'NS'
  Dlgt = 'eYo.Dlgt'
  Dlgt0 = 'Dlgt0'
  Dlgt00 = 'Dlgt00'
  Dlgt1 = 'Dlgt1'
  Dflt = 'eYo.Dlft'
  SuperNA = 'eYo.NA'
  SuperN = 'SuperN' # constructor's delegate class: null
  SuperD = 'SuperD' # constructor's delegate class: eYo.Dlgt
  Super0 = 'Super0' # ...: Dlgt0
  Super00 = 'Super00' # ...: Dlgt00
  A = "'A'"
  model = 'model()'


def getNSX(NS):
  return K.eYo if NS is None else NS

def getSuperX(Super):
  return Super

def getSuperDlgtX(Super):
  return {
    K.SuperNA: K.Dlgt,
    K.SuperN: K.Dlgt,
    K.SuperD: K.Dlgt,
    K.Super0: K.Dlgt0,
    K.Super00: K.Dlgt00,
  } [Super]

def getDlgtX(Dlgt):
  return K.Dlgt if Dlgt is None else Dlgt

def getCompatible(Super, Dlgt):
  return Dlgt in {
    K.SuperNA: [K.Dlgt, K.Dlgt0, K.Dlgt00, K.Dlgt1],
    K.SuperN: [K.Dlgt, K.Dlgt0, K.Dlgt00, K.Dlgt1],
    K.SuperD: [K.Dlgt, K.Dlgt0, K.Dlgt00, K.Dlgt1],
    K.Super0: [K.Dlgt0, K.Dlgt00],
    K.Super00: [K.Dlgt00],
  } [Super]

NSX = SuperX = DlgtX = ''
compatibility = False
args = ''
print('''    var f = (NS_, Super_, Dlgt_, ff, compatible) => {
      return compatible
      ? () => {
        NS = NS_; Super = Super_; Dlgt = Dlgt_
        var ans
        chai.expect(() => {
          ans = ff()
        }).not.to.xthrow()
        return ans
      }
      : () => {
        NS = NS_; Super = Super_; Dlgt = Dlgt_
        chai.expect(ff).to.xthrow()
      }
    }
    ;[''')
def f(NS, Super, Dlgt, args, compatible):
  DlgtX = getDlgtX(Dlgt)

  return f'''      f({NSX.value}, {SuperX.value}, {DlgtX.value}, () => {{
          return eYo.makeClass({args})
        }}, {'true' if compatible else 'false'}
      ),'''

def getArgs(NS, Super, Dlgt, model):
  args = []
  if NS: args.append(NS.value)
  args.append(K.A.value)
  if Super is not K.SuperNA: args.append(Super.value)
  if Dlgt: args.append(Dlgt.value)
  if model: args.append(model.value)
  return ', '.join(args)

def oneTest(NS, Super, Dlgt, model):
  args = getArgs(NS, Super, Dlgt, model)
  print(f(getNSX(NS), getSuperX(Super), DlgtX, args, getCompatible(Super, DlgtX)))

for NS in [None, K.eYo, K.NS]:
  for Super in [K.SuperNA, K.SuperN, K.SuperD, K.Super0, K.Super00]:
    for Dlgt in [None, K.Dlgt, K.Dlgt0, K.Dlgt00, K.Dlgt1]:
      for model in [None, K.model]:
        oneTest(NS, Super, Dlgt, model)

print('''    ]
''')
