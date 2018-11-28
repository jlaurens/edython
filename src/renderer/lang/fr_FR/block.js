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
  placeholder: { // OK
    name: 'nom',
    comment: 'Un commentaire ici',
    module: 'module'
  },
  tooltip: {
    one_line_of_text: 'Saisir du texte (une ligne)',
    enter_any_valid_expression: 'Saisir une expression valide',
    funcdef: { // OK
      name: 'Un identifiant pour nommer la fonction'
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
  }
}
