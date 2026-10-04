export const describingPeople = {
  match: {
    pairs: [
      {left:'curly hair', right:'lockige Haare'},
      {left:'straight hair', right:'glatte Haare'},
      {left:'wavy hair', right:'wellige Haare'},
      {left:'freckles', right:'Sommersprossen'},
      {left:'glasses', right:'Brille'},
      {left:'a ponytail', right:'ein Pferdeschwanz'},
      {left:'a beard', right:'ein Bart'},
      {left:'slim', right:'schlank'}
    ]
  },
  sort: {
    categories:['hair','face / accessories','build'],
    items:[
      {text:'curly',category:'hair'},
      {text:'wavy',category:'hair'},
      {text:'a ponytail',category:'hair'},
      {text:'freckles',category:'face / accessories'},
      {text:'glasses',category:'face / accessories'},
      {text:'a beard',category:'face / accessories'},
      {text:'tall',category:'build'},
      {text:'slim',category:'build'}
    ]
  },
  cloze: {
    items:[
      {before:'Mia ',answer:'has got',after:' long brown hair.'},
      {before:'Ben ',answer:'is',after:' tall and slim.'},
      {before:'Ruby ',answer:'has got',after:' freckles.'},
      {before:'Noah ',answer:'wears',after:' glasses.'},
      {before:'Lily ',answer:'has got',after:' a ponytail.'},
      {before:'Sam ',answer:'is',after:' short.'}
    ]
  },
  type: {
    items:[
      {prompt:'lockige Haare',answer:'curly hair'},
      {prompt:'Sommersprossen',answer:'freckles'},
      {prompt:'Brille',answer:'glasses'},
      {prompt:'groß',answer:'tall'},
      {prompt:'schlank',answer:'slim'},
      {prompt:'Pferdeschwanz',answer:'ponytail'},
      {prompt:'Bart',answer:'beard'}
    ]
  },
  order: {
    parts:['She','has got','long','curly','brown','hair','.'],
    answer:['She','has got','long','curly','brown','hair','.']
  },
  choice: {
    questions:[
      {q:'Which sentence is correct?',options:['She has got curly hair.','She is got curly hair.','She have got curly hair.'],answer:'She has got curly hair.'},
      {q:'What does “freckles” mean?',options:['Sommersprossen','Locken','Brille'],answer:'Sommersprossen'},
      {q:'Which word describes body height?',options:['tall','curly','freckles'],answer:'tall'},
      {q:'Complete: He ___ glasses.',options:['wears','has','is'],answer:'wears'},
      {q:'Which sentence describes hair?',options:['She has got wavy hair.','She is wavy hair.','She wears wavy.'],answer:'She has got wavy hair.'},
      {q:'What is the opposite of “tall”?',options:['short','slim','straight'],answer:'short'}
    ]
  },
  mark: {
    text:'Mia is tall and slim. She has got long curly brown hair and green eyes. She wears black glasses.',
    answers:['tall','slim','long','curly','brown','green','black']
  }
};

export const people = [
  {name:'Mia',icon:'👩🏻‍🦱',features:['curly hair','brown hair','glasses','tall']},
  {name:'Leo',icon:'👨🏼‍🦰',features:['short red hair','freckles','short']},
  {name:'Ruby',icon:'👩🏽‍🦰',features:['long red hair','freckles','slim']},
  {name:'Ben',icon:'👨🏻',features:['short black hair','beard','tall']},
  {name:'Lily',icon:'👩🏼',features:['long blond hair','ponytail','slim']},
  {name:'Noah',icon:'👨🏾‍🦱',features:['curly black hair','glasses','tall']},
  {name:'Ava',icon:'👩🏻',features:['straight brown hair','short','glasses']},
  {name:'Sam',icon:'👨🏼',features:['wavy blond hair','short','slim']}
];

export const whoRounds = [
  {clue:'This person has got curly brown hair, wears glasses and is tall.',answer:'Mia'},
  {clue:'This person has got short red hair and freckles. This person is short.',answer:'Leo'},
  {clue:'This person has got long red hair and freckles. This person is slim.',answer:'Ruby'},
  {clue:'This person has got short black hair and a beard. This person is tall.',answer:'Ben'},
  {clue:'This person has got long blond hair in a ponytail. This person is slim.',answer:'Lily'},
  {clue:'This person has got curly black hair, wears glasses and is tall.',answer:'Noah'},
  {clue:'This person has got straight brown hair, wears glasses and is short.',answer:'Ava'},
  {clue:'This person has got wavy blond hair. This person is short and slim.',answer:'Sam'}
];
