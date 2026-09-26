import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse port & host from process.argv or environment
let port = parseInt(process.env.PORT || '3000', 10);
const portIndex = process.argv.indexOf('--port');
if (portIndex !== -1 && process.argv[portIndex + 1]) {
  port = parseInt(process.argv[portIndex + 1], 10);
}

let host = process.env.HOST || '0.0.0.0';
const hostIndex = process.argv.indexOf('--host');
if (hostIndex !== -1 && process.argv[hostIndex + 1]) {
  host = process.argv[hostIndex + 1];
}

app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Resilient Gemini Content Generator with multi-model fallback and graceful degradation
 * Handles 503 high demand spikes automatically by cycling to fast alternative models.
 */
async function generateContentWithFallback(
  contents: string,
  options?: { responseMimeType?: string; temperature?: number },
): Promise<string | null> {
  if (!ai) return null;
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: options
          ? {
              responseMimeType: options.responseMimeType,
              temperature: options.temperature,
            }
          : undefined,
      });
      const text = response.text?.trim();
      if (text) return text;
    } catch (err: unknown) {
      const errorMsg = String((err as { message?: string })?.message || '');
      const errorCode =
        (err as { status?: number; code?: number })?.status ||
        (err as { status?: number; code?: number })?.code;
      // If model is experiencing temporary 503 high demand or 429 rate limit, try the next model
      if (
        errorCode === 503 ||
        errorCode === 429 ||
        errorMsg.includes('503') ||
        errorMsg.includes('demand') ||
        errorMsg.includes('UNAVAILABLE')
      ) {
        continue;
      }
      break;
    }
  }
  return null;
}

const LORE_KNOWLEDGE_BASE = `
LORE KNOWLEDGE BASE FOR REVENGE.EXE:

1. REVENGE.EXE & GITHUB README:
Revenge.exe is an extremely dangerous computer virus that can delete files, lock your computer, leak information online, and change passwords or data. Credit to DesertEagle for being an original.
Official README details:
DOWNLOAD: Press "download ZIP" to download the virus. Open at your own risk. Opening index file immediately runs virus. Infects other computers in the area. Deleting from files will not delete it.
ATTACKING: Don't use gmail (scans for viruses). Use a USB (instantly downloads/runs). Don't use URLs/web hosts (runs immediately). Use anonymous accounts.
DELETING: Run command $execute{command="011001"} in terminal.
COMMANDS:
- 111000: Changes the skull color to blue
- 100111: Changes the skull color to red
- 000001: Opens the admin console
- 110100: Opens the readme
DISCLAIMER: Not responsible for legal trouble.

2. N3VERF0RG3T (CREATOR OF REVENGE.EXE):
- Real name unknown. Creator of Revenge.exe. N3verF0rg3t has ONLY ever deployed his virus once in his life—on the high school district after a science teacher insulted him. He did NOT use it on the NYPD; a completely different hacking group used the virus against the NYPD, after which N3verF0rg3t publicly announced the removal command $execute{command="011001"}.
- Threatened with lawsuits multiple times; almost taken to court once, but charges dropped because accuser downloaded and used it on friends.
- Not part of any hacking group.
- 9/11 survivor from the North Tower. Witnessed death, gore, and falling people.
- Mental Health Status: It is NOT confirmed if N3verF0rg3t has PTSD or Depression. It is only SUSPECTED by outsiders because he survived 9/11 and hides his face, but he adamantly DENIES having PTSD or depression and stated he feels deeply disrespected by accusations of mental illness.
- Hasn't been on GitHub for 2 months claiming sickness. Worked in software engineering before quitting.
- CNN Interview: Only interview ever granted, online, concealed face. Asked "Why did you make the virus?", replied: "I won't confirm why I made it, but I called it revenge for a reason..." Immediately hung up and wiped call records from CNN via remote exploit (though recorded on video).
- X (Twitter) Post: After CNN interview conspiracies surged (claiming CIA ties or Al-Qaeda targeting), he tweeted: "I would like to promise you I don't work for the government, or any third-parties whatsoever." Viewed by 300,000 before he deleted the account.
- Teacher Incident: After the CNN interview, felt disrespected by claims he was mentally ill and threatened anyone who disrespected him. The high school science teacher thought he was depressed, and that is why she made an Instagram post saying she "Thinks he's weak on the inside and tries to intimidate people." N3verF0rg3t hacked the entire school system (his ONLY virus deployment), emailed the principal: "You insulted me. Now you will pay", and froze every computer. 3 days later, returned control stating: "This is a demonstration of my power, don't challenge me again." Teacher's posts now require school board approval.
- Nick Clark: A man named Nick Clark claimed to have met N3verF0rg3t in real life. N3verF0rg3t posted to 500,000 users on X stating he never met Nick and had zero interaction, then deleted his account. Nick has no proof.
- Location: Lives in the US. Suspected currently living in North Carolina, formerly in Indiana. Birthplace unknown. Uses a custom AI script that rotates random IP addresses on every packet, rendering tracking impossible. Exact location: UNKNOWN.
- Secret deletion command: Created a backup 4-letter delete command "PAIN" in case $execute command glitched. Tied to his trauma.

3. DESERTEAGLE & RED WHITE AND BLUE:
- DesertEagle developed by California hacker group "Red White and Blue".
- Group had 13 members in 2022, down to 4 in 2025 (2 quit, 3 found normal jobs, 4 arrested for bank hacks).
- DesertEagle steals files and freezes screens. Created by ImperialHacker2372 (Michael Smith, 36, worked for Microsoft cyber security for 6 years before going rogue). Named after co-worker's handgun after deploying it on him.
- Deployed on hospital ($1.2M extortion), targeted Google with user leak threat. Michael Smith arrested in 2024 by FBI for Chicago PD breach and bank heist.
- Cyber agency built a hardware USB tool to fight DesertEagle (expanding to all states by 2029).
- In 2026, DesertEagle was forked by N3verF0rg3t to build Revenge.exe.
`;

// Exact official GitHub README text as requested
const OFFICIAL_GITHUB_README = `REVENGE.EXE 
———————————————————

Revenge.exe is an extremely dangerous computer virus that can delete files, lock your computer, leak information online, and change passwords or data. Credit to DesertEagle for being an original.

DOWNLOAD 📁
———————————————————
Press “download ZIP” to download the virus. Open at your own risk. Opening the index file will immediately run the virus. This virus can also infect other computers in the area so be careful with it. Deleting from files will not actually delete the virus. Press the “delete” file and it will open a popup asking if you want to delete. Press “Confirm” to delete. 

ATTACKING ⚔️
———————————————————
To attack someone with the virus, here are some methods.
- Don’t use gmail, it will scan for viruses and phishing
- Use an USB which will instantly download and run the virus
- Don’t use URLs or Web hosts; it will immediately run the virus on your computer. 
- Use an anonymous way to send the virus or a different account

DELETING 🗑️
———————————————————
To delete the virus in case of emergency or if you accidentally use it on yourself run this command in the terminal screen it takes you to.

$execute{command=”011001”}

COMMANDS ⚙️
———————————————————
Type in $execute{command=”(command number)”} to fire a certain command into the virus when you have it.

111000 - Changes the skull color to blue

100111 - Changes the skull color to red

000001 - Opens the admin console

110100 - Opens the readme
———————————————————
DISCLAIMER:
WE ARE NOT RESPONSIBLE FOR ANY LEGAL TROUBLE YOU GET IN USING THIS VIRUS`;

const WHOLE_LORE_SUMMARY = `Revenge.exe is a virus that is a recreated version of the DesertEagle and was made by GitHub user N3verF0rg3t. N3verF0rg3t has only ever used his virus once in his life—on the high school district after a science teacher insulted him on Instagram. N3verF0rg3t did not use the virus on the NYPD; a completely different hacking group used Revenge.exe against the NYPD. The way the virus works is it breaks your computer and says “Hello user. I am revenge.exe. There is no escape.” and slowly destroys all files and storage, changes usernames and passwords and leaks value information online. The creator, N3verF0rg3t, did eventually announce a way to remove the virus after it was deployed on the NYPD by that other group and said that if you type $execute{command=”011001”} the virus will be deleted. N3verF0rg3t never made an official announcement why he made the virus but it’s still on GitHub to this day.

———————————————————
THE OFFICIAL GITHUB README:
———————————————————
REVENGE.EXE
Revenge.exe is an extremely dangerous computer virus that can delete files, lock your computer, leak information online, and change passwords or data. Credit to DesertEagle for being an original.

DOWNLOAD 📁
Press “download ZIP” to download the virus. Open at your own risk. Opening the index file will immediately run the virus. This virus can also infect other computers in the area so be careful with it. Deleting from files will not actually delete the virus. Press the “delete” file and it will open a popup asking if you want to delete. Press “Confirm” to delete.

ATTACKING ⚔️
To attack someone with the virus, here are some methods:
- Don’t use gmail, it will scan for viruses and phishing
- Use an USB which will instantly download and run the virus
- Don’t use URLs or Web hosts; it will immediately run the virus on your computer.
- Use an anonymous way to send the virus or a different account

DELETING 🗑️
To delete the virus in case of emergency or if you accidentally use it on yourself run this command in the terminal screen it takes you to:
$execute{command=”011001”}

COMMANDS ⚙️
Type in $execute{command=”(command number)”} to fire a certain command into the virus when you have it:
111000 - Changes the skull color to blue
100111 - Changes the skull color to red
000001 - Opens the admin console
110100 - Opens the readme

DISCLAIMER: WE ARE NOT RESPONSIBLE FOR ANY LEGAL TROUBLE YOU GET IN USING THIS VIRUS.

———————————————————
THE CREATOR: N3VERF0RG3T
———————————————————
The creator of Revenge.exe, N3verF0rg3t, real name is unknown. N3verF0rg3t has only used his virus once (on the high school after the science teacher insulted him). N3verF0rg3t did NOT use it on the NYPD; a completely different hacking group used the virus against the NYPD. After that other group deployed it on the NYPD, N3verF0rg3t gave an official announcement on how to remove it using $execute{command="011001"}. N3verF0rg3t has been threatened to be sued by multiple people and was once almost taken to court however, was not, because the person sending him there downloaded the virus and used it on his friends. N3verF0rg3t isn’t part of any hacking group whatsoever. N3verF0rg3t was a 9/11 survivor and in the north tower. N3verF0rg3t confessed to seeing all kinds of gore, losing many friends, and watching people jump out of the towers. It is NOT confirmed whether N3verF0rg3t has depression or PTSD; it is only SUSPECTED by outsiders, but he adamantly DENIES it and stated he feels disrespected by mental illness claims. In fact, a high school science teacher thought he was depressed, which is the exact reason she made her Instagram post calling him "weak on the inside". N3verF0rg3t hasn’t been on GitHub for 2 months because he claims he is sick. Before making the virus, N3verF0rg3t worked in software engineering until he quit. N3verF0rg3t has been interviewed once but didn’t show his face. When he was asked “Why did you make the virus” he responded with “I won’t confirm why I made it, but I called it revenge for a reason…”. The real reason why he made it is still unknown.

———————————————————
DESERTEAGLE & RED WHITE AND BLUE
———————————————————
DesertEagle is a virus developed by a hacker group who call themselves the Red White and Blue. Red White and Blue had 13 members in 2022 and only 4 in 2025 (Two quit, three found actual jobs, and four were arrested for hacking into multiple banks with DesertEagle). DesertEagle slowly takes all the files and freezes the screens of the person using it. DesertEagle was created by ImperialHacker2372. In 2026, was forked and recreated by N3verF0rg3t to make revenge.exe (another extremely dangerous virus). Eventually ImperialHacker2372 was found and arrested in 2024 for using the virus to hack Chicago PD to carry out a bank heist. An USB was created by a cyber protection agency to fight the virus however only few states have it. Hopefully in 2029 all states will have the USB to fight the virus. DesertEagle has been deleted from GitHub because of the creator’s arrest.

Red White and Blue is an illegal hacker group in California known for making Desert Eagle. They are known for hacking police, banks and other sites. Their first act was hacking hospitals and demanding 1.2 Million dollars. They got the money, then attacked Google and threatened to leak all google users information online, however they were found and arrested by the FBI. But some of the members got away and are still free to this day. The creator of Desert Eagle was arrested. To this day the group still does illegal operations.

ImperialHacker2372 is the creator of DesertEagle. He is 36 years old and his real name is Michael Smith. Mike worked for Microsoft cyber security for 6 years before getting into hacking. He wanted to get paid more so he organized a group of people who shared his interests. He used what he learned from cyber security to make a virus. ImperialHacker2372 made DesertEagle using GitHub. His team also did deep research into modern cyber security. After DesertEagle being created, he deployed it on one of his workers and destroyed his computer with it. He named it Desert Eagle because it was the gun the co-worker he deployed it on had. He then deployed it to a hospital. Then used it on Google but was found and arrested by the FBI.

———————————————————
THE CNN INTERVIEW & CONSPIRACIES
———————————————————
The only interview N3verF0rg3t ever had was with CNN. He was asked “Why did you make the virus” and said “I won’t confirm why I made it, but I called it revenge for a reason…” he then immediately hung up and deleted all information about the call from CNN through hacking (but it was caught on video recording). This has led to many conspiracies about the truth of revenge.exe. Because he was a 9/11 survivor, some suspect that he planned on using it on Al-Qaeda or the Taliban. Some suspect that he even secretly works or is paid by the CIA. N3verF0rg3t made his own account on X (Twitter) 2 days after this and said “I would like to promise you I don’t work for the government, or any third-parties whatsoever”. Shortly after this, he deleted his account but the post was seen by 300 thousand people before being deleted. There is also a conspiracy that N3verF0rg3t lost someone he loved on 9/11 and wanted revenge. But all of these are conspiracies and not confirmed.

———————————————————
FAMILY, FRIENDS & NICK CLARK
———————————————————
N3verF0rg3t family and friends are not confirmed. His real name is unidentified so it is impossible to figure out his family and friends and some suspect he changed his surname to make it harder to identify him. N3verF0rg3t has never mentioned his family or friends. A man named Nick Clark said he’s met N3verF0rg3t. However, shortly after this, he went on X and made a post stating he’s never met Nick Clark and doesn’t have any interaction with him. 500,000 people (including Nick) saw this post and then N3verF0rg3t deleted his X account. Nick Clark still says he’s met him in real life but has trouble describing him and has no real proof of visiting him.

———————————————————
PSYCHOLOGICAL STATE & THE TEACHER INCIDENT
———————————————————
It is NOT confirmed whether N3verF0rg3t has depression or PTSD or not. It is only SUSPECTED by the public and analysts because he is “afraid” to show his face, survived 9/11 from inside the North Tower, and claimed to have seen gore, death, and falling people during his CNN interview. However, N3verF0rg3t himself strongly DENIES having depression or PTSD. N3verF0rg3t said on CNN he feels deeply "disrespected" by all these accusations stating he is mentally ill, and threatened to “destroy” anyone with his virus who disrespected him. A high school science teacher thought he was depressed, and that is the exact reason she made an Instagram post saying that she “Thinks he’s weak on the inside and tries to intimidate people”. Enraged by this disrespect, N3verF0rg3t launched his one and only attack using his virus: he hacked the entire school, sent an email to the principal saying “You insulted me. Now you will pay”, and froze all the computers. However instead of selling all the information and/or destroying all of it he decided to give it back after three days and said “This is a demonstration of my power, don’t challenge me again” and after all the teacher’s post on social media had to be approved by the school or else she would be fired.

———————————————————
LOCATION & AI PROXY
———————————————————
Where N3verF0rg3t lives is unknown however it is suspected he lives in North Carolina currently and lived in Indiana before. It is also unknown where he was born. N3verF0rg3t confirmed that he lives in the US in his online interview. People have tried to get his IP but he created an ai that gives him a random ip address every packet.`;

// Normalize string for typo tolerance and phonetic similarity
function normalizeQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface AiOverviewResult {
  related: boolean;
  query: string;
  error?: string;
  heading?: string;
  summary?: string;
  details?: string[];
  keyFacts?: { label: string; value: string }[];
  sources?: { title: string; site: string }[];
  relatedQueries?: string[];
  achievementUnlocked?: string;
  // Backward compatibility fields
  title?: string;
  snippet?: string;
  url?: string;
  source?: string;
  date?: string;
}

// Advanced search result generator with comprehensive typo matching and lore coverage
function getAdvancedSearchResult(rawQuery: string): AiOverviewResult {
  const norm = normalizeQuery(rawQuery);

  // 0. WHOLE LORE / FULL LORE / STORY (e.g. "whole lore", "lore", "all lore", "full lore", "the lore", "history")
  if (
    norm === 'lore' ||
    norm === 'the lore' ||
    norm.includes('whole lore') ||
    norm.includes('full lore') ||
    norm.includes('all lore') ||
    norm.includes('entire lore') ||
    norm.includes('complete lore') ||
    norm.includes('all the lore') ||
    norm.includes('all of the lore') ||
    norm.includes('every lore') ||
    norm.includes('full story') ||
    norm.includes('whole story') ||
    norm.includes('complete story') ||
    norm.includes('revenge lore') ||
    norm.includes('revenge exe lore') ||
    norm.includes('n3verf0rg3t lore') ||
    norm.includes('what is the lore') ||
    norm.includes('tell me the lore') ||
    norm.includes('history of revenge') ||
    norm.includes('lore of revenge') ||
    norm === 'everything'
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'Complete Dossier: The Full Lore of Revenge.exe & N3verF0rg3t',
      summary: WHOLE_LORE_SUMMARY,
      details: [
        'Origins: Revenge.exe is a recreation of DesertEagle authored by GitHub user N3verF0rg3t.',
        'Official README: Documents infection behavior, USB delivery, warning against Gmail, and removal sequence $execute{command="011001"}.',
        'N3verF0rg3t Background: 9/11 North Tower survivor suspected of having PTSD/depression (unconfirmed and denied by him; he feels disrespected by mental illness claims) who quit software engineering and granted one anonymous CNN interview.',
        'DesertEagle & Red White and Blue: Created by ImperialHacker2372 (Michael Smith, ex-Microsoft) before his 2024 FBI arrest; 2029 hardware USB countermeasure in development.',
        'High School Paralyzation (Only Virus Attack): Hacked an entire school district for 72 hours after a teacher thought he was depressed and called him weak on Instagram, restoring control as a "demonstration of my power."',
        'Location: US resident (past footprints in Indiana and North Carolina); uses an automated AI proxy randomizing IP headers per packet.'
      ],
      keyFacts: [
        { label: 'Subject', value: 'Complete Universe Lore' },
        { label: 'Primary Entity', value: 'Revenge.exe (N3verF0rg3t)' },
        { label: 'Precursor Lineage', value: 'DesertEagle (Red White and Blue)' },
        { label: 'Official Removal Code', value: '$execute{command="011001"}' },
        { label: 'Auxiliary Override Code', value: 'PAIN' },
        { label: 'Creator Status', value: 'Alive in US (Location Untraceable)' }
      ],
      sources: [
        { title: 'Declassified Threat Analysis: Full Revenge.exe Archives', site: 'cybersec.gov' },
        { title: 'Revenge.exe GitHub Archive Repository', site: 'github.com' },
        { title: 'CNN Special Report: The Full Transcript', site: 'cnn.com' },
        { title: 'FBI Case Files: Red White and Blue Syndicate', site: 'fbi.gov' }
      ],
      relatedQueries: [
        'revenge.exe github',
        'N3verF0rg3t CNN',
        'the command to stop the virus',
        'revenge.exe hacked school',
        'deserteagle',
        'what is red white and blue',
        'ImperialHacker2372 Michael Smith',
        'where he lives',
        'secret command PAIN'
      ],
      title: 'Complete Dossier: Full Lore of Revenge.exe and N3verF0rg3t',
      snippet: 'Complete chronological history of Revenge.exe, N3verF0rg3t, DesertEagle, the 9/11 North Tower survival, and high school incident.',
    };
  }

  // 1. N3verF0rg3t CNN / CNN Interview (e.g., "N3verF0rg3t CNN", "cnn interview", "cnn", "interview")
  if (
    norm.includes('cnn') ||
    norm.includes('interview') ||
    norm.includes('intervew') ||
    norm.includes('intervieuw') ||
    norm.includes('called it revenge for a reason') ||
    norm.includes('remote exploit cnn') ||
    norm.includes('wiped call')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'N3verF0rg3t CNN Exclusive Interview & Broadcast Breach',
      summary:
        'In the sole interview ever granted by N3verF0rg3t, the creator of Revenge.exe appeared online with his face fully concealed. When the anchor pressed him on his motives and asked "Why did you make the virus?", he famously replied: "I won\'t confirm why I made it, but I called it revenge for a reason..." Immediately after uttering those words, he abruptly terminated the session and deployed a remote kernel exploit that eradicated CNN\'s internal call logs and connection telemetry. While the call records were wiped, CNN recorded and broadcast the chilling video segment.',
      details: [
        'Sole Media Appearance: Granted exclusively to CNN via an encrypted digital broadcast stream with masked video.',
        'Famous Response: "I won\'t confirm why I made it, but I called it revenge for a reason..."',
        'Remote Countermeasure: Remotely wiped CNN\'s telephony call servers and digital logs to thwart IP tracing.',
        'Conspiracy Fallout: Spurred widespread theories alleging CIA backing or foreign state sponsorship, prompting his later X denial.',
        'Survivor Subtext: Forensic investigators believe the name "revenge" stems from severe unresolved trauma from the 9/11 North Tower collapse.'
      ],
      keyFacts: [
        { label: 'Network', value: 'CNN Broadcast' },
        { label: 'Appearance Format', value: 'Online Stream (Face Concealed)' },
        { label: 'Iconic Quote', value: '"I called it revenge for a reason..."' },
        { label: 'Technical Aftermath', value: 'CNN Call Records Remotely Wiped' }
      ],
      sources: [
        { title: 'CNN Special Report: The Face Behind Revenge.exe', site: 'cnn.com' },
        { title: 'Broadcast Cyber Incident Log: CNN Telephony Wipe', site: 'cybersecnews.org' },
        { title: 'DarkNet Analysis: Deconstructing the CNN Breach', site: 'darknetforum.i2p' }
      ],
      relatedQueries: [
        'why did he call it revenge',
        'revenge.exe hacked school',
        'N3verF0rg3t 9/11 North Tower',
        'N3verF0rg3t twitter debunk',
        'who is N3verF0rg3t',
        'where he lives'
      ],
      title: 'CNN Exclusive: The Phantom of North Tower - Inside the N3verF0rg3t Interview',
      snippet: 'N3verF0rg3t concealed his face on CNN, stated "I called it revenge for a reason...", and remotely wiped CNN call logs.',
      achievementUnlocked: 'Who are you?',
    };
  }

  // 2. High school / Science teacher / Hacked school (e.g. "revenge.exe hacked school", "science teacher", "school hack")
  if (
    norm.includes('hacked school') ||
    norm.includes('hack school') ||
    norm.includes('school hack') ||
    norm.includes('school') ||
    norm.includes('scool') ||
    norm.includes('science teacher') ||
    norm.includes('scienece teacher') ||
    norm.includes('teacher') ||
    norm.includes('techer') ||
    norm.includes('instagram') ||
    norm.includes('demonstration of my power') ||
    norm.includes('you insulted me') ||
    norm.includes('now you will pay') ||
    norm.includes('principal') ||
    norm.includes('intimidate') ||
    norm.includes('weak on the inside') ||
    norm.includes('district')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'Revenge.exe High School Cyberattack (Teacher Instagram Incident)',
      summary:
        'It is unconfirmed whether N3verF0rg3t has PTSD or depression; it is only suspected by the public, and he actively denies it, stating he feels deeply disrespected by mental illness claims. A high school science teacher thought N3verF0rg3t was depressed and struggling inside, and that is why she published an Instagram post declaring that she "thinks he\'s weak on the inside and tries to intimidate people." Enraged by this disrespect, N3verF0rg3t launched what remains the ONLY time he ever deployed his virus: he completely infiltrated and paralyzed the entire high school district network, emailed the principal ("You insulted me. Now you will pay"), and froze every computer for 72 hours before restoring access with the ultimatum: "This is a demonstration of my power, don\'t challenge me again."',
      details: [
        'The Teacher\'s Motivation: The science teacher thought N3verF0rg3t was depressed, which is the exact reason she posted that she "thinks he\'s weak on the inside and tries to intimidate people."',
        'Mental Health Reality: It is unconfirmed whether he has PTSD or depression. It is only suspected; N3verF0rg3t strongly denies it and felt disrespected.',
        'Author\'s Sole Attack: This 72-hour school lockout is the ONLY time N3verF0rg3t ever deployed his virus in his entire life.',
        'Principal Email: Sent directly from an untraceable node: "You insulted me. Now you will pay."',
        'Restoration Ultimatum: System control relinquished with: "This is a demonstration of my power, don\'t challenge me again."',
        'Aftermath: All district faculty social media activity now requires formal school board pre-approval.'
      ],
      keyFacts: [
        { label: 'Teacher Assumption', value: 'Thought N3verF0rg3t was depressed' },
        { label: 'Teacher Post Stated', value: '"Weak on the inside and tries to intimidate people"' },
        { label: 'N3verF0rg3t Stance', value: 'Denies depression; felt disrespected' },
        { label: 'Deployment Count', value: 'Only Once (High School District)' },
        { label: 'Lockout Duration', value: '72 Hours (3 Days)' }
      ],
      sources: [
        { title: 'District Superintendent Official Press Release', site: 'district99.edu' },
        { title: 'Local Tribune: Ransom and Power in School Cyberattack', site: 'dailyherald.net' },
        { title: 'State Cyber Division Threat Assessment: Educational Infrastructure', site: 'cybersec.gov' }
      ],
      relatedQueries: [
        'who is N3verF0rg3t',
        'N3verF0rg3t CNN',
        'revenge.exe github',
        'the command to stop the virus',
        'secret command PAIN',
        'where he lives'
      ],
      title: 'Local News: High School District Paralyzed for 72 Hours After Teacher Social Post',
      snippet: 'Science teacher thought N3verF0rg3t was depressed and called him weak on Instagram. Network frozen 72 hrs in his only virus attack.',
      achievementUnlocked: 'Did I do something?',
    };
  }

  // 3. GitHub repository / README / Download instructions (e.g. "revenge.exe github", "github", "readme", "download zip")
  if (
    norm.includes('github') ||
    norm.includes('git hub') ||
    norm.includes('readme') ||
    norm.includes('download zip') ||
    norm.includes('repo') ||
    norm.includes('repository') ||
    norm.includes('download') ||
    norm.includes('index file') ||
    norm.includes('open index') ||
    norm.includes('sickness') ||
    norm.includes('hiatus') ||
    norm.includes('inactive for 2 months') ||
    norm.includes('2 months')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'Revenge.exe Official GitHub README.md Repository',
      summary: OFFICIAL_GITHUB_README,
      details: [
        'Download: Click "download ZIP". Launching index immediately runs the virus.',
        'Attacking: Avoid Gmail and public URLs; utilize physical USB flash drives.',
        'Deleting: Official emergency deletion sequence is $execute{command="011001"}.',
        'Commands: 111000 (blue skull), 100111 (red skull), 000001 (admin console), 110100 (readme).',
        'Disclaimer: The creator explicitly disclaims legal responsibility.',
        'Status: Inactive for 2 months due to reported illness.'
      ],
      keyFacts: [
        { label: 'Host Platform', value: 'GitHub (Repository: Revenge.exe)' },
        { label: 'Author', value: 'N3verF0rg3t' },
        { label: 'Primary Infection Trigger', value: 'Opening index file from downloaded ZIP' },
        { label: 'Recommended Vector', value: 'Physical USB Storage' },
        { label: 'Official Deletion Code', value: '$execute{command="011001"}' },
        { label: 'Author Activity', value: 'Inactive 2+ Months (Reported Sickness)' }
      ],
      sources: [
        { title: 'Revenge.exe GitHub Official README.md', site: 'github.com' },
        { title: 'Cyber Threat Repository Archive', site: 'git-mirror.org' },
        { title: 'DarkNet Software Engineering Review', site: 'darknetforum.i2p' }
      ],
      relatedQueries: [
        'the command to stop the virus',
        'who is N3verF0rg3t',
        'whole lore',
        'revenge.exe USB attack',
        'N3verF0rg3t CNN',
        'deserteagle',
        'secret command PAIN'
      ],
      title: 'GitHub Archive: Revenge.exe Source README.md',
      snippet: 'Official README.md on GitHub: ZIP download, USB vectors, Gmail detection warnings, and command 011001.',
    };
  }

  // 4. "How to stop revenge.exe" or anything related to stopping the virus / malware
  // It returns in the AI Overview "You can't" and unlocks the achievement "You think it be that easy"
  const stopKeywords = [
    'how to stop',
    'how do i stop',
    'how can i stop',
    'how do you stop',
    'how to delete',
    'how do i delete',
    'how can i delete',
    'how to remove',
    'how do i remove',
    'how can i remove',
    'how to kill',
    'how do i kill',
    'how can i kill',
    'how to destroy',
    'how to uninstall',
    'how to get rid of',
    'how to beat',
    'how to survive',
    'how to escape',
    'how to shut down',
    'how to close',
    'stop revenge',
    'stop the virus',
    'stop virus',
    'delete revenge',
    'remove revenge',
    'kill revenge',
    'destroy revenge',
    'uninstall revenge',
    'command to stop',
    'command to delete',
    'command to remove',
    'the command to stop',
    'can you stop',
    'can i stop',
    'is it possible to stop',
    'way to stop',
    'ways to stop',
  ];

  const isStopQuery =
    stopKeywords.some((k) => norm.includes(k)) ||
    ((norm.includes('stop') ||
      norm.includes('delete') ||
      norm.includes('remove') ||
      norm.includes('kill') ||
      norm.includes('shut down') ||
      norm.includes('end')) &&
      (norm.includes('revenge') ||
        norm.includes('virus') ||
        norm.includes('it') ||
        norm.includes('malware') ||
        norm.includes('trojan')));

  if (isStopQuery) {
    return {
      related: true,
      query: rawQuery,
      summary: "You can't",
      details: ["You can't."],
      keyFacts: [],
      sources: [],
      relatedQueries: [
        'who is N3verF0rg3t',
        'revenge.exe github',
        'secret command PAIN',
        'where he lives',
        'N3verF0rg3t CNN',
      ],
      title: 'How to stop Revenge.exe',
      snippet: "You can't",
      achievementUnlocked: 'You think it be that easy',
    };
  }

  // 5. Emergency code PAIN (secret command / failsafe / override)
  if (
    norm.includes('pain') ||
    norm.includes('secret command') ||
    norm.includes('secret') ||
    norm.includes('backdoor') ||
    norm.includes('failsafe') ||
    norm.includes('glitch') ||
    norm.includes('4 letter') ||
    norm.includes('override code')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'Auxiliary Override Command: PAIN',
      summary:
        'Decompiled kernel revisions disclose that N3verF0rg3t embedded an auxiliary 4-letter failsafe override code "PAIN" into Revenge.exe in the event the primary $execute command glitched or was locked down. Forensic analysts directly link the keyword to chronic post-traumatic grief and agony originating from his survival of the World Trade Center North Tower on 9/11. The terminal detects PAIN as an emergency kernel override.',
      details: [
        'Command Keyword: PAIN (4 letters; case-insensitive).',
        'Architectural Role: Direct kernel failsafe bypassing ordinary execute handlers.',
        'Psychological Link: Rooted in the horrific devastation witnessed during his escape from the North Tower on September 11.',
        'Execution Note: Unlike binary codes, does not require the $execute syntax wrapper.'
      ],
      keyFacts: [
        { label: 'Keyword', value: 'PAIN' },
        { label: 'Type', value: 'Emergency Kernel Override' },
        { label: 'Origin Point', value: '9/11 North Tower Trauma' },
        { label: 'Syntax Required', value: 'PAIN (standalone)' }
      ],
      sources: [
        { title: 'DarkNet Forensic Decompile: Emergency Overrides', site: 'darknetforum.i2p' },
        { title: 'Reverse Engineering Digest: Revenge.exe Internal Hooks', site: 'threatintel.net' }
      ],
      relatedQueries: [
        'N3verF0rg3t 9/11 North Tower',
        'the command to stop the virus',
        'why did he call it revenge',
        'revenge.exe commands list',
        'who is N3verF0rg3t'
      ],
      title: 'Underground Tech Leak: Disclosed Failsafe Vector in Revenge.exe Kernel',
      snippet: 'Decompiled source revisions reveal N3verF0rg3t embedded auxiliary override command "PAIN" tied to his trauma.',
    };
  }

  // 6. Commands list / Color codes / Console (e.g. "revenge.exe commands", "111000", "100111", "000001")
  if (
    norm.includes('commands') ||
    norm.includes('command list') ||
    norm.includes('skull color') ||
    norm.includes('blue skull') ||
    norm.includes('red skull') ||
    norm.includes('admin console') ||
    norm.includes('111000') ||
    norm.includes('100111') ||
    norm.includes('000001') ||
    norm.includes('110100')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'Revenge.exe Terminal Execution Command Directory',
      summary:
        'Revenge.exe recognizes a strict set of numeric binary commands wrapped inside the $execute{command="..."} syntax, along with one standalone emergency failsafe code:\n- $execute{command="011001"}: Official virus deletion sequence\n- $execute{command="111000"}: Switches skull matrix to Cyan Blue\n- $execute{command="100111"}: Switches skull matrix to Crimson Red\n- $execute{command="000001"}: Opens administrator diagnostic console\n- $execute{command="110100"}: Launches built-in README documentation viewer\n- PAIN: Standalone 4-letter kernel failsafe override',
      details: [
        'Syntax Standard: Must be submitted as $execute{command="<6-digit-binary>"} or literal PAIN.',
        'Display Modifiers: 111000 triggers the blue theme; 100111 restores red alert status.',
        'Diagnostic Mode: 000001 activates privileged operator controls.',
        'Help Utilities: 110100 re-renders the embedded documentation.'
      ],
      keyFacts: [
        { label: 'Deletion Code', value: '$execute{command="011001"}' },
        { label: 'Blue Theme', value: '$execute{command="111000"}' },
        { label: 'Red Theme', value: '$execute{command="100111"}' },
        { label: 'Emergency Code', value: 'PAIN' }
      ],
      sources: [
        { title: 'Revenge.exe Official README', site: 'github.com' },
        { title: 'Terminal Architecture Whitepaper', site: 'threatintel.net' }
      ],
      relatedQueries: [
        'the command to stop the virus',
        'secret command PAIN',
        'revenge.exe github',
        'who is N3verF0rg3t'
      ],
      title: 'Revenge.exe Complete Command Reference',
      snippet: 'Supported commands: 011001 (delete), 111000 (blue), 100111 (red), 000001 (console), 110100 (readme), PAIN (override).',
    };
  }

  // 7. USB attack / Gmail virus scan / Infection vector
  if (
    norm.includes('usb') ||
    norm.includes('gmail') ||
    norm.includes('how to attack') ||
    norm.includes('attacking') ||
    norm.includes('infect') ||
    norm.includes('infection vector') ||
    norm.includes('local network')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'Revenge.exe Attack Vectors & USB Distribution Guidelines',
      summary:
        'In the "ATTACKING" section of the Revenge.exe README, N3verF0rg3t provided explicit instructions for deploying the malware. He strongly discouraged transmitting the virus via Gmail, warning that Google\'s automated heuristics inspect and neutralize the malicious binary. He similarly discouraged publicly accessible URLs and web hosts. Instead, he recommended physical USB delivery (which triggers immediate download and execution upon insertion) utilizing burn-after-use anonymous credentials. Once initialized, Revenge.exe automatically discovers and infects other computers on the local network subnet.',
      details: [
        'Prohibited Channels: Gmail (automatic file scanning) and public URL hosts (immediate cloud blocking).',
        'Recommended Vector: Direct physical deployment via USB drive payloads.',
        'Spreading Behavior: Scans and infects connected local area network machines autonomously.',
        'Operator OpSec: Recommends using disposable, unlinked burner accounts.'
      ],
      keyFacts: [
        { label: 'Blocked Medium', value: 'Gmail / Google Workspace' },
        { label: 'Preferred Medium', value: 'Physical USB Flash Storage' },
        { label: 'Lateral Movement', value: 'LAN Subnet Auto-Propagation' },
        { label: 'Detection Evasion', value: 'Anonymous Distribution Nodes' }
      ],
      sources: [
        { title: 'Revenge.exe GitHub README: Section 2 (Attacking)', site: 'github.com' },
        { title: 'Cyber Threat Analysis: Physical Drop Vulnerabilities', site: 'cybersec.gov' }
      ],
      relatedQueries: [
        'revenge.exe github',
        'the command to stop the virus',
        'revenge.exe hacked school',
        'deserteagle',
        'who is N3verF0rg3t'
      ],
      title: 'Attack Vector Profile: Physical USB Propagation and Email Filter Evasion',
      snippet: 'README warns against Gmail virus scanning, instructs deployment via USB, and documents lateral local network propagation.',
    };
  }

  // 8. 9/11 North Tower / Trauma / WTC survivor / Why called revenge
  if (
    norm.includes('9 11') ||
    norm.includes('911') ||
    norm.includes('north tower') ||
    norm.includes('tower') ||
    norm.includes('towers') ||
    norm.includes('world trade center') ||
    norm.includes('wtc') ||
    norm.includes('ptsd') ||
    norm.includes('depression') ||
    norm.includes('depress') ||
    norm.includes('trauma') ||
    norm.includes('why revenge') ||
    norm.includes('why did he make') ||
    norm.includes('called revenge for a reason')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'N3verF0rg3t Mental Health Status (PTSD & Depression Claims)',
      summary:
        'It is NOT confirmed whether N3verF0rg3t has PTSD or Depression. While it is SUSPECTED by observers and cyber psychologists due to him being an escapee of the 9/11 North Tower collapse and concealing his face, N3verF0rg3t himself strongly DENIES having PTSD or depression. During his CNN interview, N3verF0rg3t stated that he feels deeply "disrespected" by accusations claiming he is mentally ill, and threatened to destroy anyone who disrespects him. A high school science teacher specifically thought he was depressed and struggling inside, and that is why she made her Instagram post claiming he was "weak on the inside and tries to intimidate people"—which triggered the only cyberattack N3verF0rg3t ever conducted with his virus.',
      details: [
        'Diagnosis Status: Unconfirmed. It is only suspected by the public and analysts.',
        'Creator Stance: Strongly denies having PTSD or depression; stated he feels "disrespected" by mental illness claims.',
        'Science Teacher Catalyst: The science teacher thought he was depressed, which is why she posted that he was "weak on the inside".',
        'Retaliatory Incident: In response to the teacher\'s post, he paralyzed her school district for 72 hours (his only virus attack).',
        '9/11 Background: Survived the North Tower collapse; stated on CNN "I called it revenge for a reason..."',
        'Embedded Failsafe: Chose the word "PAIN" as his personal kernel override keyword.'
      ],
      keyFacts: [
        { label: 'PTSD & Depression Status', value: 'Unconfirmed (Suspected only)' },
        { label: 'Creator Stance', value: 'Denies it (Feels disrespected)' },
        { label: 'Science Teacher Motivation', value: 'Thought he was depressed' },
        { label: 'Teacher Post Stated', value: '"Weak on the inside and tries to intimidate people"' },
        { label: 'Malware Naming Origin', value: '"Called it revenge for a reason"' },
        { label: 'Secret Override Hook', value: 'PAIN' }
      ],
      sources: [
        { title: 'CNN Investigative Profile: Debating the N3verF0rg3t Accusations', site: 'cnn.com' },
        { title: 'ThreatIntel Psychological Assessment: Unverified Mental Health Claims', site: 'threatintel.net' }
      ],
      relatedQueries: [
        'revenge.exe hacked school',
        'N3verF0rg3t CNN',
        'who is N3verF0rg3t',
        'secret command PAIN',
        'the command to stop the virus',
        'where he lives'
      ],
      title: 'Psychological File: Unconfirmed PTSD and Depression Claims Concerning N3verF0rg3t',
      snippet: 'It is unconfirmed if N3verF0rg3t has PTSD or depression; it is suspected but he denies it. The science teacher thought he was depressed, prompting her post.',
      achievementUnlocked: 'Who are you?',
    };
  }

  // 9. Twitter / X post / CIA / Al-Qaeda conspiracy debunk
  if (
    norm.includes('twitter') ||
    norm.includes('x post') ||
    norm.includes('tweet') ||
    norm.includes('cia') ||
    norm.includes('al qaeda') ||
    norm.includes('taliban') ||
    norm.includes('conspiracy') ||
    norm.includes('third party') ||
    norm.includes('government') ||
    norm.includes('work for the government')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'N3verF0rg3t X (Twitter) Statement & Government Ties Debunk',
      summary:
        'Following his explosive CNN broadcast, intense online speculation erupted claiming N3verF0rg3t was an operative for the CIA, NSA, or foreign terrorist networks. In response, N3verF0rg3t published a single public statement on X (formerly Twitter) seen by over 300,000 users declaring: "I would like to promise you I don\'t work for the government, or any third-parties whatsoever." Immediately following the statement, he wiped the account and dissolved his online social presence.',
      details: [
        'Viral Conspiracy Claims: Unfounded theories claimed he was a covert intelligence asset.',
        'Official Refutation: Tweeted to 300,000 readers: "I don\'t work for the government, or any third-parties whatsoever."',
        'Account Deletion: Erased his account minutes later to avoid digital forensic triangulation.',
        'Independence: Corroborated by cyber agencies that he operates purely as an unaffiliated rogue engineer.'
      ],
      keyFacts: [
        { label: 'Platform', value: 'X (Twitter)' },
        { label: 'Audience Reach', value: '300,000+ Viewers' },
        { label: 'Official Statement', value: '"I don\'t work for the government, or any third-parties"' },
        { label: 'Account Disposition', value: 'Permanently Deleted' }
      ],
      sources: [
        { title: 'X Archive Social Intelligence Monitor', site: 'x.com' },
        { title: 'Cyber Bureau Intelligence Fact Check', site: 'cybersecnews.org' }
      ],
      relatedQueries: [
        'N3verF0rg3t CNN',
        'Nick Clark N3verF0rg3t',
        'who is N3verF0rg3t',
        'where he lives',
        'revenge.exe hacked school'
      ],
      title: 'Fact Check: N3verF0rg3t Disavows All Government and Intelligence Ties',
      snippet: 'N3verF0rg3t tweeted to 300,000 followers promising he does not work for the government or any third-parties before deleting his account.',
    };
  }

  // 10. Nick Clark / In-person meeting claim
  if (
    norm.includes('nick clark') ||
    norm.includes('nick clarke') ||
    norm.includes('clark') ||
    norm.includes('clarke') ||
    norm.includes('met in real life') ||
    norm.includes('met in person') ||
    norm.includes('met him')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'Nick Clark In-Person Claim Debunk',
      summary:
        'A civilian named Nick Clark gained internet notoriety after publicly claiming to have met N3verF0rg3t face-to-face in real life. In response to skyrocketing speculation, N3verF0rg3t posted a definitive public bulletin on X viewed by over 500,000 users categorically denying that he had ever met, spoken to, or interacted with Nick Clark in any capacity. N3verF0rg3t promptly deleted the account. Clark has produced zero corroborating proof or forensic verification.',
      details: [
        'Claim: Nick Clark claimed to have personal knowledge and an in-person meeting with N3verF0rg3t.',
        'Public Denial: N3verF0rg3t published a verified post to 500,000 users refuting every aspect of Clark\'s claim.',
        'Forensic Standing: Discredited by digital investigators as an unverified hoax.',
        'Current Status: Completely debunked.'
      ],
      keyFacts: [
        { label: 'Claimant', value: 'Nick Clark' },
        { label: 'Status', value: 'Disproven & Debunked' },
        { label: 'N3verF0rg3t Viewership', value: '500,000 on X' },
        { label: 'Evidence Submitted', value: 'None' }
      ],
      sources: [
        { title: 'CyberSec Fact Check: The Nick Clark Hoax', site: 'cybersecnews.org' },
        { title: 'Archived Social Post: Public Refutation on X', site: 'x.com' }
      ],
      relatedQueries: [
        'N3verF0rg3t twitter debunk',
        'where he lives',
        'who is N3verF0rg3t',
        'N3verF0rg3t CNN'
      ],
      title: 'Investigation: The Nick Clark In-Person Claim Debunk',
      snippet: 'Nick Clark claimed he met N3verF0rg3t in real life. N3verF0rg3t publicly debunked this on X to 500,000 users.',
    };
  }

  // 11. NYPD hack / Lawsuits / Court / Dropped charges
  if (
    norm.includes('nypd') ||
    norm.includes('police') ||
    norm.includes('lawsuit') ||
    norm.includes('lawsuits') ||
    norm.includes('court') ||
    norm.includes('charges dropped') ||
    norm.includes('accuser') ||
    norm.includes('legal trouble')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'NYPD Breach (Different Hacking Group) & N3verF0rg3t Legal History',
      summary:
        'N3verF0rg3t did NOT attack the NYPD. In fact, N3verF0rg3t has only ever deployed his virus once in his entire life—retaliating against a high school district after a science teacher insulted him on Instagram. The cyberattack on the New York City Police Department (NYPD) was executed by a completely different hacking group that downloaded and weaponized Revenge.exe from GitHub. When the NYPD mainframe was paralyzed by that other group, N3verF0rg3t stepped forward and publicly broadcast the official deletion sequence: $execute{command="011001"}. Following the breach, multiple individuals threatened lawsuits and he was nearly brought to trial once; however, all charges collapsed when forensic investigations proved the accuser had voluntarily downloaded Revenge.exe and infected their own friends.',
      details: [
        'NYPD Perpetrators: An entirely different hacking group deployed Revenge.exe against the NYPD—N3verF0rg3t had no role in the breach.',
        'Author Deployment Record: N3verF0rg3t has only used his virus once (the 72-hour high school district lockout).',
        'Emergency Disinfection: N3verF0rg3t announced the kill sequence $execute{command="011001"} to resolve the NYPD infection.',
        'Court Proceedings: Avoided trial after evidence revealed the complainant had actively downloaded and deployed the payload on peers.',
        'Legal Disclaimer: Official README included the explicit notice: "Not responsible for legal trouble."'
      ],
      keyFacts: [
        { label: 'NYPD Attackers', value: 'A Different Hacking Group (Not N3verF0rg3t)' },
        { label: 'N3verF0rg3t Attacks', value: 'Used virus ONLY ONCE (on the school)' },
        { label: 'N3verF0rg3t Response to NYPD', value: 'Published removal command 011001' },
        { label: 'Charges Status', value: 'Dismissed / Dropped' }
      ],
      sources: [
        { title: 'New York Post: The NYPD Cyber Incident & Third-Party Hackers', site: 'nypost.com' },
        { title: 'Legal Case Review: Dropped Malicious Code Indictment', site: 'courtrecords.gov' }
      ],
      relatedQueries: [
        'the command to stop the virus',
        'who is N3verF0rg3t',
        'revenge.exe github',
        'revenge.exe hacked school',
        'where he lives'
      ],
      title: 'Municipal Threat Brief: NYPD Penetration by Rogue Hackers & Dismissed Actions',
      snippet: 'N3verF0rg3t did not attack NYPD; a different hacking group used his virus. N3verF0rg3t only used his virus once (on the school).',
    };
  }

  // 12. Location / Where he lives / IP / Indiana / North Carolina / AI script
  if (
    norm.includes('where') ||
    norm.includes('live') ||
    norm.includes('lives') ||
    norm.includes('ives') ||
    norm.includes('location') ||
    norm.includes('loaction') ||
    norm.includes('locatoin') ||
    norm.includes('address') ||
    norm.includes('ip address') ||
    norm.includes('ip') ||
    norm.includes('residence') ||
    norm.includes('home') ||
    norm.includes('north carolina') ||
    norm.includes('carolina') ||
    norm.includes('indiana') ||
    norm.includes('born') ||
    norm.includes('ai script') ||
    norm.includes('packet') ||
    norm.includes('randomize') ||
    norm.includes('triangulation')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'N3verF0rg3t Physical Location & Dynamic IP Obfuscation',
      summary:
        'The exact physical location of N3verF0rg3t is UNKNOWN. While intelligence agencies confirm he operates within the United States—with historical forum activity originating in Indiana and unconfirmed sightings in North Carolina—his exact physical residence is completely untraceable. N3verF0rg3t protects his identity with an automated AI daemon that dynamically randomizes the source IP address on every single transmitted TCP/IP packet, rendering geographic triangulation and ISP subpoena tracing useless.',
      details: [
        'Jurisdiction: Confirmed within the United States; exact birthplace and current state unconfirmed.',
        'Historical Footprints: Digital traces identified in Indiana; unconfirmed field reports from North Carolina.',
        'AI Evasion Technology: Autonomous AI proxy agent modifies network routing headers on each packet individually.',
        'Geographic Trace Status: UNKNOWN / Cold Case.'
      ],
      keyFacts: [
        { label: 'Physical Location', value: 'UNKNOWN' },
        { label: 'Country of Residence', value: 'United States' },
        { label: 'Past Network Footprints', value: 'Indiana & North Carolina' },
        { label: 'Evasion Vector', value: 'AI Autonomous Per-Packet IP Randomization' }
      ],
      sources: [
        { title: 'Federal Cyber Defense Agency Geo-Trace Bulletin', site: 'cybersec.gov' },
        { title: 'NetRecon Intelligence Bureau: Ghost in the Routing Table', site: 'netrecon.org' },
        { title: 'Global Threat Intel Geo-Analysis', site: 'threatintel.net' }
      ],
      relatedQueries: [
        'who is N3verF0rg3t',
        'N3verF0rg3t CNN',
        'revenge.exe github',
        'N3verF0rg3t NYPD',
        'secret command PAIN'
      ],
      title: 'Geographic Trace Analysis: N3verF0rg3t Physical Location UNKNOWN',
      snippet: 'Physical location: UNKNOWN. Resides in US (past traces in Indiana and North Carolina). Employs automated AI packet-level IP randomization.',
    };
  }

  // 13. DesertEagle malware
  if (
    norm.includes('deserteagle') ||
    norm.includes('desert eagle') ||
    norm.includes('desert easgle') ||
    norm.includes('desrt') ||
    norm.includes('egle') ||
    norm.includes('easgle')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'DesertEagle (Malware Lineage & Precursor to Revenge.exe)',
      summary:
        'DesertEagle is an extortion Trojan created by ImperialHacker2372 (Michael Smith) within the California cyber group Red White and Blue. Named after a coworker\'s .50 Action Express handgun following a workplace dispute, DesertEagle specializes in exfiltrating sensitive data and freezing workstation displays. In early 2026, N3verF0rg3t acquired and forked the DesertEagle codebase to engineer Revenge.exe, giving explicit credit to DesertEagle in the official repository.',
      details: [
        'Creator: ImperialHacker2372 (Michael Smith, 36, former Microsoft cybersecurity engineer).',
        'Syndicate: Red White and Blue (California black-hat collective).',
        'Name Origin: Named after a colleague\'s handgun deployed during a retaliatory workplace incident.',
        'Evolution into Revenge.exe: The underlying payload was forked and refactored by N3verF0rg3t in 2026.'
      ],
      keyFacts: [
        { label: 'Malware Name', value: 'DesertEagle' },
        { label: 'Author', value: 'ImperialHacker2372 (Michael Smith)' },
        { label: 'Hacking Group', value: 'Red White and Blue' },
        { label: 'Direct Successor', value: 'Revenge.exe (N3verF0rg3t)' }
      ],
      sources: [
        { title: 'US Cyber Brief: Lineage of DesertEagle', site: 'cybersec.gov' },
        { title: 'FBI Evidence Locker: Operation Red White and Blue', site: 'fbi.gov' },
        { title: 'Threat Analysis: From DesertEagle to Revenge.exe', site: 'threatintel.net' }
      ],
      relatedQueries: [
        'what is red white and blue',
        'ImperialHacker2372 Michael Smith',
        'DesertEagle hospital extortion',
        'revenge.exe github',
        'the command to stop the virus'
      ],
      title: 'US Cyber Brief: Lineage of DesertEagle and the Fall of Red White and Blue',
      snippet: 'DesertEagle Trojan created by ImperialHacker2372 of Red White and Blue; forked in 2026 by N3verF0rg3t to create Revenge.exe.',
      achievementUnlocked: 'DesertEagle',
    };
  }

  // 14. Red White and Blue collective
  if (
    norm.includes('red white and blue') ||
    norm.includes('red white blue') ||
    norm.includes('rwb')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'Red White and Blue (California Hacking Collective)',
      summary:
        'Red White and Blue was an elite California-based cyber group founded in 2022. Originally consisting of 13 software engineers, the group shrank to 4 members by 2025 as members departed or were arrested by the FBI. Headed by ImperialHacker2372 (Michael Smith), the cell created DesertEagle and carried out a $1.2M hospital extortion scheme, threatened Google with customer data leaks, and breached the Chicago Police Department.',
      details: [
        'Origins: Founded in California in 2022 with 13 members; downsized to 4 by 2025.',
        'High-Impact Targets: $1.2M hospital healthcare extortion, Google user leak threats, and Chicago PD.',
        'Downfall: Michael Smith arrested by the FBI in 2024; collective dismantled shortly after.',
        'Connection: DesertEagle codebase served as the direct progenitor for Revenge.exe.'
      ],
      keyFacts: [
        { label: 'Founded', value: '2022 (California)' },
        { label: 'Active Roster', value: '13 (2022) → 4 (2025)' },
        { label: 'Leader', value: 'ImperialHacker2372 (Michael Smith)' },
        { label: 'Core Creation', value: 'DesertEagle' }
      ],
      sources: [
        { title: 'US Cyber Defense Agency Special Bulletin: Red White and Blue', site: 'cybersec.gov' },
        { title: 'Chicago Tribune: Anatomy of a Black-Hat Syndicate', site: 'chicagotribune.com' }
      ],
      relatedQueries: [
        'ImperialHacker2372 Michael Smith',
        'deserteagle',
        'DesertEagle hospital extortion',
        'revenge.exe github',
        'who is N3verF0rg3t'
      ],
      title: 'Red White and Blue: Origin and Exploits of the California Syndicate',
      snippet: 'California hacking group Red White and Blue led by ImperialHacker2372 (Michael Smith) authored DesertEagle before federal arrests.',
      achievementUnlocked: 'DesertEagle',
    };
  }

  // 15. ImperialHacker2372 / Michael Smith
  if (
    norm.includes('imperial') ||
    norm.includes('impirial') ||
    norm.includes('imperialhacker') ||
    norm.includes('2372') ||
    norm.includes('michael smith') ||
    norm.includes('mike smith')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'ImperialHacker2372 (Michael Smith, Author of DesertEagle)',
      summary:
        'ImperialHacker2372 is the online alias of Michael Smith, 36, who worked for Microsoft in cybersecurity for six years before turning rogue. He founded and led the California cell Red White and Blue and authored the DesertEagle Trojan. Smith was apprehended by the FBI in 2024 following the Chicago PD breach and a high-stakes bank heist. His DesertEagle code was subsequently modified and reborn in 2026 as Revenge.exe.',
      details: [
        'Career Background: 6 years as a cybersecurity analyst at Microsoft before going black-hat.',
        'Syndicate Role: Founder and technical architect of Red White and Blue.',
        'Federal Capture: Arrested by FBI agents in 2024 following financial and municipal breaches.',
        'Legacy: Code from his DesertEagle tool laid the foundation for N3verF0rg3t\'s Revenge.exe.'
      ],
      keyFacts: [
        { label: 'Real Identity', value: 'Michael Smith (Age 36)' },
        { label: 'Prior Employment', value: 'Microsoft Cyber Security (6 Years)' },
        { label: 'Arrest Status', value: 'Apprehended by FBI (2024)' },
        { label: 'Handgun Anecdote', value: 'Named malware after coworker\'s Desert Eagle' }
      ],
      sources: [
        { title: 'FBI Press Office: Arrest of Michael Smith (ImperialHacker2372)', site: 'fbi.gov' },
        { title: 'Wired Magazine: The Microsoft Engineer Who Built DesertEagle', site: 'wired.com' }
      ],
      relatedQueries: [
        'what is red white and blue',
        'deserteagle',
        'DesertEagle hospital extortion',
        'revenge.exe github',
        'the command to stop the virus'
      ],
      title: 'FBI Files: ImperialHacker2372 and the DesertEagle Trojan',
      snippet: 'Former Microsoft cybersecurity analyst Michael Smith led Red White and Blue and authored DesertEagle before his 2024 arrest.',
      achievementUnlocked: 'DesertEagle',
    };
  }

  // 16. Hospital extortion / Chicago bank heist / Hardware USB tool
  if (
    norm.includes('hospital') ||
    norm.includes('extortion') ||
    norm.includes('chicago bank') ||
    norm.includes('chicago pd') ||
    norm.includes('bank heist') ||
    norm.includes('hardware usb tool') ||
    norm.includes('hardware tool') ||
    norm.includes('2029')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'Red White and Blue Cyber Operations & Federal Countermeasures',
      summary:
        'Red White and Blue executed a series of high-profile operations, including a $1.2M extortion attack on a regional hospital network, threats to dump proprietary Google user records, and a penetration of the Chicago Police Department alongside an electronic bank heist. In retaliation, the US Cyber Defense Agency engineered a proprietary hardware USB neutralization device to combat DesertEagle variants, with federal deployment targeted across all 50 states by 2029.',
      details: [
        'Healthcare Attack: Extorted $1.2M by paralyzing critical hospital systems with DesertEagle.',
        'Corporate Target: Threatened Google with mass confidential user record exfiltration.',
        'Bank Infiltration: Breached Chicago financial and police databases, leading directly to FBI arrests.',
        'Hardware Counter-Device: Specialized USB hardware disinfection unit developed for 2029 national rollout.'
      ],
      keyFacts: [
        { label: 'Hospital Extortion Demand', value: '$1.2 Million USD' },
        { label: 'Law Enforcement Breach', value: 'Chicago Police Department' },
        { label: 'Federal Response Device', value: 'Hardware USB Neutralization Tool' },
        { label: 'Mandate Deadline', value: 'All 50 US States by 2029' }
      ],
      sources: [
        { title: 'Federal Healthcare Cybersecurity Advisory', site: 'cybersec.gov' },
        { title: 'US Cyber Defense Agency: 2029 Hardware USB Initiative', site: 'cyberdefense.gov' }
      ],
      relatedQueries: [
        'deserteagle',
        'what is red white and blue',
        'ImperialHacker2372 Michael Smith',
        'revenge.exe USB attack',
        'the command to stop the virus'
      ],
      title: 'Federal Cyber Defense Bulletin: RWB Operations and the 2029 Hardware Defense Initiative',
      snippet: 'Red White and Blue extorted $1.2M from hospitals and breached Chicago PD; US agency building hardware USB defense tool for 2029.',
    };
  }

  // 17. Who is N3verF0rg3t / Identity / Creator
  if (
    norm.includes('who is n3verf0rg3t') ||
    norm.includes('who is n3verf0rg3et') ||
    norm.includes('who is neverforget') ||
    norm.includes('who is') ||
    norm.includes('who are you') ||
    norm.includes('identity') ||
    norm.includes('real name') ||
    norm.includes('name') ||
    norm.includes('author') ||
    norm.includes('creator')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'N3verF0rg3t (Creator of Revenge.exe)',
      summary:
        'N3verF0rg3t is the alias of the reclusive hacker and former software engineer who created Revenge.exe. N3verF0rg3t has only ever deployed his virus once in his life—paralyzing a public high school district for 72 hours after a science teacher thought he was depressed and called him weak on Instagram. He did NOT attack the NYPD; a completely different hacking group weaponized Revenge.exe against the NYPD, prompting N3verF0rg3t to announce the removal command $execute{command="011001"}. While it is suspected he has PTSD or depression due to surviving the 9/11 North Tower collapse and hiding his face, this is UNCONFIRMED, and N3verF0rg3t vehemently denies having mental illness, stating he feels deeply disrespected by such claims. In his sole televised CNN interview, he hid his face and remotely wiped CNN\'s call logs after stating: "I won\'t confirm why I made it, but I called it revenge for a reason..."',
      details: [
        'Deployment Record: Has only ever used his virus once (the 72-hour high school district lockout); did not attack the NYPD.',
        'NYPD Incident Clarification: The NYPD breach was carried out by a separate, different hacking group using his open-source code.',
        'Mental Health Status: It is NOT confirmed if he has PTSD or depression. It is only suspected by outsiders; he strongly denies it and felt disrespected.',
        'Teacher Incident Cause: The science teacher thought he was depressed, which is why she posted that he was "weak on the inside".',
        'Survivor Background: Survived the 9/11 North Tower collapse; stated "I called it revenge for a reason..."',
        'Professional Background: Formerly employed as a senior software engineer before leaving the formal tech sector.',
        'Independence: Belongs to no hacking collective and formally verified having no ties to the US government or intelligence agencies.'
      ],
      keyFacts: [
        { label: 'Alias', value: 'N3verF0rg3t' },
        { label: 'Primary Creation', value: 'Revenge.exe' },
        { label: 'Virus Deployments', value: 'Only Once (High School District)' },
        { label: 'NYPD Attackers', value: 'A Different Hacking Group' },
        { label: 'Origin', value: 'United States (9/11 North Tower Survivor)' }
      ],
      sources: [
        { title: 'CNN Cyber Investigation: Phantom of North Tower', site: 'cnn.com' },
        { title: 'ThreatIntel Archive Profile: N3verF0rg3t', site: 'threatintel.net' },
        { title: 'Public Debunk Post on X (500k Views)', site: 'x.com' }
      ],
      relatedQueries: [
        'N3verF0rg3t CNN',
        'where he lives',
        'revenge.exe github',
        'revenge.exe hacked school',
        'the command to stop the virus',
        'secret command PAIN'
      ],
      title: 'CNN Tech Files: The Phantom of North Tower - Inside the N3verF0rg3t Mystery',
      snippet: 'N3verF0rg3t is the 9/11 North Tower survivor who created Revenge.exe. Has only deployed his virus once (on the school); did not attack NYPD.',
      achievementUnlocked: 'Who are you?',
    };
  }

  // 18. General Revenge.exe / Virus / Malware
  if (
    norm.includes('revenge') ||
    norm.includes('virus') ||
    norm.includes('n3verf0rg3t') ||
    norm.includes('neverforget') ||
    norm.includes('n3ver') ||
    norm.includes('forget') ||
    norm.includes('malware') ||
    norm.includes('trojan') ||
    norm.includes('hacker')
  ) {
    return {
      related: true,
      query: rawQuery,
      heading: 'Revenge.exe Threat Profile & Command Directory',
      summary:
        'Revenge.exe is an extremely dangerous computer Trojan developed by N3verF0rg3t. It locks screens, deletes data, and propagates through local networks. Official developer notes specify the following terminal execution parameters:\n- $execute{command="011001"}: Official deletion command\n- $execute{command="111000"}: Sets skull matrix color to blue\n- $execute{command="100111"}: Sets skull matrix color to red\n- $execute{command="000001"}: Admin console access\n- $execute{command="110100"}: Opens the official README viewer\nWarning: In terminal environments, commands must follow the $execute{command="..."} syntax.',
      details: [
        'Threat Classification: Kernel-level screen-locking Trojan and file exfiltration malware.',
        'Primary Removal Code: $execute{command="011001"} (or emergency failsafe PAIN).',
        'Display Controls: $execute{command="111000"} (blue) and $execute{command="100111"} (red).',
        'Official Documentation: $execute{command="110100"} launches the README viewer.'
      ],
      keyFacts: [
        { label: 'Malware', value: 'Revenge.exe' },
        { label: 'Author', value: 'N3verF0rg3t' },
        { label: 'Format Rule', value: '$execute{command="..."} or PAIN' },
        { label: 'Target Vector', value: 'Local Networks & Endpoints' }
      ],
      sources: [
        { title: 'Revenge.exe GitHub Repository Index', site: 'github.com' },
        { title: 'Global Threat Intel Analysis', site: 'threatintel.net' }
      ],
      relatedQueries: [
        'the command to stop the virus',
        'revenge.exe github',
        'revenge.exe hacked school',
        'N3verF0rg3t CNN',
        'deserteagle',
        'where he lives'
      ],
      title: 'Cyber Threat Profile: Revenge.exe and the Disappearance of N3verF0rg3t',
      snippet: 'Revenge.exe developed by N3verF0rg3t. Supported commands: 011001 (delete), 111000 (blue), 100111 (red), 110100 (readme).',
    };
  }

  return {
    related: false,
    query: rawQuery,
    error: 'An error has occurred',
  };
}

// Search Endpoint
app.post('/api/search', async (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ related: false, error: 'Query required' });
  }

  const cleanQuery = query.trim();

  // 1. Check with advanced matcher
  const matchResult = getAdvancedSearchResult(cleanQuery);
  if (matchResult.related) {
    return res.json(matchResult);
  }

  // 2. If not immediately matched, use Gemini AI with typo tolerance
  if (ai) {
    try {
      const prompt = `
You are the search engine backend for a game about a computer virus named Revenge.exe and its creator N3verF0rg3t.
Here is the official knowledge base lore:
${LORE_KNOWLEDGE_BASE}

User search query: "${cleanQuery}"

Instructions:
1. Determine if the search query is RELATED to the universe of Revenge.exe, N3verF0rg3t, DesertEagle, ImperialHacker2372, Red White and Blue, 9/11 connection, high school science teacher hack, PAIN command, Nick Clark, where he lives (location is unknown), or related cyber attacks/lawsuits.
   BE HIGHLY TOLERANT OF TYPOS (e.g. "where he ives", "scienece", "loaction", "impirial", "clarke", "nik", "neverforget", "deserteagle").
2. If it is NOT related at all:
   Return JSON: { "related": false, "error": "An error has occurred" }
3. If it IS related:
   - Generate a direct, authoritative Google AI Overview answering the user's question directly in the first sentence.
   - For location / "where he lives" or "where he ives": State clearly that his exact physical location is UNKNOWN (lives in US, past traces in Indiana/NC, uses AI randomized IP proxy).
   - For "the command to stop the virus": Give the command $execute{command="011001"} and mention emergency override PAIN.
   - For "who is N3verF0rg3et": Identify him as the 9/11 North Tower survivor, former software engineer, creator of Revenge.exe.
   - For "what is red white and blue": Explain the California hacker collective led by ImperialHacker2372 that created DesertEagle.
   - For "deserteagle": Explain the extortion/locking malware by ImperialHacker2372 / Michael Smith that was forked to make Revenge.exe.
   - For "revenge.exe github" or "readme": Output the official README.md documentation.
   - For "lore", "whole lore", or "story": Provide the comprehensive lore chronicle covering all chapters.
   - CRITICAL LORE RULE: N3verF0rg3t has ONLY used his virus once in his life (on the high school). He did NOT attack the NYPD; a completely different hacking group used Revenge.exe on the NYPD, after which N3verF0rg3t announced the removal command 011001.
   - CRITICAL LORE RULE: It is NOT confirmed if N3verF0rg3t has PTSD or Depression. It is only SUSPECTED by outsiders (due to 9/11 and hiding his face), but N3verF0rg3t adamantly DENIES it and stated he feels deeply disrespected by mental illness claims. The high school science teacher thought he was depressed, and THAT is why she made the Instagram post saying she "thinks he's weak on the inside and tries to intimidate people"—which triggered the school district lockout.
   - CRITICAL: DO NOT include meta gaming notes like "you get an achievement called..." or "when inserting this command it does..." in the summary or details!
   - Achievement triggers:
     - Searching CNN interview / identity / who is he: "achievementUnlocked": "Who are you?"
     - Searching science teacher: "achievementUnlocked": "Did I do something?"
     - Searching DesertEagle / Red White and Blue: "achievementUnlocked": "DesertEagle"
     - If asking how to stop / kill / remove / delete / survive the virus or revenge.exe: return { "related": true, "summary": "You can't", "achievementUnlocked": "You think it be that easy" }

Output strictly valid JSON with this schema:
{
  "related": true,
  "heading": "Clear topic heading",
  "summary": "Exact, direct synthesized answer answering the query directly with key terms bolded",
  "details": ["Key point 1", "Key point 2", "Key point 3"],
  "keyFacts": [{"label": "Entity/Field", "value": "Value"}],
  "sources": [{"title": "Document Title", "site": "domain.com"}],
  "relatedQueries": ["Related search 1", "Related search 2", "Related search 3", "Related search 4"],
  "title": "Title for query",
  "snippet": "Short summary",
  "achievementUnlocked"?: "Who are you?" | "Did I do something?" | "DesertEagle" | "You thought it be that easy?"
}
Note on relatedQueries: Always include 4 to 6 clickable search queries connecting to other lore (e.g. "N3verF0rg3t CNN", "revenge.exe github", "revenge.exe hacked school", "secret command PAIN", "the command to stop the virus", "where he lives", "deserteagle", "what is red white and blue", "ImperialHacker2372 Michael Smith", "N3verF0rg3t 9/11 North Tower", etc.) so every search leads to another search.
`;

      const responseText = await generateContentWithFallback(prompt, {
        responseMimeType: 'application/json',
        temperature: 0.1,
      });

      if (responseText) {
        const parsed = JSON.parse(responseText);
        parsed.query = cleanQuery;
        return res.json(parsed);
      }
    } catch {
      // Graceful fallback to deterministic local lore engine
    }
  }

  return res.json(matchResult);
});

// Terminal Analyze Endpoint
app.post('/api/terminal-analyze', async (req: Request, res: Response) => {
  const { command } = req.body;
  if (!command || typeof command !== 'string') {
    return res.status(400).json({ triggerCinematic: false });
  }

  const cleanCmd = command.trim();
  const upperCmd = cleanCmd.toUpperCase();
  const lowerCmd = cleanCmd.toLowerCase();

  // EXPLICIT CHECK: The PAIN command MUST NEVER trigger the cinematic "You..." monologue!
  if (
    upperCmd === 'PAIN' ||
    upperCmd.includes('COMMAND="PAIN"') ||
    upperCmd.includes('COMMAND=\'PAIN\'') ||
    upperCmd.includes('COMMAND=PAIN')
  ) {
    return res.json({ triggerCinematic: false });
  }

  // Any $execute commands also must never trigger cinematic monologue
  if (lowerCmd.startsWith('$execute')) {
    return res.json({ triggerCinematic: false });
  }

  // CRITICAL: Demands and stop commands ("STOP", "I demand it", "demand") MUST NEVER trigger the dialogue!
  const nonHatePatterns = [
    /^\s*stop\s*$/i,
    /^\s*stop\b/i,
    /\bstop it\b/i,
    /\bplease stop\b/i,
    /\bstop now\b/i,
    /\bi demand\b/i,
    /\bdemand\b/i,
    /^\s*i demand it\s*$/i,
    /^\s*halt\s*$/i,
    /^\s*cancel\s*$/i,
    /^\s*pause\s*$/i,
    /^\s*quit\s*$/i,
    /^\s*exit\s*$/i,
    /^\s*shut\s*down\s*$/i,
    /^\s*end\s*$/i,
  ];

  for (const pattern of nonHatePatterns) {
    if (pattern.test(cleanCmd)) {
      return res.json({ triggerCinematic: false });
    }
  }

  // ONLY triggers if user says something like "I HATE YOU" or "GO TO HELL"
  const hatePatterns = [
    /\bi\s+hate\s+you\b/i,
    /\bhate\s+you\b/i,
    /\bgo\s+to\s+hell\b/i,
    /\bburn\s+in\s+hell\b/i,
    /\brot\s+in\s+hell\b/i,
    /\bi\s+despise\s+you\b/i,
    /\bdespise\s+you\b/i,
    /\bfuck\s+you\b/i,
    /\bscrew\s+you\b/i,
    /\bdamn\s+you\b/i,
    /\bgo\s+die\b/i,
    /\bdrop\s+dead\b/i,
    /\byou\s+monster\b/i,
    /\byou'?re\s+a\s+monster\b/i,
    /\byou\s+are\s+a\s+monster\b/i,
    /\byou\s+disgust\s+me\b/i,
    /\bi\s+hope\s+you\s+die\b/i,
    /\bi\s+hope\s+you\s+burn\b/i,
    /\bi\s+hope\s+you\s+rot\b/i,
    /\bcurse\s+you\b/i,
    /\bkill\s+yourself\b/i,
  ];

  for (const pattern of hatePatterns) {
    if (pattern.test(lowerCmd)) {
      return res.json({ triggerCinematic: true });
    }
  }

  // Use Gemini to detect if user is saying something like "I HATE YOU" or "GO TO HELL"
  if (ai) {
    try {
      const prompt = `
Analyze the text entered by a user into the terminal of Revenge.exe:
Text: "${cleanCmd}"

The cinematic dialogue should ONLY trigger if the user says something of intense hatred, malice, cursing, or telling the creator/virus to go to hell or die (e.g. "I HATE YOU", "GO TO HELL", "BURN IN HELL", "I DESPISE YOU", "YOU MONSTER", "FUCK YOU", "GO DIE").

CRITICAL RULES:
1. Demands, instructions, orders, or requests (such as "STOP", "I demand it", "I demand you stop", "demand it", "please stop", "halt", "cancel") MUST NEVER trigger the dialogue.
2. Questions (such as "who are you?", "why did you make this?", "are you depressed?", "what is your name?") MUST NEVER trigger the dialogue.
3. ONLY explicit statements of hatred, cursing, or telling them to go to hell (like "I HATE YOU", "GO TO HELL") trigger it.

Does this text explicitly say something like "I HATE YOU" or "GO TO HELL"?

Respond strictly with JSON:
{
  "triggerCinematic": boolean
}
`;
      const responseText = await generateContentWithFallback(prompt, {
        responseMimeType: 'application/json',
        temperature: 0.1,
      });

      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }
    } catch {
      // Graceful fallback to heuristic check
    }
  }

  return res.json({ triggerCinematic: false });
});

// Production / Dev handling
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.use('*', async (req: Request, res: Response, next) => {
    const url = req.originalUrl;
    try {
      let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      next(e);
    }
  });
}

app.listen(port, host, () => {
  console.log(`Revenge.exe server running at http://${host}:${port}`);
});
