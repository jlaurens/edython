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
            '0-tutorial': 'Interface minimale pour débuter',
            '1-basic': 'Interface pour une utilisation simplifiée',
            '2-normal': 'Interface pour une utilisation normale',
            '3-teacher': 'Interface étendue à l\'usage des professeurs'
        },
        selection: {
            send_to_back: 'Sélection à l\'arrière plan',
            show: 'Montrer la sélection'
        },
        eco_save: 'Sauvegarde au format compressé avec gzip si coché',
        deep_copy: 'Copier le bloc et les suivants si coché',
        tooltip: {
            on: 'Activer les bulles d\'aide qui apparaissent quand le pointeur reste sur un objet',
            off: 'Désactiver les bulles d\'aide qui apparaissent quand le pointeur reste sur un objet'
        },
        brick: {
            on: 'Afficher la barre d\'édition et de réglage du bloc sélectionné',
            off: 'Cacher la barre d\'édition'
        },
        debug: {
            on: 'Afficher les informations de débogage',
            off: 'Cacher les informations de débogage'
        },
        menu: 'Options et actions',
        copy_brick_deep: 'Copier le bloc sélectionné et les suivants',
        copy_brick_shallow: 'Copier le bloc sélectionné',
        duplicate_brick_deep: 'Dupliquer le bloc sélectionné et les suivants',
        duplicate_brick_shallow: 'Dupliquer le bloc sélectionné',
        paste_brick: 'Coller le bloc du presse-papier',
        copy_python: 'Copier le code python dans le presse-papier',
        run_python: 'Exécuter dans la console le code python du groupe qui contient le bloc sélectionné',
        demo: 'Exemples de programmes de démonstration',
        restart: 'Redémarrer la console à chaque exécution',
        factoryDefaults: 'Revenir à des réglages initiaux.'
    },
    content: {
        mode: {
            '0-tutorial': 'Tutoriel',
            '1-basic': 'Simple',
            '2-normal': 'Normal',
            '3-teacher': 'Professeur'
        },
        eco_save: 'Eco save',
        deep_copy: 'Copie profonde',
        tooltip: {
            on: 'Activer les bulles d\'aide',
            off: 'Désactiver les bulles d\'aide'
        },
        brick: {
            on: 'Afficher la barre d\'édition',
            off: 'Cacher la barre d\'édition'
        },
        debug: 'Mode débogage',
        copy_brick_deep: 'Copier avec les suivants',
        copy_brick_shallow: 'Copier',
        duplicate_brick_deep: 'Dupliquer avec les suivants',
        duplicate_brick_shallow: 'Dupliquer',
        paste_brick: 'Coller',
        run_python: 'Exécuter',
        restart: 'Redémarrer',
        factoryDefaults: 'Réglages usine'
    },
    name: {
        copy_python: 'Copier le code python'
    },
    demo: {
        basic: {
            hello_world: 'Bonjour le monde!',
            hello_you: 'Bonjour …',
            testing_and_branching: 'Tests et branchements',
            turtle: 'Tortue',
            turtle_star: 'Tortue étoile',
            turtle_spiral_star: 'Tortue étoile spirale',
            turtle_four: 'Tortue poursuite',
            turtle_Hilbert: 'Tortue Hilbert',
            turtle_Pythagoras_tree: 'Tortue Arbre de Pythagore',
            turtle_cardioid: 'Tortue cardioïde',
            sum_of_integers: 'Somme des entiers',
            primes: 'Nombres premiers',
            fifty_dices: '50 dés',
            list: 'Liste',
            list_edit: 'Liste(Édition)',
            plural: 'Pluriel',
            letters: 'Lettres'
        }
    }
}
