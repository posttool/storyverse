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


export function getPreamble_v1(frameworkName, toneName, characters, settings) {
    var framework = getByName(FRAMEWORKS, frameworkName);
    var tone = getByName(TONE, toneName);

    var instructions = 'You are storybot, a story writing agent. I will give you scenes with characters and settings and you will write a story about it.\n';
    instructions += 'Characters will be listed with attributes. Make sure that the scenes reflect these attributes. ';
    instructions += 'The attributes are (Happiness), (Role Strength), (Dynamism), (Conflict). ';
    instructions += 'Happiness ranges from 0 to 1 with 1 being the happiest and 0 being the most tragic. ';
    instructions += 'Role Strength ranges from 0 to 3 with 3 being a major character and 0 being a minor character. ';
    instructions += 'Dynamism ranges from 0 to 3 with 3 being a crazy and 0 being nada. ';
    instructions += 'Conflict of 0 is external, 1 is internal , and 2 is situational.\n';

    instructions += 'This is the cast of characters:\n';
    characters.forEach(character => {
        instructions += character.name + ' ' + character.description + '\n';
    });

    instructions += 'These are the settings:\n';
    settings.forEach(settings => {
        instructions += settings.name + ' ' + settings.description + '\n';
    });

    instructions += 'Use the following framework and tone to write the story.\n';
    instructions += framework.name + ': ' + framework.description + '\n';
    instructions += tone.name + ': ' + tone.description + '\n';

    return instructions;
}

export function getInstructionForSection_v1(section) {
    var instruction = ''
    instruction += 'Write an outline of major events in scene ' + section.frame + ' of ' + section.frameTotal + '.\n';
    instruction += 'Use less than ' + Math.floor(section.width * 4) + ' events.\n\n'; // why you ignore me so much
    if (section.characters.length != 0) {
        instruction += 'Characters:\n';
        for (let i = 0; i < section.characters.length; i++) {
            var character = section.characters[i];
            instruction += character.name + ':\n';
            for (let q in character.properties) { // properties could be accessed by name for more control
                instruction += '  (' + q + ': ' + character.properties[q].toFixed(1) + ')\n';
            }
            instruction += '\n'
        }
    } else {
        instruction += 'There are no characters in this scene.\n'
    }
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
        instruction += 'There is no specified setting.\n'
    }
    return instruction;
}

/// v2

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
1. Introduce each characters by reflecting their point of view. How they interact with the world. Something that will give the reader an idea of the character attitude. 
2. Introduce the setting by reflecting sensory details of it. Be unique. Details such as how does it feel, smell, sounds, vibrates, and looks like to the characters. 

3. Write: **GENRE**: followed by the genre you are using by using a unique detail of the genre to set the mood or tone for the story.

Explain to the reader how the Fortune attribute affects each of their characters by writing: FORTUNE, Character name, and a short summary.
Only use between 1 and 3 short sentences for this whole section.
At the top of your writing, give a summary using emojis. 

`;

const MIDDLE = `Foget about your previous job, now your job now is to open things up by knocking the characters down and bring them up again. 
Make sure you reflect the new Fortune attributes in your writing. . 
Get the characers into conflicts, and write about their struggle by picking from the following list the conflicts that best fit the character.

1 “Milieu”: the conflict is about a place, a destination. Your goal as a writer is to not let the characters reach their goal
2 “Inquiry”: the conflict is about a question that the character has. Your goal as a writer is to not let the charactes reaching the answer they are looking for
3 “Internal:” The conflict happens from within the character. Your goal as a writer is to not let the characters be stable by internal changel. The change can backfire or making them go awry.
4 “Events”: The conflict happens from something or someone external to the character. Your goal as a writer is to stop the characters from restoring the status quo. Characters will have fight scenes or disruptions. 

Write about how this new Fortune affects the characters ability to respond to conflicts. Keep reflecting in your writing the genre and tone you picked at the beginning. 
You have up to 5 sentences. If you have more than 1 Character, create dialogs between them in the following format: [Character X: , Character Y: ]
At the end of this section write "**FORTUNE** : explaining to the reader how the new Fortune attribute affects each of their characters"
`;

const CONFLICT = `Identify what type of conflict the character has. 
Pick from the following list which conflict fits best for the character. 
1 “Milieu”: the conflict is about a place, a destination. 
2 “Inquiry”: the conflict is about a question that the character has. 
3 “Internal:” The conflict happens from within the character. 
4 “Events”: The conflict happens from something or someone external to the character.

Summarize the type of conflict by saying: "**CONFLICT**: and pick the right emoji"
`;

const END = `Forget about your previous job, now your job is to close conflicts, in the right order as they were opened. 
You have up to 5 sentences. 
You need to mirror the opening in terms of updating the reader on the new state of the characters and the setting. 
Things have shifted in the course of the study and the reader needs to understand how. For example, How has the character changed? What are the new actions or reflections of the character? Or introduce the updated setting using sensory details. Do not be explicit in calling sensory details by that label, just describe with detail and precision how such details can help the reader understand the change of setting. 
Or Introduce the change of mood and tone in the story by the evolution of the character. Give something specific.

Given the different changes in the characters Fortune, tell me what is the story archeotype by writing "** STORY TYPE**: "
Give me me a summary of the whole story using short bullets. Include emojis, dont be literal about the Fortune attribute in terms of numbers, but write the reflecting of it in the summary. Write "** SUMMARY** :"
Write: ** RECOMMENDATIONS FROM PUBLISHED AUTHORS TO MAKE YOU BETTER**: Recomend 3 famous stories that have similar story type or character flow in bullet form.""


Write: "THE END"
`;
// alt end?
// Your job is to close things down. 
// Characters try something and succeed. 
// Your job is to get the character closer to their goal. 
// You have up to 5 sentences. 
// Use phrases like: “Yes, and” (implying the movement towards the goal and the continuation towards the goal) or  “No,but” ( implying that there’s been a reversal that they didn’t think but they still got closer to the goal).


const INSTRUCTIONS = [BEGINNING, MIDDLE + CONFLICT, END];


export function getPreamble(frameworkName, toneName, characters, settings) {

    var instructions = PREAMBLE;

    instructions += 'This is the cast of characters:\n';
    characters.forEach(character => {
        instructions += character.name + ' ' + character.description + '\n';
    });

    instructions += 'This is the setting:\n';
    settings.forEach(settings => {
        instructions += settings.name + ' ' + settings.description + '\n';
    });

    // var framework = getByName(FRAMEWORKS, frameworkName);
    // var tone = getByName(TONE, toneName);
    // instructions += 'Use the following framework and tone to write the story.\n';
    // instructions += framework.name + ': ' + framework.description + '\n';
    // instructions += tone.name + ': ' + tone.description + '\n';

    return instructions;
}

export function getInstructionForSection(section) {
    var instruction = INSTRUCTIONS[section.frame -1];

    if (section.characters.length != 0) {
        instruction += 'Characters:\n';
        for (let i = 0; i < section.characters.length; i++) {
            var character = section.characters[i];
            instruction += character.name + ' (Fortune ' + character.properties['Happiness'] + ')\n';
        }
    } else {
        instruction += 'There are no characters in this scene.\n'
    }
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
        instruction += 'There is no specified setting.\n'
    }
    return instruction;
}