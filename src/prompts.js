import { getByName } from './utils.js';

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



/// v3 json

const PREAMBLE = `Characters should reflect attributes. 
Characters mood and behaviors should reflect these attributes. 
Dont be too literal in your writing about the Character attributes but make sure you reflect them into how the character is written about.
The attributes are (Fortune)
Fortune ranges from 0 to 1 with 1 being the "Good Fortune" such as 0 being the "Ill Fortune". Depending on the number, pick from the 
table below and reflect that feeling into the character state. The character actions, and the character ability to interact with the setting:
"0:	Desolation, Catastrophe, Abyss, Hopelessness, Tragedy, Ruin, Devastation, Nadir, Misery, Disaster"
"0.1: Hardship, Struggle, Suffering, Downturn, Decline, Woe, Adversity, Setback, Gloom, Dismay"
"0.2: Trouble, Worry, Unease, Distress, Challenge, Hurdle, Obstacle, Difficulty, Issue, Problem"
"0.3: Discontent, Upset, Dissatisfaction, Uneasiness, Concern, Discomfort, Imbalance, Restlessness, Perturbation, Malaise""
"0.4: Neutral, Average, Steady, Unchanged, Balance, Status-quo, Middle-ground, Regular, Commonplace, Standard""
"0.5: Contentment, Peace, Stability, Satisfaction, Comfort, Ease, Assurance, Calm, Poise, Security""
"0.6: Rise, Growth, Progress, Ascent, Advancement, Betterment, Elevation, Uplift, Improvement, Gain""
"0.7: Joy, Elation, Delight, Triumph, Ecstasy, Success, Achievement, Celebration, Victory, Euphoria""
"0.8: Bliss, Splendor, Radiance, Pinnacle, Excellence, Peak, Zenith, Majesty, Brilliance, Glory""
"0.9: Perfection, Nirvana, Paradise, Culmination, Apex, Summit, Transcendence, Utopia, Ideal, Zenith""

If you are getting new Fortune attributes, make sure to reflect it. Your writing should be influeced heavily by the Fortune attribute for each character.

`;

const BEGINNING = `Your job is to help orient our readers, make promises to them. Use the following structure to do so: 
Introduce each characters by reflecting their point of view.  
Introduce the setting by reflecting sensory details of it. Be unique. Details such as how does it feel, smell, sounds, vibrates, and looks like to the characters. 
Write: followed by the genre you are using by using a unique detail of the genre to set the mood or tone for the story.

Explain to the reader how the Fortune attribute affects each of their characters by writing
Only use between 1 and 3 short sentences for this whole section.
At the top of your writing, give a summary using text and emojis.

`

const BEGINNING_JSON = `Only provide a RFC8259 compliant JSON response following this format. 
{
  "summary": "the summary for this section",
  "characters": [
    {
      "name": "character 1",
      "point_of_view": "The point of view for this character, how they interact with the world. Something that will give the reader an idea of the character attitude.",
      "attitude": "",
      "fortune_summary": ""
    },
    {
      "name": "character 2",
      "point_of_view": "",
      "attitude": "",
      "fortune_summary": ""
    }
  ],
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
  "genre": "",
  "fortune": {}
}
The JSON response:`

const CONFLICT_INTRODUCTION = `You are writing another section of the story.
Your job is to open things up by knocking the characters down and bring them up again. 
Make sure you reflect the new Fortune attributes in your writing. . 
Get the characers into conflicts, and write about their struggle by picking from the following list the conflicts that best fit the character.

1 “Milieu”: the conflict is about a place, a destination. Your goal as a writer is to not let the characters reach their goal
2 “Inquiry”: the conflict is about a question that the character has. Your goal as a writer is to not let the charactes reaching the answer they are looking for
3 “Internal:” The conflict happens from within the character. Your goal as a writer is to not let the characters be stable by internal changel. The change can backfire or making them go awry.
4 “Events”: The conflict happens from something or someone external to the character. Your goal as a writer is to stop the characters from restoring the status quo. Characters will have fight scenes or disruptions. 

Write about how this new Fortune affects the characters ability to respond to conflicts. Keep reflecting in your writing the genre and tone you picked at the beginning. 
You have up to 5 sentences. If you have more than 1 Character, create dialogs between them.
At the end of this section, explain to the reader how the new Fortune attribute affects each of their characters"

Summarize the type of conflict with text and the right emoji.

`;

const CONFLICT_INTRODUCTION_JSON = `Only provide a RFC8259 compliant JSON response following this format. 
{
  "summary": "the summary for this section",
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
      "description": ""
    },
    {
      "name": "character 2",
      "description": ""
    }
  ]
}
The JSON response:`

const CONFLICT_RESOLUTION = `Your job is to close conflicts, in the right order as they were opened. 
You have up to 5 sentences. 
You need to mirror the opening in terms of updating the reader on the new state of the characters and the setting. 
Things have shifted in the course of the study and the reader needs to understand how. 
For example, How has the character changed? What are the new actions or reflections of the character? 
Or introduce the updated setting using sensory details. Do not be explicit in calling sensory details by that label, just describe with detail and precision how such details can help the reader understand the change of setting. 
Or Introduce the change of mood and tone in the story by the evolution of the character. Give something specific.

Given the different changes in the characters Fortune, tell me what is the story archeotype.
Give me me a summary of the whole story using short bullets. 
Include emojis, dont be literal about the Fortune attribute in terms of numbers, but write the reflecting of it in the summary. 

`;

const CONFLICT_RESOLUTION_JSON = `Only provide a RFC8259 compliant JSON response following this format. 
{
  "summary": "the summary for this section",
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

const END = `Recomend 3 famous stories that have similar story type or character flow in bullet form."`;

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


const INSTRUCTIONS = [BEGINNING, CONFLICT_INTRODUCTION, CONFLICT_RESOLUTION, END];
const INSTRUCTIONS_JSON = [BEGINNING_JSON, CONFLICT_INTRODUCTION_JSON, CONFLICT_RESOLUTION_JSON, END_JSON];

export function getPreamble(characters, settings) {

    var instructions = PREAMBLE;

    instructions += 'This is the cast of characters:\n';
    characters.forEach(character => {
        instructions += character.name + ' ' + character.description + '\n';
    });

    instructions += 'This is the setting:\n';
    settings.forEach(settings => {
        instructions += settings.name + ' ' + settings.description + '\n';
    });


    return instructions;
}

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