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
  tooltip: {
    mode: {
      group: 'Choisir une interface adaptée',
      tutorial: 'Interface minimale pour débuter',
      basic: 'Interface pour une utilisation simplifiée',
      normal: 'Interface pour une utilisation normale',
      teacher: 'Interface étendue à l\'usage des professeurs'
    },
    selection: {
      send_to_back: 'Sélection à l\'arrière plan',
      show: 'Montrer la sélection'
    },
    eco_save: 'Sauvegarde au format compressé avec gzip si coché',
    tooltip: {
      on: 'Activer les bulles d\'aide qui apparaissent quand le pointeur reste sur un objet',
      off: 'Désactiver les bulles d\'aide qui apparaissent quand le pointeur reste sur un objet'
    },
    block: {
      on: 'Afficher la barre d\'édition et de réglage du bloc sélectionné',
      off: 'Cacher la barre d\'édition'
    },
    debug: {
      on: 'Afficher les informations de débogage',
      off: 'Cacher les informations de débogage'
    },
    menu: 'Options et actions',
    copy_block_deep: 'Copier le bloc sélectionné et les suivants',
    copy_block_shallow: 'Copier le bloc sélectionné',
    duplicate_block_deep: 'Dupliquer le bloc sélectionné et les suivants',
    duplicate_block_shallow: 'Dupliquer le bloc sélectionné',
    paste_bock: 'Coller le block du presse-papier'
  },
  content: {
    mode: {
      tutorial: 'Tutoriel',
      basic: 'Simple',
      normal: 'Normal',
      teacher: 'Professeur'
    },
    eco_save: 'Eco save',
    tooltip: {
      on: 'Activer les bulles d\'aide',
      off: 'Désactiver les bulles d\'aide'
    },
    block: {
      on: 'Afficher la barre d\'édition',
      off: 'Cacher la barre d\'édition'
    },
    debug: 'Mode débogage',
    copy_block_deep: 'Copier avec les suivants',
    copy_block_shallow: 'Copier',
    duplicate_block_deep: 'Dupliquer avec les suivants',
    duplicate_block_shallow: 'Dupliquer',
    paste_block: 'Paste'
  }
}
