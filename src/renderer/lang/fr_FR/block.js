var reserved = function (value) {
  return '<span class="eyo-code-reserved">' + value + '</span>'
}

// var comment = function (value) {
//   return '<span class="eyo-code-comment">' + value + '</span>'
// }

// var placeholder = function (value) {
//   return '<span class="eyo-code-placeholder">' + value + '</span>'
// }

// var nom = placeholder('nom')

export default {
  star: reserved('*'),
  two_stars: reserved('**'),
  dot: reserved('.'),
  two_dots: reserved('..'),
  no_selection: 'Pas de bloc sélectionné',
  placeholder: { // OK
    name: 'nom',
    comment: 'Un commentaire ici',
    module: 'module',
    number: '1',
    expression: 'expression',
    alias: 'alias',
    element: 'element',
    container: 'conteneur',
    condition: 'condition'
  },
  tooltip: {
    one_line_of_text: 'Saisir du texte (une ligne)',
    enter_any_valid_expression: 'Saisir une expression valide',
    global: 'Déclarer ou utiliser des noms de variables globales',
    nonlocal: 'Utiliser des noms de variables dans la plus petite portée entourant l\'instruction',
    del: 'Supprime une variable ou un élément de liste',
    pass: 'Instruction sans effet, utile comme bouche trou',
    continue: 'Continue directement à la prochaine itération de la boucle',
    break: 'Sort de la boucle',
    proper_slice: { // OK
      lower: 'Valeur minimale de l\'indice',
      upper: 'Valeur maximale de l\'indice + 1',
      stride: 'Pas de l\'incrémentation'
    },
    funcdef: { // OK
      name: 'Un identifiant pour nommer la fonction'
    },
    classdef: { // OK
      name: 'Un identifiant pour nommer la classe'
    },
    quote: { // OK
      single: 'Utiliser des guillemets droits simples',
      double: 'Utiliser des guillemets droits doubles'
    },
    decorator: { // OK
      input: 'Nom du décorateur'
    },
    literal: { // OK
      prefix: {
        raw: 'préfixe r pour raw (ie brut)',
        format: 'préfixe f pour format',
        byte: 'préfixe b pour bytes (ie octets)'
      }
    },
    keyword: {
      sep: 'Séparateur de champs (par défaut {{default}})',
      function: { // module|category name
        print: { // function name
          file: 'Fichier de sortie',
          end: 'Séparateur de fin de ligne (End of line)',
          flush: 'Affichage immédiat (y compris ce qui est en attente)'
        }
      },
      stdtypes: { // module|category name
        // shared messages
        sep: 'Séparateur de champs (par défaut {{default}})',
        maxsplit: 'Nombre maximum de composantes créées (par défaut {{default}})',
        split: { // function name
          sep: 'Séparateur de champs (par défaut {{default}})',
          maxsplit: 'Nombre maximum de composantes créées (par défaut {{default}})'
        }
      }
    },
    //
    except: {
      expression: 'Un ou plusieurs objets exception',
      alias: 'Un nom de variable'
    }
  },
  pane: {
    Workspace: 'Atelier',
    Console1: 'Console',
    Turtle: 'Tortue',
    Console2: 'Console2',
    Workbench: 'Établi',
    content: {
      console1: {
        restart: 'Redémarrer',
        erase: 'Effacer'
      },
      turtle: {
        replay: 'Rejouer',
        erase: 'Effacer',
        scrollToVisible: 'Centrer le dessin'
      },
      console2: {
        restart: 'Redémarrer',
        erase: 'Effacer'
      },
      scaleReset: 'Taille normale',
      scaleUp: 'Plus grand',
      scaleDown: 'Plus petit',
      scaleUpBig: 'Bien plus grand',
      scaleDownBig: 'Bien plus petit'
    }
  }
}
