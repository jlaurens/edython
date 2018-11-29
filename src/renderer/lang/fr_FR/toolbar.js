// var comment = function (value) {
//   return '<span class="eyo-code-comment">' + value + '</span>'
// }

// var reserved = function (value) {
//   return '<span class="eyo-code-reserved">' + value + '</span>'
// }

// var placeholder = function (value) {
//   return '<span class="eyo-code-placeholder">' + value + '</span>'
// }

// var nom = placeholder('nom')

export default {
  panel: {
    should_save: {
      title: 'Sauvegarder d\'abord ?',
      content: 'Des changements sont en cours, ils seront définitivement perdus s\'ils ne sont pas sauvegardés.'
    }
  },
  tooltip: {
    mode: {
      group: 'Choisir une interface adaptée',
      tutorial: 'Interface minimale pour débuter',
      basic: 'Interface pour une utilisation simplifiée',
      normal: 'Interface pour une utilisation normale',
      teacher: 'Interface étendue à l\'usage des professeurs'
    },
    workspace: {
      hide: 'Cacher l\'espace des blocs',
      show: 'Montrer l\'espace des blocs'
    },
    console_panel: {
      hide: 'Cacher le panneau de console',
      show: 'Montrer le panneau de console'
    },
    selection: {
      send_to_back: 'Sélection à l\'arrière plan',
      show: 'Montrer la sélection'
    }
  },
  content: {
    mode: {
      tutorial: 'Tutoriel',
      basic: 'Simple',
      normal: 'Normal',
      teacher: 'Professeur'
    }
  }
}
