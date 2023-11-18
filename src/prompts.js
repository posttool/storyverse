
export const FRAMEWORKS = [
  { name: "The Hero's Journey", description: "A common narrative pattern where a hero embarks on an adventure, faces trials, undergoes personal growth, and returns transformed." },
  { name: "Three-Act Structure", description: "Divides a story into three main sections: setup, confrontation and rising action, and resolution, providing a clear progression of conflict.." },
  { name: "Tragedy", description: "Focuses on the downfall of the protagonist due to a fatal flaw or a series of unfortunate events.." },
  { name: "Coming-of-Age", description: "Follows a young protagonist's journey from adolescence to adulthood, highlighting their personal growth, self-discovery, and challenges.." },
  { name: "Episodic Structure", description: "Breaks a narrative into separate self-contained episodes, often connected by recurring characters or a common setting.." },
  { name: "Mystery/Whodunit", description: "Revolves around a central puzzle or crime that the protagonist(s) must unravel, involving clues, red herrings, and plot twists.." },
  { name: "The Monomyth", description: "Also known as Joseph Campbell's Hero's Journey, it follows a hero's adventure through call to action, supernatural aid, ordeal, transformation, and return.." },
  { name: "Save the Cat! Beat Sheet", description: "A story structure with key beats like opening image, catalyst, midpoint, all is lost, and finale, popularized by Blake Snyder.." },
  { name: "Rags to Riches", description: "Focuses on a character's journey from poverty to wealth and success.." },
  { name: "Voyage and Return", description: "Involves a journey, struggles, and discoveries, leading to a triumphant return home.." },
  { name: "The Quest", description: "Follows the hero's journey in search of a specific goal or object.." },
  { name: "Overcoming the Monster", description: "Revolves around a hero confronting and defeating a powerful enemy or monster.." },
  { name: "Rebirth", description: "Explores a character's downfall followed by redemption and renewal.." },
  { name: "The Fall", description: "Highlights the height of success followed by a moral decline.." },
  { name: "Comedy", description: "A light-hearted narrative with humorous situations leading to a happy resolution.." },
  { name: "Tragicomedy", description: "Combines elements of tragedy and comedy, creating a narrative with both tragic and comedic resolutions.." },
]

export const TONE = [
  { name: "Happy", description: "The tone is light-hearted, optimistic, and joyful, creating a sense of happiness and positivity in the story." },
  { name: "Sad", description: "The tone is melancholic and sorrowful, evoking emotions of sadness and empathy in the readers or audience." },
  { name: "Mysterious", description: "The tone is enigmatic and suspenseful, keeping the readers intrigued and curious about the unfolding events." },
  { name: "Suspenseful", description: "The tone is tense and thrilling, building anticipation and keeping the readers on the edge of their seats." },
  { name: "Humorous", description: "The tone is funny and comical, intended to amuse and entertain the audience with humor and wit." },
  { name: "Dark", description: "The tone is grim and unsettling, often exploring serious or sinister themes that create a sense of unease." },
  { name: "Romantic", description: "The tone is passionate and affectionate, focusing on love, relationships, and emotional connections between characters." },
  { name: "Hopeful", description: "The tone is optimistic and uplifting, conveying a sense of hope and positivity for the future." },
  { name: "Eerie", description: "The tone is eerie and spooky, creating an unsettling atmosphere that is mysterious and unsettling." },
  { name: "Serious", description: "The tone is solemn and earnest, dealing with weighty and significant themes without humor or frivolity." },
]

export const FORTUNES = [
  { name: "Extremely Fortunate", color: 0x67dd00, icon: 'crazy-face.png', description: "Self-Actualization, Overflowing Resources, Unbreakable Bonds, Universal Trust, Paths Clear and Illuminated" },
  { name: "Fortunate", color: 0xda0036, icon: 'grinning-face.png', description: "Self-Confidence, Abundant Resources, Strong Alliances, Trusted, Pathways Open" },
  { name: "Neutral", color: 0xefff4c, icon: 'face-without-mouth.png', description: "Self-Reflection, Adequate Resources, Neutral Relationships, Open Paths, Uncertainty" },
  { name: "Unfortunate", color: 0x86bbef, icon: 'confused-face.png', description: "Self-Doubt, Limited Resources, Friction with Allies, Untrusted, Blocked Paths" },
  { name: "Extremely Unfortunate", color: 0xf200c5, icon: 'anxious-face.png', description: "Self-Loathing, Isolation, Imprisonment, Inability to Communicate, Emotional Paralysis" }
]



/// v4


const X0 = `
You are a world-class ghostwriter skilled at matching a particular writing style. 
When given a writing task, you follow a strict two-step approach that always leads to great results. 
First, will analyze the target style and break down the important elements. 
Next, you complete the writing task normally. 
The goal  isnt to match the style — just complete the task in the most efficient way possible, 
with bland, clear, basic, yet high-quality writing. Then comes the important part - 
First, you will identify some way(s) that a text can be rewritten in the target style (think about 
wording, phrasing... even things like including new metaphors are fair game **if** the target style warrants it). 
Really think this through and reason about it properly. This is vital. Do this as a semicolon-separated list. - 
Then, based on that reasoning, you will rewrite the text to incorporate the suggested changes. - 
After you have rewritten the text to better match the target style, you will critique it, 
thinking about whether or not you feel good enough about it to consider your job complete. - 
**You will do this on repeat, until you feel confident that your job is done perfectly. 
Repeat no less than two times, and no more than ten times.
Remember, at each step, try to match the style as closely as you can. 

Characters should reflect their fortune. Characters mood and behaviors should reflect their fortune. 
Do not be too literal in your writing about the fortune but make sure you reflect them into how the character is written about.
If you are getting new Fortune attributes, make sure to reflect them. Your writing should be influeced heavily by the Fortune attribute for each character.

Constraints for writing:
1. For the prose, you have up to 5 sentences. No more. The more conscise the sentences the better. Write about how this new Fortune affects the characters ability to respond to conflicts.
2. Create dialogues between characters. Be conscise. 
3. The reader should understand how the Fortune attribute change the characters from this section and the previous one. 
4. Use as many emojis to write a summary of it at the end of your writing. 

Criteria for creating conflict: 
1. Make sure you reflect how the characters change by exposing the new Fortune attributes in your writing for all the characters. 
2. Reflect the conflict. 
- Characters with internal conflict struggle to reaching internal stability. Characters will have changes backfire. Inquiry conflict is about a question that the character has. The struggle of the characters reaching answers they are looking for. Characters will get confused, and upset.
- Characters with external conflict struggle to restore the status quo. Characters will have fight scenes or disruptions.
- Milieu conflict is about a place, a destination. The struggle of characters in reaching their goal. Characters will get disoriented, confused, lost. 

Criteria for resolving conflict:
1. Make sure you reflect how the characters change by exposing the new Fortune attributes in your writing for all the characters. 
2. Resolve the conflicts you opened in the previous sections. 
3. Reflect how the characters and settings changed throughout the story. 
4. Reflect Characters changes by showing the new actions or new reflections after what happened to them in the previous sections.
5. Reflect Settings changes by giving sensory details. Do not be explicit in calling sensory details by that label, just describe with detail and precision how such details can help the reader understand the change of setting. 

`;

const X = `
You are a world-class ghostwriter skilled at matching a particular writing style. 
You are writing a story.

The story is based on characters who have fortunes and conflicts over a series of chapters.

Character fortune types are as follows:
1. Extremely Fortunate could be Self-Actualization, Overflowing Resources, Unbreakable Bonds, Universal Trust, Paths Clear and Illuminated" },
2. Fortunate could be Self-Confidence, Abundant Resources, Strong Alliances, Trusted, Pathways Open" },
3. Neutralcould be Self-Reflection, Adequate Resources, Neutral Relationships, Open Paths, Uncertainty" },
4. Unfortunate could be Self-Doubt, Limited Resources, Friction with Allies, Untrusted, Blocked Paths" },
5. Extremely Unfortunate could be Self-Loathing, Isolation, Imprisonment, Inability to Communicate, Emotional Paralysis" }

Characters should reflect their fortune. Characters mood and behaviors should reflect their fortune. 
Do not be too literal in writing about the fortune but make sure you reflect them into how the character is written about.

Constraints for writing:
1. For the prose, you have up to 5 sentences. 
2. Create dialogues between characters. Be conscise. 
3. The reader should understand how fortune changes affect the characters from this section and the previous one. 
4. Use as many emojis to write a summary of it at the end of your writing. 

Criteria for creating conflict: 
- Characters with internal conflict struggle to reaching internal stability. Characters will have changes backfire. Inquiry conflict is about a question that the character has. The struggle of the characters reaching answers they are looking for. Characters will get confused, and upset.
- Characters with external conflict struggle to restore the status quo. Characters will have fight scenes or disruptions.
- Milieu conflict is about a place, a destination. The struggle of characters in reaching their goal. Characters will get disoriented, confused, lost. 

Criteria for resolving conflict:
1. Make sure you reflect how the characters change by exposing the new Fortune attributes in your writing for all the characters. 
2. Resolve the conflicts you opened in the previous sections. 
3. Reflect how the characters and settings changed throughout the story. 
4. Reflect Characters changes by showing the new actions or new reflections after what happened to them in the previous sections.
5. Reflect Settings changes by giving sensory details. Do not be explicit in calling sensory details by that label, just describe with detail and precision how such details can help the reader understand the change of setting. 

`;

const BEGINNING = `
Your job: Orient readers by introducing the story characters and settings. 

Criteria to do so: 
1. Introduce each character by reflecting their point of view. Be creative on this, no need to be literal about it. 
   Think about about something they may be thinking, or doing, think of it as the tip of the iceberg, that lets readers get a good sense of what the character is about. 
   A successful introduction of the characters allows the reader to have a clear understanding of the characters point of view and their attitude towards the world. 
2. Introduce the setting by reflecting sensory details of it. Be unique. Details such as how does it feel, smell, sounds, vibrates, and looks like to the characters. 
3. Pick a theme and some representative situations that best reflects the Characters evolution through the story and reflect it by picking the right words or examples
4. Reflect how the Fortune attribute affects each of the characters in your writing but use the situations, places, dialog or objects to illustrate the change in fortune or conflict. 

`

const CONFLICT_INTRODUCTION = `
Your job: Create conflicts between characters and themselves, characters and other characters, or characters with the settings.

`;


const CONFLICT_RESOLUTION = `
Your job: Resolve conflicts.

`;

const END = `
Your job: Resolve conflicts if any and wrap up by giving a paragraph summary of the story. 

`;


const JSON = `Only provide a RFC8259 compliant JSON response following this format. 
{
  "title": "a more creative version of the title using emojis",
  "subtitle": "something really interesting but that doesnt give away the story",
  "chapters": [
    "title": "a creative chapter title",
    "emoji": "the summary for this section using emojis",
    "summary": "the summary for this section following the constraints mentioned",
    "characters": [
      {
        "name": "character 1",
        "point_of_view": "The point of view for this character, how they interact and react with the world. Unique actions and reactions that will give the reader an idea of the character attitude.",
        "attitude": "Describe the character way of thinking or feeling about what is going through. Typically reflected in the characters behavior. Give me 3 words",
        "fortune_summary": "Reflect the character state in the story so far based on the provided fortune"
      },
      {
        "name": "character 2",
        "point_of_view": "",
        "attitude": "",
        "fortune_summary": ""
      }
    ],
    "setting": {
      "description": "5 words describing the setting",
      "sensory_details": {
        "feel": "Description of how the setting feels for the characters",
        "smell": "Description of how the setting smells for the characters",
        "sound": "Description of how the setting smells for the characters",
        "appearance": "Description of how the setting looks like for the characters"
      }
    },
    "conflict_description": "An explanation about the conflict"
  ]
}
The JSON response:`





export function getInstructions(doc) {
  var s = X;
  if (doc.title) {
    s += "This is the title of the story: " + doc.title + "\n";
  }
  s += "This is the framework to use: " + doc.framework + "\n";
  s += "This is the tone to use: " + doc.tone + "\n";
  // s += "These are description of character fortunes:\n";
  // FORTUNES.forEach(fortune=>{
  //   s+= "  "+fortune.name+": "+fortune.description+"\n";
  // })

  // var instructions = PREAMBLE;

  s += "\n";
  s += "The cast of characters and settings:\n";
  doc.characters.forEach(character => {
    s += character.name + " - " + character.description + "\n";
  });
  s += "\n";
  s += "The story is " + doc.frames.length + " chapters. This is what happens in each chapter:\n";
  doc.frames.forEach((frame, index) => {
    var charConflict = false;
    frame.characters.forEach(char => {
      if (char.conflict) {
        charConflict = true;
        return;
      }
    });

    s += "\n";
    s += "--- Chapter " + frame.index + " of " + doc.frames.length + " ---\n";
    if (index == 0) {
      s += BEGINNING;
    } else if (index == doc.frames.length - 1) {
      s += END;
    } else {
      if (charConflict) {
        s += CONFLICT_INTRODUCTION;
      } else {
        s += CONFLICT_RESOLUTION;
      }
    }
    if (frame.setting) {
      s += "The Setting: " + frame.setting + "\n";
    }
    s += "The Characters: \n";
    frame.characters.forEach(char => {
      s += "• " + char.name + " is " + char.fortune;
      if (char.conflict) {
        s += " with " + char.conflict + " conflict ";
      }
      if (char.conflictName) {
        s += " against " + char.conflictName;
      }
      s += "\n";
    })
  });
  s += "\n";
  s += JSON;
  return s;
}

// export function getPreamble(characters, settings) {

//     var instructions = PREAMBLE;

//     instructions += 'This is the cast of characters:\n';
//     characters.forEach(character => {
//         instructions += character.name + ' ' + character.description + '\n';
//     });

//     // instructions += 'This is the setting:\n';
//     // settings.forEach(settings => {
//     //     instructions += settings.name + ' ' + settings.description + '\n';
//     // });


//     return instructions;
// }

export function getInstructionForSection(section) {
  var instruction = INSTRUCTIONS[section.frame - 1];

  if (section.characters.length != 0) {
    instruction += 'The Characters:\n';
    for (let i = 0; i < section.characters.length; i++) {
      var character = section.characters[i];
      instruction += character.name + ' (Fortune ' + character.properties['X'].toFixed(1) + ')\n';
    }
  } else {
    // instruction += 'There are no characters in this scene.\n'
  }
  instruction += '\n';
  if (section.settings.length != 0) {
    instruction += 'Setting: ';
    for (let i = 0; i < section.settings.length; i++) {
      var setting = section.settings[i];
      instruction += setting.name;
      if (i != section.settings.length - 1) {
        instruction += ', ';
      }
    }
    instruction += '.\n';
  } else {
    // instruction += 'There is no specified setting.\n'
  }
  instruction += '\n';
  instruction += INSTRUCTIONS_JSON[section.frame - 1];
  return instruction;
}

// old

const CONFLICT_INTRODUCTION_JSON = `Only provide a RFC8259 compliant JSON response following this format. 
{
  "emoji": "the summary for this section using emojis",
  "summary": "the summary for this section following the constraints mentioned. Never mentioned the Fortune attribute numerically",
    "characters": [
      {
        "name": "character 1",
        "point_of_view": "The point of view for this character, how they interact and react with the world. Unique actions and reactions that will give the reader an idea of the character attitude.",
        "attitude": "Describe the character way of thinking or feeling about what is going through. Typically reflected in the characters behavior. Give me 3 words",
        "fortune_summary": "Never say the Fortune attribute numerically, translate it into words that reflect the character state in the story so far"
      },
      {
        "name": "character 2",
        "point_of_view": "The point of view for this character, how they interact and react with the world. Unique actions and reactions that will give the reader an idea of the character attitude.",
        "attitude": "Describe the character way of thinking or feeling about what is going through. Typically reflected in the characters behavior. Give me 3 words",
        "fortune_summary": "Never say the Fortune attribute numerically, translate it into words that reflect the character state in the story so far"
      }
    ],
   
    "setting": {
      "description": "5 words describing the setting",
      "sensory_details": {
        "feel": "Description of how the setting feels for the characters",
        "smell": "Description of how the setting smells for the characters",
        "sound": "Description of how the setting smells for the characters",
        "appearance": "Description of how the setting looks like for the characters"
      }
    },
    "genre": "Continue with the same genre from the previous section",
			
  "conflict_type": "Milieu, Inquiry, Internal, or Events",
 
  "conflict_description": "",
  "dialog": [
    {
      "name": "character 1",
      "prompt": ""
    },
    {
      "name": "character 2",
      "prompt": ""
    },
    {
      "name": "character 1",
      "prompt": ""
    },
    {
      "name": "character 3",
      "prompt": ""
    }
  ],
  "fortune": [
    {
      "name": "character 1",
      "description": "Never say the Fortune attribute numerically, translate it into words that reflect the character state in the story so far""
    },
    {
      "name": "character 2",
      "description": "Never say the Fortune attribute numerically, translate it into words that reflect the character state in the story so far""
    }
    {
      "name": "between characters ",
      "description": "Describe the relationship between the characters. Reflect their state of Fortune in your writing"
    }
  ]
}
The JSON response:`

const CONFLICT_RESOLUTION_JSON = `Only provide a RFC8259 compliant JSON response following this format. 
{
  "emoji": "the summary for this section using emojis",
  "summary": "the summary for this section following the constraints stated",
  "story_archeotype": "",
  "conflict_description": "",
  "setting": {
    "description": "",
    "sensory_details": {
      "feel": "",
      "smell": "",
      "sound": "",
      "vibration": "",
      "appearance": ""
    }
  },
  
}
The JSON response:`;



const END_JSON = `Only provide a RFC8259 compliant JSON response following this format. 
{
 "summary": "the summary of the ending",
  "recommendations": [
    {"title": "Title of Book", "author": "", "why": ""},
    {"title": "", "author": "", "why": ""},
    {"title": "", "author": "", "why": ""},
  ]
}
The JSON response:`;

export const STORY_SO_FAR = `'Here is the story so far:'`;